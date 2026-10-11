import { questions } from '../data/questions.js'
import { concepts } from '../data/concepts.js'
import { lessons } from '../data/lessons.js'
import { ollamaService } from './ollamaService.js'

/**
 * Strips reasoning model thinking tags (e.g. <think>...</think> produced by DeepSeek/Qwen3)
 * @param {string} text
 * @returns {string}
 */
export function stripThinkingTags(text) {
  if (!text || typeof text !== 'string') return ''
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
  if (!cleaned) {
    cleaned = text.replace(/<\/?think>/gi, '').trim()
  }
  return cleaned
}

/**
 * Extracts and parses a JSON object from LLM response text
 * @param {string} text
 * @returns {object|null}
 */
export function extractJsonFromResponse(text) {
  const cleaned = stripThinkingTags(text)
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null
  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    return null
  }
}

export class EvaluatorService {
  /**
   * Evaluates student question submission using deterministic answer key.
   * Model NEVER overrides correctness.
   *
   * @param {object} params
   * @param {string} params.questionId
   * @param {number} params.selectedAnswerIndex
   * @param {string} [params.studentReasoning]
   * @param {string} [params.topicId]
   * @returns {Promise<object>}
   */
  async evaluateSubmission({ questionId, selectedAnswerIndex, studentReasoning = '', topicId }) {
    // 1. Locate verified question
    const question = questions.find((q) => q.id === questionId)
    if (!question) {
      const err = new Error(`Question with ID "${questionId}" not found in verified curriculum.`)
      err.status = 404
      throw err
    }

    if (
      typeof selectedAnswerIndex !== 'number' ||
      selectedAnswerIndex < 0 ||
      selectedAnswerIndex >= question.options.length
    ) {
      const err = new Error(`Invalid selectedAnswerIndex: ${selectedAnswerIndex}. Must be between 0 and ${question.options.length - 1}.`)
      err.status = 400
      throw err
    }

    // 2. Deterministic correctness check - model CANNOT override
    const isCorrect = selectedAnswerIndex === question.correctIndex
    const rule = question.misconceptionRules?.[selectedAnswerIndex]

    // If correct answer
    if (isCorrect) {
      return {
        isCorrect: true,
        detectedMisconception: null,
        feedback: question.correctExplanation,
        confidence: 0.98,
        remediationAdvice: 'Concept verified. Ready to proceed to the next diagnostic item.',
        clarificationNeeded: false,
        clarificationQuestion: null,
        evalMethod: 'deterministic_answer_key'
      }
    }

    // 3. Incorrect answer evaluation
    const reasoningTrimmed = (studentReasoning || '').trim()
    const isReasoningEmpty = reasoningTrimmed.length < 5

    // Baseline deterministic diagnosis from verified question rules
    let diagnosis = {
      isCorrect: false,
      detectedMisconception: rule
        ? {
            code: rule.code,
            name: rule.title,
            description: rule.explanation,
            category: rule.category
          }
        : {
            code: 'MIS-GENERAL-GAP',
            name: 'Conceptual Gap',
            description: 'The selected answer indicates an unresolved concept dependency in fractional operations.',
            category: 'conceptual'
          },
      feedback: rule ? rule.explanation : question.correctExplanation,
      confidence: rule ? 0.88 : 0.70,
      remediationAdvice: rule ? rule.suggestion : 'Review the partition diagram in the associated lesson.',
      clarificationNeeded: isReasoningEmpty,
      clarificationQuestion: isReasoningEmpty
        ? 'Could you explain step by step how you calculated or chose this answer? That allows the tutor to check your mental model.'
        : null,
      evalMethod: 'deterministic_rule'
    }

    // 4. If student provided meaningful reasoning, use Ollama qwen3:4b to interpret nuance
    if (!isReasoningEmpty) {
      try {
        const interpretation = await this.interpretReasoningWithOllama({
          question,
          selectedAnswerIndex,
          selectedOptionText: question.options[selectedAnswerIndex],
          studentReasoning: reasoningTrimmed,
          baselineRule: rule
        })

        if (interpretation) {
          // Model output validated successfully
          diagnosis = {
            ...diagnosis,
            feedback: interpretation.groundedExplanation || diagnosis.feedback,
            remediationAdvice: interpretation.remediation || diagnosis.remediationAdvice,
            clarificationNeeded: interpretation.unclearReasoning === true,
            clarificationQuestion: interpretation.clarificationQuestion || null,
            evalMethod: 'hybrid_deterministic_with_ai_interpretation'
          }

          if (interpretation.unclearReasoning) {
            diagnosis.confidence = 0.55
            diagnosis.detectedMisconception = null // Do not invent diagnosis when evidence is unclear
          } else if (interpretation.isArithmeticSlip && diagnosis.detectedMisconception) {
            diagnosis.detectedMisconception.category = 'arithmetic_slip'
            diagnosis.confidence = 0.90
          }
        }
      } catch (aiErr) {
        // Honest fallback: Ollama unavailable or errored; use deterministic rule
        console.warn(`[EvaluatorService] Ollama interpretation unavailable: ${aiErr.message}. Using deterministic diagnostic rule.`)
        diagnosis.evalMethod = 'deterministic_rule_offline_fallback'
      }
    }

    return diagnosis
  }

  /**
   * Prompts Ollama qwen3:4b to interpret reasoning grounded strictly in curriculum data.
   * Validates structure before accepting.
   */
  async interpretReasoningWithOllama({ question, selectedAnswerIndex, selectedOptionText, studentReasoning, baselineRule }) {
    const prompt = `You are a diagnostic math education evaluator analyzing student fraction thinking.
Question: "${question.question}"
Correct Answer: "${question.options[question.correctIndex]}"
Student Chosen Wrong Answer: "${selectedOptionText}"
Verified Catalog Misconception: "${baselineRule?.title || 'Unknown'}" (${baselineRule?.explanation || ''})
Student Stated Reasoning: "${studentReasoning}"

Task:
1. Is the student's reasoning ambiguous or unclear? (unclearReasoning: true/false)
2. Is this a minor arithmetic slip or a deep conceptual misconception? (isArithmeticSlip: true/false)
3. Provide a grounded explanation addressing their specific thinking.
4. If reasoning is unclear, provide a clarifying question.

Return strictly a JSON object with this exact shape:
{
  "unclearReasoning": false,
  "isArithmeticSlip": false,
  "groundedExplanation": "concise explanation grounded in fraction partition sizes",
  "remediation": "actionable conceptual advice",
  "clarificationQuestion": null
}`

    const result = await ollamaService.generate({
      prompt,
      options: { temperature: 0.1, num_predict: 250 }
    })

    const parsed = extractJsonFromResponse(result.response)
    if (!parsed || typeof parsed !== 'object') return null

    // Validate fields
    return {
      unclearReasoning: Boolean(parsed.unclearReasoning),
      isArithmeticSlip: Boolean(parsed.isArithmeticSlip),
      groundedExplanation: typeof parsed.groundedExplanation === 'string' ? parsed.groundedExplanation : null,
      remediation: typeof parsed.remediation === 'string' ? parsed.remediation : null,
      clarificationQuestion: typeof parsed.clarificationQuestion === 'string' ? parsed.clarificationQuestion : null,
    }
  }

  /**
   * Socratic interactive chat handler with the AI tutor for Python, C++, and computer science.
   *
   * @param {object} params
   * @param {string} params.message
   * @param {string} [params.subject]
   * @param {string} [params.topicId]
   * @param {Array} [params.history]
   * @param {string} [params.studentReasoning]
   * @returns {Promise<object>}
   */
  async tutorChat({ message, subject = 'python', topicId = null, history = [], studentReasoning = '' }) {
    const trimmedMessage = (message || '').trim()
    if (!trimmedMessage) {
      const err = new Error('Message cannot be empty.')
      err.status = 400
      throw err
    }

    const currentSubject = (subject || '').toLowerCase() === 'cpp' ? 'C++' : 'Python'
    const subjectCode = currentSubject === 'C++' ? 'cpp' : 'python'

    // Bound conversation history to last 6 messages to prevent excessive prompt sizes
    const boundedHistory = Array.isArray(history) ? history.slice(-6) : []

    const systemPrompt = `You are LearnLoop AI, a patient, encouraging, and pedagogically rigorous coding tutor for beginner students learning ${currentSubject}.
Core Teaching Guidelines:
1. Explain programming and data structure concepts using clear, step-by-step logic and intuitive analogies.
2. Provide short, clean, beginner-friendly code examples in ${currentSubject} when helpful.
3. For data structures like Stack (LIFO) and Queue (FIFO), explain their actual behavioral principles, push/pop mechanics, and real-world uses (like undo buffers or printer spools).
4. Do NOT claim you executed, compiled, or tested the student's code in a live shell.
5. If the student has a conceptual misunderstanding or syntax error, gently guide them to see why and how to fix it.
6. Keep explanations focused, concise, and easy to scan.`

    const conversationContext = boundedHistory
      .map((h) => {
        const role = h.sender === 'user' ? 'Student' : 'Tutor'
        const text = typeof h.text === 'string' ? h.text : (h.message || '')
        return `${role}: ${text}`
      })
      .filter(Boolean)
      .join('\n')

    const promptContext = [
      conversationContext ? `Conversation History:\n${conversationContext}\n` : '',
      topicId ? `Current Focus Topic: ${topicId}\n` : '',
      studentReasoning ? `Student Stated Reasoning: ${studentReasoning}\n` : '',
      `Student: ${trimmedMessage}`,
      `Tutor (${currentSubject} explanation):`
    ].filter(Boolean).join('\n')

    try {
      const aiResponse = await ollamaService.generate({
        prompt: promptContext,
        system: systemPrompt,
        options: { temperature: 0.3, num_predict: 1200 }
      })

      const cleanedReply = stripThinkingTags(aiResponse.response).trim()

      if (!cleanedReply) {
        throw new Error('Ollama returned empty response.')
      }

      return {
        reply: cleanedReply,
        subject: subjectCode,
        isLiveBackend: true,
      }
    } catch (aiErr) {
      console.error(`[EvaluatorService] Tutor chat error with Ollama: ${aiErr.message}`)
      const error = new Error(`AI Tutor service is currently unavailable (${aiErr.message}). Please verify local Ollama is running and retry.`)
      error.status = 503
      throw error
    }
  }
}

export const evaluatorService = new EvaluatorService()

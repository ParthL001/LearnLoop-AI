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
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
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
   * Socratic interactive chat handler with the AI tutor.
   * Grounded in verified concepts and lessons.
   *
   * @param {object} params
   * @param {string} params.message
   * @param {string} [params.topicId]
   * @param {Array} [params.history]
   * @param {string} [params.studentReasoning]
   * @returns {Promise<object>}
   */
  async tutorChat({ message, topicId = 'fractions', history = [], studentReasoning = '' }) {
    const trimmedMessage = (message || '').trim()
    if (!trimmedMessage) {
      const err = new Error('Message cannot be empty.')
      err.status = 400
      throw err
    }

    // Check relevant concept
    const concept = concepts.find((c) => c.id === topicId) || concepts[0]
    const lesson = lessons.find((l) => l.conceptId === concept.id) || lessons[0]

    // Rule-based diagnostic keyword check
    const lower = `${trimmedMessage} ${studentReasoning}`.toLowerCase()
    let detectedMisconception = null

    if (
      (lower.includes('denominator') && (lower.includes('bigger') || lower.includes('smaller') || lower.includes('5 > 3') || lower.includes('5 is bigger'))) ||
      (lower.includes('2/3') && lower.includes('2/5')) ||
      ((lower.includes('bigger number') || lower.includes('larger number')) && (lower.includes('5') || lower.includes('3') || lower.includes('denominator') || lower.includes('bottom')))
    ) {
      detectedMisconception = {
        name: 'Whole Number Value Bias',
        note: 'Learner transferring whole-number magnitude directly to denominator value.'
      }
    } else if (lower.includes('add') && (lower.includes('1+1') || lower.includes('2+3') || lower.includes('bottom') || lower.includes('both numbers') || lower.includes('denominators'))) {
      detectedMisconception = {
        name: 'Additive Denominators Misconception',
        note: 'Learner attempting to add denominators across unlike unit partitions.'
      }
    }

    try {
      const systemPrompt = `You are a friendly, rigorous Socratic adaptive tutor in an educational platform.
Curriculum Unit: "${concept.title}"
Core Principles:
1. Denominators represent partition density: more partitions make individual pieces smaller.
2. Fractions require common unit names before combining or separating.
3. If student reasoning is unclear, ask a gentle clarifying question rather than inventing claims.
4. Keep answers concise, clear, and focused on physical bar/slice models.`

      const conversationContext = history
        .map((h) => `${h.sender === 'user' ? 'Student' : 'Tutor'}: ${h.text}`)
        .join('\n')

      const prompt = `${conversationContext ? conversationContext + '\n' : ''}Student: ${trimmedMessage}
${studentReasoning ? `Student stated reasoning: ${studentReasoning}\n` : ''}Tutor (concise Socratic reply):`

      const aiResponse = await ollamaService.generate({
        prompt,
        system: systemPrompt,
        options: { temperature: 0.3, num_predict: 250 }
      })

      const cleanedReply = stripThinkingTags(aiResponse.response)

      return {
        reply: cleanedReply || this.getDeterministicFallbackReply(lower, concept),
        misconceptionDetected: detectedMisconception,
        suggestedAction: detectedMisconception ? 'Review visual partition diagram' : null,
        isLiveBackend: true,
      }
    } catch (aiErr) {
      console.warn(`[EvaluatorService] Ollama chat unavailable: ${aiErr.message}. Serving deterministic fallback.`)
      return {
        reply: this.getDeterministicFallbackReply(lower, concept),
        misconceptionDetected: detectedMisconception,
        suggestedAction: 'Explore visual model in lesson',
        isLiveBackend: false,
      }
    }
  }

  getDeterministicFallbackReply(lower, concept) {
    if (lower.includes('why') && (lower.includes('denominator') || lower.includes('smaller') || lower.includes('bigger'))) {
      return "Let's test this with a picture! Imagine a chocolate bar. If you divide it into 3 equal pieces, each piece is relatively chunky (1/3). But if you divide that exact same bar into 5 equal pieces (1/5), each slice must get skinnier to fit all 5. So even though 5 is a larger number, each fifth (1/5) is actually smaller than a third (1/3). Does this visualization help clarify why 2/3 is greater than 2/5?"
    }
    if (lower.includes('add') || lower.includes('plus') || lower.includes('unlike')) {
      return "When adding fractions like 1/2 + 1/3, we cannot add across to get 2/5. Denominators are unit names: 1 half + 1 third requires converting both into shared sixths first: 3/6 + 2/6 = 5/6."
    }
    return `As your adaptive tutor for ${concept.title}, let us build lasting intuition rather than memorized tricks. Could you walk me through one specific step of how you reached your conclusion?`
  }
}

export const evaluatorService = new EvaluatorService()

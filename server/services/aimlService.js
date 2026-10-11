import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { ollamaService } from './ollamaService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const AIML_BASE_URL = process.env.AIML_URL || process.env.AIML_BASE_URL || 'http://127.0.0.1:8000'
const PRIMARY_DATASET_PATH = path.resolve(__dirname, '../data/python_exercises.jsonl')
const FALLBACK_DATASET_PATH = path.resolve(__dirname, '../../AIML/dataset/python_exercises.jsonl')

// Cache loaded exercises in memory for fast lookup
let cachedExercises = null

async function loadExercisesFromFile() {
  if (cachedExercises) return cachedExercises
  for (const filePath of [PRIMARY_DATASET_PATH, FALLBACK_DATASET_PATH]) {
    try {
      const content = await fs.readFile(filePath, 'utf8')
      cachedExercises = content
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => JSON.parse(line))
      if (cachedExercises.length > 0) return cachedExercises
    } catch {
      // try next path
    }
  }
  console.warn(`[AIMLService] Could not read dataset file from data/ or AIML/dataset`)
  return []
}

/**
 * Clean thinking tags (<think>...</think>) from Ollama responses
 */
function cleanModelOutput(text) {
  if (!text || typeof text !== 'string') return ''
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
  if (!cleaned) cleaned = text.replace(/<\/?think>/gi, '').trim()
  cleaned = cleaned.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.substring(start, end + 1)
  }
  return cleaned
}

/**
 * Diagnose a student Python answer freely using Ollama (qwen3:4b).
 */
export async function diagnosePythonAnswer({
  question,
  correctAnswer,
  studentAnswer,
  studentReasoning = '',
  exampleId = null,
  expectedFeedback = '',
  recommendedFollowup = '',
}) {
  const exercises = await loadExercisesFromFile()
  const matchedExercise = exampleId
    ? exercises.find((e) => e.example_id === exampleId)
    : exercises.find((e) => e.question === question)

  const refAnswer = correctAnswer || matchedExercise?.correct_answer || ''
  const knownMisconception = matchedExercise?.misconception_label || ''
  const guidanceFeedback = expectedFeedback || matchedExercise?.expected_feedback || ''
  const guidanceFollowup = recommendedFollowup || matchedExercise?.recommended_followup || ''

  // 1. If an AIML microservice is running (via Vercel binding or localhost), attempt fast query
  try {
    const aimlEndpoint = new URL('/internal/v1/diagnose', AIML_BASE_URL)
    const res = await fetch(aimlEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        example_id: exampleId,
        question,
        correct_answer: String(refAnswer),
        student_answer: String(studentAnswer),
        student_reasoning: studentReasoning,
        expected_feedback: guidanceFeedback,
        recommended_followup: guidanceFollowup,
      }),
      signal: AbortSignal.timeout(2000),
    })

    if (res.ok) {
      const aimlData = await res.json()
      if (aimlData) return aimlData
    }
  } catch {
    // Port 8000 microservice unavailable - Ollama model handles the diagnosis
  }

  // 2. Evaluate freely with Ollama (qwen3:4b)
  try {
    const prompt = `You are an expert Python computer science teacher and misconception diagnostic evaluator.
Analyze the student's answer and reasoning to determine correctness and detect any underlying misconceptions.

Exercise Context:
Question: "${question}"
${refAnswer ? `Reference Answer: "${refAnswer}"` : ''}
${knownMisconception ? `Known Misconception to check for: "${knownMisconception}"` : ''}

Student Submission:
Student Answer: "${studentAnswer}"
Student Stated Reasoning: "${studentReasoning || 'None provided'}"

Instructions:
1. Determine if the student's answer is functionally correct.
2. If incorrect, identify what specific Python misconception is demonstrated.
3. Highlight evidence from their answer or reasoning.
4. Provide constructive, friendly pedagogical feedback explaining the Python concept simply.
5. If the student reasoning is ambiguous, note if clarification is needed.
6. Provide a targeted follow-up learning goal.

Respond strictly in valid JSON matching this schema:
{
  "is_correct": true,
  "misconception_label": null,
  "evidence": "Quote or explanation of student answer/reasoning",
  "feedback": "Clear explanation of the concept and why the answer is right or wrong",
  "needs_clarification": false,
  "clarifying_question": null,
  "followup_goal": "Next concept or practice step"
}`

    const rawResponse = await ollamaService.generate({
      prompt,
      system: 'You are an educational AI evaluator for Python. You strictly respond in pure JSON.',
      options: {
        temperature: 0.2,
        num_predict: 800,
      },
      timeoutMs: 45000,
    })

    const cleaned = cleanModelOutput(rawResponse.response)
    if (cleaned) {
      const parsed = JSON.parse(cleaned)
      return {
        is_correct: Boolean(parsed.is_correct),
        misconception_label: parsed.misconception_label || (parsed.is_correct ? null : knownMisconception || 'Unspecified misconception'),
        evidence: parsed.evidence || `Student responded: "${studentAnswer}"`,
        feedback: parsed.feedback || guidanceFeedback || (parsed.is_correct ? 'Correct! Good job.' : 'Review the concept behavior.'),
        needs_clarification: Boolean(parsed.needs_clarification),
        clarifying_question: parsed.clarifying_question || null,
        followup_goal: parsed.followup_goal || guidanceFollowup || 'Continue to the next exercise.',
        eval_engine: 'ollama_qwen3:4b',
      }
    }
  } catch (ollamaErr) {
    console.warn(`[AIMLService] Ollama evaluation fallback: ${ollamaErr.message}`)
  }

  // 3. Robust heuristic fallback if Ollama times out
  const normStudent = studentAnswer.trim().toLowerCase().replace(/['"]/g, '')
  const normRef = refAnswer.trim().toLowerCase().replace(/['"]/g, '')
  const isMatch = normRef && (normStudent === normRef || normStudent.includes(normRef))

  return {
    is_correct: Boolean(isMatch),
    misconception_label: isMatch ? null : (knownMisconception || 'Potential conceptual slip'),
    evidence: `Student answered: "${studentAnswer}". Reasoning: "${studentReasoning || 'None'}"`,
    feedback: isMatch
      ? (guidanceFeedback || `Correct! The answer is ${refAnswer}.`)
      : (guidanceFeedback || `The expected answer is ${refAnswer}. Take note of Python's specific rules for this concept.`),
    needs_clarification: !studentReasoning,
    clarifying_question: !studentReasoning ? 'Can you explain the steps you took to reach this answer?' : null,
    followup_goal: guidanceFollowup || 'Practice more with similar operations.',
    eval_engine: 'deterministic_fallback',
  }
}

/**
 * Fetch available Python exercises
 */
export async function fetchPythonExercises() {
  const exercises = await loadExercisesFromFile()
  return {
    success: true,
    exercises,
  }
}

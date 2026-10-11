// Cognara Service Layer: connects to Express backend (Ollama / Qwen3:4b) with graceful offline fallback

import { topics, learningPathMilestones, practiceQuestions, recentMisconceptions } from './mockData'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Send learner message to AI Tutor (Node.js/Express + Ollama Qwen3:4b)
 */
export async function chatWithTutor(message, { topicId = 'fractions', history = [], studentReasoning = '' } = {}) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    const response = await fetch(`${API_BASE_URL}/tutor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, topicId, history, studentReasoning }),
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!response.ok) throw new Error(`Server returned ${response.status}`)
    const data = await response.json()
    return {
      text: data.reply || data.message,
      isLiveBackend: true,
      misconceptionDetected: data.misconceptionDetected || null,
      suggestedAction: data.suggestedAction || null
    }
  } catch (err) {
    // Graceful intelligent simulation matching Qwen3:4b Socratic pedagogy
    return generateOfflineTutorReply(message, topicId, studentReasoning)
  }
}

/**
 * Diagnostic analysis of student reasoning to isolate misconceptions
 */
export async function analyzeMisconception({ questionId, selectedAnswerIndex, studentReasoning = '', topicId = 'fractions' }) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    const response = await fetch(`${API_BASE_URL}/analyze/misconception`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, selectedAnswerIndex, studentReasoning, topicId }),
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!response.ok) throw new Error(`Analysis failed with status ${response.status}`)
    return await response.json()
  } catch (err) {
    // Intelligent local evaluation from diagnostic catalog
    const q = practiceQuestions.find(item => item.id === questionId) || practiceQuestions[0]
    const tag = q.misconceptionTags?.[selectedAnswerIndex]

    if (selectedAnswerIndex === q.correctIndex) {
      return {
        isCorrect: true,
        detectedMisconception: null,
        feedback: 'Excellent reasoning! You correctly accounted for the underlying concept.',
        confidence: 0.95,
        remediationAdvice: 'Ready to try a higher-complexity variation.'
      }
    }

    if (tag) {
      return {
        isCorrect: false,
        detectedMisconception: {
          code: tag.code,
          name: tag.title,
          description: tag.explanation
        },
        feedback: tag.explanation,
        confidence: 0.88,
        remediationAdvice: tag.suggestion
      }
    }

    return {
      isCorrect: false,
      detectedMisconception: {
        code: 'MIS-GENERAL',
        name: 'Concept Gap',
        description: 'Your answer suggests an unfamiliarity with this unit operation.'
      },
      feedback: q.explanation,
      confidence: 0.7,
      remediationAdvice: 'Review the visual model in the lesson.'
    }
  }
}

function generateOfflineTutorReply(userPrompt, topicId, studentReasoning) {
  const lower = userPrompt.toLowerCase()
  let reply = ''
  let misconceptionDetected = null

  if (lower.includes('why') && (lower.includes('denominator') || lower.includes('smaller') || lower.includes('bigger'))) {
    reply = "Let's test this with a picture! Imagine a chocolate bar. If you divide it into 3 equal pieces, each piece is relatively chunky (1/3). But if you divide that exact same bar into 5 equal pieces (1/5), each slice must get skinnier to fit all 5. So even though 5 is a larger number, each fifth (1/5) is actually smaller than a third (1/3). Does this visualization help clarify why 2/3 is greater than 2/5?"
    misconceptionDetected = {
      name: 'Denominator Size Inversion',
      note: 'Learner questioned how larger numbers produce smaller fractional pieces.'
    }
  } else if (lower.includes('hint') || lower.includes('stuck') || lower.includes('help')) {
    reply = "Here's a gentle nudge: Look closely at the denominator (the bottom number). The denominator names the size or kind of each part, while the numerator (top number) counts how many of those parts you possess. Try picturing the unit size first before comparing amounts!"
  } else if (lower.includes('add') || lower.includes('plus') || lower.includes('unlike')) {
    reply = "When adding fractions like 1/2 + 1/3, we can't just add across to get 2/5. Think of denominators like units of measurement: you wouldn't say 1 inch + 1 meter equals 2 'inch-meters'! We have to convert them into a shared common unit (sixths) first: 3/6 + 2/6 = 5/6."
    misconceptionDetected = {
      name: 'Common Unit Necessity',
      note: 'Addressed additive denominator misconception.'
    }
  } else {
    reply = `I see your point about "${userPrompt.slice(0, 40)}...". As your adaptive guide, I want to make sure we build lasting intuition rather than memorized tricks. Could you walk me through one specific step of how you reached your conclusion?`
  }

  return {
    text: reply,
    isLiveBackend: false,
    misconceptionDetected,
    suggestedAction: 'Explore visual model'
  }
}

/**
 * Fetch deterministic learner progress and mastery calibration from backend
 */
export async function fetchLearnerProgress(learnerId) {
  try {
    const url = learnerId
      ? `${API_BASE_URL}/progress/${encodeURIComponent(learnerId)}`
      : `${API_BASE_URL}/progress`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Progress request failed with status ${res.status}`)
    return await res.json()
  } catch (err) {
    return null
  }
}

/**
 * Fetch sanitized pre or post assessment items (answer keys never exposed)
 */
export async function fetchAssessment(type = 'pre') {
  try {
    const res = await fetch(`${API_BASE_URL}/assessments/${type}`)
    if (!res.ok) throw new Error(`Assessment request failed with status ${res.status}`)
    return await res.json()
  } catch (err) {
    return null
  }
}

/**
 * Submit pre or post assessment for backend deterministic scoring
 */
export async function submitAssessment({ learnerId, type, itemResponses }) {
  const res = await fetch(`${API_BASE_URL}/assessment/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ learnerId, type, itemResponses })
  })
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    throw new Error(errData.error || `Assessment submission failed: ${res.status}`)
  }
  return await res.json()
}

/**
 * Fetch paired pre/post assessment comparison report for a learner
 */
export async function fetchAssessmentResults(learnerId) {
  try {
    const res = await fetch(`${API_BASE_URL}/assessment/results/${encodeURIComponent(learnerId)}`)
    if (!res.ok) throw new Error(`Assessment report request failed with status ${res.status}`)
    return await res.json()
  } catch (err) {
    return null
  }
}

/**
 * Fetch cohort evaluation report with paired analysis and attrition metrics
 */
export async function fetchCohortAssessmentReport() {
  try {
    const res = await fetch(`${API_BASE_URL}/assessment/report`)
    if (!res.ok) throw new Error(`Cohort report failed with status ${res.status}`)
    return await res.json()
  } catch (err) {
    return null
  }
}


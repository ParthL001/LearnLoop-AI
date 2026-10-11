/**
 * LearnLoop AI Centralized Service Layer
 * Connects React frontend directly to the Express backend.
 * Uses VITE_API_BASE_URL with fallback to VITE_API_URL or localhost:5000.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')

export { API_BASE_URL }

/**
 * Check general backend service health
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`)
    if (!res.ok) return { status: 'down', ok: false }
    const data = await res.json()
    return { ...data, ok: true }
  } catch (err) {
    return { status: 'down', ok: false, error: err.message }
  }
}

/**
 * Check Ollama & local model (qwen3:4b) availability
 */
export async function checkAIHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/health`)
    const data = await res.json().catch(() => ({}))
    return {
      status: res.ok ? 'connected' : 'unavailable',
      ok: res.ok,
      ...data
    }
  } catch (err) {
    return {
      status: 'offline',
      ok: false,
      error: 'Backend or Ollama AI service unreachable.'
    }
  }
}

/**
 * Fetch available subjects and their topics (Python, C++)
 */
export async function fetchSubjects() {
  const res = await fetch(`${API_BASE_URL}/content/subjects`)
  if (!res.ok) throw new Error(`Failed to fetch subjects: ${res.status}`)
  const data = await res.json()
  return data.subjects || []
}

/**
 * Fetch a specific subject by ID
 */
export async function fetchSubjectById(subjectId) {
  const res = await fetch(`${API_BASE_URL}/content/subjects/${encodeURIComponent(subjectId)}`)
  if (!res.ok) throw new Error(`Subject not found: ${res.status}`)
  const data = await res.json()
  return data.subject
}

/**
 * Fetch dynamically generated lesson from Ollama (with backend caching)
 */
export async function fetchDynamicLesson(subjectId, topicId, forceRefresh = false) {
  const url = `${API_BASE_URL}/lessons/${encodeURIComponent(subjectId)}/${encodeURIComponent(topicId)}${
    forceRefresh ? '?refresh=true' : ''
  }`
  const res = await fetch(url)
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    const err = new Error(errData.error || `Failed to fetch lesson: ${res.status}`)
    err.status = res.status
    err.details = errData.details
    throw err
  }
  return await res.json()
}

/**
 * Track learner topic access / study progress
 */
export async function trackTopicAccess({ learnerId, subjectId, topicId, topicTitle, action = 'opened' }) {
  try {
    const res = await fetch(`${API_BASE_URL}/progress/track-topic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ learnerId, subjectId, topicId, topicTitle, action })
    })
    if (!res.ok) return null
    return await res.json()
  } catch (err) {
    console.warn('Unable to track topic access:', err.message)
    return null
  }
}

/**
 * Fetch verified fraction curriculum concepts (legacy compatibility)
 */
export async function fetchConcepts() {
  const res = await fetch(`${API_BASE_URL}/concepts`)
  if (!res.ok) throw new Error(`Failed to fetch concepts: ${res.status}`)
  const data = await res.json()
  return data.concepts || []
}

/**
 * Fetch structured lessons with visual partition models (legacy compatibility)
 */
export async function fetchLessons() {
  const res = await fetch(`${API_BASE_URL}/lessons`)
  if (!res.ok) throw new Error(`Failed to fetch lessons: ${res.status}`)
  const data = await res.json()
  return data.lessons || []
}

/**
 * Fetch a specific lesson by concept ID (legacy compatibility)
 */
export async function fetchLessonById(id) {
  const res = await fetch(`${API_BASE_URL}/lessons/${encodeURIComponent(id)}`)
  if (!res.ok) throw new Error(`Lesson not found: ${res.status}`)
  const data = await res.json()
  return data.lesson
}

/**
 * Fetch practice questions (sanitized - answer keys never exposed)
 */
export async function fetchPracticeQuestions(conceptId = null) {
  const url = conceptId
    ? `${API_BASE_URL}/practice/questions?conceptId=${encodeURIComponent(conceptId)}`
    : `${API_BASE_URL}/practice/questions`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch practice questions: ${res.status}`)
  const data = await res.json()
  return data.questions || []
}

/**
 * Adaptively select next practice question based on history and flagged misconceptions
 */
export async function fetchNextAdaptiveQuestion({
  conceptId,
  attemptedQuestionIds = [],
  lastMisconception = null
} = {}) {
  const res = await fetch(`${API_BASE_URL}/practice/next`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conceptId, attemptedQuestionIds, lastMisconception })
  })
  if (!res.ok) throw new Error(`Failed to retrieve adaptive question: ${res.status}`)
  return await res.json()
}

/**
 * Interactive chat with backend AI Tutor powered by Ollama (qwen3:4b)
 */
export async function chatWithTutor(
  message,
  { subject = 'python', topicId = null, history = [] } = {}
) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 45000)

  try {
    const response = await fetch(`${API_BASE_URL}/tutor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, subject, topicId, history }),
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.error || `Tutor service error ${response.status}`)
    }

    const data = await response.json()
    return {
      text: data.reply || data.message,
      isLiveBackend: true,
      subject: data.subject || subject,
      model: data.model || 'qwen3:4b'
    }
  } catch (err) {
    clearTimeout(timeoutId)
    const isTimeout = err.name === 'AbortError'
    return {
      text: isTimeout
        ? 'The AI tutor request timed out. Please try asking a more focused question.'
        : `AI Tutor is unavailable: ${err.message}. Please ensure the backend and Ollama (qwen3:4b) are running.`,
      isLiveBackend: false,
      isOffline: true,
      error: err.message
    }
  }
}

/**
 * Diagnostic submission evaluation against backend answer keys
 */
export async function analyzeMisconception({
  questionId,
  selectedAnswerIndex,
  studentReasoning = '',
  topicId = 'fractions',
  learnerId = null
}) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20000)

  try {
    const response = await fetch(`${API_BASE_URL}/analyze/misconception`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId,
        selectedAnswerIndex,
        studentReasoning,
        topicId,
        learnerId
      }),
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.error || `Analysis failed with status ${response.status}`)
    }

    return await response.json()
  } catch (err) {
    clearTimeout(timeoutId)
    throw err
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
 * Explicitly record a learner attempt
 */
export async function recordAttempt(attemptData) {
  const res = await fetch(`${API_BASE_URL}/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attemptData)
  })
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    throw new Error(errData.error || `Failed to record attempt: ${res.status}`)
  }
  return await res.json()
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
    const error = new Error(errData.error || `Assessment submission failed: ${res.status}`)
    error.status = res.status
    throw error
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

/**
 * Diagnose a Python exercise using the AIML service.
 */
export async function diagnosePythonAnswer({
  exampleId,
  question,
  correctAnswer,
  studentAnswer,
  studentReasoning = '',
}) {
  const response = await fetch(`${API_BASE_URL}/python/diagnose`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      exampleId,
      question,
      correctAnswer,
      studentAnswer,
      studentReasoning,
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || !data.success) {
    throw new Error(data.error || `Diagnosis failed: ${response.status}`)
  }

  return data.diagnosis
}

/**
 * Fetch Python exercises for misconception practice.
 */
export async function fetchPythonExercises() {
  const response = await fetch(`${API_BASE_URL}/python/exercises`)
  const data = await response.json().catch(() => ({}))

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to load Python exercises')
  }

  return data.exercises
}


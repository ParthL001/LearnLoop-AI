import { Router } from 'express'
import { evaluatorService } from '../services/evaluatorService.js'
import { storageService } from '../services/storageService.js'

const router = Router()

// POST /api/tutor/chat - Socratic interactive AI Tutor endpoint (expected by frontend chatWithTutor)
router.post('/tutor/chat', async (req, res, next) => {
  try {
    const { message, topicId, history, studentReasoning } = req.body

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message string is required in request body.',
      })
    }

    const response = await evaluatorService.tutorChat({
      message,
      topicId: topicId || 'fractions',
      history: Array.isArray(history) ? history : [],
      studentReasoning: typeof studentReasoning === 'string' ? studentReasoning : '',
    })

    // Returns exact contract expected by frontend
    res.status(200).json({
      success: true,
      reply: response.reply,
      message: response.reply,
      misconceptionDetected: response.misconceptionDetected,
      suggestedAction: response.suggestedAction,
      isLiveBackend: response.isLiveBackend,
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/analyze/misconception - Evaluates answer & reasoning against backend answer key
router.post('/analyze/misconception', async (req, res, next) => {
  try {
    const { questionId, selectedAnswerIndex, studentReasoning, topicId, learnerId } = req.body

    if (!questionId) {
      return res.status(400).json({
        success: false,
        error: 'questionId is required.',
      })
    }

    if (typeof selectedAnswerIndex !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'selectedAnswerIndex must be a number.',
      })
    }

    const evaluation = await evaluatorService.evaluateSubmission({
      questionId,
      selectedAnswerIndex,
      studentReasoning: typeof studentReasoning === 'string' ? studentReasoning : '',
      topicId,
    })

    // If learnerId is provided, record attempt to persistence store
    let savedAttempt = null
    if (learnerId && typeof learnerId === 'string' && learnerId.trim()) {
      savedAttempt = await storageService.recordAttempt({
        learnerId: learnerId.trim(),
        questionId,
        conceptId: evaluation.conceptId || topicId || 'fractions',
        isCorrect: evaluation.isCorrect,
        diagnosisStatus: evaluation.detectedMisconception ? 'misconception' : (evaluation.isCorrect ? 'correct' : 'incorrect'),
        misconception: evaluation.detectedMisconception?.name || null,
        followUpActivity: evaluation.remediationAdvice ? { advice: evaluation.remediationAdvice } : null,
        studentReasoning,
        selectedAnswerIndex
      })
    }

    // Returns exact contract expected by frontend
    res.status(200).json({
      ...evaluation,
      savedAttemptId: savedAttempt ? savedAttempt.id : null
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/tutor/submit - Alternative alias for question submission evaluation
router.post('/tutor/submit', async (req, res, next) => {
  try {
    const { questionId, selectedAnswerIndex, studentReasoning, topicId, learnerId } = req.body

    const evaluation = await evaluatorService.evaluateSubmission({
      questionId,
      selectedAnswerIndex,
      studentReasoning: typeof studentReasoning === 'string' ? studentReasoning : '',
      topicId,
    })

    let savedAttempt = null
    if (learnerId && typeof learnerId === 'string' && learnerId.trim()) {
      savedAttempt = await storageService.recordAttempt({
        learnerId: learnerId.trim(),
        questionId,
        conceptId: evaluation.conceptId || topicId || 'fractions',
        isCorrect: evaluation.isCorrect,
        diagnosisStatus: evaluation.detectedMisconception ? 'misconception' : (evaluation.isCorrect ? 'correct' : 'incorrect'),
        misconception: evaluation.detectedMisconception?.name || null,
        followUpActivity: evaluation.remediationAdvice ? { advice: evaluation.remediationAdvice } : null,
        studentReasoning,
        selectedAnswerIndex
      })
    }

    res.status(200).json({
      success: true,
      evaluation,
      savedAttemptId: savedAttempt ? savedAttempt.id : null
    })
  } catch (err) {
    next(err)
  }
})

export default router

import { Router } from 'express'
import { evaluatorService } from '../services/evaluatorService.js'

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
    const { questionId, selectedAnswerIndex, studentReasoning, topicId } = req.body

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

    // Returns exact contract expected by frontend
    res.status(200).json(evaluation)
  } catch (err) {
    next(err)
  }
})

// POST /api/tutor/submit - Alternative alias for question submission evaluation
router.post('/tutor/submit', async (req, res, next) => {
  try {
    const { questionId, selectedAnswerIndex, studentReasoning, topicId } = req.body

    const evaluation = await evaluatorService.evaluateSubmission({
      questionId,
      selectedAnswerIndex,
      studentReasoning: typeof studentReasoning === 'string' ? studentReasoning : '',
      topicId,
    })

    res.status(200).json({
      success: true,
      evaluation,
    })
  } catch (err) {
    next(err)
  }
})

export default router

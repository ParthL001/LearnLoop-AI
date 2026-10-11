import { Router } from 'express'
import { progressService } from '../services/progressService.js'
import { storageService } from '../services/storageService.js'

const router = Router()

/**
 * GET /api/progress/:learnerId
 * GET /api/progress?learnerId=...
 * Retrieves deterministic progress, concept mastery, recent history and misconceptions.
 */
router.get(['/progress/:learnerId', '/progress'], async (req, res, next) => {
  try {
    const learnerId = req.params.learnerId || req.query.learnerId
    const progress = await progressService.getLearnerProgress(learnerId)
    res.json(progress)
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/attempts
 * Explicitly records a practice attempt with backend verification.
 */
router.post('/attempts', async (req, res, next) => {
  try {
    const {
      learnerId,
      questionId,
      conceptId,
      isCorrect,
      diagnosisStatus,
      misconception,
      followUpActivity,
      studentReasoning,
      selectedAnswerIndex
    } = req.body

    const record = await storageService.recordAttempt({
      learnerId,
      questionId,
      conceptId,
      isCorrect,
      diagnosisStatus,
      misconception,
      followUpActivity,
      studentReasoning,
      selectedAnswerIndex
    })

    res.status(201).json({
      success: true,
      message: 'Practice attempt recorded successfully.',
      attempt: record
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/attempts
 * Retrieves attempt history for a learner.
 */
router.get('/attempts', async (req, res, next) => {
  try {
    const learnerId = req.query.learnerId
    const attempts = await storageService.getAttempts(learnerId)
    res.json({
      learnerId: learnerId || 'all',
      total: attempts.length,
      attempts
    })
  } catch (err) {
    next(err)
  }
})

export default router

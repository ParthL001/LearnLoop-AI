import { Router } from 'express'
import { adaptiveService } from '../services/adaptiveService.js'

const router = Router()

// POST /api/practice/next - Selects the next appropriate diagnostic item using deterministic rules
router.post('/practice/next', (req, res) => {
  const { conceptId, attemptedQuestionIds, lastMisconceptionCode } = req.body || {}

  const result = adaptiveService.getNextQuestion({
    conceptId: conceptId || 'all',
    attemptedQuestionIds: Array.isArray(attemptedQuestionIds) ? attemptedQuestionIds : [],
    lastMisconceptionCode: lastMisconceptionCode || null,
  })

  res.status(200).json({
    success: true,
    ...result,
  })
})

export default router

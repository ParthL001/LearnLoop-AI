import { Router } from 'express'
import { assessmentService } from '../services/assessmentService.js'

const router = Router()

/**
 * GET /api/assessment
 * GET /api/assessments/:type
 * Returns sanitized fixed assessment items for 'pre' or 'post' test.
 * Never exposes backend answer keys.
 */
router.get(['/assessment', '/assessments/:type'], (req, res, next) => {
  try {
    const type = req.params.type || req.query.type || 'pre'
    const assessment = assessmentService.getAssessment(type)
    res.json(assessment)
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/assessment/submit
 * Submits and deterministically grades a pre- or post-test.
 * Prevents duplicate submissions with HTTP 409.
 */
router.post('/assessment/submit', async (req, res, next) => {
  try {
    const { learnerId, type, itemResponses, version } = req.body
    const result = await assessmentService.submitAssessment({
      learnerId,
      type,
      itemResponses,
      version
    })
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/assessment/results/:learnerId
 * GET /api/assessment/results?learnerId=...
 * Retrieves individual paired pre/post assessment comparison and percentage-point change.
 */
router.get(['/assessment/results/:learnerId', '/assessment/results'], async (req, res, next) => {
  try {
    const learnerId = req.params.learnerId || req.query.learnerId
    const report = await assessmentService.getLearnerReport(learnerId)
    res.json(report)
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/assessment/report
 * Returns cohort assessment report with paired counts, mean changes, attrition, and limitations.
 */
router.get(['/assessment/report', '/assessments/report'], async (req, res, next) => {
  try {
    const cohortReport = await assessmentService.getCohortReport()
    res.json(cohortReport)
  } catch (err) {
    next(err)
  }
})

export default router


import { Router } from 'express'
import { diagnosePythonAnswer } from '../services/aimlService.js'

const router = Router()

// POST /api/python/diagnose
router.post('/python/diagnose', async (req, res, next) => {
    try {
        const {
            question,
            correctAnswer,
            studentAnswer,
            studentReasoning = '',
            exampleId = null,
            expectedFeedback = '',
            recommendedFollowup = '',
        } = req.body || {}

        if (
            typeof question !== 'string' ||
            typeof correctAnswer !== 'string' ||
            typeof studentAnswer !== 'string' ||
            !question.trim() ||
            !correctAnswer.trim() ||
            !studentAnswer.trim()
        ) {
            return res.status(400).json({
                error: 'question, correctAnswer and studentAnswer are required strings',
            })
        }

        const result = await diagnosePythonAnswer({
            question,
            correctAnswer,
            studentAnswer,
            studentReasoning,
            exampleId,
            expectedFeedback,
            recommendedFollowup,
        })

        return res.status(200).json({
            success: true,
            diagnosis: result,
        })
    } catch (error) {
        next(error)
    }
})

export default router

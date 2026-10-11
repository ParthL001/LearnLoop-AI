import { Router } from 'express'
import {
    diagnosePythonAnswer,
    fetchPythonExercises,
    checkPythonFollowup,
} from '../services/aimlService.js'


const router = Router()

// GET /api/python/exercises
router.get('/python/exercises', async (req, res, next) => {
    try {
        const result = await fetchPythonExercises()

        res.json({
            success: true,
            exercises: result.exercises,
        })
    } catch (error) {
        next(error)
    }
})

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
// POST /api/python/followup/check
router.post('/python/followup/check', async (req, res, next) => {
    try {
        const { exampleId, studentAnswer } = req.body || {}

        if (
            typeof exampleId !== 'string' ||
            !exampleId.trim() ||
            typeof studentAnswer !== 'string' ||
            !studentAnswer.trim()
        ) {
            return res.status(400).json({
                success: false,
                error: 'exampleId and studentAnswer are required',
            })
        }

        const result = await checkPythonFollowup({
            exampleId,
            studentAnswer,
        })

        return res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
})

export default router

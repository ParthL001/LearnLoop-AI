import { Router } from 'express'
import { concepts } from '../data/concepts.js'
import { lessons } from '../data/lessons.js'
import { questions, sanitizeQuestionForPublic } from '../data/questions.js'

const router = Router()

// GET /api/concepts - List all 5 verified learning concepts
router.get('/concepts', (req, res) => {
  res.status(200).json({
    success: true,
    total: concepts.length,
    concepts,
  })
})

// GET /api/lessons - List all lessons
router.get('/lessons', (req, res) => {
  const { conceptId } = req.query
  const filtered = conceptId
    ? lessons.filter((l) => l.conceptId === conceptId)
    : lessons

  res.status(200).json({
    success: true,
    total: filtered.length,
    lessons: filtered,
  })
})

// GET /api/lessons/:id - Retrieve specific lesson by id or conceptId
router.get('/lessons/:id', (req, res) => {
  const { id } = req.params
  const lesson = lessons.find((l) => l.id === id || l.conceptId === id)

  if (!lesson) {
    return res.status(404).json({
      success: false,
      error: `Lesson with identifier "${id}" not found.`,
    })
  }

  res.status(200).json({
    success: true,
    lesson,
  })
})

// GET /api/practice/questions - List sanitized practice questions (NEVER exposes answer keys)
router.get('/practice/questions', (req, res) => {
  const { conceptId } = req.query
  const filtered = conceptId && conceptId !== 'all'
    ? questions.filter((q) => q.conceptId === conceptId)
    : questions

  const publicQuestions = filtered.map(sanitizeQuestionForPublic)

  res.status(200).json({
    success: true,
    total: publicQuestions.length,
    questions: publicQuestions,
  })
})

// GET /api/practice/questions/:id - Retrieve a single sanitized practice question
router.get('/practice/questions/:id', (req, res) => {
  const { id } = req.params
  const q = questions.find((item) => item.id === id)

  if (!q) {
    return res.status(404).json({
      success: false,
      error: `Practice question with ID "${id}" not found.`,
    })
  }

  res.status(200).json({
    success: true,
    question: sanitizeQuestionForPublic(q),
  })
})

export default router

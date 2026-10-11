import { Router } from 'express'
import { concepts } from '../data/concepts.js'
import { lessons } from '../data/lessons.js'
import { questions, sanitizeQuestionForPublic } from '../data/questions.js'
import { SUBJECTS, getSubjectById, getTopicById } from '../data/subjects.js'
import { lessonGeneratorService } from '../services/lessonGeneratorService.js'

const router = Router()

// GET /api/content/subjects - List all supported subjects (Python & C++)
router.get('/content/subjects', (req, res) => {
  res.status(200).json({
    success: true,
    total: SUBJECTS.length,
    subjects: SUBJECTS,
  })
})

// GET /api/content/subjects/:subjectId - Get subject details and its 5 topics
router.get('/content/subjects/:subjectId', (req, res) => {
  const { subjectId } = req.params
  const subject = getSubjectById(subjectId)

  if (!subject) {
    return res.status(404).json({
      success: false,
      error: `Subject "${subjectId}" not found. Supported subjects: python, cpp.`,
    })
  }

  res.status(200).json({
    success: true,
    subject,
  })
})

// GET /api/lessons/:subjectId/:topicId - Dynamically generate or fetch cached lesson via Ollama
router.get('/lessons/:subjectId/:topicId', async (req, res, next) => {
  try {
    const { subjectId, topicId } = req.params
    const forceRefresh = req.query.force === 'true'

    const lesson = await lessonGeneratorService.getLesson(subjectId, topicId, forceRefresh)

    res.status(200).json({
      success: true,
      lesson,
      isCached: Boolean(lesson.fromCache),
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/concepts - List all 5 verified learning concepts (Legacy fallback)
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

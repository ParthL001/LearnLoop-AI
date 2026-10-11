import 'dotenv/config'
import express from 'express'
import { configureCors } from './middleware/corsConfig.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { ollamaService } from './services/ollamaService.js'
import contentRoutes from './routes/contentRoutes.js'
import tutorRoutes from './routes/tutorRoutes.js'
import adaptiveRoutes from './routes/adaptiveRoutes.js'
import progressRoutes from './routes/progressRoutes.js'
import assessmentRoutes from './routes/assessmentRoutes.js'
import diagnosisRoutes from './routes/diagnosisRoutes.js'

const app = express()

// 1. Security & Parsing Middleware
app.use(configureCors())
app.use(express.json({ limit: '1mb' }))


// 2. Request Logger Middleware
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`)
  })
  next()
})

// 3. GET /api/health - General Server Health
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'learnloop-backend',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
})

// 4. GET /api/ai/health - Ollama Availability & Model Health
app.get('/api/ai/health', async (req, res, next) => {
  try {
    const health = await ollamaService.checkHealth()
    const isHealthy = health.status === 'connected' && health.modelAvailable

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      ollama: health,
    })
  } catch (err) {
    next(err)
  }
})

// 5. Mount Learning Content, Tutor, Adaptive, Progress, and Assessment Routes under /api
app.use('/api', contentRoutes)
app.use('/api', tutorRoutes)
app.use('/api', adaptiveRoutes)
app.use('/api', progressRoutes)
app.use('/api', assessmentRoutes)
app.use('/api', diagnosisRoutes)

// 6. 404 & Centralized Error Handlers
app.use(notFoundHandler)
app.use(errorHandler)

export default app

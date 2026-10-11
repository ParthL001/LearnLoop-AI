import app from './app.js'

const PORT = parseInt(process.env.PORT || '5000', 10)
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3:4b'

const server = app.listen(PORT, () => {
  console.log(`====================================================`)
  console.log(`  LearnLoop AI Backend - Phase 1 Active`)
  console.log(`====================================================`)
  console.log(`  Server Port     : http://localhost:${PORT}`)
  console.log(`  Health Check    : http://localhost:${PORT}/api/health`)
  console.log(`  AI Health Check : http://localhost:${PORT}/api/ai/health`)
  console.log(`  Client Origin   : ${CLIENT_ORIGIN}`)
  console.log(`  Ollama Host     : ${OLLAMA_BASE_URL}`)
  console.log(`  Ollama Model    : ${OLLAMA_MODEL}`)
  console.log(`====================================================`)
})

// Graceful shutdown handling
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down LearnLoop server gracefully...`)
  server.close(() => {
    console.log('HTTP server closed.')
    process.exit(0)
  })

  // Force close if connections don't drain within 5s
  setTimeout(() => {
    console.error('Forcefully terminating active connections.')
    process.exit(1)
  }, 5000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

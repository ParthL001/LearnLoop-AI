/**
 * Comprehensive Full-Application Integration Verification Suite
 * Verifies backend reliability, security, content, AI integration,
 * adaptive practice, persistence, assessment, and error handling.
 */

import http from 'http'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import app from './app.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TEST_PORT = 5597
const BASE_URL = `http://localhost:${TEST_PORT}/api`

let server
let passed = 0
let failed = 0

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`)
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  const method = options.method || 'GET'
  const headers = options.headers || {}
  const body = options.body ? JSON.stringify(options.body) : null

  if (body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(url, { method, headers, body })
  let data = null
  const text = await res.text()
  try {
    data = JSON.parse(text)
  } catch {
    data = text
  }
  return { status: res.status, ok: res.ok, data, headers: res.headers }
}

async function runTest(name, fn) {
  process.stdout.write(`Testing: ${name}... `)
  try {
    await fn()
    console.log('PASSED')
    passed++
  } catch (err) {
    console.log(`FAILED\n  Error: ${err.message}`)
    failed++
  }
}

async function main() {
  console.log('====================================================')
  console.log('  LEARNLOOP AI - FULL APPLICATION INTEGRATION SUITE  ')
  console.log('====================================================\n')

  // Clean test storage
  const storageDir = path.resolve(__dirname, 'data/storage')
  try {
    await fs.rm(storageDir, { recursive: true, force: true })
  } catch {}

  server = http.createServer(app)
  await new Promise((resolve) => server.listen(TEST_PORT, resolve))

  try {
    // 1. Backend Health
    await runTest('1. GET /api/health verifies server reliability', async () => {
      const res = await request('/health')
      assert(res.status === 200, `Expected 200, got ${res.status}`)
      assert(res.data.status === 'ok', 'Expected status: ok')
      assert(res.data.service === 'learnloop-backend', 'Expected service: learnloop-backend')
    })

    // 2. Ollama AI Health
    await runTest('2. GET /api/ai/health reports Ollama and qwen3:4b status', async () => {
      const res = await request('/ai/health')
      assert(res.status === 200 || res.status === 503, `Expected 200 or 503, got ${res.status}`)
      assert(res.data.ollama !== undefined, 'Expected ollama health object')
    })

    // 3. Concept and Lesson Retrieval
    await runTest('3. GET /api/concepts lists all 5 verified fraction concepts', async () => {
      const res = await request('/concepts')
      assert(res.status === 200, `Expected 200, got ${res.status}`)
      assert(res.data.concepts.length === 5, 'Expected 5 fraction concepts')
    })

    await runTest('4. GET /api/lessons retrieves structured visual lessons', async () => {
      const res = await request('/lessons/understanding-fractions')
      assert(res.status === 200, `Expected 200, got ${res.status}`)
      assert(res.data.lesson.conceptId === 'understanding-fractions', 'Matched conceptId')
      assert(res.data.lesson.visualModel !== undefined, 'Expected visual partition model')
    })

    // 5. Practice Questions Security (never leak answer keys)
    await runTest('5. GET /api/practice/questions never leaks answer keys or explanations', async () => {
      const res = await request('/practice/questions')
      assert(res.status === 200, `Expected 200, got ${res.status}`)
      for (const q of res.data.questions) {
        assert(q.correctIndex === undefined, `Leaked correctIndex on ${q.id}`)
        assert(q.explanation === undefined, `Leaked explanation on ${q.id}`)
        assert(q.misconceptionRules === undefined, `Leaked misconceptionRules on ${q.id}`)
      }
    })

    // 6. Tutor Answer Evaluation & Misconception Diagnosis
    await runTest('6. POST /api/analyze/misconception diagnoses Whole Number Value Bias deterministically', async () => {
      const res = await request('/analyze/misconception', {
        method: 'POST',
        body: {
          questionId: 'q-cmp-1',
          selectedAnswerIndex: 0, // distractor: 2/5 > 2/3 because 5 > 3
          studentReasoning: '2/5 is bigger because 5 is a bigger number than 3.'
        }
      })
      assert(res.status === 200, `Expected 200, got ${res.status}`)
      assert(res.data.isCorrect === false, 'Expected false for distractor')
      assert(res.data.detectedMisconception !== null, 'Expected detected misconception')
      assert(res.data.detectedMisconception.name === 'Whole Number Value Bias', 'Expected Whole Number Value Bias')
    })

    // 7. Adaptive Follow-Up Selection
    await runTest('7. POST /api/practice/next selects targeted remediation question', async () => {
      const res = await request('/practice/next', {
        method: 'POST',
        body: {
          conceptId: 'comparing-fractions',
          attemptedQuestionIds: ['q-cmp-1'],
          lastMisconception: 'Whole Number Value Bias'
        }
      })
      assert(res.status === 200, `Expected 200, got ${res.status}`)
      assert(res.data.question !== undefined, 'Expected recommended question')
      assert(res.data.question.id !== 'q-cmp-1', 'Should avoid repeating identical question')
    })

    // 8. Attempt Persistence & Progress
    await runTest('8. POST /api/attempts and GET /api/progress/:id track reproducible mastery', async () => {
      // Record 2 correct attempts for equivalent-fractions
      await request('/attempts', {
        method: 'POST',
        body: {
          learnerId: 'learner-full-test',
          questionId: 'q-eqv-1',
          conceptId: 'equivalent-fractions',
          isCorrect: true,
          selectedAnswerIndex: 0
        }
      })
      await request('/attempts', {
        method: 'POST',
        body: {
          learnerId: 'learner-full-test',
          questionId: 'q-eqv-2',
          conceptId: 'equivalent-fractions',
          isCorrect: true,
          selectedAnswerIndex: 1
        }
      })

      const progressRes = await request('/progress/learner-full-test')
      assert(progressRes.status === 200, `Expected 200, got ${progressRes.status}`)
      assert(progressRes.data.totalAttempts === 2, 'Expected 2 attempts')
      const eqTopic = progressRes.data.topics.find((t) => t.id === 'equivalent-fractions')
      assert(eqTopic.status === 'mastered', 'Expected mastered status (>=2 attempts, 100% accuracy)')
      assert(eqTopic.mastery === 100, 'Expected 100% mastery')
    })

    // 9. Fixed Pre-Test & Post-Test Scoring & Duplicate Protection
    await runTest('9. POST /api/assessment/submit scores pre-test and enforces duplicate protection', async () => {
      const preSubmission = {
        learnerId: 'learner-full-test',
        type: 'pre',
        version: 'v1.0',
        itemResponses: [
          { questionId: 'asm-q1', selectedAnswerIndex: 0 },
          { questionId: 'asm-q2', selectedAnswerIndex: 0 },
          { questionId: 'asm-q3', selectedAnswerIndex: 0 },
          { questionId: 'asm-q4', selectedAnswerIndex: 1 }, // wrong
          { questionId: 'asm-q5', selectedAnswerIndex: 1 }, // wrong
          { questionId: 'asm-q6', selectedAnswerIndex: 1 }  // wrong
        ]
      }
      const preRes = await request('/assessment/submit', { method: 'POST', body: preSubmission })
      assert(preRes.status === 201, `Expected 201, got ${preRes.status}`)
      assert(preRes.data.scores.rawScore === 3, 'Expected rawScore 3')
      assert(preRes.data.scores.percentage === 50, 'Expected percentage 50')

      // Attempt duplicate submission
      const dupRes = await request('/assessment/submit', { method: 'POST', body: preSubmission })
      assert(dupRes.status === 409, `Expected 409 Conflict, got ${dupRes.status}`)
    })

    // 10. Paired Post-Test and Percentage-Point Growth
    await runTest('10. Paired pre/post results calculate percentage-point change correctly', async () => {
      const postSubmission = {
        learnerId: 'learner-full-test',
        type: 'post',
        version: 'v1.0',
        itemResponses: [
          { questionId: 'asm-q1', selectedAnswerIndex: 0 },
          { questionId: 'asm-q2', selectedAnswerIndex: 0 },
          { questionId: 'asm-q3', selectedAnswerIndex: 0 },
          { questionId: 'asm-q4', selectedAnswerIndex: 0 },
          { questionId: 'asm-q5', selectedAnswerIndex: 0 },
          { questionId: 'asm-q6', selectedAnswerIndex: 0 }
        ]
      }
      const postRes = await request('/assessment/submit', { method: 'POST', body: postSubmission })
      assert(postRes.status === 201, `Expected 201, got ${postRes.status}`)
      assert(postRes.data.scores.percentage === 100, 'Expected percentage 100')

      const resultsRes = await request('/assessment/results/learner-full-test')
      assert(resultsRes.status === 200, `Expected 200, got ${resultsRes.status}`)
      assert(resultsRes.data.hasPairedResults === true, 'Expected hasPairedResults true')
      assert(resultsRes.data.comparison.prePercentage === 50, 'Pre was 50%')
      assert(resultsRes.data.comparison.postPercentage === 100, 'Post was 100%')
      assert(resultsRes.data.comparison.percentagePointChange === 50, 'Expected +50 percentage points')
    })

    // 11. Cohort Reporting & Attrition Analysis
    await runTest('11. GET /api/assessment/report generates cohort metrics with caveats', async () => {
      const cohortRes = await request('/assessment/report')
      assert(cohortRes.status === 200, `Expected 200, got ${cohortRes.status}`)
      assert(cohortRes.data.pairedLearnersCount >= 1, 'Expected at least 1 paired learner')
      assert(typeof cohortRes.data.methodologicalCaveat === 'string', 'Expected educational caveat')
    })

    // 12. Rate Limiting on AI Endpoints
    await runTest('12. AI endpoints enforce sliding-window rate limit', async () => {
      const requests = []
      for (let i = 0; i < 65; i++) {
        requests.push(
          request('/tutor/chat', {
            method: 'POST',
            body: {} // Triggers rate limiter first, then validation if within limit
          })
        )
      }
      const responses = await Promise.all(requests)
      const hasRateLimited = responses.some((r) => r.status === 429)
      assert(hasRateLimited, 'Expected at least one request to hit rate limit (HTTP 429)')
    })

    // 13. Path & Stack Trace Leakage Prevention
    await runTest('13. Error responses do not leak filesystem paths or stack traces in production', async () => {
      const badRes = await request('/analyze/misconception', {
        method: 'POST',
        body: { questionId: 'non-existent-probe-xyz', selectedAnswerIndex: 0 }
      })
      assert(badRes.status === 404, `Expected 404, got ${badRes.status}`)
      assert(badRes.data.success === false, 'Expected success: false')
      // Ensure error does not contain drive letters or file paths
      assert(!badRes.data.error.includes(':\\'), 'Filesystem path detected in error response!')
      assert(badRes.data.stack === undefined, 'Stack trace leaked in error response!')
    })
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve))
    }
  }

  console.log('\n====================================================')
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`)
  console.log('====================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Fatal integration runner error:', err)
  process.exit(1)
})

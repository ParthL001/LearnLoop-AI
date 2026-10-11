/**
 * Comprehensive Automated Verification Suite for LearnLoop AI Phase 3
 * Tests:
 * 1. Storage persistence, safe atomic writes, concurrency protection
 * 2. Empty histories and missing learner IDs
 * 3. Deterministic mastery rules and progress calculation
 * 4. Fixed assessment retrieval & answer key protection
 * 5. Deterministic scoring of assessments
 * 6. Incomplete assessment handling
 * 7. Duplicate submission prevention (HTTP 409)
 * 8. Pre/post paired comparison and percentage-point calculation
 * 9. Cohort reporting and attrition metrics
 * 10. Educational disclaimers and non-causal caveats
 */

import http from 'http'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import app from './app.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TEST_PORT = 5598
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
  return { status: res.status, ok: res.ok, data }
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
  console.log('   LEARNLOOP AI - PHASE 3 BACKEND VERIFICATION')
  console.log('====================================================\n')

  // Clean test storage before running
  const storageDir = path.resolve(__dirname, 'data/storage')
  try {
    await fs.rm(storageDir, { recursive: true, force: true })
  } catch {}

  server = http.createServer(app)
  await new Promise((resolve) => server.listen(TEST_PORT, resolve))

  try {
    // Test 1: Empty history returns 200 and baseline structure
    await runTest('GET /api/progress for unknown learner returns baseline 0% mastery', async () => {
      const res = await request('/progress/unknown-learner-001')
      assert(res.status === 200, `Expected status 200, got ${res.status}`)
      assert(res.data.overallMasteryScore === 0, 'Expected 0 overall mastery score')
      assert(res.data.totalAttempts === 0, 'Expected 0 total attempts')
      assert(Array.isArray(res.data.topics), 'Expected topics array')
      assert(res.data.topics.length === 5, 'Expected 5 fraction concepts in topics')
      assert(res.data.topics[0].mastery === 0, 'Expected 0 concept mastery')
      assert(res.data.topics[0].status === 'not_started', 'Expected not_started status')
      assert(typeof res.data.disclaimer === 'string', 'Expected scientific limitation disclaimer')
    })

    // Test 2: Missing learner ID on progress returns baseline structure
    await runTest('GET /api/progress without learner ID returns baseline cleanly', async () => {
      const res = await request('/progress')
      assert(res.status === 200, `Expected status 200, got ${res.status}`)
      assert(res.data.learnerId === 'anonymous', 'Expected anonymous learner ID')
      assert(res.data.overallMasteryScore === 0, 'Expected 0 overall mastery score')
    })

    // Test 3: Record attempt explicitly
    await runTest('POST /api/attempts persists attempt and returns 201', async () => {
      const payload = {
        learnerId: 'learner-alpha',
        questionId: 'q-und-1',
        conceptId: 'understanding-fractions',
        isCorrect: true,
        diagnosisStatus: 'correct',
        studentReasoning: 'Carlos took 3 out of 8 equal slices.',
        selectedAnswerIndex: 0
      }
      const res = await request('/attempts', { method: 'POST', body: payload })
      assert(res.status === 201, `Expected status 201, got ${res.status}`)
      assert(res.data.success === true, 'Expected success === true')
      assert(res.data.attempt && res.data.attempt.id, 'Expected attempt with generated id')
      assert(res.data.attempt.learnerId === 'learner-alpha', 'Expected matched learnerId')
    })

    // Test 4: Safe concurrent writes without file corruption
    await runTest('Safe concurrent writes to attempt persistence store', async () => {
      const promises = []
      for (let i = 1; i <= 5; i++) {
        promises.push(
          request('/attempts', {
            method: 'POST',
            body: {
              learnerId: 'learner-alpha',
              questionId: `q-und-${i}`,
              conceptId: 'understanding-fractions',
              isCorrect: i % 2 === 0,
              studentReasoning: `Concurrent test attempt ${i}`,
              selectedAnswerIndex: 0
            }
          })
        )
      }
      const results = await Promise.all(promises)
      for (const r of results) {
        assert(r.status === 201, `Expected status 201, got ${r.status}`)
      }
      const listRes = await request('/attempts?learnerId=learner-alpha')
      assert(listRes.status === 200, `Expected status 200, got ${listRes.status}`)
      assert(listRes.data.total === 6, `Expected exactly 6 total attempts stored, got ${listRes.data.total}`)
    })

    // Test 5: Re-calibrated progress & deterministic mastery rule
    await runTest('GET /api/progress calculates accurate mastery from attempts', async () => {
      // Add attempts for equivalent-fractions to make it mastered (>= 2 attempts, 100% correct)
      await request('/attempts', {
        method: 'POST',
        body: {
          learnerId: 'learner-alpha',
          questionId: 'q-eq-1',
          conceptId: 'equivalent-fractions',
          isCorrect: true,
          selectedAnswerIndex: 0
        }
      })
      await request('/attempts', {
        method: 'POST',
        body: {
          learnerId: 'learner-alpha',
          questionId: 'q-eq-2',
          conceptId: 'equivalent-fractions',
          isCorrect: true,
          selectedAnswerIndex: 0
        }
      })

      const res = await request('/progress/learner-alpha')
      assert(res.status === 200, `Expected status 200, got ${res.status}`)
      assert(res.data.totalAttempts === 8, `Expected 8 total attempts, got ${res.data.totalAttempts}`)

      // Check equivalent fractions
      const eqTopic = res.data.topics.find((t) => t.id === 'equivalent-fractions')
      assert(eqTopic, 'Expected equivalent-fractions topic in response')
      assert(eqTopic.mastery === 100, `Expected 100% mastery, got ${eqTopic.mastery}`)
      assert(eqTopic.status === 'mastered', `Expected status "mastered", got ${eqTopic.status}`)
      assert(res.data.conceptsMasteredCount >= 1, 'Expected at least 1 mastered concept')

      // Check practice history
      assert(Array.isArray(res.data.practiceHistory), 'Expected practiceHistory array')
      assert(res.data.practiceHistory.length >= 8, 'Expected practice history items')
    })

    // Test 6: Never reports success when persistence request is invalid
    await runTest('POST /api/attempts rejects invalid payload with 400', async () => {
      const res = await request('/attempts', {
        method: 'POST',
        body: { learnerId: 'learner-alpha' } // missing questionId, conceptId, isCorrect
      })
      assert(res.status === 400, `Expected status 400, got ${res.status}`)
    })

    // Test 7: GET /api/assessment never exposes answer keys
    await runTest('GET /api/assessment NEVER exposes backend answer keys', async () => {
      const res = await request('/assessment?type=pre')
      assert(res.status === 200, `Expected status 200, got ${res.status}`)
      assert(res.data.type === 'pre', 'Expected pre assessment')
      assert(res.data.questions.length === 6, 'Expected 6 assessment questions')

      for (const q of res.data.questions) {
        assert(q.correctIndex === undefined, `Secret correctIndex leaked on question ${q.id}`)
        assert(q.explanation === undefined, `Explanation leaked on question ${q.id}`)
        assert(q.misconceptionRules === undefined, `Misconception rules leaked on question ${q.id}`)
        assert(Array.isArray(q.options) && q.options.length >= 4, `Options missing on question ${q.id}`)
      }
    })

    // Test 8: Pre-test submission and deterministic scoring
    await runTest('POST /api/assessment/submit grades pre-test deterministically', async () => {
      // 4 out of 6 correct: q1 (idx 0), q2 (idx 0), q3 (idx 0), q4 (idx 0), q5 wrong (idx 1), q6 wrong (idx 1)
      const submission = {
        learnerId: 'learner-paired-1',
        type: 'pre',
        version: 'v1.0',
        itemResponses: [
          { questionId: 'asm-q1', selectedAnswerIndex: 0 },
          { questionId: 'asm-q2', selectedAnswerIndex: 0 },
          { questionId: 'asm-q3', selectedAnswerIndex: 0 },
          { questionId: 'asm-q4', selectedAnswerIndex: 0 },
          { questionId: 'asm-q5', selectedAnswerIndex: 1 }, // distractor
          { questionId: 'asm-q6', selectedAnswerIndex: 1 }  // distractor
        ]
      }
      const res = await request('/assessment/submit', { method: 'POST', body: submission })
      assert(res.status === 201, `Expected status 201, got ${res.status}`)
      assert(res.data.scores.rawScore === 4, `Expected rawScore 4, got ${res.data.scores.rawScore}`)
      assert(res.data.scores.totalItems === 6, `Expected totalItems 6, got ${res.data.scores.totalItems}`)
      assert(res.data.scores.percentage === 67, `Expected percentage 67, got ${res.data.scores.percentage}`)
      assert(res.data.completionStatus === 'completed', 'Expected completed status')
    })

    // Test 9: Incomplete assessment handling
    await runTest('POST /api/assessment/submit handles incomplete submissions', async () => {
      const submission = {
        learnerId: 'learner-incomplete',
        type: 'pre',
        itemResponses: [
          { questionId: 'asm-q1', selectedAnswerIndex: 0 },
          { questionId: 'asm-q2', selectedAnswerIndex: 0 }
        ]
      }
      const res = await request('/assessment/submit', { method: 'POST', body: submission })
      assert(res.status === 201, `Expected status 201, got ${res.status}`)
      assert(res.data.completionStatus === 'incomplete', 'Expected completionStatus === incomplete')
      assert(res.data.scores.rawScore === 2, `Expected rawScore 2, got ${res.data.scores.rawScore}`)
      assert(res.data.scores.totalItems === 6, 'Expected totalItems 6')
    })

    // Test 10: Duplicate submission prevention
    await runTest('POST /api/assessment/submit prevents duplicate submissions with 409', async () => {
      const duplicateSubmission = {
        learnerId: 'learner-paired-1',
        type: 'pre',
        version: 'v1.0',
        itemResponses: [
          { questionId: 'asm-q1', selectedAnswerIndex: 0 }
        ]
      }
      const res = await request('/assessment/submit', { method: 'POST', body: duplicateSubmission })
      assert(res.status === 409, `Expected HTTP 409 Conflict for duplicate submission, got ${res.status}`)
      assert(res.data.error.includes('Duplicate submission'), 'Expected duplicate error message')
    })

    // Test 11: Post-test submission and paired pre/post calculation
    await runTest('POST /api/assessment/submit and GET /api/assessment/results calculates percentage-point change', async () => {
      // Submit post-test with 6 out of 6 correct (100%)
      const postSubmission = {
        learnerId: 'learner-paired-1',
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
      assert(postRes.status === 201, `Expected status 201, got ${postRes.status}`)
      assert(postRes.data.scores.rawScore === 6, 'Expected rawScore 6')
      assert(postRes.data.scores.percentage === 100, 'Expected percentage 100')

      // Fetch comparison results
      const reportRes = await request('/assessment/results/learner-paired-1')
      assert(reportRes.status === 200, `Expected status 200, got ${reportRes.status}`)
      assert(reportRes.data.hasPairedResults === true, 'Expected hasPairedResults === true')
      assert(reportRes.data.comparison.prePercentage === 67, 'Expected prePercentage 67')
      assert(reportRes.data.comparison.postPercentage === 100, 'Expected postPercentage 100')
      assert(reportRes.data.comparison.percentagePointChange === 33, `Expected +33 percentage-point change, got ${reportRes.data.comparison.percentagePointChange}`)
      assert(reportRes.data.comparison.rawScoreChange === 2, `Expected +2 raw score change, got ${reportRes.data.comparison.rawScoreChange}`)
      assert(typeof reportRes.data.methodologicalCaveat === 'string', 'Expected methodological caveat')
    })

    // Test 12: Cohort assessment reporting and attrition tracking
    await runTest('GET /api/assessment/report generates cohort metrics with attrition note', async () => {
      const res = await request('/assessment/report')
      assert(res.status === 200, `Expected status 200, got ${res.status}`)
      assert(res.data.totalLearners >= 2, 'Expected at least 2 distinct learners')
      assert(res.data.pairedLearnersCount === 1, `Expected 1 paired learner, got ${res.data.pairedLearnersCount}`)
      assert(res.data.attritionCount >= 1, `Expected attritionCount >= 1, got ${res.data.attritionCount}`)
      assert(res.data.attritionNote.includes('attrition') || res.data.attritionNote.includes('learner(s)'), 'Expected attrition note')
      assert(typeof res.data.methodologicalCaveat === 'string', 'Expected non-causal disclaimer in cohort report')
    })

    // Test 13: Tutor submission auto-records attempt with learnerId
    await runTest('POST /api/analyze/misconception with learnerId auto-persists attempt', async () => {
      const payload = {
        learnerId: 'learner-auto-save',
        questionId: 'q-cmp-1',
        selectedAnswerIndex: 0,
        studentReasoning: '2/3 is bigger than 2/5 because 3 is fewer partitions so each part is larger.'
      }
      const res = await request('/analyze/misconception', { method: 'POST', body: payload })
      assert(res.status === 200, `Expected status 200, got ${res.status}`)
      assert(res.data.savedAttemptId !== null, 'Expected savedAttemptId in response')

      const attemptsRes = await request('/attempts?learnerId=learner-auto-save')
      assert(attemptsRes.data.total === 1, 'Expected 1 stored attempt')
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
  console.error('Fatal verification runner error:', err)
  process.exit(1)
})

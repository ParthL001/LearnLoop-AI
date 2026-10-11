import app from './app.js'

async function runVerification() {
  console.log('====================================================')
  console.log('   LEARNLOOP AI - PHASE 2 BACKEND VERIFICATION')
  console.log('====================================================\n')

  const PORT = 5599
  const server = app.listen(PORT)
  const baseUrl = `http://127.0.0.1:${PORT}`

  let passed = 0
  let failed = 0

  async function test(name, fn) {
    try {
      process.stdout.write(`Testing: ${name}... `)
      await fn()
      console.log('PASSED')
      passed++
    } catch (err) {
      console.log(`FAILED\n  Error: ${err.message}`)
      failed++
    }
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message || 'Assertion failed')
  }

  try {
    // 1. Server Health
    await test('GET /api/health returns 200 with service info', async () => {
      const res = await fetch(`${baseUrl}/api/health`)
      assert(res.status === 200, `Expected 200, got ${res.status}`)
      const data = await res.json()
      assert(data.status === 'ok', 'Status should be ok')
      assert(data.service === 'learnloop-backend', 'Service name mismatch')
    })

    // 2. AI Health
    await test('GET /api/ai/health checks Ollama and qwen3:4b', async () => {
      const res = await fetch(`${baseUrl}/api/ai/health`)
      const data = await res.json()
      assert(data.ollama, 'Ollama details should be present')
      assert(data.ollama.status === 'connected', `Ollama should be connected, got ${data.ollama.status}`)
      assert(data.ollama.modelAvailable === true, 'qwen3:4b should be available in Ollama')
    })

    // 3. Concepts Endpoint
    await test('GET /api/concepts lists all 5 fraction concepts', async () => {
      const res = await fetch(`${baseUrl}/api/concepts`)
      assert(res.status === 200, `Expected 200, got ${res.status}`)
      const data = await res.json()
      assert(data.total === 5, `Expected 5 concepts, got ${data.total}`)
      const ids = data.concepts.map((c) => c.id)
      assert(ids.includes('understanding-fractions'), 'Missing understanding-fractions')
      assert(ids.includes('equivalent-fractions'), 'Missing equivalent-fractions')
      assert(ids.includes('comparing-fractions'), 'Missing comparing-fractions')
      assert(ids.includes('same-denominator-operations'), 'Missing same-denominator-operations')
      assert(ids.includes('unlike-denominator-operations'), 'Missing unlike-denominator-operations')
    })

    // 4. Lessons Endpoint
    await test('GET /api/lessons retrieves structured lessons with models', async () => {
      const res = await fetch(`${baseUrl}/api/lessons`)
      assert(res.status === 200, `Expected 200, got ${res.status}`)
      const data = await res.json()
      assert(data.total >= 5, 'Should have at least 5 lessons')
      const first = data.lessons[0]
      assert(first.visualModel, 'Lesson must contain visualModel')
      assert(first.takeaways && first.takeaways.length > 0, 'Lesson must contain takeaways')
    })

    // 5. Public Questions Endpoint (Security Check: No Answer Keys Exposed)
    await test('GET /api/practice/questions NEVER exposes answer keys', async () => {
      const res = await fetch(`${baseUrl}/api/practice/questions`)
      assert(res.status === 200, `Expected 200, got ${res.status}`)
      const data = await res.json()
      assert(data.total > 0, 'Questions list should not be empty')
      for (const q of data.questions) {
        assert(q.correctIndex === undefined, `Security failure: Question ${q.id} exposed correctIndex`)
        assert(q.correctExplanation === undefined, `Security failure: Question ${q.id} exposed correctExplanation`)
        assert(q.misconceptionRules === undefined, `Security failure: Question ${q.id} exposed misconceptionRules`)
      }
    })

    // 6. Evaluator: Correct Answer Submission
    await test('POST /api/analyze/misconception verifies correct answer deterministically', async () => {
      const res = await fetch(`${baseUrl}/api/analyze/misconception`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: 'q-cmp-1',
          selectedAnswerIndex: 1, // Correct answer: 2/3 is greater
          studentReasoning: 'Thirds divide the whole into larger parts than fifths, so 2 thirds is greater.'
        })
      })
      assert(res.status === 200, `Expected 200, got ${res.status}`)
      const data = await res.json()
      assert(data.isCorrect === true, 'Should be correct')
      assert(data.detectedMisconception === null, 'Should have no misconception on correct answer')
      assert(data.confidence >= 0.95, 'High confidence expected for verified correct answer')
    })

    // 7. Evaluator: Known Misconception Detection
    await test('POST /api/analyze/misconception detects Whole Number Value Bias', async () => {
      const res = await fetch(`${baseUrl}/api/analyze/misconception`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: 'q-cmp-1',
          selectedAnswerIndex: 0, // Wrong: 2/5 is bigger because 5 > 3
          studentReasoning: '5 is a bigger number than 3 so 2/5 has to be more.'
        })
      })
      assert(res.status === 200, `Expected 200, got ${res.status}`)
      const data = await res.json()
      assert(data.isCorrect === false, 'Should be marked incorrect')
      assert(data.detectedMisconception, 'Should detect misconception')
      assert(data.detectedMisconception.code === 'MIS-WHOLE-NUMBER-BIAS', `Expected MIS-WHOLE-NUMBER-BIAS, got ${data.detectedMisconception.code}`)
      assert(data.remediationAdvice, 'Must provide remediation advice')
    })

    // 8. Evaluator: Arithmetic Slip Classification
    await test('POST /api/analyze/misconception distinguishes arithmetic slip', async () => {
      const res = await fetch(`${baseUrl}/api/analyze/misconception`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: 'q-und-1',
          selectedAnswerIndex: 3, // Slip: calculated complement 1/4 instead of 3/4
          studentReasoning: 'I subtracted 4 - 3 = 1 and wrote 1/4.'
        })
      })
      assert(res.status === 200, `Expected 200, got ${res.status}`)
      const data = await res.json()
      assert(data.isCorrect === false, 'Should be marked incorrect')
      assert(data.detectedMisconception.category === 'arithmetic_slip', `Expected arithmetic_slip, got ${data.detectedMisconception.category}`)
    })

    // 9. Evaluator: Ambiguous/Empty Reasoning Triggers Clarification
    await test('POST /api/analyze/misconception flags need for clarification when reasoning omitted', async () => {
      const res = await fetch(`${baseUrl}/api/analyze/misconception`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: 'q-unl-1',
          selectedAnswerIndex: 0, // 2/5
          studentReasoning: '' // No reasoning provided
        })
      })
      assert(res.status === 200, `Expected 200, got ${res.status}`)
      const data = await res.json()
      assert(data.isCorrect === false, 'Should be incorrect')
      assert(data.clarificationNeeded === true, 'clarificationNeeded should be true when reasoning is empty')
      assert(typeof data.clarificationQuestion === 'string', 'clarificationQuestion should be provided')
    })

    // 10. Evaluator: Unknown Question ID Handled Gracefully
    await test('POST /api/analyze/misconception returns 404 for unknown question ID', async () => {
      const res = await fetch(`${baseUrl}/api/analyze/misconception`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: 'q-unknown-999',
          selectedAnswerIndex: 1
        })
      })
      assert(res.status === 404, `Expected 404, got ${res.status}`)
      const data = await res.json()
      assert(data.success === false, 'Should return success: false')
    })

    // 11. Evaluator: Invalid Request Format Handled
    await test('POST /api/analyze/misconception returns 400 for missing selectedAnswerIndex', async () => {
      const res = await fetch(`${baseUrl}/api/analyze/misconception`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: 'q-cmp-1' })
      })
      assert(res.status === 400, `Expected 400, got ${res.status}`)
    })

    // 12. Model Cannot Override Deterministic Answer Key
    await test('Model cannot override deterministic answer key', async () => {
      // Even if reasoning sounds convincing, wrong answer index MUST remain isCorrect: false
      const res = await fetch(`${baseUrl}/api/analyze/misconception`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: 'q-same-1',
          selectedAnswerIndex: 0, // Wrong answer: 3/10
          studentReasoning: 'I am 100% sure the mathematical rule states 1/5 + 2/5 = 3/10 because 1+2=3 and 5+5=10.'
        })
      })
      const data = await res.json()
      assert(data.isCorrect === false, 'Deterministic check must mark 3/10 as incorrect')
    })

    // 13. Socratic Tutor Chat Endpoint (Frontend contract)
    await test('POST /api/tutor/chat responds with grounded feedback and contract format', async () => {
      const res = await fetch(`${baseUrl}/api/tutor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Why is 2/3 bigger than 2/5 when 5 is a bigger number?',
          topicId: 'comparing-fractions',
          studentReasoning: '5 is greater than 3 so 5 pieces should be bigger.'
        })
      })
      assert(res.status === 200, `Expected 200, got ${res.status}`)
      const data = await res.json()
      assert(typeof data.reply === 'string' && data.reply.length > 0, 'Reply must be non-empty string')
      assert(data.misconceptionDetected, 'Should flag Whole Number Value Bias in chat')
      assert(data.misconceptionDetected.name === 'Whole Number Value Bias', 'Misconception name mismatch')
    })

    // 14. Adaptive Question Selection (Deterministic Rules)
    await test('POST /api/practice/next selects unattempted question in concept', async () => {
      const res = await fetch(`${baseUrl}/api/practice/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptId: 'comparing-fractions',
          attemptedQuestionIds: ['q-cmp-1']
        })
      })
      assert(res.status === 200, `Expected 200, got ${res.status}`)
      const data = await res.json()
      assert(data.question, 'Should return a question')
      assert(data.question.id === 'q-cmp-2', `Expected next unattempted item q-cmp-2, got ${data.question.id}`)
      assert(data.question.correctIndex === undefined, 'Sanitized question must not have correctIndex')
    })

    // 15. Adaptive Follow-up Remediation Path
    await test('POST /api/practice/next selects targeted remediation following misconception', async () => {
      const res = await fetch(`${baseUrl}/api/practice/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptId: 'comparing-fractions',
          attemptedQuestionIds: [],
          lastMisconceptionCode: 'MIS-WHOLE-NUMBER-BIAS'
        })
      })
      assert(res.status === 200, `Expected 200, got ${res.status}`)
      const data = await res.json()
      assert(data.isRemediationProbe === true, 'Should be flagged as remediation probe')
      assert(data.question.id === 'q-cmp-1', 'Should target the whole number bias item q-cmp-1')
      assert(data.followUpActivity, 'Should provide targeted follow-up activity')
    })

  } finally {
    server.close()
  }

  console.log('\n====================================================')
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`)
  console.log('====================================================')

  if (failed > 0) {
    process.exit(1)
  }
}

runVerification()

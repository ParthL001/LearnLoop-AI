
const AIML_BASE_URL =
    process.env.AIML_BASE_URL || 'http://127.0.0.1:8000'

export async function diagnosePythonAnswer({
    question,
    correctAnswer,
    studentAnswer,
    studentReasoning = '',
    exampleId = null,
    expectedFeedback = '',
    recommendedFollowup = '',
}) {
    const response = await fetch(
        `${AIML_BASE_URL}/internal/v1/diagnose`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                example_id: exampleId,
                question,
                correct_answer: String(correctAnswer),
                student_answer: String(studentAnswer),
                student_reasoning: studentReasoning,
                expected_feedback: expectedFeedback,
                recommended_followup: recommendedFollowup,
            }),
            signal: AbortSignal.timeout(10000),
        }
    )

    if (!response.ok) {
        throw new Error(`AIML service returned HTTP ${response.status}`)
    }

    return response.json()
}

export async function fetchPythonExercises() {
    const response = await fetch(
        `${AIML_BASE_URL}/internal/v1/exercises`,
        {
            signal: AbortSignal.timeout(10000),
        }
    )

    if (!response.ok) {
        throw new Error(`AIML service returned HTTP ${response.status}`)
    }

    const exercises = await response.json()

    if (!Array.isArray(exercises)) {
        throw new Error('Invalid exercises response from AIML service')
    }

    return { exercises }
}
export async function checkPythonFollowup({
    exampleId,
    studentAnswer,
}) {
    const response = await fetch(
        `${AIML_BASE_URL}/internal/v1/followup/check`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                example_id: exampleId,
                student_answer: studentAnswer,
            }),
            signal: AbortSignal.timeout(10000),
        }
    )

    if (!response.ok) {
        throw new Error(
            `AIML follow-up service returned HTTP ${response.status}`
        )
    }

    return response.json()
}

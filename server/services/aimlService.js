
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
    try {
        const response = await fetch(
            `${AIML_BASE_URL}/internal/v1/exercises`,
            { signal: AbortSignal.timeout(4000) }
        )

        if (response.ok) {
            return await response.json()
        }
    } catch {
        // Fall back to reading local python_exercises.jsonl
    }

    try {
        const fs = await import('fs/promises')
        const path = await import('path')
        const { fileURLToPath } = await import('url')
        const __filename = fileURLToPath(import.meta.url)
        const __dirname = path.dirname(__filename)
        const filePath = path.resolve(__dirname, '../../AIML/dataset/python_exercises.jsonl')
        const content = await fs.readFile(filePath, 'utf8')
        const exercises = content
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => JSON.parse(line))

        return { success: true, exercises }
    } catch (err) {
        throw new Error(`Could not load Python exercises: ${err.message}`)
    }
}


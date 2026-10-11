
import { useEffect, useState } from 'react'
import {
    fetchPythonExercises,
    diagnosePythonAnswer,
} from '../services/api'
import { Card, Button, Badge } from '../components/UI'
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'

export default function PythonPractice() {
    const [exercises, setExercises] = useState([])
    const [index, setIndex] = useState(0)
    const [answer, setAnswer] = useState('')
    const [reasoning, setReasoning] = useState('')
    const [diagnosis, setDiagnosis] = useState(null)
    const [loading, setLoading] = useState(false)
    const [loadingExercises, setLoadingExercises] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let active = true

        async function loadExercises() {
            try {
                const data = await fetchPythonExercises()
                if (active) setExercises(data)
            } catch (err) {
                if (active) {
                    setError(err.message || 'Could not load exercises.')
                }
            } finally {
                if (active) setLoadingExercises(false)
            }
        }

        loadExercises()
        return () => {
            active = false
        }
    }, [])

    const exercise = exercises[index]

    function moveToQuestion(nextIndex) {
        setIndex(nextIndex)
        setAnswer('')
        setReasoning('')
        setDiagnosis(null)
        setError('')
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!answer.trim() || !exercise || loading) return

        setLoading(true)
        setError('')
        setDiagnosis(null)

        try {
            const result = await diagnosePythonAnswer({
                exampleId: exercise.example_id,
                question: exercise.question,
                studentAnswer: answer.trim(),
                studentReasoning: reasoning.trim(),
            })
            setDiagnosis(result)
        } catch (err) {
            setError(err.message || 'Could not evaluate your answer.')
        } finally {
            setLoading(false)
        }
    }

    if (loadingExercises) {
        return (
            <Card>
                <p className="text-sm text-[#A8B3C4]">
                    Loading Python exercises...
                </p>
            </Card>
        )
    }

    if (!exercises.length) {
        return (
            <Card>
                <p className="text-sm text-red-400">
                    {error || 'No exercises are available.'}
                </p>
                <Button type="button" onClick={() => window.location.reload()}>
                    Retry
                </Button>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <div className="space-y-2">
                    <Badge variant="accent">Python Programming</Badge>
                    <h2 className="text-xl font-bold text-[#F8FAFC]">
                        Python Misconception Detector
                    </h2>
                    <p className="text-sm text-[#A8B3C4]">
                        Submit your answer and reasoning to identify possible
                        misunderstandings.
                    </p>
                    <p className="text-sm text-[#A8B3C4]">
                        Question {index + 1} of {exercises.length}
                    </p>
                    <div className="h-2 overflow-hidden rounded-full bg-[#303846]">
                        <div
                            className="h-full rounded-full bg-blue-500"
                            style={{
                                width: `${((index + 1) / exercises.length) * 100}%`,
                            }}
                        />
                    </div>
                </div>
            </Card>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge variant="accent">
                            {exercise.topic.replaceAll('_', ' ')}
                        </Badge>
                        <span className="text-xs text-[#A8B3C4]">
                            {exercise.example_id}
                        </span>
                    </div>

                    <h3 className="font-semibold text-[#F8FAFC]">
                        {exercise.question}
                    </h3>

                    <div>
                        <label className="mb-2 block text-sm text-[#F8FAFC]">
                            Your answer
                        </label>
                        <input
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Enter your answer..."
                            className="w-full rounded-md border border-[#303846] bg-[#1B2028] p-3 text-sm text-white"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm text-[#F8FAFC]">
                            Explain your reasoning
                        </label>
                        <textarea
                            value={reasoning}
                            onChange={(e) => setReasoning(e.target.value)}
                            placeholder="Explain how you reached your answer..."
                            rows={3}
                            className="w-full rounded-md border border-[#303846] bg-[#1B2028] p-3 text-sm text-white"
                            disabled={loading}
                        />
                    </div>

                    <Button type="submit" disabled={loading || !answer.trim()}>
                        {loading ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Evaluating...
                            </>
                        ) : (
                            'Diagnose My Answer'
                        )}
                    </Button>
                </form>
            </Card>

            {error && (
                <Card>
                    <p className="text-sm text-red-400">{error}</p>
                </Card>
            )}

            {diagnosis && (
                <Card>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            {diagnosis.is_correct ? (
                                <CheckCircle className="text-green-400" size={18} />
                            ) : (
                                <AlertTriangle className="text-yellow-400" size={18} />
                            )}
                            <h3 className="font-semibold text-[#F8FAFC]">
                                {diagnosis.is_correct
                                    ? 'Answer marked correct'
                                    : 'Misconception analysis'}
                            </h3>
                        </div>

                        <p className="text-sm text-[#A8B3C4]">
                            <strong>Detected misconception:</strong>{' '}
                            {diagnosis.misconception_label || 'Not identified'}
                        </p>

                        {diagnosis.evidence && (
                            <p className="text-sm text-[#A8B3C4]">
                                <strong>Evidence:</strong> {diagnosis.evidence}
                            </p>
                        )}

                        {diagnosis.feedback && (
                            <p className="text-sm text-[#F8FAFC]">
                                <strong>Feedback:</strong> {diagnosis.feedback}
                            </p>
                        )}

                        {diagnosis.needs_clarification &&
                            diagnosis.clarifying_question && (
                                <p className="text-sm text-blue-300">
                                    <strong>Clarifying question:</strong>{' '}
                                    {diagnosis.clarifying_question}
                                </p>
                            )}

                        {diagnosis.followup_goal && (
                            <p className="text-sm text-[#A8B3C4]">
                                <strong>Next learning goal:</strong>{' '}
                                {diagnosis.followup_goal}
                            </p>
                        )}
                    </div>
                </Card>
            )}

            <Card>
                <div className="flex flex-wrap justify-between gap-3">
                    <Button
                        type="button"
                        disabled={index === 0 || loading}
                        onClick={() => moveToQuestion(index - 1)}
                    >
                        Previous
                    </Button>

                    <Button
                        type="button"
                        disabled={index === exercises.length - 1 || loading}
                        onClick={() => moveToQuestion(index + 1)}
                    >
                        Next Question
                    </Button>
                </div>
            </Card>
        </div>
    )
}

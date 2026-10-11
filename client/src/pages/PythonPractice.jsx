import { useEffect, useState } from 'react'
import {
  fetchPythonExercises,
  diagnosePythonAnswer,
  checkPythonFollowup,
} from '../services/api'
import {
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Terminal,
  Target,
  BrainCircuit,
} from 'lucide-react'

export default function PythonPractice() {
  const [exercises, setExercises] = useState([])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [reasoning, setReasoning] = useState('')
  const [diagnosis, setDiagnosis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingExercises, setLoadingExercises] = useState(true)
  const [error, setError] = useState('')
  const [showFollowup, setShowFollowup] = useState(false)
  const [followupAnswer, setFollowupAnswer] = useState('')
  const [followupFeedback, setFollowupFeedback] = useState('')
  const [checkingFollowup, setCheckingFollowup] = useState(false)

  useEffect(() => {
    let active = true

    async function loadExercises() {
      try {
        const data = await fetchPythonExercises()
        if (active) setExercises(Array.isArray(data) ? data : [])
      } catch (err) {
        if (active) setError(err.message || 'Could not load exercises from the server.')
      } finally {
        if (active) setLoadingExercises(false)
      }
    }

    loadExercises()
    return () => {
      active = false
    }
  }, [])

  const exercise = exercises[index] ?? null

  function moveToQuestion(nextIndex) {
    if (nextIndex < 0 || nextIndex >= exercises.length) return
    setIndex(nextIndex)
    setAnswer('')
    setReasoning('')
    setDiagnosis(null)
    setError('')
    setShowFollowup(false)
    setFollowupAnswer('')
    setFollowupFeedback('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!answer.trim() || !exercise || loading) return

    setLoading(true)
    setError('')
    setDiagnosis(null)
    setShowFollowup(false)
    setFollowupAnswer('')
    setFollowupFeedback('')

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

  async function handleFollowupSubmit() {
    if (!followupAnswer.trim() || !exercise || checkingFollowup) return

    setCheckingFollowup(true)
    setFollowupFeedback('')
    setError('')

    try {
      const result = await checkPythonFollowup({
        exampleId: exercise.example_id,
        studentAnswer: followupAnswer.trim(),
      })
      setFollowupFeedback(
        result.feedback ||
        (result.is_correct
          ? 'You have understood this concept.'
          : 'Review the concept and try again.')
      )
    } catch (err) {
      setError(err.message || 'Could not check your follow-up answer.')
    } finally {
      setCheckingFollowup(false)
    }
  }

  if (loadingExercises) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-[#D8D8CF] bg-white p-8 text-center shadow-xs">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#3D5F58]" />
        <h3 className="font-heading text-xl font-bold text-[#231F20]">Loading Python Exercises</h3>
        <p className="font-sans text-sm text-[#6B7280]">Connecting to exercise database...</p>
      </div>
    )
  }

  if (!exercises.length) {
    return (
      <div className="rounded-lg border border-[#D8D8CF] bg-white p-6 shadow-xs">
        <p className="mb-4 text-sm text-red-600">{error || 'No exercises are available.'}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md bg-[#3D5F58] px-4 py-2 text-sm font-bold text-white"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="rounded-lg border border-[#D8D8CF] bg-white p-6">
        <p className="mb-4 text-sm text-red-600">Exercise not found.</p>
        <button
          type="button"
          onClick={() => moveToQuestion(0)}
          className="rounded-md bg-[#3D5F58] px-4 py-2 text-sm font-bold text-white"
        >
          Return to first question
        </button>
      </div>
    )
  }

  const progress = ((index + 1) / exercises.length) * 100
  const canShowFollowup =
    diagnosis &&
    !diagnosis.is_correct &&
    diagnosis.misconception_label !== 'uncertain_needs_clarification' &&
    exercise.followup_question

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[#D8D8CF] bg-white p-5 shadow-xs">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#F5B726]" />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#3D5F58]">
                Curriculum &amp; Tools · Python Practice
              </span>
            </div>
            <h1 className="font-heading text-2xl font-extrabold uppercase tracking-tight text-[#231F20] sm:text-3xl">
              Python Misconception Detector
            </h1>
            <p className="mt-1 text-sm text-[#4B5563]">
              Submit your answer and reasoning to identify possible misunderstandings.
            </p>
          </div>
          <div className="shrink-0 sm:text-right">
            <div className="mb-1.5 font-mono text-xs font-semibold text-[#6B7280]">
              QUESTION <span className="font-bold text-[#231F20]">{index + 1}</span> OF{' '}
              <span className="font-bold text-[#231F20]">{exercises.length}</span>
            </div>
            <div className="h-2 w-40 overflow-hidden rounded-full border border-[#D8D8CF] bg-[#F2F2EB] sm:w-48">
              <div className="h-full bg-[#3D5F58] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-6">
          <div className="relative rounded-lg border border-[#D8D8CF] bg-white p-6 shadow-xs">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#D8D8CF] pb-3">
              <span className="inline-flex items-center gap-1.5 rounded border border-[#D8D8CF] bg-[#F2F2EB] px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-[#3D5F58]">
                <BookOpen size={12} />
                {exercise.topic ? exercise.topic.replaceAll('_', ' ') : 'PYTHON CONCEPT'}
              </span>
              <span className="rounded border border-[#E5E5DC] bg-[#FAF9F5] px-2 py-0.5 font-mono text-xs font-bold text-[#6B7280]">
                {exercise.example_id || `PY${String(index + 1).padStart(3, '0')}`}
              </span>
            </div>

            <div className="mb-6">
              <h2 className="font-heading text-lg font-bold leading-snug text-[#231F20] sm:text-xl">{exercise.question}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider text-[#3D5F58]">
                  Your Answer <span className="text-[#E97B77]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    placeholder="Enter your exact answer or code..."
                    disabled={loading}
                    required
                    className="w-full rounded-md border border-[#D8D8CF] bg-[#FAF9F5] px-3.5 py-2.5 pr-10 font-mono text-sm text-[#231F20] placeholder-[#9CA3AF] transition focus:border-[#3D5F58] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D5F58]"
                  />
                  <Terminal className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[#9CA3AF]" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                  Explain Your Reasoning{' '}
                  <span className="font-sans text-xs font-normal text-[#9CA3AF]">(Helps AI detect subtle misconceptions)</span>
                </label>
                <textarea
                  value={reasoning}
                  onChange={(event) => setReasoning(event.target.value)}
                  placeholder="Why did you choose this answer?"
                  rows={3}
                  disabled={loading}
                  className="w-full rounded-md border border-[#D8D8CF] bg-[#FAF9F5] p-3 font-sans text-sm text-[#231F20] placeholder-[#9CA3AF] transition focus:border-[#3D5F58] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D5F58]"
                />
              </div>
              {error && (
                <div className="flex items-start gap-2 rounded-md border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-xs text-[#991B1B]">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={loading || !answer.trim()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#3D5F58] px-5 py-3 font-sans text-sm font-bold text-white shadow-xs transition hover:bg-[#2E4742] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles className="h-4 w-4 text-[#F5B726]" /> Diagnose My Answer</>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#D8D8CF] pt-4">
              <button
                type="button"
                onClick={() => moveToQuestion(index - 1)}
                disabled={index === 0 || loading}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#D8D8CF] bg-white px-4 py-2 font-mono text-xs font-bold text-[#231F20] transition hover:bg-[#F2F2EB] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                type="button"
                onClick={() => moveToQuestion(index + 1)}
                disabled={index === exercises.length - 1 || loading}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#D8D8CF] bg-white px-4 py-2 font-mono text-xs font-bold text-[#231F20] transition hover:bg-[#F2F2EB] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-6">
          {loading ? (
            <div className="space-y-4 rounded-lg border border-[#D8D8CF] bg-white p-8 text-center shadow-xs">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#3D5F58]" />
              <h3 className="font-heading text-lg font-bold text-[#231F20]">Running Misconception Classifier</h3>
              <p className="text-xs text-[#6B7280]">Analyzing your answer and reasoning...</p>
            </div>
          ) : diagnosis ? (
            <div className="space-y-5 rounded-lg border border-[#D8D8CF] bg-white p-6 shadow-xs">
              <div className={`flex items-center justify-between gap-3 rounded-md border p-4 ${diagnosis.is_correct
                  ? 'border-[#86EFAC] bg-[#F0FDF4] text-[#166534]'
                  : diagnosis.needs_clarification
                    ? 'border-[#FDE047] bg-[#FEFCE8] text-[#854D0E]'
                    : 'border-[#FECDD3] bg-[#FFF1F2] text-[#9F1239]'
                }`}>
                <div className="flex items-center gap-3">
                  {diagnosis.is_correct ? (
                    <CheckCircle className="h-6 w-6 shrink-0 text-[#16A34A]" />
                  ) : diagnosis.needs_clarification ? (
                    <HelpCircle className="h-6 w-6 shrink-0 text-[#CA8A04]" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 shrink-0 text-[#E11D48]" />
                  )}
                  <div>
                    <h3 className="font-heading text-base font-extrabold uppercase tracking-wide">
                      {diagnosis.is_correct ? 'Correct Understanding' : diagnosis.needs_clarification ? 'Needs Clarification' : 'Misconception Identified'}
                    </h3>
                    <p className="text-xs opacity-90">
                      {diagnosis.is_correct
                        ? 'Your answer is correct.'
                        : diagnosis.needs_clarification
                          ? 'Your response needs further explanation.'
                          : 'A possible conceptual misunderstanding was detected.'}
                    </p>
                  </div>
                </div>
                <span className="rounded border border-current bg-white/80 px-2.5 py-1 font-mono text-xs font-bold">
                  {diagnosis.is_correct ? 'CORRECT' : 'REVIEW'}
                </span>
              </div>

              <p className="text-sm text-[#4B5563]"><strong>Detected misconception:</strong> {diagnosis.misconception_label || 'Not identified'}</p>
              {diagnosis.evidence && <p className="text-sm text-[#4B5563]"><strong>Evidence:</strong> {diagnosis.evidence}</p>}
              {diagnosis.feedback && <p className="text-sm text-[#231F20]"><strong>Feedback:</strong> {diagnosis.feedback}</p>}
              {diagnosis.needs_clarification && diagnosis.clarifying_question && (
                <p className="text-sm text-[#3D5F58]"><strong>Clarifying question:</strong> {diagnosis.clarifying_question}</p>
              )}
              {diagnosis.followup_goal && (
                <p className="text-sm text-[#4B5563]"><strong>Next learning goal:</strong> {diagnosis.followup_goal}</p>
              )}

              {canShowFollowup && (
                <div className="space-y-3 rounded-lg border border-[#D8D8CF] bg-[#FAF9F5] p-4">
                  <h4 className="font-heading font-bold text-[#231F20]"><BookOpen className="mr-2 inline h-4 w-4" />Targeted Practice</h4>
                  {!showFollowup ? (
                    <button type="button" onClick={() => setShowFollowup(true)} className="rounded-md bg-[#3D5F58] px-4 py-2 text-sm font-bold text-white hover:bg-[#2E4742]">
                      Try Follow-up
                    </button>
                  ) : (
                    <>
                      <p className="text-sm text-[#231F20]">{exercise.followup_question}</p>
                      <input
                        type="text"
                        value={followupAnswer}
                        onChange={(event) => {
                          setFollowupAnswer(event.target.value)
                          setFollowupFeedback('')
                        }}
                        placeholder="Enter your answer..."
                        disabled={checkingFollowup}
                        className="w-full rounded-md border border-[#D8D8CF] bg-white p-3 font-mono text-sm text-[#231F20] focus:outline-none focus:ring-2 focus:ring-[#3D5F58]"
                      />
                      <button
                        type="button"
                        disabled={!followupAnswer.trim() || checkingFollowup}
                        onClick={handleFollowupSubmit}
                        className="inline-flex items-center gap-2 rounded-md bg-[#3D5F58] px-4 py-2 text-sm font-bold text-white hover:bg-[#2E4742] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {checkingFollowup && <Loader2 className="h-4 w-4 animate-spin" />}
                        {checkingFollowup ? 'Checking...' : 'Check Follow-up'}
                      </button>
                      {followupFeedback && <p className="text-sm font-medium text-[#3D5F58]">{followupFeedback}</p>}
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 rounded-lg border border-[#D8D8CF] bg-white p-8 text-center shadow-xs">
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#D8D8CF] bg-[#FAF9F5] text-[#3D5F58]">
                <Sparkles className="h-6 w-6 text-[#F5B726]" />
              </div>
              <div className="mx-auto max-w-sm">
                <h3 className="font-heading text-lg font-bold text-[#231F20]">Awaiting Your Answer</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#6B7280]">
                  Submit your answer to analyze your understanding, identify possible misconceptions, and receive targeted feedback.
                </p>
              </div>
              <div className="mx-auto max-w-sm space-y-2 rounded-md border border-[#E5E5DC] bg-[#FAF9F5] p-4 text-left text-xs text-[#4B5563]">
                <div className="font-mono font-bold uppercase text-[#3D5F58]">Diagnostic Features</div>
                <ul className="list-inside list-disc space-y-1">
                  <li>Detects zero-based vs one-based indexing confusion</li>
                  <li>Highlights common Python concept misconceptions</li>
                  <li>Analyzes student reasoning</li>
                  <li>Offers targeted follow-up practice</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

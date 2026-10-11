import { useEffect, useState } from 'react'
import {
  fetchPythonExercises,
  diagnosePythonAnswer,
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
  ArrowRight,
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

  useEffect(() => {
    let active = true

    async function loadExercises() {
      try {
        const data = await fetchPythonExercises()
        if (active) {
          setExercises(data || [])
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Could not load exercises from the server.')
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
    if (nextIndex < 0 || nextIndex >= exercises.length) return
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

    try {
      const result = await diagnosePythonAnswer({
        exampleId: exercise.example_id,
        question: exercise.question,
        correctAnswer: exercise.correct_answer || '',
        studentAnswer: answer.trim(),
        studentReasoning: reasoning.trim(),
      })
      setDiagnosis(result)
    } catch (err) {
      setError(
        err.message ||
          'Could not evaluate your answer. Please ensure the local Ollama server is running with qwen3:4b.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (loadingExercises) {
    return (
      <div className="card text-center p-12 space-y-3">
        <div className="icon-tile mx-auto">
          <Loader2 className="w-6 h-6 text-[var(--accent-primary)] animate-spin" />
        </div>
        <h3 className="font-heading text-xl font-bold text-[var(--text-main)]">
          Loading Python Exercises
        </h3>
        <p className="text-xs text-[var(--text-muted)] font-mono">
          Connecting to diagnostic database...
        </p>
      </div>
    )
  }

  if (!exercises.length) {
    return (
      <div className="card text-center p-10 space-y-4">
        <div className="icon-tile mx-auto text-[var(--danger)]">
          <AlertTriangle size={24} />
        </div>
        <h3 className="font-heading text-xl font-bold text-[var(--text-main)]">
          No Exercises Available
        </h3>
        <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
          {error || 'Could not retrieve exercises from the backend.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary btn-sm mx-auto"
        >
          Retry Connection
        </button>
      </div>
    )
  }

  const progressPercent = ((index + 1) / exercises.length) * 100

  return (
    <div className="reveal-stagger space-y-6">
      {/* Exercise Subtitle & Progress Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="eyebrow mb-1">
              Curriculum & Tools · Diagnostic Engine
            </div>
            <h1 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-[var(--text-main)]">
              Python Misconception Detector
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-2xl leading-relaxed">
              Type your answer or code freely. Our local Ollama AI evaluates mental models, diagnoses underlying misconceptions, and suggests tailored next learning goals.
            </p>
          </div>

          <div className="sm:text-right shrink-0 space-y-1.5">
            <div className="font-mono text-xs font-semibold text-[var(--text-muted)]">
              QUESTION <span className="text-[var(--text-main)] font-bold">{index + 1}</span> OF{' '}
              <span className="text-[var(--text-main)] font-bold">{exercises.length}</span>
            </div>
            <div className="progress w-44 sm:w-52">
              <span style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Layout (Desktop) / Stacked (Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question Panel & Controls */}
        <div className="lg:col-span-6 space-y-4">
          <div className="card space-y-4">
            {/* Header tags */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--border-soft)]">
              <span className="badge badge-forest flex items-center gap-1.5">
                <BookOpen size={12} />
                {exercise.topic ? exercise.topic.replaceAll('_', ' ') : 'PYTHON CONCEPT'}
              </span>
              <span className="badge badge-neutral">
                {exercise.example_id || `PY${String(index + 1).padStart(3, '0')}`}
              </span>
            </div>

            {/* Question Text */}
            <div>
              <span className="eyebrow text-xs mb-1">
                Exercise Prompt
              </span>
              <h2 className="font-heading text-base sm:text-lg font-bold text-[var(--text-main)] leading-snug">
                {exercise.question}
              </h2>
            </div>

            {/* Answer Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] mb-1.5">
                  Your Answer <span className="text-[var(--danger)]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter answer (e.g. 'a', [1, 2], or code snippet)..."
                    disabled={loading}
                    required
                    className="input font-mono text-sm pr-9"
                  />
                  <Terminal className="w-4 h-4 text-[var(--text-faint)] absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Explain Your Reasoning <span className="text-[11px] font-normal font-sans text-[var(--text-faint)]">(Helps AI diagnose cognitive traps)</span>
                </label>
                <textarea
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  placeholder="Why did you choose this answer? (e.g. 'Zero-based indexing places the first element at index 0')..."
                  rows={3}
                  disabled={loading}
                  className="textarea font-sans text-sm"
                />
              </div>

              {error && (
                <div className="alert alert-danger text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !answer.trim()}
                  className="btn btn-primary btn-lg w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Diagnosing with Local Ollama...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#F5B726]" />
                      Diagnose My Answer
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Navigation Controls */}
            <div className="pt-4 border-t border-[var(--border-soft)] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => moveToQuestion(index - 1)}
                disabled={index === 0 || loading}
                className="btn btn-secondary btn-sm"
              >
                <ChevronLeft size={15} />
                Previous Question
              </button>

              <button
                type="button"
                onClick={() => moveToQuestion(index + 1)}
                disabled={index === exercises.length - 1 || loading}
                className="btn btn-secondary btn-sm"
              >
                Next Question
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Result & Misconception Diagnosis Panel */}
        <div className="lg:col-span-6 space-y-4">
          {loading ? (
            <div className="card text-center p-10 space-y-4">
              <div className="icon-tile mx-auto">
                <BrainCircuit className="w-6 h-6 animate-pulse text-[var(--accent-primary)]" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-[var(--text-main)]">
                  Running Misconception Classifier
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-sans mt-1 max-w-sm mx-auto">
                  Parsing student answer and reasoning against verified Python language semantics and mental model traps...
                </p>
              </div>
              <div className="skeleton h-2 w-48 mx-auto mt-2" />
            </div>
          ) : diagnosis ? (
            <div className="card space-y-4">
              {/* Header Status Alert */}
              <div
                className={`alert ${
                  diagnosis.is_correct
                    ? 'alert-success'
                    : diagnosis.needs_clarification
                    ? 'alert-warning'
                    : 'alert-danger'
                } flex items-center justify-between`}
              >
                <div className="flex items-center gap-2.5">
                  {diagnosis.is_correct ? (
                    <CheckCircle className="w-5 h-5 shrink-0" />
                  ) : diagnosis.needs_clarification ? (
                    <HelpCircle className="w-5 h-5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-heading text-sm font-extrabold uppercase tracking-wide">
                      {diagnosis.is_correct
                        ? 'Correct Understanding'
                        : diagnosis.needs_clarification
                        ? 'Clarification Needed'
                        : 'Misconception Identified'}
                    </h3>
                    <p className="text-xs opacity-90 font-sans">
                      {diagnosis.is_correct
                        ? 'Your mental model aligns with Python language specifications.'
                        : diagnosis.needs_clarification
                        ? 'Your reasoning requires further elaboration.'
                        : 'A conceptual misalignment was detected in your reasoning.'}
                    </p>
                  </div>
                </div>

                <span className="badge badge-neutral text-[10px] ml-2 shrink-0">
                  {diagnosis.is_correct ? 'CORRECT' : 'NEEDS ATTENTION'}
                </span>
              </div>

              {/* Detected Misconception Field */}
              <div className="p-4 bg-[var(--bg-surface-elevated)] border border-[var(--border-soft)] rounded-md space-y-1">
                <span className="eyebrow text-[10px]">
                  Detected Misconception
                </span>
                <div className="font-heading text-base font-bold text-[var(--text-main)]">
                  {diagnosis.misconception_label ||
                    (diagnosis.is_correct ? 'None detected — accurate mental model' : 'General conceptual gap')}
                </div>
              </div>

              {/* Evidence Field */}
              <div className="p-4 bg-[var(--bg-surface-elevated)] border border-[var(--border-soft)] rounded-md space-y-1">
                <span className="eyebrow text-[10px]">
                  Evidence from Your Answer & Reasoning
                </span>
                <p className="text-xs font-mono text-[var(--text-body)] leading-relaxed">
                  {diagnosis.evidence || `Submitted answer: "${answer}".`}
                </p>
              </div>

              {/* Explanatory Feedback Field */}
              <div className="p-4 bg-[var(--bg-surface)] border-l-4 border-l-[var(--accent-primary)] border border-[var(--border-soft)] rounded-md space-y-1.5">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] flex items-center gap-1.5">
                  <BookOpen size={13} />
                  Concept Explanation & Feedback
                </span>
                <p className="text-xs text-[var(--text-body)] font-sans leading-relaxed">
                  {diagnosis.feedback || 'The Python interpreter evaluates this expression directly based on object semantics.'}
                </p>

                {diagnosis.needs_clarification && diagnosis.clarifying_question && (
                  <div className="mt-2.5 pt-2.5 border-t border-[var(--border-soft)]">
                    <span className="font-mono text-xs font-bold text-[var(--warning)] uppercase block mb-1">
                      Clarifying Question:
                    </span>
                    <div className="alert alert-warning text-xs p-2.5">
                      {diagnosis.clarifying_question}
                    </div>
                  </div>
                )}
              </div>

              {/* Next Learning Goal */}
              <div className="alert alert-info flex items-start gap-3">
                <Target size={18} className="shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider block">
                    Next Learning Goal
                  </span>
                  <p className="text-xs font-sans">
                    {diagnosis.followup_goal ||
                      (diagnosis.is_correct
                        ? `Advance to the next exercise (${exercises[index + 1]?.example_id || 'Advanced Concepts'})`
                        : 'Review index boundaries and practice with slicing rules.')}
                  </p>
                </div>
              </div>

              {/* Action to proceed to next question */}
              {index < exercises.length - 1 && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => moveToQuestion(index + 1)}
                    className="btn btn-secondary w-full"
                  >
                    <span>Proceed to Next Question ({exercises[index + 1]?.example_id})</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Empty State / Initial Prompt */
            <div className="card text-center p-8 space-y-4">
              <div className="icon-tile mx-auto">
                <Sparkles size={20} className="text-[#F5B726]" />
              </div>
              <div className="max-w-sm mx-auto">
                <h3 className="font-heading text-base font-bold text-[var(--text-main)]">
                  Awaiting Your Answer
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-sans mt-1.5 leading-relaxed">
                  Submit your answer on the left. The diagnostic engine will analyze your mental model, identify specific misconceptions, and provide targeted feedback.
                </p>
              </div>

              <div className="p-4 bg-[var(--bg-surface-elevated)] rounded-md border border-[var(--border-soft)] text-left text-xs text-[var(--text-body)] space-y-2 max-w-sm mx-auto">
                <div className="eyebrow text-[10px]">Diagnostic Features:</div>
                <ul className="list-disc list-inside space-y-1 text-xs text-[var(--text-muted)] font-sans">
                  <li>Detects zero-based vs one-based index confusion</li>
                  <li>Highlights slice boundary misconceptions</li>
                  <li>Distinguishes mutable list mutation vs reassignment</li>
                  <li>Prescribes tailored remedial follow-up goals</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

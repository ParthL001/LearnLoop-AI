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
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-8 text-center shadow-xs">
        <Loader2 className="w-8 h-8 text-[#3D5F58] animate-spin mb-3" />
        <h3 className="font-heading text-xl font-bold text-[#231F20]">Loading Python Exercises</h3>
        <p className="text-sm text-[#6B7280] font-sans">Connecting to exercise database...</p>
      </div>
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
      {/* Exercise Subtitle & Progress Header */}
      <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#F5B726]"></span>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#3D5F58]">
                Curriculum & Tools · Python Practice
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#231F20]">
              Python Misconception Detector
            </h1>
            <p className="text-sm text-[#4B5563] mt-0.5">
              Type your code or answer freely. Our local AI diagnoses mental models, flags edge-case misconceptions, and prescribes next steps.
            </p>
          </div>

          <div className="sm:text-right shrink-0">
            <div className="font-mono text-xs font-semibold text-[#6B7280] mb-1.5">
              QUESTION <span className="text-[#231F20] font-bold">{index + 1}</span> OF{' '}
              <span className="text-[#231F20] font-bold">{exercises.length}</span>
            </div>
            <div className="w-40 sm:w-48 h-2 bg-[#F2F2EB] border border-[#D8D8CF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3D5F58] transition-all duration-300"
                style={{ width: `${((index + 1) / exercises.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Layout (Desktop) / Stacked (Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question Panel & Controls */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-6 shadow-xs relative">
            <div className="flex items-center justify-between gap-3 border-b border-[#D8D8CF] pb-3 mb-4">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider bg-[#F2F2EB] text-[#3D5F58] px-2.5 py-1 rounded border border-[#D8D8CF]">
                <BookOpen size={12} />
                {exercise.topic ? exercise.topic.replaceAll('_', ' ') : 'PYTHON CONCEPT'}
              </span>
              <span className="font-mono text-xs font-bold text-[#6B7280] bg-[#FAF9F5] px-2 py-0.5 rounded border border-[#E5E5DC]">
                {exercise.example_id || `PY${String(index + 1).padStart(3, '0')}`}
              </span>
            </div>

            {/* Question Text */}
            <div className="mb-6">
              <h2 className="font-heading text-lg sm:text-xl font-bold text-[#231F20] leading-snug">
                {exercise.question}
              </h2>
            </div>

            {/* Answer Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#3D5F58] mb-1.5">
                  Your Answer <span className="text-[#E97B77]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter your exact answer or code..."
                    disabled={loading}
                    required
                    className="w-full bg-[#FAF9F5] text-[#231F20] placeholder-[#9CA3AF] border border-[#D8D8CF] rounded-md px-3.5 py-2.5 font-mono text-sm focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#3D5F58] focus:border-[#3D5F58] transition"
                  />
                  <Terminal className="w-4 h-4 text-[#9CA3AF] absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#4B5563] mb-1.5">
                  Explain Your Reasoning <span className="text-xs font-normal text-[#9CA3AF] font-sans">(Helps AI detect subtle misconceptions)</span>
                </label>
                <textarea
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  placeholder="Why did you choose this answer? (e.g. 'I thought list indices start at 1' or 'The slice excludes the stop index')..."
                  rows={3}
                  disabled={loading}
                  className="w-full bg-[#FAF9F5] text-[#231F20] placeholder-[#9CA3AF] border border-[#D8D8CF] rounded-md p-3 font-sans text-sm focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#3D5F58] focus:border-[#3D5F58] transition"
                />
              </div>

              {error && (
                <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs rounded-md flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !answer.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#3D5F58] text-white font-sans font-bold text-sm rounded-md shadow-xs hover:bg-[#2E4742] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Analyzing with Local Ollama AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#F5B726]" />
                      Diagnose My Answer
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Navigation Controls */}
            <div className="border-t border-[#D8D8CF] mt-6 pt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => moveToQuestion(index - 1)}
                disabled={index === 0 || loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#D8D8CF] rounded-md text-xs font-mono font-bold text-[#231F20] bg-[#FFFFFF] hover:bg-[#F2F2EB] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={14} />
                Previous Question
              </button>

              <button
                type="button"
                onClick={() => moveToQuestion(index + 1)}
                disabled={index === exercises.length - 1 || loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#D8D8CF] rounded-md text-xs font-mono font-bold text-[#231F20] bg-[#FFFFFF] hover:bg-[#F2F2EB] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next Question
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Result & Misconception Diagnosis Panel */}
        <div className="lg:col-span-6 space-y-4">
          {loading ? (
            <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-8 shadow-xs text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F2F2EB] border border-[#D8D8CF] text-[#3D5F58]">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-[#231F20]">Running Misconception Classifier</h3>
                <p className="text-xs text-[#6B7280] font-sans mt-1">
                  Parsing student answer & reasoning against verified Python mental models...
                </p>
              </div>
            </div>
          ) : diagnosis ? (
            <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-6 shadow-xs space-y-5">
              {/* Header Status Bar */}
              <div
                className={`p-4 rounded-md border flex items-center justify-between gap-3 ${diagnosis.is_correct
                    ? 'bg-[#F0FDF4] border-[#86EFAC] text-[#166534]'
                    : diagnosis.needs_clarification
                      ? 'bg-[#FEFCE8] border-[#FDE047] text-[#854D0E]'
                      : 'bg-[#FFF1F2] border-[#FECDD3] text-[#9F1239]'
                  }`}
              >
                <div className="flex items-center gap-3">
                  {diagnosis.is_correct ? (
                    <CheckCircle className="w-6 h-6 text-[#16A34A] shrink-0" />
                  ) : diagnosis.needs_clarification ? (
                    <HelpCircle className="w-6 h-6 text-[#CA8A04] shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-[#E11D48] shrink-0" />
                  )}
                  <div>
                    <h3 className="font-heading text-base font-extrabold uppercase tracking-wide">
                      {diagnosis.is_correct
                        ? 'Correct Understanding'
                        : diagnosis.needs_clarification
                          ? 'Needs Clarification'
                          : 'Misconception Identified'}
                    </h3>
                    <p className="text-xs opacity-90 font-sans">
                      {diagnosis.is_correct
                        ? 'Your mental model aligns with Python language specifications.'
                        : diagnosis.needs_clarification
                          ? 'Your response was ambiguous or requires further elaboration.'
                          : 'A conceptual misalignment was detected in your reasoning.'}
                    </p>
                  </div>
                </div>

                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-white/80 border border-current">
                  {diagnosis.is_correct ? 'CORRECT' : 'NEEDS ATTENTION'}
                </span>
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
              )}
      </div>
      ) : (
      /* Empty State / Initial Prompt */
      <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-8 shadow-xs text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FAF9F5] border border-[#D8D8CF] text-[#6B7280]">
          <Sparkles className="w-6 h-6 text-[#F5B726]" />
        </div>
        <div className="max-w-sm mx-auto">
          <h3 className="font-heading text-lg font-bold text-[#231F20]">Awaiting Your Answer</h3>
          <p className="text-xs text-[#6B7280] font-sans mt-1.5 leading-relaxed">
            Enter your answer on the left and submit. The diagnostic engine will analyze your mental model, identify specific misconceptions, and provide targeted feedback.
          </p>
        </div>

        <div className="p-4 bg-[#FAF9F5] rounded-md border border-[#E5E5DC] text-left text-xs text-[#4B5563] space-y-2 max-w-sm mx-auto">
          <div className="font-mono font-bold text-[#3D5F58] uppercase">Diagnostic Features:</div>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Detects zero-based vs one-based index confusion</li>
            <li>Highlights slice boundary misconceptions</li>
            <li>Distinguishes mutable list mutation vs reassignment</li>
            <li>Offers tailored remedial follow-up goals</li>
          </ul>
        </div>
      </div>
          )}
    </div>
      </div >
    </div >
  )
}

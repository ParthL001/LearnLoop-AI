import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Button, Badge } from '../components/UI'
import { useApp } from '../context/AppContext'
import { practiceQuestions as fallbackQuestions } from '../services/mockData'
import {
  analyzeMisconception,
  fetchPracticeQuestions,
  fetchNextAdaptiveQuestion
} from '../services/api'
import { MessageSquare, CheckCircle, AlertTriangle, ArrowRight, Loader2, RotateCcw } from 'lucide-react'

export default function Practice() {
  const { id } = useParams()
  const { recordPracticeResult, mastery, user } = useApp()
  const [questions, setQuestions] = useState(fallbackQuestions)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState(null)
  const [reasoning, setReasoning] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [evalError, setEvalError] = useState(null)
  const [evaluationResult, setEvaluationResult] = useState(null)

  // Load questions from backend API if available
  useEffect(() => {
    let active = true
    fetchPracticeQuestions()
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          // Format questions safely
          const mapped = data.map((q) => ({
            id: q.id,
            conceptId: q.conceptId,
            concept: q.conceptTitle || q.conceptId,
            question: q.prompt,
            options: q.options,
            topicId: q.conceptId,
            // Note: correctIndex and explanation are kept on backend and not present in public questions
          }))
          setQuestions(mapped)
        }
      })
      .catch(() => {
        // Retain verified fallback questions
      })
    return () => {
      active = false
    }
  }, [])

  const question = questions[currentIdx] || questions[0] || fallbackQuestions[0]
  const isCorrect = evaluationResult ? evaluationResult.isCorrect : false
  const misconception = evaluationResult?.detectedMisconception

  const handleSubmit = async () => {
    if (selectedOpt === null || evaluating || submitted) return

    setEvaluating(true)
    setEvalError(null)

    try {
      const result = await analyzeMisconception({
        questionId: question.id,
        selectedAnswerIndex: selectedOpt,
        studentReasoning: reasoning,
        topicId: question.conceptId || question.topicId || 'fractions',
        learnerId: user?.id || user?.email || 'learner-local'
      })

      setEvaluationResult(result)
      setSubmitted(true)

      // Dynamically update real-time mastery and misconception log
      recordPracticeResult({
        questionId: question.id,
        isCorrect: result.isCorrect,
        reasoning,
        misconception: result.detectedMisconception
          ? {
              title: result.detectedMisconception.name,
              explanation: result.detectedMisconception.description,
              suggestion: result.remediationAdvice
            }
          : null
      })
    } catch (err) {
      setEvalError(err.message || 'Unable to connect to diagnostic engine. Please try again.')
    } finally {
      setEvaluating(false)
    }
  }

  const handleNext = async () => {
    setSubmitted(false)
    setSelectedOpt(null)
    setReasoning('')
    setEvaluationResult(null)
    setEvalError(null)

    // Attempt adaptive follow-up selection from backend
    try {
      const nextAdaptive = await fetchNextAdaptiveQuestion({
        conceptId: question.conceptId,
        attemptedQuestionIds: [question.id],
        lastMisconception: evaluationResult?.detectedMisconception?.name
      })

      if (nextAdaptive?.question) {
        const nextQ = {
          id: nextAdaptive.question.id,
          conceptId: nextAdaptive.question.conceptId,
          concept: nextAdaptive.question.conceptTitle || nextAdaptive.question.conceptId,
          question: nextAdaptive.question.prompt,
          options: nextAdaptive.question.options,
          topicId: nextAdaptive.question.conceptId
        }

        // Check if question exists in current set or append
        const foundIndex = questions.findIndex((q) => q.id === nextQ.id)
        if (foundIndex >= 0) {
          setCurrentIdx(foundIndex)
          return
        }
      }
    } catch {
      // Fallback to sequential progression
    }

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1)
    } else {
      setCurrentIdx(0)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#0f172a]">Targeted Practice</h2>
              <Badge variant="accent">
                Question {currentIdx + 1} of {questions.length}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-[#64748b]">
              Answer the prompt and write your step-by-step thinking so the adaptive diagnostic engine can evaluate your mental model.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#64748b]">
              Topic Mastery: <strong className="text-[#2563eb]">{mastery?.[question.topicId || 'fractions'] || 68}%</strong>
            </span>
            <Link to="/tutor">
              <Button size="sm" variant="secondary">
                <MessageSquare size={13} />
                <span>Discuss with Tutor</span>
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Main Question Card */}
      <Card
        header={
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#64748b] uppercase tracking-wider">
              Concept: {question.concept}
            </span>
            <span className="text-[#0f172a] font-medium">Standard Diagnostic Probe</span>
          </div>
        }
      >
        <h3 className="text-sm font-bold text-[#0f172a] leading-relaxed">
          {question.question}
        </h3>

        {/* Options */}
        <div className="mt-5 space-y-2.5">
          {question.options.map((option, idx) => {
            const isSelected = selectedOpt === idx
            const optionCorrect = submitted && isSelected && isCorrect
            const optionWrongSelected = submitted && isSelected && !isCorrect

            let borderStyle = 'border-[#cbd5e1] bg-white text-[#0f172a] hover:bg-[#f8fafc]'
            if (isSelected && !submitted) {
              borderStyle = 'border-[#2563eb] bg-[#eff6ff] text-[#1e3a8a] font-semibold'
            } else if (optionCorrect) {
              borderStyle = 'border-[#059669] bg-[#ecfdf5] text-[#065f46] font-semibold'
            } else if (optionWrongSelected) {
              borderStyle = 'border-[#dc2626] bg-[#fef2f2] text-[#991b1b]'
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={submitted || evaluating}
                onClick={() => setSelectedOpt(idx)}
                className={`w-full text-left p-3 rounded-[5px] border text-xs flex items-center justify-between gap-3 transition-colors ${borderStyle}`}
              >
                <span>{option}</span>
                <span className="text-[10px] uppercase font-bold text-[#64748b]">
                  Option {String.fromCharCode(65 + idx)}
                </span>
              </button>
            )
          })}
        </div>

        {/* Reasoning Textarea */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-[#0f172a] mb-1">
            Student Reasoning (Used to isolate root causes versus random slips)
          </label>
          <textarea
            rows={2}
            value={reasoning}
            disabled={submitted || evaluating}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Explain how you reached your answer and what rule you applied..."
            className="w-full text-xs p-3 rounded-[5px] border border-[#cbd5e1] bg-white text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none disabled:bg-[#f1f5f9]"
          />
        </div>

        {/* Error Alert with Retry */}
        {evalError && (
          <div className="mt-4 p-3 rounded-[5px] border border-[#fecaca] bg-[#fef2f2] text-xs text-[#991b1b] flex items-center justify-between gap-2">
            <span>{evalError}</span>
            <Button size="sm" variant="secondary" onClick={handleSubmit} disabled={evaluating}>
              <RotateCcw size={12} />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* Feedback Section */}
        {submitted && evaluationResult && (
          <div className="mt-5 p-4 rounded-[5px] border border-[#e2e8f0] bg-[#f8fafc] text-xs">
            {isCorrect ? (
              <div className="text-[#065f46] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle size={15} />
                  <span>Correct Reasoning Verified</span>
                </div>
                <p className="text-[#047857]">
                  {evaluationResult.feedback || 'Great job! Your answer and conceptual steps are mathematically sound.'}
                </p>
                <p className="text-[11px] text-[#065f46] pt-1 font-semibold">
                  Mastery level calibrated and saved to your active profile.
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-[#991b1b]">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle size={15} />
                  <span>
                    {misconception ? 'Misconception Identified' : 'Answer Requires Review'}
                  </span>
                </div>
                {misconception ? (
                  <div className="space-y-1 text-[#7f1d1d]">
                    <p className="font-semibold text-xs text-[#991b1b]">{misconception.name}</p>
                    <p>{misconception.description}</p>
                    {evaluationResult.remediationAdvice && (
                      <div className="mt-2 pt-2 border-t border-[#fecaca] text-[#0f172a]">
                        <span className="font-semibold">Targeted Recommendation: </span>
                        {evaluationResult.remediationAdvice}
                      </div>
                    )}
                  </div>
                ) : (
                  <p>{evaluationResult.feedback || 'Review the partition sizes in the lesson before moving forward.'}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-[#e2e8f0] flex items-center justify-between">
          <span className="text-xs text-[#64748b]">
            {submitted
              ? 'Diagnosis updated dynamically'
              : evaluating
              ? 'Evaluating reasoning with backend engine...'
              : 'Select an option to evaluate'}
          </span>
          {!submitted ? (
            <Button
              variant="primary"
              disabled={selectedOpt === null || evaluating}
              onClick={handleSubmit}
            >
              {evaluating ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <span>Check Answer</span>
              )}
            </Button>
          ) : (
            <Button variant="primary" onClick={handleNext}>
              <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'Restart Set'}</span>
              <ArrowRight size={13} />
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

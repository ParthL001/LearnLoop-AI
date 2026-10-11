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
              <h2 className="text-base font-bold text-[#F8FAFC]">Targeted Practice</h2>
              <Badge variant="accent">
                Question {currentIdx + 1} of {questions.length}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-[#A8B3C4]">
              Answer the prompt and write your step-by-step thinking so the adaptive diagnostic engine can evaluate your mental model.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#A8B3C4]">
              Topic Mastery: <strong className="text-[#3B82F6]">{mastery?.[question.topicId || 'fractions'] || 68}%</strong>
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
            <span className="font-semibold text-[#7F8A9B] uppercase tracking-wider">
              Concept: {question.concept}
            </span>
            <span className="text-[#A8B3C4] font-medium">Standard Diagnostic Probe</span>
          </div>
        }
      >
        <h3 className="text-sm font-bold text-[#F8FAFC] leading-relaxed">
          {question.question}
        </h3>

        {/* Options */}
        <div className="mt-5 space-y-2.5">
          {question.options.map((option, idx) => {
            const isSelected = selectedOpt === idx
            const optionCorrect = submitted && isSelected && isCorrect
            const optionWrongSelected = submitted && isSelected && !isCorrect

            let borderStyle = 'border-[#303846] bg-[#1B2028] text-[#F8FAFC] hover:bg-[#202733] hover:border-[#3B82F6]'
            if (isSelected && !submitted) {
              borderStyle = 'border-[#3B82F6] bg-[#152746] text-[#F8FAFC] font-semibold'
            } else if (optionCorrect) {
              borderStyle = 'border-[#166534] bg-[#14291E] text-[#22C55E] font-semibold'
            } else if (optionWrongSelected) {
              borderStyle = 'border-[#991B1B] bg-[#2A1618] text-[#EF4444]'
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={submitted || evaluating}
                onClick={() => setSelectedOpt(idx)}
                className={`w-full text-left p-3 rounded-[6px] border text-xs flex items-center justify-between gap-3 transition-colors ${borderStyle}`}
              >
                <span>{option}</span>
                <span className="text-[10px] uppercase font-bold text-[#7F8A9B]">
                  Option {String.fromCharCode(65 + idx)}
                </span>
              </button>
            )
          })}
        </div>

        {/* Reasoning Textarea */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
            Student Reasoning (Used to isolate root causes versus random slips)
          </label>
          <textarea
            rows={2}
            value={reasoning}
            disabled={submitted || evaluating}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Explain how you reached your answer and what rule you applied..."
            className="w-full text-xs p-3 rounded-[6px] border border-[#303846] bg-[#1B2028] text-[#F8FAFC] placeholder:text-[#7F8A9B] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] outline-none disabled:bg-[#14171C] disabled:text-[#7F8A9B]"
          />
        </div>

        {/* Error Alert with Retry */}
        {evalError && (
          <div className="mt-4 p-3 rounded-[6px] border border-[#991B1B] bg-[#2A1618] text-xs text-[#EF4444] flex items-center justify-between gap-2">
            <span>{evalError}</span>
            <Button size="sm" variant="secondary" onClick={handleSubmit} disabled={evaluating}>
              <RotateCcw size={12} />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* Feedback Section */}
        {submitted && evaluationResult && (
          <div className="mt-5 p-4 rounded-[6px] border border-[#303846] bg-[#1B2028] text-xs">
            {isCorrect ? (
              <div className="text-[#22C55E] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle size={15} />
                  <span>Correct Reasoning Verified</span>
                </div>
                <p className="text-[#86EFAC]">
                  {evaluationResult.feedback || 'Great job! Your answer and conceptual steps are mathematically sound.'}
                </p>
                <p className="text-[11px] text-[#22C55E] pt-1 font-semibold">
                  Mastery level calibrated and saved to your active profile.
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-[#EF4444]">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle size={15} />
                  <span>
                    {misconception ? 'Misconception Identified' : 'Answer Requires Review'}
                  </span>
                </div>
                {misconception ? (
                  <div className="space-y-1 text-[#FCA5A5]">
                    <p className="font-semibold text-xs text-[#EF4444]">{misconception.name}</p>
                    <p>{misconception.description}</p>
                    {evaluationResult.remediationAdvice && (
                      <div className="mt-2 pt-2 border-t border-[#78350F] text-[#F8FAFC]">
                        <span className="font-semibold text-[#FDE68A]">Targeted Recommendation: </span>
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
        <div className="mt-6 pt-4 border-t border-[#303846] flex items-center justify-between">
          <span className="text-xs text-[#7F8A9B]">
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

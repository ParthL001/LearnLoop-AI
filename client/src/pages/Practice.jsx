import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Button, Badge } from '../components/UI'
import { useApp } from '../context/AppContext'
import { practiceQuestions } from '../services/mockData'
import { MessageSquare, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react'

export default function Practice() {
  const { id } = useParams()
  const { recordPracticeResult, mastery } = useApp()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState(null)
  const [reasoning, setReasoning] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const question = practiceQuestions[currentIdx] || practiceQuestions[0]
  const isCorrect = selectedOpt === question.correctIndex
  const misconception = question.misconceptionTags?.[selectedOpt]

  const handleSubmit = () => {
    if (selectedOpt === null) return
    setSubmitted(true)

    // Dynamically update real-time mastery and misconception log
    recordPracticeResult({
      questionId: question.id,
      isCorrect,
      reasoning,
      misconception
    })
  }

  const handleNext = () => {
    if (currentIdx < practiceQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1)
      setSelectedOpt(null)
      setReasoning('')
      setSubmitted(false)
    } else {
      setCurrentIdx(0)
      setSelectedOpt(null)
      setReasoning('')
      setSubmitted(false)
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
                Question {currentIdx + 1} of {practiceQuestions.length}
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
            const optionCorrect = submitted && idx === question.correctIndex
            const optionWrongSelected = submitted && isSelected && !optionCorrect

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
                disabled={submitted}
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
            disabled={submitted}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Explain how you reached your answer and what rule you applied..."
            className="w-full text-xs p-3 rounded-[5px] border border-[#cbd5e1] bg-white text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none disabled:bg-[#f1f5f9]"
          />
        </div>

        {/* Feedback Section */}
        {submitted && (
          <div className="mt-5 p-4 rounded-[5px] border border-[#e2e8f0] bg-[#f8fafc] text-xs">
            {isCorrect ? (
              <div className="text-[#065f46] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle size={15} />
                  <span>Correct Reasoning Verified</span>
                </div>
                <p className="text-[#047857]">{question.explanation}</p>
                <p className="text-[11px] text-[#065f46] pt-1 font-semibold">
                  Mastery level calibrated and saved to your active profile.
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-[#991b1b]">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle size={15} />
                  <span>Misconception Identified</span>
                </div>
                {misconception ? (
                  <div className="space-y-1 text-[#7f1d1d]">
                    <p className="font-semibold text-xs text-[#991b1b]">{misconception.title}</p>
                    <p>{misconception.explanation}</p>
                    <div className="mt-2 pt-2 border-t border-[#fecaca] text-[#0f172a]">
                      <span className="font-semibold">Targeted Recommendation: </span>
                      {misconception.suggestion}
                    </div>
                  </div>
                ) : (
                  <p>{question.explanation}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-[#e2e8f0] flex items-center justify-between">
          <span className="text-xs text-[#64748b]">
            {submitted ? 'Diagnosis updated dynamically' : 'Select an option to evaluate'}
          </span>
          {!submitted ? (
            <Button
              variant="primary"
              disabled={selectedOpt === null}
              onClick={handleSubmit}
            >
              Check Answer
            </Button>
          ) : (
            <Button variant="primary" onClick={handleNext}>
              <span>{currentIdx < practiceQuestions.length - 1 ? 'Next Question' : 'Restart Set'}</span>
              <ArrowRight size={13} />
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

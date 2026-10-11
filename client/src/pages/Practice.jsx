import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Button, Badge } from '../components/UI'
import { useApp } from '../context/AppContext'
import { practiceQuestions } from '../services/mockData'

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
              <h2 className="text-base font-bold text-[#181816]">Targeted Practice</h2>
              <Badge variant="accent">
                Question {currentIdx + 1} of {practiceQuestions.length}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-[#575753]">
              Answer the prompt and write your step-by-step thinking so Cognara can diagnose your mental model.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#797973]">
              Current Mastery: <strong className="text-[#3730a3]">{mastery?.[question.topicId || 'fractions'] || 68}%</strong>
            </span>
            <Link to="/tutor">
              <Button size="sm" variant="secondary">Discuss with Tutor</Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Main Question Card */}
      <Card
        header={
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#797973] uppercase tracking-wider">
              Concept: {question.concept}
            </span>
            <span className="text-[#181816] font-medium">Standard Diagnostic Item</span>
          </div>
        }
      >
        <h3 className="text-sm font-bold text-[#181816] leading-relaxed">
          {question.question}
        </h3>

        {/* Options */}
        <div className="mt-5 space-y-2.5">
          {question.options.map((option, idx) => {
            const isSelected = selectedOpt === idx
            const optionCorrect = submitted && idx === question.correctIndex
            const optionWrongSelected = submitted && isSelected && !optionCorrect

            let borderStyle = 'border-[#d4d4cf] bg-white text-[#181816] hover:bg-[#f9f9f7]'
            if (isSelected && !submitted) {
              borderStyle = 'border-[#3730a3] bg-[#eef2ff] text-[#1e1b4b] font-semibold'
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
                className={`w-full text-left p-3 rounded-[4px] border text-xs flex items-center justify-between gap-3 transition-colors ${borderStyle}`}
              >
                <span>{option}</span>
                <span className="text-[10px] uppercase font-bold text-[#797973]">
                  Option {String.fromCharCode(65 + idx)}
                </span>
              </button>
            )
          })}
        </div>

        {/* Reasoning Textarea */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-[#181816] mb-1">
            Student Reasoning (Helps detect underlying misconceptions)
          </label>
          <textarea
            rows={2}
            value={reasoning}
            disabled={submitted}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Explain how you reached your answer..."
            className="w-full text-xs p-3 rounded-[4px] border border-[#d4d4cf] bg-white text-[#181816] placeholder:text-[#999992] focus:border-[#3730a3] focus:ring-1 focus:ring-[#3730a3] outline-none disabled:bg-[#f2f2ef]"
          />
        </div>

        {/* Feedback Section */}
        {submitted && (
          <div className="mt-5 p-4 rounded-[4px] border border-[#e3e3df] bg-[#fbfbfa] text-xs">
            {isCorrect ? (
              <div className="text-[#065f46] space-y-1">
                <p className="font-bold">Correct Reasoning Verified</p>
                <p className="text-[#047857]">{question.explanation}</p>
                <p className="text-[11px] text-[#065f46] pt-1 font-semibold">
                  +6% mastery recorded dynamically to your learning profile!
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-[#991b1b]">
                <p className="font-bold">Misconception Identified</p>
                {misconception ? (
                  <div className="space-y-1 text-[#7f1d1d]">
                    <p className="font-semibold text-xs text-[#991b1b]">{misconception.title}</p>
                    <p>{misconception.explanation}</p>
                    <div className="mt-2 pt-2 border-t border-[#fecaca] text-[#181816]">
                      <span className="font-semibold">Remediation: </span>
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
        <div className="mt-6 pt-4 border-t border-[#e3e3df] flex items-center justify-between">
          <span className="text-xs text-[#797973]">
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
              {currentIdx < practiceQuestions.length - 1 ? 'Next Question' : 'Restart Practice'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

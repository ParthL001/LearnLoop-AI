import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2, CircleAlert, Sparkles, HelpCircle,
  Lightbulb, ArrowRight, Brain, RotateCcw, MessageSquare
} from 'lucide-react'

export default function QuestionCard({
  question,
  onAnswerSubmit,
  onNextQuestion,
  isLast = false
}) {
  const [selectedOption, setSelectedOption] = useState(null)
  const [reasoning, setReasoning] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [analysis, setAnalysis] = useState(null)

  const handleSelect = (index) => {
    if (submitted) return
    setSelectedOption(index)
  }

  const handleSubmit = () => {
    if (selectedOption === null) return
    const isCorrect = selectedOption === question.correctIndex
    const misconception = question.misconceptionTags?.[selectedOption] || null

    const result = {
      isCorrect,
      selectedOption,
      reasoning,
      misconception
    }

    setSubmitted(true)
    setAnalysis(result)
    if (onAnswerSubmit) onAnswerSubmit(result)
  }

  const handleReset = () => {
    setSelectedOption(null)
    setReasoning('')
    setSubmitted(false)
    setAnalysis(null)
    setShowHint(false)
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_2px_16px_rgba(24,35,59,0.04)] sm:p-8">
      {/* Concept Badge & Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-extrabold text-violet-700">
            {question.concept || 'Concept Check'}
          </span>
          <span className="text-xs text-slate-400">· Adaptive Practice</span>
        </div>
        {question.hint && (
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 transition hover:text-violet-800"
          >
            <Lightbulb size={14} />
            <span>{showHint ? 'Hide hint' : 'Need a hint?'}</span>
          </button>
        )}
      </div>

      {/* Hint Alert */}
      {showHint && question.hint && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5 text-xs leading-relaxed text-amber-900">
          <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <span className="font-bold">Pedagogical nudge: </span>
            {question.hint}
          </div>
        </div>
      )}

      {/* Question Prompt */}
      <h2 className="mt-5 text-lg font-extrabold leading-snug text-[#18233b] sm:text-xl">
        {question.question}
      </h2>

      {/* Options List */}
      <div className="mt-6 space-y-3">
        {question.options.map((opt, index) => {
          const isSelected = selectedOption === index
          const isCorrect = submitted && index === question.correctIndex
          const isWrongSelected = submitted && isSelected && !isCorrect

          let optionStyle = 'border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-slate-50/70'
          if (isSelected && !submitted) {
            optionStyle = 'border-violet-600 bg-violet-50/80 text-violet-950 ring-2 ring-violet-200'
          } else if (isCorrect) {
            optionStyle = 'border-emerald-500 bg-emerald-50/90 text-emerald-950 font-bold'
          } else if (isWrongSelected) {
            optionStyle = 'border-rose-400 bg-rose-50/80 text-rose-950'
          }

          return (
            <button
              key={index}
              type="button"
              disabled={submitted}
              onClick={() => handleSelect(index)}
              className={`flex w-full items-center gap-3.5 rounded-xl border p-4 text-left text-sm transition ${optionStyle}`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border text-xs font-black transition ${
                  isSelected && !submitted
                    ? 'border-violet-600 bg-violet-600 text-white'
                    : isCorrect
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : isWrongSelected
                    ? 'border-rose-600 bg-rose-600 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1 leading-relaxed">{opt}</span>
              {isCorrect && <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />}
              {isWrongSelected && <CircleAlert size={18} className="shrink-0 text-rose-500" />}
            </button>
          )
        })}
      </div>

      {/* Student Reasoning Textarea (Misconception detection engine trigger) */}
      <div className="mt-6">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
          How did you decide? <span className="font-normal lowercase text-slate-400">(optional — helps AI detect misconceptions)</span>
        </label>
        <textarea
          rows={2}
          value={reasoning}
          disabled={submitted}
          onChange={(e) => setReasoning(e.target.value)}
          placeholder="E.g., I compared the bottom numbers because 5 is greater than 3..."
          className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-xs leading-relaxed text-slate-800 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50 disabled:text-slate-500"
        />
      </div>

      {/* Analysis Feedback Callout */}
      {submitted && (
        <div className="mt-6 space-y-4">
          {analysis?.isCorrect ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-emerald-950">
              <div className="flex items-center gap-2 font-black text-emerald-800">
                <CheckCircle2 size={19} className="text-emerald-600" />
                <span>Concept Confirmed — Sound Reasoning</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-emerald-900/90">
                {question.explanation}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-amber-950">
              <div className="flex items-center gap-2 font-black text-amber-900">
                <Brain size={19} className="text-amber-700" />
                <span>Cognara Misconception Diagnosis</span>
              </div>

              {analysis?.misconception ? (
                <div className="mt-2.5 space-y-2">
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-200/60 px-2.5 py-1 text-[11px] font-extrabold text-amber-900">
                    <Sparkles size={12} />
                    <span>Hypothesis: {analysis.misconception.title}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-amber-900/90">
                    {analysis.misconception.explanation}
                  </p>
                  <div className="rounded-xl border border-amber-200/80 bg-white/80 p-3 text-xs text-amber-950">
                    <span className="font-bold text-amber-800">Targeted remediation: </span>
                    {analysis.misconception.suggestion}
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-xs leading-relaxed text-amber-900/90">
                  {question.explanation}
                </p>
              )}

              {/* Action to discuss directly with AI Tutor */}
              <div className="mt-4 flex flex-wrap items-center gap-2 pt-2">
                <Link
                  to={`/tutor/${question.topicId || 'fractions'}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-violet-700"
                >
                  <MessageSquare size={13} />
                  <span>Unpack this with AI Tutor</span>
                </Link>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw size={13} />
                  <span>Try again</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
        <span className="text-xs text-slate-400">
          Step evidence recorded locally
        </span>

        {!submitted ? (
          <button
            type="button"
            disabled={selectedOption === null}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>Verify Reasoning</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onNextQuestion || handleReset}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-slate-800"
          >
            <span>{isLast ? 'Complete Session' : 'Next Question'}</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

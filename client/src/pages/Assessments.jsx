import { useState, useEffect } from 'react'
import { Card, Button, Badge } from '../components/UI'
import { useApp } from '../context/AppContext'
import {
  fetchAssessment,
  submitAssessment,
  fetchAssessmentResults,
  fetchCohortAssessmentReport
} from '../services/api'
import { CheckCircle, ArrowLeft, ArrowRight, Loader2, RotateCcw, AlertTriangle } from 'lucide-react'

export default function Assessments() {
  const { user } = useApp()
  const learnerId = user?.id || user?.email || 'learner-local'

  const [activeTest, setActiveTest] = useState(null) // 'pre' | 'post' | null
  const [testData, setTestData] = useState(null)
  const [loadingTest, setLoadingTest] = useState(false)
  const [testError, setTestError] = useState(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({}) // { [qId]: selectedIndex }
  const [reasonings, setReasonings] = useState({}) // { [qId]: text }
  const [submitting, setSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState(null)

  // Live reports
  const [learnerReport, setLearnerReport] = useState(null)
  const [cohortReport, setCohortReport] = useState(null)

  const loadReports = () => {
    fetchAssessmentResults(learnerId).then((r) => r && setLearnerReport(r)).catch(() => {})
    fetchCohortAssessmentReport().then((c) => c && setCohortReport(c)).catch(() => {})
  }

  useEffect(() => {
    loadReports()
  }, [learnerId])

  const handleStartTest = async (type) => {
    setActiveTest(type)
    setLoadingTest(true)
    setTestError(null)
    setSubmissionResult(null)
    setCurrentIdx(0)
    setAnswers({})
    setReasonings({})

    try {
      const data = await fetchAssessment(type)
      if (data && data.questions) {
        setTestData(data)
      } else {
        throw new Error('Unable to load assessment questions from backend.')
      }
    } catch (err) {
      setTestError(err.message || 'Failed to load assessment.')
    } finally {
      setLoadingTest(false)
    }
  }

  const handleAnswerSelect = (qId, optionIdx) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }))
  }

  const handleReasoningChange = (qId, text) => {
    setReasonings((prev) => ({ ...prev, [qId]: text }))
  }

  const handleSubmitAssessment = async () => {
    if (submitting) return
    setSubmitting(true)
    setTestError(null)

    try {
      const itemResponses = (testData?.questions || []).map((q) => ({
        questionId: q.id,
        selectedAnswerIndex: answers[q.id] !== undefined ? answers[q.id] : null,
        studentReasoning: reasonings[q.id] || ''
      }))

      const result = await submitAssessment({
        learnerId,
        type: activeTest,
        itemResponses
      })

      setSubmissionResult(result)
      loadReports()
    } catch (err) {
      setTestError(err.message || 'Submission failed. Please check your answers and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Active Test Taker UI
  if (activeTest && testData) {
    const qList = testData.questions || []
    const currentQ = qList[currentIdx] || qList[0]
    const answeredCount = Object.keys(answers).length
    const isCompletedView = Boolean(submissionResult)

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setActiveTest(null)
              setTestData(null)
              setSubmissionResult(null)
            }}
          >
            <ArrowLeft size={13} />
            <span>Return to Assessments</span>
          </Button>
          <Badge variant="accent">
            {activeTest === 'pre' ? 'Pre-Learning Baseline' : 'Post-Learning Verification'}
          </Badge>
        </div>

        {isCompletedView ? (
          <Card header={<h2 className="text-base font-bold text-[var(--text-main)] font-heading">Assessment Evaluation Results</h2>}>
            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-sunken)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                    Deterministic Diagnostic Score
                  </span>
                  <div className="text-3xl font-extrabold text-[var(--text-main)] font-heading mt-1">
                    {submissionResult.scores.percentage}%
                    <span className="text-xs font-medium text-[var(--text-muted)] ml-2.5 font-sans">
                      ({submissionResult.scores.rawScore} of {submissionResult.scores.totalItems} correct)
                    </span>
                  </div>
                </div>
                <Badge variant={submissionResult.scores.percentage >= 70 ? 'success' : 'neutral'}>
                  Status: {submissionResult.completionStatus}
                </Badge>
              </div>

              {learnerReport?.comparison && (
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/70 text-xs space-y-1">
                  <span className="font-bold text-indigo-950 font-heading">Paired Growth Analysis:</span>
                  <p className="text-indigo-800">
                    Pre-Test: {learnerReport.comparison.prePercentage}% · Post-Test: {learnerReport.comparison.postPercentage}% ·{' '}
                    <strong className="text-indigo-950 font-semibold">
                      {learnerReport.comparison.percentagePointChange >= 0 ? '+' : ''}
                      {learnerReport.comparison.percentagePointChange} Percentage Points
                    </strong>
                  </p>
                </div>
              )}

              <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-2">
                {submissionResult.methodologicalNote}
              </p>

              <div className="pt-4 border-t border-[var(--border-color)]">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setActiveTest(null)
                    setTestData(null)
                    setSubmissionResult(null)
                  }}
                >
                  Close & View Dashboard
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card
            header={
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--text-main)] font-heading">
                  Question {currentIdx + 1} of {qList.length}
                </span>
                <span className="text-[var(--text-muted)] font-mono">{answeredCount} of {qList.length} answered</span>
              </div>
            }
          >
            <div className="space-y-5">
              <h3 className="text-base font-bold text-[var(--text-main)] leading-relaxed font-heading">
                {currentQ.prompt}
              </h3>

              <div className="space-y-2.5 pt-1">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = answers[currentQ.id] === idx
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={submitting}
                      onClick={() => handleAnswerSelect(currentQ.id, idx)}
                      className={`w-full text-left p-3.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-[var(--accent-primary)] bg-indigo-50/80 text-indigo-950 font-semibold shadow-xs'
                          : 'border-[var(--border-color)] bg-white text-[var(--text-main)] hover:bg-[var(--bg-surface-sunken)] hover:border-slate-300'
                      }`}
                    >
                      <span className="leading-snug">{opt}</span>
                      <span className={`text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded ${isSelected ? 'bg-indigo-200/60 text-indigo-900' : 'bg-slate-100 text-slate-500'}`}>
                        Option {String.fromCharCode(65 + idx)}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5 font-sans">
                  Reasoning (Optional reflection trace)
                </label>
                <textarea
                  rows={2}
                  value={reasonings[currentQ.id] || ''}
                  disabled={submitting}
                  onChange={(e) => handleReasoningChange(currentQ.id, e.target.value)}
                  placeholder="Explain why you selected this answer..."
                  className="w-full text-xs p-3 rounded-lg border border-[var(--border-color)] bg-white text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none"
                />
              </div>

              {testError && (
                <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0 text-rose-600" />
                  <span>{testError}</span>
                </div>
              )}

              <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                >
                  <ArrowLeft size={13} />
                  <span>Previous</span>
                </Button>

                {currentIdx < qList.length - 1 ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setCurrentIdx((prev) => Math.min(qList.length - 1, prev + 1))}
                  >
                    <span>Next</span>
                    <ArrowRight size={13} />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={submitting}
                    onClick={handleSubmitAssessment}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Submitting & Scoring...</span>
                      </>
                    ) : (
                      <span>Complete & Submit</span>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    )
  }

  // Modules List View
  const preStatus = learnerReport?.preAssessment ? 'Completed' : 'Ready'
  const preScore = learnerReport?.preAssessment ? `${learnerReport.preAssessment.scores.percentage}%` : null
  const postStatus = learnerReport?.postAssessment ? 'Completed' : 'Ready'
  const postScore = learnerReport?.postAssessment ? `${learnerReport.postAssessment.scores.percentage}%` : null

  const assessmentModules = [
    {
      id: 'pre-fractions',
      typeCode: 'pre',
      title: 'Fraction Foundations: Pre-Learning Baseline',
      type: 'Diagnostic Baseline',
      questionsCount: 6,
      estimatedTime: '10 mins',
      status: preStatus,
      score: preScore,
      description: 'Establishes baseline reasoning patterns before adaptive tutor interventions.'
    },
    {
      id: 'post-fractions',
      typeCode: 'post',
      title: 'Fraction Foundations: Post-Learning Verification',
      type: 'Intervention Measure',
      questionsCount: 6,
      estimatedTime: '10 mins',
      status: postStatus,
      score: postScore,
      description: 'Uses identical diagnostic items to measure whether identified misconceptions were resolved.'
    },
    {
      id: 'pre-algebra',
      typeCode: 'algebra',
      title: 'Algebraic Equations: Pre-Learning Baseline',
      type: 'Diagnostic Baseline',
      questionsCount: 8,
      estimatedTime: '15 mins',
      status: 'Upcoming',
      score: null,
      description: 'Assesses balance model understanding and inverse operation intuition.'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-[var(--text-main)] font-heading">Pre & Post Assessments</h2>
              <Badge variant="accent">Standardized Evaluation</Badge>
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)] max-w-2xl leading-relaxed">
              The evaluation framework compares isomorphic diagnostic items before and after tutor sessions. This measures true conceptual growth rather than test-taking variation.
            </p>
          </div>
        </div>
      </Card>

      {/* Paired Results Banner if both completed */}
      {learnerReport?.hasPairedResults && (
        <Card>
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 font-heading">Verified Paired Growth Calibration</span>
              <Badge variant="success">Paired Validated</Badge>
            </div>
            <p className="text-xs text-indigo-900 leading-relaxed">
              Pre-test: {learnerReport.comparison.prePercentage}% → Post-test: {learnerReport.comparison.postPercentage}% (
              <strong className="text-indigo-950 font-bold">
                {learnerReport.comparison.percentagePointChange >= 0 ? '+' : ''}
                {learnerReport.comparison.percentagePointChange} percentage points
              </strong>
              ).
            </p>
          </div>
        </Card>
      )}

      {/* Assessment Modules Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assessmentModules.map((item) => {
          const isCompleted = item.status === 'Completed'
          const isSupported = item.typeCode === 'pre' || item.typeCode === 'post'

          return (
            <Card key={item.id} className="flex flex-col justify-between hover:border-[var(--accent-primary)] transition-all">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={isCompleted ? 'success' : 'neutral'}>{item.type}</Badge>
                  {item.score && (
                    <span className="text-xs font-bold text-emerald-600 font-mono">Score: {item.score}</span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-[var(--text-main)] font-heading leading-snug">{item.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-2 text-[11px] text-[var(--text-muted)] flex gap-3 font-mono">
                  <span>{item.questionsCount} questions</span>
                  <span>·</span>
                  <span>{item.estimatedTime}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono">{item.status}</span>
                {isSupported ? (
                  <Button
                    size="sm"
                    variant={isCompleted ? 'secondary' : 'primary'}
                    disabled={loadingTest || isCompleted}
                    onClick={() => handleStartTest(item.typeCode)}
                  >
                    {isCompleted ? 'Completed' : 'Start Assessment'}
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" disabled>
                    Upcoming
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Methodological Note Card with Cohort Telemetry */}
      <Card header={<h3 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider font-heading">Assessment Methodology & Cohort Telemetry</h3>}>
        <div className="space-y-3 text-xs text-[var(--text-muted)] leading-relaxed">
          <p>
            Pre/post assessment comparisons rely on isomorphic diagnostic probes. Single-attempt scores are not treated as fixed capability labels, but as signals to calibrate adaptive tutor nudges.
          </p>

          {cohortReport && (
            <div className="p-3.5 bg-[var(--bg-surface-sunken)] border border-[var(--border-color)] rounded-lg text-[11px] text-[var(--text-muted)] space-y-1">
              <span className="font-semibold text-[var(--text-main)]">Cohort Sample Statistics:</span>
              <div>Total pre-assessments: {cohortReport.totalPreAssessments} · Paired valid evaluations: {cohortReport.pairedLearnersCount}</div>
              {cohortReport.pairedMetrics && (
                <div>Mean paired growth: +{cohortReport.pairedMetrics.meanPercentagePointChange} percentage points</div>
              )}
              <div className="text-[10px] text-[var(--text-muted)] italic pt-1">{cohortReport.attritionNote}</div>
            </div>
          )}

          <p className="text-[11px] text-[var(--text-muted)]">
            Educational Notice: Score differences reflect observed performance on identical diagnostic items. In accordance with educational evaluation guidelines, score increases cannot be claimed as sole proof of product causation due to practice effects and testing familiarity.
          </p>
        </div>
      </Card>
    </div>
  )
}

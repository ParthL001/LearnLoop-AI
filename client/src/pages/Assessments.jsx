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
          <Card header={<h2 className="text-base font-bold text-[#0f172a]">Assessment Evaluation Results</h2>}>
            <div className="space-y-4">
              <div className="p-4 rounded-[6px] border border-[#cbd5e1] bg-[#f8fafc] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                    Deterministic Diagnostic Score
                  </span>
                  <div className="text-2xl font-black text-[#0f172a] mt-0.5">
                    {submissionResult.scores.percentage}%
                    <span className="text-xs font-medium text-[#64748b] ml-2">
                      ({submissionResult.scores.rawScore} of {submissionResult.scores.totalItems} correct)
                    </span>
                  </div>
                </div>
                <Badge variant={submissionResult.scores.percentage >= 70 ? 'success' : 'neutral'}>
                  Status: {submissionResult.completionStatus}
                </Badge>
              </div>

              {learnerReport?.comparison && (
                <div className="p-3.5 rounded-[6px] border border-[#2563eb]/20 bg-[#eff6ff] text-xs space-y-1">
                  <span className="font-bold text-[#1e3a8a]">Paired Growth Analysis:</span>
                  <p className="text-[#1d4ed8]">
                    Pre-Test: {learnerReport.comparison.prePercentage}% · Post-Test: {learnerReport.comparison.postPercentage}% ·{' '}
                    <strong>
                      {learnerReport.comparison.percentagePointChange >= 0 ? '+' : ''}
                      {learnerReport.comparison.percentagePointChange} Percentage Points
                    </strong>
                  </p>
                </div>
              )}

              <p className="text-xs text-[#64748b] leading-relaxed pt-2">
                {submissionResult.methodologicalNote}
              </p>

              <div className="pt-4 border-t border-[#e2e8f0]">
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
                <span className="font-semibold text-[#0f172a]">
                  Question {currentIdx + 1} of {qList.length}
                </span>
                <span className="text-[#64748b]">{answeredCount} of {qList.length} answered</span>
              </div>
            }
          >
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#0f172a] leading-relaxed">
                {currentQ.prompt}
              </h3>

              <div className="space-y-2 pt-2">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = answers[currentQ.id] === idx
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={submitting}
                      onClick={() => handleAnswerSelect(currentQ.id, idx)}
                      className={`w-full text-left p-3 rounded-[5px] border text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'border-[#2563eb] bg-[#eff6ff] text-[#1e3a8a] font-semibold'
                          : 'border-[#cbd5e1] bg-white text-[#0f172a] hover:bg-[#f8fafc]'
                      }`}
                    >
                      <span>{opt}</span>
                      <span className="text-[10px] uppercase font-bold text-[#64748b]">
                        Option {String.fromCharCode(65 + idx)}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#0f172a] mb-1">
                  Reasoning (Optional reflection trace)
                </label>
                <textarea
                  rows={2}
                  value={reasonings[currentQ.id] || ''}
                  disabled={submitting}
                  onChange={(e) => handleReasoningChange(currentQ.id, e.target.value)}
                  placeholder="Explain why you selected this answer..."
                  className="w-full text-xs p-2.5 rounded-[5px] border border-[#cbd5e1] bg-white text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#2563eb] outline-none"
                />
              </div>

              {testError && (
                <div className="p-3 rounded-[5px] border border-[#fecaca] bg-[#fef2f2] text-xs text-[#991b1b] flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{testError}</span>
                </div>
              )}

              <div className="pt-4 border-t border-[#e2e8f0] flex items-center justify-between">
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
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#0f172a]">Pre & Post Assessments</h2>
              <Badge variant="accent">Standardized Evaluation</Badge>
            </div>
            <p className="mt-1 text-xs text-[#64748b] max-w-2xl leading-relaxed">
              The evaluation framework compares isomorphic diagnostic items before and after tutor sessions. This measures true conceptual growth rather than test-taking variation.
            </p>
          </div>
        </div>
      </Card>

      {/* Paired Results Banner if both completed */}
      {learnerReport?.hasPairedResults && (
        <Card>
          <div className="p-3 bg-[#eff6ff] border border-[#2563eb]/20 rounded-[6px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1e3a8a]">Verified Paired Growth Calibration</span>
              <Badge variant="success">Paired Validated</Badge>
            </div>
            <p className="text-xs text-[#1d4ed8]">
              Pre-test: {learnerReport.comparison.prePercentage}% → Post-test: {learnerReport.comparison.postPercentage}% (
              <strong>
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
            <Card key={item.id} className="flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={isCompleted ? 'success' : 'neutral'}>{item.type}</Badge>
                  {item.score && (
                    <span className="text-xs font-bold text-[#065f46]">Score: {item.score}</span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-[#0f172a]">{item.title}</h3>
                <p className="text-xs text-[#334155] leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-2 text-[11px] text-[#64748b] flex gap-3">
                  <span>{item.questionsCount} questions</span>
                  <span>·</span>
                  <span>{item.estimatedTime}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#e2e8f0] flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#64748b]">{item.status}</span>
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
      <Card header={<h3 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Assessment Methodology & Cohort Telemetry</h3>}>
        <div className="space-y-3 text-xs text-[#334155] leading-relaxed">
          <p>
            Pre/post assessment comparisons rely on isomorphic diagnostic probes. Single-attempt scores are not treated as fixed capability labels, but as signals to calibrate adaptive tutor nudges.
          </p>

          {cohortReport && (
            <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[5px] text-[11px] text-[#475569] space-y-1">
              <span className="font-semibold text-[#0f172a]">Cohort Sample Statistics:</span>
              <div>Total pre-assessments: {cohortReport.totalPreAssessments} · Paired valid evaluations: {cohortReport.pairedLearnersCount}</div>
              {cohortReport.pairedMetrics && (
                <div>Mean paired growth: +{cohortReport.pairedMetrics.meanPercentagePointChange} percentage points</div>
              )}
              <div className="text-[10px] text-[#64748b] italic pt-1">{cohortReport.attritionNote}</div>
            </div>
          )}

          <p className="text-[11px] text-[#64748b]">
            Educational Notice: Score differences reflect observed performance on identical diagnostic items. In accordance with educational evaluation guidelines, score increases cannot be claimed as sole proof of product causation due to practice effects and testing familiarity.
          </p>
        </div>
      </Card>
    </div>
  )
}

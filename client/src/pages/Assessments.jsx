import { Link } from 'react-router-dom'
import { Card, Button, Badge } from '../components/UI'

export default function Assessments() {
  const assessmentModules = [
    {
      id: 'pre-fractions',
      title: 'Fraction Foundations: Pre-Learning Baseline',
      type: 'Diagnostic Baseline',
      questionsCount: 6,
      estimatedTime: '10 mins',
      status: 'Completed',
      score: '65%',
      description: 'Establishes baseline reasoning patterns before adaptive tutor interventions.'
    },
    {
      id: 'post-fractions',
      title: 'Fraction Foundations: Post-Learning Verification',
      type: 'Intervention Measure',
      questionsCount: 6,
      estimatedTime: '10 mins',
      status: 'Ready',
      score: null,
      description: 'Uses identical diagnostic items to measure whether identified misconceptions were resolved.'
    },
    {
      id: 'pre-algebra',
      title: 'Algebraic Equations: Pre-Learning Baseline',
      type: 'Diagnostic Baseline',
      questionsCount: 8,
      estimatedTime: '15 mins',
      status: 'Ready',
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
              <h2 className="text-lg font-bold text-[#181816]">Pre & Post Assessments</h2>
              <Badge variant="accent">Standardized Evaluation</Badge>
            </div>
            <p className="mt-1 text-xs text-[#575753] max-w-2xl leading-relaxed">
              Cognara compares identical diagnostic items before and after tutor sessions. This measures true conceptual growth rather than test-taking variation.
            </p>
          </div>
        </div>
      </Card>

      {/* Assessment Modules Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assessmentModules.map((item) => {
          const isCompleted = item.status === 'Completed'

          return (
            <Card key={item.id} className="flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={isCompleted ? 'success' : 'neutral'}>{item.type}</Badge>
                  {item.score && (
                    <span className="text-xs font-bold text-[#065f46]">Score: {item.score}</span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-[#181816]">{item.title}</h3>
                <p className="text-xs text-[#575753] leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-2 text-[11px] text-[#797973] flex gap-3">
                  <span>{item.questionsCount} questions</span>
                  <span>·</span>
                  <span>{item.estimatedTime}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#e3e3df] flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#797973]">{item.status}</span>
                <Link to="/practice">
                  <Button size="sm" variant={isCompleted ? 'secondary' : 'primary'}>
                    {isCompleted ? 'Review' : 'Start'}
                  </Button>
                </Link>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Methodological Note Card */}
      <Card header={<h3 className="text-xs font-bold text-[#181816] uppercase">Assessment Methodology</h3>}>
        <p className="text-xs text-[#575753] leading-relaxed">
          Pre/post assessment comparisons rely on isomorphic diagnostic probes. Single-attempt scores are not treated as fixed capability labels, but as signals to calibrate adaptive tutor nudges.
        </p>
      </Card>
    </div>
  )
}

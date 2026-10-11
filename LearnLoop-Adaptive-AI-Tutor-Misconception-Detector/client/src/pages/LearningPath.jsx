import { Link } from 'react-router-dom'
import { Card, Button, Badge } from '../components/UI'
import { useApp } from '../context/AppContext'
import { CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react'

export default function LearningPath() {
  const { milestones, topics } = useApp()
  const activeTopic = topics[0] || {}

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#F8FAFC]">Adaptive Learning Path</h2>
              <Badge variant="accent">{activeTopic.title}</Badge>
            </div>
            <p className="mt-1 text-xs text-[#A8B3C4] max-w-2xl leading-relaxed">
              Curriculum milestones sequence learning steps according to concept dependencies and individual reasoning patterns. Milestones adapt dynamically when misconceptions are detected or resolved.
            </p>
          </div>
          <Link to="/tutor">
            <Button variant="primary">
              <span>Consult AI Tutor</span>
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </Card>

      {/* Rationale Note */}
      <div className="p-4 rounded-[6px] border border-[#1E3A8A] bg-[#152746] text-xs text-[#93C5FD]">
        <span className="font-bold text-[#F8FAFC]">Pedagogical Framework: </span>
        Foundational intuition on unit fraction partition size is verified before symbolic addition algorithms are introduced. Milestone 3 functions as a formative diagnostic probe before common denominator operations.
      </div>

      {/* Milestones Sequence */}
      <div className="space-y-3">
        {milestones.map((milestone, index) => {
          const isCompleted = milestone.status === 'completed'
          const isInProgress = milestone.status === 'in_progress'
          const isNextUp = milestone.status === 'next_up'
          const isLocked = milestone.status === 'locked'

          const badgeVariant = isCompleted
            ? 'success'
            : isInProgress
            ? 'accent'
            : isNextUp
            ? 'warning'
            : 'neutral'

          return (
            <Card
              key={milestone.id}
              className={isInProgress ? 'border-[#3B82F6] ring-1 ring-[#3B82F6]' : ''}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#7F8A9B]">Step {index + 1}</span>
                    <Badge variant={badgeVariant}>{milestone.status.replace('_', ' ')}</Badge>
                    <span className="text-xs text-[#7F8A9B] flex items-center gap-1">
                      <Clock size={12} />
                      <span>{milestone.duration}</span>
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#F8FAFC]">{milestone.title}</h3>
                  <p className="text-xs text-[#A8B3C4] leading-relaxed max-w-2xl">
                    {milestone.description}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {milestone.score && (
                    <span className="text-xs font-semibold text-[#22C55E]">
                      Score: {milestone.score}%
                    </span>
                  )}

                  {!isLocked ? (
                    <Link to={milestone.type === 'diagnostic' ? '/practice/fractions' : '/lessons/fractions'}>
                      <Button variant={isInProgress ? 'primary' : 'secondary'} size="sm">
                        {isCompleted ? 'Review Concept' : isInProgress ? 'Continue Milestone' : 'Start Step'}
                      </Button>
                    </Link>
                  ) : (
                    <span className="text-xs font-medium text-[#7F8A9B] px-3 py-1 bg-[#1B2028] rounded-[4px] border border-[#303846]">
                      Locked
                    </span>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

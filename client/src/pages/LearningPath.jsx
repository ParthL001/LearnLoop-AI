import { Link } from 'react-router-dom'
import { Card, Button, Badge } from '../components/UI'
import { useApp } from '../context/AppContext'

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
              <h2 className="text-lg font-bold text-[#181816]">Adaptive Learning Path</h2>
              <Badge variant="accent">{activeTopic.title}</Badge>
            </div>
            <p className="mt-1 text-xs text-[#575753] max-w-2xl leading-relaxed">
              Cognara sequences learning steps according to concept dependencies and individual reasoning patterns.
              Milestones adapt when misconceptions are detected or resolved.
            </p>
          </div>
          <Link to="/tutor/fractions">
            <Button variant="primary">Consult Tutor</Button>
          </Link>
        </div>
      </Card>

      {/* Rationale Note */}
      <div className="p-4 rounded-[6px] border border-[#c7d2fe] bg-[#eef2ff] text-xs text-[#1e1b4b]">
        <span className="font-bold">Pedagogical Rationale: </span>
        The sequence introduces unit fraction meaning before symbolic procedures.
        Milestone 3 serves as an adaptive probe before introducing common denominators.
      </div>

      {/* Milestones List */}
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
              className={isInProgress ? 'border-[#3730a3] ring-1 ring-[#3730a3]' : ''}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#797973]">Step {index + 1}</span>
                    <Badge variant={badgeVariant}>{milestone.status.replace('_', ' ')}</Badge>
                    <span className="text-xs text-[#797973]">· {milestone.duration}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#181816]">{milestone.title}</h3>
                  <p className="text-xs text-[#575753] leading-relaxed max-w-2xl">
                    {milestone.description}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {milestone.score && (
                    <span className="text-xs font-semibold text-[#065f46]">
                      Score: {milestone.score}%
                    </span>
                  )}

                  {!isLocked ? (
                    <Link to={milestone.type === 'diagnostic' ? '/practice/fractions' : '/lessons/fractions'}>
                      <Button variant={isInProgress ? 'primary' : 'secondary'}>
                        {isCompleted ? 'Review' : 'Continue'}
                      </Button>
                    </Link>
                  ) : (
                    <span className="text-xs text-[#797973] font-medium">Locked</span>
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

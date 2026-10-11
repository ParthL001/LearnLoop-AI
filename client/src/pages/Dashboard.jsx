import { Link } from 'react-router-dom'
import { Card, Button, Badge, ProgressBar } from '../components/UI'
import { topics } from '../services/mockData'

export default function Dashboard() {
  const currentTopic = topics[0]

  return (
    <div className="space-y-6">
      {/* Overview Header Card */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#181816]">Learner Dashboard</h2>
              <Badge variant="accent">In Progress</Badge>
            </div>
            <p className="mt-1 text-xs text-[#575753] max-w-xl">
              Cognara analyzes your responses and reasoning to detect underlying conceptual gaps and suggest targeted practice.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/tutor">
              <Button variant="primary">Launch AI Tutor</Button>
            </Link>
            <Link to="/practice">
              <Button variant="secondary">Start Practice</Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold text-[#797973]">Active Subject</p>
          <p className="mt-2 text-xl font-bold text-[#181816]">Mathematics</p>
          <p className="mt-1 text-[11px] text-[#575753]">Fractional Reasoning</p>
        </Card>

        <Card>
          <p className="text-xs font-semibold text-[#797973]">Overall Mastery</p>
          <p className="mt-2 text-xl font-bold text-[#181816]">68%</p>
          <p className="mt-1 text-[11px] text-[#065f46]">4 of 6 units validated</p>
        </Card>

        <Card>
          <p className="text-xs font-semibold text-[#797973]">Misconceptions Identified</p>
          <p className="mt-2 text-xl font-bold text-[#181816]">1 Pending</p>
          <p className="mt-1 text-[11px] text-[#92400e]">Denominator Size Inversion</p>
        </Card>

        <Card>
          <p className="text-xs font-semibold text-[#797973]">Recommended Step</p>
          <p className="mt-2 text-xl font-bold text-[#181816]">Milestone 3</p>
          <p className="mt-1 text-[11px] text-[#575753]">Unlike Denominator Check</p>
        </Card>
      </div>

      {/* Main Grid: Active Focus & Topics */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Focus (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            header={
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#181816]">Current Focus Unit</h3>
                  <p className="text-xs text-[#797973]">{currentTopic.title}</p>
                </div>
                <Badge variant="accent">Topic 1</Badge>
              </div>
            }
          >
            <p className="text-xs text-[#575753] leading-relaxed">
              {currentTopic.description}
            </p>

            <div className="mt-4">
              <ProgressBar value={currentTopic.mastery} label="Concept Mastery" />
            </div>

            <div className="mt-4 pt-4 border-t border-[#e3e3df] flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[#797973]">
                Estimated time: {currentTopic.duration}
              </span>
              <div className="flex gap-2">
                <Link to="/lessons/fractions">
                  <Button variant="secondary">View Lesson</Button>
                </Link>
                <Link to="/tutor/fractions">
                  <Button variant="primary">Work with Tutor</Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Curriculum List */}
          <Card
            header={
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#181816]">Curriculum Overview</h3>
                <Link to="/lessons" className="text-xs font-semibold text-[#3730a3] hover:underline">
                  View all
                </Link>
              </div>
            }
          >
            <div className="divide-y divide-[#e3e3df]">
              {topics.map((topic) => (
                <div key={topic.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#181816] truncate">{topic.title}</span>
                      <span className="text-[10px] text-[#797973]">{topic.subject}</span>
                    </div>
                    <p className="text-[11px] text-[#575753] truncate mt-0.5">{topic.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#181816]">{topic.mastery}%</span>
                    <span className="block text-[10px] text-[#797973]">mastery</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Diagnostic Signal */}
        <div className="space-y-6">
          <Card
            header={
              <h3 className="text-sm font-bold text-[#181816]">Diagnostic Signal</h3>
            }
          >
            <Badge variant="warning">Misconception Flagged</Badge>
            <h4 className="mt-2 text-xs font-bold text-[#181816]">
              Whole-Number Denominator Comparison
            </h4>
            <p className="mt-1 text-xs text-[#575753] leading-relaxed">
              When comparing 2/3 and 2/5, student reasoning referenced 5 &gt; 3 rather than piece partition size.
            </p>
            <div className="mt-4 pt-3 border-t border-[#e3e3df]">
              <Link to="/practice/fractions">
                <Button variant="secondary" className="w-full">
                  Resolve in Practice
                </Button>
              </Link>
            </div>
          </Card>

          <Card
            header={
              <h3 className="text-sm font-bold text-[#181816]">System Status</h3>
            }
          >
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#575753]">
                <span>Tutor Inference Engine</span>
                <span className="font-semibold text-[#065f46]">Operational</span>
              </div>
              <div className="flex justify-between text-[#575753]">
                <span>Misconception Detector</span>
                <span className="font-semibold text-[#065f46]">Active</span>
              </div>
              <div className="flex justify-between text-[#575753]">
                <span>Backend Link</span>
                <span className="font-semibold text-[#3730a3]">Express / Ollama Ready</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

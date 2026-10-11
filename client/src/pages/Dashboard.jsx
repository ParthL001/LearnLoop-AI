import { Link } from 'react-router-dom'
import { Card, Button, Badge, ProgressBar } from '../components/UI'
import { useApp } from '../context/AppContext'
import { ArrowRight, BookOpen, MessageSquare, Target, CheckCircle2, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const { user, topics, mastery, misconceptions, practiceHistory } = useApp()
  const currentTopic = topics[0] || {}

  const activeMisconception = misconceptions.find((m) => m.status === 'In Remediation')
  const completedHistoryCount = practiceHistory?.length || 0

  return (
    <div className="space-y-6">
      {/* 1. Concise, useful welcome heading with prominent Continue Learning action */}
      <Card className="border-[#cbd5e1] bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#0f172a]">
                Welcome, {user?.name || 'Learner'}
              </h2>
              <Badge variant="accent">Active Curriculum</Badge>
            </div>
            <p className="mt-1 text-xs text-[#64748b] max-w-xl leading-relaxed">
              Diagnostic tutoring tracks conceptual understanding in real time, detecting root causes rather than simple calculation slips.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link to={`/lessons/${currentTopic.id || 'fractions'}`}>
              <Button variant="primary" size="md">
                <span>Continue Learning</span>
                <ArrowRight size={14} />
              </Button>
            </Link>
            <Link to={`/tutor/${currentTopic.id || 'fractions'}`}>
              <Button variant="secondary" size="md">
                <MessageSquare size={14} />
                <span>AI Tutor</span>
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Main 3-Pillar Operational Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): What was the student learning? & Learning Path */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pillar 1: What was the student learning? */}
          <Card
            header={
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                    Current Subject & Unit
                  </span>
                  <h3 className="text-sm font-bold text-[#0f172a] mt-0.5">
                    {currentTopic.title || 'Fractional Reasoning & Sense'}
                  </h3>
                </div>
                <Badge variant="neutral">{currentTopic.subject || 'Mathematics'}</Badge>
              </div>
            }
          >
            <p className="text-xs text-[#334155] leading-relaxed">
              {currentTopic.description}
            </p>

            {/* Real Educational Diagram: Fractional Unit Partition Comparison */}
            <div className="mt-4 p-4 rounded-[6px] border border-[#e2e8f0] bg-[#f8fafc]">
              <div className="flex items-center justify-between text-xs font-semibold text-[#0f172a] mb-2">
                <span>Visual Partition Model: 2/3 vs 2/5</span>
                <span className="text-[11px] font-normal text-[#64748b]">Partition Size Principle</span>
              </div>

              {/* Fraction 2/3 Bar */}
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-[11px] text-[#475569]">
                  <span className="font-semibold text-[#1d4ed8]">2/3 of Unit</span>
                  <span>3 total partitions (larger slices)</span>
                </div>
                <div className="grid grid-cols-3 h-5 w-full rounded-[4px] border border-[#cbd5e1] overflow-hidden bg-white">
                  <div className="bg-[#2563eb] text-white text-[10px] flex items-center justify-center font-bold">1/3</div>
                  <div className="bg-[#2563eb] text-white text-[10px] flex items-center justify-center font-bold border-l border-white/40">1/3</div>
                  <div className="bg-[#f1f5f9] text-[#94a3b8] text-[10px] flex items-center justify-center">1/3</div>
                </div>
              </div>

              {/* Fraction 2/5 Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#475569]">
                  <span className="font-semibold text-[#0f172a]">2/5 of Unit</span>
                  <span>5 total partitions (smaller slices)</span>
                </div>
                <div className="grid grid-cols-5 h-5 w-full rounded-[4px] border border-[#cbd5e1] overflow-hidden bg-white">
                  <div className="bg-[#64748b] text-white text-[10px] flex items-center justify-center font-bold">1/5</div>
                  <div className="bg-[#64748b] text-white text-[10px] flex items-center justify-center font-bold border-l border-white/40">1/5</div>
                  <div className="bg-[#f1f5f9] text-[#94a3b8] text-[10px] flex items-center justify-center">1/5</div>
                  <div className="bg-[#f1f5f9] text-[#94a3b8] text-[10px] flex items-center justify-center">1/5</div>
                  <div className="bg-[#f1f5f9] text-[#94a3b8] text-[10px] flex items-center justify-center">1/5</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex items-center justify-between">
              <span className="text-xs text-[#64748b]">
                Estimated unit duration: {currentTopic.duration || '45 mins'}
              </span>
              <div className="flex gap-2">
                <Link to={`/lessons/${currentTopic.id || 'fractions'}`}>
                  <Button size="sm" variant="secondary">
                    <BookOpen size={13} />
                    <span>Open Lesson</span>
                  </Button>
                </Link>
                <Link to={`/practice/${currentTopic.id || 'fractions'}`}>
                  <Button size="sm" variant="subtle">
                    <Target size={13} />
                    <span>Practice Questions</span>
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Enrolled Curriculum Section */}
          <Card
            header={
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0f172a]">Curriculum Sequence</h3>
                <Link to="/lessons" className="text-xs font-semibold text-[#2563eb] hover:underline">
                  Browse all lessons
                </Link>
              </div>
            }
          >
            <div className="divide-y divide-[#e2e8f0]">
              {topics.map((topic) => (
                <div key={topic.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0f172a] truncate">{topic.title}</span>
                      <span className="text-[10px] text-[#64748b] bg-[#f1f5f9] px-1.5 py-0.5 rounded-[3px]">
                        {topic.subject}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#475569] truncate mt-0.5">{topic.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#0f172a]">
                      {mastery?.[topic.id] || topic.mastery || 50}%
                    </span>
                    <span className="block text-[10px] text-[#64748b]">estimated mastery</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: What should they do next? & Evidence of progress */}
        <div className="space-y-6">
          {/* Pillar 2: What should they do next? */}
          <Card
            header={
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                  Next Recommended Action
                </span>
                <Badge variant={activeMisconception ? 'warning' : 'accent'}>
                  {activeMisconception ? 'Needs Remediation' : 'Next Step'}
                </Badge>
              </div>
            }
          >
            {activeMisconception ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-xs text-[#92400e]">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[#0f172a]">{activeMisconception.concept}</h4>
                    <p className="text-[#475569] mt-0.5 leading-relaxed">
                      {activeMisconception.studentHypothesis}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link to={`/practice/${currentTopic.id || 'fractions'}`}>
                    <Button variant="primary" className="w-full">
                      Solve Diagnostic Probe
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-xs text-[#065f46]">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-[#059669]" />
                  <div>
                    <h4 className="font-bold text-[#0f172a]">Common Denominators Milestone</h4>
                    <p className="text-[#475569] mt-0.5 leading-relaxed">
                      All baseline unit fraction concepts are verified. Ready to proceed to equivalent fraction scaling.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link to="/learning-path">
                    <Button variant="primary" className="w-full">
                      Go to Milestone 4
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>

          {/* Pillar 3: What evidence of progress is available? */}
          <Card
            header={
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0f172a]">Verified Progress Evidence</h3>
                <Link to="/progress" className="text-xs font-semibold text-[#2563eb] hover:underline">
                  Full Log
                </Link>
              </div>
            }
          >
            {completedHistoryCount > 0 ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  {practiceHistory.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-[5px] border border-[#e2e8f0] bg-[#f8fafc] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#0f172a] truncate max-w-[170px]">
                          {item.title}
                        </span>
                        <Badge variant={item.isCorrect ? 'success' : 'warning'}>
                          {item.isCorrect ? 'Correct' : 'Flagged'}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-[#64748b]">{item.date}</p>
                      {item.misconception && (
                        <p className="text-[11px] text-[#92400e]">
                          Identified: {item.misconception}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Honest empty state when no verified progress exists */
              <div className="py-6 text-center text-xs text-[#64748b] space-y-2">
                <p>No verified attempts recorded yet.</p>
                <p className="text-[11px] text-[#94a3b8]">
                  Complete diagnostic items or tutor sessions to build an evidence log.
                </p>
              </div>
            )}
          </Card>

          {/* Direct Route to AI Tutor */}
          <Card className="bg-[#eff6ff] border-[#bfdbfe]">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#1d4ed8] font-bold">
                <MessageSquare size={16} />
                <span>Diagnostic AI Tutor</span>
              </div>
              <p className="text-[#334155] leading-relaxed">
                Stuck on a problem or confused by a mathematical rule? Explain your thinking to the tutor for step-by-step guidance.
              </p>
              <div className="pt-1">
                <Link to="/tutor">
                  <Button variant="primary" size="sm" className="w-full">
                    Open Tutor Session
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

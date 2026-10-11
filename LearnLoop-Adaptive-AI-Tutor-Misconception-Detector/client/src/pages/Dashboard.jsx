import { Link } from 'react-router-dom'
import { Card, Button, Badge, ProgressBar } from '../components/UI'
import { useApp } from '../context/AppContext'
import { ArrowRight, BookOpen, MessageSquare, Target, CheckCircle2, AlertCircle, Compass, Sparkles } from 'lucide-react'

export default function Dashboard() {
  const { user, topics, mastery, misconceptions, practiceHistory } = useApp()
  const currentTopic = topics[0] || {}

  const activeMisconception = misconceptions.find((m) => m.status === 'In Remediation')
  const completedHistoryCount = practiceHistory?.length || 0

  return (
    <div className="space-y-6">
      {/* 1. Concise welcome card with primary continue action */}
      <Card className="border-[#303846] bg-[#14171C]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#F8FAFC] tracking-tight">
                Welcome, {user?.name || user?.email?.split('@')[0] || 'Learner'}
              </h2>
              <Badge variant="accent">Active Curriculum</Badge>
            </div>
            <p className="mt-1 text-xs text-[#A8B3C4] max-w-xl leading-relaxed">
              Diagnostic tutoring tracks conceptual understanding in real time, detecting root causes rather than simple calculation slips.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link to={`/lessons/${currentTopic.id || 'understanding-fractions'}`}>
              <Button variant="primary" size="md">
                <span>Continue Learning</span>
                <ArrowRight size={14} />
              </Button>
            </Link>
            <Link to={`/tutor/${currentTopic.id || 'understanding-fractions'}`}>
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
        {/* Left Column (2 Cols): What is the student learning? & Curriculum Sequence */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pillar 1: Current Subject & Concept Unit */}
          <Card
            header={
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7F8A9B]">
                    Current Subject & Unit
                  </span>
                  <h3 className="text-sm font-bold text-[#F8FAFC] mt-0.5">
                    {currentTopic.title || 'Fractional Reasoning & Sense'}
                  </h3>
                </div>
                <Badge variant="neutral">{currentTopic.subject || 'Mathematics'}</Badge>
              </div>
            }
          >
            <p className="text-xs text-[#A8B3C4] leading-relaxed">
              {currentTopic.description}
            </p>

            {/* Visual Partition Model: Dark Theme */}
            <div className="mt-4 p-4 rounded-[8px] border border-[#303846] bg-[#1B2028]">
              <div className="flex items-center justify-between text-xs font-semibold text-[#F8FAFC] mb-2.5">
                <span>Visual Partition Model: Comparing 2/3 and 2/5</span>
                <span className="text-[11px] font-normal text-[#7F8A9B]">Partition Size Principle</span>
              </div>

              {/* Fraction 2/3 Bar */}
              <div className="space-y-1.5 mb-3.5">
                <div className="flex justify-between text-[11px] text-[#A8B3C4]">
                  <span className="font-semibold text-[#60A5FA]">2/3 of Unit Whole</span>
                  <span>3 equal partitions (larger individual slices)</span>
                </div>
                <div className="grid grid-cols-3 h-5 w-full rounded-[4px] border border-[#303846] overflow-hidden bg-[#14171C]">
                  <div className="bg-[#3B82F6] text-[#F8FAFC] text-[10px] flex items-center justify-center font-bold">1/3</div>
                  <div className="bg-[#3B82F6] text-[#F8FAFC] text-[10px] flex items-center justify-center font-bold border-l border-[#1D4ED8]">1/3</div>
                  <div className="bg-[#14171C] text-[#7F8A9B] text-[10px] flex items-center justify-center">1/3</div>
                </div>
              </div>

              {/* Fraction 2/5 Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-[#A8B3C4]">
                  <span className="font-semibold text-[#A8B3C4]">2/5 of Unit Whole</span>
                  <span>5 equal partitions (smaller individual slices)</span>
                </div>
                <div className="grid grid-cols-5 h-5 w-full rounded-[4px] border border-[#303846] overflow-hidden bg-[#14171C]">
                  <div className="bg-[#475569] text-[#F8FAFC] text-[10px] flex items-center justify-center font-bold">1/5</div>
                  <div className="bg-[#475569] text-[#F8FAFC] text-[10px] flex items-center justify-center font-bold border-l border-[#334155]">1/5</div>
                  <div className="bg-[#14171C] text-[#7F8A9B] text-[10px] flex items-center justify-center">1/5</div>
                  <div className="bg-[#14171C] text-[#7F8A9B] text-[10px] flex items-center justify-center">1/5</div>
                  <div className="bg-[#14171C] text-[#7F8A9B] text-[10px] flex items-center justify-center">1/5</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#303846] flex items-center justify-between">
              <span className="text-xs text-[#7F8A9B]">
                Estimated unit duration: {currentTopic.duration || '20 mins'}
              </span>
              <div className="flex gap-2">
                <Link to={`/lessons/${currentTopic.id || 'understanding-fractions'}`}>
                  <Button size="sm" variant="secondary">
                    <BookOpen size={13} />
                    <span>Open Lesson</span>
                  </Button>
                </Link>
                <Link to={`/practice/${currentTopic.id || 'understanding-fractions'}`}>
                  <Button size="sm" variant="subtle">
                    <Target size={13} />
                    <span>Practice Questions</span>
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Curriculum Sequence Section */}
          <Card
            header={
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#F8FAFC]">Curriculum Sequence</h3>
                <Link to="/lessons" className="text-xs font-semibold text-[#3B82F6] hover:underline">
                  Browse all lessons
                </Link>
              </div>
            }
          >
            <div className="divide-y divide-[#303846]">
              {topics.map((topic) => (
                <div key={topic.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#F8FAFC] truncate">{topic.title}</span>
                      <span className="text-[10px] text-[#A8B3C4] bg-[#1B2028] border border-[#303846] px-1.5 py-0.5 rounded-[3px]">
                        {topic.subject || 'Math'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7F8A9B] truncate mt-0.5">{topic.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#F8FAFC]">
                      {mastery?.[topic.id] ?? topic.mastery ?? 0}%
                    </span>
                    <span className="block text-[10px] text-[#7F8A9B]">calibrated mastery</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Next Steps & Progress Evidence */}
        <div className="space-y-6">
          {/* Pillar 2: Next Recommended Action */}
          <Card
            header={
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7F8A9B]">
                  Next Recommended Action
                </span>
                <Badge variant={activeMisconception ? 'warning' : 'accent'}>
                  {activeMisconception ? 'Remediation Active' : 'Next Step'}
                </Badge>
              </div>
            }
          >
            {activeMisconception ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-[#FCD34D]">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-[#EAB308]" />
                  <div>
                    <h4 className="font-bold text-[#F8FAFC]">{activeMisconception.concept || activeMisconception.name}</h4>
                    <p className="text-[#A8B3C4] mt-0.5 leading-relaxed">
                      {activeMisconception.studentHypothesis || 'Misconception flagged in recent reasoning step.'}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link to={`/practice/${currentTopic.id || 'understanding-fractions'}`}>
                    <Button variant="primary" className="w-full">
                      Solve Diagnostic Remediation Probe
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-[#4ADE80]">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-[#22C55E]" />
                  <div>
                    <h4 className="font-bold text-[#F8FAFC]">Curriculum Step Calibrated</h4>
                    <p className="text-[#A8B3C4] mt-0.5 leading-relaxed">
                      Baseline concepts verified. Ready to proceed to next adaptive diagnostic probe.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link to="/learning-path">
                    <Button variant="primary" className="w-full">
                      Continue Learning Path
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>

          {/* Pillar 3: Verified Progress Evidence */}
          <Card
            header={
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#F8FAFC]">Verified Progress Evidence</h3>
                <Link to="/progress" className="text-xs font-semibold text-[#3B82F6] hover:underline">
                  Full Log
                </Link>
              </div>
            }
          >
            {completedHistoryCount > 0 ? (
              <div className="space-y-2.5">
                {practiceHistory.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-[6px] border border-[#303846] bg-[#1B2028] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#F8FAFC] truncate max-w-[170px]">
                        {item.title}
                      </span>
                      <Badge variant={item.isCorrect ? 'success' : 'warning'}>
                        {item.isCorrect ? 'Correct' : 'Flagged'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[#7F8A9B]">{item.date || 'Recent'}</p>
                    {item.misconception && (
                      <p className="text-[11px] text-[#FCD34D]">
                        Identified: {item.misconception}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#7F8A9B] space-y-1.5">
                <p>No verified attempts recorded yet.</p>
                <p className="text-[11px] text-[#7F8A9B]">
                  Complete diagnostic items or tutor sessions to calibrate your evidence log.
                </p>
              </div>
            )}
          </Card>

          {/* AI Tutor Prominent Card */}
          <Card className="bg-[#152746] border-[#1E3A8A]">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#60A5FA] font-bold">
                <Sparkles size={16} />
                <span>Diagnostic AI Tutor</span>
              </div>
              <p className="text-[#A8B3C4] leading-relaxed">
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

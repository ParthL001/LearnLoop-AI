import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, Badge } from '../components/UI'
import { useApp } from '../context/AppContext'
import { fetchLearnerProgress } from '../services/api'
import {
  Compass, MessageSquare, ArrowRight, BookOpen,
  Terminal, Code2, Clock, Sparkles, CheckCircle2
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useApp()
  const learnerId = user?.id || user?.email || 'learner-local'

  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetchLearnerProgress(learnerId)
      .then((data) => {
        if (mounted) {
          setProgressData(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.warn('Progress fetch error:', err.message)
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [learnerId])

  const recentTopics = progressData?.recentlyStudiedTopics || []
  const hasHistory = progressData?.hasRecordedHistory || recentTopics.length > 0
  const latestTopic = recentTopics[0]

  return (
    <div className="space-y-6">
      {/* 1. Short Welcome Heading */}
      <div className="border-b border-[#303846] pb-4">
        <h1 className="text-xl font-bold text-[#F8FAFC] tracking-tight">
          Welcome back, {user?.name || user?.email?.split('@')[0] || 'Learner'}
        </h1>
        <p className="mt-1 text-xs text-[#A8B3C4]">
          Choose a subject to learn, continue where you left off, or ask the AI Tutor.
        </p>
      </div>

      {/* 2. Prominent Explore Content Hero Action */}
      <div className="rounded-[8px] border border-[#303846] bg-[#14171C] p-6 relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#3B82F6]">
              Core Curriculum
            </span>
            <Badge variant="accent">Dynamic AI Lessons</Badge>
          </div>
          <h2 className="text-lg font-bold text-[#F8FAFC] tracking-tight">
            Explore Python & C++ Tracks
          </h2>
          <p className="text-xs text-[#A8B3C4] leading-relaxed">
            Dive into core computer science concepts including Data Types, Variables, Loops, Stack, and Queue. Each lesson is dynamically generated with clear conceptual analogies, code walkthroughs, and practice checks.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link to="/explore">
              <Button variant="primary" size="md">
                <Compass size={15} />
                <span>Explore Content</span>
                <ArrowRight size={14} />
              </Button>
            </Link>
            <Link to="/tutor">
              <Button variant="secondary" size="md">
                <MessageSquare size={15} className="text-[#3B82F6]" />
                <span>Open AI Tutor</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Continue Learning Section (ONLY when real saved progress exists) */}
      {hasHistory && latestTopic && (
        <Card
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-[#3B82F6]" />
                <h3 className="text-sm font-bold text-[#F8FAFC]">Continue Learning</h3>
              </div>
              <Badge variant="neutral">
                {latestTopic.subjectId === 'python' ? 'Python' : 'C++'}
              </Badge>
            </div>
          }
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#F8FAFC] block">
                {latestTopic.topicTitle}
              </span>
              <span className="text-[11px] text-[#7F8A9B] block mt-0.5">
                Last accessed {new Date(latestTopic.timestamp).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <Link to={`/lessons/${latestTopic.subjectId}/${latestTopic.topicId}`}>
              <Button variant="primary" size="sm">
                <span>Resume Lesson</span>
                <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* 4. Recently Studied Topics (ONLY when actual learner history exists) */}
      {hasHistory && recentTopics.length > 0 ? (
        <Card
          header={
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F8FAFC]">Recently Studied Topics</h3>
              <Badge variant="neutral">{recentTopics.length} Recorded</Badge>
            </div>
          }
        >
          <div className="divide-y divide-[#303846]">
            {recentTopics.slice(0, 5).map((topic, idx) => {
              const isPython = topic.subjectId === 'python'
              const Icon = isPython ? Terminal : Code2

              return (
                <div
                  key={`${topic.topicId}-${idx}`}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#303846] bg-[#1B2028] text-[#3B82F6]">
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#F8FAFC]">
                          {topic.topicTitle}
                        </span>
                        <Badge variant="neutral">{isPython ? 'Python' : 'C++'}</Badge>
                      </div>
                      <span className="text-[11px] text-[#7F8A9B]">
                        {new Date(topic.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <Link to={`/lessons/${topic.subjectId}/${topic.topicId}`}>
                    <Button variant="secondary" size="sm">
                      <span>Review</span>
                      <ArrowRight size={12} />
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        </Card>
      ) : !loading ? (
        /* Clean empty state when no history exists */
        <div className="rounded-[8px] border border-dashed border-[#303846] bg-[#14171C]/40 p-8 text-center space-y-3">
          <BookOpen size={24} className="mx-auto text-[#7F8A9B]" />
          <h3 className="text-xs font-bold text-[#F8FAFC]">No Learning History Recorded Yet</h3>
          <p className="text-xs text-[#7F8A9B] max-w-sm mx-auto">
            Your recent topics and lesson progress will appear here as soon as you open a topic in Python or C++.
          </p>
          <div className="pt-1">
            <Link to="/explore">
              <Button size="sm" variant="secondary">
                <Compass size={13} />
                <span>Start Exploring</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : null}

      {/* 5. Simple AI Tutor Card */}
      <div className="rounded-[8px] border border-[#303846] bg-[#14171C] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-[#152746] text-[#3B82F6] border border-[#1E3A8A] shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#F8FAFC]">
              Have Questions While Learning?
            </h3>
            <p className="mt-0.5 text-xs text-[#A8B3C4]">
              Chat directly with our AI Tutor powered by local Ollama (<code className="text-[#3B82F6]">qwen3:4b</code>). Ask for code examples, debugging tips, or conceptual explanations.
            </p>
          </div>
        </div>

        <Link to="/tutor" className="shrink-0">
          <Button variant="secondary" size="sm">
            <MessageSquare size={13} />
            <span>Launch AI Tutor</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}

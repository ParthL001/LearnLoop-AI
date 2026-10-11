import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { fetchLearnerProgress } from '../services/api'
import {
  Compass,
  MessageSquare,
  ArrowRight,
  BookOpen,
  Code2,
  Clock,
  Sparkles,
  Layout,
  Terminal,
  ChevronRight,
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
    <div className="reveal-stagger space-y-6">
      {/* 1. Header with Eyebrow & Brand Aura */}
      <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="eyebrow mb-1.5">
            Adaptive Learning Platform
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
            Welcome back, {user?.name || user?.email?.split('@')[0] || 'Learner'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Build solid mental models in Python & C++, diagnose conceptual traps, and practice interactively.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/explore"
            className="btn btn-primary btn-sm sm:btn-md"
          >
            <Compass size={15} />
            <span>Explore Topics</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* 2. Core Curriculum Hero Panel (.card-hero) with Ochre CTA & Radial Texture */}
      <div className="card-hero">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="eyebrow">
              Core Curriculum
            </span>
            <span className="badge badge-sky">
              Dynamic AI Lessons
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/explore"
              className="btn btn-accent"
            >
              <Compass size={15} />
              <span>Browse All Topics</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/tutor"
              className="btn btn-ghost-inverse"
            >
              <MessageSquare size={15} className="text-[#8BB2DE]" />
              <span>Ask AI Tutor</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Curriculum & Tools Highlight Section (.card-interactive, .icon-tile, .btn-launch) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Python Practice Card */}
        <div className="card card-interactive flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="icon-tile">
                  <Code2 size={20} />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-[var(--text-main)]">Python Practice</h3>
                  <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Misconception Detector</span>
                </div>
              </div>
              <span className="badge badge-ochre">
                Ollama AI
              </span>
            </div>
            <p className="text-xs text-[var(--text-body)] leading-relaxed mb-5">
              Practice Python concepts and understand the reasoning behind your answers. Type solutions freely and let our local diagnostic engine detect cognitive misunderstandings.
            </p>
          </div>

          <Link
            to="/python-practice"
            className="btn-launch"
          >
            <span>Launch Python Detector</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* CSS Practice Card */}
        <div className="card card-interactive flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="icon-tile">
                  <Layout size={20} />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-[var(--text-main)]">CSS Practice</h3>
                  <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Layout & Specificity</span>
                </div>
              </div>
              <span className="badge badge-sky">
                Interactive Lab
              </span>
            </div>
            <p className="text-xs text-[var(--text-body)] leading-relaxed mb-5">
              Practice CSS concepts and strengthen your understanding of styling, specificity calculations, Flexbox axes, margin collapsing, and the box model.
            </p>
          </div>

          <Link
            to="/css-practice"
            className="btn-launch"
          >
            <span>Launch CSS Lab</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* 4. Continue Learning (ONLY when real recorded progress exists) */}
      {hasHistory && latestTopic && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-soft)]">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[var(--accent-primary)]" />
              <h3 className="font-heading text-base font-bold text-[var(--text-main)]">Continue Where You Left Off</h3>
            </div>
            <span className="badge badge-forest">
              {latestTopic.subjectId === 'python' ? 'Python' : 'C++'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="font-heading text-lg font-bold text-[var(--text-main)] block">
                {latestTopic.topicTitle}
              </span>
              <span className="font-mono text-xs text-[var(--text-muted)] block mt-0.5">
                Last accessed {new Date(latestTopic.timestamp).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <Link
              to={`/lessons/${latestTopic.subjectId}/${latestTopic.topicId}`}
              className="btn btn-primary btn-sm"
            >
              <span>Resume Lesson</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* 5. Recently Studied Topics or Truthful Empty State */}
      {hasHistory && recentTopics.length > 0 ? (
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-soft)]">
            <h3 className="font-heading text-base font-bold text-[var(--text-main)]">Recently Studied Topics</h3>
            <span className="badge badge-neutral">
              {recentTopics.length} RECORDED
            </span>
          </div>

          <div className="divide-y divide-[var(--border-soft)]">
            {recentTopics.slice(0, 5).map((topic, idx) => {
              const isPython = topic.subjectId === 'python'
              const Icon = isPython ? Terminal : Code2

              return (
                <div
                  key={`${topic.topicId}-${idx}`}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="icon-tile" style={{ width: '2.4rem', height: '2.4rem' }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-sm font-bold text-[var(--text-main)]">
                          {topic.topicTitle}
                        </span>
                        <span className="badge badge-forest text-[9px] px-1.5 py-0.2">
                          {isPython ? 'Python' : 'C++'}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">
                        {new Date(topic.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/lessons/${topic.subjectId}/${topic.topicId}`}
                    className="btn btn-secondary btn-sm"
                  >
                    <span>Review</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      ) : !loading ? (
        <div className="card text-center p-8 space-y-3 border-dashed">
          <div className="icon-tile mx-auto">
            <BookOpen size={20} />
          </div>
          <h3 className="font-heading text-base font-bold text-[var(--text-main)]">No Learning History Recorded Yet</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            Your recent topics and diagnostic attempts will appear here automatically when you study lessons in Python or C++.
          </p>
          <div className="pt-2">
            <Link
              to="/explore"
              className="btn btn-secondary btn-sm"
            >
              <Compass size={14} />
              <span>Start Exploring</span>
            </Link>
          </div>
        </div>
      ) : null}

      {/* 6. AI Tutor Helper Card (.card) */}
      <div className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="icon-tile shrink-0">
            <Sparkles size={20} className="text-[#F5B726]" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-[var(--text-main)]">
              Stuck on a Concept or Code Bug?
            </h3>
            <p className="mt-0.5 text-xs text-[var(--text-muted)] leading-relaxed">
              Chat directly with our AI Tutor powered by local Ollama (<code className="font-mono text-[var(--accent-primary)] font-bold">qwen3:4b</code>). Ask for analogies, code traces, or syntax clarifications.
            </p>
          </div>
        </div>

        <Link
          to="/tutor"
          className="btn btn-secondary shrink-0"
        >
          <MessageSquare size={14} className="text-[var(--accent-primary)]" />
          <span>Launch AI Tutor</span>
        </Link>
      </div>
    </div>
  )
}

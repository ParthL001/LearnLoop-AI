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
      {/* 1. Header with Hacktoberfest Brand Aesthetic */}
      <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#3D5F58]"></span>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#3D5F58]">
              Adaptive Learning Dashboard
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#231F20]">
            Welcome Back, {user?.name || user?.email?.split('@')[0] || 'Learner'}
          </h1>
          <p className="text-sm text-[#4B5563] mt-1">
            Build solid mental models in Python & C++, diagnose conceptual misunderstandings, and practice interactively.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3D5F58] text-white font-sans font-bold text-sm rounded-md shadow-xs hover:bg-[#2E4742] transition"
          >
            <Compass size={15} />
            <span>Explore Topics</span>
          </Link>
        </div>
      </div>

      {/* 2. Prominent Core Feature Hero Action (Deep Forest #2E4742) */}
      <div className="rounded-lg border border-[#243935] bg-[#2E4742] text-[#F2F2EB] p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#F5B726]">
              Core Curriculum
            </span>
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#231F20] bg-[#8BB2DE] px-2 py-0.5 rounded">
              AI Generated Lessons
            </span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-extrabold tracking-tight text-[#F2F2EB]">
            Explore Python & C++ Tracks
          </h2>
          <p className="text-xs sm:text-sm text-[#C2D7D2] leading-relaxed">
            Master fundamental computer science topics including Data Types, Variables, Loops, Stack, and Queue.
            Lessons are generated dynamically via local Ollama (<code className="text-[#8BB2DE] font-mono">qwen3:4b</code>) with language-specific examples and conceptual analogies.
          </p>
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F5B726] text-[#231F20] font-bold text-xs uppercase font-mono tracking-wider rounded-md hover:bg-[#E5AA1E] transition shadow-xs"
            >
              <Compass size={14} />
              <span>Browse All Topics</span>
              <ArrowRight size={13} />
            </Link>
            <Link
              to="/tutor"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3D5F58] text-white font-semibold text-xs rounded-md hover:bg-[#243935] border border-[#A4BEB9]/30 transition"
            >
              <MessageSquare size={14} className="text-[#8BB2DE]" />
              <span>Ask AI Tutor</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Curriculum & Tools Highlight Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Python Practice Card */}
        <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-[#3D5F58] transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#F2F2EB] text-[#3D5F58] rounded-md border border-[#D8D8CF]">
                  <Code2 size={18} />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#231F20]">Python Practice</h3>
                  <span className="font-mono text-[10px] text-[#6B7280] uppercase">Misconception Detector</span>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-[#3D5F58] bg-[#F2F2EB] px-2 py-0.5 rounded border border-[#D8D8CF]">
                OLLAMA AI
              </span>
            </div>
            <p className="text-xs text-[#4B5563] leading-relaxed mb-4">
              Practice Python concepts and understand the reasoning behind your answers. Type solutions freely and let our AI diagnose mental model traps.
            </p>
          </div>
          <Link
            to="/python-practice"
            className="inline-flex items-center justify-between w-full px-4 py-2.5 bg-[#F2F2EB] text-[#231F20] font-mono text-xs font-bold rounded-md hover:bg-[#3D5F58] hover:text-white transition group border border-[#D8D8CF]"
          >
            <span>Launch Python Detector</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* CSS Practice Card */}
        <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-[#3D5F58] transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#F2F2EB] text-[#3D5F58] rounded-md border border-[#D8D8CF]">
                  <Layout size={18} />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#231F20]">CSS Practice</h3>
                  <span className="font-mono text-[10px] text-[#6B7280] uppercase">Layout & Specificity</span>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-[#3D5F58] bg-[#F2F2EB] px-2 py-0.5 rounded border border-[#D8D8CF]">
                INTERACTIVE
              </span>
            </div>
            <p className="text-xs text-[#4B5563] leading-relaxed mb-4">
              Practice CSS concepts and strengthen your understanding of styling, specificity calculations, Flexbox axes, and the box model.
            </p>
          </div>
          <Link
            to="/css-practice"
            className="inline-flex items-center justify-between w-full px-4 py-2.5 bg-[#F2F2EB] text-[#231F20] font-mono text-xs font-bold rounded-md hover:bg-[#3D5F58] hover:text-white transition group border border-[#D8D8CF]"
          >
            <span>Launch CSS Lab</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 4. Continue Learning (ONLY when real saved history exists) */}
      {hasHistory && latestTopic && (
        <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D8D8CF]">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#3D5F58]" />
              <h3 className="font-heading text-base font-bold text-[#231F20]">Continue Where You Left Off</h3>
            </div>
            <span className="font-mono text-xs font-bold uppercase text-[#3D5F58] bg-[#F2F2EB] px-2 py-0.5 rounded border border-[#D8D8CF]">
              {latestTopic.subjectId === 'python' ? 'Python' : 'C++'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="font-heading text-lg font-bold text-[#231F20] block">
                {latestTopic.topicTitle}
              </span>
              <span className="font-mono text-xs text-[#6B7280] block mt-0.5">
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
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3D5F58] text-white font-sans text-xs font-bold rounded-md hover:bg-[#2E4742] transition"
            >
              <span>Resume Lesson</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* 5. Recently Studied Topics or Truthful Empty State */}
      {hasHistory && recentTopics.length > 0 ? (
        <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D8D8CF]">
            <h3 className="font-heading text-base font-bold text-[#231F20]">Recently Studied Topics</h3>
            <span className="font-mono text-xs font-bold text-[#6B7280] bg-[#FAF9F5] px-2 py-0.5 rounded border border-[#E5E5DC]">
              {recentTopics.length} RECORDED
            </span>
          </div>

          <div className="divide-y divide-[#D8D8CF]">
            {recentTopics.slice(0, 5).map((topic, idx) => {
              const isPython = topic.subjectId === 'python'
              const Icon = isPython ? Terminal : Code2

              return (
                <div
                  key={`${topic.topicId}-${idx}`}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D8D8CF] bg-[#FAF9F5] text-[#3D5F58]">
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-sm font-bold text-[#231F20]">
                          {topic.topicTitle}
                        </span>
                        <span className="font-mono text-[10px] uppercase font-bold text-[#3D5F58] bg-[#F2F2EB] px-1.5 py-0.2 rounded border border-[#D8D8CF]">
                          {isPython ? 'Python' : 'C++'}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[#6B7280]">
                        {new Date(topic.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/lessons/${topic.subjectId}/${topic.topicId}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#D8D8CF] text-xs font-mono font-bold text-[#231F20] rounded hover:bg-[#F2F2EB] transition"
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
        <div className="bg-[#FFFFFF] border border-dashed border-[#D8D8CF] rounded-lg p-8 text-center space-y-3">
          <BookOpen size={24} className="mx-auto text-[#6B7280]" />
          <h3 className="font-heading text-base font-bold text-[#231F20]">No Learning History Recorded Yet</h3>
          <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
            Your recent topics and practice attempts will appear here automatically when you study lessons in Python or C++.
          </p>
          <div className="pt-2">
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F2F2EB] text-[#231F20] font-mono text-xs font-bold rounded-md border border-[#D8D8CF] hover:bg-[#3D5F58] hover:text-white transition"
            >
              <Compass size={13} />
              <span>Start Exploring</span>
            </Link>
          </div>
        </div>
      ) : null}

      {/* 6. AI Tutor Footer Card */}
      <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#F2F2EB] text-[#3D5F58] border border-[#D8D8CF] shrink-0">
            <Sparkles size={20} className="text-[#F5B726]" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-[#231F20]">
              Stuck on a Concept or Code Bug?
            </h3>
            <p className="mt-0.5 text-xs text-[#6B7280] leading-relaxed">
              Chat directly with our AI Tutor powered by local Ollama (<code className="font-mono text-[#3D5F58]">qwen3:4b</code>). Ask for analogies, code traces, or syntax clarifications.
            </p>
          </div>
        </div>

        <Link
          to="/tutor"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3D5F58] text-white font-sans text-xs font-bold rounded-md hover:bg-[#2E4742] transition shrink-0"
        >
          <MessageSquare size={14} />
          <span>Launch AI Tutor</span>
        </Link>
      </div>
    </div>
  )
}

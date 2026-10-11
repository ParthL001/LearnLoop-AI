import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchLearnerProgress } from '../services/api'
import { useApp } from '../context/AppContext'
import {
  Compass,
  Clock,
  BookOpen,
  Terminal,
  Code2,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Award,
} from 'lucide-react'

export default function Progress() {
  const { user } = useApp()
  const learnerId = user?.id || user?.email || 'learner-local'

  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProgress = () => {
    setLoading(true)
    fetchLearnerProgress(learnerId)
      .then((data) => {
        setProgressData(data)
        setLoading(false)
      })
      .catch((err) => {
        console.warn('Progress load warning:', err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadProgress()
  }, [learnerId])

  const recentTopics = progressData?.recentlyStudiedTopics || []
  const practiceHistory = progressData?.practiceHistory || []
  const hasHistory =
    progressData?.hasRecordedHistory || recentTopics.length > 0 || practiceHistory.length > 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#3D5F58]"></span>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#3D5F58]">
              Learning Evidence & Mastery
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#231F20]">
            My Learning Progress
          </h1>
          <p className="text-sm text-[#4B5563] mt-1">
            Real tracked evidence from your studied topics and diagnostic practice sessions. Zero simulated or fabricated statistics.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadProgress}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#D8D8CF] text-xs font-mono font-bold text-[#231F20] rounded-md hover:bg-[#F2F2EB] transition"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#3D5F58] text-white text-xs font-bold rounded-md hover:bg-[#2E4742] transition shadow-xs"
          >
            <Compass size={14} />
            <span>Explore Topics</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-12 text-center text-xs text-[#6B7280] shadow-xs">
          <RefreshCw size={20} className="animate-spin text-[#3D5F58] mx-auto mb-2" />
          <span className="font-mono">Loading verified learning logs...</span>
        </div>
      ) : !hasHistory ? (
        /* Honest Empty State */
        <div className="bg-[#FFFFFF] border border-dashed border-[#D8D8CF] rounded-lg p-12 text-center space-y-4 shadow-xs">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#F2F2EB] text-[#3D5F58] border border-[#D8D8CF]">
            <BookOpen size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-lg font-bold text-[#231F20]">No Learning Evidence Recorded Yet</h3>
            <p className="text-xs text-[#6B7280] max-w-md mx-auto leading-relaxed font-sans">
              We present only genuine learning evidence based on lessons you review and practice answers evaluated by the system. Start with Python or C++ to record your first verified session.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#3D5F58] text-white text-xs font-bold rounded-md hover:bg-[#2E4742] transition shadow-xs"
            >
              <Compass size={14} />
              <span>Explore Programming Tracks</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      ) : (
        /* Genuine Evidence */
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-5 flex items-center justify-between shadow-xs">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Topics Studied
                </span>
                <div className="font-heading text-3xl font-extrabold text-[#231F20] mt-1">
                  {recentTopics.length}
                </div>
              </div>
              <div className="h-12 w-12 rounded-md bg-[#F2F2EB] border border-[#D8D8CF] text-[#3D5F58] flex items-center justify-center">
                <BookOpen size={22} />
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-5 flex items-center justify-between shadow-xs">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Practice Attempts
                </span>
                <div className="font-heading text-3xl font-extrabold text-[#231F20] mt-1">
                  {practiceHistory.length}
                </div>
              </div>
              <div className="h-12 w-12 rounded-md bg-[#F2F2EB] border border-[#D8D8CF] text-[#3D5F58] flex items-center justify-center">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          {/* Studied Topics List */}
          {recentTopics.length > 0 && (
            <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#D8D8CF] pb-3">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#3D5F58]" />
                  <h3 className="font-heading text-lg font-bold text-[#231F20]">Recorded Topics</h3>
                </div>
                <span className="font-mono text-xs font-bold text-[#3D5F58] bg-[#F2F2EB] px-2.5 py-0.5 rounded border border-[#D8D8CF]">
                  {recentTopics.length} LOGGED
                </span>
              </div>

              <div className="divide-y divide-[#D8D8CF]">
                {recentTopics.map((topic, idx) => {
                  const isPython = topic.subjectId === 'python'
                  const Icon = isPython ? Terminal : Code2

                  return (
                    <div
                      key={`${topic.topicId}-${idx}`}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#D8D8CF] bg-[#FAF9F5] text-[#3D5F58]">
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-heading text-base font-bold text-[#231F20]">
                              {topic.topicTitle}
                            </span>
                            <span className="font-mono text-[10px] uppercase font-bold text-[#3D5F58] bg-[#F2F2EB] px-1.5 py-0.2 rounded border border-[#D8D8CF]">
                              {isPython ? 'Python' : 'C++'}
                            </span>
                          </div>
                          <span className="font-mono text-xs text-[#6B7280]">
                            {new Date(topic.timestamp).toLocaleString([], {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/lessons/${topic.subjectId}/${topic.topicId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#D8D8CF] rounded text-xs font-mono font-bold text-[#231F20] hover:bg-[#F2F2EB] transition"
                      >
                        <span>Review</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Practice History List */}
          {practiceHistory.length > 0 && (
            <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-6 shadow-xs space-y-4">
              <div className="border-b border-[#D8D8CF] pb-3">
                <h3 className="font-heading text-lg font-bold text-[#231F20]">
                  Practice Activity Log
                </h3>
              </div>

              <div className="divide-y divide-[#D8D8CF]">
                {practiceHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-base font-bold text-[#231F20]">
                          {item.title || `Item ${item.questionId}`}
                        </span>
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                            item.isCorrect
                              ? 'bg-[#F0FDF4] text-[#166534] border-[#86EFAC]'
                              : 'bg-[#FEFCE8] text-[#854D0E] border-[#FDE047]'
                          }`}
                        >
                          {item.isCorrect ? 'CORRECT' : 'NEEDS REVIEW'}
                        </span>
                      </div>
                      {item.timestamp && (
                        <span className="font-mono text-xs text-[#6B7280]">
                          {new Date(item.timestamp).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

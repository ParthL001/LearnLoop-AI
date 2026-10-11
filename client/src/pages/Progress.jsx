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
    <div className="reveal-stagger space-y-6">
      {/* Page Header */}
      <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="eyebrow mb-1">
            Verified Evidence & Telemetry
          </div>
          <h1 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-[var(--text-main)]">
            My Learning Progress
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Real tracked records of your studied topics and diagnostic practice exercises. Zero simulated or fabricated metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadProgress}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
          <Link
            to="/explore"
            className="btn btn-primary btn-sm"
          >
            <Compass size={14} />
            <span>Explore Topics</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="card text-center p-12 space-y-3">
          <RefreshCw size={20} className="animate-spin text-[var(--accent-primary)] mx-auto mb-2" />
          <span className="font-mono text-xs text-[var(--text-muted)]">Loading verified learning logs...</span>
        </div>
      ) : !hasHistory ? (
        /* Honest Empty State */
        <div className="card text-center p-12 space-y-4 border-dashed">
          <div className="icon-tile mx-auto">
            <BookOpen size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-xl font-bold text-[var(--text-main)]">
              No Learning Evidence Recorded Yet
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto leading-relaxed font-sans">
              We present only genuine learning evidence based on lessons you review and practice answers evaluated by the system. Start with Python or C++ to record your first verified session.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/explore"
              className="btn btn-primary"
            >
              <Compass size={15} />
              <span>Explore Programming Tracks</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : (
        /* Genuine Evidence */
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="card flex items-center justify-between">
              <div>
                <span className="eyebrow text-[10px]">
                  Topics Studied
                </span>
                <div className="font-heading text-4xl font-extrabold text-[var(--text-main)] mt-1 tabular">
                  {recentTopics.length}
                </div>
              </div>
              <div className="icon-tile">
                <BookOpen size={22} />
              </div>
            </div>

            <div className="card flex items-center justify-between">
              <div>
                <span className="eyebrow text-[10px]">
                  Practice Attempts
                </span>
                <div className="font-heading text-4xl font-extrabold text-[var(--text-main)] mt-1 tabular">
                  {practiceHistory.length}
                </div>
              </div>
              <div className="icon-tile">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          {/* Studied Topics List */}
          {recentTopics.length > 0 && (
            <div className="card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-soft)]">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[var(--accent-primary)]" />
                  <h3 className="font-heading text-lg font-bold text-[var(--text-main)]">Recorded Topics</h3>
                </div>
                <span className="badge badge-neutral">
                  {recentTopics.length} LOGGED
                </span>
              </div>

              <div className="divide-y divide-[var(--border-soft)]">
                {recentTopics.map((topic, idx) => {
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
                            <span className="font-heading text-base font-bold text-[var(--text-main)]">
                              {topic.topicTitle}
                            </span>
                            <span className="badge badge-forest text-[9px] px-1.5 py-0.2">
                              {isPython ? 'Python' : 'C++'}
                            </span>
                          </div>
                          <span className="font-mono text-xs text-[var(--text-muted)]">
                            {new Date(topic.timestamp).toLocaleString([], {
                              dateStyle: 'medium',
                              timeStyle: 'short',
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
          )}

          {/* Practice History List */}
          {practiceHistory.length > 0 && (
            <div className="card space-y-4">
              <div className="pb-3 border-b border-[var(--border-soft)]">
                <h3 className="font-heading text-lg font-bold text-[var(--text-main)]">
                  Practice Activity Log
                </h3>
              </div>

              <div className="divide-y divide-[var(--border-soft)]">
                {practiceHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-base font-bold text-[var(--text-main)]">
                          {item.title || `Item ${item.questionId}`}
                        </span>
                        <span className={`badge ${item.isCorrect ? 'badge-forest' : 'badge-pink'}`}>
                          {item.isCorrect ? 'CORRECT' : 'NEEDS REVIEW'}
                        </span>
                      </div>
                      {item.timestamp && (
                        <span className="font-mono text-xs text-[var(--text-muted)]">
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

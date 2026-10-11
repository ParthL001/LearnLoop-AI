import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, Badge } from '../components/UI'
import { fetchLearnerProgress } from '../services/api'
import { useApp } from '../context/AppContext'
import {
  Compass, Clock, BookOpen, Terminal, Code2,
  ArrowRight, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react'

export default function Progress() {
  const { user } = useApp()
  const learnerId = user?.id || user?.email || 'learner-local'

  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadProgress = () => {
    setLoading(true)
    setError(null)
    fetchLearnerProgress(learnerId)
      .then((data) => {
        setProgressData(data)
        setLoading(false)
      })
      .catch((err) => {
        console.warn('Progress load warning:', err.message)
        setError('Unable to load progress telemetry.')
        setLoading(false)
      })
  }

  useEffect(() => {
    loadProgress()
  }, [learnerId])

  const recentTopics = progressData?.recentlyStudiedTopics || []
  const practiceHistory = progressData?.practiceHistory || []
  const hasHistory = progressData?.hasRecordedHistory || recentTopics.length > 0 || practiceHistory.length > 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#303846] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#F8FAFC] tracking-tight">My Progress</h1>
            <Badge variant="accent">Verified Telemetry</Badge>
          </div>
          <p className="mt-0.5 text-xs text-[#A8B3C4]">
            Real tracked records of your studied topics and practice exercises. No simulated metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={loadProgress}>
            <RefreshCw size={12} />
            <span>Refresh</span>
          </Button>
          <Link to="/explore">
            <Button variant="primary" size="sm">
              <Compass size={13} />
              <span>Explore Content</span>
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[8px] border border-[#303846] bg-[#14171C] p-12 text-center text-xs text-[#7F8A9B]">
          <RefreshCw size={18} className="animate-spin text-[#3B82F6] mx-auto mb-2" />
          <span>Loading verified learning records...</span>
        </div>
      ) : !hasHistory ? (
        /* Honest Empty State */
        <div className="rounded-[8px] border border-dashed border-[#303846] bg-[#14171C]/50 p-12 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1B2028] text-[#3B82F6] border border-[#303846]">
            <BookOpen size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#F8FAFC]">No Learning Records Yet</h3>
            <p className="text-xs text-[#A8B3C4] max-w-md mx-auto leading-relaxed">
              We only show honest progress derived from real lessons you open and practice activities you complete. Start learning a topic in Python or C++ to record your first achievement.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/explore">
              <Button variant="primary" size="sm">
                <Compass size={14} />
                <span>Explore Python & C++</span>
                <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Real Progress Data */
        <div className="space-y-6">
          {/* Summary Metric Cards (Honest numbers only) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[6px] border border-[#303846] bg-[#14171C] p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7F8A9B]">
                  Topics Studied
                </span>
                <div className="text-2xl font-bold text-[#F8FAFC] mt-0.5">
                  {recentTopics.length}
                </div>
              </div>
              <div className="h-10 w-10 rounded-[6px] bg-[#152746] border border-[#1E3A8A] text-[#3B82F6] flex items-center justify-center">
                <BookOpen size={20} />
              </div>
            </div>

            <div className="rounded-[6px] border border-[#303846] bg-[#14171C] p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7F8A9B]">
                  Practice Attempts
                </span>
                <div className="text-2xl font-bold text-[#F8FAFC] mt-0.5">
                  {practiceHistory.length}
                </div>
              </div>
              <div className="h-10 w-10 rounded-[6px] bg-[#1B2028] border border-[#303846] text-[#A8B3C4] flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </div>

          {/* Recently Studied Topics Table */}
          {recentTopics.length > 0 && (
            <Card
              header={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-[#3B82F6]" />
                    <h3 className="text-sm font-bold text-[#F8FAFC]">Studied Topics</h3>
                  </div>
                  <Badge variant="neutral">{recentTopics.length} Logged</Badge>
                </div>
              }
            >
              <div className="divide-y divide-[#303846]">
                {recentTopics.map((topic, idx) => {
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
                            {new Date(topic.timestamp).toLocaleString([], {
                              dateStyle: 'medium',
                              timeStyle: 'short'
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
          )}

          {/* Actual Practice History Log */}
          {practiceHistory.length > 0 && (
            <Card
              header={
                <h3 className="text-sm font-bold text-[#F8FAFC]">
                  Practice Activity Log
                </h3>
              }
            >
              <div className="divide-y divide-[#303846]">
                {practiceHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#F8FAFC]">
                          {item.title || `Item ${item.questionId}`}
                        </span>
                        <Badge variant={item.isCorrect ? 'success' : 'warning'}>
                          {item.isCorrect ? 'Correct' : 'Needs Review'}
                        </Badge>
                      </div>
                      {item.timestamp && (
                        <span className="text-[11px] text-[#7F8A9B]">
                          {new Date(item.timestamp).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

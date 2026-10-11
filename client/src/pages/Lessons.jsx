import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchSubjects, fetchDynamicLesson, trackTopicAccess } from '../services/api'
import { useApp } from '../context/AppContext'
import {
  ArrowLeft,
  Terminal,
  Code2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  HelpCircle,
  ArrowRight,
  RotateCw,
} from 'lucide-react'

const SUBJECT_CATALOG = {
  python: {
    id: 'python',
    name: 'Python',
    topics: [
      { id: 'data-types', title: 'Data Types', description: 'Primitive types (int, float, str, bool) and dynamic typing' },
      { id: 'variables', title: 'Variables', description: 'Naming conventions, variable assignment, and memory references' },
      { id: 'loops', title: 'Loops', description: 'For loops, while loops, range iteration, and loop control' },
      { id: 'stack', title: 'Stack', description: 'LIFO data structure behavior, push/pop operations with lists' },
      { id: 'queue', title: 'Queue', description: 'FIFO data structure behavior using collections.deque' },
    ],
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    topics: [
      { id: 'data-types', title: 'Data Types', description: 'Static types (int, double, char, bool) and memory sizes' },
      { id: 'variables', title: 'Variables', description: 'Variable declarations, scope, and constants' },
      { id: 'loops', title: 'Loops', description: 'For loops, while loops, and do-while iterative control' },
      { id: 'stack', title: 'Stack', description: 'LIFO container adapter behavior using std::stack' },
      { id: 'queue', title: 'Queue', description: 'FIFO container adapter behavior using std::queue' },
    ],
  },
}

export default function Lessons() {
  const { subject: subjectParam, id: legacyId, topicId: topicParam } = useParams()
  const navigate = useNavigate()
  const { user } = useApp()

  const resolvedSubjectId =
    subjectParam === 'cpp' || subjectParam === 'python'
      ? subjectParam
      : legacyId === 'cpp'
      ? 'cpp'
      : 'python'

  const resolvedTopicId =
    topicParam || (subjectParam && subjectParam !== 'python' && subjectParam !== 'cpp' ? subjectParam : null)

  const [activeSubjectId, setActiveSubjectId] = useState(resolvedSubjectId)
  const [selectedTopicId, setSelectedTopicId] = useState(resolvedTopicId)
  const [catalog, setCatalog] = useState(SUBJECT_CATALOG)
  const [accordionOpen, setAccordionOpen] = useState(true)

  // Lesson content state
  const [lessonData, setLessonData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null)

  // Interactive practice states
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [submittedAnswers, setSubmittedAnswers] = useState({})

  // Fetch subjects from backend on mount
  useEffect(() => {
    let mounted = true
    fetchSubjects()
      .then((subs) => {
        if (!mounted || !Array.isArray(subs)) return
        const map = {}
        subs.forEach((s) => {
          map[s.id] = s
        })
        setCatalog((prev) => ({ ...prev, ...map }))
      })
      .catch((err) => {
        console.warn('Backend subjects fetch warning:', err.message)
      })
    return () => {
      mounted = false
    }
  }, [])

  // Sync state if URL params change
  useEffect(() => {
    if (subjectParam && (subjectParam === 'python' || subjectParam === 'cpp')) {
      setActiveSubjectId(subjectParam)
    }
    if (topicParam) {
      setSelectedTopicId(topicParam)
    }
  }, [subjectParam, topicParam])

  // Load lesson when active subject or topic changes
  useEffect(() => {
    if (!selectedTopicId) {
      setLessonData(null)
      setError(null)
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)
    setSelectedAnswers({})
    setSubmittedAnswers({})

    fetchDynamicLesson(activeSubjectId, selectedTopicId)
      .then((res) => {
        if (!isMounted) return
        setLessonData(res)
        setLoading(false)

        const topicObj = catalog[activeSubjectId]?.topics?.find((t) => t.id === selectedTopicId)
        trackTopicAccess({
          learnerId: user?.id || user?.email || 'learner-local',
          subjectId: activeSubjectId,
          topicId: selectedTopicId,
          topicTitle: topicObj?.title || selectedTopicId,
          action: 'opened',
        })
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to generate lesson content.')
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [activeSubjectId, selectedTopicId])

  const handleSelectSubject = (subjId) => {
    setActiveSubjectId(subjId)
    setSelectedTopicId(null)
    navigate(`/lessons/${subjId}`)
  }

  const handleSelectTopic = (topId) => {
    setSelectedTopicId(topId)
    navigate(`/lessons/${activeSubjectId}/${topId}`)
  }

  const handleRetry = (forceRefresh = true) => {
    if (!selectedTopicId) return
    setLoading(true)
    setError(null)
    fetchDynamicLesson(activeSubjectId, selectedTopicId, forceRefresh)
      .then((res) => {
        setLessonData(res)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Retry generation failed.')
        setLoading(false)
      })
  }

  const handleCopyCode = (codeText, idx) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(codeText)
      setCopiedCodeIndex(idx)
      setTimeout(() => setCopiedCodeIndex(null), 2000)
    }
  }

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }))
  }

  const handleAnswerSubmit = (questionIndex) => {
    if (selectedAnswers[questionIndex] !== undefined) {
      setSubmittedAnswers((prev) => ({
        ...prev,
        [questionIndex]: true,
      }))
    }
  }

  const currentSubject = catalog[activeSubjectId] || SUBJECT_CATALOG.python
  const topicsList = currentSubject.topics || []
  const activeTopicObj = topicsList.find((t) => t.id === selectedTopicId)
  const isPython = activeSubjectId === 'python'
  const SubjectIcon = isPython ? Terminal : Code2

  return (
    <div className="reveal-stagger space-y-6">
      {/* Top Header / Breadcrumbs */}
      <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-mono text-xs text-[var(--text-muted)]">
          <Link
            to="/explore"
            className="flex items-center gap-1.5 font-bold text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition"
          >
            <ArrowLeft size={13} />
            <span>Explore</span>
          </Link>
          <span>/</span>
          <span className="font-bold text-[var(--text-main)]">{currentSubject.name}</span>
          {activeTopicObj && (
            <>
              <span>/</span>
              <span className="text-[var(--accent-primary)] font-bold">{activeTopicObj.title}</span>
            </>
          )}
        </div>

        {/* Language Track Selector Tabs */}
        <div className="tabs">
          <button
            type="button"
            onClick={() => handleSelectSubject('python')}
            aria-selected={activeSubjectId === 'python'}
            className="tab font-mono text-xs font-bold"
          >
            <Terminal size={12} className="inline mr-1" />
            Python
          </button>
          <button
            type="button"
            onClick={() => handleSelectSubject('cpp')}
            aria-selected={activeSubjectId === 'cpp'}
            className="tab font-mono text-xs font-bold"
          >
            <Code2 size={12} className="inline mr-1" />
            C++
          </button>
        </div>
      </div>

      {/* Accordion: Topic Selector Bar */}
      <div className="card p-0 overflow-hidden">
        <button
          type="button"
          onClick={() => setAccordionOpen(!accordionOpen)}
          className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-[var(--bg-surface-elevated)] transition"
        >
          <div className="flex items-center gap-3">
            <div className="icon-tile">
              <SubjectIcon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-bold text-[var(--text-main)]">
                  {currentSubject.name} Topic Navigator
                </span>
                <span className="badge badge-sky">
                  {topicsList.length} TOPICS
                </span>
              </div>
              <span className="text-xs text-[var(--text-muted)]">
                {selectedTopicId
                  ? `Active Topic: ${activeTopicObj?.title || selectedTopicId}`
                  : 'Select a topic to generate dynamic AI lesson content'}
              </span>
            </div>
          </div>
          <div className="text-[var(--text-muted)] pr-2">
            {accordionOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
        </button>

        {accordionOpen && (
          <div className="border-t border-[var(--border-soft)] p-4 grid gap-3 sm:grid-cols-5 bg-[var(--bg-surface-elevated)]">
            {topicsList.map((topic) => {
              const isSelected = topic.id === selectedTopicId
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleSelectTopic(topic.id)}
                  className={`flex flex-col items-start p-3.5 rounded-md border text-left transition ${
                    isSelected
                      ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] ring-2 ring-[var(--accent-primary)] shadow-card'
                      : 'border-[var(--border-soft)] bg-[var(--bg-surface)] text-[var(--text-body)] hover:border-[var(--accent-primary)]'
                  }`}
                >
                  <span className="font-heading text-sm font-bold text-[var(--text-main)]">{topic.title}</span>
                  <span className="font-mono text-[10px] text-[var(--text-muted)] mt-1 line-clamp-1">
                    {topic.description}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {!selectedTopicId ? (
        <div className="card text-center p-12 space-y-4 border-dashed">
          <div className="icon-tile mx-auto">
            <BookOpen size={22} />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-[var(--text-main)]">Choose a Topic to Begin</h3>
            <p className="mt-1 text-xs text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
              Select one of the {currentSubject.name} topics above to trigger dynamic AI lesson generation via local Ollama (<code className="font-mono text-[var(--accent-primary)] font-bold">qwen3:4b</code>).
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {topicsList.slice(0, 3).map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTopic(t.id)}
                className="btn btn-secondary btn-sm"
              >
                <span>{t.title}</span>
                <ArrowRight size={12} />
              </button>
            ))}
          </div>
        </div>
      ) : loading ? (
        <div className="card text-center p-12 space-y-4">
          <div className="icon-tile mx-auto">
            <RotateCw size={22} className="animate-spin text-[var(--accent-primary)]" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-[var(--text-main)]">
              Synthesizing Lesson: {activeTopicObj?.title}
            </h3>
            <p className="mt-1 text-xs text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
              Requesting structured conceptual models, runnable code traces, and common traps from Ollama (<code className="font-mono text-[var(--accent-primary)]">qwen3:4b</code>)...
            </p>
          </div>
          <div className="skeleton h-2 w-48 mx-auto" />
        </div>
      ) : error ? (
        <div className="card text-center p-10 space-y-4 border-[var(--danger)]">
          <div className="icon-tile mx-auto text-[var(--danger)]">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-[var(--danger)]">
              Lesson Generation Unavailable
            </h3>
            <p className="mt-1 text-xs text-[var(--danger)] max-w-lg mx-auto leading-relaxed">
              {error}
            </p>
            <p className="mt-2 text-xs text-[var(--text-muted)] max-w-md mx-auto">
              Please verify that Ollama is running locally with <code className="font-mono text-[var(--text-main)]">ollama serve</code> and that model <code className="font-mono text-[var(--text-main)]">qwen3:4b</code> is accessible.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => handleRetry(false)}
              className="btn btn-primary btn-sm"
            >
              <RefreshCw size={12} />
              <span>Retry Generation</span>
            </button>
            <Link
              to="/explore"
              className="btn btn-secondary btn-sm"
            >
              <span>Back to Catalog</span>
            </Link>
          </div>
        </div>
      ) : lessonData?.lesson ? (
        <div className="space-y-6">
          {(() => {
            const lesson = lessonData.lesson
            const isCached = lessonData.isCached

            return (
              <>
                {/* 1. Lesson Header */}
                <div className="card space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-soft)]">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="eyebrow text-xs">
                          {currentSubject.name} · {lesson.learnerLevel || 'Beginner'} Unit
                        </span>
                        {isCached ? (
                          <span className="badge badge-neutral text-[10px]">
                            Cached
                          </span>
                        ) : (
                          <span className="badge badge-ochre text-[10px]">
                            Fresh Qwen3:4b
                          </span>
                        )}
                      </div>
                      <h1 className="font-heading text-lg sm:text-xl font-bold text-[var(--text-main)]">
                        {lesson.topicTitle || activeTopicObj?.title}
                      </h1>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRetry(true)}
                        className="btn btn-secondary btn-sm"
                        title="Regenerate fresh lesson"
                      >
                        <RefreshCw size={12} />
                        <span>Regenerate</span>
                      </button>
                      <Link
                        to={`/tutor/${activeSubjectId}`}
                        className="btn btn-primary btn-sm"
                      >
                        <Sparkles size={13} className="text-[#F5B726]" />
                        <span>Ask AI Tutor</span>
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-4 pt-1">
                    <p className="text-sm text-[var(--text-body)] leading-relaxed">
                      {lesson.shortIntroduction}
                    </p>

                    {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
                      <div className="rounded-md border border-[var(--border-soft)] bg-[var(--bg-surface-elevated)] p-4 space-y-2">
                        <span className="eyebrow text-[10px] block">
                          Core Learning Objectives
                        </span>
                        <ul className="space-y-1.5 text-xs text-[var(--text-body)] font-sans">
                          {lesson.learningObjectives.map((obj, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle size={14} className="text-[var(--accent-primary)] shrink-0 mt-0.5" />
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Concept Explanation */}
                <div className="card space-y-4">
                  <div className="pb-3 border-b border-[var(--border-soft)]">
                    <span className="eyebrow text-xs mb-1">
                      Conceptual Deep Dive
                    </span>
                    <h2 className="font-heading text-xl font-bold text-[var(--text-main)]">
                      Concept Explanation
                    </h2>
                  </div>

                  <div className="text-sm text-[var(--text-body)] leading-relaxed whitespace-pre-line font-sans">
                    {lesson.conceptExplanation}
                  </div>

                  {lesson.simpleExamples && (
                    <div className="alert alert-info">
                      <Lightbulb size={18} className="shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider block">
                          Intuitive Real-World Analogy
                        </span>
                        <p className="text-xs leading-relaxed">
                          {lesson.simpleExamples}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Code Examples & Walkthrough */}
                {lesson.codeExamples && (
                  <div className="card space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--border-soft)]">
                      <div>
                        <span className="eyebrow text-xs mb-1">
                          Implementation
                        </span>
                        <h2 className="font-heading text-xl font-bold text-[var(--text-main)]">
                          Code Walkthrough ({currentSubject.name})
                        </h2>
                      </div>
                      <span className="badge badge-forest">
                        {isPython ? 'Python 3' : 'C++17 STL'}
                      </span>
                    </div>

                    {/* Dark Code Container with Mac Dots */}
                    <div className="rounded-lg overflow-hidden border border-black/20 shadow-card">
                      <div className="bg-[#1A1818] px-4 py-2 flex items-center justify-between text-xs font-mono text-[#D8D8CF]">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#E97B77] inline-block" />
                            <span className="w-2.5 h-2.5 rounded-full bg-[#F5B726] inline-block" />
                            <span className="w-2.5 h-2.5 rounded-full bg-[#3D8B6A] inline-block" />
                          </div>
                          <span className="text-[#8BB2DE] ml-2 flex items-center gap-1.5">
                            <Code2 size={13} />
                            {isPython ? 'main.py' : 'main.cpp'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(lesson.codeExamples, 0)}
                          className="btn btn-ghost-inverse btn-sm py-1 px-2 text-[10px]"
                        >
                          {copiedCodeIndex === 0 ? (
                            <>
                              <Check size={12} className="text-[#3D8B6A]" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre>
                        <code>{lesson.codeExamples}</code>
                      </pre>
                    </div>

                    {lesson.codeExplanation && (
                      <div className="space-y-1 pt-2">
                        <span className="eyebrow text-[10px]">
                          Execution Trace
                        </span>
                        <p className="text-xs text-[var(--text-body)] leading-relaxed whitespace-pre-line font-sans">
                          {lesson.codeExplanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Common Mistakes & Pitfalls */}
                {lesson.commonMistakes && (
                  <div className="alert alert-warning">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <div className="space-y-1 w-full">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider block">
                        Common Mistakes to Avoid
                      </span>
                      <div className="text-xs leading-relaxed whitespace-pre-line font-sans">
                        {lesson.commonMistakes}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Key Takeaways Recap */}
                {lesson.shortRecap && (
                  <div className="card flex items-start gap-4">
                    <div className="icon-tile shrink-0">
                      <Lightbulb size={20} className="text-[#F5B726]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-heading text-lg font-bold text-[var(--text-main)]">
                        Key Takeaways Recap
                      </h3>
                      <p className="text-xs text-[var(--text-body)] leading-relaxed font-sans">
                        {lesson.shortRecap}
                      </p>
                    </div>
                  </div>
                )}

                {/* 6. Interactive Practice Questions (3 checks) */}
                {lesson.practiceQuestions && lesson.practiceQuestions.length > 0 && (
                  <div className="card space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--border-soft)]">
                      <div className="flex items-center gap-2.5">
                        <div className="icon-tile" style={{ width: '2.4rem', height: '2.4rem' }}>
                          <HelpCircle size={16} />
                        </div>
                        <div>
                          <h2 className="font-heading text-lg font-bold text-[var(--text-main)]">
                            Interactive Knowledge Checks
                          </h2>
                          <span className="text-xs text-[var(--text-muted)]">Verify your mental model</span>
                        </div>
                      </div>
                      <span className="badge badge-ochre">
                        {lesson.practiceQuestions.length} PRACTICE CHECKS
                      </span>
                    </div>

                    <div className="space-y-5">
                      {lesson.practiceQuestions.map((q, qIdx) => {
                        const isSubmitted = submittedAnswers[qIdx]
                        const selectedOpt = selectedAnswers[qIdx]
                        const targetCorrect =
                          q.correctIndex !== undefined
                            ? q.correctIndex
                            : q.correctAnswerIndex !== undefined
                            ? q.correctAnswerIndex
                            : q.correct_answer ?? 0
                        const isCorrect = selectedOpt === targetCorrect

                        return (
                          <div
                            key={qIdx}
                            className="rounded-lg border border-[var(--border-soft)] bg-[var(--bg-surface-elevated)] p-4 sm:p-5 space-y-3 shadow-xs"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="font-heading text-base font-bold text-[var(--text-main)]">
                                {qIdx + 1}. {q.prompt || q.question}
                              </span>
                              {isSubmitted && (
                                <span className={`badge ${isCorrect ? 'badge-forest' : 'badge-pink'}`}>
                                  {isCorrect ? 'CORRECT' : 'REVIEW'}
                                </span>
                              )}
                            </div>

                            {/* Options */}
                            <div className="space-y-2">
                              {q.options?.map((opt, optIdx) => {
                                const isOptionSelected = selectedOpt === optIdx
                                let optClass = 'border-[var(--border-soft)] bg-[var(--bg-surface)] text-[var(--text-main)] hover:border-[var(--accent-primary)]'

                                if (isSubmitted) {
                                  if (optIdx === targetCorrect) {
                                    optClass = 'border-[#3D8B6A] bg-[#E7F3EC] text-[#1F5A40] font-semibold'
                                  } else if (isOptionSelected && !isCorrect) {
                                    optClass = 'border-[#D4524D] bg-[#FBE5E3] text-[#8C2925]'
                                  }
                                } else if (isOptionSelected) {
                                  optClass = 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)] bg-[var(--bg-surface)] font-semibold'
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    disabled={isSubmitted}
                                    onClick={() => handleAnswerSelect(qIdx, optIdx)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-md border text-left text-xs transition shadow-xs ${optClass}`}
                                  >
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-mono font-bold">
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span className="font-sans">{opt}</span>
                                  </button>
                                )
                              })}
                            </div>

                            {/* Submit or Explanation */}
                            {!isSubmitted ? (
                              <div className="pt-2 flex justify-end">
                                <button
                                  type="button"
                                  disabled={selectedOpt === undefined}
                                  onClick={() => handleAnswerSubmit(qIdx)}
                                  className="btn btn-primary btn-sm"
                                >
                                  <span>Submit Check</span>
                                </button>
                              </div>
                            ) : (
                              <div className="alert alert-info text-xs space-y-1">
                                <span className="font-mono text-xs font-bold uppercase block">
                                  {isCorrect ? 'Accurate Understanding' : 'Concept Explanation'}
                                </span>
                                <p className="font-sans leading-relaxed">
                                  {q.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )
          })()}
        </div>
      ) : null}
    </div>
  )
}

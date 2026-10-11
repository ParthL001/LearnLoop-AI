import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, Button, Badge } from '../components/UI'
import { fetchSubjects, fetchDynamicLesson, trackTopicAccess } from '../services/api'
import { useApp } from '../context/AppContext'
import {
  ArrowLeft, Terminal, Code2, ChevronDown, ChevronRight,
  BookOpen, CheckCircle, AlertTriangle, Lightbulb, Copy, Check,
  RefreshCw, Sparkles, HelpCircle, ArrowRight
} from 'lucide-react'

// Fallback topics catalog if backend is connecting
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
    ]
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
    ]
  }
}

export default function Lessons() {
  const { subject: subjectParam, id: legacyId, topicId: topicParam } = useParams()
  const navigate = useNavigate()
  const { user } = useApp()

  // Handle URL matching: /lessons/:subject/:topicId, /lessons/:id, or default
  const resolvedSubjectId = (subjectParam === 'cpp' || subjectParam === 'python')
    ? subjectParam
    : (legacyId === 'cpp' ? 'cpp' : 'python')

  const resolvedTopicId = topicParam || (subjectParam && subjectParam !== 'python' && subjectParam !== 'cpp' ? subjectParam : null)

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

        // Track real student progress on backend
        const topicObj = catalog[activeSubjectId]?.topics?.find((t) => t.id === selectedTopicId)
        trackTopicAccess({
          learnerId: user?.id || user?.email || 'learner-local',
          subjectId: activeSubjectId,
          topicId: selectedTopicId,
          topicTitle: topicObj?.title || selectedTopicId,
          action: 'opened'
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
      [questionIndex]: optionIndex
    }))
  }

  const handleAnswerSubmit = (questionIndex) => {
    if (selectedAnswers[questionIndex] !== undefined) {
      setSubmittedAnswers((prev) => ({
        ...prev,
        [questionIndex]: true
      }))
    }
  }

  const currentSubject = catalog[activeSubjectId] || SUBJECT_CATALOG.python
  const topicsList = currentSubject.topics || []
  const activeTopicObj = topicsList.find((t) => t.id === selectedTopicId)
  const isPython = activeSubjectId === 'python'
  const SubjectIcon = isPython ? Terminal : Code2

  return (
    <div className="space-y-6">
      {/* Top Header / Navigation Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#303846] pb-4">
        <div className="flex items-center gap-2">
          <Link
            to="/explore"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#3B82F6] hover:text-[#60A5FA] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Explore Content</span>
          </Link>
          <span className="text-[#7F8A9B]">/</span>
          <span className="text-xs font-semibold text-[#F8FAFC]">
            {currentSubject.name}
          </span>
          {activeTopicObj && (
            <>
              <span className="text-[#7F8A9B]">/</span>
              <span className="text-xs text-[#A8B3C4]">{activeTopicObj.title}</span>
            </>
          )}
        </div>

        {/* Subject Switcher Buttons */}
        <div className="flex items-center gap-2 bg-[#14171C] p-1 rounded-[6px] border border-[#303846]">
          <button
            type="button"
            onClick={() => handleSelectSubject('python')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-all ${
              activeSubjectId === 'python'
                ? 'bg-[#152746] text-[#3B82F6] font-semibold border border-[#1E3A8A]'
                : 'text-[#A8B3C4] hover:text-[#F8FAFC]'
            }`}
          >
            <Terminal size={13} />
            <span>Python</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectSubject('cpp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-all ${
              activeSubjectId === 'cpp'
                ? 'bg-[#152746] text-[#3B82F6] font-semibold border border-[#1E3A8A]'
                : 'text-[#A8B3C4] hover:text-[#F8FAFC]'
            }`}
          >
            <Code2 size={13} />
            <span>C++</span>
          </button>
        </div>
      </div>

      {/* Accordion: Topic Selector Bar */}
      <div className="rounded-[8px] border border-[#303846] bg-[#14171C] overflow-hidden">
        <button
          type="button"
          onClick={() => setAccordionOpen(!accordionOpen)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-[#1B2028] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#1B2028] text-[#3B82F6] border border-[#303846]">
              <SubjectIcon size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#F8FAFC]">
                  {currentSubject.name} Curriculum Topics
                </span>
                <Badge variant="neutral">{topicsList.length} Topics</Badge>
              </div>
              <span className="text-[11px] text-[#7F8A9B]">
                {selectedTopicId
                  ? `Active: ${activeTopicObj?.title || selectedTopicId}`
                  : 'Select a topic to generate dynamic AI lesson content'}
              </span>
            </div>
          </div>
          <div className="text-[#7F8A9B]">
            {accordionOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
        </button>

        {accordionOpen && (
          <div className="border-t border-[#303846] p-3 grid gap-2 sm:grid-cols-5 bg-[#0B0D10]/50">
            {topicsList.map((topic) => {
              const isSelected = topic.id === selectedTopicId
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleSelectTopic(topic.id)}
                  className={`flex flex-col items-start p-3 rounded-[6px] border text-left transition-all ${
                    isSelected
                      ? 'border-[#3B82F6] bg-[#152746] text-[#F8FAFC]'
                      : 'border-[#303846] bg-[#14171C] text-[#A8B3C4] hover:border-[#3B82F6]/50 hover:text-[#F8FAFC]'
                  }`}
                >
                  <span className="text-xs font-bold">{topic.title}</span>
                  <span className="text-[10px] text-[#7F8A9B] mt-1 line-clamp-1">
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
        /* Empty State: Prompt to select a topic */
        <div className="rounded-[8px] border border-dashed border-[#303846] bg-[#14171C]/50 p-12 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1B2028] text-[#3B82F6] border border-[#303846]">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC]">Choose a Topic to Learn</h3>
            <p className="mt-1 text-xs text-[#A8B3C4] max-w-md mx-auto leading-relaxed">
              Click any of the {currentSubject.name} topics above to trigger dynamic AI lesson generation powered by locally running Ollama (qwen3:4b).
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            {topicsList.slice(0, 3).map((t) => (
              <Button
                key={t.id}
                size="sm"
                variant="secondary"
                onClick={() => handleSelectTopic(t.id)}
              >
                <span>Start {t.title}</span>
                <ArrowRight size={13} />
              </Button>
            ))}
          </div>
        </div>
      ) : loading ? (
        /* Loading State: Generating with Ollama */
        <div className="rounded-[8px] border border-[#303846] bg-[#14171C] p-12 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1B2028] text-[#3B82F6] border border-[#303846] animate-pulse">
            <RefreshCw size={22} className="animate-spin text-[#3B82F6]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC]">
              Generating Lesson: {activeTopicObj?.title}
            </h3>
            <p className="mt-1 text-xs text-[#A8B3C4] max-w-md mx-auto leading-relaxed">
              Requesting structured lesson content, code examples, and practice checks from your local Ollama instance (<code className="text-[#3B82F6]">qwen3:4b</code>).
            </p>
          </div>
          <div className="text-[11px] text-[#7F8A9B]">
            This typically takes a few seconds on your local GPU.
          </div>
        </div>
      ) : error ? (
        /* Error State: Honest Ollama Failure */
        <div className="rounded-[8px] border border-[#EF4444]/30 bg-[#14171C] p-8 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC]">
              Lesson Generation Unavailable
            </h3>
            <p className="mt-1 text-xs text-[#EF4444] max-w-lg mx-auto leading-relaxed">
              {error}
            </p>
            <p className="mt-2 text-xs text-[#7F8A9B] max-w-md mx-auto">
              Please verify that Ollama is running locally with <code className="text-[#A8B3C4]">ollama serve</code> and that the <code className="text-[#A8B3C4]">qwen3:4b</code> model is pulled.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Button variant="primary" size="sm" onClick={() => handleRetry(false)}>
              <RefreshCw size={13} />
              <span>Retry Generation</span>
            </Button>
            <Link to="/explore">
              <Button variant="secondary" size="sm">
                <span>Back to Explore</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : lessonData?.lesson ? (
        /* Render Structured Lesson */
        <div className="space-y-6">
          {(() => {
            const lesson = lessonData.lesson
            const isCached = lessonData.isCached

            return (
              <>
                {/* 1. Lesson Header */}
                <Card
                  header={
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7F8A9B]">
                            {currentSubject.name} · {lesson.learnerLevel || 'Beginner'} Unit
                          </span>
                          {isCached ? (
                            <Badge variant="neutral">Cached Lesson</Badge>
                          ) : (
                            <Badge variant="accent">Generated by qwen3:4b</Badge>
                          )}
                        </div>
                        <h2 className="text-lg font-bold text-[#F8FAFC] mt-0.5">
                          {lesson.topicTitle || activeTopicObj?.title}
                        </h2>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRetry(true)}
                          title="Generate fresh lesson with Ollama"
                        >
                          <RefreshCw size={13} />
                          <span>Regenerate</span>
                        </Button>
                        <Link to={`/tutor/${activeSubjectId}`}>
                          <Button variant="primary" size="sm">
                            <Sparkles size={13} />
                            <span>Ask Tutor About This</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    {/* Short Introduction */}
                    <p className="text-xs text-[#A8B3C4] leading-relaxed">
                      {lesson.shortIntroduction}
                    </p>

                    {/* Learning Objectives */}
                    {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
                      <div className="rounded-[6px] border border-[#303846] bg-[#1B2028] p-3.5 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7F8A9B] block">
                          Core Learning Objectives
                        </span>
                        <ul className="space-y-1.5 text-xs text-[#A8B3C4]">
                          {lesson.learningObjectives.map((obj, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle size={14} className="text-[#3B82F6] shrink-0 mt-0.5" />
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>

                {/* 2. Concept Explanation */}
                <Card
                  header={
                    <h3 className="text-sm font-bold text-[#F8FAFC]">
                      Concept Explanation
                    </h3>
                  }
                >
                  <div className="space-y-4">
                    <div className="text-xs text-[#A8B3C4] leading-relaxed whitespace-pre-line">
                      {lesson.conceptExplanation}
                    </div>

                    {lesson.simpleExamples && (
                      <div className="rounded-[6px] border border-[#303846] bg-[#1B2028] p-3.5 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#3B82F6] block">
                          Intuitive Real-World Analogy
                        </span>
                        <p className="text-xs text-[#A8B3C4] leading-relaxed">
                          {lesson.simpleExamples}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* 3. Code Examples & Walkthrough */}
                {lesson.codeExamples && (
                  <Card
                    header={
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-[#F8FAFC]">
                          Code Implementation ({currentSubject.name})
                        </h3>
                        <Badge variant="neutral">{isPython ? 'Python 3' : 'C++17'}</Badge>
                      </div>
                    }
                  >
                    <div className="space-y-4">
                      {/* Code Block with Copy Button and Horizontal Overflow */}
                      <div className="relative rounded-[6px] border border-[#303846] bg-[#080A0D] overflow-hidden">
                        <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-[#303846] bg-[#14171C] text-[11px] text-[#7F8A9B]">
                          <span className="font-mono">{isPython ? 'example.py' : 'example.cpp'}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(lesson.codeExamples, 0)}
                            className="flex items-center gap-1 hover:text-[#F8FAFC] transition-colors"
                          >
                            {copiedCodeIndex === 0 ? (
                              <>
                                <Check size={12} className="text-[#22C55E]" />
                                <span className="text-[#22C55E]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 text-xs font-mono text-[#F8FAFC] overflow-x-auto leading-relaxed">
                          <code>{lesson.codeExamples}</code>
                        </pre>
                      </div>

                      {/* Step-by-Step Explanation of Code */}
                      {lesson.codeExplanation && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7F8A9B] block">
                            Step-by-Step Code Walkthrough
                          </span>
                          <p className="text-xs text-[#A8B3C4] leading-relaxed whitespace-pre-line">
                            {lesson.codeExplanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* 4. Common Mistakes & Pitfalls */}
                {lesson.commonMistakes && (
                  <Card
                    header={
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={15} className="text-[#F59E0B]" />
                        <h3 className="text-sm font-bold text-[#F8FAFC]">
                          Common Mistakes to Avoid
                        </h3>
                      </div>
                    }
                  >
                    <div className="text-xs text-[#A8B3C4] leading-relaxed whitespace-pre-line">
                      {lesson.commonMistakes}
                    </div>
                  </Card>
                )}

                {/* 5. Short Recap */}
                {lesson.shortRecap && (
                  <div className="rounded-[6px] border border-[#303846] bg-[#1B2028] p-4 flex items-start gap-3">
                    <Lightbulb size={18} className="text-[#3B82F6] shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <span className="font-bold text-[#F8FAFC] block">Key Takeaways</span>
                      <p className="text-[#A8B3C4] leading-relaxed">
                        {lesson.shortRecap}
                      </p>
                    </div>
                  </div>
                )}

                {/* 6. Interactive Practice Questions (3 questions) */}
                {lesson.practiceQuestions && lesson.practiceQuestions.length > 0 && (
                  <Card
                    header={
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HelpCircle size={15} className="text-[#3B82F6]" />
                          <h3 className="text-sm font-bold text-[#F8FAFC]">
                            Interactive Knowledge Check
                          </h3>
                        </div>
                        <Badge variant="accent">3 Practice Checks</Badge>
                      </div>
                    }
                  >
                    <div className="space-y-6">
                      {lesson.practiceQuestions.map((q, qIdx) => {
                        const isSubmitted = submittedAnswers[qIdx]
                        const selectedOpt = selectedAnswers[qIdx]
                        const targetCorrect = q.correctIndex !== undefined ? q.correctIndex : (q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : q.correct_answer ?? 0)
                        const isCorrect = selectedOpt === targetCorrect

                        return (
                          <div
                            key={qIdx}
                            className="rounded-[6px] border border-[#303846] bg-[#1B2028] p-4 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="text-xs font-bold text-[#F8FAFC]">
                                {qIdx + 1}. {q.prompt || q.question}
                              </span>
                              {isSubmitted && (
                                <Badge variant={isCorrect ? 'success' : 'warning'}>
                                  {isCorrect ? 'Correct' : 'Needs Review'}
                                </Badge>
                              )}
                            </div>

                            {/* Options List */}
                            <div className="space-y-2">
                              {q.options?.map((opt, optIdx) => {
                                const isOptionSelected = selectedOpt === optIdx
                                let optClass = 'border-[#303846] bg-[#14171C] text-[#A8B3C4] hover:border-[#3B82F6]/50'

                                if (isSubmitted) {
                                  if (optIdx === targetCorrect) {
                                    optClass = 'border-[#22C55E] bg-[#052E16] text-[#86EFAC]'
                                  } else if (isOptionSelected && !isCorrect) {
                                    optClass = 'border-[#EF4444] bg-[#450A0A] text-[#FCA5A5]'
                                  }
                                } else if (isOptionSelected) {
                                  optClass = 'border-[#3B82F6] bg-[#152746] text-[#F8FAFC]'
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    disabled={isSubmitted}
                                    onClick={() => handleAnswerSelect(qIdx, optIdx)}
                                    className={`w-full flex items-center gap-3 p-2.5 rounded-[4px] border text-left text-xs transition-all ${optClass}`}
                                  >
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-bold">
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span>{opt}</span>
                                  </button>
                                )
                              })}
                            </div>

                            {/* Submit & Explanation */}
                            {!isSubmitted ? (
                              <div className="pt-1 flex justify-end">
                                <Button
                                  size="sm"
                                  variant="primary"
                                  disabled={selectedOpt === undefined}
                                  onClick={() => handleAnswerSubmit(qIdx)}
                                >
                                  <span>Check Answer</span>
                                </Button>
                              </div>
                            ) : (
                              <div className="rounded-[4px] border border-[#303846] bg-[#14171C] p-3 text-xs space-y-1">
                                <span className="font-bold text-[#F8FAFC] block">
                                  {isCorrect ? 'Well done!' : 'Explanation:'}
                                </span>
                                <p className="text-[#A8B3C4] leading-relaxed">
                                  {q.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </Card>
                )}
              </>
            )
          })()}
        </div>
      ) : null}
    </div>
  )
}

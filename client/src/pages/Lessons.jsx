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
    <div className="space-y-6">
      {/* Top Header / Breadcrumbs */}
      <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-mono text-xs text-[#6B7280]">
          <Link
            to="/explore"
            className="flex items-center gap-1.5 font-bold text-[#3D5F58] hover:text-[#2E4742] transition"
          >
            <ArrowLeft size={13} />
            <span>Explore</span>
          </Link>
          <span>/</span>
          <span className="font-bold text-[#231F20]">{currentSubject.name}</span>
          {activeTopicObj && (
            <>
              <span>/</span>
              <span className="text-[#3D5F58] font-bold">{activeTopicObj.title}</span>
            </>
          )}
        </div>

        {/* Language Track Selector */}
        <div className="flex items-center gap-1.5 bg-[#F2F2EB] p-1 rounded-md border border-[#D8D8CF]">
          <button
            type="button"
            onClick={() => handleSelectSubject('python')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition ${
              activeSubjectId === 'python'
                ? 'bg-[#3D5F58] text-white shadow-xs'
                : 'text-[#4B5563] hover:text-[#231F20]'
            }`}
          >
            <Terminal size={12} />
            <span>Python</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectSubject('cpp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition ${
              activeSubjectId === 'cpp'
                ? 'bg-[#3D5F58] text-white shadow-xs'
                : 'text-[#4B5563] hover:text-[#231F20]'
            }`}
          >
            <Code2 size={12} />
            <span>C++</span>
          </button>
        </div>
      </div>

      {/* Accordion: Topic Selector Bar */}
      <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setAccordionOpen(!accordionOpen)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-[#FAF9F5] transition"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#F2F2EB] text-[#3D5F58] border border-[#D8D8CF]">
              <SubjectIcon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-base font-bold text-[#231F20]">
                  {currentSubject.name} Topic Navigator
                </span>
                <span className="font-mono text-[10px] text-[#3D5F58] bg-[#F2F2EB] px-2 py-0.2 rounded border border-[#D8D8CF]">
                  {topicsList.length} TOPICS
                </span>
              </div>
              <span className="text-xs text-[#6B7280]">
                {selectedTopicId
                  ? `Active Topic: ${activeTopicObj?.title || selectedTopicId}`
                  : 'Select a topic to generate dynamic AI lesson content'}
              </span>
            </div>
          </div>
          <div className="text-[#6B7280]">
            {accordionOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
        </button>

        {accordionOpen && (
          <div className="border-t border-[#D8D8CF] p-3 grid gap-2 sm:grid-cols-5 bg-[#FAF9F5]">
            {topicsList.map((topic) => {
              const isSelected = topic.id === selectedTopicId
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleSelectTopic(topic.id)}
                  className={`flex flex-col items-start p-3 rounded-md border text-left transition ${
                    isSelected
                      ? 'border-[#3D5F58] bg-[#FFFFFF] ring-2 ring-[#3D5F58] text-[#231F20]'
                      : 'border-[#D8D8CF] bg-[#FFFFFF] text-[#4B5563] hover:border-[#3D5F58] hover:text-[#231F20]'
                  }`}
                >
                  <span className="font-heading text-sm font-bold text-[#231F20]">{topic.title}</span>
                  <span className="font-mono text-[10px] text-[#6B7280] mt-1 line-clamp-1">
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
        <div className="bg-[#FFFFFF] border border-dashed border-[#D8D8CF] rounded-lg p-12 text-center space-y-4 shadow-xs">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#F2F2EB] text-[#3D5F58] border border-[#D8D8CF]">
            <BookOpen size={22} />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-[#231F20]">Choose a Topic to Begin</h3>
            <p className="mt-1 text-xs text-[#6B7280] max-w-md mx-auto leading-relaxed">
              Select one of the {currentSubject.name} topics above to trigger dynamic AI lesson generation via local Ollama (<code className="font-mono text-[#3D5F58]">qwen3:4b</code>).
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {topicsList.slice(0, 3).map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTopic(t.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F2F2EB] border border-[#D8D8CF] text-xs font-mono font-bold text-[#231F20] rounded hover:bg-[#3D5F58] hover:text-white transition"
              >
                <span>{t.title}</span>
                <ArrowRight size={12} />
              </button>
            ))}
          </div>
        </div>
      ) : loading ? (
        <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-12 text-center space-y-4 shadow-xs">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#F2F2EB] text-[#3D5F58] border border-[#D8D8CF]">
            <RotateCw size={22} className="animate-spin text-[#3D5F58]" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-[#231F20]">
              Synthesizing Lesson: {activeTopicObj?.title}
            </h3>
            <p className="mt-1 text-xs text-[#6B7280] max-w-md mx-auto leading-relaxed">
              Requesting structured conceptual explanations, runnable code traces, common traps, and interactive checks from Ollama (<code className="font-mono text-[#3D5F58]">qwen3:4b</code>).
            </p>
          </div>
          <div className="font-mono text-[11px] text-[#9CA3AF]">
            Processing locally on your GPU/CPU...
          </div>
        </div>
      ) : error ? (
        <div className="bg-[#FFFFFF] border border-[#FECDD3] rounded-lg p-8 text-center space-y-4 shadow-xs">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-[#9F1239]">
              Lesson Generation Unavailable
            </h3>
            <p className="mt-1 text-xs text-[#9F1239] max-w-lg mx-auto leading-relaxed">
              {error}
            </p>
            <p className="mt-2 text-xs text-[#6B7280] max-w-md mx-auto">
              Please verify that Ollama is running locally with <code className="font-mono text-[#231F20]">ollama serve</code> and that model <code className="font-mono text-[#231F20]">qwen3:4b</code> is accessible.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => handleRetry(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3D5F58] text-white text-xs font-bold rounded-md hover:bg-[#2E4742] transition"
            >
              <RefreshCw size={12} />
              <span>Retry Generation</span>
            </button>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#D8D8CF] text-xs font-bold text-[#231F20] rounded-md hover:bg-[#F2F2EB] transition"
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
                <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D8D8CF]">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#3D5F58]">
                          {currentSubject.name} · {lesson.learnerLevel || 'Beginner'} Unit
                        </span>
                        {isCached ? (
                          <span className="font-mono text-[10px] text-[#6B7280] bg-[#FAF9F5] px-2 py-0.5 rounded border border-[#E5E5DC]">
                            Cached
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] font-bold text-[#231F20] bg-[#F5B726] px-2 py-0.5 rounded">
                            Fresh Qwen3:4b
                          </span>
                        )}
                      </div>
                      <h1 className="font-heading text-2xl font-extrabold text-[#231F20]">
                        {lesson.topicTitle || activeTopicObj?.title}
                      </h1>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRetry(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#D8D8CF] text-xs font-mono font-bold text-[#231F20] rounded-md hover:bg-[#F2F2EB] transition"
                        title="Regenerate fresh lesson"
                      >
                        <RefreshCw size={12} />
                        <span>Regenerate</span>
                      </button>
                      <Link
                        to={`/tutor/${activeSubjectId}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#3D5F58] text-white text-xs font-bold rounded-md hover:bg-[#2E4742] transition"
                      >
                        <Sparkles size={13} className="text-[#F5B726]" />
                        <span>Ask AI Tutor</span>
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    <p className="text-sm text-[#4B5563] leading-relaxed">
                      {lesson.shortIntroduction}
                    </p>

                    {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
                      <div className="rounded-md border border-[#D8D8CF] bg-[#FAF9F5] p-4 space-y-2">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#3D5F58] block">
                          Core Learning Objectives
                        </span>
                        <ul className="space-y-1.5 text-xs text-[#231F20] font-sans">
                          {lesson.learningObjectives.map((obj, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle size={14} className="text-[#3D5F58] shrink-0 mt-0.5" />
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Concept Explanation */}
                <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-6 shadow-xs space-y-4">
                  <div className="border-b border-[#D8D8CF] pb-3">
                    <h2 className="font-heading text-lg font-bold text-[#231F20]">
                      Deep Concept Explanation
                    </h2>
                  </div>

                  <div className="text-sm text-[#374151] leading-relaxed whitespace-pre-line font-sans">
                    {lesson.conceptExplanation}
                  </div>

                  {lesson.simpleExamples && (
                    <div className="rounded-md border border-[#D8D8CF] bg-[#FAF9F5] p-4 space-y-1">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#3D5F58] block">
                        Intuitive Real-World Analogy
                      </span>
                      <p className="text-xs text-[#4B5563] leading-relaxed">
                        {lesson.simpleExamples}
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Code Examples & Walkthrough */}
                {lesson.codeExamples && (
                  <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#D8D8CF] pb-3">
                      <h2 className="font-heading text-lg font-bold text-[#231F20]">
                        Code Walkthrough ({currentSubject.name})
                      </h2>
                      <span className="font-mono text-xs font-bold text-[#3D5F58] bg-[#F2F2EB] px-2 py-0.5 rounded border border-[#D8D8CF]">
                        {isPython ? 'Python 3' : 'C++17 STL'}
                      </span>
                    </div>

                    {/* Dark Code Container */}
                    <div className="rounded-md bg-[#231F20] border border-[#3D5F58]/30 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-[#3D5F58]/20 bg-[#1A1818] text-xs font-mono text-[#D8D8CF]">
                        <span className="text-[#8BB2DE] flex items-center gap-1.5">
                          <Code2 size={13} />
                          {isPython ? 'main.py' : 'main.cpp'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(lesson.codeExamples, 0)}
                          className="flex items-center gap-1 hover:text-white transition"
                        >
                          {copiedCodeIndex === 0 ? (
                            <>
                              <Check size={12} className="text-[#22C55E]" />
                              <span className="text-[#22C55E]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-4 text-xs font-mono text-[#F2F2EB] overflow-x-auto leading-relaxed">
                        <code>{lesson.codeExamples}</code>
                      </pre>
                    </div>

                    {lesson.codeExplanation && (
                      <div className="space-y-1.5 pt-2">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6B7280] block">
                          Step-by-Step Code Execution Logic
                        </span>
                        <p className="text-xs text-[#4B5563] leading-relaxed whitespace-pre-line font-sans">
                          {lesson.codeExplanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Common Mistakes & Pitfalls */}
                {lesson.commonMistakes && (
                  <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-6 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 border-b border-[#D8D8CF] pb-3">
                      <AlertTriangle size={16} className="text-[#E97B77]" />
                      <h2 className="font-heading text-lg font-bold text-[#231F20]">
                        Common Mistakes & Pitfalls to Avoid
                      </h2>
                    </div>
                    <div className="text-xs text-[#4B5563] leading-relaxed whitespace-pre-line font-sans">
                      {lesson.commonMistakes}
                    </div>
                  </div>
                )}

                {/* 5. Key Takeaways Recap */}
                {lesson.shortRecap && (
                  <div className="rounded-lg border border-[#D8D8CF] bg-[#FAF9F5] p-5 flex items-start gap-3 shadow-xs">
                    <div className="p-2 bg-[#F2F2EB] text-[#3D5F58] rounded-md border border-[#D8D8CF] shrink-0">
                      <Lightbulb size={18} className="text-[#F5B726]" />
                    </div>
                    <div className="text-xs space-y-1">
                      <span className="font-heading text-base font-bold text-[#231F20] block">
                        Key Takeaways Recap
                      </span>
                      <p className="text-[#4B5563] leading-relaxed font-sans">
                        {lesson.shortRecap}
                      </p>
                    </div>
                  </div>
                )}

                {/* 6. Interactive Practice Questions (3 checks) */}
                {lesson.practiceQuestions && lesson.practiceQuestions.length > 0 && (
                  <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-6 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-[#D8D8CF] pb-3">
                      <div className="flex items-center gap-2">
                        <HelpCircle size={17} className="text-[#3D5F58]" />
                        <h2 className="font-heading text-lg font-bold text-[#231F20]">
                          Interactive Knowledge Checks
                        </h2>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#3D5F58] bg-[#F2F2EB] px-2.5 py-0.5 rounded border border-[#D8D8CF]">
                        {lesson.practiceQuestions.length} PRACTICE CHECKS
                      </span>
                    </div>

                    <div className="space-y-6">
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
                            className="rounded-md border border-[#D8D8CF] bg-[#FAF9F5] p-4 sm:p-5 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="font-heading text-base font-bold text-[#231F20]">
                                {qIdx + 1}. {q.prompt || q.question}
                              </span>
                              {isSubmitted && (
                                <span
                                  className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                                    isCorrect
                                      ? 'bg-[#F0FDF4] text-[#166534] border-[#86EFAC]'
                                      : 'bg-[#FEFCE8] text-[#854D0E] border-[#FDE047]'
                                  }`}
                                >
                                  {isCorrect ? 'CORRECT' : 'REVIEW'}
                                </span>
                              )}
                            </div>

                            {/* Options */}
                            <div className="space-y-2">
                              {q.options?.map((opt, optIdx) => {
                                const isOptionSelected = selectedOpt === optIdx
                                let optClass = 'border-[#D8D8CF] bg-[#FFFFFF] text-[#231F20] hover:border-[#3D5F58]'

                                if (isSubmitted) {
                                  if (optIdx === targetCorrect) {
                                    optClass = 'border-[#86EFAC] bg-[#F0FDF4] text-[#166534] font-semibold'
                                  } else if (isOptionSelected && !isCorrect) {
                                    optClass = 'border-[#FECDD3] bg-[#FFF1F2] text-[#9F1239]'
                                  }
                                } else if (isOptionSelected) {
                                  optClass = 'border-[#3D5F58] ring-1 ring-[#3D5F58] bg-[#FFFFFF] font-semibold'
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    disabled={isSubmitted}
                                    onClick={() => handleAnswerSelect(qIdx, optIdx)}
                                    className={`w-full flex items-center gap-3 p-3 rounded border text-left text-xs transition ${optClass}`}
                                  >
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-mono font-bold">
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span className="font-sans">{opt}</span>
                                  </button>
                                )
                              })}
                            </div>

                            {/* Action or Explanation */}
                            {!isSubmitted ? (
                              <div className="pt-2 flex justify-end">
                                <button
                                  type="button"
                                  disabled={selectedOpt === undefined}
                                  onClick={() => handleAnswerSubmit(qIdx)}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3D5F58] text-white text-xs font-bold rounded-md hover:bg-[#2E4742] disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                  <span>Submit Check</span>
                                </button>
                              </div>
                            ) : (
                              <div className="rounded border border-[#D8D8CF] bg-[#FFFFFF] p-3 text-xs space-y-1">
                                <span className="font-mono text-xs font-bold text-[#3D5F58] uppercase block">
                                  {isCorrect ? 'Accurate Model' : 'Concept Clarification'}
                                </span>
                                <p className="text-[#4B5563] leading-relaxed font-sans">
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

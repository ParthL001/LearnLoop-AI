import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, Badge } from '../components/UI'
import { fetchSubjects } from '../services/api'
import { ArrowRight, Code2, Cpu, BookOpen, Layers, Terminal, Sparkles, RefreshCw } from 'lucide-react'

// Default fallback catalog if backend is connecting
const FALLBACK_SUBJECTS = [
  {
    id: 'python',
    name: 'Python',
    description: 'Master clean, readable Python fundamentals from variables and control flow to stack and queue data structures.',
    topics: [
      { id: 'data-types', title: 'Data Types', description: 'Primitive types (int, float, str, bool) and dynamic typing' },
      { id: 'variables', title: 'Variables', description: 'Naming conventions, variable assignment, and memory references' },
      { id: 'loops', title: 'Loops', description: 'For loops, while loops, range iteration, and loop control' },
      { id: 'stack', title: 'Stack', description: 'LIFO data structure behavior, push/pop operations with lists' },
      { id: 'queue', title: 'Queue', description: 'FIFO data structure behavior using collections.deque' },
    ]
  },
  {
    id: 'cpp',
    name: 'C++',
    description: 'Learn robust systems programming with strongly typed primitives, loops, and standard template library structures.',
    topics: [
      { id: 'data-types', title: 'Data Types', description: 'Static types (int, double, char, bool) and memory sizes' },
      { id: 'variables', title: 'Variables', description: 'Variable declarations, scope, and constants' },
      { id: 'loops', title: 'Loops', description: 'For loops, while loops, and do-while iterative control' },
      { id: 'stack', title: 'Stack', description: 'LIFO container adapter behavior using std::stack' },
      { id: 'queue', title: 'Queue', description: 'FIFO container adapter behavior using std::queue' },
    ]
  }
]

export default function ExploreContent() {
  const [subjects, setSubjects] = useState(FALLBACK_SUBJECTS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadSubjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSubjects()
      if (Array.isArray(data) && data.length > 0) {
        setSubjects(data)
      }
    } catch (err) {
      console.warn('Using local catalog fallback:', err.message)
      // Keep fallback subjects
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubjects()
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#303846] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#F8FAFC] tracking-tight">Explore Content</h1>
            <Badge variant="accent">AI-Powered</Badge>
          </div>
          <p className="mt-1 text-xs text-[#A8B3C4] leading-relaxed">
            Select a programming language track to access dynamically generated lessons and interactive code challenges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/python-practice">
            <Button variant="secondary" size="sm">
              <Code2 size={13} className="text-[#3B82F6]" />
              <span>Python Diagnostic Practice</span>
            </Button>
          </Link>
          <Link to="/tutor">
            <Button variant="secondary" size="sm">
              <Sparkles size={13} className="text-[#3B82F6]" />
              <span>Ask AI Tutor</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {subjects.map((subject) => {
          const isPython = subject.id === 'python'
          const Icon = isPython ? Terminal : Code2

          return (
            <div
              key={subject.id}
              className="flex flex-col justify-between rounded-[8px] border border-[#303846] bg-[#14171C] p-6 hover:border-[#3B82F6]/50 transition-all duration-150"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[6px] border border-[#303846] bg-[#1B2028] text-[#3B82F6]">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#F8FAFC] tracking-tight">
                        {subject.name}
                      </h2>
                      <span className="text-[11px] font-medium text-[#7F8A9B]">
                        {subject.topics?.length || 5} Lessons available
                      </span>
                    </div>
                  </div>
                  <Badge variant="neutral">{isPython ? 'Interpreted' : 'Compiled'}</Badge>
                </div>

                {/* Description */}
                <p className="text-xs text-[#A8B3C4] leading-relaxed">
                  {subject.description}
                </p>

                {/* Topics Preview */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7F8A9B]">
                    Included Topics
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {subject.topics?.map((topic) => (
                      <Link
                        key={topic.id}
                        to={`/lessons/${subject.id}/${topic.id}`}
                        className="rounded-[4px] border border-[#303846] bg-[#1B2028] px-2.5 py-1 text-[11px] font-medium text-[#A8B3C4] hover:border-[#3B82F6] hover:text-[#F8FAFC] transition-colors"
                      >
                        {topic.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-6 mt-4 border-t border-[#303846]/60 flex items-center justify-between">
                <span className="text-[11px] text-[#7F8A9B]">
                  Dynamic AI lessons via Ollama
                </span>
                <Link to={`/lessons/${subject.id}`}>
                  <Button variant="primary" size="sm">
                    <span>Explore Lessons</span>
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Guidance Note */}
      <div className="rounded-[6px] border border-[#303846] bg-[#1B2028] p-4 flex items-start gap-3">
        <Layers size={18} className="text-[#3B82F6] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-[#F8FAFC]">
            Dynamic Learning Engine (qwen3:4b)
          </p>
          <p className="text-[#A8B3C4] leading-relaxed">
            Lessons are generated dynamically on demand by your local Ollama instance and cached for instantaneous review. Every topic includes conceptual models, runnable code examples, common pitfalls, and interactive practice checks.
          </p>
        </div>
      </div>
    </div>
  )
}

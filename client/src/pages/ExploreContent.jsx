import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchSubjects } from '../services/api'
import {
  ArrowRight,
  Code2,
  Layers,
  Terminal,
  Sparkles,
  BookOpen,
  Layout,
  ChevronRight,
} from 'lucide-react'

const FALLBACK_SUBJECTS = [
  {
    id: 'python',
    name: 'Python',
    badge: 'Interpreted',
    tagline: 'Clean syntax, dynamic typing, and expressive standard library',
    description:
      'Master fundamental computational thinking with Python. Deepen your understanding of variables, control flow, functions, and standard data structures like Stack and Queue.',
    topics: [
      { id: 'data-types', title: 'Data Types', description: 'Primitive types (int, float, str, bool) and dynamic typing' },
      { id: 'variables', title: 'Variables', description: 'Naming conventions, variable assignment, and memory references' },
      { id: 'loops', title: 'Loops', description: 'For loops, while loops, range iteration, and loop control' },
      { id: 'stack', title: 'Stack', description: 'LIFO data structure behavior, push/pop operations with lists' },
      { id: 'queue', title: 'Queue', description: 'FIFO data structure behavior using collections.deque' },
    ],
  },
  {
    id: 'cpp',
    name: 'C++',
    badge: 'Compiled',
    tagline: 'Static types, memory management, and Standard Template Library',
    description:
      'Explore high-performance systems programming. Build rigorous mental models around static type safety, iterative loops, and STL containers.',
    topics: [
      { id: 'data-types', title: 'Data Types', description: 'Static types (int, double, char, bool) and memory sizes' },
      { id: 'variables', title: 'Variables', description: 'Variable declarations, scope, and constants' },
      { id: 'loops', title: 'Loops', description: 'For loops, while loops, and do-while iterative control' },
      { id: 'stack', title: 'Stack', description: 'LIFO container adapter behavior using std::stack' },
      { id: 'queue', title: 'Queue', description: 'FIFO container adapter behavior using std::queue' },
    ],
  },
]

export default function ExploreContent() {
  const [subjects, setSubjects] = useState(FALLBACK_SUBJECTS)
  const [selectedSubject, setSelectedSubject] = useState('python')
  const [loading, setLoading] = useState(true)

  const loadSubjects = async () => {
    setLoading(true)
    try {
      const data = await fetchSubjects()
      if (Array.isArray(data) && data.length > 0) {
        setSubjects(data)
      }
    } catch (err) {
      console.warn('Using local fallback catalog:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubjects()
  }, [])

  return (
    <div className="reveal-stagger space-y-6">
      {/* Page Header */}
      <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="eyebrow mb-1">
            Curriculum Catalog
          </div>
          <h1 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-[var(--text-main)]">
            Explore Content
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-xl">
            Choose a programming language and concept topic. Lessons are generated on demand with clear mental models, code traces, and interactive checks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            to="/python-practice"
            className="btn btn-secondary btn-sm"
          >
            <Code2 size={14} className="text-[var(--accent-primary)]" />
            <span>Python Practice</span>
          </Link>
          <Link
            to="/css-practice"
            className="btn btn-secondary btn-sm"
          >
            <Layout size={14} className="text-[var(--accent-primary)]" />
            <span>CSS Practice</span>
          </Link>
        </div>
      </div>

      {/* Language Track Selector Tabs */}
      <div className="tabs">
        {subjects.map((sub) => {
          const isSelected = selectedSubject === sub.id
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              aria-selected={isSelected}
              className="tab font-mono text-xs uppercase tracking-wider font-bold"
            >
              {sub.name} Track
            </button>
          )
        })}
      </div>

      {/* Track Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {subjects.map((subject) => {
          const isPython = subject.id === 'python'
          const isSelected = selectedSubject === subject.id
          const Icon = isPython ? Terminal : Code2

          return (
            <div
              key={subject.id}
              className={`card card-interactive flex flex-col justify-between ${
                isSelected ? 'ring-2 ring-[var(--accent-primary)]' : ''
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="icon-tile">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h2 className="font-heading text-xl font-bold text-[var(--text-main)] tracking-tight">
                        {subject.name}
                      </h2>
                      <span className="font-mono text-xs text-[var(--text-muted)]">
                        {subject.topics?.length || 5} Core Topics Available
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-ochre">
                    {subject.badge || (isPython ? 'INTERPRETED' : 'COMPILED')}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-[var(--text-body)] leading-relaxed">
                  {subject.description}
                </p>

                {/* Topics Preview */}
                <div className="space-y-2 pt-2">
                  <span className="eyebrow text-[10px]">
                    Available Concepts
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {subject.topics?.map((topic) => (
                      <Link
                        key={topic.id}
                        to={`/lessons/${subject.id}/${topic.id}`}
                        className="p-3 rounded-md border border-[var(--border-soft)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface)] hover:border-[var(--accent-primary)] hover:shadow-card transition flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-heading text-sm font-bold text-[var(--text-main)] group-hover:text-[var(--accent-primary)] transition-colors">
                            {topic.title}
                          </div>
                          <div className="font-mono text-[10px] text-[var(--text-muted)] line-clamp-1">
                            {topic.description}
                          </div>
                        </div>
                        <ArrowRight size={13} className="text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-6 mt-6 border-t border-[var(--border-soft)] flex items-center justify-between">
                <span className="font-mono text-[11px] text-[var(--text-muted)]">
                  Dynamic Qwen3:4b Engine
                </span>
                <Link
                  to={`/lessons/${subject.id}`}
                  className="btn btn-primary btn-sm"
                >
                  <span>Start Track</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Dynamic Engine Callout (.alert-info or .card) */}
      <div className="card flex items-start gap-3">
        <div className="icon-tile shrink-0">
          <Layers size={20} />
        </div>
        <div className="text-xs space-y-1">
          <p className="font-heading text-base font-bold text-[var(--text-main)]">
            Dynamic Adaptive Generation via Local Qwen3:4b
          </p>
          <p className="text-[var(--text-muted)] leading-relaxed font-sans">
            Lessons are synthesized dynamically by your local Ollama backend. Python lessons contain verified Python idioms and mental model diagnostics, while C++ lessons feature statically typed syntax, header inclusions, and STL containers.
          </p>
        </div>
      </div>
    </div>
  )
}

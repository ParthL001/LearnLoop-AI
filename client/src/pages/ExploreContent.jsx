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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#3D5F58]"></span>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#3D5F58]">
              Curriculum Catalog
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#231F20]">
            Explore Content
          </h1>
          <p className="text-sm text-[#4B5563] mt-1 max-w-xl">
            Choose a programming language and concept topic. Lessons are generated on demand with clear mental models, code traces, and interactive checks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            to="/python-practice"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F2F2EB] text-[#231F20] font-mono text-xs font-bold rounded-md border border-[#D8D8CF] hover:bg-[#3D5F58] hover:text-white transition"
          >
            <Code2 size={13} />
            <span>Python Practice</span>
          </Link>
          <Link
            to="/css-practice"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F2F2EB] text-[#231F20] font-mono text-xs font-bold rounded-md border border-[#D8D8CF] hover:bg-[#3D5F58] hover:text-white transition"
          >
            <Layout size={13} />
            <span>CSS Practice</span>
          </Link>
        </div>
      </div>

      {/* Language Track Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D8D8CF] pb-2">
        {subjects.map((sub) => {
          const isSelected = selectedSubject === sub.id
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider rounded-md transition ${
                isSelected
                  ? 'bg-[#3D5F58] text-white shadow-xs'
                  : 'bg-[#FFFFFF] text-[#231F20] border border-[#D8D8CF] hover:bg-[#F2F2EB]'
              }`}
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
              className={`flex flex-col justify-between rounded-lg border bg-[#FFFFFF] p-6 transition shadow-xs ${
                isSelected
                  ? 'border-[#3D5F58] ring-1 ring-[#3D5F58]'
                  : 'border-[#D8D8CF] hover:border-[#3D5F58]'
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md border border-[#D8D8CF] bg-[#F2F2EB] text-[#3D5F58]">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h2 className="font-heading text-xl font-bold text-[#231F20] tracking-tight">
                        {subject.name}
                      </h2>
                      <span className="font-mono text-xs text-[#6B7280]">
                        {subject.topics?.length || 5} Core Topics Available
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#3D5F58] bg-[#F2F2EB] px-2 py-0.5 rounded border border-[#D8D8CF]">
                    {subject.badge || (isPython ? 'INTERPRETED' : 'COMPILED')}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  {subject.description}
                </p>

                {/* Topics Preview */}
                <div className="space-y-2 pt-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                    Available Concepts
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {subject.topics?.map((topic) => (
                      <Link
                        key={topic.id}
                        to={`/lessons/${subject.id}/${topic.id}`}
                        className="p-2.5 rounded-md border border-[#D8D8CF] bg-[#FAF9F5] hover:bg-[#FFFFFF] hover:border-[#3D5F58] transition group flex items-center justify-between"
                      >
                        <div>
                          <div className="font-heading text-sm font-bold text-[#231F20] group-hover:text-[#3D5F58] transition-colors">
                            {topic.title}
                          </div>
                          <div className="font-mono text-[10px] text-[#6B7280] line-clamp-1">
                            {topic.description}
                          </div>
                        </div>
                        <ArrowRight size={13} className="text-[#6B7280] group-hover:text-[#3D5F58] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-6 mt-6 border-t border-[#D8D8CF] flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#6B7280]">
                  Dynamic Ollama Qwen3:4b
                </span>
                <Link
                  to={`/lessons/${subject.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3D5F58] text-white font-sans text-xs font-bold rounded-md hover:bg-[#2E4742] transition shadow-xs"
                >
                  <span>Start Track</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Dynamic Engine Callout */}
      <div className="rounded-lg border border-[#D8D8CF] bg-[#FFFFFF] p-5 flex items-start gap-3 shadow-xs">
        <div className="p-2 bg-[#F2F2EB] text-[#3D5F58] rounded-md border border-[#D8D8CF] shrink-0">
          <Layers size={18} />
        </div>
        <div className="text-xs space-y-1">
          <p className="font-heading text-sm font-bold text-[#231F20]">
            Dynamic Adaptive Generation via Local Qwen3:4b
          </p>
          <p className="text-[#4B5563] leading-relaxed font-sans">
            Lessons are generated dynamically by your local Ollama backend. Python lessons contain verified Python code walkthroughs and idioms, while C++ lessons feature statically typed syntax, header inclusions, and STL containers.
          </p>
        </div>
      </div>
    </div>
  )
}

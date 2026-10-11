import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Brain, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ConceptCard({ topic, masteryOverride }) {
  const mastery = masteryOverride ?? topic.progress ?? topic.mastery ?? 0

  const colorStyles = {
    violet: {
      bg: 'bg-violet-50 text-violet-700 border-violet-100',
      badge: 'bg-violet-100/70 text-violet-800',
      bar: 'bg-violet-600',
    },
    blue: {
      bg: 'bg-sky-50 text-sky-700 border-sky-100',
      badge: 'bg-sky-100/70 text-sky-800',
      bar: 'bg-sky-600',
    },
    green: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      badge: 'bg-emerald-100/70 text-emerald-800',
      bar: 'bg-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-700 border-amber-100',
      badge: 'bg-amber-100/70 text-amber-800',
      bar: 'bg-amber-600',
    },
  }

  const theme = colorStyles[topic.color] || colorStyles.violet

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_12px_rgba(24,35,59,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-[0_8px_24px_rgba(99,102,241,0.08)]">
      <div>
        {/* Header: Icon + Level Badge */}
        <div className="flex items-start justify-between">
          <div className={`grid h-12 w-12 place-items-center rounded-2xl border text-base font-black shadow-xs ${theme.bg}`}>
            {topic.symbol || '✦'}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
              {topic.level || 'Foundational'}
            </span>
          </div>
        </div>

        {/* Domain & Title */}
        <p className="mt-4 text-[11px] font-extrabold uppercase tracking-wider text-violet-600">
          {topic.subject || 'Mathematics'}
        </p>
        <h3 className="mt-1 text-base font-extrabold text-[#18233b] group-hover:text-violet-900">
          {topic.title}
        </h3>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
          {topic.description}
        </p>
      </div>

      <div className="mt-5 pt-3">
        {/* Mastery Progress Bar */}
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-500">Concept Mastery</span>
          <span className="font-extrabold text-[#18233b]">{mastery}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${theme.bar}`}
            style={{ width: `${Math.min(100, Math.max(0, mastery))}%` }}
          />
        </div>

        {/* Misconception Status Pill */}
        {topic.misconceptionStatus && (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">
            <Brain size={12} className="text-violet-600" />
            <span className="truncate">{topic.misconceptionStatus}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            to={`/lessons/${topic.id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <BookOpen size={13} />
            <span>Lesson</span>
          </Link>
          <Link
            to={`/practice/${topic.id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-violet-700"
          >
            <span>Practice</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  )
}

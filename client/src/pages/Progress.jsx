import { Link } from 'react-router-dom'
import { Card, Button, Badge, ProgressBar } from '../components/UI'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useApp } from '../context/AppContext'
import { Target, CheckCircle2, AlertTriangle } from 'lucide-react'

export default function Progress() {
  const { topics, activityData, misconceptions, practiceHistory } = useApp()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#0f172a]">Progress & Mastery Evidence</h2>
              <Badge variant="accent">Dynamic Telemetry</Badge>
            </div>
            <p className="mt-1 text-xs text-[#64748b] max-w-2xl leading-relaxed">
              Tracks concept-level understanding across diagnostic items rather than generic activity streaks. Calibrated dynamically with each completed item.
            </p>
          </div>
          <Link to="/practice">
            <Button size="sm" variant="primary">
              <Target size={13} />
              <span>Continue Practice</span>
            </Button>
          </Link>
        </div>
      </Card>

      {/* Mastery by Topic & Activity Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card header={<h3 className="text-sm font-bold text-[#0f172a]">Concept Mastery Calibration</h3>}>
          <div className="space-y-4">
            {topics.map((t) => (
              <div key={t.id} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#0f172a]">{t.title}</span>
                  <span className="font-bold text-[#2563eb]">{t.mastery}%</span>
                </div>
                <ProgressBar value={t.mastery} />
                <p className="text-[11px] text-[#64748b]">{t.subject} · {t.level} Level</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Practice Time Distribution Chart */}
        <Card header={<h3 className="text-sm font-bold text-[#0f172a]">Diagnostic Practice Time (Minutes)</h3>}>
          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={{ stroke: '#e2e8f0' }} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis axisLine={{ stroke: '#e2e8f0' }} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '5px',
                    fontSize: '12px',
                    color: '#0f172a'
                  }}
                />
                <Bar dataKey="minutes" fill="#2563eb" radius={[3, 3, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-[11px] text-[#64748b]">
            Practice duration recorded across diagnostic probes and structured tutor interactions.
          </p>
        </Card>
      </div>

      {/* Verified Practice & Reasoning Log */}
      <Card header={<h3 className="text-sm font-bold text-[#0f172a]">Verified Practice & Reasoning Log</h3>}>
        <div className="divide-y divide-[#e2e8f0]">
          {practiceHistory && practiceHistory.length > 0 ? (
            practiceHistory.slice(0, 5).map((item) => (
              <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0f172a]">{item.title}</span>
                    <Badge variant={item.isCorrect ? 'success' : 'warning'}>
                      {item.isCorrect ? 'Correct' : 'Needs Review'}
                    </Badge>
                  </div>
                  {item.misconception && (
                    <p className="text-[11px] text-[#92400e] mt-0.5">
                      Flagged: {item.misconception}
                    </p>
                  )}
                  {item.reasoning && (
                    <p className="text-[11px] text-[#475569] italic mt-0.5">
                      &quot;{item.reasoning}&quot;
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-[#64748b] shrink-0">{item.date}</span>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-[#64748b]">
              <p>No practice attempts recorded yet.</p>
              <p className="text-[11px] text-[#94a3b8] mt-1">
                Completed questions and verified reasoning traces will appear here.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

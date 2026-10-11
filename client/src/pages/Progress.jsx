import { Link } from 'react-router-dom'
import { Card, Button, Badge, ProgressBar } from '../components/UI'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { topics, activityTrendData, recentMisconceptions } from '../services/mockData'

export default function Progress() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#181816]">Progress & Mastery Analytics</h2>
              <Badge variant="accent">Cumulative Growth</Badge>
            </div>
            <p className="mt-1 text-xs text-[#575753] max-w-2xl leading-relaxed">
              Tracking concept-level mastery over time rather than simple activity points.
            </p>
          </div>
          <Link to="/practice">
            <Button size="sm" variant="primary">Continue Practice</Button>
          </Link>
        </div>
      </Card>

      {/* Mastery by Topic */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card header={<h3 className="text-sm font-bold text-[#181816]">Topic Mastery Estimates</h3>}>
          <div className="space-y-4">
            {topics.map((t) => (
              <div key={t.id} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#181816]">{t.title}</span>
                  <span className="font-bold text-[#3730a3]">{t.mastery}%</span>
                </div>
                <ProgressBar value={t.mastery} />
                <p className="text-[11px] text-[#797973]">{t.subject} · {t.level}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Activity Chart */}
        <Card header={<h3 className="text-sm font-bold text-[#181816]">Weekly Practice Time (Minutes)</h3>}>
          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityTrendData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e3e3df" />
                <XAxis dataKey="day" axisLine={{ stroke: '#e3e3df' }} tickLine={false} tick={{ fontSize: 11, fill: '#797973' }} />
                <YAxis axisLine={{ stroke: '#e3e3df' }} tickLine={false} tick={{ fontSize: 11, fill: '#797973' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e3e3df',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="minutes" fill="#3730a3" radius={[2, 2, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-[11px] text-[#797973]">
            Practice duration recorded across tutor conversations and diagnostic items.
          </p>
        </Card>
      </div>

      {/* Misconception Resolution Record */}
      <Card header={<h3 className="text-sm font-bold text-[#181816]">Misconception Resolution Log</h3>}>
        <div className="divide-y divide-[#e3e3df]">
          {recentMisconceptions.map((item) => (
            <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#181816]">{item.concept}</span>
                <Badge variant={item.status === 'Resolved' ? 'success' : 'warning'}>
                  {item.status}
                </Badge>
              </div>
              <p className="text-xs text-[#575753]">{item.studentHypothesis}</p>
              <p className="text-[11px] text-[#797973]">
                Signal confidence: {item.confidence} · {item.remedyAction}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

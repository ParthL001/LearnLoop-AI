import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, Button, Badge, ProgressBar } from '../components/UI'
import { useApp } from '../context/AppContext'

export default function Lessons() {
  const { topics, mastery } = useApp()
  const { id } = useParams()
  const [selectedSubject, setSelectedSubject] = useState('All')

  // If viewing a specific lesson by id
  if (id) {
    const topic = topics.find((t) => t.id === id) || topics[0]

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/lessons" className="text-xs font-semibold text-[#3730a3] hover:underline">
            ← Back to all lessons
          </Link>
          <Badge variant="accent">{topic.subject}</Badge>
        </div>

        <Card
          header={
            <div>
              <span className="text-[11px] font-bold text-[#797973] uppercase tracking-wider">
                {topic.level} Unit
              </span>
              <h2 className="text-base font-bold text-[#181816] mt-0.5">{topic.title}</h2>
            </div>
          }
        >
          <p className="text-xs text-[#575753] leading-relaxed">
            {topic.description}
          </p>

          <div className="mt-5 space-y-4">
            <h3 className="text-xs font-bold text-[#181816] uppercase tracking-wider">
              Core Learning Objectives
            </h3>
            <ul className="space-y-2 text-xs text-[#494944]">
              {topic.objectives?.map((obj, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#3730a3] font-bold">·</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 pt-5 border-t border-[#e3e3df] flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#797973]">
              Duration: {topic.duration} · Tracked misconceptions: {topic.misconceptionsTracked}
            </div>
            <div className="flex gap-2">
              <Link to={`/tutor/${topic.id}`}>
                <Button variant="primary">Launch AI Tutor</Button>
              </Link>
              <Link to={`/practice/${topic.id}`}>
                <Button variant="secondary">Start Practice</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // General list of lessons
  const filteredTopics = topics.filter(
    (t) => selectedSubject === 'All' || t.subject === selectedSubject
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#181816]">Lessons Library</h2>
            <p className="mt-1 text-xs text-[#575753] max-w-2xl">
              Curated conceptual lessons designed to establish core foundations before procedural problem solving.
            </p>
          </div>
          <div className="flex gap-1.5">
            {['All', 'Mathematics', 'Computer Science'].map((sub) => (
              <Button
                key={sub}
                size="sm"
                variant={selectedSubject === sub ? 'primary' : 'secondary'}
                onClick={() => setSelectedSubject(sub)}
              >
                {sub}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Topics Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredTopics.map((topic) => (
          <Card key={topic.id} className="flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="neutral">{topic.level}</Badge>
                <span className="text-xs font-semibold text-[#181816]">{topic.mastery}% mastery</span>
              </div>
              <h3 className="text-sm font-bold text-[#181816]">{topic.title}</h3>
              <p className="text-xs text-[#575753] leading-relaxed line-clamp-2">
                {topic.description}
              </p>
              <ProgressBar value={topic.mastery} className="pt-2" />
            </div>

            <div className="mt-5 pt-4 border-t border-[#e3e3df] flex items-center justify-between">
              <span className="text-[11px] text-[#797973]">{topic.duration}</span>
              <div className="flex gap-2">
                <Link to={`/lessons/${topic.id}`}>
                  <Button size="sm" variant="secondary">View</Button>
                </Link>
                <Link to={`/practice/${topic.id}`}>
                  <Button size="sm" variant="primary">Practice</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

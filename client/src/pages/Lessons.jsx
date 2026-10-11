import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, Button, Badge, ProgressBar } from '../components/UI'
import { useApp } from '../context/AppContext'
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle, Target, MessageSquare } from 'lucide-react'

export default function Lessons() {
  const { topics, mastery } = useApp()
  const { id } = useParams()
  const [selectedSubject, setSelectedSubject] = useState('All')

  // If viewing a specific lesson by id
  if (id) {
    const topicIndex = topics.findIndex((t) => t.id === id)
    const topic = topics[topicIndex] || topics[0]
    const prevTopic = topicIndex > 0 ? topics[topicIndex - 1] : null
    const nextTopic = topicIndex < topics.length - 1 ? topics[topicIndex + 1] : null

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/lessons" className="text-xs font-semibold text-[#3B82F6] hover:underline flex items-center gap-1">
            <ArrowLeft size={14} />
            <span>Back to curriculum library</span>
          </Link>
          <Badge variant="accent">{topic.subject}</Badge>
        </div>

        {/* 1. Learning Objectives First */}
        <Card
          header={
            <div>
              <span className="text-[10px] font-bold text-[#7F8A9B] uppercase tracking-wider">
                {topic.level} Unit · Learning Objectives
              </span>
              <h2 className="text-base font-bold text-[#F8FAFC] mt-0.5">{topic.title}</h2>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-xs text-[#A8B3C4] leading-relaxed">
              {topic.description}
            </p>

            <div className="p-3.5 rounded-[6px] border border-[#303846] bg-[#1B2028]">
              <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider mb-2">
                Core Competencies & Objectives
              </h3>
              <ul className="space-y-2 text-xs text-[#A8B3C4]">
                {topic.objectives?.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-[#3B82F6] shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* 2. Visual Model & Conceptual Explanation */}
        <Card header={<h3 className="text-sm font-bold text-[#F8FAFC]">Conceptual Model & Accurate Diagram</h3>}>
          <div className="space-y-4">
            <p className="text-xs text-[#A8B3C4] leading-relaxed">
              A fraction represents a relation between a selected number of parts (numerator) and the total number of equal partitions in the whole unit (denominator). Increasing the denominator subdivides the whole into a greater quantity of smaller segments.
            </p>

            {/* Accurate Mathematical Fraction Diagram */}
            <div className="p-4 rounded-[6px] border border-[#303846] bg-[#1B2028] space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-[#F8FAFC]">
                <span>Partition Size Comparison: Comparing 2/3 and 2/5</span>
                <span className="text-[11px] font-normal text-[#7F8A9B]">Unit Width = 1.0</span>
              </div>

              {/* 2/3 Diagram */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#A8B3C4]">
                  <span className="font-semibold text-[#60A5FA]">2/3 Unit (2 shaded out of 3 partitions)</span>
                  <span>Length = 66.7% of Whole</span>
                </div>
                <div className="grid grid-cols-3 h-6 w-full rounded-[4px] border border-[#303846] overflow-hidden bg-[#14171C]">
                  <div className="bg-[#3B82F6] text-white text-[10px] flex items-center justify-center font-bold">1/3</div>
                  <div className="bg-[#3B82F6] text-white text-[10px] flex items-center justify-center font-bold border-l border-white/20">1/3</div>
                  <div className="bg-[#14171C] text-[#7F8A9B] text-[10px] flex items-center justify-center border-l border-[#303846]">1/3 (unshaded)</div>
                </div>
              </div>

              {/* 2/5 Diagram */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#A8B3C4]">
                  <span className="font-semibold text-[#94A3B8]">2/5 Unit (2 shaded out of 5 partitions)</span>
                  <span>Length = 40.0% of Whole</span>
                </div>
                <div className="grid grid-cols-5 h-6 w-full rounded-[4px] border border-[#303846] overflow-hidden bg-[#14171C]">
                  <div className="bg-[#2563EB] text-white text-[10px] flex items-center justify-center font-bold">1/5</div>
                  <div className="bg-[#2563EB] text-white text-[10px] flex items-center justify-center font-bold border-l border-white/20">1/5</div>
                  <div className="bg-[#14171C] text-[#7F8A9B] text-[10px] flex items-center justify-center border-l border-[#303846]">1/5</div>
                  <div className="bg-[#14171C] text-[#7F8A9B] text-[10px] flex items-center justify-center border-l border-[#303846]">1/5</div>
                  <div className="bg-[#14171C] text-[#7F8A9B] text-[10px] flex items-center justify-center border-l border-[#303846]">1/5</div>
                </div>
              </div>

              <div className="text-[11px] text-[#93C5FD] bg-[#152746] p-2.5 rounded-[4px] border border-[#1E3A8A]">
                <strong>Diagnostic Note:</strong> Whole-number intuition suggests that 5 &gt; 3 implies 2/5 &gt; 2/3. In fractions, partition density is inverse to individual part magnitude: each third is noticeably larger than each fifth.
              </div>
            </div>
          </div>
        </Card>

        {/* 3. Worked Example */}
        <Card header={<h3 className="text-sm font-bold text-[#F8FAFC]">Worked Diagnostic Example</h3>}>
          <div className="space-y-3 text-xs text-[#A8B3C4]">
            <div className="p-3 rounded-[5px] border border-[#303846] bg-[#1B2028]">
              <span className="font-bold text-[#F8FAFC]">Problem Prompt:</span>
              <p className="mt-1">Rank in ascending order: 3/8, 3/4, 3/10.</p>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#3B82F6]">Step 1:</span>
                <span>Observe identical numerators (3 parts in each fraction).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#3B82F6]">Step 2:</span>
                <span>Compare partition sizes: tenths are smallest, followed by eighths, followed by fourths.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#3B82F6]">Step 3:</span>
                <span>Conclusion: 3/10 &lt; 3/8 &lt; 3/4.</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Navigation Actions: Previous, Next, Continue */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div>
            {prevTopic ? (
              <Link to={`/lessons/${prevTopic.id}`}>
                <Button variant="secondary" size="md">
                  <ArrowLeft size={14} />
                  <span>Previous: {prevTopic.title}</span>
                </Button>
              </Link>
            ) : (
              <Link to="/lessons">
                <Button variant="secondary" size="md">
                  <ArrowLeft size={14} />
                  <span>All Lessons</span>
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/tutor/${topic.id}`}>
              <Button variant="secondary" size="md">
                <MessageSquare size={14} />
                <span>Discuss with Tutor</span>
              </Button>
            </Link>
            <Link to={`/practice/${topic.id}`}>
              <Button variant="primary" size="md">
                <Target size={14} />
                <span>Continue to Practice</span>
              </Button>
            </Link>
            {nextTopic && (
              <Link to={`/lessons/${nextTopic.id}`}>
                <Button variant="subtle" size="md">
                  <span>Next: {nextTopic.title}</span>
                  <ArrowRight size={14} />
                </Button>
              </Link>
            )}
          </div>
        </div>
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
            <h2 className="text-lg font-bold text-[#F8FAFC]">Lessons Library</h2>
            <p className="mt-1 text-xs text-[#7F8A9B] max-w-2xl">
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

      {/* Grid of Lessons */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredTopics.map((topic) => (
          <Card key={topic.id} className="flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="neutral">{topic.subject}</Badge>
                <span className="text-xs font-semibold text-[#F8FAFC]">
                  Mastery: {mastery?.[topic.id] || topic.mastery}%
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#F8FAFC]">{topic.title}</h3>
                <p className="mt-1 text-xs text-[#A8B3C4] leading-relaxed line-clamp-2">
                  {topic.description}
                </p>
              </div>

              <div className="space-y-1.5">
                <ProgressBar value={mastery?.[topic.id] || topic.mastery} />
                <div className="flex justify-between text-[11px] text-[#7F8A9B]">
                  <span>{topic.level} level</span>
                  <span>{topic.duration}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#303846] flex items-center justify-between">
              <Link to={`/tutor/${topic.id}`}>
                <Button size="sm" variant="ghost">
                  <MessageSquare size={13} />
                  <span>AI Tutor</span>
                </Button>
              </Link>
              <Link to={`/lessons/${topic.id}`}>
                <Button size="sm" variant="primary">
                  <span>Start Lesson</span>
                  <ArrowRight size={13} />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

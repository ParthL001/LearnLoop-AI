import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Button, Badge } from '../components/UI'
import { chatWithTutor } from '../services/api'
import { useApp } from '../context/AppContext'
import { MessageSquare, ArrowRight, Target, HelpCircle, CheckCircle2 } from 'lucide-react'

export default function AITutor() {
  const { topics, user } = useApp()
  const { id } = useParams()
  const activeTopic = topics.find((t) => t.id === id) || topics[0] || {}

  const [messages, setMessages] = useState([
    {
      id: 'init',
      sender: 'tutor',
      text: `Hello ${user?.name || 'Learner'}. I am your adaptive tutor for ${activeTopic.title || 'Fractional Reasoning'}. Explain how you arrived at an answer, or tell me what step feels counterintuitive so we can evaluate your mental model together.`,
      time: 'Ready'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [diagnosticRecord, setDiagnosticRecord] = useState({
    question: 'A recipe calls for 2/3 cup of flour. Your measuring cup has markings for 2/5 cup. Which quantity is greater, and why?',
    studentAnswer: '2/5 cup is greater because 5 is greater than 3.',
    studentReasoning: 'In whole numbers, 5 is bigger than 3, so fifths must be larger portions than thirds.',
    clarificationNeeded: false,
    misconception: 'Whole Number Value Bias (Transferring whole-number properties to denominators)',
    explanation: 'Denominator values denote division density rather than standalone quantity. 3 divisions yield larger portions than 5 divisions.',
    followUp: 'If you divide a ribbon into 3 equal pieces versus 5 equal pieces, which piece is longer?'
  })
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (textToSend = input) => {
    const text = textToSend.trim()
    if (!text || loading) return

    const userMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const result = await chatWithTutor(text, {
        topicId: activeTopic.id,
        history: messages.slice(-4),
        studentReasoning: text
      })

      const tutorMessage = {
        id: `tut-${Date.now()}`,
        sender: 'tutor',
        text: result.text,
        misconception: result.misconceptionDetected,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages((prev) => [...prev, tutorMessage])

      if (result.misconceptionDetected) {
        setDiagnosticRecord((prev) => ({
          ...prev,
          studentReasoning: text,
          misconception: result.misconceptionDetected.name || prev.misconception,
          explanation: result.misconceptionDetected.note || prev.explanation,
        }))
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `tut-fallback-${Date.now()}`,
          sender: 'tutor',
          text: 'Notice that when the denominator increases, the whole is partitioned into more pieces, making each individual piece smaller. Consider whether that applies to your question.',
          time: 'Now'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Context Bar */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#0f172a]">AI Adaptive Tutor</h2>
              <Badge variant="accent">{activeTopic.title}</Badge>
            </div>
            <p className="mt-1 text-xs text-[#64748b]">
              The tutor asks probing questions to differentiate between accidental calculation slips and systematic conceptual misconceptions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/practice">
              <Button size="sm" variant="secondary">
                <Target size={13} />
                <span>Diagnostic Practice</span>
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Main Tutor Workspace */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Chat Window (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-[580px] bg-white border border-[#e2e8f0] rounded-[6px] overflow-hidden shadow-xs">
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0f172a]">
              <MessageSquare size={14} className="text-[#2563eb]" />
              <span>Interactive Dialogue</span>
            </div>
            <span className="text-[11px] text-[#065f46] font-medium bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded-[3px]">
              Adaptive Engine Active
            </span>
          </div>

          {/* Messages feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc]">
            {messages.map((m) => {
              const isUser = m.sender === 'user'

              return (
                <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className="text-[10px] font-semibold text-[#64748b] mb-1">
                    {isUser ? 'You' : 'AI Tutor'} · {m.time}
                  </div>
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] p-3.5 text-xs rounded-[5px] leading-relaxed border ${
                      isUser
                        ? 'bg-[#2563eb] text-white border-[#2563eb]'
                        : 'bg-white text-[#0f172a] border-[#e2e8f0]'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>

                    {m.misconception && (
                      <div className="mt-3 pt-2 border-t border-[#fde68a] bg-[#fffbeb] text-[#92400e] p-2.5 rounded-[4px]">
                        <span className="font-bold">Detected Misconception: </span>
                        {m.misconception.name}: {m.misconception.note}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {loading && (
              <div className="text-xs text-[#64748b] font-medium p-3 bg-white border border-[#e2e8f0] rounded-[4px] inline-block">
                Formulating adaptive response...
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 border-t border-[#e2e8f0] bg-white flex gap-2 overflow-x-auto text-xs">
            {[
              'Why is 2/3 bigger than 2/5?',
              'Why can I not add denominators directly?',
              'Give me a problem to test my reasoning.'
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(p)}
                className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-[3px] border border-[#cbd5e1] bg-[#f8fafc] text-[#334155] hover:bg-[#eff6ff] hover:text-[#1d4ed8] hover:border-[#bfdbfe] transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Row */}
          <div className="p-3 border-t border-[#e2e8f0] bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Explain your step-by-step thinking or why you made a choice..."
                className="flex-1 text-xs px-3 py-2 rounded-[5px] border border-[#cbd5e1] bg-white text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none"
              />
              <Button type="submit" variant="primary" disabled={!input.trim() || loading}>
                Send
              </Button>
            </form>
          </div>
        </div>

        {/* Structured Misconception Feedback Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            header={
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                  Diagnostic Reasoning Breakdown
                </span>
                <Badge variant="accent">Live Context</Badge>
              </div>
            }
          >
            <div className="space-y-3.5 text-xs">
              {/* 1. Current Question */}
              <div>
                <span className="font-bold text-[#64748b] text-[11px] uppercase tracking-wider">
                  1. Current Question
                </span>
                <p className="mt-1 text-[#0f172a] font-medium leading-relaxed bg-[#f8fafc] p-2.5 rounded-[4px] border border-[#e2e8f0]">
                  {diagnosticRecord.question}
                </p>
              </div>

              {/* 2. Submitted Answer */}
              <div>
                <span className="font-bold text-[#64748b] text-[11px] uppercase tracking-wider">
                  2. Student Submitted Answer
                </span>
                <p className="mt-1 text-[#92400e] bg-[#fffbeb] p-2 rounded-[4px] border border-[#fde68a]">
                  {diagnosticRecord.studentAnswer}
                </p>
              </div>

              {/* 3. Stated Reasoning */}
              <div>
                <span className="font-bold text-[#64748b] text-[11px] uppercase tracking-wider">
                  3. Stated Reasoning
                </span>
                <p className="mt-1 text-[#334155] italic bg-[#f8fafc] p-2 rounded-[4px] border border-[#e2e8f0]">
                  &quot;{diagnosticRecord.studentReasoning}&quot;
                </p>
              </div>

              {/* 4. Supported Possible Misconception */}
              <div>
                <span className="font-bold text-[#64748b] text-[11px] uppercase tracking-wider">
                  4. Supported Misconception Hypothesis
                </span>
                <div className="mt-1 p-2.5 rounded-[4px] border border-[#bfdbfe] bg-[#eff6ff] text-[#1e3a8a]">
                  <p className="font-semibold">{diagnosticRecord.misconception}</p>
                </div>
              </div>

              {/* 5. Grounded Explanation */}
              <div>
                <span className="font-bold text-[#64748b] text-[11px] uppercase tracking-wider">
                  5. Grounded Explanation
                </span>
                <p className="mt-1 text-[#334155] leading-relaxed">
                  {diagnosticRecord.explanation}
                </p>
              </div>

              {/* 6. Targeted Follow-up Question */}
              <div className="pt-2 border-t border-[#e2e8f0]">
                <span className="font-bold text-[#2563eb] text-[11px] uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Targeted Follow-up Probe</span>
                </span>
                <p className="mt-1 text-[#0f172a] font-medium">
                  {diagnosticRecord.followUp}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

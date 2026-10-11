import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Button, Badge } from '../components/UI'
import { chatWithTutor } from '../services/api'
import { topics } from '../services/mockData'

export default function AITutor() {
  const { id } = useParams()
  const activeTopic = topics.find((t) => t.id === id) || topics[0]

  const [messages, setMessages] = useState([
    {
      id: 'init',
      sender: 'tutor',
      text: `Hello Alex. I am your Cognara adaptive tutor for ${activeTopic.title}. Tell me what concept you are working through, or explain how you solved a recent problem so we can check your underlying reasoning.`,
      time: 'Ready'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [detectedMisconception, setDetectedMisconception] = useState(null)
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
        setDetectedMisconception(result.misconceptionDetected)
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `tut-err-${Date.now()}`,
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
              <h2 className="text-base font-bold text-[#181816]">AI Adaptive Tutor</h2>
              <Badge variant="accent">{activeTopic.title}</Badge>
            </div>
            <p className="mt-1 text-xs text-[#575753]">
              The tutor asks probing questions to differentiate between random slips and conceptual misconceptions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/practice">
              <Button size="sm" variant="secondary">Open Practice</Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Main Tutor Chat Box */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Chat Window (3 cols) */}
        <div className="lg:col-span-3 flex flex-col h-[560px] bg-white border border-[#e3e3df] rounded-[6px] overflow-hidden">
          {/* Messages feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#fbfbfa]">
            {messages.map((m) => {
              const isUser = m.sender === 'user'

              return (
                <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className="text-[10px] font-semibold text-[#797973] mb-1">
                    {isUser ? 'You' : 'Cognara Tutor'} · {m.time}
                  </div>
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3.5 text-xs rounded-[4px] leading-relaxed border ${
                      isUser
                        ? 'bg-[#3730a3] text-white border-[#3730a3]'
                        : 'bg-white text-[#181816] border-[#e3e3df]'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>

                    {m.misconception && (
                      <div className="mt-3 pt-2.5 border-t border-[#fde68a] bg-[#fffbeb] text-[#92400e] p-2 rounded-[3px]">
                        <span className="font-bold">Detected Misconception: </span>
                        {m.misconception.name} — {m.misconception.note}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {loading && (
              <div className="text-xs text-[#797973] font-medium p-3 bg-white border border-[#e3e3df] rounded-[4px] inline-block">
                Tutor is formulating response...
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 border-t border-[#e3e3df] bg-[#ffffff] flex gap-2 overflow-x-auto text-xs">
            {[
              'Why is 2/3 bigger than 2/5?',
              "Why can't I just add denominators?",
              'Give me a problem to test my reasoning.'
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(p)}
                className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-[3px] border border-[#d4d4cf] bg-[#f9f9f7] text-[#494944] hover:bg-[#eef2ff] hover:text-[#3730a3] hover:border-[#c7d2fe]"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Row */}
          <div className="p-3 border-t border-[#e3e3df] bg-white">
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
                placeholder="Explain your thinking or ask why a rule works..."
                className="flex-1 text-xs px-3 py-2 rounded-[4px] border border-[#d4d4cf] bg-white text-[#181816] placeholder:text-[#999992] focus:border-[#3730a3] focus:ring-1 focus:ring-[#3730a3] outline-none"
              />
              <Button type="submit" variant="primary" disabled={!input.trim() || loading}>
                Send
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Reasoning Context & Diagnostic Rules */}
        <div className="space-y-4">
          <Card header={<h3 className="text-xs font-bold text-[#181816] uppercase">Diagnostic Focus</h3>}>
            <p className="text-xs text-[#575753] leading-relaxed">
              Misconception detection triggers when responses display systematic whole-number transfer to fractional contexts.
            </p>
            {detectedMisconception && (
              <div className="mt-3 p-2.5 rounded-[4px] border border-[#fde68a] bg-[#fffbeb] text-xs text-[#92400e]">
                <span className="font-bold">Active Hypothesis:</span>
                <p className="mt-0.5">{detectedMisconception.name}</p>
              </div>
            )}
          </Card>

          <Card header={<h3 className="text-xs font-bold text-[#181816] uppercase">Tutor Guidelines</h3>}>
            <ul className="text-xs text-[#575753] space-y-2">
              <li>1. State your steps out loud.</li>
              <li>2. Connect denominators to unit slice size.</li>
              <li>3. Clarify reasoning before proceeding.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

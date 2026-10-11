import { useState, useRef, useEffect } from 'react'
import {
  Send, Sparkles, Brain, Bot, UserRound, Lightbulb,
  CheckCircle2, ArrowRight, RefreshCw, AlertCircle
} from 'lucide-react'
import { chatWithTutor } from '../services/api'

export default function Tutor({ topicId = 'fractions', initialTopicTitle = 'Fractional Reasoning' }) {
  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'tutor',
      text: `Hello! I'm your Cognara Adaptive Tutor. We're currently exploring ${initialTopicTitle}. What question or concept feels tricky right now? You can also think out loud and explain your steps!`,
      misconceptionDetected: null,
      time: 'Just now'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeMisconception, setActiveMisconception] = useState(null)
  const messagesEndRef = useRef(null)

  const quickPrompts = [
    'Why is 2/3 bigger than 2/5 if 5 is a larger number?',
    "Show me a visual model of dividing a whole.",
    "Why can't I just add the denominators: 1/2 + 1/3 = 2/5?",
    'Give me a diagnostic question to test my understanding.'
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async (textToSend = inputValue) => {
    const trimmed = textToSend.trim()
    if (!trimmed || isTyping) return

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)

    try {
      const response = await chatWithTutor(trimmed, {
        topicId,
        history: messages.slice(-4),
        studentReasoning: trimmed
      })

      const tutorMsg = {
        id: `tut-${Date.now()}`,
        sender: 'tutor',
        text: response.text,
        misconceptionDetected: response.misconceptionDetected,
        isLiveBackend: response.isLiveBackend,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages((prev) => [...prev, tutorMsg])
      if (response.misconceptionDetected) {
        setActiveMisconception(response.misconceptionDetected)
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'tutor',
          text: "I encountered a minor connection hiccup, but here's a guiding thought: Whenever comparing fractions, remember the denominator is the number of equal parts the whole is partitioned into. Smaller denominators mean bigger slices!",
          time: 'Now'
        }
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex h-[640px] flex-col rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_16px_rgba(24,35,59,0.04)] sm:h-[680px]">
      {/* Tutor Header */}
      <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-violet-700 shadow-xs">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-[#18233b]">Cognara AI Tutor</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Adaptive Mode
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Focus: <span className="font-semibold text-slate-700">{initialTopicTitle}</span>
            </p>
          </div>
        </div>

        {activeMisconception && (
          <div className="hidden items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 md:flex">
            <Brain size={14} className="text-amber-600" />
            <span>Diagnosing: {activeMisconception.name}</span>
          </div>
        )}
      </div>

      {/* Message Feed */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-4 sm:p-6">
        {messages.map((m) => {
          const isUser = m.sender === 'user'

          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-bold ${
                  isUser
                    ? 'bg-violet-600 text-white'
                    : 'bg-violet-100 text-violet-700'
                }`}
              >
                {isUser ? <UserRound size={15} /> : <Bot size={16} />}
              </div>

              <div className={`max-w-[85%] sm:max-w-[75%]`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-xs leading-relaxed sm:text-sm ${
                    isUser
                      ? 'rounded-tr-xs bg-violet-600 text-white shadow-xs'
                      : 'rounded-tl-xs border border-slate-200/80 bg-white text-slate-800 shadow-[0_1px_4px_rgba(24,35,59,0.02)]'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Misconception Diagnostic Banner on Tutor Message */}
                  {m.misconceptionDetected && (
                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/80 p-2.5 text-xs text-amber-950">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <Brain size={13} className="text-amber-700" />
                        <span>Insight: {m.misconceptionDetected.name}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-amber-800">
                        {m.misconceptionDetected.note}
                      </p>
                    </div>
                  )}
                </div>

                <span
                  className={`mt-1 block text-[10px] text-slate-400 ${
                    isUser ? 'text-right' : 'text-left'
                  }`}
                >
                  {m.time}
                </span>
              </div>
            </div>
          )
        })}

        {isTyping && (
          <div className="flex items-center gap-2 rounded-xl bg-white p-3 text-xs text-slate-500 shadow-xs border border-slate-100 max-w-xs">
            <span className="h-2 w-2 rounded-full bg-violet-600 animate-bounce" />
            <span className="h-2 w-2 rounded-full bg-violet-600 animate-bounce delay-100" />
            <span className="h-2 w-2 rounded-full bg-violet-600 animate-bounce delay-200" />
            <span className="text-slate-400 text-xs">Analyzing conceptual reasoning...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="border-t border-slate-100 bg-white px-4 pt-3 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isTyping}
              onClick={() => handleSend(prompt)}
              className="shrink-0 rounded-full border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-[11px] font-bold text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="border-t border-slate-100 bg-white p-4 sm:px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            disabled={isTyping}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your explanation or ask why a rule works..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100 disabled:opacity-50 sm:text-sm"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-600 text-white shadow-xs transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={17} />
          </button>
        </form>
        <p className="mt-2 text-[10px] text-slate-400">
          Cognara tutor adapts follow-up questions to identify misconceptions without assigning rigid labels.
        </p>
      </div>
    </div>
  )
}

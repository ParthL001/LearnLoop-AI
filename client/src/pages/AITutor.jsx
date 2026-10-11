import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Button, Badge } from '../components/UI'
import { chatWithTutor, checkAIHealth } from '../services/api'
import { useApp } from '../context/AppContext'
import {
  MessageSquare, Terminal, Code2, Send, Trash2,
  RefreshCw, Sparkles, AlertCircle, Copy, Check, Lightbulb
} from 'lucide-react'

const STARTER_PROMPTS = {
  python: [
    'How does a Stack work in Python using lists?',
    'What is the difference between for loops and while loops?',
    'Why is collections.deque preferred for Queues in Python?',
    'How do Python variables reference objects in memory?'
  ],
  cpp: [
    'How do I use std::stack in C++ and what is LIFO?',
    'What is the difference between int, double, and char in C++?',
    'How does std::queue work in C++ STL?',
    'When should I use a while loop vs a for loop in C++?'
  ]
}

export default function AITutor() {
  const { id: routeSubject } = useParams()
  const { user } = useApp()

  const initialSubject = (routeSubject === 'cpp' || routeSubject === 'python') ? routeSubject : 'python'
  const [selectedSubject, setSelectedSubject] = useState(initialSubject)
  const [messages, setMessages] = useState([
    {
      id: 'init',
      sender: 'tutor',
      text: `Hello ${user?.name || 'there'}! I am your AI programming tutor powered by local Ollama (qwen3:4b). I can help you understand ${initialSubject === 'python' ? 'Python' : 'C++'} concepts, debug logic, or explain data structures like Stacks and Queues. What would you like to explore?`,
      time: 'Ready'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastFailedMessage, setLastFailedMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Switch subject and provide welcome message
  const handleSubjectChange = (newSubject) => {
    if (newSubject === selectedSubject) return
    setSelectedSubject(newSubject)
    setMessages([
      {
        id: `init-${newSubject}`,
        sender: 'tutor',
        text: `Switched to ${newSubject === 'python' ? 'Python' : 'C++'} tutor mode. Ask me any question about ${newSubject === 'python' ? 'Python' : 'C++'} syntax, variables, loops, or linear data structures!`,
        time: 'Ready'
      }
    ])
    setErrorMessage(null)
    setLastFailedMessage(null)
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'tutor',
        text: `Conversation cleared. Ask me any question about ${selectedSubject === 'python' ? 'Python' : 'C++'}!`,
        time: 'Ready'
      }
    ])
    setErrorMessage(null)
    setLastFailedMessage(null)
  }

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
    setErrorMessage(null)
    setLastFailedMessage(null)

    // Bound conversation history to last 6 messages to keep context window manageable
    const historyPayload = messages
      .filter((m) => m.id !== 'init' && !m.id.startsWith('init-'))
      .slice(-6)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }))

    try {
      const result = await chatWithTutor(text, {
        subject: selectedSubject,
        history: historyPayload
      })

      if (result.isOffline || !result.isLiveBackend) {
        // Honest error handling: no fake responses
        setErrorMessage(result.error || 'Ollama AI service is currently unavailable.')
        setLastFailedMessage(text)
      } else {
        const tutorMessage = {
          id: `tut-${Date.now()}`,
          sender: 'tutor',
          text: result.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        setMessages((prev) => [...prev, tutorMessage])
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to contact AI tutor.')
      setLastFailedMessage(text)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    if (lastFailedMessage) {
      handleSend(lastFailedMessage)
    }
  }

  const handleCopyMessage = (text, id) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const isPython = selectedSubject === 'python'
  const SubjectIcon = isPython ? Terminal : Code2
  const starters = STARTER_PROMPTS[selectedSubject] || []

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#303846] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#F8FAFC] tracking-tight">AI Tutor</h1>
            <Badge variant="accent">Local qwen3:4b</Badge>
          </div>
          <p className="mt-0.5 text-xs text-[#A8B3C4]">
            Ask questions, explore code snippets, and review concepts with multi-turn context.
          </p>
        </div>

        {/* Subject switcher and Clear button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#14171C] p-1 rounded-[6px] border border-[#303846]">
            <button
              type="button"
              onClick={() => handleSubjectChange('python')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-all ${
                selectedSubject === 'python'
                  ? 'bg-[#152746] text-[#3B82F6] font-semibold border border-[#1E3A8A]'
                  : 'text-[#A8B3C4] hover:text-[#F8FAFC]'
              }`}
            >
              <Terminal size={13} />
              <span>Python</span>
            </button>
            <button
              type="button"
              onClick={() => handleSubjectChange('cpp')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-all ${
                selectedSubject === 'cpp'
                  ? 'bg-[#152746] text-[#3B82F6] font-semibold border border-[#1E3A8A]'
                  : 'text-[#A8B3C4] hover:text-[#F8FAFC]'
              }`}
            >
              <Code2 size={13} />
              <span>C++</span>
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearChat}
            title="Start new conversation"
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="rounded-[8px] border border-[#303846] bg-[#14171C] flex flex-col h-[600px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user'

            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#152746] text-[#3B82F6] border border-[#1E3A8A] shrink-0 mt-0.5">
                    <Sparkles size={14} />
                  </div>
                )}

                <div
                  className={`max-w-[82%] sm:max-w-[75%] rounded-[6px] p-3.5 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-[#152746] text-[#F8FAFC] border border-[#1E3A8A]'
                      : 'bg-[#1B2028] text-[#F8FAFC] border border-[#303846]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1.5 text-[10px] text-[#7F8A9B]">
                    <span className="font-semibold uppercase tracking-wider">
                      {isUser ? 'You' : `${selectedSubject === 'python' ? 'Python' : 'C++'} Tutor`}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{m.time}</span>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(m.text, m.id)}
                          className="hover:text-[#F8FAFC] transition-colors"
                          title="Copy response"
                        >
                          {copiedId === m.id ? (
                            <Check size={11} className="text-[#22C55E]" />
                          ) : (
                            <Copy size={11} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message body with preserved formatting */}
                  <div className="whitespace-pre-line text-[#F8FAFC] font-sans">
                    {m.text}
                  </div>
                </div>

                {isUser && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#303846] text-[#F8FAFC] text-[11px] font-bold shrink-0 mt-0.5">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            )
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#152746] text-[#3B82F6] border border-[#1E3A8A] shrink-0 mt-0.5">
                <Sparkles size={14} className="animate-spin" />
              </div>
              <div className="rounded-[6px] p-3.5 bg-[#1B2028] border border-[#303846] text-xs text-[#7F8A9B] flex items-center gap-2">
                <RefreshCw size={12} className="animate-spin text-[#3B82F6]" />
                <span>Generating thoughtful explanation with qwen3:4b...</span>
              </div>
            </div>
          )}

          {/* Error Banner with Retry */}
          {errorMessage && (
            <div className="rounded-[6px] p-3.5 bg-[#450A0A]/40 border border-[#EF4444]/40 text-xs text-[#FCA5A5] space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle size={14} className="text-[#EF4444]" />
                <span>Ollama AI Tutor Unavailable</span>
              </div>
              <p className="text-[11px] text-[#FCA5A5]/80">
                {errorMessage}
              </p>
              {lastFailedMessage && (
                <div className="pt-1 flex items-center gap-2">
                  <Button size="xs" variant="primary" onClick={handleRetry}>
                    <RefreshCw size={11} />
                    <span>Retry Question</span>
                  </Button>
                </div>
              )}
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Starter Prompts Bar (when only initial message exists) */}
        {messages.length <= 1 && starters.length > 0 && (
          <div className="border-t border-[#303846] bg-[#0B0D10]/50 p-3 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7F8A9B] flex items-center gap-1.5">
              <Lightbulb size={12} className="text-[#3B82F6]" />
              Suggested Questions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {starters.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="rounded-[4px] border border-[#303846] bg-[#14171C] px-2.5 py-1 text-[11px] text-[#A8B3C4] hover:border-[#3B82F6] hover:text-[#F8FAFC] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="border-t border-[#303846] p-3 bg-[#14171C]">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask a question about ${selectedSubject === 'python' ? 'Python' : 'C++'} (e.g. explain Stack, Loops)...`}
              disabled={loading}
              className="flex-1 rounded-[6px] border border-[#303846] bg-[#1B2028] px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#7F8A9B] focus:border-[#3B82F6] focus:outline-hidden disabled:opacity-50"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading || !input.trim()}
            >
              <Send size={14} />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { chatWithTutor } from '../services/api'
import { useApp } from '../context/AppContext'
import {
  MessageSquare,
  Terminal,
  Code2,
  Send,
  Trash2,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Lightbulb,
} from 'lucide-react'

const STARTER_PROMPTS = {
  python: [
    'How does a Stack work in Python using lists?',
    'What is the difference between for loops and while loops?',
    'Why is collections.deque preferred for Queues in Python?',
    'How do Python variables reference objects in memory?',
  ],
  cpp: [
    'How do I use std::stack in C++ and what is LIFO?',
    'What is the difference between int, double, and char in C++?',
    'How does std::queue work in C++ STL?',
    'When should I use a while loop vs a for loop in C++?',
  ],
}

export default function AITutor() {
  const { id: routeSubject } = useParams()
  const { user } = useApp()

  const initialSubject =
    routeSubject === 'cpp' || routeSubject === 'python' ? routeSubject : 'python'
  const [selectedSubject, setSelectedSubject] = useState(initialSubject)
  const [messages, setMessages] = useState([
    {
      id: 'init',
      sender: 'tutor',
      text: `Hello ${
        user?.name || 'there'
      }! I am your AI programming tutor powered by local Ollama (qwen3:4b). I can help you understand ${
        initialSubject === 'python' ? 'Python' : 'C++'
      } concepts, diagnose mental models, or explain data structures like Stacks and Queues. What would you like to explore?`,
      time: 'Ready',
    },
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

  const handleSubjectChange = (newSubject) => {
    if (newSubject === selectedSubject) return
    setSelectedSubject(newSubject)
    setMessages([
      {
        id: `init-${newSubject}`,
        sender: 'tutor',
        text: `Switched to ${
          newSubject === 'python' ? 'Python' : 'C++'
        } tutor mode. Ask me any question about ${
          newSubject === 'python' ? 'Python' : 'C++'
        } syntax, variables, loops, or linear data structures!`,
        time: 'Ready',
      },
    ])
    setErrorMessage(null)
    setLastFailedMessage(null)
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'tutor',
        text: `Conversation cleared. Ask me any question about ${
          selectedSubject === 'python' ? 'Python' : 'C++'
        }!`,
        time: 'Ready',
      },
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
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setErrorMessage(null)
    setLastFailedMessage(null)

    const historyPayload = messages
      .filter((m) => m.id !== 'init' && !m.id.startsWith('init-'))
      .slice(-6)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }))

    try {
      const result = await chatWithTutor(text, {
        subject: selectedSubject,
        history: historyPayload,
      })

      if (result.isOffline || !result.isLiveBackend) {
        setErrorMessage(result.error || 'Ollama AI service is currently unavailable.')
        setLastFailedMessage(text)
      } else {
        const tutorMessage = {
          id: `tut-${Date.now()}`,
          sender: 'tutor',
          text: result.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

  const starters = STARTER_PROMPTS[selectedSubject] || []

  return (
    <div className="reveal-stagger space-y-6">
      {/* Header Bar */}
      <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="eyebrow mb-1">
            Interactive AI Tutor · Socratic Dialogue
          </div>
          <h1 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-[var(--text-main)]">
            AI Tutor & Diagnostic Guide
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Powered by local Ollama (<code className="font-mono text-[var(--accent-primary)] font-bold">qwen3:4b</code>). Ask questions, request analogies, or trace code step by step.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="tabs">
            <button
              type="button"
              onClick={() => handleSubjectChange('python')}
              aria-selected={selectedSubject === 'python'}
              className="tab font-mono text-xs font-bold"
            >
              <Terminal size={12} className="inline mr-1" />
              Python
            </button>
            <button
              type="button"
              onClick={() => handleSubjectChange('cpp')}
              aria-selected={selectedSubject === 'cpp'}
              className="tab font-mono text-xs font-bold"
            >
              <Code2 size={12} className="inline mr-1" />
              C++
            </button>
          </div>

          <button
            type="button"
            onClick={handleClearChat}
            className="btn btn-secondary p-2"
            title="Start new conversation"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="card p-0 flex flex-col h-[640px] overflow-hidden shadow-card">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[var(--bg-surface-elevated)]/40">
          {messages.map((m) => {
            const isUser = m.sender === 'user'

            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="icon-tile shrink-0 mt-0.5" style={{ width: '2.5rem', height: '2.5rem' }}>
                    <Sparkles size={18} className="text-[#F5B726]" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-lg p-4 text-xs leading-relaxed shadow-card ${
                    isUser
                      ? 'bg-[var(--accent-primary)] text-white border border-[var(--accent-hover)]'
                      : 'bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-soft)]'
                  }`}
                >
                  <div
                    className={`flex items-center justify-between gap-4 mb-2 text-[10px] ${
                      isUser ? 'text-[#C2D7D2]' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    <span className="font-mono font-bold uppercase tracking-wider">
                      {isUser ? 'You' : `${selectedSubject === 'python' ? 'Python' : 'C++'} Tutor`}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{m.time}</span>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(m.text, m.id)}
                          className="hover:text-[var(--text-main)] transition"
                          title="Copy response"
                        >
                          {copiedId === m.id ? (
                            <Check size={12} className="text-[#3D8B6A]" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="whitespace-pre-line font-sans text-[13px] leading-relaxed">
                    {m.text}
                  </div>
                </div>

                {isUser && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--text-main)] text-white text-xs font-mono font-bold shrink-0 mt-0.5 shadow-xs">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            )
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="icon-tile shrink-0 mt-0.5" style={{ width: '2.5rem', height: '2.5rem' }}>
                <Sparkles size={18} className="animate-spin text-[#F5B726]" />
              </div>
              <div className="card py-3 px-4 text-xs text-[var(--text-muted)] flex items-center gap-2">
                <RefreshCw size={13} className="animate-spin text-[var(--accent-primary)]" />
                <span className="font-sans">Generating thoughtful explanation with local Qwen3:4b...</span>
              </div>
            </div>
          )}

          {/* Error Banner with Retry */}
          {errorMessage && (
            <div className="alert alert-danger space-y-2">
              <div className="flex items-center gap-2 font-bold font-mono">
                <AlertCircle size={15} />
                <span>OLLAMA AI TUTOR UNAVAILABLE</span>
              </div>
              <p className="text-xs font-sans">{errorMessage}</p>
              {lastFailedMessage && (
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={handleRetry}
                    className="btn btn-primary btn-sm"
                  >
                    <RefreshCw size={11} />
                    <span>Retry Question</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Starter Prompts Bar */}
        {messages.length <= 1 && starters.length > 0 && (
          <div className="border-t border-[var(--border-soft)] bg-[var(--bg-surface-elevated)] p-3.5 space-y-2">
            <span className="eyebrow text-[10px] flex items-center gap-1.5">
              <Lightbulb size={12} className="text-[#F5B726]" />
              Suggested Questions
            </span>
            <div className="flex flex-wrap gap-2">
              {starters.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="p-2 px-3 rounded-md border border-[var(--border-soft)] bg-[var(--bg-surface)] text-xs text-[var(--text-body)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-hover)] hover:shadow-xs transition font-sans"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="border-t border-[var(--border-soft)] p-4 bg-[var(--bg-surface)]">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask a question about ${selectedSubject === 'python' ? 'Python' : 'C++'} (e.g. explain Stack, Loops)...`}
              disabled={loading}
              className="input flex-1"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn btn-primary"
            >
              <Send size={15} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

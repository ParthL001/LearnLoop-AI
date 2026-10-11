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
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#3D5F58]"></span>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#3D5F58]">
              Interactive AI Tutor
            </span>
          </div>
          <h1 className="font-heading text-2xl font-extrabold uppercase tracking-tight text-[#231F20]">
            AI Tutor · Multi-Turn Dialogue
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Powered by local Ollama (<code className="font-mono text-[#3D5F58]">qwen3:4b</code>). Ask questions, request analogies, or walk through code traces.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-[#F2F2EB] p-1 rounded-md border border-[#D8D8CF]">
            <button
              type="button"
              onClick={() => handleSubjectChange('python')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition ${
                selectedSubject === 'python'
                  ? 'bg-[#3D5F58] text-white shadow-xs'
                  : 'text-[#4B5563] hover:text-[#231F20]'
              }`}
            >
              <Terminal size={12} />
              <span>Python</span>
            </button>
            <button
              type="button"
              onClick={() => handleSubjectChange('cpp')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition ${
                selectedSubject === 'cpp'
                  ? 'bg-[#3D5F58] text-white shadow-xs'
                  : 'text-[#4B5563] hover:text-[#231F20]'
              }`}
            >
              <Code2 size={12} />
              <span>C++</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleClearChat}
            className="p-2 border border-[#D8D8CF] rounded-md text-[#6B7280] hover:text-[#231F20] hover:bg-[#F2F2EB] transition"
            title="Start new conversation"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg shadow-xs flex flex-col h-[620px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF9F5]/40">
          {messages.map((m) => {
            const isUser = m.sender === 'user'

            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#3D5F58] text-white shrink-0 mt-0.5">
                    <Sparkles size={16} className="text-[#F5B726]" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-lg p-4 text-xs leading-relaxed shadow-2xs ${
                    isUser
                      ? 'bg-[#3D5F58] text-white border border-[#2E4742]'
                      : 'bg-[#FFFFFF] text-[#231F20] border border-[#D8D8CF]'
                  }`}
                >
                  <div
                    className={`flex items-center justify-between gap-4 mb-2 text-[10px] ${
                      isUser ? 'text-[#C2D7D2]' : 'text-[#6B7280]'
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
                          className="hover:text-[#231F20] transition"
                          title="Copy response"
                        >
                          {copiedId === m.id ? (
                            <Check size={12} className="text-[#16A34A]" />
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#231F20] text-white text-xs font-mono font-bold shrink-0 mt-0.5">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            )
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#3D5F58] text-white shrink-0 mt-0.5">
                <Sparkles size={16} className="animate-spin text-[#F5B726]" />
              </div>
              <div className="rounded-lg p-4 bg-[#FFFFFF] border border-[#D8D8CF] text-xs text-[#6B7280] flex items-center gap-2 shadow-2xs">
                <RefreshCw size={13} className="animate-spin text-[#3D5F58]" />
                <span className="font-sans">Generating thoughtful explanation with local Qwen3:4b...</span>
              </div>
            </div>
          )}

          {/* Error Banner with Retry */}
          {errorMessage && (
            <div className="rounded-lg p-4 bg-[#FFF1F2] border border-[#FECDD3] text-xs text-[#9F1239] space-y-2">
              <div className="flex items-center gap-2 font-bold font-mono">
                <AlertCircle size={15} className="text-[#E11D48]" />
                <span>OLLAMA AI TUTOR UNAVAILABLE</span>
              </div>
              <p className="text-xs text-[#9F1239]/90 font-sans">{errorMessage}</p>
              {lastFailedMessage && (
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3D5F58] text-white text-xs font-bold rounded hover:bg-[#2E4742] transition"
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
          <div className="border-t border-[#D8D8CF] bg-[#FAF9F5] p-3 space-y-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5">
              <Lightbulb size={12} className="text-[#F5B726]" />
              Suggested Questions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {starters.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="rounded border border-[#D8D8CF] bg-[#FFFFFF] px-3 py-1 text-xs text-[#4B5563] hover:border-[#3D5F58] hover:text-[#231F20] transition font-sans"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="border-t border-[#D8D8CF] p-3 bg-[#FFFFFF]">
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
              className="flex-1 rounded-md border border-[#D8D8CF] bg-[#FAF9F5] px-4 py-2.5 text-xs sm:text-sm text-[#231F20] placeholder-[#9CA3AF] focus:bg-[#FFFFFF] focus:border-[#3D5F58] focus:outline-none focus:ring-1 focus:ring-[#3D5F58] disabled:opacity-50 transition"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3D5F58] text-white text-xs sm:text-sm font-bold rounded-md hover:bg-[#2E4742] disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0 shadow-xs"
            >
              <Send size={14} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

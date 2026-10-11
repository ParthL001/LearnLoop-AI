import { createContext, useContext, useState, useEffect } from 'react'
import {
  topics as defaultTopics,
  learningPathMilestones as defaultMilestones,
  recentMisconceptions as defaultMisconceptions,
  activityTrendData as defaultActivityData,
  practiceQuestions,
} from '../services/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // 1. Auth state (defaults to null or restored from localStorage)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cognara_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // 2. Dynamic curriculum topics state
  const [topics, setTopics] = useState(() => {
    try {
      const saved = localStorage.getItem('cognara_topics')
      return saved ? JSON.parse(saved) : defaultTopics
    } catch {
      return defaultTopics
    }
  })

  // 3. Dynamic milestones state
  const [milestones, setMilestones] = useState(() => {
    try {
      const saved = localStorage.getItem('cognara_milestones')
      return saved ? JSON.parse(saved) : defaultMilestones
    } catch {
      return defaultMilestones
    }
  })

  // 4. Dynamic mastery map
  const [mastery, setMastery] = useState(() => {
    try {
      const saved = localStorage.getItem('cognara_mastery')
      return saved ? JSON.parse(saved) : { fractions: 68, algebra: 54, logic: 82, probability: 38 }
    } catch {
      return { fractions: 68, algebra: 54, logic: 82, probability: 38 }
    }
  })

  // 5. Dynamic practice attempts history
  const [practiceHistory, setPracticeHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('cognara_history')
      return saved ? JSON.parse(saved) : [
        { id: 1, title: 'Unit Fraction Comparison', isCorrect: true, date: 'Today, 10:15 AM' },
        { id: 2, title: 'Unlike Denominators Probe', isCorrect: false, date: 'Today, 10:28 AM', misconception: 'Whole Number Value Bias' }
      ]
    } catch {
      return []
    }
  })

  // 6. Dynamic misconceptions log
  const [misconceptions, setMisconceptions] = useState(() => {
    try {
      const saved = localStorage.getItem('cognara_misconceptions')
      return saved ? JSON.parse(saved) : defaultMisconceptions
    } catch {
      return defaultMisconceptions
    }
  })

  // 7. Dynamic activity trend data (for Recharts)
  const [activityData, setActivityData] = useState(() => {
    try {
      const saved = localStorage.getItem('cognara_activity')
      return saved ? JSON.parse(saved) : defaultActivityData
    } catch {
      return defaultActivityData
    }
  })

  // Persist state updates to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('cognara_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('cognara_user')
    }
  }, [user])

  useEffect(() => {
    localStorage.setItem('cognara_mastery', JSON.stringify(mastery))
  }, [mastery])

  useEffect(() => {
    localStorage.setItem('cognara_topics', JSON.stringify(topics))
  }, [topics])

  useEffect(() => {
    localStorage.setItem('cognara_history', JSON.stringify(practiceHistory))
  }, [practiceHistory])

  useEffect(() => {
    localStorage.setItem('cognara_misconceptions', JSON.stringify(misconceptions))
  }, [misconceptions])

  // Dynamic actions
  const recordPracticeResult = ({ questionId, isCorrect, reasoning, misconception }) => {
    const q = practiceQuestions.find((item) => item.id === questionId) || practiceQuestions[0]
    const topicId = q.topicId || 'fractions'

    // Dynamically adjust mastery
    setMastery((prev) => {
      const current = prev[topicId] || 50
      const updated = isCorrect ? Math.min(100, current + 6) : Math.max(10, current - 4)
      return { ...prev, [topicId]: updated }
    })

    // Dynamically update topics list
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          const current = t.mastery || 50
          const updated = isCorrect ? Math.min(100, current + 6) : Math.max(10, current - 4)
          return { ...t, mastery: updated }
        }
        return t
      })
    )

    // Append to dynamic practice history
    setPracticeHistory((prev) => [
      {
        id: Date.now(),
        title: q.concept,
        isCorrect,
        reasoning,
        misconception: misconception?.title || null,
        date: 'Just now'
      },
      ...prev
    ])

    // If a misconception was triggered, dynamically update the active log
    if (misconception) {
      setMisconceptions((prev) => {
        const exists = prev.some((m) => m.concept === q.concept)
        if (exists) {
          return prev.map((m) =>
            m.concept === q.concept ? { ...m, status: 'In Remediation', detectedAt: 'Just now' } : m
          )
        }
        return [
          {
            id: `mis-${Date.now()}`,
            concept: q.concept,
            studentHypothesis: misconception.explanation,
            status: 'In Remediation',
            confidence: 'Identified via Reasoning',
            detectedAt: 'Just now',
            remedyAction: misconception.suggestion
          },
          ...prev
        ]
      })
    } else if (isCorrect) {
      // Mark as resolved if solved correctly
      setMisconceptions((prev) =>
        prev.map((m) =>
          m.concept === q.concept ? { ...m, status: 'Resolved' } : m
        )
      )
    }

    // Increment today's activity minutes dynamically
    setActivityData((prev) =>
      prev.map((d, idx) => (idx === prev.length - 1 ? { ...d, minutes: d.minutes + 5 } : d))
    )
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('cognara_user')
  }

  const value = {
    user,
    setUser,
    logout,
    topics,
    milestones,
    mastery,
    practiceHistory,
    misconceptions,
    activityData,
    recordPracticeResult,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

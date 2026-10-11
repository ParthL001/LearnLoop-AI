import { concepts } from '../data/concepts.js'
import { storageService } from './storageService.js'

export const MASTERY_RULE_SPEC = {
  minAttemptsForMastery: 2,
  accuracyThreshold: 0.75, // 75%
  description: 'A concept is marked "mastered" if the learner has at least 2 attempts with an observed accuracy of 75% or higher. Otherwise, concepts with at least 1 attempt are marked "in_progress", and concepts with 0 attempts are marked "not_started".'
}

export const DISCLAIMER_NOTE =
  'Mastery scores reflect observed performance on diagnostic probes recorded within this session. They are reproducible heuristic indicators of current diagnostic state and should not be interpreted as scientifically validated psychometric measures or proof of long-term cognitive retention.'

class ProgressService {
  /**
   * Computes deterministic progress and concept mastery for a learner.
   *
   * @param {string} [learnerId]
   * @returns {Promise<object>}
   */
  async getLearnerProgress(learnerId) {
    if (!learnerId || typeof learnerId !== 'string' || !learnerId.trim()) {
      return this.buildEmptyProgressPayload('anonymous', 'No learner identifier provided. Returning baseline empty progress.')
    }

    const cleanId = learnerId.trim()
    const attempts = await storageService.getAttempts(cleanId)

    if (!attempts || attempts.length === 0) {
      return this.buildEmptyProgressPayload(cleanId, 'No practice attempts recorded for this learner yet.')
    }

    // Group attempts by conceptId
    const attemptsByConcept = {}
    for (const c of concepts) {
      attemptsByConcept[c.id] = []
    }

    let totalCorrect = 0
    for (const att of attempts) {
      if (att.isCorrect) totalCorrect += 1
      if (attemptsByConcept[att.conceptId]) {
        attemptsByConcept[att.conceptId].push(att)
      } else {
        // Concept id may be legacy or generic
        attemptsByConcept[att.conceptId] = [att]
      }
    }

    const masteryMap = {}
    const conceptProgressList = []
    let masteredCount = 0

    for (const concept of concepts) {
      const conceptAttempts = attemptsByConcept[concept.id] || []
      const total = conceptAttempts.length
      const correct = conceptAttempts.filter((a) => a.isCorrect).length

      let accuracy = 0
      let status = 'not_started'
      let masteryScore = 0

      if (total > 0) {
        accuracy = correct / total
        masteryScore = Math.round(accuracy * 100)
        if (total >= MASTERY_RULE_SPEC.minAttemptsForMastery && accuracy >= MASTERY_RULE_SPEC.accuracyThreshold) {
          status = 'mastered'
          masteredCount += 1
        } else {
          status = 'in_progress'
        }
      }

      masteryMap[concept.id] = masteryScore

      conceptProgressList.push({
        id: concept.id,
        title: concept.title,
        sequence: concept.sequence,
        mastery: masteryScore,
        attemptsCount: total,
        correctCount: correct,
        accuracyPercentage: total > 0 ? Math.round(accuracy * 100) : 0,
        status,
        subject: 'Mathematics',
        level: 'Fundamental'
      })
    }

    const totalAttempts = attempts.length
    const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0
    const totalMasterySum = Object.values(masteryMap).reduce((a, b) => a + b, 0)
    const overallMasteryScore = Math.round(totalMasterySum / concepts.length)

    // Format recent practice history matching frontend Progress.jsx and AppContext.jsx
    const practiceHistory = [...attempts]
      .reverse()
      .slice(0, 15)
      .map((att) => {
        const c = concepts.find((item) => item.id === att.conceptId)
        return {
          id: att.id,
          questionId: att.questionId,
          conceptId: att.conceptId,
          title: c ? c.title : 'Fraction Practice',
          isCorrect: att.isCorrect,
          reasoning: att.studentReasoning || '',
          misconception: att.misconception || null,
          diagnosisStatus: att.diagnosisStatus,
          timestamp: att.timestamp,
          date: new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      })

    // Active misconceptions list
    const misconceptionsMap = new Map()
    for (const att of attempts) {
      if (att.misconception) {
        const existing = misconceptionsMap.get(att.misconception)
        if (!existing || new Date(att.timestamp) > new Date(existing.detectedAt)) {
          misconceptionsMap.set(att.misconception, {
            id: `mis-${att.id}`,
            conceptId: att.conceptId,
            name: att.misconception,
            detectedAt: att.timestamp,
            status: att.isCorrect ? 'Resolved' : 'In Remediation'
          })
        }
      }
    }
    const recentMisconceptions = Array.from(misconceptionsMap.values())

    return {
      learnerId: cleanId,
      overallMasteryScore,
      overallAccuracy,
      totalAttempts,
      correctAttempts: totalCorrect,
      conceptsMasteredCount: masteredCount,
      totalConcepts: concepts.length,
      topics: conceptProgressList,
      mastery: masteryMap,
      practiceHistory,
      recentMisconceptions,
      masteryRule: MASTERY_RULE_SPEC,
      disclaimer: DISCLAIMER_NOTE
    }
  }

  /**
   * Helper to build empty progress payload for empty history or unknown learner.
   */
  buildEmptyProgressPayload(learnerId, note = '') {
    const masteryMap = {}
    const conceptProgressList = concepts.map((concept) => {
      masteryMap[concept.id] = 0
      return {
        id: concept.id,
        title: concept.title,
        sequence: concept.sequence,
        mastery: 0,
        attemptsCount: 0,
        correctCount: 0,
        accuracyPercentage: 0,
        status: 'not_started',
        subject: 'Mathematics',
        level: 'Fundamental'
      }
    })

    return {
      learnerId,
      overallMasteryScore: 0,
      overallAccuracy: 0,
      totalAttempts: 0,
      correctAttempts: 0,
      conceptsMasteredCount: 0,
      totalConcepts: concepts.length,
      topics: conceptProgressList,
      mastery: masteryMap,
      practiceHistory: [],
      recentMisconceptions: [],
      note,
      masteryRule: MASTERY_RULE_SPEC,
      disclaimer: DISCLAIMER_NOTE
    }
  }
}

export const progressService = new ProgressService()

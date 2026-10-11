import { questions, sanitizeQuestionForPublic } from '../data/questions.js'
import { concepts } from '../data/concepts.js'

export class AdaptiveService {
  /**
   * Selects the next appropriate diagnostic practice item using deterministic rules.
   *
   * @param {object} params
   * @param {string} [params.conceptId]
   * @param {Array<string>} [params.attemptedQuestionIds]
   * @param {string} [params.lastMisconceptionCode]
   * @returns {object}
   */
  getNextQuestion({ conceptId, attemptedQuestionIds = [], lastMisconceptionCode = null }) {
    // 1. Filter questions by concept if specified
    let pool = conceptId && conceptId !== 'all'
      ? questions.filter((q) => q.conceptId === conceptId)
      : [...questions]

    if (pool.length === 0) {
      // Fallback to all questions if invalid concept requested
      pool = [...questions]
    }

    const attemptedSet = new Set(attemptedQuestionIds)

    // 2. Targeted remediation path: if a misconception was identified
    if (lastMisconceptionCode) {
      // Find questions in pool that test this misconception or are foundational
      const targetedQuestions = pool.filter((q) => {
        if (!q.misconceptionRules) return false
        return Object.values(q.misconceptionRules).some((r) => r.code === lastMisconceptionCode)
      })

      // Try unattempted targeted questions first
      const unattemptedTargeted = targetedQuestions.filter((q) => !attemptedSet.has(q.id))
      if (unattemptedTargeted.length > 0) {
        const selected = unattemptedTargeted[0]
        return {
          question: sanitizeQuestionForPublic(selected),
          selectionReason: `Targeted remediation probe selected to address identified misconception: ${lastMisconceptionCode}.`,
          isRemediationProbe: true,
          followUpActivity: selected.followUpActivity,
          remainingInConcept: pool.filter((q) => !attemptedSet.has(q.id)).length,
        }
      }

      // If targeted were all attempted, check foundational items for the concept
      const foundationalItems = pool.filter((q) => q.difficulty === 'foundational' && !attemptedSet.has(q.id))
      if (foundationalItems.length > 0) {
        const selected = foundationalItems[0]
        return {
          question: sanitizeQuestionForPublic(selected),
          selectionReason: `Foundational concept reinforcement selected following misconception: ${lastMisconceptionCode}.`,
          isRemediationProbe: true,
          followUpActivity: selected.followUpActivity,
          remainingInConcept: pool.filter((q) => !attemptedSet.has(q.id)).length,
        }
      }
    }

    // 3. Standard progression: unattempted questions in concept order
    const unattempted = pool.filter((q) => !attemptedSet.has(q.id))

    if (unattempted.length > 0) {
      // Pick first unattempted according to sequence/difficulty
      const selected = unattempted[0]
      return {
        question: sanitizeQuestionForPublic(selected),
        selectionReason: `Sequential diagnostic item for concept "${selected.conceptTitle}".`,
        isRemediationProbe: false,
        followUpActivity: null,
        remainingInConcept: unattempted.length - 1,
      }
    }

    // 4. If all items in the pool have been attempted, recycle least recently used
    const recycled = pool[0]
    return {
      question: sanitizeQuestionForPublic(recycled),
      selectionReason: `All items in this concept set have been completed. Recycling item "${recycled.id}" for retention verification.`,
      isRemediationProbe: false,
      followUpActivity: recycled.followUpActivity,
      remainingInConcept: 0,
    }
  }

  /**
   * Retrieves all verified concepts.
   */
  getConcepts() {
    return concepts
  }

  /**
   * Retrieves all public questions for a concept (strictly sanitized).
   */
  getQuestionsForConcept(conceptId) {
    const list = conceptId && conceptId !== 'all'
      ? questions.filter((q) => q.conceptId === conceptId)
      : questions
    return list.map(sanitizeQuestionForPublic)
  }

  /**
   * Retrieves single public question by ID (strictly sanitized).
   */
  getQuestionById(id) {
    const q = questions.find((item) => item.id === id)
    return q ? sanitizeQuestionForPublic(q) : null
  }
}

export const adaptiveService = new AdaptiveService()

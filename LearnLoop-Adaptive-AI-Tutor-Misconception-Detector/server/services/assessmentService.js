import {
  fixedAssessmentItems,
  getPublicAssessment,
  ASSESSMENT_VERSION
} from '../data/assessments.js'
import { storageService } from './storageService.js'

export const METHODOLOGICAL_CAVEAT =
  'Assessment results reflect observed diagnostic performance on identical pre- and post-test items. In accordance with educational evaluation guidelines, score increases cannot be claimed as sole proof of product causation due to test-retest practice effects, testing familiarity, external learning, and maturation factors.'

class AssessmentService {
  /**
   * Retrieve sanitized assessment items for learner presentation.
   * Never exposes answer keys.
   */
  getAssessment(type = 'pre') {
    return getPublicAssessment(type)
  }

  /**
   * Evaluate and record an assessment submission.
   *
   * @param {object} params
   * @param {string} params.learnerId
   * @param {string} params.type 'pre' | 'post'
   * @param {string} [params.version]
   * @param {Array} params.itemResponses
   * @returns {Promise<object>}
   */
  async submitAssessment({
    learnerId,
    type,
    version = ASSESSMENT_VERSION,
    itemResponses = []
  }) {
    if (!learnerId || typeof learnerId !== 'string' || !learnerId.trim()) {
      const err = new Error('learnerId is required to submit assessment.')
      err.status = 400
      throw err
    }

    const cleanType = (type || '').toLowerCase().trim()
    if (!['pre', 'post'].includes(cleanType)) {
      const err = new Error('Assessment type must be either "pre" or "post".')
      err.status = 400
      throw err
    }

    if (!Array.isArray(itemResponses) || itemResponses.length === 0) {
      const err = new Error('itemResponses array is required and must not be empty.')
      err.status = 400
      throw err
    }

    // Verify answers deterministically against backend answer keys
    let rawScore = 0
    const scoredItems = []
    const totalItems = fixedAssessmentItems.length

    for (const fixedItem of fixedAssessmentItems) {
      const submitted = itemResponses.find(
        (r) => r.questionId === fixedItem.id || r.id === fixedItem.id
      )

      if (submitted && typeof submitted.selectedAnswerIndex === 'number') {
        const isCorrect = submitted.selectedAnswerIndex === fixedItem.correctIndex
        if (isCorrect) rawScore += 1

        let detectedMisconception = null
        if (!isCorrect && fixedItem.misconceptionRules) {
          const matched = fixedItem.misconceptionRules.find(
            (m) => m.distractorIndex === submitted.selectedAnswerIndex
          )
          if (matched) {
            detectedMisconception = {
              code: matched.code,
              name: matched.name,
              description: matched.description
            }
          }
        }

        scoredItems.push({
          questionId: fixedItem.id,
          conceptId: fixedItem.conceptId,
          conceptTitle: fixedItem.conceptTitle,
          isCorrect,
          selectedAnswerIndex: submitted.selectedAnswerIndex,
          studentReasoning: submitted.studentReasoning || '',
          detectedMisconception
        })
      } else {
        // Missing answer
        scoredItems.push({
          questionId: fixedItem.id,
          conceptId: fixedItem.conceptId,
          conceptTitle: fixedItem.conceptTitle,
          isCorrect: false,
          selectedAnswerIndex: null,
          unanswered: true
        })
      }
    }

    const percentage = Math.round((rawScore / totalItems) * 100)
    const isComplete = scoredItems.every((item) => !item.unanswered)
    const completionStatus = isComplete ? 'completed' : 'incomplete'

    const scores = {
      rawScore,
      totalItems,
      percentage
    }

    // Persist via storageService (handles duplicate prevention with 409)
    const saved = await storageService.recordAssessment({
      learnerId: learnerId.trim(),
      type: cleanType,
      version,
      itemResponses: scoredItems,
      scores,
      completionStatus
    })

    return {
      submissionId: saved.id,
      learnerId: saved.learnerId,
      type: saved.type,
      version: saved.version,
      scores: saved.scores,
      completionStatus: saved.completionStatus,
      completedAt: saved.completedAt,
      itemCount: totalItems,
      methodologicalNote: METHODOLOGICAL_CAVEAT
    }
  }

  /**
   * Compare pre and post assessment results for an individual learner.
   *
   * @param {string} learnerId
   * @returns {Promise<object>}
   */
  async getLearnerReport(learnerId) {
    if (!learnerId || typeof learnerId !== 'string' || !learnerId.trim()) {
      const err = new Error('learnerId is required.')
      err.status = 400
      throw err
    }

    const cleanId = learnerId.trim()
    const records = await storageService.getAssessments(cleanId)

    const preRecord = records
      .filter((r) => r.type === 'pre')
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0]

    const postRecord = records
      .filter((r) => r.type === 'post')
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0]

    const hasPairedResults = Boolean(preRecord && postRecord)
    let percentagePointChange = null
    let rawScoreChange = null
    let relativeChange = null

    if (hasPairedResults) {
      percentagePointChange = postRecord.scores.percentage - preRecord.scores.percentage
      rawScoreChange = postRecord.scores.rawScore - preRecord.scores.rawScore
      if (preRecord.scores.percentage > 0) {
        relativeChange = Math.round(
          ((postRecord.scores.percentage - preRecord.scores.percentage) /
            preRecord.scores.percentage) *
            100
        )
      } else {
        relativeChange = postRecord.scores.percentage > 0 ? 100 : 0
      }
    }

    let statusNote = 'Paired evaluation data complete.'
    if (!preRecord && !postRecord) {
      statusNote = 'No pre-test or post-test assessments recorded for this learner.'
    } else if (preRecord && !postRecord) {
      statusNote = 'Pre-test completed. Post-test has not been completed yet.'
    } else if (!preRecord && postRecord) {
      statusNote = 'Post-test completed without baseline pre-test. Direct change cannot be computed.'
    }

    return {
      learnerId: cleanId,
      hasPairedResults,
      statusNote,
      preAssessment: preRecord
        ? {
            id: preRecord.id,
            completedAt: preRecord.completedAt,
            scores: preRecord.scores,
            completionStatus: preRecord.completionStatus
          }
        : null,
      postAssessment: postRecord
        ? {
            id: postRecord.id,
            completedAt: postRecord.completedAt,
            scores: postRecord.scores,
            completionStatus: postRecord.completionStatus
          }
        : null,
      comparison: hasPairedResults
        ? {
            prePercentage: preRecord.scores.percentage,
            postPercentage: postRecord.scores.percentage,
            percentagePointChange,
            rawScoreChange,
            relativeChangePercentage: relativeChange,
            interpretation:
              percentagePointChange > 0
                ? `Observed +${percentagePointChange} percentage-point difference across diagnostic items.`
                : percentagePointChange === 0
                ? 'Observed unchanged performance across diagnostic items.'
                : `Observed ${percentagePointChange} percentage-point change.`
          }
        : null,
      methodologicalCaveat: METHODOLOGICAL_CAVEAT
    }
  }

  /**
   * Generates cohort report across all learners.
   *
   * @returns {Promise<object>}
   */
  async getCohortReport() {
    const all = await storageService.getAllAssessments()

    // Group by learner
    const learnerMap = new Map()
    for (const rec of all) {
      if (!learnerMap.has(rec.learnerId)) {
        learnerMap.set(rec.learnerId, { pre: null, post: null })
      }
      const pair = learnerMap.get(rec.learnerId)
      if (rec.type === 'pre' && (!pair.pre || new Date(rec.completedAt) > new Date(pair.pre.completedAt))) {
        pair.pre = rec
      } else if (rec.type === 'post' && (!pair.post || new Date(rec.completedAt) > new Date(pair.post.completedAt))) {
        pair.post = rec
      }
    }

    let preCount = 0
    let postCount = 0
    let pairedCount = 0
    let sumPrePaired = 0
    let sumPostPaired = 0

    for (const pair of learnerMap.values()) {
      if (pair.pre) preCount += 1
      if (pair.post) postCount += 1
      if (pair.pre && pair.post) {
        pairedCount += 1
        sumPrePaired += pair.pre.scores.percentage
        sumPostPaired += pair.post.scores.percentage
      }
    }

    const meanPrePercentage = pairedCount > 0 ? Math.round(sumPrePaired / pairedCount) : null
    const meanPostPercentage = pairedCount > 0 ? Math.round(sumPostPaired / pairedCount) : null
    const meanPercentagePointChange =
      pairedCount > 0 ? meanPostPercentage - meanPrePercentage : null

    const attritionCount = Math.max(0, preCount - pairedCount)

    return {
      totalLearners: learnerMap.size,
      totalPreAssessments: preCount,
      totalPostAssessments: postCount,
      pairedLearnersCount: pairedCount,
      attritionCount,
      attritionNote:
        attritionCount > 0
          ? `${attritionCount} learner(s) completed baseline pre-test but did not complete post-test. Unpaired learners are excluded from paired growth metrics to prevent survivor bias.`
          : 'Zero attrition observed in current cohort.',
      pairedMetrics: pairedCount > 0
        ? {
            meanPrePercentage,
            meanPostPercentage,
            meanPercentagePointChange,
            pairedSampleSize: pairedCount
          }
        : null,
      missingDataExplanation:
        'Missing assessments occur when learners skip either pre-intervention baseline or post-intervention verification. Only complete pre-and-post pairs are evaluated for comparative analysis.',
      methodologicalCaveat: METHODOLOGICAL_CAVEAT
    }
  }
}

export const assessmentService = new AssessmentService()

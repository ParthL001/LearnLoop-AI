import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const STORAGE_DIR = path.resolve(__dirname, '../data/storage')
const ATTEMPTS_FILE = path.join(STORAGE_DIR, 'attempts.json')
const ASSESSMENTS_FILE = path.join(STORAGE_DIR, 'assessments.json')
const TOPIC_HISTORY_FILE = path.join(STORAGE_DIR, 'topic_history.json')

// Write lock queue to prevent concurrent file write collisions
const writeLocks = new Map()

async function withLock(fileKey, task) {
  const previous = writeLocks.get(fileKey) || Promise.resolve()
  let resolveCurrent
  const current = new Promise((resolve) => {
    resolveCurrent = resolve
  })
  writeLocks.set(fileKey, current)

  try {
    await previous
    return await task()
  } finally {
    resolveCurrent()
    if (writeLocks.get(fileKey) === current) {
      writeLocks.delete(fileKey)
    }
  }
}

/**
 * Ensures storage directory and initial files exist.
 */
async function ensureStorageReady() {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  try {
    await fs.access(ATTEMPTS_FILE)
  } catch {
    await atomicWriteFile(ATTEMPTS_FILE, [])
  }
  try {
    await fs.access(ASSESSMENTS_FILE)
  } catch {
    await atomicWriteFile(ASSESSMENTS_FILE, [])
  }
  try {
    await fs.access(TOPIC_HISTORY_FILE)
  } catch {
    await atomicWriteFile(TOPIC_HISTORY_FILE, [])
  }
}

/**
 * Safely and atomically write JSON data to disk using a temp file.
 * Handles Windows transient EPERM/EBUSY file locks with backoff retry.
 */
async function atomicWriteFile(filePath, data) {
  const dir = path.dirname(filePath)
  await fs.mkdir(dir, { recursive: true })
  const tempPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`
  const serialized = JSON.stringify(data, null, 2)

  await fs.writeFile(tempPath, serialized, 'utf8')

  let renamed = false
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await fs.rename(tempPath, filePath)
      renamed = true
      break
    } catch (err) {
      if (err.code === 'EPERM' || err.code === 'EBUSY') {
        await new Promise((r) => setTimeout(r, 30 * (attempt + 1)))
      } else {
        break
      }
    }
  }

  if (!renamed) {
    try {
      await fs.writeFile(filePath, serialized, 'utf8')
      await fs.unlink(tempPath).catch(() => {})
    } catch (err) {
      await fs.unlink(tempPath).catch(() => {})
      throw new Error(`Persistence failure writing to ${path.basename(filePath)}: ${err.message}`)
    }
  }
}

/**
 * Read JSON file safely.
 */
async function readJsonFile(filePath) {
  await ensureStorageReady()
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    if (!raw.trim()) return []
    return JSON.parse(raw)
  } catch (err) {
    if (err.code === 'ENOENT') return []
    throw new Error(`Failed to read persistence file ${path.basename(filePath)}: ${err.message}`)
  }
}

class StorageService {
  /**
   * Record a learner question attempt.
   *
   * @param {object} params
   * @param {string} params.learnerId
   * @param {string} params.questionId
   * @param {string} params.conceptId
   * @param {boolean} params.isCorrect
   * @param {string} [params.diagnosisStatus]
   * @param {string|null} [params.misconception]
   * @param {object|null} [params.followUpActivity]
   * @param {string} [params.studentReasoning]
   * @param {number} [params.selectedAnswerIndex]
   * @returns {Promise<object>} The stored attempt record
   */
  async recordAttempt({
    learnerId,
    questionId,
    conceptId,
    isCorrect,
    diagnosisStatus = 'undetermined',
    misconception = null,
    followUpActivity = null,
    studentReasoning = '',
    selectedAnswerIndex = null
  }) {
    if (!learnerId || typeof learnerId !== 'string') {
      const err = new Error('learnerId is required to record attempt.')
      err.status = 400
      throw err
    }
    if (!questionId || typeof questionId !== 'string') {
      const err = new Error('questionId is required to record attempt.')
      err.status = 400
      throw err
    }
    if (!conceptId || typeof conceptId !== 'string') {
      const err = new Error('conceptId is required to record attempt.')
      err.status = 400
      throw err
    }
    if (typeof isCorrect !== 'boolean') {
      const err = new Error('isCorrect must be a boolean.')
      err.status = 400
      throw err
    }

    const newRecord = {
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      learnerId: learnerId.trim(),
      questionId: questionId.trim(),
      conceptId: conceptId.trim(),
      isCorrect,
      diagnosisStatus,
      misconception: misconception || null,
      followUpActivity: followUpActivity || null,
      studentReasoning: typeof studentReasoning === 'string' ? studentReasoning.trim() : '',
      selectedAnswerIndex,
      timestamp: new Date().toISOString()
    }

    return await withLock('attempts', async () => {
      const records = await readJsonFile(ATTEMPTS_FILE)
      records.push(newRecord)
      await atomicWriteFile(ATTEMPTS_FILE, records)
      return newRecord
    })
  }

  /**
   * Retrieve all attempts, optionally filtered by learnerId.
   */
  async getAttempts(learnerId = null) {
    const records = await readJsonFile(ATTEMPTS_FILE)
    if (!learnerId) return records
    const cleanId = String(learnerId).trim()
    return records.filter((r) => r.learnerId === cleanId)
  }

  /**
   * Record pre-test or post-test assessment.
   * Prevents duplicate submissions of the same assessment type by the same learner.
   *
   * @param {object} params
   * @param {string} params.learnerId
   * @param {string} params.type 'pre' | 'post'
   * @param {string} params.version
   * @param {Array} params.itemResponses
   * @param {object} params.scores
   * @param {string} [params.completionStatus] 'completed' | 'incomplete'
   * @returns {Promise<object>}
   */
  async recordAssessment({
    learnerId,
    type,
    version = 'v1.0',
    itemResponses = [],
    scores,
    completionStatus = 'completed'
  }) {
    if (!learnerId || typeof learnerId !== 'string') {
      const err = new Error('learnerId is required to record assessment.')
      err.status = 400
      throw err
    }
    if (!['pre', 'post'].includes(type)) {
      const err = new Error('Assessment type must be either "pre" or "post".')
      err.status = 400
      throw err
    }
    if (!scores || typeof scores.rawScore !== 'number') {
      const err = new Error('Valid scores object is required.')
      err.status = 400
      throw err
    }

    const cleanLearnerId = learnerId.trim()

    return await withLock('assessments', async () => {
      const records = await readJsonFile(ASSESSMENTS_FILE)

      // Prevent duplicate submissions of same type & version for this learner
      const existing = records.find(
        (a) => a.learnerId === cleanLearnerId && a.type === type && a.version === version
      )
      if (existing) {
        const err = new Error(
          `Duplicate submission detected: Learner "${cleanLearnerId}" has already submitted the ${type}-test for version ${version}. Duplicate submissions are not permitted.`
        )
        err.status = 409
        throw err
      }

      const newRecord = {
        id: `asm-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        learnerId: cleanLearnerId,
        type,
        version,
        itemResponses,
        scores,
        completionStatus,
        completedAt: new Date().toISOString()
      }

      records.push(newRecord)
      await atomicWriteFile(ASSESSMENTS_FILE, records)
      return newRecord
    })
  }

  /**
   * Retrieve assessments for a learner.
   */
  async getAssessments(learnerId = null) {
    const records = await readJsonFile(ASSESSMENTS_FILE)
    if (!learnerId) return records
    const cleanId = String(learnerId).trim()
    return records.filter((r) => r.learnerId === cleanId)
  }

  /**
   * Track real learner interaction with a topic (opened lesson, completed practice).
   */
  async trackTopicAccess({ learnerId, subjectId, topicId, topicTitle, action = 'opened_lesson' }) {
    if (!learnerId || !subjectId || !topicId) {
      throw new Error('learnerId, subjectId, and topicId are required.')
    }

    const cleanLearnerId = String(learnerId).trim()

    return await withLock('topic_history', async () => {
      const records = await readJsonFile(TOPIC_HISTORY_FILE)

      const entry = {
        id: `th-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        learnerId: cleanLearnerId,
        subjectId: subjectId.toLowerCase(),
        topicId: topicId.toLowerCase(),
        topicTitle: topicTitle || topicId,
        action,
        timestamp: new Date().toISOString()
      }

      records.push(entry)
      await atomicWriteFile(TOPIC_HISTORY_FILE, records)
      return entry
    })
  }

  /**
   * Retrieve real topic access history for a learner.
   */
  async getTopicHistory(learnerId = null) {
    const records = await readJsonFile(TOPIC_HISTORY_FILE)
    if (!learnerId) return records
    const cleanId = String(learnerId).trim()
    return records.filter((r) => r.learnerId === cleanId)
  }
}

export const storageService = new StorageService()

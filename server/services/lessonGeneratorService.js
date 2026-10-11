import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { ollamaService } from './ollamaService.js'
import { getSubjectById, getTopicById } from '../data/subjects.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CACHE_DIR = path.resolve(__dirname, '../data/cache')
const LESSONS_CACHE_FILE = path.join(CACHE_DIR, 'lessons.json')

// In-memory cache for fast lookups
let inMemoryCache = null

async function ensureCacheReady() {
  await fs.mkdir(CACHE_DIR, { recursive: true })
  try {
    const raw = await fs.readFile(LESSONS_CACHE_FILE, 'utf8')
    inMemoryCache = JSON.parse(raw)
  } catch {
    inMemoryCache = {}
    await fs.writeFile(LESSONS_CACHE_FILE, JSON.stringify({}, null, 2), 'utf8')
  }
}

async function saveToCache(key, data) {
  try {
    if (!inMemoryCache) await ensureCacheReady()
    inMemoryCache[key] = {
      ...data,
      cachedAt: new Date().toISOString()
    }
    await fs.writeFile(LESSONS_CACHE_FILE, JSON.stringify(inMemoryCache, null, 2), 'utf8')
  } catch (err) {
    console.error(`[LessonCache] Warning: Failed to write to disk cache: ${err.message}`)
  }
}

export class LessonGeneratorService {
  /**
   * Generates or retrieves a cached lesson for a given subject and topic.
   * @param {string} subjectId - 'python' | 'cpp'
   * @param {string} topicId - 'data-types' | 'variables' | 'loops' | 'stack' | 'queue'
   * @param {boolean} [forceRefresh=false]
   * @returns {Promise<object>}
   */
  async getLesson(subjectId, topicId, forceRefresh = false) {
    const subject = getSubjectById(subjectId)
    if (!subject) {
      throw new Error(`Subject "${subjectId}" is invalid. Allowed subjects: python, cpp.`)
    }

    const topic = getTopicById(subjectId, topicId)
    if (!topic) {
      throw new Error(`Topic "${topicId}" is not part of the ${subject.name} curriculum.`)
    }

    const cacheKey = `${subject.id}:${topic.id}`

    if (!inMemoryCache) {
      await ensureCacheReady()
    }

    // 1. Return cached lesson if available and not forced refresh
    if (!forceRefresh && inMemoryCache[cacheKey]) {
      return {
        ...inMemoryCache[cacheKey],
        fromCache: true
      }
    }

    // 2. Build structured prompt for local Ollama Qwen3:4b
    const isStackOrQueue = topic.id === 'stack' || topic.id === 'queue'
    const languageSpecificInstructions = subject.id === 'python'
      ? 'Ensure all code is valid, clean, PEP 8 compliant Python 3 code with clear comments.'
      : 'Ensure all code is valid, clean, modern C++ (C++17/20) code with #include statements, standard namespaces, and a runnable main function.'

    const dataStructureGuidance = isStackOrQueue
      ? `CRITICAL FOR ${topic.title.toUpperCase()}: Explain the actual data-structure behavior (LIFO/FIFO principles, pointer/index updates, push/pop mechanics, and practical applications like undo buffers or call stacks) rather than treating it merely as standard library syntax.`
      : ''

    const prompt = `You are a patient, senior computer science instructor teaching a beginner student.
Generate a comprehensive, structured lesson on "${topic.title}" in ${subject.name}.

Objective: ${topic.objective}
Target audience: Beginner programming student.
Language: ${subject.name}

${languageSpecificInstructions}
${dataStructureGuidance}

You MUST return your response as a valid, parsable JSON object matching this schema EXACTLY:
{
  "topicTitle": "${topic.title} in ${subject.name}",
  "shortIntroduction": "A 2-3 sentence engaging overview introducing the concept simply.",
  "learningObjectives": [
    "Specific objective 1",
    "Specific objective 2",
    "Specific objective 3"
  ],
  "conceptExplanation": "A thorough, intuitive explanation of what ${topic.title} is, why programmers use it, and how it works under the hood.",
  "simpleExamples": "Everyday real-world analogies or simple breakdown illustrating the core concept.",
  "codeExamples": "Complete, working code example in ${subject.name} illustrating the core operations with comments.",
  "codeExplanation": "Step-by-step breakdown explaining what each line of the code example does.",
  "commonMistakes": [
    "Common mistake 1 beginner students make and how to avoid it",
    "Common mistake 2 beginner students make and how to avoid it"
  ],
  "shortRecap": "A concise summary emphasizing the main takeaway before practicing.",
  "practiceQuestions": [
    {
      "id": "q1",
      "prompt": "Conceptual question 1 testing understanding of ${topic.title}?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why Option A is correct."
    },
    {
      "id": "q2",
      "prompt": "Code analysis question 2 testing syntax or behavior?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1,
      "explanation": "Why Option B is correct."
    },
    {
      "id": "q3",
      "prompt": "Problem-solving question 3 checking common edge cases or operations?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 2,
      "explanation": "Why Option C is correct."
    }
  ]
}

CRITICAL RULES:
1. Output ONLY the JSON object. Do NOT include markdown code fences, greetings, or extra text.
2. Every string must be valid JSON with double quotes and properly escaped newlines and quotes.
3. Code examples must be clean, runnable ${subject.name} code.
4. Keep all explanations compact, clear, and focused (2-3 concise paragraphs maximum).`

    // 3. Call Ollama via Express backend with JSON format enforcement
    const rawResult = await ollamaService.generate({
      prompt,
      system: `You are an expert computer science tutor specializing in beginner-friendly, high-clarity curriculum design. You strictly respond in pure JSON.`,
      format: 'json',
      options: {
        temperature: 0.2,
        top_p: 0.9,
      },
      timeoutMs: 240000
    })

    // 4. Validate and parse the model response safely
    const parsedLesson = this._parseAndValidateLesson(rawResult.response, subject, topic)

    // 5. Save to local cache
    const finalLesson = {
      subjectId: subject.id,
      subjectName: subject.name,
      topicId: topic.id,
      generatedAt: new Date().toISOString(),
      ...parsedLesson
    }

    await saveToCache(cacheKey, finalLesson)

    return {
      ...finalLesson,
      fromCache: false
    }
  }

  /**
   * Cleans and validates model output against the expected lesson contract.
   * @private
   */
  _parseAndValidateLesson(responseText, subject, topic) {
    if (!responseText || typeof responseText !== 'string') {
      throw new Error('Ollama returned empty content.')
    }

    let cleaned = responseText.trim()

    // 1. Strip Qwen3 thinking tags (<think>...</think>)
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()

    // 2. Strip markdown code fences if present (```json ... ``` or ``` ...)
    cleaned = cleaned.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim()

    // 3. Extract JSON object if model included prefix or suffix commentary
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1)
    }

    let data
    try {
      data = JSON.parse(cleaned)
    } catch (parseErr) {
      console.error('[LessonGenerator] Failed to parse model output. Raw output:', responseText)
      throw new Error(`Failed to parse AI-generated lesson content as JSON: ${parseErr.message}`)
    }

    // Validate required fields and ensure clean structures
    if (!data.topicTitle) data.topicTitle = `${topic.title} in ${subject.name}`
    if (!data.shortIntroduction) data.shortIntroduction = `Learn about ${topic.title} in ${subject.name}.`
    if (!Array.isArray(data.learningObjectives) || data.learningObjectives.length === 0) {
      data.learningObjectives = [topic.objective]
    }
    if (!data.conceptExplanation) {
      data.conceptExplanation = `${topic.title} is an essential programming concept in ${subject.name}.`
    }
    if (!data.codeExamples) {
      data.codeExamples = subject.id === 'python'
        ? `# Example: ${topic.title}\nprint("Understanding ${topic.title}")`
        : `// Example: ${topic.title}\n#include <iostream>\n\nint main() {\n    std::cout << "Understanding ${topic.title}" << std::endl;\n    return 0;\n}`
    }
    if (!data.codeExplanation) {
      data.codeExplanation = 'The code demonstrates basic usage and syntax.'
    }
    if (!Array.isArray(data.commonMistakes)) {
      data.commonMistakes = ['Overlooking boundary conditions or edge cases.']
    }
    if (!data.shortRecap) {
      data.shortRecap = `Mastering ${topic.title} establishes a strong foundation in ${subject.name}.`
    }

    // Validate practice questions
    if (!Array.isArray(data.practiceQuestions) || data.practiceQuestions.length === 0) {
      data.practiceQuestions = [
        {
          id: 'q1',
          prompt: `What is the primary role of ${topic.title} in ${subject.name}?`,
          options: [
            `To organize logic and data safely`,
            `To slow down program execution`,
            `To replace operating system drivers`,
            `None of the above`
          ],
          correctIndex: 0,
          explanation: `${topic.title} provides structured logic and data control in ${subject.name}.`
        }
      ]
    } else {
      // Sanitize and ensure each question has required keys
      data.practiceQuestions = data.practiceQuestions.slice(0, 3).map((q, idx) => ({
        id: q.id || `q${idx + 1}`,
        prompt: q.prompt || `Question ${idx + 1}`,
        options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['True', 'False'],
        correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 ? q.correctIndex : 0,
        explanation: q.explanation || 'Review the lesson explanation for full context.'
      }))
    }

    return data
  }
}

export const lessonGeneratorService = new LessonGeneratorService()

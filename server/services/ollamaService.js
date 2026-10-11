/**
 * Ollama Service
 * Communicates with the local Ollama instance via HTTP API.
 * Keeps frontend fully isolated from the LLM host.
 */

export class OllamaService {
  constructor() {
    this.baseUrl = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '')
    this.model = process.env.OLLAMA_MODEL || 'qwen3:4b'
    this.defaultTimeoutMs = parseInt(process.env.OLLAMA_TIMEOUT_MS || '60000', 10)
  }

  /**
   * Health check: verifies Ollama connectivity, response latency, and model availability.
   * @param {number} timeoutMs
   * @returns {Promise<object>}
   */
  async checkHealth(timeoutMs = 5000) {
    const startTime = Date.now()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const latencyMs = Date.now() - startTime

      if (!response.ok) {
        return {
          status: 'degraded',
          baseUrl: this.baseUrl,
          configuredModel: this.model,
          modelAvailable: false,
          availableModels: [],
          latencyMs,
          error: `Ollama returned HTTP ${response.status} ${response.statusText}`,
        }
      }

      const data = await response.json()
      const availableModels = (data.models || []).map((m) => m.name || m.model)

      // Check if configured model exists (exact match or prefix without :latest/:4b tag)
      const modelAvailable = availableModels.some(
        (name) => name === this.model || name.startsWith(`${this.model}:`) || this.model.startsWith(`${name}:`)
      )

      return {
        status: 'connected',
        baseUrl: this.baseUrl,
        configuredModel: this.model,
        modelAvailable,
        availableModels,
        latencyMs,
        error: modelAvailable
          ? null
          : `Configured model "${this.model}" is not currently pulled in Ollama. Available: ${availableModels.join(', ') || 'none'}`,
      }
    } catch (err) {
      clearTimeout(timeoutId)
      const latencyMs = Date.now() - startTime

      const isTimeout = err.name === 'AbortError'
      const errorMsg = isTimeout
        ? `Connection to Ollama at ${this.baseUrl} timed out after ${timeoutMs}ms`
        : `Ollama is unavailable at ${this.baseUrl}: ${err.message}`

      return {
        status: 'unavailable',
        baseUrl: this.baseUrl,
        configuredModel: this.model,
        modelAvailable: false,
        availableModels: [],
        latencyMs,
        error: errorMsg,
      }
    }
  }

  /**
   * Generate text completion using Ollama /api/generate endpoint.
   * @param {object} params
   * @param {string} params.prompt
   * @param {string} [params.system]
   * @param {object} [params.options]
   * @param {number} [params.timeoutMs]
   * @returns {Promise<object>}
   */
  async generate({ prompt, system, options = {}, timeoutMs }) {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('A non-empty prompt string is required for Ollama generate.')
    }

    const timeout = timeoutMs || this.defaultTimeoutMs
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          system: system || undefined,
          stream: false,
          options,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            `Model "${this.model}" not found on Ollama (${this.baseUrl}). Please verify model name or run "ollama pull ${this.model}".`
          )
        }
        const errText = await response.text().catch(() => '')
        throw new Error(`Ollama API error (${response.status}): ${errText || response.statusText}`)
      }

      const data = await response.json()

      if (!data || typeof data.response !== 'string') {
        throw new Error('Invalid response structure received from Ollama API.')
      }

      return {
        response: data.response,
        model: data.model || this.model,
        done: data.done,
        totalDuration: data.total_duration,
        evalCount: data.eval_count,
        evalDuration: data.eval_duration,
      }
    } catch (err) {
      clearTimeout(timeoutId)

      if (err.name === 'AbortError') {
        throw new Error(`Ollama request for model "${this.model}" timed out after ${timeout}ms.`)
      }

      if (err.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
        throw new Error(`Could not connect to Ollama at ${this.baseUrl}. Ensure the Ollama service is running.`)
      }

      throw err
    }
  }
}

// Export singleton instance
export const ollamaService = new OllamaService()

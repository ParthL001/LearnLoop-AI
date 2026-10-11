// Gemini Service
// Server-side integration with Google Gemini via @google/generative-ai SDK.
// This service provides a generate method compatible with existing usage patterns.

import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[GeminiService] GEMINI_API_KEY not set. Gemini calls will fail.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Default model can be overridden via env if needed.
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
    this.defaultTimeoutMs = parseInt(process.env.GEMINI_TIMEOUT_MS || '240000', 10);
  }

  /**
   * Generate content using Gemini model.
   * @param {object} params
   * @param {string} params.prompt - User prompt.
   * @param {string} [params.system] - System instruction.
   * @param {object} [params.options] - Generation config overrides.
   * @param {number} [params.timeoutMs] - Timeout in ms.
   * @returns {Promise<object>} Generated response and metadata.
   */
  async generate({ prompt, system, options = {}, timeoutMs }) {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('A non-empty prompt string is required for Gemini generate.');
    }
    const timeout = timeoutMs || this.defaultTimeoutMs;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          temperature: 0.2,
          ...options,
        },
      });

      const messages = [];
      if (system) messages.push({ role: 'system', parts: system });
      messages.push({ role: 'user', parts: prompt });

      const result = await model.generateContent(messages, { signal: controller.signal });
      clearTimeout(timeoutId);
      const response = await result.response;
      const text = response.text();
      return {
        response: text,
        model: this.modelName,
        done: true,
        totalDuration: null,
        evalCount: null,
        evalDuration: null,
      };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`Gemini request timed out after ${timeout}ms.`);
      }
      throw err;
    }
  }
}

export const geminiService = new GeminiService();

// Simple health check for Gemini configuration
GeminiService.prototype.checkHealth = async function () {
  const apiKeyPresent = !!process.env.GEMINI_API_KEY;
  return {
    status: apiKeyPresent ? 'connected' : 'unavailable',
    baseUrl: 'gemini',
    configuredModel: this.modelName,
    modelAvailable: apiKeyPresent,
    availableModels: [this.modelName],
    latencyMs: 0,
    error: apiKeyPresent ? null : 'GEMINI_API_KEY not set',
  };
};

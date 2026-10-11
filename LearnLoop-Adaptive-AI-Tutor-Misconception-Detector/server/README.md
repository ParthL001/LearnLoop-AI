# LearnLoop AI Backend

Express.js server with local Ollama (`qwen3:4b`) integration, deterministic mathematical misconception evaluation, atomic JSON persistence, and standardized pre/post assessments.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Ensure Ollama is running
ollama serve
ollama pull qwen3:4b

# 4. Start development server
npm run dev
```

## Running Tests

```bash
# Run Phase 2 verification
node verify_phase2.js

# Run Phase 3 verification
node verify_phase3.js

# Run Full application integration and security suite
node verify_full_integration.js
```

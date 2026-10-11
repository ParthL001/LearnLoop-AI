# LearnLoop AI — Adaptive AI Tutor & Misconception Detector

LearnLoop AI is an educational platform designed to diagnose and remediate foundational mathematics misconceptions (specifically fractional reasoning) through deterministic evaluation, grounded Socratic tutoring via local Ollama (`qwen3:4b`), and isomorphic pre/post assessments.

---

## 1. System Architecture

- **Frontend**: React + Vite, Tailwind CSS v4, Lucide React, Recharts.
- **Backend**: Node.js, Express.js (ES Modules).
- **Inference Engine**: Local Ollama running `qwen3:4b` (no external paid cloud APIs required).
- **Persistence**: Safe, atomic, file-locked JSON storage in `server/data/storage/` (zero external database dependencies).

---

## 2. Prerequisites

1. **Node.js**: v18.0.0 or higher
2. **Ollama**: Installed locally from [https://ollama.ai/](https://ollama.ai/)
3. **Model**: `qwen3:4b` downloaded into Ollama

---

## 3. Ollama Setup

Ensure Ollama is running and the model is downloaded:

```bash
# Start Ollama service (if not already running as a daemon)
ollama serve

# Pull the configured model
ollama pull qwen3:4b

# Verify the model is available
ollama list
```

---

## 4. Environment Configuration

### Server (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:4b
OLLAMA_TIMEOUT_MS=60000
NODE_ENV=development
```

### Client (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_URL=http://localhost:5000/api
```

---

## 5. Installation & Run Commands

From the root directory:

```bash
# Install dependencies
npm install
npm --prefix server install
npm --prefix client install

# Start both servers concurrently or in separate terminals:
# Terminal 1 - Backend Server (Port 5000)
npm run server:dev

# Terminal 2 - Frontend Client (Port 5173)
npm run client
```

Or run directly from subdirectories:
- `cd server && npm run dev`
- `cd client && npm run dev`

---

## 6. Implemented API Endpoints

### System & Health
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | General server uptime and health |
| `GET` | `/api/ai/health` | Ollama connectivity & `qwen3:4b` availability |

### Learning Curriculum & Practice Probes
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/concepts` | Lists all 5 verified fraction concepts |
| `GET` | `/api/lessons` | Retrieves visual partition lessons |
| `GET` | `/api/lessons/:id` | Retrieves structured lesson by concept ID |
| `GET` | `/api/practice/questions` | Sanitized diagnostic practice items (secret answer keys stripped) |
| `POST` | `/api/practice/next` | Adaptively selects the next unattempted or targeted remediation probe |

### AI Tutor & Misconception Evaluation
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/tutor/chat` | Interactive Socratic chat grounded in verified curriculum |
| `POST` | `/api/analyze/misconception` | Deterministically grades answer; diagnoses slips vs. conceptual biases |
| `POST` | `/api/tutor/submit` | Submission evaluation alias with optional auto-persistence |

### Learner Attempts & Progress Mastery
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/attempts` | Explicitly records a practice attempt with backend validation |
| `GET` | `/api/attempts` | Retrieves attempt history (`?learnerId=...`) |
| `GET` | `/api/progress/:learnerId` | Deterministic concept mastery calibration and telemetry |

### Pre & Post Assessments
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/assessment` | Retrieves sanitized 6-item assessment battery (`type=pre\|post`) |
| `POST` | `/api/assessment/submit` | Deterministically grades assessment; prevents duplicate submissions (`409`) |
| `GET` | `/api/assessment/results/:learnerId` | Paired pre/post results & percentage-point change calculation |
| `GET` | `/api/assessment/report` | Cohort assessment summary with paired sample counts and attrition |

---

## 7. Storage & Concurrency Architecture

- **Safe Atomic Writes**: All writes serialize to temporary staging files (`.tmp.<timestamp>.<rand>`) before being committed via atomic rename with transient backoff for Windows compatibility.
- **Sequential Write Locks**: Mutex queues in `storageService.js` guarantee write serialization to prevent race conditions and concurrent corruption.
- **Privacy & Security**: Only anonymous/session identifiers (`learnerId`) and mathematical diagnostic traces are stored. No PII is collected.
- **Fail-Safe Persistence**: Errors during file writing immediately propagate as HTTP 500 errors; the backend never returns a false success confirmation for failed saves.

---

## 8. Verification & Test Suites

Three automated test suites are provided in `server/`:

```bash
cd server

# 1. Phase 2 Verification (15 tests: Content, Evaluator, Socratic Chat, Adaptive Probes)
node verify_phase2.js

# 2. Phase 3 Verification (13 tests: Persistence, Mastery Calibration, Pre/Post Assessments)
node verify_phase3.js

# 3. Full Integration & Security Suite (13 tests: Health, Rate Limits, Security, Error Sanitization)
node verify_full_integration.js
```

All 41 tests pass consistently with 0 failures.

---

## 9. Known Limitations & Educational Disclaimers

1. **Local Single-Node Persistence**: The file-based JSON storage store is designed for hackathon prototyping and local demonstrations. For multi-instance clustered deployments, migrate to PostgreSQL or Redis.
2. **Local LLM Performance**: Ollama `qwen3:4b` inference speed depends on host hardware (GPU VRAM vs CPU). The service includes an in-memory sliding window rate limiter (60 req/min) and deterministic rule-based fallbacks if Ollama is unreachable or times out.
3. **Assessment Causality Caveat**: In accordance with educational evaluation guidelines, score differences between pre- and post-tests measure observed diagnostic changes on identical items. Score increases cannot be claimed as sole proof of product causation due to test-retest practice effects, testing familiarity, and non-controlled external learning.
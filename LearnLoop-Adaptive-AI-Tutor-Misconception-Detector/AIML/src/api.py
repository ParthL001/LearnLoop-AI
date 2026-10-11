
from typing import Optional

from fastapi import FastAPI
from pydantic import BaseModel
from predict import predict

import json
from pathlib import Path
from fastapi import HTTPException

app = FastAPI(
    title="LearnLoop AI - AIML API",
    version="1.0.0",
)


class DiagnosisRequest(BaseModel):
    example_id: Optional[str] = None
    question: str
    correct_answer: str
    student_answer: str
    student_reasoning: str = ""
    expected_feedback: str = ""
    recommended_followup: str = ""

EXERCISES_FILE = (
    Path(__file__).resolve().parents[1]
    / "dataset"
    / "python_exercises.jsonl"
)


@app.get("/internal/v1/exercises")
def get_python_exercises():
    if not EXERCISES_FILE.exists():
        raise HTTPException(
            status_code=500,
            detail="Python exercise dataset not found",
        )

    exercises = []

    with EXERCISES_FILE.open(encoding="utf-8") as file:
        for line in file:
            if not line.strip():
                continue

            row = json.loads(line)
            exercises.append({
                "example_id": row["example_id"],
                "topic": row["topic"],
                "question": row["question"],
            })

    return {"exercises": exercises}


@app.get("/internal/v1/health")
def health():
    return {
        "status": "ok",
        "service": "learnloop-aiml",
        "version": "1.0.0",
    }


@app.post("/internal/v1/diagnose")
def diagnose(request: DiagnosisRequest):
    return predict(request.model_dump())

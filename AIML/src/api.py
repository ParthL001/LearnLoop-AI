
from typing import Optional
import json
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .predict import predict


app = FastAPI(
    title="LearnLoop AI - AIML API",
    version="1.0.0",
)

DATASET_PATH = (
    Path(__file__).resolve().parents[1]
    / "dataset"
    / "python_exercises.jsonl"
)


class DiagnosisRequest(BaseModel):
    example_id: Optional[str] = None
    question: str
    correct_answer: str = ""
    student_answer: str
    student_reasoning: str = ""
    expected_feedback: str = ""
    recommended_followup: str = ""


class FollowupAnswerRequest(BaseModel):
    example_id: str
    student_answer: str


def load_exercises():
    if not DATASET_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail="Exercise dataset not found.",
        )

    exercises = []

    with DATASET_PATH.open(encoding="utf-8-sig") as file:
        for line in file:
            if line.strip():
                exercises.append(json.loads(line))

    return exercises


@app.get("/internal/v1/health")
def health():
    return {
        "status": "ok",
        "service": "learnloop-aiml",
        "version": "1.0.0",
    }


@app.get("/internal/v1/exercises")
def get_exercises():
    # Never expose expected answers to the frontend.
    return [
        {
            "example_id": exercise["example_id"],
            "topic": exercise["topic"],
            "question": exercise["question"],
            "followup_question": exercise.get(
                "followup_question", ""
            ),
        }
        for exercise in load_exercises()
    ]


@app.post("/internal/v1/diagnose")
def diagnose(request: DiagnosisRequest):
    return predict(request.model_dump())


@app.post("/internal/v1/followup/check")
def check_followup_answer(payload: FollowupAnswerRequest):
    exercises = load_exercises()

    exercise = next(
        (
            item for item in exercises
            if item.get("example_id") == payload.example_id
        ),
        None,
    )

    if exercise is None:
        raise HTTPException(
            status_code=404,
            detail="Exercise not found.",
        )

    expected = exercise.get("followup_answer", "").strip()

    if not expected:
        raise HTTPException(
            status_code=500,
            detail="Follow-up answer is not configured.",
        )

    # Allow common equivalent formats for selected exercises.
    accepted_answers = {
        "PY001": ["'c'", '"c"', "c"],
        "PY002": ["10, 30", "10 and 30", "10 30"],
        "PY003": ["2", "index 2"],
        "PY004": ["10"],
        "PY005": ["7"],
        "PY006": ["A"],
        "PY007": ["True"],
        "PY008": ["[2, 3, 4]", "[2,3,4]"],
        "PY009": ["3", "three"],
        "PY010": ["10"],
        "PY011": ["TypeError", "type error"],
        "PY012": [
            "return gives back a value; print displays it",
            "return gives back a value and print displays it",
            "return returns a value; print displays it",
        ],
    }

    def normalize(value):
        return " ".join(value.strip().lower().split())

    candidates = accepted_answers.get(
        payload.example_id,
        [expected],
    )

    is_correct = any(
        normalize(payload.student_answer) == normalize(candidate)
        for candidate in candidates
    )

    return {
        "example_id": payload.example_id,
        "is_correct": is_correct,
        "feedback": (
            "Correct! You have understood this concept."
            if is_correct
            else "Not quite. Review the concept and try again."
        ),
    }

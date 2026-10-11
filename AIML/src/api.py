
from typing import Optional

from fastapi import FastAPI
from pydantic import BaseModel
from .predict import predict

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

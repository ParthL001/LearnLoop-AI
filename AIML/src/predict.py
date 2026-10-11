
import json
from pathlib import Path

from rule_detector import detect_misconception

DATA_DIR = Path(__file__).resolve().parents[1] / "dataset"


def predict(row: dict) -> dict:
    """Return a consistent, integration-ready diagnosis."""
    question = row.get("question", "")
    correct_answer = row.get("correct_answer", "")
    student_answer = row.get("student_answer", "")
    reasoning = row.get("student_reasoning", "")

    is_correct = (
        str(student_answer).strip()
        == str(correct_answer).strip()
    )

    if is_correct:
        label = "none"
    else:
        label = detect_misconception(
            question,
            student_answer,
            reasoning,
            correct_answer,
        )

    needs_clarification = (
        label == "uncertain_needs_clarification"
    )

    return {
        "example_id": row.get("example_id"),
        "is_correct": is_correct,
        "misconception_label": label,
        "confidence": None,
        "evidence": (
            reasoning if reasoning.strip()
            else "Student reasoning was not provided."
        ),
        "needs_clarification": needs_clarification,
        "clarifying_question": (
            "Can you explain how you arrived at your answer?"
            if needs_clarification else None
        ),
        "feedback": row.get("expected_feedback", ""),
        "followup_goal": row.get("recommended_followup", ""),
    }


if __name__ == "__main__":
    sample = {
        "example_id": "DEMO01",
        "question": "What does list(range(1, 4)) output?",
        "correct_answer": "[1, 2, 3]",
        "student_answer": "[1, 2, 3, 4]",
        "student_reasoning": "The stop value is included.",
        "expected_feedback": (
            "range() stops before its stop value."
        ),
        "recommended_followup": (
            "Try another range() example."
        ),
    }

    print(json.dumps(predict(sample), indent=2))

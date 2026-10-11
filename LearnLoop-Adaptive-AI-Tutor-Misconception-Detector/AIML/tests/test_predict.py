
import sys
from pathlib import Path

sys.path.insert(
    0, str(Path(__file__).resolve().parents[1] / "src")
)

from predict import predict


def test_range_misconception():
    row = {
        "example_id": "TEST01",
        "question": "What does list(range(1, 4)) output?",
        "correct_answer": "[1, 2, 3]",
        "student_answer": "[1, 2, 3, 4]",
        "student_reasoning": "The stop value is included.",
        "expected_feedback": "range() excludes the stop value.",
        "recommended_followup": "Try another range example.",
    }

    result = predict(row)

    assert result["misconception_label"] == (
        "exclusive_bound_misunderstanding"
    )
    assert result["is_correct"] is False
    assert result["needs_clarification"] is False


def test_prediction_schema():
    row = {
        "example_id": "TEST02",
        "question": "Explain your answer.",
        "correct_answer": "42",
        "student_answer": "unknown",
        "student_reasoning": "",
    }

    result = predict(row)

    required_keys = {
        "example_id",
        "is_correct",
        "misconception_label",
        "confidence",
        "evidence",
        "needs_clarification",
        "clarifying_question",
        "feedback",
        "followup_goal",
    }

    assert set(result.keys()) == required_keys

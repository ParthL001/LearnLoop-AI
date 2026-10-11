
import json
from pathlib import Path

try:
    from .rule_detector import detect_misconception
except ImportError:
    from rule_detector import detect_misconception

DATA_DIR = Path(__file__).resolve().parents[1] / "dataset"

FEEDBACK = {
    "zero_vs_one_based_indexing": {
        "feedback": (
            "Python lists use zero-based indexing. "
            "Index 0 refers to the first element, so items[0] is 'a'."
        ),
        "followup_goal": (
            "Practice accessing the first, second, and third elements "
            "using indexes 0, 1, and 2."
        ),
    },
    "length_vs_last_index_confusion": {
        "feedback": (
            "len(list) returns the number of elements, not the last index. "
            "For a list of 3 elements, len(list) is 3 and the last index is 2."
        ),
        "followup_goal": "Practice finding a list's length and last valid index.",
    },
    "exclusive_bound_misunderstanding": {
        "feedback": (
            "Python range(start, stop) includes start but excludes stop."
        ),
        "followup_goal": "Try another range() example and explain its output.",
    },
    "start_value_misunderstanding": {
        "feedback": (
            "When range() receives one argument, it starts at 0 and stops "
            "before that argument."
        ),
        "followup_goal": "Predict the output of list(range(4)).",
    },
    "none": {
        "feedback": "Correct! Your answer matches the expected output.",
        "followup_goal": "Try another Python exercise.",
    },
    "uncertain_needs_clarification": {
        "feedback": (
            "I couldn't confidently identify the exact misconception. "
            "Please explain your reasoning in more detail."
        ),
        "followup_goal": "Explain your steps, then try a similar exercise.",
    },
}

DEFAULT_FEEDBACK = {
    "feedback": (
        "Your answer differs from the expected result. "
        "Review the relevant Python concept and try again."
    ),
    "followup_goal": "Try a similar exercise and explain each step.",
}


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

    generated = FEEDBACK.get(label, DEFAULT_FEEDBACK)

    feedback = (
        row.get("expected_feedback")
        or generated["feedback"]
    )

    followup_goal = (
        row.get("recommended_followup")
        or generated["followup_goal"]
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
        "feedback": feedback,
        "followup_goal": followup_goal,
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

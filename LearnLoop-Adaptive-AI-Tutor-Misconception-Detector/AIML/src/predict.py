
import json
from pathlib import Path

from rule_detector import detect_misconception

DATA_DIR = Path(__file__).resolve().parents[1] / "dataset"
EXERCISES_FILE = DATA_DIR / "python_exercises.jsonl"

FEEDBACK = {
    "exclusive_bound_misunderstanding": {
        "feedback": (
            "In Python, range(start, stop) includes start "
            "but excludes stop. Therefore, range(1, 4) "
            "produces 1, 2, and 3—not 4."
        ),
        "followup_goal": (
            "Practice predicting the output of range(2, 6) "
            "and explain why 6 is excluded."
        ),
    },
    "none": {
        "feedback": "Correct! Your answer matches the expected output.",
        "followup_goal": "Try another Python exercise.",
    },
    "uncertain_needs_clarification": {
        "feedback": (
            "I need more information to identify the exact "
            "misconception. Please explain your reasoning."
        ),
        "followup_goal": (
            "Explain your steps, then try a similar exercise."
        ),
    },
}

DEFAULT_FEEDBACK = {
    "feedback": (
        "Your answer differs from the expected result. "
        "Review the relevant Python rule and explain your reasoning."
    ),
    "followup_goal": (
        "Try a similar exercise and explain each step."
    ),
}


def get_exercise(example_id: str) -> dict | None:
    """Retrieve an exercise and its answer key from the server dataset."""
    if not example_id or not EXERCISES_FILE.exists():
        return None

    with EXERCISES_FILE.open(encoding="utf-8") as file:
        for line in file:
            if not line.strip():
                continue

            exercise = json.loads(line)
            if exercise.get("example_id") == example_id:
                return exercise

    return None


def predict(row: dict) -> dict:
    """Return a consistent, integration-ready diagnosis."""
    example_id = row.get("example_id")
    exercise = get_exercise(example_id)

    # Prefer the trusted server-side answer key for known exercises.
    if exercise:
        question = exercise["question"]
        correct_answer = str(exercise["correct_answer"])
    else:
        question = row.get("question", "")
        correct_answer = row.get("correct_answer", "")

    student_answer = row.get("student_answer", "")
    reasoning = row.get("student_reasoning", "")

    # Do not silently evaluate a known exercise without its answer key.
    if exercise is None and not str(correct_answer).strip():
        return {
            "example_id": example_id,
            "is_correct": False,
            "misconception_label": "uncertain_needs_clarification",
            "confidence": None,
            "evidence": "The expected answer was not available for evaluation.",
            "needs_clarification": True,
            "clarifying_question": (
                "Can you explain how you arrived at your answer?"
            ),
            "feedback": (
                "This exercise could not be evaluated because its answer "
                "key was unavailable."
            ),
            "followup_goal": "Please retry the exercise.",
        }

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

    # Use exercise-specific feedback only when the answer is incorrect.
    feedback = (
        exercise.get("expected_feedback")
        if exercise and not is_correct
        else None
    )
    followup_goal = (
        exercise.get("recommended_followup")
        if exercise
        else None
    )

    return {
        "example_id": example_id,
        "is_correct": is_correct,
        "misconception_label": label,
        "confidence": None,
        "evidence": (
            reasoning.strip()
            if reasoning.strip()
            else "Student reasoning was not provided."
        ),
        "needs_clarification": needs_clarification,
        "clarifying_question": (
            "Can you explain how you arrived at your answer?"
            if needs_clarification else None
        ),
        "feedback": feedback or generated["feedback"],
        "followup_goal": (
            followup_goal or generated["followup_goal"]
        ),
    }


if __name__ == "__main__":
    sample = {
        "example_id": "PY008",
        "question": "What does list(range(3)) produce?",
        "correct_answer": "",
        "student_answer": "[0, 1, 2]",
        "student_reasoning": "It starts at zero and stops before three.",
    }

    print(json.dumps(predict(sample), indent=2))

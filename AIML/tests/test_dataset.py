import json
from pathlib import Path

def test_jsonl_examples_have_required_fields():
    path = Path(__file__).resolve().parents[1] / "dataset" / "examples.jsonl"
    required = {
        "example_id", "question", "correct_answer", "student_answer",
        "is_correct", "misconception_label", "student_reasoning"
    }
    rows = [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    assert rows
    assert all(required.issubset(row) for row in rows)
    assert len({row["example_id"] for row in rows}) == len(rows)

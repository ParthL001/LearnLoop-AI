
"""Validate LearnLoop train, validation, and test JSONL splits."""
import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[1] / "dataset"

REQUIRED = {
    "example_id", "topic", "question", "correct_answer", "student_answer",
    "student_reasoning", "is_correct", "misconception_label",
    "label_confidence", "diagnosis_evidence", "expected_feedback",
    "recommended_followup",
}
SPLITS = ["train", "validation", "test"]


def load_split(name):
    path = DATA_DIR / f"{name}.jsonl"

    if not path.exists():
        raise FileNotFoundError(f"Missing dataset file: {path}")

    rows = []
    errors = []

    for line_no, line in enumerate(
        path.read_text(encoding="utf-8").splitlines(), start=1
    ):
        if not line.strip():
            continue

        try:
            row = json.loads(line)
        except json.JSONDecodeError as exc:
            errors.append(f"{name}, line {line_no}: invalid JSON: {exc}")
            continue

        missing = REQUIRED - row.keys()
        if missing:
            errors.append(
                f"{name}, line {line_no}: missing fields {sorted(missing)}"
            )

        confidence = row.get("label_confidence")
        if (
            not isinstance(confidence, (int, float))
            or isinstance(confidence, bool)
            or not 0 <= confidence <= 1
        ):
            errors.append(
                f"{name}, line {line_no}: "
                "label_confidence must be a number from 0 to 1"
            )

        if not isinstance(row.get("is_correct"), bool):
            errors.append(
                f"{name}, line {line_no}: is_correct must be boolean"
            )

        if (
            row.get("is_correct") is True
            and row.get("misconception_label") != "none"
        ):
            errors.append(
                f"{name}, line {line_no}: "
                "correct example should use label 'none'"
            )

        if not row.get("question") or not row.get("student_answer"):
            errors.append(
                f"{name}, line {line_no}: question/student_answer is empty"
            )

        rows.append(row)

    ids = [r.get("example_id") for r in rows]
    if len(ids) != len(set(ids)):
        errors.append(f"{name}: duplicate example_id values")

    print(f"\n{name}: {len(rows)} records")
    counts = {}
    for record in rows:
        label = record.get("misconception_label", "MISSING")
        counts[label] = counts.get(label, 0) + 1

    for label, count in sorted(counts.items()):
        print(f"  {label}: {count}")

    return rows, errors


all_rows = {}
all_errors = []

for split in SPLITS:
    rows, errors = load_split(split)
    all_rows[split] = rows
    all_errors.extend(errors)

for a, b in [
    ("train", "validation"),
    ("train", "test"),
    ("validation", "test"),
]:
    ids_a = {r.get("example_id") for r in all_rows[a]}
    ids_b = {r.get("example_id") for r in all_rows[b]}
    overlap = ids_a & ids_b

    if overlap:
        all_errors.append(
            f"{a}/{b}: overlapping IDs: {sorted(overlap)}"
        )

if all_errors:
    print("\nValidation issues:")
    for error in all_errors:
        print("-", error)
    raise SystemExit(1)

print("\nStructural validation passed for all three splits.")
print("Note: answer correctness, label accuracy, and template leakage")
print("still require separate review.")

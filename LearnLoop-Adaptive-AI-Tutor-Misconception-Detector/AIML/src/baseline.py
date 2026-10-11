
"""Exploratory TF-IDF baseline for misconception classification."""
import json
from pathlib import Path
from collections import Counter
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use("Agg")

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score

DATA_DIR = Path(__file__).resolve().parents[1] / "dataset"


def load_rows(filename):
    path = DATA_DIR / filename
    return [
        json.loads(line)
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


train_rows = load_rows("train.jsonl")
test_rows = load_rows("test.jsonl")

# Train only on incorrect responses with a misconception label.
train_rows = [
    r for r in train_rows
    if not r["is_correct"] and r["misconception_label"] != "none"
]
test_rows = [
    r for r in test_rows
    if not r["is_correct"] and r["misconception_label"] != "none"
]

def make_text(row):
    return (
        f"Question: {row['question']}\n"
        f"Student answer: {row['student_answer']}\n"
        f"Student reasoning: {row.get('student_reasoning') or ''}"
    )


if not train_rows or not test_rows:
    raise SystemExit("Not enough labelled incorrect examples in train/test.")

X_train = [make_text(r) for r in train_rows]
y_train = [r["misconception_label"] for r in train_rows]
X_test = [make_text(r) for r in test_rows]
y_test = [r["misconception_label"] for r in test_rows]

print("Training examples:", len(train_rows))
print("Test examples:", len(test_rows))
print("Train label counts:", dict(Counter(y_train)))
print("Test label counts:", dict(Counter(y_test)))

pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1)),
    ("clf", LogisticRegression(max_iter=2000, class_weight="balanced"))
])

pipeline.fit(X_train, y_train)
predictions = pipeline.predict(X_test)

print("\nExploratory test results — tiny synthetic dataset:")
print("Accuracy:", round(accuracy_score(y_test, predictions), 3))
print(classification_report(y_test, predictions, zero_division=0))
print("\nPer-example predictions:")

for row, actual, predicted in zip(test_rows, y_test, predictions):
    status = "CORRECT" if actual == predicted else "WRONG"
    print(f"{status} | ID: {row.get('example_id', 'N/A')}")
    print(f"  Actual:    {actual}")
    print(f"  Predicted: {predicted}")

labels = sorted(set(y_test) | set(predictions))
cm = confusion_matrix(y_test, predictions, labels=labels)

disp = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=labels
)
disp.plot(xticks_rotation=90)
plt.tight_layout()
plt.savefig("confusion_matrix.png", dpi=150)
print("\nSaved confusion matrix to confusion_matrix.png")
print("Do not interpret these results as reliable generalization performance.")

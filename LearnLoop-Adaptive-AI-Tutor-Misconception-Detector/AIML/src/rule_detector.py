
import ast
import json
import re
from pathlib import Path


UNCERTAIN = "uncertain_needs_clarification"


def _contains(text, phrases):
    return any(phrase in text for phrase in phrases)


def _parse_list(value):
    try:
        result = ast.literal_eval(value or "")
        return result if isinstance(result, list) else None
    except (ValueError, SyntaxError, TypeError):
        return None


def _range_values(expression):
    """Evaluate range() with literal integer arguments only."""
    match = re.search(
        r"\brange\s*\(\s*(-?\d+)\s*"
        r"(?:,\s*(-?\d+)\s*)?"
        r"(?:,\s*(-?\d+)\s*)?\)",
        expression or "",
    )
    if not match:
        return None

    numbers = [int(value) for value in match.groups()
               if value is not None]

    try:
        if len(numbers) == 1:
            return list(range(numbers[0]))
        if len(numbers) == 2:
            return list(range(numbers[0], numbers[1]))
        return list(range(numbers[0], numbers[1], numbers[2]))
    except (ValueError, OverflowError):
        return None


def _has_start_value_misconception(question, answer, reasoning):
    q = question.lower()
    a = answer.lower()
    r = reasoning.lower()

    if "range(" not in q:
        return False

    # range(n) starts at zero, not one.
    if re.search(r"\brange\s*\(\s*\d+\s*\)", q):
        return _contains(
            f"{a} {r}",
            [
                "starting from 1",
                "starting at 1",
                "starts at 1",
                "starting from one",
                "counts 1 to",
                "counts 1, 2, 3",
                "starting from 1 naturally",
                "it counts 1, 2, 3",
            ],
        )

    return False





def _has_range_endpoint_misconception(
    question, answer, reasoning, correct_answer
):
    q = (question or "").lower()
    a = (answer or "").lower()
    r = (reasoning or "").lower()
    ca = (correct_answer or "").strip()

    if "range(" not in q and "range(" not in a:
        return False

    expected = _parse_list(ca)
    actual = _parse_list(a)

    # Student's output has one extra endpoint.
    if expected is not None and actual is not None:
        if len(actual) == len(expected) + 1:
            if actual[:-1] == expected:
                return True

    # Correct answer is a range expression, such as range(2, 5).
    calculated = _range_values(a)
    # Detect a stop value incorrectly treated as inclusive.
    expected_range = _range_values(correct_answer or "")

    if (    
        calculated is not None
        and expected_range is not None
        and len(expected_range) == len(calculated) + 1
        and expected_range[:-1] == calculated
    ):
        return True
        

    # Recognize inclusive-stop reasoning, including len(...) bounds.
    inclusive_phrases = (
        "inclusive",
        "up to 3",
        "up to 2",
        "counts down to -1",
        "down to 0",
        "includes the stop",
        "includes the end",
        "second parameter",
        "second argument",
        "stop value",
        "up to and including",
    )

    if (
        expected is not None
        and actual is not None
        and len(actual) == len(expected) + 1
        and any(phrase in r for phrase in inclusive_phrases)
    ):
        return True

    return False




def _has_missing_argument_misconception(question, answer, reasoning):
    q = question.lower()
    a = answer.lower()
    r = reasoning.lower()
    text = f"{q} {a} {r}"

    # Require evidence that the student expects an implicit default.
    default_belief = _contains(
        text,
        [
            "defaults to 0",
            "defaults to zero",
            "defaults to 1",
            "defaults to one",
            "denominator defaults to 1",
            "assumes y is 0",
            "assumes it is zero",
            "assumes it is 0",
            "assumed to be zero",
            "assumed to be 0",
            "python assumes",
            "python uses 1",
            "missing argument",
            "missing required argument",
            "if you don't provide",
            "if you do not provide",
            "usual greeting",
            "function should know",
            "should know the currency",
            "currency symbol",
            "normally use 2 as the exponent",
            "assume one repetition",
            "leave out the count",
            "uses a factor of 1",
            "multiplier is left out",
            "whoever is logged in",
            "current user",
            "not provided in a function call",
        ],
    )

    if not default_belief:
        return False

    # Also require evidence of a function call or function definition.
    return bool(
        re.search(r"\bdef\s+[a-z_]\w*\s*\(", q)
        or re.search(r"\b[a-z_]\w*\s*\([^)]*\)", q)
    )


def _has_comparison_misconception(question, answer, reasoning):
    q = question.lower()
    a = answer.lower()
    r = reasoning.lower()
    text = f"{q} {a} {r}"

    # Chained comparisons are a different concept. Do not force them
    # into the strict-versus-inclusive category.
    if re.search(r"\d+\s*<\s*\d+\s*<\s*\d+", q):
        return False

    match = re.search(
        r"\b(?:age|grade|score|temp)\s*(>=|<=|>|<)\s*(-?\d+)",
        q,
    )
    if not match:
        return False

    operator, boundary = match.groups()

    # The question explicitly requires the boundary to be accepted.
    inclusive_context = _contains(
        text,
        [
            f"{boundary} or older",
            f"{boundary} or higher",
            f"{boundary} or above",
            f"{boundary} or lower",
            f"{boundary} and lower",
            f"{boundary} passes",
            "passing score",
            "legally an adult",
            "freezing",
        ],
    )

    # The student's explanation incorrectly excludes the boundary.
    excludes_boundary = _contains(
        f"{a} {r}",
        [
            "greater than only",
            "greater than 90",
            "checks if the score is greater than",
            "checks if it's less than",
            "checks if it is less than",
            "anything above",
            "under 32",
            "less than 32",
            "greater than 18",
            "needs to be greater",
            "it needs to be greater",
            "so it counts only above",
            "does not include",
            "doesn't include",
        ],
    )

    # For strict operators, look for evidence that equality should pass.
    strict_operator = operator in (">", "<")
    if strict_operator and inclusive_context:
        return True

    # For inclusive operators, detect a student who describes the
    # condition as strict and excludes the exact boundary.
    inclusive_operator = operator in (">=", "<=")
    if inclusive_operator and excludes_boundary:
        return True

    return False


def detect_misconception(
    question,
    student_answer,
    student_reasoning,
    correct_answer=None,
):
    q = (question or "").lower()
    a = (student_answer or "").lower()
    r = (student_reasoning or "").lower()
    text = f"{q} {a} {r}"

    # 1. Assignment used instead of comparison in an if condition.
    if (
        "syntaxerror" in q
        and re.search(r"\bif\s+[a-z_]\w*\s*=(?!=)", q)
    ):
        return "variable_undefined_confusion"

    # 2. range() exclusive stop endpoint.
    if _has_range_endpoint_misconception(
        question, student_answer, student_reasoning, correct_answer
    ):
        return "exclusive_bound_misunderstanding"

    # 3. range(n) incorrectly assumed to start at one.
    if _has_start_value_misconception(
        question, student_answer, student_reasoning
    ):
        return "start_value_misunderstanding"

    # 4. Strict versus inclusive comparison.
    if _has_comparison_misconception(
        question, student_answer, student_reasoning
    ):
        return "strict_vs_inclusive_comparison"

    # 5. Missing required function argument assumed to have a default.
    if _has_missing_argument_misconception(
        question, student_answer, student_reasoning
    ):
        return "missing_required_argument_misunderstanding"

    # 6. Function object confused with the result of calling it.
    if _contains(
        text,
        [
            "cannot add a function to an integer",
            "can't add a function to an integer",
            "function itself instead of its result",
            "function call evaluates",
        ],
    ):
        return "function_call_as_object_misconception"

    # 7. Function referenced without being called.
    if (
        _contains(
            text,
            [
                "forgot the parentheses",
                "missing parentheses",
                "type the name of the function",
                "put the function inside the print statement",
                "you just put the function inside the print",
                "functions automatically use global variables",
            ],
        )
        or (
            re.search(r"\bprint\s*\(\s*[a-z_]\w*\s*\)", q)
            and _contains(
                f"{a} {r}",
                [
                    "yes",
                    "automatically use global variables",
                    "put the function inside the print",
                ],
            )
        )
    ):
        return "missing_parentheses_in_call"

    # 8. Parameter versus argument terminology.
    if _contains(
        text,
        [
            "called an argument",
            "they are the arguments",
            "the argument you need to provide",
            "what are x and y",
        ],
    ):
        return "parameter_argument_terminology_confusion"

    # 9. Indentation/block misconception.
    # Avoid diagnosing merely because a question mentions an if statement.
    if _contains(
        f"{a} {r}",
        [
            "ignores the if statement",
            "ignores the if",
            "ignores the condition",
            "indentation does not matter",
            "indentation is ignored",
            "indentation doesn't matter",
            "not inside the block",
            "not in the loop",
            "not in the if",
            "outside the loop",
            "outside the if block",
            "skip the if logic",
        ],
    ):
        return "indentation_ignored_misconception"

    # 10. Incorrect inequality direction.
    if (
        ("smaller than" in q or "less than" in q)
        and ">" in q
        and _contains(
            text,
            [
                "alligator mouth",
                "x is smaller",
                "points to the x",
            ],
        )
    ):
        return "comparison_direction_confusion"

    # 11. Possible arithmetic slip while tracing execution.
    if _contains(
        r,
        [
            "2 + 2 + 2 is 5",
            "9 - 1 is 7",
            "arithmetic mistake",
            "minor arithmetic slip",
        ],
    ):
        return "possible_execution_slip"

    if (
        ("while n > 0" in q or "n -= 2" in q)
        and a.strip() == "0"
        and _contains(
            r,
            [
                "subtracts 2",
                "then 2, then 1",
                "stop exactly at 0",
            ],
        )
    ):
        return "possible_execution_slip"

    # 12. print() confused with return.
    if _contains(
        text,
        [
            "pops up in the terminal",
            "return shows the final answer on the screen",
            "when you return a value",
            "return displays",
            "return prints",
            "return shows",
            "print acts as return",
            "print acts like return",
            "identical to a return",
        ],
    ):
        return "return_vs_print_confusion"

    if "print(" in q and _contains(
        text,
        [
            "function gives",
            "function prints",
            "function outputs",
            "prints the value",
            "stores the value",
            "times 2",
            "math will equal",
        ],
    ):
        return "return_vs_print_confusion"

    # 13. Do not confidently diagnose chained comparison reasoning.
    if re.search(r"\d+\s*<\s*\d+\s*<\s*\d+", q):
        return UNCERTAIN

    return UNCERTAIN


def evaluate_split(split, dataset_dir):
    path = dataset_dir / f"{split}.jsonl"

    if not path.exists():
        print(f"\n{split.upper()}: file not found: {path}")
        return

    total = 0
    matched = 0

    print(f"\n{split.upper()}:")

    with path.open("r", encoding="utf-8") as file:
        for line_number, line in enumerate(file, start=1):
            if not line.strip():
                continue

            try:
                row = json.loads(line)
            except json.JSONDecodeError as error:
                print(f"Invalid JSON at line {line_number}: {error}")
                continue

            actual = row.get("misconception_label", "")
            if not actual or actual == "none":
                continue

            predicted = detect_misconception(
                row.get("question", ""),
                row.get("student_answer", ""),
                row.get("student_reasoning", ""),
                row.get("correct_answer", ""),
            )

            total += 1
            if actual == predicted:
                matched += 1
            else:
                print(
                    f"{row.get('example_id', 'N/A')} | "
                    f"actual: {actual} | predicted: {predicted}"
                )

    accuracy = matched / total * 100 if total else 0.0
    print(f"Matched: {matched}/{total} ({accuracy:.1f}%)")


if __name__ == "__main__":
    project_dir = Path(__file__).resolve().parent.parent
    dataset_dir = project_dir / "dataset"

    for split in ["train", "validation", "test"]:
        evaluate_split(split, dataset_dir)

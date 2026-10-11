# LearnLoop AI — AIML Workbench

## Recommended order
1. Review every synthetic label and answer manually.
2. Run the structural validator.
3. Expand and balance the dataset before trusting ML metrics.
4. Build a TF-IDF + Logistic Regression baseline only after each target label has enough examples.
5. Evaluate the LLM diagnosis against a reviewed holdout set.
6. Add personalized feedback and adaptive activity selection after diagnosis quality is acceptable.

## Setup on Linux
```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python src/validate_dataset.py
pytest -q
```

To try the exploratory ML baseline:
```bash
python src/baseline.py
```

The starter data is tiny and synthetic. A structurally valid dataset can still contain incorrect or inconsistent labels. Do not present synthetic test scores as evidence of real-world learning gains.

## LLM API
`src/llm_prompt.py` contains a prompt template only. It does not call an API. Choose an approved provider, use environment variables for secrets, and keep a local/rules fallback so the demo does not depend entirely on an external endpoint.

# Topic Generation Module

Generates topic cards from gap analysis.

Input: `GapAnalysisResult`

Output: `TopicGenerationResult`

Providers:
- `MockTopicGenerationProvider`: returns 10 schema-valid topic cards.
- `RealTopicGenerationProvider`: placeholder for LLM or topic mining implementation.

Integration rule: each topic should include `overview`, `background`, `whyNow`, audience, difficulty, impact, and related gap ids.

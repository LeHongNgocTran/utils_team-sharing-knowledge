# Evaluation Module

Evaluates the session and suggests follow-up topics.

Input: `TopicSelectionResult` plus `FeedbackSummary`

Output: `EvaluationResult`

Providers:
- `MockEvaluationProvider`: rule-based evaluation from average feedback.
- `RealEvaluationProvider`: rule-based evaluator that maps feedback into the shared outcome enum and proposes follow-up topics.

Integration rule: outcome must map to the shared enum so memory and future topic generation can learn from it consistently.

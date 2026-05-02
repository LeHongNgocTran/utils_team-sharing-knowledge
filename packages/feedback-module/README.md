# Feedback Module

Collects and summarizes post-session feedback.

Input: `SessionDraft`

Output: `FeedbackSummary`

Providers:
- `MockFeedbackProvider`: reads `data/samples/feedback.json` and calculates averages.
- `RealFeedbackProvider`: rule-based feedback reader that loads structured responses, preserves raw entries, and generates a human-readable summary.

Integration rule: keep raw feedback entries and derived summary separate so evaluation can be audited.

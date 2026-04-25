# Feedback Module

Collects and summarizes post-session feedback.

Input: `SessionDraft`

Output: `FeedbackSummary`

Providers:
- `MockFeedbackProvider`: reads `data/samples/feedback.json` and calculates averages.
- `RealFeedbackProvider`: placeholder for Forms, Slack survey, or feedback API.

Integration rule: keep raw feedback entries and derived summary separate so evaluation can be audited.

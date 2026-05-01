# Content Preparation Module

Creates a topic brief and agenda for the selected topic.

Input: `TopicSelectionResult`

Output: `SessionBrief`

Providers:
- `MockContentProvider`: creates a practical brief with agenda and takeaways.
- `RealContentProvider`: rule-based configurable brief generator that keeps the workflow moving without requiring an LLM yet.

Integration rule: generated content should be a reviewable draft, not final unchecked training material.

## Config Example

```json
{
  "content": {
    "defaultDurationMinutes": 55,
    "agendaStyle": "discussion-heavy",
    "callToAction": "Choose one practice to try in the next sprint."
  }
}
```

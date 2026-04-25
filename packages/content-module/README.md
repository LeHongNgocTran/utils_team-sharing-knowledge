# Content Preparation Module

Creates a topic brief and agenda for the selected topic.

Input: `TopicSelectionResult`

Output: `SessionBrief`

Providers:
- `MockContentProvider`: creates a practical brief with agenda and takeaways.
- `RealContentProvider`: placeholder for LLM-assisted content generation.

Integration rule: generated content should be a reviewable draft, not final unchecked training material.

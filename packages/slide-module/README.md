# Slide Draft Module

Turns a session brief into a slide outline.

Input: `SessionBrief`

Output: `SlideOutline`

Providers:
- `MockSlideProvider`: creates a 5-slide outline with speaker notes.
- `RealSlideProvider`: placeholder for markdown, Google Slides, PowerPoint, or AI slide generation.

Integration rule: slide output is an outline contract first; rendering/export can be added later.

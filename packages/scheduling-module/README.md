# Scheduling Module

Creates a session draft and notification drafts.

Input: `SessionBrief` plus `SlideOutline`

Output: `SessionDraft`

Providers:
- `MockSchedulingProvider`: schedules a draft one week in the future and creates Slack/calendar notification drafts.
- `RealSchedulingProvider`: placeholder for Calendar, Slack, email, or room booking integrations.

Integration rule: generate drafts first; actual sending/bookings should remain behind provider implementation and future approval checkpoints.

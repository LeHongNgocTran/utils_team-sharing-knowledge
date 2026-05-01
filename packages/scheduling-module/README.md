# Scheduling Module

Creates a session draft and notification drafts.

Input: `SessionBrief` plus `SlideOutline`

Output: `SessionDraft`

Providers:
- `MockSchedulingProvider`: schedules a draft one week in the future and creates Slack/calendar notification drafts.
- `RealSchedulingProvider`: rule-based scheduling draft generator that computes a planned session time and emits Slack, calendar, and optional email drafts from config.

Integration rule: generate drafts first; actual sending/bookings should remain behind provider implementation and future approval checkpoints.

## Real provider config

```json
{
  "providers": {
    "scheduling": "real"
  },
  "scheduling": {
    "leadDays": 10,
    "startHourUtc": 8,
    "durationMinutes": 75,
    "location": "Meeting Room A / Google Meet draft",
    "slackChannel": "#platform-team",
    "emailRecipients": ["team@example.com"],
    "calendarRecipients": ["engineering@example.com"]
  }
}
```

Behavior:
- schedules the session `leadDays` after the workflow run
- uses `startHourUtc` to create a stable draft time
- writes a `SessionDraft` artifact with notification drafts
- keeps external delivery as a future provider concern

# Scheduling Module

Creates a session draft and notification drafts.

Input: `SessionBrief` plus `SlideOutline`

Output: `SessionDraft`

Providers:
- `MockSchedulingProvider`: schedules a draft one week in the future and creates Slack/calendar notification drafts.
- `RealSchedulingProvider`: rule-based scheduling draft generator that reads team availability, picks a shared slot, chooses a suitable room, and emits Gmail/Slack/calendar drafts.
- `GoogleWorkspaceSchedulingProvider`: Google Calendar + Gmail booking provider. In `dryRun` mode it validates config and artifact shape without calling Google. In live mode it uses Google free/busy, event creation, room resource calendars, and Gmail send.
- `GoogleOAuthPersonalSchedulingProvider`: host-account Gmail + Calendar booking provider for personal Google accounts using OAuth desktop-app login and a local refresh token.

Integration rule: generate drafts first; actual sending/bookings should remain behind provider implementation and future approval checkpoints.

## Real provider config

```json
{
  "providers": {
    "scheduling": "real"
  },
  "sampleData": {
    "teamProfile": "data/samples/team-profile.json",
    "teamAvailability": "data/samples/team-availability.json",
    "roomInventory": "data/samples/room-inventory.json"
  },
  "scheduling": {
    "durationMinutes": 75,
    "slackChannel": "#platform-team",
    "calendarRecipients": ["engineering@example.com"]
  }
}
```

Behavior:
- checks sample team availability and chooses the earliest slot that fits the whole team
- finds the smallest room that fits the team and is free at that slot
- drafts a topic-selection email, calendar invite, Slack announcement, and schedule-confirmation email
- writes a `SessionDraft` artifact with booking-ready notification drafts
- keeps external delivery as a future provider concern

## Google Workspace provider

Use provider kind `google-workspace` for the scheduling module:

```json
{
  "providers": {
    "scheduling": "google-workspace"
  },
  "googleWorkspace": {
    "organizerEmail": "team-sharing-organizer@example.com",
    "delegatedUser": "team-sharing-organizer@example.com",
    "serviceAccountEmail": "tsa-bot@example-project.iam.gserviceaccount.com",
    "privateKeyEnv": "GOOGLE_PRIVATE_KEY",
    "calendarId": "primary",
    "timeZone": "Asia/Ho_Chi_Minh",
    "searchWindowDays": 14,
    "workdayStartHour": 8,
    "workdayEndHour": 18,
    "slotIntervalMinutes": 30,
    "createMeetLink": true,
    "sendCalendarUpdates": "all",
    "sendTopicAnnouncementEmail": true,
    "sendConfirmationEmail": true,
    "dryRun": true,
    "roomResourceCalendars": [
      "sunflower-room@example.com"
    ]
  }
}
```

Live-mode expectations:
- `MemberProfile.email` must be present for everyone being invited
- the Google Workspace service account must have domain-wide delegation
- room booking works through room/resource calendars in Google Workspace
- Gmail send uses `users.messages.send`
- Calendar availability uses `freeBusy.query`
- Meeting booking uses `events.insert`, with Meet link creation enabled when configured

Recommended rollout:
1. run `dryRun: true`
2. verify `session-draft.json`
3. add `GOOGLE_PRIVATE_KEY`
4. switch `dryRun` to `false`

## Google personal OAuth provider

Use provider kind `google-oauth-personal` when one host account sends mail and creates the event from a personal Gmail account.

Supporting files:
- `configs/google-oauth-personal-post-voting-dry-run.json`
- `configs/google-oauth-personal-post-voting-live.json`
- `configs/google-oauth-client.example.json`
- `scripts/google-oauth-personal-auth.mjs`

First-time login:

```bash
npm run google:personal-auth -- configs/google-oauth-personal-post-voting-live.json
```

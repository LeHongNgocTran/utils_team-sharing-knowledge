# Google Workspace Setup

Use this guide to move the scheduling step from draft mode to live Google Workspace booking with a fixed sharing time and fixed meeting room.

## What this integration does

When the `scheduling` provider is set to `google-workspace`, the workflow can:

1. read team member emails from the team profile
2. use the configured fixed sharing time
3. use the configured fixed room or room resource calendar
4. create a Google Calendar event
5. optionally create a Google Meet link
6. send Gmail notifications before and after booking
7. store booking metadata in `session-draft.json`

## Files involved

- config example: [configs/google-workspace-post-voting-live.example.json](/Users/lehongngoctran/Project_etc/utils_team-sharing-knowledge/configs/google-workspace-post-voting-live.example.json)
- live config: [configs/google-workspace-post-voting-live.json](/Users/lehongngoctran/Project_etc/utils_team-sharing-knowledge/configs/google-workspace-post-voting-live.json)
- dry-run config: [configs/google-workspace-post-voting-dry-run.json](/Users/lehongngoctran/Project_etc/utils_team-sharing-knowledge/configs/google-workspace-post-voting-dry-run.json)
- provider: [packages/scheduling-module/src/index.ts](/Users/lehongngoctran/Project_etc/utils_team-sharing-knowledge/packages/scheduling-module/src/index.ts)

## Prerequisites

You need:

1. a Google Cloud project
2. Calendar API enabled
3. Gmail API enabled
4. a service account
5. domain-wide delegation enabled on that service account
6. an admin-approved OAuth scope grant in Google Workspace Admin
7. a real Google Workspace user to impersonate as organizer
8. a fixed room or room resource calendar if you want room booking through Google Calendar

## Required Google scopes

The current provider expects these scopes:

- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/gmail.send`

Grant them to the service account client in Google Workspace Admin for domain-wide delegation.

## Team data requirements

Every invited member must have an email in the team profile:

- [data/samples/team-profile.json](/Users/lehongngoctran/Project_etc/utils_team-sharing-knowledge/data/samples/team-profile.json)

If a member email is missing, the provider will stop with an error.

## Environment variables

Set the Google private key in your shell before running the workflow:

```bash
export GOOGLE_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n'
```

Notes:

- keep literal `\n` escapes if you paste it in one line
- never commit the private key into the repo
- you can change the env var name through `googleWorkspace.privateKeyEnv`

## Config fields

Start from:

- [configs/google-workspace-post-voting-live.example.json](/Users/lehongngoctran/Project_etc/utils_team-sharing-knowledge/configs/google-workspace-post-voting-live.example.json)

Important fields:

- `googleWorkspace.organizerEmail`
  - the human-visible organizer for the meeting
- `googleWorkspace.delegatedUser`
  - the Workspace user the service account impersonates
- `googleWorkspace.serviceAccountEmail`
  - the service account email from Google Cloud
- `googleWorkspace.calendarId`
  - usually `primary`
- `googleWorkspace.roomResourceCalendar`
  - optional fixed room resource calendar email
- `googleWorkspace.dryRun`
  - `true` for safe validation, `false` for live booking
- `scheduling.fixedStartAt`
  - the fixed session start time
- `scheduling.location`
  - the fixed room or location text shown to the team

## Rollout path

### Step 1: Dry run

Use:

```bash
npm run workflow:mock -- configs/google-workspace-post-voting-dry-run.json
```

Expected result:

- workflow succeeds
- `session-draft.json` contains:
  - `externalBooking.provider = "google-workspace"`
  - `externalBooking.status = "draft"`
  - `candidateSlotStart`
  - `attendeeEmails`

### Step 2: Prepare the live config

Edit:

- [configs/google-workspace-post-voting-live.json](/Users/lehongngoctran/Project_etc/utils_team-sharing-knowledge/configs/google-workspace-post-voting-live.json)

Then update:

- organizer email
- delegated user
- service account email
- fixed room resource email if you use one
- fixed start time
- fixed location
- `dryRun: false`

### Step 3: Run live booking

```bash
npm run workflow:mock -- configs/google-workspace-post-voting-live.json
```

Expected live result in `session-draft.json`:

- `externalBooking.status = "booked"`
- `calendarEventId`
- `calendarHtmlLink`
- optional `meetLink`

## How room booking works

If `googleWorkspace.roomResourceCalendar` is set, the provider adds that room resource calendar to the event attendees.

That means:

- the room must exist in Google Workspace as a resource calendar
- the delegated user must be allowed to book it

If you do not use a room resource calendar, the provider falls back to `scheduling.location`.

## Current implementation boundaries

The repo currently does:

- fixed schedule handling
- fixed room handling
- Gmail send
- Calendar event creation

The repo does not yet do:

- Slack API send
- event update/cancel flows
- retry policy
- webhook-based delivery confirmation
- automatic conflict recovery after partial failure

## Troubleshooting

### `Missing Google service account private key`

Set `GOOGLE_PRIVATE_KEY` in your shell and rerun.

### `requires member emails`

At least one member in the team profile is missing `email`.

### `invalid_grant / account not found`

Usually one of:

- `delegatedUser` is not a real Google Workspace user
- `serviceAccountEmail` is not the real service account email
- you are trying to impersonate a personal Gmail account instead of a Workspace user

### `unauthorized_client`

Usually one of:

- domain-wide delegation is not enabled on the service account
- the Google Admin scope grant is missing
- the wrong client ID was added in Admin Console

### `events.insert failed`

Usually one of:

- organizer cannot create event in target calendar
- room resource email is invalid
- service account delegation is incomplete

### Gmail send failed

Usually one of:

- Gmail API not enabled
- `gmail.send` scope not granted
- delegated user cannot send mail in that context

## Suggested next improvements

Once live booking is stable, the next sensible changes are:

1. add Slack API delivery for the Slack draft notifications
2. support updating or cancelling an existing event
3. persist Google event ids for follow-up edits
4. add integration tests behind env-gated credentials

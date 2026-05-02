# Google OAuth Personal Setup

Use this guide when the host sends mail and creates a calendar event from a personal Gmail account.

## When this mode makes sense

Choose `google-oauth-personal` when:

- one host account sends Gmail notifications
- one host account creates the Calendar event
- the sharing time is fixed
- the room or location is fixed
- you do not want Google Workspace admin setup

## Provider

Set the scheduling provider to:

```json
{
  "providers": {
    "scheduling": "google-oauth-personal"
  }
}
```

## Files involved

- dry-run config: [configs/google-oauth-personal-post-voting-dry-run.json](/Users/lehongngoctran/Project_etc/utils_team-sharing-knowledge/configs/google-oauth-personal-post-voting-dry-run.json)
- live example config: [configs/google-oauth-personal-post-voting-live.example.json](/Users/lehongngoctran/Project_etc/utils_team-sharing-knowledge/configs/google-oauth-personal-post-voting-live.example.json)
- OAuth client example: [configs/google-oauth-client.example.json](/Users/lehongngoctran/Project_etc/utils_team-sharing-knowledge/configs/google-oauth-client.example.json)
- auth script: [scripts/google-oauth-personal-auth.mjs](/Users/lehongngoctran/Project_etc/utils_team-sharing-knowledge/scripts/google-oauth-personal-auth.mjs)

## Google Cloud setup

1. create or choose a Google Cloud project
2. enable:
   - Gmail API
   - Google Calendar API
3. configure the OAuth consent screen
4. create an OAuth client of type `Desktop app`
5. download the OAuth client JSON

Save that file locally, for example:

```text
configs/google-oauth-client.json
```

Recommended redirect URI in the OAuth client:

```text
http://127.0.0.1:53682/callback
```

If your downloaded client currently contains only `http://localhost`, replace it with the redirect URI above in Google Cloud Console, then download the client JSON again.

## First-time login flow

1. prepare your live config from the example
2. point `googlePersonal.credentialsFile` to your OAuth client file
3. choose where to store the token, for example:
   - `data/auth/google-personal-token.json`
4. run:

```bash
npm run google:personal-auth -- configs/google-oauth-personal-post-voting-live.example.json
```

The script will:

- print a Google login URL
- wait for the OAuth callback on localhost
- exchange the code for tokens
- save the token file locally

If you saw a `listen EACCES ... port 80` error before, it means the OAuth client used `http://localhost` without an explicit port. The auth script now normalizes to:

```text
http://127.0.0.1:53682/callback
```

## Config fields

Important fields:

- `googlePersonal.credentialsFile`
  - downloaded OAuth client JSON
- `googlePersonal.tokenFile`
  - local token storage path
- `googlePersonal.organizerEmail`
  - personal Gmail of the host
- `googlePersonal.calendarId`
  - usually `primary`
- `googlePersonal.dryRun`
  - `true` for safe validation, `false` for live Gmail + Calendar API calls
- `scheduling.fixedStartAt`
  - fixed sharing time
- `scheduling.location`
  - fixed room or location text

## Dry run

Run:

```bash
npm run workflow:mock -- configs/google-oauth-personal-post-voting-dry-run.json
```

Expected result:

- no live Google API calls
- `session-draft.json` contains `externalBooking.provider = "google-oauth-personal"`

## Live run

After you have:

- a real OAuth client file
- a token file from the auth script
- `dryRun: false`

run:

```bash
npm run workflow:mock -- configs/google-oauth-personal-post-voting-live.json
```

## Notes

- this mode uses the host's own Gmail and Calendar permissions
- it does not require admin setup
- it is a better fit than service-account impersonation for personal Gmail
- room booking is just a fixed location unless you intentionally attach a shared room/resource email

## Troubleshooting

### Missing token file

Run the auth script first.

### Missing refresh token

Delete the token file and run the auth script again, making sure consent is granted again.

### Refresh token request failed

Usually one of:

- wrong OAuth client file
- wrong client secret
- revoked token
- project OAuth consent screen misconfigured

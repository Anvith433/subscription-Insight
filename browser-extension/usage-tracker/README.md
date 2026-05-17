# Subscription Usage Tracker Extension

A Chrome extension that tracks browser usage time on supported subscription websites and pushes usage data to your backend.

## Tracked Sites (default)

- Netflix
- Spotify
- YouTube / YouTube Music
- Prime Video

The extension fetches supported hosts from `GET /api/usage/config` and falls back to built-in defaults when backend is unavailable.

## Data Sent to Backend

`POST /api/usage`

```json
{
  "serviceName": "Netflix",
  "minutesUsed": 12,
  "date": "2026-03-18",
  "idempotencyKey": "1712345678901-abc123def4"
}
```

## How To Load

1. Open Chrome and go to `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked` and select this folder.
4. Open extension popup and set:
  - Backend URL (default: `http://localhost:8081`)
  - Auth token, or use email/password login in the popup to obtain and store token.

## Notes

- The extension flushes usage every 5 minutes.
- Uploads are idempotent using per-service idempotency keys to prevent duplicate rows on retries.
- If backend is offline, usage remains buffered in local storage and is retried later.
- Only browser tab activity is tracked, not mobile apps or smart TV usage.

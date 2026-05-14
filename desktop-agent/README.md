# SimTrack Coach Desktop Agent

Prototype local agent for sending telemetry payloads from your sim PC to the SimTrack Coach ingest API.

## Current status

The backend ingest API is live and supports:

- authenticated desktop-agent ingestion
- validated telemetry payloads
- session merge using `external_session_id`
- duplicate lap protection
- telemetry point batching

The desktop agent currently has a working sample sender. The next local step is to run it on the Windows sim PC, then add live iRacing SDK capture.

## Files

- `src/agent.js` - sample sender that posts test telemetry to SimTrack
- `config.example.txt` - example local config file
- `config.txt` - your local config file, not committed to GitHub

## Local setup

From the repo root:

```bash
cd desktop-agent
copy config.example.txt config.txt
npm install
npm start
```

Edit `config.txt` before running.

Required values:

```txt
SIMTRACK_API_URL=https://your-vercel-app.vercel.app
SIMTRACK_INGEST_TOKEN=your-private-ingest-token
SIMTRACK_PROFILE_ID=your-profile-id
```

Optional values for later live capture:

```txt
SIMTRACK_TRACK_SLUG=spa
SIMTRACK_CAR_NAME=Ferrari 296 GT3
```

## Expected result

The terminal should print a success response containing:

```txt
success: true
session_id: ...
```

Then a new telemetry session should appear in the SimTrack Coach `/sessions` page.

## Tomorrow's local test checklist

1. Pull the latest GitHub repo on the sim PC.
2. Open a terminal in `desktop-agent`.
3. Create `config.txt` from `config.example.txt`.
4. Add the live Vercel URL, ingest token and profile ID.
5. Run `npm install`.
6. Run `npm start`.
7. Confirm the sample session appears in `/sessions`.
8. Install the iRacing SDK reader package.
9. Add/run the live iRacing capture script.
10. Start iRacing and confirm the agent can detect telemetry.

## Important security note

Never commit `config.txt`, service role keys, ingest tokens, or any private Supabase keys to GitHub.

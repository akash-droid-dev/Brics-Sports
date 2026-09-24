# Event Live Hub — Netlify copy

This folder is a copy of `../app` adapted for Netlify's free plan. Keep developing in `../app` (the React + Node version). When you want to publish, copy your changes here and redeploy.

The public Live Hub website and its Event Control admin, built from the Claude Design handoff (`../project/Event Live Hub Website.dc.html`).

- **Public site** (`/`): Live now, Schedule, Countries, 30 Sports, Venue map (3D) and Updates. LIVE badges, countdowns, progress bars and the now-line all follow the real clock in the event's time zone.
- **Event control** (`/admin`): password sign-in. From here you can publish or take down the announcement banner, delay or move sessions (and optionally post a schedule-change update automatically), post or remove live updates, and edit the event name, URL, dates and time zone. It also shows the real, scannable QR code, which you can copy or download as SVG, plus a publish log.
- **Live push**: every change goes out to all open pages over Server-Sent Events, with no reload. Visitors see a "Live update" toast.

## Run

Needs **Node.js 22 LTS** (or 20.19+) from https://nodejs.org. Run these inside this `netlify-site` folder:

```bash
npm install        # installs everything
npm run dev        # opens http://localhost:5173 (admin: /admin, password "admin")
```

Production (serves the built site and the API on one port, :8787):

```bash
npm run build
ADMIN_PASSWORD=choose-one npm start                       # macOS / Linux
$env:ADMIN_PASSWORD="choose-one"; npm start               # Windows PowerShell
```

## Deploy to Netlify (free)

This folder is ready for Netlify: its own `netlify.toml` builds it. The API runs as a Netlify Function (`netlify/functions/api.ts`), and the live state lives in **Netlify Blobs**, so nothing else needs setting up. Netlify can't keep connections open, so pages check for changes every ~5 seconds instead of instantly. Those checks are served from Netlify's CDN, which is cleared on every admin change, so a busy event stays well within the free tier.

**Netlify Drop (drag-and-drop) won't work:** it only uploads static files, so the admin and live updates would be missing. Use one of these instead:

**A. From your computer (Netlify CLI)**, run inside this `netlify-site` folder:

```bash
npm install
npx netlify-cli login                        # opens the browser once
npx netlify-cli init                         # "Create & configure a new project", pick your team and a site name
npx netlify-cli env:set ADMIN_PASSWORD "choose-a-strong-one"
npx netlify-cli deploy --build --prod
```

Your site is then live at `https://<site-name>.netlify.app`, with the admin at `/admin`.

**B. From GitHub:** push the repo, then in Netlify choose **Add new project → Import an existing project**, pick the repo, set **Base directory** to `netlify-site`, and deploy; the other build settings come from `netlify.toml`. Then open **Project configuration → Environment variables**, add `ADMIN_PASSWORD`, and redeploy.

This copy is set up for **https://bricssports.netlify.app** (Netlify project ID `9328404b-5eb1-4370-a22e-32edff6353a5`): the QR code points there by default. If you use a different address, change **Public URL** in Event control → Event settings.

| Env var | Default | Purpose |
|---|---|---|
| `ADMIN_PASSWORD` | `admin` in dev, **required** in production | Event control password |
| `SESSION_SECRET` | derived from the password | Signs admin cookies. Changing the password signs everyone out |
| `PORT` | `8787` | HTTP port |
| `DATA_FILE` | `./data/live-state.json` | Where live state is stored (Node server; Netlify uses Blobs) |
| `EVENT_TIMEZONE`, `EVENT_START_DATE`, `EVENT_NAME`, `PUBLIC_URL` | `UTC`, `2026-10-15`, `BRICS SPORTS`, `bricssports.netlify.app` | First-boot seed only. After that, edit them in Event control |

**Preview a moment in the event:** add `?at=2026-10-16T14:42` to any public URL. The clock starts at that event-local time and keeps running.

## Notes

- Countries, sports, venues, the programme and the six sample updates are sample content from the design. They live in `shared/data.ts`. The sample updates appear on Day 2 at their listed times.
- The Sumo clips (the Live Now card, the Sumo sport page and the first cultural story) come from the Claude Design pack. They're bundled in `public/media` as MP4 (for all browsers, including iPhone) and WebM, so they play offline. Other photos and clips load from Wikimedia Commons, and fonts load from Google Fonts.
- The Live Now card always shows footage. It leads with Sumo when Sumo is live, otherwise another live session with a clip. When nothing is live it shows the next session with a clip, badged **UP NEXT** rather than LIVE.
- The API lives in `server/core.ts` as a plain `Request → Response` handler, shared by the Node server (`server/index.ts`: JSON file + instant push) and Netlify (`netlify/functions/api.ts`: Blobs + 5-second refresh). Writes are conditional, so two admins publishing at once don't overwrite each other.

# Event Live Hub — Netlify copy

This folder is a copy of `../app` adapted for Netlify's free plan. Keep developing in `../app` (the React + Node version). When you want to publish, copy your changes here and redeploy.

The public Live Hub website and its Event Control admin, built from the Claude Design handoff (`../project/Event Live Hub Website.dc.html`).

- **Public site** (`/`): Live now, Schedule, Countries, Sports, Venue map (3D), Updates and About us. LIVE badges, countdowns, progress bars and the now-line all follow the real clock in the event's time zone.
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
| `EVENT_TIMEZONE`, `EVENT_START_DATE`, `EVENT_NAME`, `PUBLIC_URL` | `Asia/Kolkata`, `2026-10-12`, `BRICS Traditional & Indigenous Sports 2026`, `bricssports.netlify.app` | First-boot seed only. After that, edit them in Event control |

**Preview a moment in the event:** add `?at=2026-10-12T10:32` to any public URL. The clock starts at that event-local time and keeps running.

## Notes

- Content lives in `shared/data.ts`: the 11 participating countries (flags in `public/flags`, from the MIT-licensed flag-icons set), 33 traditional sports, and the 12 October 2026 show flow. The seven demonstration slots run in `DEMO_ORDER`; change that list to change which countries present and in what order. After changing the programme, bump `SEED_VERSION` on the server so stored schedule changes for old items are cleared.
- Brand assets live in `public/brand`: the page background (world map and ribbons), the home banner, the logo and the mascot (background removed). Set the mascot's name in `MASCOT.name` in `shared/data.ts`.
- Sports have no photos or clips yet, so cards use each country's flag as artwork. Add a `photo` or `video` to a sport in `shared/data.ts` and it is used automatically. Flags that carry sacred inscriptions (Saudi Arabia, Iran) are shown only as badges, never as tinted background art.
- The Live Now card leads with the country demonstration that is live, otherwise whatever is on, otherwise the next item, badged **UP NEXT** rather than LIVE.
- The API lives in `server/core.ts` as a plain `Request → Response` handler, shared by the Node server (`server/index.ts`: JSON file + instant push) and Netlify (`netlify/functions/api.ts`: Blobs + 5-second refresh). Writes are conditional, so two admins publishing at once don't overwrite each other.

# Event Live Hub

The public Live Hub website and its Event Control admin, built from the Claude Design handoff (`../project/Event Live Hub Website.dc.html`).

- **Public site** (`/`): Live now, Schedule, Countries, Sports, Venue map (3D), Updates and About us. LIVE badges, countdowns, progress bars and the now-line all follow the real clock in the event's time zone.
- **Event control** (`/admin`): password sign-in. From here you can publish or take down the announcement banner, delay or move sessions (and optionally post a schedule-change update automatically), post or remove live updates, and edit the event name, URL, dates and time zone. It also shows the real, scannable QR code, which you can copy or download as SVG, plus a publish log.
- **Live push**: every change goes out to all open pages over Server-Sent Events, with no reload. Visitors see a "Live update" toast.

## Run

Needs **Node.js 22 LTS** (or 20.19+) from https://nodejs.org. Run these from the project root (the folder containing `app/`) or from inside `app/`:

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

| Env var | Default | Purpose |
|---|---|---|
| `ADMIN_PASSWORD` | `admin` in dev, **required** in production | Event control password |
| `SESSION_SECRET` | random per boot | Signs admin cookies. Set it so admins stay signed in across restarts |
| `PORT` | `8787` | HTTP port |
| `DATA_FILE` | `./data/live-state.json` | Where live state is stored |
| `EVENT_TIMEZONE`, `EVENT_START_DATE`, `EVENT_NAME`, `PUBLIC_URL` | `Asia/Kolkata`, `2026-10-12`, `BRICS Traditional & Indigenous Sports 2026`, `bricssports.netlify.app` | First-boot seed only. After that, edit them in Event control |

**Preview a moment in the event:** add `?at=2026-10-12T10:32` to any public URL. The clock starts at that event-local time and keeps running.

## Notes

- Content lives in `shared/data.ts`: the 11 participating countries (flags in `public/flags`, from the MIT-licensed flag-icons set), 33 traditional sports, and the 12 October 2026 show flow. The seven demonstration slots run in `DEMO_ORDER`; change that list to change which countries present and in what order. After changing the programme, bump `SEED_VERSION` on the server so stored schedule changes for old items are cleared.
- Brand assets live in `public/brand`: the page background (world map and ribbons), the home banner, the logo and the mascot (background removed). Set the mascot's name in `MASCOT.name` in `shared/data.ts`.
- Sports have no photos or clips yet, so cards use each country's flag as artwork. Add a `photo` or `video` to a sport in `shared/data.ts` and it is used automatically. Flags that carry sacred inscriptions (Saudi Arabia, Iran) are shown only as badges, never as tinted background art.
- The Live Now card leads with the country demonstration that is live, otherwise whatever is on, otherwise the next item, badged **UP NEXT** rather than LIVE.
- Storage is a single JSON file, which is fine for one server instance. If you run several instances, move it to a database behind `server/store.ts`.

# Event Live Hub

The public Live Hub website and its Event Control admin, built from the Claude Design handoff (`../project/Event Live Hub Website.dc.html`).

- **Public site** (`/`): Live now, Schedule, Countries, 30 Sports, Venue map (3D) and Updates. LIVE badges, countdowns, progress bars and the now-line all follow the real clock in the event's time zone.
- **Event control** (`/admin`): password sign-in. From here you can publish or take down the announcement banner, delay or move sessions (and optionally post a schedule-change update automatically), post or remove live updates, and edit the event name, URL, dates and time zone. It also shows the real, scannable QR code, which you can copy or download as SVG, plus a publish log.
- **Live push**: every change goes out to all open pages over Server-Sent Events, with no reload. Visitors see a "Live update" toast.

## Run

```bash
npm install
npm run dev                 # API on :8787 + Vite on :5173 (admin password "admin")
npm run build && ADMIN_PASSWORD=… SESSION_SECRET=… npm start   # production, serves dist/ on :8787
```

| Env var | Default | Purpose |
|---|---|---|
| `ADMIN_PASSWORD` | `admin` in dev, **required** in production | Event control password |
| `SESSION_SECRET` | random per boot | Signs admin cookies. Set it so admins stay signed in across restarts |
| `PORT` | `8787` | HTTP port |
| `DATA_FILE` | `./data/live-state.json` | Where live state is stored |
| `EVENT_TIMEZONE`, `EVENT_START_DATE`, `EVENT_NAME`, `PUBLIC_URL` | `UTC`, `2026-10-15`, `BRICS SPORTS`, `traditionalsports.live` | First-boot seed only. After that, edit them in Event control |

**Preview a moment in the event:** add `?at=2026-10-16T14:42` to any public URL. The clock starts at that event-local time and keeps running.

## Notes

- Countries, sports, venues, the programme and the six sample updates are sample content from the design. They live in `shared/data.ts`. The sample updates appear on Day 2 at their listed times.
- Photos and clips load from Wikimedia Commons, and fonts load from Google Fonts.
- Storage is a single JSON file, which is fine for one server instance. If you run several instances, move it to a database behind `server/store.ts`.

# Event Live Hub

The public Live Hub website and its Event Control admin, built from the Claude Design handoff (`../project/Event Live Hub Website.dc.html`).

- **Public site** (`/`): Live now, Schedule, Countries, Sports, Venue map (3D), Updates and About us. LIVE badges, countdowns, progress bars and the now-line all follow the real clock in the event's time zone.
- **Event control** (`/admin`): password sign-in. From here you can:
  - publish or take down the announcement banner, delay or move sessions (optionally posting a schedule-change update), and post or remove live updates;
  - **Live video**: paste any YouTube link (a video, a live stream, a Shorts link or a channel's live page) to add it to the video library, then pick which one plays on the home page's Live Now screen, edit or remove videos, or turn the video off;
  - **QR code**: upload your own QR image, change it or remove it (the site then goes back to the generated QR for the public URL);
  - **Mascot**: upload a new mascot image, change its name and description, or restore the original;
  - **Countries and sports**: view, add, edit or remove any country (name, code, flag, colour, introduction, flag image and country photo) or sport (name, country, type, description, photo and photo credit). Images can be uploaded or linked;
  - edit the event name, URL, dates and time zone, and see a publish log.
- **Smooth scrolling**: pages scroll smoothly and sections fade up into view as you scroll (turned off for visitors who ask their device for reduced motion).
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
| `SESSION_SECRET` | derived from the password | Signs admin cookies. Changing the password signs everyone out |
| `PORT` | `8787` | HTTP port |
| `DATA_FILE` | `./data/live-state.json` | Where live state is stored |
| `EVENT_TIMEZONE`, `EVENT_START_DATE`, `EVENT_NAME`, `PUBLIC_URL` | `Asia/Kolkata`, `2026-10-12`, `BRICS Traditional & Indigenous Sports 2026`, `bricssports.netlify.app` | First-boot seed only. After that, edit them in Event control |

**Preview a moment in the event:** add `?at=2026-10-12T10:32` to any public URL. The clock starts at that event-local time and keeps running.

## Notes

- Content lives in `shared/data.ts`: the 11 participating countries (flags in `public/flags`, from the MIT-licensed flag-icons set), 33 traditional sports, and the 12 October 2026 show flow. The seven demonstration slots run in `DEMO_ORDER`; change that list to change which countries present and in what order. After changing the programme, bump `SEED_VERSION` on the server so stored schedule changes for old items are cleared.
- Brand assets live in `public/brand`: the page background (world map and ribbons), the home banner, the logo and the mascot (background removed). The mascot, Mitra, can be changed in Event control; the original artwork and text are `MASCOT` and `MASCOT_ABOUT` in `shared/data.ts`. The header logo is two layers (`logo-ring.png` turns slowly, `logo-word.png` stays still).
- Most sports come with a photo from Wikimedia Commons (credited on each sport's page). Eleven have no free photo yet and use their country's flag as artwork until you upload one in Event control: Mas-Wrestling, Intonga, Kgati, Jukskei, Horse Dancing, Seega, Genna, Gugs, Donga, Koshti Chokheh and Almezmar. Flags that carry sacred inscriptions (Saudi Arabia, Iran) are shown only as badges, never as tinted background art.
- Countries, sports, videos and the QR image are stored with the live state, so edits in Event control survive restarts and redeploys. **Reset** in Event control clears schedule changes and updates only; it keeps your countries, sports, videos, QR and mascot. The defaults in `shared/data.ts` are used only on first start.
- Uploaded images (PNG, JPG, WebP or GIF, up to 4 MB, resized in the browser first) are served from `/api/media/…`. On the Node server they are saved in `data/media/` next to the state file; on Netlify they go into the `live-hub-media` Blobs store. An image nobody uses any more is deleted automatically.
- YouTube: the Live Now screen plays the chosen video muted and looping as a background; **Watch big screen** opens it in a full-window player with sound. YouTube's own player and controls stay intact, with back 10s, play/pause, forward 10s, seek, mute, Go live and Full screen buttons in a bar below it (driven by YouTube's official IFrame Player API). Shorts open in portrait. Some owners turn off embedding for their videos; if one shows "Video unavailable", pick or add another in Event control.
- The Live Now card leads with the country demonstration that is live, otherwise whatever is on, otherwise the next item, badged **UP NEXT** rather than LIVE.
- The API lives in `server/core.ts` as a plain `Request → Response` handler (the same file the Netlify copy uses). `server/index.ts` stores state in a single JSON file and uploads in `data/media/`, which is fine for one server instance. To run several instances, give `createApi` a database-backed `Store` and `MediaStore` instead.

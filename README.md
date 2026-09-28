# BRICS Traditional & Indigenous Sports 2026 · Live Hub

The event's live website and its **Event control** admin: 12 October 2026, Veer Savarkar Sports Complex, Ahmedabad.

- **Live site (Netlify, site + backend):** https://timely-bubblegum-1f249e.netlify.app
- **Live site (GitHub Pages):** https://akash-droid-dev.github.io/Brics-Sports/ (uses the Netlify backend)
- **Event control:** add `/admin` to either address

## What's inside

| Folder | What it is |
|---|---|
| `netlify-site/` | The deployed version: React website + API. Runs on Netlify (Functions + Blobs), on Node, and as a static GitHub Pages build. |
| `app/` | The same site as a plain React + Node project, for further development. |
| `project/`, `chats/` | The original Claude Design handoff (prototypes and design chat). |

See `netlify-site/README.md` for features, running locally and deployment details.

## How it's deployed

A push to `main` runs `.github/workflows/deploy.yml`:

1. **GitHub Pages** gets the website. Pages can only host static files, so this copy talks to the API on Netlify for live data, uploads and Event control.
2. **Netlify** gets the website and the backend (API, live updates, admin, uploaded images). This step runs once a `NETLIFY_AUTH_TOKEN` secret is added; until then, deploy Netlify by hand (see `netlify-site/README.md`).

Both addresses show the same live content: an update published in Event control on either one appears on both.

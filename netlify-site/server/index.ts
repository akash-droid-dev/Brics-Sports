// Node host: serves the API (server/core.ts), live push over Server-Sent Events, and the built site.
import express from 'express';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { SESSIONS, VENUES } from '../shared/data.ts';
import type { LiveState } from '../shared/live.ts';
import { createApi, type Doc, type Store } from './core.ts';

const env = process.env;
if (env.NODE_ENV === 'production' && !env.ADMIN_PASSWORD) {
  console.error('\n  Set an admin password first, e.g.\n    macOS/Linux:  ADMIN_PASSWORD=choose-one npm start\n    Windows (PowerShell):  $env:ADMIN_PASSWORD="choose-one"; npm start\n');
  process.exit(1);
}
if (!env.ADMIN_PASSWORD) console.warn('[auth] ADMIN_PASSWORD not set — using "admin" for local development');

// JSON file on disk, written atomically. One server instance only.
const FILE = env.DATA_FILE ?? join(process.cwd(), 'data', 'live-state.json');
let cached: Doc | null = existsSync(FILE) ? (JSON.parse(readFileSync(FILE, 'utf8')) as Doc) : null;
const fileStore: Store = {
  async load() { return { doc: cached ? structuredClone(cached) : null }; },
  async save(doc) {
    mkdirSync(dirname(FILE), { recursive: true });
    writeFileSync(FILE + '.tmp', JSON.stringify(doc, null, 2));
    renameSync(FILE + '.tmp', FILE);
    cached = structuredClone(doc);
  },
};

const listeners = new Set<(s: LiveState) => void>();
const api = createApi({ store: fileStore, env, onChange: (s) => listeners.forEach((l) => l(s)) });

const app = express();
app.set('trust proxy', 1);

app.get('/api/stream', async (req, res) => {
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  res.flushHeaders();
  const send = (s: LiveState) => res.write(`event: state\ndata: ${JSON.stringify(s)}\n\n`);
  const state = (await (await api(new Request('http://local/api/state'))).json()) as LiveState;
  send(state);
  listeners.add(send);
  const ping = setInterval(() => res.write(': ping\n\n'), 25_000);
  req.on('close', () => { listeners.delete(send); clearInterval(ping); });
});

// Everything else under /api goes through the shared handler.
app.use('/api', express.raw({ type: '*/*', limit: '32kb' }), async (req, res) => {
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
  const hasBody = !['GET', 'HEAD'].includes(req.method) && Buffer.isBuffer(req.body) && req.body.length > 0;
  const r = await api(new Request(`http://local${req.originalUrl}`, { method: req.method, headers, body: hasBody ? req.body : undefined }), req.ip);
  res.status(r.status);
  r.headers.forEach((v, k) => res.setHeader(k, v));
  res.send(Buffer.from(await r.arrayBuffer()));
});

const dist = join(process.cwd(), 'dist');
if (existsSync(dist)) {
  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  app.get('/{*path}', (_req, res) => res.sendFile(join(dist, 'index.html')));
}

const port = Number(env.PORT ?? 8787);
app.listen(port, () => console.log(`[live-hub] API on http://localhost:${port} · ${VENUES.length} venues · ${SESSIONS.length} sessions`));

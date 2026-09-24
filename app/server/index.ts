import express, { type Request, type Response } from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { SESSIONS, VENUES, ampm, sportById, venueById, type UpdateType, type VenueId } from '../shared/data.ts';
import { UPDATE_TYPES, isValidTimeZone } from '../shared/live.ts';
import { isAdmin, login, logout, requireAdmin } from './auth.ts';
import { store } from './store.ts';

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '32kb' }));

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const bad = (res: Response, error: string) => res.status(400).json({ error });

// ---------- public ----------

app.get('/api/state', (_req, res) => {
  res.set('Cache-Control', 'no-store').json(store.get());
});

app.get('/api/stream', (req, res) => {
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  res.flushHeaders();
  const send = (s: unknown) => res.write(`event: state\ndata: ${JSON.stringify(s)}\n\n`);
  send(store.get());
  const off = store.subscribe(send);
  const ping = setInterval(() => res.write(': ping\n\n'), 25_000);
  req.on('close', () => { off(); clearInterval(ping); });
});

// ---------- event control ----------

app.post('/api/admin/login', login);
app.post('/api/admin/logout', logout);
app.get('/api/admin/me', (req, res) => res.json({ admin: isAdmin(req) }));

const admin = express.Router();
admin.use(requireAdmin);

admin.get('/log', (_req, res) => res.json(store.log()));

admin.put('/settings', (req, res) => {
  const eventName = str(req.body?.eventName, 60), publicUrl = str(req.body?.publicUrl, 120).replace(/^https?:\/\//, '');
  const timezone = str(req.body?.timezone, 60), startDate = str(req.body?.startDate, 10), place = str(req.body?.place, 60);
  if (!eventName || !publicUrl || !place) return bad(res, 'Event name, public URL and place are required.');
  if (!isValidTimeZone(timezone)) return bad(res, `Unknown time zone "${timezone}".`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return bad(res, 'Start date must be YYYY-MM-DD.');
  store.mutate('event settings saved', (s) => { Object.assign(s.settings, { eventName, publicUrl, timezone, startDate, place }); });
  res.json(store.get());
});

admin.put('/announcement', (req, res) => {
  const on = !!req.body?.on, title = str(req.body?.title, 120), body = str(req.body?.body, 400);
  if (on && !title) return bad(res, 'An announcement needs a title.');
  store.mutate(`announcement → ${on ? 'ON' : 'OFF'}`, (s) => { s.settings.announcement = { on, title, body }; });
  res.json(store.get());
});

const sessionName = (id: string) => {
  const s = SESSIONS.find((x) => x.id === id)!;
  return s.sport ? sportById(s.sport)!.name : s.title;
};

admin.post('/sessions/:id', (req: Request<{ id: string }>, res) => {
  const base = SESSIONS.find((s) => s.id === req.params.id);
  if (!base) return res.status(404).json({ error: 'No such session.' });
  const notify = req.body?.notify !== false;
  const cur = store.get().overrides[base.id] ?? {};
  const name = sessionName(base.id);
  const start = cur.start ?? base.start, end = cur.end ?? base.end, venue = cur.venue ?? base.venue;

  if (req.body?.revert) {
    store.mutate(`session ${base.id} reverted`, (s) => { delete s.overrides[base.id]; });
    return res.json(store.get());
  }
  const delta = Number(req.body?.delta ?? 0);
  const to = req.body?.venue as VenueId | undefined;
  if (!Number.isInteger(delta) || Math.abs(delta) > 240) return bad(res, 'Delay must be a whole number of minutes, up to 240.');
  if (to !== undefined && !venueById(to)) return bad(res, 'Unknown venue.');
  if (!delta && (!to || to === venue)) return bad(res, 'Nothing to change.');

  const next = { start: start + delta, end: end + delta, venue: to ?? venue, changed: true };
  const vFrom = venueById(venue)!, vTo = venueById(next.venue)!;
  const parts: string[] = [];
  if (delta) parts.push(`${delta > 0 ? '+' : ''}${delta} min`);
  if (next.venue !== venue) parts.push(`venue → ${next.venue}`);

  store.mutate(`session ${base.id} ${parts.join(', ')}`, (s) => {
    s.overrides[base.id] = next;
    if (!notify) return;
    const title = next.venue !== venue
      ? `${name} moved from ${vFrom.short} to ${vTo.name}` + (delta ? `, now ${ampm(next.start)}` : '')
      : `${name} at ${vFrom.short} now starts ${ampm(next.start)}`;
    const body = delta
      ? `${delta > 0 ? 'Delayed' : 'Brought forward'} by ${Math.abs(delta)} minutes. All other sessions run on time.`
      : `Same time, ${ampm(next.start)}. Follow signs to the ${vTo.name}.`;
    s.updates.unshift({ id: randomUUID(), type: 'Schedule change', at: Date.now(), title, body });
  });
  res.json(store.get());
});

admin.post('/updates', (req, res) => {
  const type = req.body?.type as UpdateType, title = str(req.body?.title, 140), body = str(req.body?.body, 600);
  if (!UPDATE_TYPES.includes(type)) return bad(res, 'Pick an update type.');
  if (!title) return bad(res, 'An update needs a title.');
  store.mutate(`update posted: ${type.toLowerCase()}`, (s) => { s.updates.unshift({ id: randomUUID(), type, at: Date.now(), title, body }); });
  res.json(store.get());
});

admin.delete('/updates/:id', (req: Request<{ id: string }>, res) => {
  if (!store.get().updates.some((u) => u.id === req.params.id)) return res.status(404).json({ error: 'No such update.' });
  store.mutate('update removed', (s) => { s.updates = s.updates.filter((u) => u.id !== req.params.id); });
  res.json(store.get());
});

admin.post('/reset', (_req, res) => { store.reset(); res.json(store.get()); });

app.use('/api/admin', admin);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// ---------- static site (production) ----------

const dist = join(process.cwd(), 'dist');
if (existsSync(dist)) {
  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  app.get('/{*path}', (_req, res) => res.sendFile(join(dist, 'index.html')));
}

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => console.log(`[live-hub] API on http://localhost:${port} · ${VENUES.length} venues · ${SESSIONS.length} sessions`));

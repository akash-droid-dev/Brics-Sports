// The Live Hub API as a plain Web `Request → Response` handler, so the same code runs on the
// Node server (server/index.ts) and as a Netlify Function (netlify/functions/api.ts).
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { DEFAULT_ANNOUNCEMENT, SAMPLE_UPDATES, SESSIONS, ampm, sportById, venueById, type UpdateType, type VenueId } from '../shared/data.ts';
import { UPDATE_TYPES, addDays, isValidTimeZone, zonedToEpoch, type LiveState, type LogEntry } from '../shared/live.ts';

export interface Doc { state: LiveState; log: LogEntry[]; seed?: number }

/** Bump when the programme or countries change shape, so stored overrides for old sessions are dropped. */
export const SEED_VERSION = 2;

/**
 * Where the live state lives. `load` returns a version tag: a string (write only if unchanged),
 * `null` (nothing stored yet: write only if still new) or `undefined` (no tag: write as is).
 * `save` throws `Conflict` when another write got there first.
 */
export type Tag = string | null | undefined;
export interface Store {
  load(): Promise<{ doc: Doc | null; tag?: Tag }>;
  save(doc: Doc, tag?: Tag): Promise<void>;
}
export class Conflict extends Error {}

export type Env = Record<string, string | undefined>;

export function seed(env: Env): Doc {
  const settings = {
    eventName: env.EVENT_NAME ?? 'BRICS Traditional & Indigenous Sports 2026',
    publicUrl: env.PUBLIC_URL ?? 'bricssports.netlify.app',
    timezone: env.EVENT_TIMEZONE ?? 'Asia/Kolkata',
    startDate: env.EVENT_START_DATE ?? '2026-10-12',
    place: 'Veer Savarkar Sports Complex, Ahmedabad',
    announcement: { on: true, ...DEFAULT_ANNOUNCEMENT },
  };
  const updates = SAMPLE_UPDATES.map((u) => ({
    id: u.id, type: u.type, title: u.title, body: u.body,
    at: zonedToEpoch(addDays(settings.startDate, u.day - 1), u.t, settings.timezone),
  })).sort((a, b) => b.at - a.at);
  return { state: { version: 1, settings, overrides: {}, updates }, log: [], seed: SEED_VERSION };
}

interface Options {
  store: Store;
  env: Env;
  /** Called after every successful change (the Node server pushes it to open pages). */
  onChange?: (s: LiveState) => void | Promise<void>;
  /** Extra headers for the public state response, e.g. CDN caching on Netlify. */
  stateHeaders?: Record<string, string>;
}

const COOKIE = 'lh_admin';
const TTL = 12 * 3600 * 1000;
const failures = new Map<string, { n: number; until: number }>();

const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers } });
const bad = (error: string, status = 400) => json({ error }, status);
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function createApi({ store, env, onChange, stateHeaders = {} }: Options) {
  const password = env.ADMIN_PASSWORD ?? (env.NODE_ENV === 'production' ? '' : 'admin');
  // Stateless hosts start fresh often, so the signing key must not be random per start.
  // Without SESSION_SECRET it derives from the password: changing the password signs everyone out.
  const secret = env.SESSION_SECRET ?? createHash('sha256').update('live-hub:' + password).digest('hex');
  const secure = env.NODE_ENV === 'production';

  const sign = (v: string) => createHmac('sha256', secret).update(v).digest('base64url');
  const safeEq = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };
  const isAdmin = (req: Request) => {
    const m = new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`).exec(req.headers.get('cookie') ?? '');
    if (!m) return false;
    const [exp, sig] = decodeURIComponent(m[1]).split('.');
    return !!exp && !!sig && safeEq(sig, sign(exp)) && Number(exp) > Date.now();
  };
  const cookie = (value: string, maxAge: number) =>
    `${COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${Math.floor(maxAge / 1000)}${secure ? '; Secure' : ''}`;

  async function current(): Promise<{ doc: Doc; tag?: Tag }> {
    const { doc, tag } = await store.load();
    if (doc && doc.seed === SEED_VERSION) return { doc, tag };
    // Nothing stored yet, or content from an older programme: start fresh, keeping the version rising.
    const fresh = seed(env);
    if (doc) fresh.state.version = doc.state.version + 1;
    return { doc: fresh, tag };
  }

  /** Read–modify–write with a retry if another admin saved in between. */
  async function mutate(logText: string, fn: (s: LiveState) => void | Response): Promise<Response> {
    for (let attempt = 0; attempt < 4; attempt++) {
      const { doc, tag } = await current();
      const early = fn(doc.state);
      if (early instanceof Response) return early;
      doc.state.version += 1;
      doc.log = [{ at: Date.now(), text: logText }, ...doc.log].slice(0, 100);
      try { await store.save(doc, tag); } catch (e) { if (e instanceof Conflict) continue; throw e; }
      await onChange?.(doc.state);
      return json(doc.state);
    }
    return bad('Someone else is publishing at the same moment. Try again.', 409);
  }

  const sessionName = (id: string) => {
    const s = SESSIONS.find((x) => x.id === id)!;
    return s.sport ? sportById(s.sport)!.name : s.title;
  };

  return async function handle(req: Request, ip = 'unknown'): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, '');
    const method = req.method;
    const body = async () => { try { return (await req.json()) as Record<string, unknown>; } catch { return {}; } };

    if (method === 'GET' && path === '/api/state') return json((await current()).doc.state, 200, stateHeaders);

    if (path === '/api/admin/me') return json({ admin: isAdmin(req), configured: !!password });

    if (method === 'POST' && path === '/api/admin/login') {
      if (!password) return bad('Admin password is not set on the server. Set ADMIN_PASSWORD and redeploy.', 503);
      const f = failures.get(ip);
      if (f && f.until > Date.now()) return bad('Too many attempts. Try again in a minute.', 429);
      const pw = str((await body()).password, 200);
      if (!safeEq(sign(pw), sign(password))) {
        const n = (f?.n ?? 0) + 1;
        failures.set(ip, { n, until: n >= 5 ? Date.now() + 60_000 : 0 });
        return bad('Wrong password.', 401);
      }
      failures.delete(ip);
      const exp = String(Date.now() + TTL);
      return json({ ok: true }, 200, { 'Set-Cookie': cookie(`${exp}.${sign(exp)}`, TTL) });
    }
    if (method === 'POST' && path === '/api/admin/logout') return json({ ok: true }, 200, { 'Set-Cookie': cookie('', 0) });

    if (!path.startsWith('/api/admin/')) return bad('Not found', 404);
    if (!isAdmin(req)) return bad('Sign in required.', 401);
    const route = path.slice('/api/admin'.length);

    if (method === 'GET' && route === '/log') return json((await current()).doc.log);

    if (method === 'PUT' && route === '/settings') {
      const b = await body();
      const eventName = str(b.eventName, 60), publicUrl = str(b.publicUrl, 120).replace(/^https?:\/\//, '');
      const timezone = str(b.timezone, 60), startDate = str(b.startDate, 10), place = str(b.place, 60);
      if (!eventName || !publicUrl || !place) return bad('Event name, public URL and place are required.');
      if (!isValidTimeZone(timezone)) return bad(`Unknown time zone "${timezone}".`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return bad('Start date must be YYYY-MM-DD.');
      return mutate('event settings saved', (s) => { Object.assign(s.settings, { eventName, publicUrl, timezone, startDate, place }); });
    }

    if (method === 'PUT' && route === '/announcement') {
      const b = await body();
      const on = !!b.on, title = str(b.title, 120), text = str(b.body, 400);
      if (on && !title) return bad('An announcement needs a title.');
      return mutate(`announcement → ${on ? 'ON' : 'OFF'}`, (s) => { s.settings.announcement = { on, title, body: text }; });
    }

    const sm = /^\/sessions\/([^/]+)$/.exec(route);
    if (method === 'POST' && sm) {
      const base = SESSIONS.find((s) => s.id === decodeURIComponent(sm[1]));
      if (!base) return bad('No such session.', 404);
      const b = await body();
      if (b.revert) return mutate(`session ${base.id} reverted`, (s) => { delete s.overrides[base.id]; });
      const delta = Number(b.delta ?? 0), to = b.venue as VenueId | undefined, notify = b.notify !== false;
      if (!Number.isInteger(delta) || Math.abs(delta) > 240) return bad('Delay must be a whole number of minutes, up to 240.');
      if (to !== undefined && !venueById(to)) return bad('Unknown venue.');
      const name = sessionName(base.id);
      const parts = [delta ? `${delta > 0 ? '+' : ''}${delta} min` : '', to ? `venue → ${to}` : ''].filter(Boolean).join(', ');
      return mutate(`session ${base.id} ${parts}`, (s) => {
        const cur = s.overrides[base.id] ?? {};
        const start = cur.start ?? base.start, end = cur.end ?? base.end, venue = cur.venue ?? base.venue;
        if (!delta && (!to || to === venue)) return bad('Nothing to change.');
        const next = { start: start + delta, end: end + delta, venue: to ?? venue, changed: true };
        s.overrides[base.id] = next;
        if (!notify) return;
        const vFrom = venueById(venue)!, vTo = venueById(next.venue)!;
        const title = next.venue !== venue
          ? `${name} moved from ${vFrom.short} to ${vTo.name}` + (delta ? `, now ${ampm(next.start)}` : '')
          : `${name} at ${vFrom.short} now starts ${ampm(next.start)}`;
        const text = delta
          ? `${delta > 0 ? 'Delayed' : 'Brought forward'} by ${Math.abs(delta)} minutes. All other sessions run on time.`
          : `Same time, ${ampm(next.start)}. Follow signs to the ${vTo.name}.`;
        s.updates.unshift({ id: randomUUID(), type: 'Schedule change', at: Date.now(), title, body: text });
      });
    }

    if (method === 'POST' && route === '/updates') {
      const b = await body();
      const type = b.type as UpdateType, title = str(b.title, 140), text = str(b.body, 600);
      if (!UPDATE_TYPES.includes(type)) return bad('Pick an update type.');
      if (!title) return bad('An update needs a title.');
      return mutate(`update posted: ${type.toLowerCase()}`, (s) => { s.updates.unshift({ id: randomUUID(), type, at: Date.now(), title, body: text }); });
    }

    const um = /^\/updates\/([^/]+)$/.exec(route);
    if (method === 'DELETE' && um) {
      const id = decodeURIComponent(um[1]);
      return mutate('update removed', (s) => {
        if (!s.updates.some((u) => u.id === id)) return bad('No such update.', 404);
        s.updates = s.updates.filter((u) => u.id !== id);
      });
    }

    if (method === 'POST' && route === '/reset') {
      const { doc: prev, tag } = await current();
      const doc = seed(env);
      doc.state.version = prev.state.version + 1; // pages ignore versions older than what they hold
      doc.log = [{ at: Date.now(), text: 'demo content reset' }];
      await store.save(doc, tag).catch(async (e) => { if (e instanceof Conflict) await store.save(doc); else throw e; });
      await onChange?.(doc.state);
      return json(doc.state);
    }

    return bad('Not found', 404);
  };
}

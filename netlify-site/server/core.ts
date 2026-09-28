// The Live Hub API as a plain Web `Request → Response` handler, so the same code runs on the
// Node server (server/index.ts) and as a Netlify Function (netlify/functions/api.ts).
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { COUNTRIES, DEFAULT_ANNOUNCEMENT, DEFAULT_VIDEOS, MASCOT, MASCOT_ABOUT, SITE_IMAGE_KEYS, SAMPLE_UPDATES, SESSIONS, SPORTS, SPORT_TYPES, ampm, venueById, type Country, type Sport, type SportType, type UpdateType, type VenueId } from '../shared/data.ts';
import { UPDATE_TYPES, addDays, isValidTimeZone, zonedToEpoch, type LiveState, type LogEntry } from '../shared/live.ts';
import { parseYouTube } from '../shared/youtube.ts';

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

/** Uploaded images (QR codes, flags, photos), served publicly from /api/media/<id>. */
export interface MediaStore {
  put(id: string, data: Uint8Array, type: string): Promise<void>;
  get(id: string): Promise<{ data: Uint8Array; type: string } | null>;
  remove(id: string): Promise<void>;
}

const MEDIA_TYPES: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };
const MEDIA_ID = /^[a-f0-9-]{36}\.(png|jpg|webp|gif)$/;
const MAX_UPLOAD = 4 * 1024 * 1024;

const defaultContent = () => structuredClone({ countries: COUNTRIES, sports: SPORTS });
const defaultMascot = () => ({ name: MASCOT.name, about: MASCOT_ABOUT, image: null });

/** Fill in sections added after a site was first deployed, without touching what admins changed. */
function upgrade(state: LiveState) {
  state.content ??= defaultContent();
  state.videos ??= structuredClone(DEFAULT_VIDEOS);
  if (state.liveVideo === undefined) state.liveVideo = state.videos[0]?.id ?? null;
  state.settings.qrImage ??= null;
  state.settings.mascot ??= defaultMascot();
  state.settings.images ??= {};
}

export type Env = Record<string, string | undefined>;

export function seed(env: Env): Doc {
  const settings = {
    eventName: env.EVENT_NAME ?? 'BRICS Traditional & Indigenous Sports 2026',
    publicUrl: env.PUBLIC_URL ?? 'timely-bubblegum-1f249e.netlify.app',
    timezone: env.EVENT_TIMEZONE ?? 'Asia/Kolkata',
    startDate: env.EVENT_START_DATE ?? '2026-10-12',
    place: 'Veer Savarkar Sports Complex, Ahmedabad',
    announcement: { on: true, ...DEFAULT_ANNOUNCEMENT },
  };
  const updates = SAMPLE_UPDATES.map((u) => ({
    id: u.id, type: u.type, title: u.title, body: u.body,
    at: zonedToEpoch(addDays(settings.startDate, u.day - 1), u.t, settings.timezone),
  })).sort((a, b) => b.at - a.at);
  return { state: { version: 1, settings: { ...settings, qrImage: null, mascot: defaultMascot(), images: {} }, overrides: {}, updates, content: defaultContent(), videos: structuredClone(DEFAULT_VIDEOS), liveVideo: DEFAULT_VIDEOS[0]?.id ?? null }, log: [], seed: SEED_VERSION };
}

interface Options {
  store: Store;
  media: MediaStore;
  env: Env;
  /** Called after every successful change (the Node server pushes it to open pages). */
  onChange?: (s: LiveState) => void | Promise<void>;
  /** Extra headers for the public state response, e.g. CDN caching on Netlify. */
  stateHeaders?: Record<string, string>;
}

const COOKIE = 'lh_admin';
/**
 * Other sites may call the API (the GitHub Pages copy of the site does). Public data needs no
 * credentials, and admin calls from there carry a bearer token instead of the cookie, so a
 * wildcard origin is safe: without a valid token the admin routes still refuse.
 */
export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};
const TTL = 12 * 3600 * 1000;
const failures = new Map<string, { n: number; until: number }>();

const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers } });
const bad = (error: string, status = 400) => json({ error }, status);
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
/** An image reference admins may store: an uploaded file or an https link, safe to place in CSS url("…"). */
const imageRef = (v: unknown): string | null | false => {
  const u = str(v, 1000);
  if (!u) return null;
  if (/["'\\\s<>]/.test(u)) return false;
  if (u.startsWith('/api/media/') && MEDIA_ID.test(u.slice(11))) return u;
  try { return new URL(u).protocol === 'https:' ? u : false; } catch { return false; }
};
const mediaIdOf = (u: string | null | undefined) => (u && u.startsWith('/api/media/') ? u.slice(11) : null);
const slug = (name: string) => name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'item';

export function createApi({ store, media, env, onChange, stateHeaders = {} }: Options) {
  const password = env.ADMIN_PASSWORD ?? (env.NODE_ENV === 'production' ? '' : 'admin');
  // Stateless hosts start fresh often, so the signing key must not be random per start.
  // Without SESSION_SECRET it derives from the password: changing the password signs everyone out.
  const secret = env.SESSION_SECRET ?? createHash('sha256').update('live-hub:' + password).digest('hex');
  const secure = env.NODE_ENV === 'production';

  const sign = (v: string) => createHmac('sha256', secret).update(v).digest('base64url');
  const safeEq = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };
  const validToken = (t: string) => { const [exp, sig] = t.split('.'); return !!exp && !!sig && safeEq(sig, sign(exp)) && Number(exp) > Date.now(); };
  const isAdmin = (req: Request) => {
    const bearer = /^Bearer\s+(\S+)$/.exec(req.headers.get('authorization') ?? '');
    if (bearer) return validToken(bearer[1]);
    const m = new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`).exec(req.headers.get('cookie') ?? '');
    return !!m && validToken(decodeURIComponent(m[1]));
  };
  const cookie = (value: string, maxAge: number) =>
    `${COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${Math.floor(maxAge / 1000)}${secure ? '; Secure' : ''}`;

  async function current(): Promise<{ doc: Doc; tag?: Tag }> {
    const { doc, tag } = await store.load();
    if (doc && doc.seed === SEED_VERSION) { upgrade(doc.state); return { doc, tag }; }
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

  const sessionName = (state: LiveState, id: string) => {
    const x = SESSIONS.find((y) => y.id === id)!;
    if (!x.country) return x.title;
    const c = state.content.countries.find((y) => y.id === x.country);
    return `${c ? c.name : `Country ${x.slot}`}: Demonstration Games`;
  };

  /** Run a change, then delete uploaded files it replaced or orphaned. */
  async function mutateAndClean(logText: string, fn: (s: LiveState, orphan: (u: string | null | undefined) => void) => void | Response) {
    let orphans: string[] = [];
    let after: LiveState | null = null;
    const res = await mutate(logText, (s) => { orphans = []; after = s; return fn(s, (u) => { const id = mediaIdOf(u); if (id) orphans.push(id); }); });
    // Only delete files nothing else still points at (the same upload can be reused elsewhere).
    const still = JSON.stringify(after);
    if (res.ok) await Promise.all(orphans.filter((id) => !still.includes(id)).map((id) => media.remove(id).catch(() => {})));
    return res;
  }

  async function handle(req: Request, ip = 'unknown'): Promise<Response> {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    const res = await route(req, ip);
    for (const [k, v] of Object.entries(CORS)) res.headers.set(k, v);
    return res;
  }

  async function route(req: Request, ip: string): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, '');
    const method = req.method;
    const body = async () => { try { return (await req.json()) as Record<string, unknown>; } catch { return {}; } };

    if (method === 'GET' && path === '/api/state') return json((await current()).doc.state, 200, stateHeaders);

    const mm = /^\/api\/media\/([^/]+)$/.exec(path);
    if (method === 'GET' && mm) {
      const f = MEDIA_ID.test(mm[1]) ? await media.get(mm[1]) : null;
      if (!f) return new Response('Not found', { status: 404 });
      return new Response(Buffer.from(f.data) as unknown as BodyInit, { headers: { 'Content-Type': f.type, 'Cache-Control': 'public, max-age=31536000, immutable', 'Netlify-CDN-Cache-Control': 'public, max-age=31536000, immutable, durable', 'X-Content-Type-Options': 'nosniff' } });
    }

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
      const token = `${exp}.${sign(exp)}`;
      return json({ ok: true, token }, 200, { 'Set-Cookie': cookie(token, TTL) });
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
      const parts = [delta ? `${delta > 0 ? '+' : ''}${delta} min` : '', to ? `venue → ${to}` : ''].filter(Boolean).join(', ');
      return mutate(`session ${base.id} ${parts}`, (s) => {
        const cur = s.overrides[base.id] ?? {};
        const start = cur.start ?? base.start, end = cur.end ?? base.end, venue = cur.venue ?? base.venue;
        if (!delta && (!to || to === venue)) return bad('Nothing to change.');
        const next = { start: start + delta, end: end + delta, venue: to ?? venue, changed: true };
        const name = sessionName(s, base.id);
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


    // ---------- uploads ----------
    if (method === 'POST' && route === '/media') {
      const m = /^data:(image\/[a-z]+);base64,([A-Za-z0-9+/=]+)$/.exec(str((await body()).data, MAX_UPLOAD * 1.4));
      if (!m || !MEDIA_TYPES[m[1]]) return bad('Upload a PNG, JPEG, WebP or GIF image.');
      const data = new Uint8Array(Buffer.from(m[2], 'base64'));
      if (data.length > MAX_UPLOAD) return bad('That image is too large (4 MB max).');
      const id = `${randomUUID()}.${MEDIA_TYPES[m[1]]}`;
      await media.put(id, data, m[1]);
      return json({ url: `/api/media/${id}` });
    }

    // ---------- QR code ----------
    if (method === 'PUT' && route === '/qr') {
      const image = imageRef((await body()).image);
      if (image === false) return bad('That image link is not valid.');
      return mutateAndClean(image ? 'QR image uploaded' : 'QR image removed (using generated QR)', (s, orphan) => {
        if (s.settings.qrImage !== image) orphan(s.settings.qrImage);
        s.settings.qrImage = image;
      });
    }

    // ---------- live video library ----------
    if (method === 'POST' && route === '/videos') {
      const b = await body();
      const title = str(b.title, 120), url = str(b.url, 500);
      if (!title) return bad('Give the video a title.');
      if (!parseYouTube(url)) return bad('Paste a YouTube link (a video, a live stream, or youtube.com/channel/…/live).');
      return mutate(`video added: ${title}`, (s) => {
        const id = 'v-' + randomUUID().slice(0, 8);
        s.videos.push({ id, title, url });
        if (b.makeLive || !s.liveVideo) s.liveVideo = id;
      });
    }
    const vm = /^\/videos\/([^/]+)$/.exec(route);
    if (vm && (method === 'PUT' || method === 'DELETE')) {
      const id = decodeURIComponent(vm[1]);
      if (method === 'DELETE') return mutate('video removed', (s) => {
        if (!s.videos.some((v) => v.id === id)) return bad('No such video.', 404);
        s.videos = s.videos.filter((v) => v.id !== id);
        if (s.liveVideo === id) s.liveVideo = null;
      });
      const b = await body();
      const title = str(b.title, 120), url = str(b.url, 500);
      if (!title || !parseYouTube(url)) return bad('A title and a valid YouTube link are required.');
      return mutate(`video edited: ${title}`, (s) => {
        const v = s.videos.find((x) => x.id === id);
        if (!v) return bad('No such video.', 404);
        Object.assign(v, { title, url });
      });
    }
    if (method === 'PUT' && route === '/live-video') {
      const id = (await body()).id;
      return mutate(id ? 'live video changed' : 'live video turned off', (s) => {
        if (id && !s.videos.some((v) => v.id === id)) return bad('No such video.', 404);
        s.liveVideo = typeof id === 'string' ? id : null;
      });
    }

    // ---------- countries ----------
    const cm = /^\/countries\/([^/]+)$/.exec(route);
    if (cm && method === 'PUT') {
      const b = await body();
      const name = str(b.name, 60), code = str(b.code, 5).toUpperCase(), iso2 = str(b.iso2, 2).toLowerCase(), story = str(b.story, 500);
      const color = /^#[0-9a-fA-F]{6}$/.test(str(b.color, 7)) ? str(b.color, 7) : '#173F73';
      const image = imageRef(b.image), flag = imageRef(b.flag);
      if (!name) return bad('A country needs a name.');
      if (iso2 && !/^[a-z]{2}$/.test(iso2)) return bad('The flag code must be two letters, e.g. "in".');
      if (image === false || flag === false) return bad('That image link is not valid.');
      const key = decodeURIComponent(cm[1]);
      return mutateAndClean(`${key === 'new' ? 'country added' : 'country edited'}: ${name}`, (s, orphan) => {
        const list = s.content.countries;
        let c = key === 'new' ? undefined : list.find((x) => x.id === key);
        if (key !== 'new' && !c) return bad('No such country.', 404);
        if (!c) {
          let id = slug(name); while (list.some((x) => x.id === id)) id += '-' + randomUUID().slice(0, 4);
          c = { id, name, code, iso2, color, story } as Country; list.push(c);
        }
        if (c.image !== image) orphan(c.image);
        if (c.flag !== flag) orphan(c.flag);
        Object.assign(c, { name, code: code || name.slice(0, 3).toUpperCase(), iso2, color, story, image, flag, inscribed: !!b.inscribed });
      });
    }
    if (cm && method === 'DELETE') {
      const id = decodeURIComponent(cm[1]);
      return mutateAndClean('country removed', (s, orphan) => {
        const c = s.content.countries.find((x) => x.id === id);
        if (!c) return bad('No such country.', 404);
        orphan(c.image); orphan(c.flag);
        s.content.sports.filter((x) => x.c === id).forEach((x) => orphan(x.photo));
        s.content.countries = s.content.countries.filter((x) => x.id !== id);
        s.content.sports = s.content.sports.filter((x) => x.c !== id);
      });
    }

    // ---------- sports ----------
    const sp = /^\/sports\/([^/]+)$/.exec(route);
    if (sp && method === 'PUT') {
      const b = await body();
      const name = str(b.name, 60), c = str(b.c, 60), type = str(b.type, 20) as SportType, about = str(b.about, 800);
      const photo = imageRef(b.photo), photoCredit = str(b.photoCredit, 160), photoSource = imageRef(b.photoSource);
      if (!name) return bad('A sport needs a name.');
      if (!SPORT_TYPES.includes(type)) return bad('Pick a sport type.');
      if (photo === false) return bad('That photo link is not valid.');
      const key = decodeURIComponent(sp[1]);
      return mutateAndClean(`${key === 'new' ? 'sport added' : 'sport edited'}: ${name}`, (s, orphan) => {
        if (!s.content.countries.some((x) => x.id === c)) return bad('Pick the country this sport belongs to.');
        const list = s.content.sports;
        let x = key === 'new' ? undefined : list.find((y) => y.id === key);
        if (key !== 'new' && !x) return bad('No such sport.', 404);
        if (!x) {
          let id = slug(name); while (list.some((y) => y.id === id)) id += '-' + randomUUID().slice(0, 4);
          x = { id, c, name, type, about, photo: null } as Sport; list.push(x);
        }
        if (x.photo !== photo) orphan(x.photo);
        Object.assign(x, { name, c, type, about, photo, photoCredit: photo ? photoCredit : '', photoSource: photo && photoSource ? photoSource : '' });
      });
    }
    if (sp && method === 'DELETE') {
      const id = decodeURIComponent(sp[1]);
      return mutateAndClean('sport removed', (s, orphan) => {
        const x = s.content.sports.find((y) => y.id === id);
        if (!x) return bad('No such sport.', 404);
        orphan(x.photo);
        s.content.sports = s.content.sports.filter((y) => y.id !== id);
      });
    }

    // ---------- mascot ----------
    if (method === 'PUT' && route === '/mascot') {
      const b = await body();
      const name = str(b.name, 40), about = str(b.about, 1200), image = imageRef(b.image);
      if (!name) return bad('The mascot needs a name.');
      if (image === false) return bad('That image link is not valid.');
      return mutateAndClean('mascot updated', (s, orphan) => {
        const prev = s.settings.mascot ?? defaultMascot();
        if (prev.image !== image) orphan(prev.image);
        s.settings.mascot = { name, about, image };
      });
    }

    // ---------- site artwork (banner, mascots, background, logo) ----------
    if (method === 'PUT' && route === '/images') {
      const b = await body();
      const next: Record<string, string | null> = {};
      for (const k of SITE_IMAGE_KEYS) {
        const v = imageRef(b[k]);
        if (v === false) return bad('One of the image links is not valid.');
        next[k] = v;
      }
      return mutateAndClean('site images updated', (s, orphan) => {
        const prev = s.settings.images ?? {};
        for (const k of SITE_IMAGE_KEYS) if ((prev[k] ?? null) !== next[k]) orphan(prev[k]);
        s.settings.images = next;
      });
    }

    if (method === 'POST' && route === '/reset') {
      const { doc: prev, tag } = await current();
      const doc = seed(env);
      doc.state.version = prev.state.version + 1; // pages ignore versions older than what they hold
      // Keep what admins curated: countries, sports, the video library, an uploaded QR, the mascot and site artwork.
      Object.assign(doc.state, { content: prev.state.content, videos: prev.state.videos, liveVideo: prev.state.liveVideo });
      doc.state.settings.qrImage = prev.state.settings.qrImage ?? null;
      doc.state.settings.mascot = prev.state.settings.mascot ?? defaultMascot();
      doc.state.settings.images = prev.state.settings.images ?? {};
      doc.log = [{ at: Date.now(), text: 'demo content reset' }];
      await store.save(doc, tag).catch(async (e) => { if (e instanceof Conflict) await store.save(doc); else throw e; });
      await onChange?.(doc.state);
      return json(doc.state);
    }

    return bad('Not found', 404);
  }
  return handle;
}

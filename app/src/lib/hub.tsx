import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  COUNTRIES, EVENT_DAYS, SESSIONS, SPORTS, VENUES, countryById, hhmm, sportById, venueById,
  type Country, type Session, type Sport, type VenueId,
} from '../../shared/data.ts';
import { dayDateLabel, eventClock, zonedToEpoch, type EventClock, type LiveState, type LiveUpdate } from '../../shared/live.ts';

// ---------- live state (Server-Sent Events) ----------

export function useLiveState() {
  const [state, setState] = useState<LiveState | null>(null);
  const [online, setOnline] = useState(true);
  useEffect(() => {
    let es: EventSource | null = null;
    let fallback: ReturnType<typeof setInterval> | undefined;
    const apply = (s: LiveState) => setState((prev) => (prev && prev.version > s.version ? prev : s));
    const poll = () => fetch('/api/state').then((r) => r.json()).then(apply).catch(() => {});
    if ('EventSource' in window) {
      es = new EventSource('/api/stream');
      es.addEventListener('state', (e) => { apply(JSON.parse((e as MessageEvent).data)); setOnline(true); });
      es.onerror = () => setOnline(false);
    } else {
      poll();
      fallback = setInterval(poll, 15_000);
    }
    return () => { es?.close(); clearInterval(fallback); };
  }, []);
  return { state, setState, online };
}

// ---------- clock ----------

/** `?at=2026-10-16T14:42` previews the site at that event-local time; the clock keeps running from there. */
function previewOffset(tz: string) {
  const at = new URLSearchParams(location.search).get('at');
  const m = at && /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(at);
  if (!m) return 0;
  return zonedToEpoch(m[1], Number(m[2]) * 60 + Number(m[3]), tz) - Date.now();
}

export function useNow(tz: string | undefined) {
  const offset = useMemo(() => (tz ? previewOffset(tz) : 0), [tz]);
  const [now, setNow] = useState(() => Date.now() + offset);
  useEffect(() => {
    setNow(Date.now() + offset);
    const iv = setInterval(() => setNow(Date.now() + offset), 1000);
    return () => clearInterval(iv);
  }, [offset]);
  return now;
}

// ---------- view models ----------

export type Status = 'live' | 'soon' | 'done' | 'later';

export interface SessionView {
  id: string; day: number; start: number; end: number; venue: VenueId; st: Status;
  sp: Sport | null; c: Country;
  startT: string; time: string; dayShort: string;
  venueName: string; venueShort: string; countryName: string; color: string;
  title: string; kind: string; bg: string; video?: string;
  isLive: boolean; stLabel: string; stBg: string; stFg: string; op: number;
  border: string; pct: string; left: string; changed: boolean;
  href: string; venueHref: string;
}

const shade = (hex: string, f: number) => {
  if (!hex.startsWith('#')) return hex;
  const n = parseInt(hex.slice(1), 16), m = (v: number) => Math.round(v * f);
  return `rgb(${m((n >> 16) & 255)},${m((n >> 8) & 255)},${m(n & 255)})`;
};
export const artBg = (photo: string | null | undefined, color: string) =>
  photo ? `url("${photo}") center/cover no-repeat, ${color}` : `repeating-linear-gradient(135deg, ${color} 0 16px, ${shade(color, 0.82)} 16px 32px)`;
export { shade };
export const countryPhoto = (c: Country) => SPORTS.find((x) => x.c === c.id && x.photo)?.photo ?? null;

function sessionView(s: Session, state: LiveState, clock: EventClock): SessionView {
  const o = state.overrides[s.id] ?? {};
  const start = o.start ?? s.start, end = o.end ?? s.end, venue = o.venue ?? s.venue;
  const c = countryById(s.country), sp = s.sport ? sportById(s.sport)! : null, v = venueById(venue)!;
  const now = clock.minutes;
  let st: Status;
  if (clock.phase === 'before') st = 'later';
  else if (clock.phase === 'after' || s.day < clock.day) st = 'done';
  else if (s.day > clock.day) st = 'later';
  else st = now >= end ? 'done' : now >= start ? 'live' : 'soon';
  const mins = Math.ceil(start - now);
  const dayLabel = 'Day ' + s.day;
  const stLabel = st === 'live' ? 'LIVE' : st === 'done' ? 'Ended' : st === 'soon' ? (mins <= 90 ? 'in ' + Math.max(1, mins) + ' min' : 'Later today') : dayLabel;
  const colors = { live: ['#E1302A', '#fff'], soon: ['#16120E', '#fff'], done: ['rgba(22,18,14,.07)', '#6A6056'], later: ['rgba(22,18,14,.07)', '#16120E'] }[st];
  const pct = st === 'live' ? Math.min(100, ((now - start) / (end - start)) * 100) : 0;
  const leftS = Math.max(0, Math.round((end - now) * 60));
  return {
    id: s.id, day: s.day, start, end, venue, st, sp, c,
    startT: hhmm(start), time: hhmm(start) + '–' + hhmm(end), dayShort: dayLabel,
    venueName: v.name, venueShort: v.short, countryName: c.name, color: c.color,
    title: sp ? sp.name : c.name + ' showcase', kind: s.kind,
    bg: artBg(sp ? sp.photo : countryPhoto(c), c.color), video: sp?.video,
    isLive: st === 'live', stLabel, stBg: colors[0], stFg: colors[1], op: st === 'done' ? 0.5 : 1,
    border: st === 'live' ? '1.5px solid #E1302A' : o.changed ? '1.5px solid #F3A53A' : '1px solid rgba(22,18,14,.08)',
    pct: pct.toFixed(2) + '%', left: Math.floor(leftS / 60) + ':' + String(leftS % 60).padStart(2, '0'), changed: !!o.changed,
    href: sp ? `/sports/${sp.id}` : `/countries/${c.id}`, venueHref: `/map/${venue}`,
  };
}

export const VENUE_ORDER: VenueId[] = ['fop1', 'fop2', 'fop3', 'main', 'tsz', 'cz'];
const vo = (s: SessionView) => VENUE_ORDER.indexOf(s.venue);

export interface SportView {
  id: string; c: string; name: string; type: string; color: string; countryName: string; bg: string;
  noPhoto: boolean; initials: string; isLive: boolean; nextLabel: string; photo: string | null;
}

function sportView(sp: Sport, today: SessionView[]): SportView {
  const c = countryById(sp.c);
  const mine = today.filter((x) => x.sp === sp);
  const live = mine.find((x) => x.isLive), nxt = mine.find((x) => x.st === 'soon' || x.st === 'later');
  return {
    id: sp.id, c: sp.c, name: sp.name, type: sp.type, color: c.color, countryName: c.name, bg: artBg(sp.photo, c.color), photo: sp.photo,
    noPhoto: !sp.photo, initials: sp.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(), isLive: !!live,
    nextLabel: live ? '● Live now at ' + live.venueName : nxt ? (nxt.st === 'later' ? nxt.dayShort + ' ' : 'Next ') + nxt.startT + ' · ' + nxt.venueName : 'No more sessions today',
  };
}

export interface UpdateView extends LiveUpdate { ago: string; stamp: string; dot: string; tagInk: string }
export const TAG_COLORS: Record<string, [string, string]> = {
  'Schedule change': ['#F3A53A', '#8A4B00'], Notice: ['#2B6CB0', '#1F4F84'], Highlight: ['#E1302A', '#B3221D'], Facility: ['#2F8F46', '#236B34'],
};

function buildHub(state: LiveState, now: number) {
  const clock = eventClock(now, state.settings, EVENT_DAYS);
  const all = SESSIONS.map((s) => sessionView(s, state, clock));
  const today = all.filter((s) => s.day === clock.day);
  const live = today.filter((s) => s.isLive).sort((a, b) => vo(a) - vo(b));
  const upcoming = today.filter((s) => s.st === 'soon' || s.st === 'later').sort((a, b) => a.start - b.start || vo(a) - vo(b));
  const sports = SPORTS.map((sp) => sportView(sp, today));
  const hm = (ms: number) => { const p = new Intl.DateTimeFormat('en-GB', { timeZone: state.settings.timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(ms); return p; };
  const ago = (at: number) => { const d = Math.round((now - at) / 60000); return d < 1 ? 'just now' : d < 60 ? d + ' min ago' : d < 1440 ? Math.floor(d / 60) + ' h ago' : Math.floor(d / 1440) + ' d ago'; };
  const updates: UpdateView[] = state.updates
    .filter((u) => u.at <= now)
    .sort((a, b) => b.at - a.at)
    .map((u) => ({ ...u, ago: ago(u.at), stamp: hm(u.at), dot: TAG_COLORS[u.type][0], tagInk: TAG_COLORS[u.type][1] }));
  const days = Array.from({ length: EVENT_DAYS }, (_, i) => ({ d: i + 1, label: 'Day ' + (i + 1), date: dayDateLabel(state.settings.startDate, i + 1) }));
  return { state, settings: state.settings, clock, all, today, live, upcoming, upNext: upcoming.slice(0, 4), sports, updates, days };
}

export type Hub = ReturnType<typeof buildHub>;

const HubCtx = createContext<Hub | null>(null);
export const useHub = () => useContext(HubCtx)!;

export function HubProvider({ state, children }: { state: LiveState; children: ReactNode }) {
  const now = useNow(state.settings.timezone);
  const hub = useMemo(() => buildHub(state, now), [state, now]);
  return <HubCtx.Provider value={hub}>{children}</HubCtx.Provider>;
}

// ---------- misc hooks ----------

export function useStored<T>(key: string, init: T) {
  const [v, setV] = useState<T>(() => {
    try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : init; } catch { return init; }
  });
  const set = (next: T) => { setV(next); try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* private mode */ } };
  return [v, set] as const;
}

export { COUNTRIES, SPORTS, VENUES };

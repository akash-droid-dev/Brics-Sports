// Live state shared by the server (source of truth) and the browser (read-only mirror).
import type { Country, Sport, UpdateType, VenueId } from './data.ts';

export interface Announcement { on: boolean; title: string; body: string }

export interface Settings {
  eventName: string;
  /** Printed on the QR and footer, without protocol. */
  publicUrl: string;
  /** IANA zone the programme times are written in, e.g. "Asia/Kolkata". */
  timezone: string;
  /** Local date of Day 1, YYYY-MM-DD. Days 2 and 3 follow consecutively. */
  startDate: string;
  place: string;
  announcement: Announcement;
  /** Uploaded QR image (/api/media/…); null shows the QR generated from publicUrl. */
  qrImage?: string | null;
}

export interface Override { start?: number; end?: number; venue?: VenueId; changed?: boolean }

export interface LiveUpdate { id: string; type: UpdateType; at: number; title: string; body: string }

/** A video in the admin's library, shown in the Live Now card when chosen. */
export interface LiveVideo { id: string; title: string; url: string }

/** Countries and sports as edited in the admin (seeded from shared/data.ts). */
export interface Content { countries: Country[]; sports: Sport[] }

export interface LiveState {
  version: number;
  settings: Settings;
  overrides: Record<string, Override>;
  updates: LiveUpdate[];
  content: Content;
  videos: LiveVideo[];
  /** Id of the video playing in the Live Now card, or null for none. */
  liveVideo: string | null;
}

export interface LogEntry { at: number; text: string }

export const UPDATE_TYPES: UpdateType[] = ['Schedule change', 'Notice', 'Highlight', 'Facility'];

// ---------- time zone helpers ----------

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function fmt(tz: string) {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    fmtCache.set(tz, f);
  }
  return f;
}

export function isValidTimeZone(tz: string) {
  try { fmt(tz); return true; } catch { return false; }
}

/** Wall-clock parts of an instant in the given zone. */
export function zonedParts(ms: number, tz: string) {
  const p: Record<string, number> = {};
  for (const x of fmt(tz).formatToParts(new Date(ms))) if (x.type !== 'literal') p[x.type] = Number(x.value);
  return { y: p.year, mo: p.month, d: p.day, h: p.hour, mi: p.minute, s: p.second };
}

/** Epoch ms for a wall-clock time (minutes after midnight) on a local date in the zone. */
export function zonedToEpoch(date: string, minutes: number, tz: string) {
  const [y, mo, d] = date.split('-').map(Number);
  const guess = Date.UTC(y, mo - 1, d, 0, minutes);
  // Two passes settle the offset, including across DST changes.
  let t = guess;
  for (let i = 0; i < 2; i++) {
    const p = zonedParts(t, tz);
    const asUtc = Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s);
    t += guess - asUtc;
  }
  return t;
}

const dayDiff = (a: string, b: string) => {
  const [ay, am, ad] = a.split('-').map(Number), [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(ay, am - 1, ad) - Date.UTC(by, bm - 1, bd)) / 86400000);
};

export function addDays(date: string, n: number) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export type Phase = 'before' | 'during' | 'after';

export interface EventClock {
  phase: Phase;
  /** Event day 1..3 the site should present as "today". */
  day: number;
  /** Minutes after local midnight, fractional. */
  minutes: number;
  seconds: number;
  /** Whole days until Day 1 when phase is 'before'. */
  daysToGo: number;
}

export function eventClock(ms: number, s: Pick<Settings, 'timezone' | 'startDate'>, days: number): EventClock {
  const p = zonedParts(ms, s.timezone);
  const today = `${p.y}-${String(p.mo).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;
  const idx = dayDiff(today, s.startDate) + 1;
  const minutes = p.h * 60 + p.mi + p.s / 60;
  if (idx < 1) return { phase: 'before', day: 1, minutes, seconds: p.s, daysToGo: 1 - idx };
  if (idx > days) return { phase: 'after', day: days, minutes, seconds: p.s, daysToGo: 0 };
  return { phase: 'during', day: idx, minutes, seconds: p.s, daysToGo: 0 };
}

export function dayDateLabel(startDate: string, day: number) {
  const [y, m, d] = addDays(startDate, day - 1).split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(Date.UTC(y, m - 1, d)));
}

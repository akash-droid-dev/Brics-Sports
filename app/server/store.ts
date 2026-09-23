// JSON-file store for the live state. One small document, written atomically.
// Suitable for a single server instance; swap for a database if you run several.
import { mkdirSync, readFileSync, renameSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DEFAULT_ANNOUNCEMENT, SAMPLE_UPDATES } from '../shared/data.ts';
import { addDays, zonedToEpoch, type LiveState, type LogEntry } from '../shared/live.ts';

interface Doc { state: LiveState; log: LogEntry[] }

const FILE = process.env.DATA_FILE ?? join(process.cwd(), 'data', 'live-state.json');

function seed(): Doc {
  const settings = {
    eventName: process.env.EVENT_NAME ?? 'BRICS SPORTS',
    publicUrl: process.env.PUBLIC_URL ?? 'traditionalsports.live',
    timezone: process.env.EVENT_TIMEZONE ?? 'UTC',
    startDate: process.env.EVENT_START_DATE ?? '2026-10-15',
    place: 'Event Grounds',
    announcement: { on: true, ...DEFAULT_ANNOUNCEMENT },
  };
  const updates = SAMPLE_UPDATES.map((u) => ({
    id: u.id, type: u.type, title: u.title, body: u.body,
    at: zonedToEpoch(addDays(settings.startDate, u.day - 1), u.t, settings.timezone),
  })).sort((a, b) => b.at - a.at);
  return { state: { version: 1, settings, overrides: {}, updates }, log: [] };
}

let doc: Doc;
if (existsSync(FILE)) {
  doc = JSON.parse(readFileSync(FILE, 'utf8')) as Doc;
} else {
  doc = seed();
  persist();
}

function persist() {
  mkdirSync(dirname(FILE), { recursive: true });
  const tmp = FILE + '.tmp';
  writeFileSync(tmp, JSON.stringify(doc, null, 2));
  renameSync(tmp, FILE);
}

type Listener = (s: LiveState) => void;
const listeners = new Set<Listener>();

export const store = {
  get: () => doc.state,
  log: () => doc.log,
  subscribe(fn: Listener) { listeners.add(fn); return () => listeners.delete(fn); },
  /** Apply a change, record it in the publish log and push it to every open page. */
  mutate(logText: string, fn: (s: LiveState) => void) {
    fn(doc.state);
    doc.state.version += 1;
    doc.log = [{ at: Date.now(), text: logText }, ...doc.log].slice(0, 100);
    persist();
    for (const l of listeners) l(doc.state);
  },
  reset() {
    doc = seed();
    doc.log = [{ at: Date.now(), text: 'demo content reset' }];
    persist();
    for (const l of listeners) l(doc.state);
  },
};

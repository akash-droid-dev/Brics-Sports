import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { VENUES, ampm, type UpdateType, type VenueId } from '../../shared/data.ts';
import { UPDATE_TYPES, type LiveState, type LogEntry } from '../../shared/live.ts';
import { HubProvider, TAG_COLORS, useHub } from '../lib/hub.tsx';
import { CountriesCard, QrCard, SportsCard, VideosCard } from './Manage.tsx';

const Emblem = ({ size }: { size: number }) => <img src="/brand/logo-mark.png" alt="" width={size} height={size} style={{ display: 'block' }} />;
import './admin.css';

export async function api<T = LiveState>(method: string, path: string, body?: unknown): Promise<T> {
  const r = await fetch('/api/admin' + path, { method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined, credentials: 'same-origin' });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(data.error ?? `Request failed (${r.status})`), { status: r.status });
  return data as T;
}

export type Ctx = { run: (label: string, fn: () => Promise<LiveState>) => Promise<boolean>; busy: string | null };

export default function Admin({ state, onState }: { state: LiveState; onState: (s: LiveState) => void }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => { document.title = 'Event control · Live Hub'; api<{ admin: boolean }>('GET', '/me').then((r) => setAuthed(r.admin)).catch(() => setAuthed(false)); }, []);
  if (authed === null) return <div className="adm adm-center"><Emblem size={56} /></div>;
  if (!authed) return <Login onDone={() => setAuthed(true)} eventName={state.settings.eventName} />;
  return (
    <HubProvider state={state}>
      <Console onState={onState} onSignOut={() => setAuthed(false)} />
    </HubProvider>
  );
}

function Login({ onDone, eventName }: { onDone: () => void; eventName: string }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await api('POST', '/login', { password: pw }); onDone(); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  };
  return (
    <div className="adm adm-center">
      <form className="adm-login" onSubmit={submit}>
        <Emblem size={56} />
        <div className="adm-kicker">Event control · {eventName}</div>
        <h1 className="adm-h1">Sign in</h1>
        <p className="adm-muted">Changes you publish here reach every visitor instantly. The printed QR never changes.</p>
        <label className="adm-field"><span>Password</span><input type="password" autoFocus autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} /></label>
        {err && <div className="adm-err" role="alert">{err}</div>}
        <button className="adm-btn primary" disabled={busy || !pw}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <Link to="/" className="adm-link">← Back to the Live Hub</Link>
      </form>
    </div>
  );
}

function Console({ onState, onSignOut }: { onState: (s: LiveState) => void; onSignOut: () => void }) {
  const { settings, clock, days, live } = useHub();
  const [log, setLog] = useState<LogEntry[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);
  const loadLog = useCallback(() => api<LogEntry[]>('GET', '/log').then(setLog).catch(() => {}), []);
  useEffect(() => { loadLog(); }, [loadLog]);

  const run: Ctx['run'] = async (label, fn) => {
    setBusy(label); setFlash(null);
    try {
      onState(await fn());
      setFlash({ ok: true, text: label + ' — published' });
      loadLog();
      return true;
    } catch (x) {
      const e = x as Error & { status?: number };
      if (e.status === 401) onSignOut();
      setFlash({ ok: false, text: e.message });
      return false;
    } finally { setBusy(null); }
  };
  const ctx = { run, busy };
  const signOut = async () => { await api('POST', '/logout').catch(() => {}); onSignOut(); };
  const when = clock.phase === 'before' ? `Opens ${days[0].date}` : clock.phase === 'after' ? 'Event ended' : `${days[clock.day - 1].label} · ${ampm(Math.floor(clock.minutes))}`;

  return (
    <div className="adm">
      <header className="adm-top">
        <div className="adm-brand"><Emblem size={34} /><div><div className="adm-kicker">Event control</div><div className="adm-name">{settings.eventName}</div></div></div>
        <div className="adm-top-r">
          <span className="adm-muted">{when} · <strong style={{ color: '#fff' }}>{live.length} live</strong></span>
          <a href="/" target="_blank" rel="noreferrer" className="adm-btn ghost">View live site ↗</a>
          <button className="adm-btn ghost" onClick={signOut}>Sign out</button>
        </div>
      </header>
      {flash && <div className={'adm-flash ' + (flash.ok ? 'ok' : 'bad')} role="status">{flash.text}</div>}
      <div className="adm-grid">
        <div className="adm-col">
          <div>
            <h1 className="adm-h1">Change the content,<br />not the QR</h1>
            <p className="adm-muted" style={{ maxWidth: 560 }}>Everything you publish here updates the website instantly for every visitor. The printed QR never changes.</p>
          </div>
          <AnnouncementCard ctx={ctx} />
          <SessionsCard ctx={ctx} />
          <UpdatesCard ctx={ctx} />
          <VideosCard ctx={ctx} />
          <CountriesCard ctx={ctx} />
          <SportsCard ctx={ctx} />
          <SettingsCard ctx={ctx} />
        </div>
        <aside className="adm-col adm-side">
          <QrCard ctx={ctx} />
          <div className="adm-card">
            <div className="adm-label">Publish log</div>
            {log.slice(0, 12).map((l, i) => (
              <div key={i} className="adm-log"><span>{new Date(l.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> {l.text}</div>
            ))}
            {log.length === 0 && <div className="adm-muted">No changes published yet.</div>}
          </div>
          <div className="adm-card">
            <div className="adm-label">Reset</div>
            <p className="adm-muted" style={{ marginTop: 0 }}>Restore the starting programme: clears schedule changes, posted updates, the announcement and event settings. Countries, sports, videos and the QR image are kept.</p>
            <button className="adm-btn danger" disabled={!!busy} onClick={() => { if (confirm('Reset schedule changes, updates, the announcement and settings? Countries, sports, videos and the QR are kept. This cannot be undone.')) run('Reset', () => api('POST', '/reset')); }}>Reset programme & updates</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function Card({ n, color, title, sub, children }: { n: string; color: string; title: string; sub: string; children: ReactNode }) {
  return (
    <section className="adm-card">
      <div className="adm-card-h">
        <span className="adm-num" style={{ background: color }}>{n}</span>
        <div><h2>{title}</h2><div className="adm-muted">{sub}</div></div>
      </div>
      {children}
    </section>
  );
}

function AnnouncementCard({ ctx }: { ctx: Ctx }) {
  const { settings } = useHub();
  const a = settings.announcement;
  const [title, setTitle] = useState(a.title);
  const [body, setBody] = useState(a.body);
  useEffect(() => { setTitle(a.title); setBody(a.body); }, [a.title, a.body]);
  const publish = (on: boolean) => ctx.run(on ? 'Announcement' : 'Announcement removed', () => api('PUT', '/announcement', { on, title, body }));
  return (
    <Card n="01" color="#F3A53A" title="Announcement banner" sub="Full-width bar under the header on every page, pinned on Updates.">
      <div className="adm-status">{a.on ? <><span className="adm-on" />Showing now</> : <><span className="adm-off" />Hidden</>}</div>
      <label className="adm-field"><span>Title</span><input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="Gate B closed 15:00–15:30" /></label>
      <label className="adm-field"><span>Message</span><textarea rows={2} value={body} maxLength={400} onChange={(e) => setBody(e.target.value)} /></label>
      <div className="adm-row">
        <button className="adm-btn primary" disabled={!!ctx.busy || !title.trim()} onClick={() => publish(true)}>{a.on ? 'Update banner' : 'Publish banner'}</button>
        {a.on && <button className="adm-btn ghost" disabled={!!ctx.busy} onClick={() => publish(false)}>Take down</button>}
      </div>
    </Card>
  );
}

function SessionsCard({ ctx }: { ctx: Ctx }) {
  const { all, clock, days } = useHub();
  const [day, setDay] = useState(clock.day);
  const [venue, setVenue] = useState<VenueId>('main');
  const [notify, setNotify] = useState(true);
  const [moveTo, setMoveTo] = useState<Record<string, VenueId>>({});
  const list = all.filter((s) => s.day === day && s.venue === venue && s.st !== 'done').sort((a, b) => a.start - b.start);
  const changedCount = all.filter((s) => s.changed).length;
  const act = (id: string, label: string, body: object) => ctx.run(label, () => api('POST', `/sessions/${encodeURIComponent(id)}`, { ...body, notify }));
  return (
    <Card n="02" color="#E8DCC4" title="Schedule changes" sub={`Delay or move a session. Changed sessions are marked CHANGED for visitors. ${changedCount} changed so far.`}>
      <div className="adm-row wrap">
        <div className="adm-seg">{days.map((d) => <button key={d.d} className={day === d.d ? 'on' : ''} onClick={() => setDay(d.d)}>{d.label}</button>)}</div>
        <select className="adm-select" value={venue} onChange={(e) => setVenue(e.target.value as VenueId)} aria-label="Location">
          {VENUES.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <label className="adm-check"><input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />Post a schedule-change update</label>
      </div>
      <div className="adm-list">
        {list.map((s) => {
          const target = moveTo[s.id] ?? (VENUES.find((v) => v.id !== s.venue)!.id);
          return (
            <div key={s.id} className="adm-sess">
              <div className="adm-sess-main">
                <span className="mono">{s.time}</span>
                <span className="adm-sess-t">{s.title}<small>{s.c ? s.c.name + ' · ' : ''}{s.kind}</small></span>
                {s.isLive && <span className="adm-pill live">LIVE</span>}
                {s.changed && <span className="adm-pill changed">CHANGED</span>}
              </div>
              <div className="adm-sess-act">
                <button className="adm-btn sm" disabled={!!ctx.busy} onClick={() => act(s.id, `${s.title} +15 min`, { delta: 15 })}>+15 min</button>
                <button className="adm-btn sm" disabled={!!ctx.busy} onClick={() => act(s.id, `${s.title} +30 min`, { delta: 30 })}>+30 min</button>
                <select className="adm-select sm" value={target} onChange={(e) => setMoveTo({ ...moveTo, [s.id]: e.target.value as VenueId })} aria-label="Move to">
                  {VENUES.filter((v) => v.id !== s.venue).map((v) => <option key={v.id} value={v.id}>{v.short}</option>)}
                </select>
                <button className="adm-btn sm" disabled={!!ctx.busy} onClick={() => act(s.id, `${s.title} moved`, { venue: target })}>Move</button>
                {s.changed && <button className="adm-btn sm ghost" disabled={!!ctx.busy} onClick={() => act(s.id, `${s.title} reverted`, { revert: true })}>Revert</button>}
              </div>
            </div>
          );
        })}
        {list.length === 0 && <div className="adm-muted" style={{ padding: 12 }}>No upcoming sessions at this location on this day.</div>}
      </div>
    </Card>
  );
}

function UpdatesCard({ ctx }: { ctx: Ctx }) {
  const { state, settings } = useHub();
  const [type, setType] = useState<UpdateType>('Notice');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const post = async () => { if (await ctx.run('Update', () => api('POST', '/updates', { type, title, body }))) { setTitle(''); setBody(''); } };
  const fmt = (at: number) => new Intl.DateTimeFormat('en-GB', { timeZone: settings.timezone, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(at);
  const list = [...state.updates].sort((a, b) => b.at - a.at);
  return (
    <Card n="03" color="#F2B3A8" title="Live updates" sub="Highlights, notices and facility news for the Updates feed. Visitors with the site open see a pop-up.">
      <div className="adm-seg">{UPDATE_TYPES.map((t) => <button key={t} className={type === t ? 'on' : ''} onClick={() => setType(t)}><span className="adm-dot" style={{ background: TAG_COLORS[t][0] }} />{t}</button>)}</div>
      <label className="adm-field"><span>Headline</span><input value={title} maxLength={140} onChange={(e) => setTitle(e.target.value)} placeholder="Food court queue times now under 5 minutes" /></label>
      <label className="adm-field"><span>Details (optional)</span><textarea rows={2} value={body} maxLength={600} onChange={(e) => setBody(e.target.value)} /></label>
      <div className="adm-row"><button className="adm-btn primary" disabled={!!ctx.busy || !title.trim()} onClick={post}>Post update</button></div>
      <div className="adm-list" style={{ marginTop: 14 }}>
        {list.map((u) => (
          <div key={u.id} className="adm-upd">
            <span className="adm-dot" style={{ background: TAG_COLORS[u.type][0] }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="adm-muted" style={{ fontSize: 12 }}>{u.type} · {fmt(u.at)}{u.at > Date.now() ? ' · scheduled' : ''}</div>
              <div style={{ fontWeight: 600 }}>{u.title}</div>
            </div>
            <button className="adm-btn sm ghost" disabled={!!ctx.busy} onClick={() => { if (confirm(`Remove "${u.title}"?`)) ctx.run('Update removed', () => api('DELETE', `/updates/${encodeURIComponent(u.id)}`)); }}>Remove</button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SettingsCard({ ctx }: { ctx: Ctx }) {
  const { settings } = useHub();
  const [f, setF] = useState(settings);
  useEffect(() => setF(settings), [settings]);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const zones = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [];
  return (
    <Card n="08" color="#9FC7A8" title="Event settings" sub="Name, web address and the dates and time zone that drive LIVE, Up next and the schedule.">
      <div className="adm-2col">
        <label className="adm-field"><span>Event name</span><input value={f.eventName} onChange={set('eventName')} /></label>
        <label className="adm-field"><span>Public URL</span><input value={f.publicUrl} onChange={set('publicUrl')} /></label>
        <label className="adm-field"><span>Venue / place</span><input value={f.place} onChange={set('place')} /></label>
        <label className="adm-field"><span>Day 1 date</span><input type="date" value={f.startDate} onChange={set('startDate')} /></label>
        <label className="adm-field"><span>Time zone</span>
          <input list="tz-list" value={f.timezone} onChange={set('timezone')} />
          <datalist id="tz-list">{zones.map((z) => <option key={z} value={z} />)}</datalist>
        </label>
      </div>
      <p className="adm-muted" style={{ marginTop: 0 }}>Changing the public URL changes the QR code. Only do this before printing.</p>
      <div className="adm-row"><button className="adm-btn primary" disabled={!!ctx.busy} onClick={() => ctx.run('Settings', () => api('PUT', '/settings', f))}>Save settings</button></div>
    </Card>
  );
}

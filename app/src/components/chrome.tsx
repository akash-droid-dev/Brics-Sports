import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import QRCode from 'qrcode';
import { MASCOT, ampm } from '../../shared/data.ts';
import { BRAND, useHub, useStored } from '../lib/hub.tsx';

export const NAV: [string, string][] = [['/', 'Live now'], ['/schedule', 'Schedule'], ['/countries', 'Countries'], ['/sports', 'Sports'], ['/map', 'Venue map'], ['/updates', 'Updates'], ['/about', 'About us']];

/** The five BRICS colours from the event identity, as a thin accent stripe. */
export const BRICS_COLORS = [BRAND.green, BRAND.blue, BRAND.yellow, BRAND.red, BRAND.orange];
export function Stripe({ width = 120, style }: { width?: number; style?: React.CSSProperties }) {
  return <div className="stripe" style={{ width, ...style }} aria-hidden="true">{BRICS_COLORS.map((c) => <span key={c} style={{ background: c }} />)}</div>;
}

/** Official event logo (ring of sports + BRICS wordmark). `mark` shows only the ring. */
export function Logo({ height = 50, mark = false }: { height?: number; mark?: boolean }) {
  return mark
    ? <img src="/brand/logo-mark.png" alt="" height={height} width={height} style={{ height, width: height, display: 'block' }} />
    : <img src="/brand/logo-120.png" alt="BRICS Traditional & Indigenous Sports 2026, Amdavad, India" className="brand-logo" style={{ height }} />;
}

/** A scannable QR for the public URL, drawn with a red centre mark. */
export function Qr({ url, size = 110, bg = '#FFFFFF' }: { url: string; size?: number; bg?: string }) {
  const { n, cells } = useMemo(() => {
    const q = QRCode.create('https://' + url, { errorCorrectionLevel: 'H' });
    const n = q.modules.size, out: string[] = [];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.modules.get(x, y)) out.push(`M${x} ${y}h1v1h-1z`);
    return { n, cells: out.join('') };
  }, [url]);
  const m = n * 0.2, o = (n - m) / 2;
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} width={size} height={size} shapeRendering="crispEdges" style={{ display: 'block', flexShrink: 0 }} role="img" aria-label={`QR code for ${url}`}>
      <rect x="-2" y="-2" width={n + 4} height={n + 4} fill={bg} />
      <path d={cells} fill="#173F73" />
      <rect x={o - 0.8} y={o - 0.8} width={m + 1.6} height={m + 1.6} rx="1.4" fill={bg} shapeRendering="geometricPrecision" />
      <rect x={o} y={o} width={m} height={m} rx="1" fill="#E1302A" shapeRendering="geometricPrecision" />
    </svg>
  );
}

export function useUnseenUpdates() {
  const { updates } = useHub();
  const [seen, setSeen] = useStored<string[]>('lh-updates-seen', []);
  const unseen = updates.filter((u) => !seen.includes(u.id)).length;
  return { unseen, markSeen: () => { if (unseen) setSeen(updates.map((u) => u.id)); } };
}

export function Header() {
  const { live, clock, days } = useHub();
  const { unseen } = useUnseenUpdates();
  const { pathname } = useLocation();
  const one = days.length === 1;
  const dayInfo = clock.phase === 'before'
    ? `Starts in ${clock.daysToGo} day${clock.daysToGo === 1 ? '' : 's'} · ${days[0].date}`
    : clock.phase === 'after' ? `Event ended · ${days[days.length - 1].date}`
    : one ? `Today · ${days[0].date}` : `${days[clock.day - 1].label} of ${days.length} · ${days[clock.day - 1].date}`;
  const [hm, mer] = ampm(Math.floor(clock.minutes)).split(' ');
  return (
    <header className="hdr">
      <div className="wrap hdr-in">
        <Link to="/" className="brand" aria-label="Home">
          <Logo />
          <img src={MASCOT.thumb} alt={MASCOT.name ? `${MASCOT.name}, our mascot` : 'Our mascot'} className="brand-mascot" />
        </Link>
        <nav className="nav" aria-label="Main">
          {NAV.map(([to, label]) => {
            const active = to === '/' ? pathname === '/' : pathname.startsWith(to);
            return (
              <NavLink key={to} to={to} end={to === '/'} className={active ? 'active' : ''}>
                {to === '/' && <span className="dot" />}
                {label}
                {to === '/updates' && unseen > 0 && <span className="badge">{unseen}</span>}
              </NavLink>
            );
          })}
        </nav>
        <div className="hdr-clock">
          <div className="hdr-clock-t">
            <span style={{ fontSize: 11, color: BRAND.muted }}>{dayInfo}</span>
            <span className="mono" style={{ fontWeight: 600, fontSize: 16 }}>
              {hm}<span style={{ color: BRAND.muted }}>:{String(clock.seconds).padStart(2, '0')}</span> <span style={{ fontSize: 12 }}>{mer}</span>
            </span>
          </div>
          <Link to="/" className="hdr-live"><span className="dot-white" />{live.length} LIVE</Link>
        </div>
      </div>
    </header>
  );
}

export function AnnouncementBar() {
  const { settings } = useHub();
  const a = settings.announcement;
  const key = a.title + '|' + a.body;
  const [dismissed, setDismissed] = useStored<string>('lh-ann-dismissed', '');
  if (!a.on || dismissed === key) return null;
  return (
    <div className="ann" role="status">
      <div className="wrap ann-in">
        <svg width="22" height="22" viewBox="0 0 24 24" style={{ flexShrink: 0 }} aria-hidden="true"><path d="M3 10v4h3l6 5V5L6 10H3z M16 8.5a5 5 0 0 1 0 7" fill="none" stroke="#1C2434" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" /></svg>
        <div style={{ flex: 1, minWidth: 0, fontSize: 14.5 }}><strong style={{ fontWeight: 700 }}>{a.title}.</strong> {a.body}</div>
        <button className="ann-x" onClick={() => setDismissed(key)} aria-label="Dismiss">×</button>
      </div>
    </div>
  );
}

export function Footer() {
  const { settings } = useHub();
  return (
    <footer className="ftr">
      <div className="ftr-stripe" aria-hidden="true">{BRICS_COLORS.map((c) => <span key={c} style={{ background: c }} />)}</div>
      <div className="wrap ftr-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
            <Qr url={settings.publicUrl} size={104} />
            <Logo height={64} />
          </div>
          <div style={{ maxWidth: 420 }}>
            <div className="display" style={{ fontWeight: 800, fontSize: 22, color: '#fff' }}>{settings.eventName}</div>
            <div style={{ fontSize: 14, marginTop: 6, lineHeight: 1.5, textWrap: 'pretty' }}>{settings.place}. One QR code at every location opens this page. Information updates live, with no app download needed.</div>
            <div className="mono" style={{ marginTop: 10, color: '#F9C512', fontSize: 14 }}>{settings.publicUrl}</div>
          </div>
        </div>
        <nav className="ftr-nav" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }} aria-label="Footer">
          {NAV.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
          <Link to="/admin" style={{ color: '#F9C512' }}>Event control →</Link>
        </nav>
      </div>
    </footer>
  );
}

/** Slides in when event control publishes something while the page is open. */
export function LiveToast() {
  const { state } = useHub();
  const [text, setText] = useState<string | null>(null);
  const prev = useRef<{ ids: Set<string>; ann: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const ids = new Set(state.updates.map((u) => u.id));
    const a = state.settings.announcement, ann = a.on ? a.title : '';
    const p = prev.current;
    prev.current = { ids, ann };
    if (!p) return;
    const fresh = state.updates.find((u) => !p.ids.has(u.id) && u.at <= Date.now() + 5000);
    const msg = fresh ? fresh.title : ann && ann !== p.ann ? 'Announcement: ' + ann : null;
    if (!msg) return;
    setText(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setText(null), 3600);
  }, [state]);
  if (!text) return null;
  return (
    <div className="toast" role="status" key={text}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F9C512', flexShrink: 0, animation: 'ftsBlink 1s infinite' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '.08em', color: '#F9C512', textTransform: 'uppercase' }}>Live update · just now</div>
        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{text}</div>
      </div>
    </div>
  );
}

export function PinIcon() {
  return <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true"><path d="M6 13s5-4.6 5-8A5 5 0 0 0 1 5c0 3.4 5 8 5 8z" fill="#F28C28" /><circle cx="6" cy="5" r="1.8" fill="#fff" /></svg>;
}

export function BackButton() {
  return (
    <button className="back" onClick={() => (history.length > 1 ? history.back() : (location.href = '/'))}>
      <svg width="9" height="14" viewBox="0 0 10 16" aria-hidden="true"><path d="M8 2L2 8l6 6" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>Back
    </button>
  );
}

/** Page header used by every inner page: eyebrow, title, BRICS stripe and an optional intro. */
export function PageHead({ eyebrow, title, children, right, small }: { eyebrow: string; title: string; children?: React.ReactNode; right?: React.ReactNode; small?: boolean }) {
  return (
    <section className="band">
      <div className="wrap band-in" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ minWidth: 0, flex: '1 1 420px' }}>
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="h1" style={small ? { fontSize: 'clamp(36px,4.4vw,56px)' } : undefined}>{title}</h1>
          <Stripe />
          {children && <div className="lede">{children}</div>}
        </div>
        {right}
      </div>
    </section>
  );
}

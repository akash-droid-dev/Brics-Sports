import { useEffect, useRef, useState } from 'react';
import { Link, useParams, Navigate, useNavigate } from 'react-router-dom';
import { COUNTRIES, SPORTS, VENUES, countryById, sportById } from '../../shared/data.ts';
import { artBg, countryPhoto, useHub, type SessionView, type SportView } from '../lib/hub.tsx';
import { BackButton } from '../components/chrome.tsx';

// ================= Schedule =================

export function Schedule() {
  const { all, clock, days } = useHub();
  const [day, setDay] = useState(clock.day);
  const [venue, setVenue] = useState<string>('all');
  const nowEl = useRef<HTMLDivElement | null>(null);
  const [jump, setJump] = useState(1);
  const navigate = useNavigate();

  const items = all.filter((s) => s.day === day && (venue === 'all' || s.venue === venue)).sort((a, b) => a.start - b.start);
  const groups: { start: number; time: string; items: SessionView[] }[] = [];
  for (const s of items) {
    let g = groups[groups.length - 1];
    if (!g || g.start !== s.start) { g = { start: s.start, time: s.startT, items: [] }; groups.push(g); }
    g.items.push(s);
  }
  let nowIdx = -1;
  const tagged = groups.map((g, i) => {
    const anyLive = g.items.some((s) => s.isLive), allDone = g.items.every((s) => s.st === 'done');
    if (nowIdx < 0 && !allDone) nowIdx = i;
    return { ...g, tag: anyLive ? '● LIVE NOW' : allDone ? 'ENDED' : day === clock.day && g.items[0].st === 'soon' ? 'UPCOMING' : '', tagInk: anyLive ? '#E1302A' : '#6A6056' };
  });

  // Open on the slot happening now (on arrival and on "Jump to now").
  useEffect(() => {
    const t = setTimeout(() => {
      if (!nowEl.current || clock.phase !== 'during' || day !== clock.day) return;
      const y = nowEl.current.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: Math.max(0, y), behavior: jump > 1 ? 'smooth' : 'auto' });
    }, 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jump]);

  const jumpNow = () => { setDay(clock.day); setVenue('all'); setJump((n) => n + 1); };

  return (
    <div className="page">
      <section className="band">
        <div className="wrap band-in" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div className="eyebrow">Full programme · {all.length} sessions</div>
            <h1 className="h1">Schedule</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {days.map((d) => (
              <button key={d.d} onClick={() => setDay(d.d)} aria-pressed={day === d.d} style={{ borderRadius: 14, padding: '10px 20px', background: day === d.d ? '#fff' : 'rgba(255,255,255,.07)', color: day === d.d ? '#16120E' : '#fff', textAlign: 'left', minWidth: 130 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{d.label}</div><div style={{ fontSize: 12, opacity: 0.7 }}>{d.date}</div>
              </button>
            ))}
            {clock.phase === 'during' && (
              <button onClick={jumpNow} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#E1302A', borderRadius: 14, height: 58, padding: '0 20px', fontSize: 15, fontWeight: 700, color: '#fff' }}>
                <span className="dot-white" style={{ width: 8, height: 8 }} />Jump to now
              </button>
            )}
          </div>
        </div>
      </section>
      <div className="wrap" style={{ paddingTop: 28, paddingBottom: 64, display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'flex-start' }}>
        <aside style={{ flex: '0 1 250px', minWidth: 220, position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="label-muted">Location</div>
          {[['all', 'All locations'] as const, ...VENUES.map((v) => [v.id, v.name] as const)].map(([id, label]) => (
            <button key={id} onClick={() => setVenue(id)} className={'side-btn' + (venue === id ? ' on' : '')} aria-pressed={venue === id}>{label}</button>
          ))}
          <div className="card" style={{ marginTop: 16, padding: 14, borderRadius: 14, fontSize: 13, color: '#4E463D', lineHeight: 1.5 }}>
            Times update live. Sessions changed by event control are marked <strong style={{ color: '#8A4B00' }}>CHANGED</strong>.
          </div>
        </aside>
        <div style={{ flex: '1 1 480px', minWidth: 0 }}>
          {tagged.map((g, i) => (
            <div key={g.start} ref={i === nowIdx ? nowEl : undefined} style={{ paddingBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span className="mono" style={{ fontWeight: 700, fontSize: 18 }}>{g.time}</span>
                <span style={{ height: 1, flex: 1, background: 'rgba(22,18,14,.12)' }} />
                <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.1em', color: g.tagInk }}>{g.tag}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 10 }}>
                {g.items.map((s) => (
                  <div key={s.id} role="link" tabIndex={0} className="srow" style={{ border: s.border, opacity: s.op }}
                    onClick={() => navigate(s.href)} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) navigate(s.href); }}>
                    <div className="bar" style={{ background: s.color }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ellipsis" style={{ fontWeight: 700, fontSize: 16 }}>{s.title}</div>
                      <div style={{ fontSize: 13, color: '#6A6056', marginTop: 2 }}>{s.countryName} · {s.kind}</div>
                      <div className="mono" style={{ fontSize: 12, color: '#6A6056', marginTop: 3 }}>{s.time}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <Link to={s.venueHref} className="venue-tag" onClick={(e) => e.stopPropagation()}>{s.venueShort}</Link>
                      <span className="chip-st" style={{ background: s.stBg, color: s.stFg }}>{s.stLabel}</span>
                      {s.changed && <span className="changed">CHANGED</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {tagged.length === 0 && <div style={{ padding: '60px 0', textAlign: 'center', color: '#6A6056' }}>No sessions at this location on this day.</div>}
        </div>
      </div>
    </div>
  );
}

// ================= Countries =================

export function Countries() {
  const { live } = useHub();
  return (
    <div className="page">
      <section className="band">
        <div className="wrap band-in">
          <div className="eyebrow">{COUNTRIES.length} delegations · 3 sports each</div>
          <h1 className="h1">Countries</h1>
        </div>
      </section>
      <div className="wrap" style={{ paddingTop: 28, paddingBottom: 64, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
        {COUNTRIES.map((c) => (
          <Link key={c.id} to={`/countries/${c.id}`} className="plain card lift" style={{ borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ height: 190, position: 'relative', background: artBg(countryPhoto(c), c.color) }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0) 50%,rgba(10,8,6,.55))' }} />
              {live.some((s) => s.c === c) && <span className="live-tag" style={{ top: 14, left: 14 }}><span className="dot-white" />LIVE NOW</span>}
            </div>
            <div style={{ height: 6, background: c.color }} />
            <div style={{ padding: '18px 20px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span className="display" style={{ fontWeight: 800, fontSize: 32, lineHeight: 1 }}>{c.name}</span>
                <span className="mono" style={{ fontSize: 12, color: '#6A6056' }}>{c.code}</span>
              </div>
              <div style={{ fontSize: 14, color: '#4E463D', marginTop: 8, lineHeight: 1.45, textWrap: 'pretty' }}>{c.story}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                {SPORTS.filter((s) => s.c === c.id).map((s) => <span key={s.id} style={{ fontSize: 12.5, fontWeight: 600, borderRadius: 14, padding: '5px 11px', background: '#F4EEE4' }}>{s.name}</span>)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SportCard({ s, h = 160, fs = 56, showCountry = true }: { s: SportView; h?: number; fs?: number; showCountry?: boolean }) {
  return (
    <Link to={`/sports/${s.id}`} className="plain card lift" style={{ borderRadius: 18, overflow: 'hidden' }}>
      <div style={{ height: h, position: 'relative', background: s.bg }}>
        {s.isLive && <span className="live-tag" style={{ top: 12, left: 12 }}><span className="dot-white" />LIVE</span>}
        {s.noPhoto && <div className="display" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: fs, color: 'rgba(255,255,255,.9)' }}>{s.initials}</div>}
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ fontWeight: 700, fontSize: 17 }}>{s.name}</div>
        {showCountry
          ? <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6A6056', marginTop: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />{s.countryName} · {s.type}</div>
          : <div style={{ fontSize: 13, color: '#6A6056', marginTop: 3 }}>{s.type}</div>}
        <div style={{ fontSize: 12.5, color: '#B8411A', fontWeight: 600, marginTop: showCountry ? 8 : 6 }}>{s.nextLabel}</div>
      </div>
    </Link>
  );
}

export function CountryDetail() {
  const { id } = useParams();
  const { sports, today } = useHub();
  const c = COUNTRIES.find((x) => x.id === id);
  if (!c) return <Navigate to="/countries" replace />;
  const sessions = today.filter((s) => s.c === c).sort((a, b) => a.start - b.start);
  return (
    <div className="page">
      <section style={{ position: 'relative', height: 440, background: artBg(countryPhoto(c), c.color), color: '#fff' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(10,8,6,.4),rgba(10,8,6,.05) 40%,rgba(10,8,6,.92))' }} />
        <div className="wrap" style={{ position: 'relative', height: '100%', paddingTop: 24, paddingBottom: 36, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div><BackButton /></div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 34, height: 7, borderRadius: 4, background: c.color }} /><span className="mono" style={{ fontSize: 13 }}>{c.code}</span></div>
            <h1 className="display" style={{ fontWeight: 900, fontSize: 'clamp(60px,8vw,110px)', lineHeight: 0.88, margin: '8px 0 0' }}>{c.name}</h1>
          </div>
        </div>
      </section>
      <div className="wrap" style={{ paddingTop: 32, paddingBottom: 64, display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
        <div style={{ flex: '1.4 1 520px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div style={{ fontSize: 19, lineHeight: 1.55, color: '#2E2721', textWrap: 'pretty', maxWidth: 680 }}>{c.story}</div>
          <div>
            <div className="label">Traditional sports</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
              {sports.filter((s) => s.c === c.id).map((s) => <SportCard key={s.id} s={s} h={150} fs={52} showCountry={false} />)}
            </div>
          </div>
        </div>
        <div style={{ flex: '1 1 360px', minWidth: 0 }}>
          <div className="label">Today at the event</div>
          <div className="card" style={{ borderRadius: 18, padding: '4px 18px' }}>
            {sessions.map((s) => (
              <Link key={s.id} to={s.venueHref} className="list-row" style={{ opacity: s.op }}>
                <span className="mono" style={{ fontSize: 13.5, fontWeight: 600, width: 50 }}>{s.startT}</span>
                <span className="ellipsis" style={{ flex: 1, fontSize: 15, fontWeight: 600, minWidth: 0 }}>{s.title}</span>
                <span style={{ fontSize: 13, color: '#6A6056' }}>{s.venueShort}</span>
                <span className="chip-st" style={{ background: s.stBg, color: s.stFg }}>{s.stLabel}</span>
              </Link>
            ))}
            {sessions.length === 0 && <div style={{ padding: '14px 0', fontSize: 14, color: '#6A6056' }}>No sessions today.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= Sports =================

const TYPES = ['All', 'Wrestling', 'Combat', 'Team', 'Target', 'Strength', 'Skill'];

export function Sports() {
  const { sports } = useHub();
  const [q, setQ] = useState('');
  const [type, setType] = useState('All');
  const needle = q.trim().toLowerCase();
  const list = sports.filter((s) => (type === 'All' || s.type === type) && (!needle || s.name.toLowerCase().includes(needle) || s.countryName.toLowerCase().includes(needle)));
  return (
    <div className="page">
      <section className="band">
        <div className="wrap band-in" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div className="eyebrow">{list.length} of {SPORTS.length} sports shown</div>
            <h1 className="h1">{SPORTS.length} Traditional sports</h1>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, height: 50, width: 'min(100%,380px)', background: '#FFFCF6', borderRadius: 14, padding: '0 16px', color: '#16120E' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6A6056" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sports or countries" aria-label="Search sports or countries" style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', fontSize: 15, color: '#16120E', minWidth: 0 }} />
          </label>
        </div>
        <div className="wrap" style={{ paddingBottom: 22, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TYPES.map((t) => <button key={t} onClick={() => setType(t)} aria-pressed={type === t} className={'chip-dark' + (type === t ? ' on' : '')}>{t}</button>)}
        </div>
      </section>
      <div className="wrap" style={{ paddingTop: 28, paddingBottom: 64 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
          {list.map((s) => <SportCard key={s.id} s={s} />)}
        </div>
        {list.length === 0 && <div style={{ padding: '60px 0', textAlign: 'center', color: '#6A6056', fontSize: 16 }}>No sports match that search.</div>}
      </div>
    </div>
  );
}

export function SportDetail() {
  const { id } = useParams();
  const { sports, all } = useHub();
  const [playing, setPlaying] = useState(false);
  useEffect(() => setPlaying(false), [id]);
  const sp = sportById(id ?? '');
  if (!sp) return <Navigate to="/sports" replace />;
  const vm = sports.find((s) => s.id === sp.id)!;
  const c = countryById(sp.c);
  const sessions = all.filter((s) => s.sp === sp).sort((a, b) => a.day - b.day || a.start - b.start);
  const lv = sessions.find((s) => s.isLive);
  const related = sports.filter((s) => s.type === sp.type && s.id !== sp.id).slice(0, 6);

  return (
    <div className="page">
      <section style={{ position: 'relative', height: 480, background: vm.bg, color: '#fff', overflow: 'hidden' }}>
        {playing && sp.video ? (
          <video src={sp.video} controls playsInline loop autoPlay style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', zIndex: 1 }} />
        ) : (
          <>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(10,8,6,.4),rgba(10,8,6,.05) 40%,rgba(10,8,6,.92))' }} />
            {vm.noPhoto && <div className="display" style={{ position: 'absolute', right: '6%', top: 40, fontWeight: 900, fontSize: 260, lineHeight: 0.8, color: 'rgba(255,255,255,.16)' }}>{vm.initials}</div>}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
              <div className="wrap" style={{ paddingBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 15, fontWeight: 600 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: c.color }} />{c.name} · {sp.type}</div>
                <h1 className="display" style={{ fontWeight: 900, fontSize: 'clamp(60px,8vw,110px)', lineHeight: 0.88, margin: '8px 0 0' }}>{sp.name}</h1>
                {sp.video && (
                  <button onClick={() => setPlaying(true)} style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, height: 48, borderRadius: 24, background: '#fff', color: '#16120E', padding: '0 20px 0 7px', fontWeight: 700, fontSize: 15 }}>
                    <span style={{ width: 36, height: 36, borderRadius: '50%', background: '#E1302A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="14" viewBox="0 0 10 12" aria-hidden="true"><path d="M1 1 L9 6 L1 11 Z" fill="#fff" /></svg></span>Watch clip
                  </button>
                )}
              </div>
            </div>
          </>
        )}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 24, zIndex: 2 }}>
          <div className="wrap"><BackButton /></div>
        </div>
      </section>
      <div className="wrap" style={{ paddingTop: 32, paddingBottom: 64, display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
        <div style={{ flex: '1.4 1 520px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 26 }}>
          {lv && (
            <Link to={lv.venueHref} className="plain" style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#16120E', color: '#fff', borderRadius: 16, padding: '16px 18px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#E1302A', borderRadius: 6, padding: '4px 9px', fontSize: 11, fontWeight: 700, letterSpacing: '.1em' }}><span className="dot-white" style={{ width: 6, height: 6 }} />LIVE</span>
              <span style={{ flex: 1, fontSize: 15.5, fontWeight: 600 }}>Happening now at {lv.venueName}</span><span style={{ color: '#F3A53A', fontWeight: 600 }}>View on map →</span>
            </Link>
          )}
          <div style={{ fontSize: 19, lineHeight: 1.55, color: '#2E2721', textWrap: 'pretty', maxWidth: 680 }}>{sp.about}</div>
          <div>
            <div className="label">Related sports</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
              {related.map((s) => (
                <Link key={s.id} to={`/sports/${s.id}`} className="plain lift" style={{ height: 150, borderRadius: 16, overflow: 'hidden', position: 'relative', background: s.bg }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0) 30%,rgba(10,8,6,.88))' }} />
                  <div style={{ position: 'absolute', left: 14, right: 14, bottom: 12, color: '#fff' }}><div style={{ fontSize: 12, opacity: 0.85 }}>{s.countryName}</div><div style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</div></div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div style={{ flex: '1 1 360px', minWidth: 0 }}>
          <div className="label">When &amp; where</div>
          <div className="card" style={{ borderRadius: 18, padding: '4px 18px' }}>
            {sessions.map((s) => (
              <Link key={s.id} to={s.venueHref} className="list-row" style={{ opacity: s.op }}>
                <span style={{ fontSize: 13, color: '#6A6056', width: 46 }}>{s.dayShort}</span>
                <span className="mono" style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{s.time}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{s.venueShort}</span>
                <span className="chip-st" style={{ background: s.stBg, color: s.stFg }}>{s.stLabel}</span>
              </Link>
            ))}
            {sessions.length === 0 && <div style={{ padding: '14px 0', fontSize: 14, color: '#6A6056' }}>Not on the programme this time.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

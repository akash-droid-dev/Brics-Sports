import { useEffect, useRef, useState } from 'react';
import { Link, useParams, Navigate, useLocation } from 'react-router-dom';
import { COUNTRIES, SPORTS, VENUES, countryById, flagUrl, sportById } from '../../shared/data.ts';
import { BRAND, flagArt, useHub, type SportView } from '../lib/hub.tsx';
import { BackButton, PageHead, Stripe } from '../components/chrome.tsx';
import { Clip } from '../components/Clip.tsx';

// ================= Schedule =================

export function Schedule() {
  const { all, clock, days, settings } = useHub();
  const [day, setDay] = useState(clock.day);
  const [venue, setVenue] = useState<string>('all');
  const [kind, setKind] = useState<string>('all');
  const nowEl = useRef<HTMLDivElement | null>(null);
  const [jump, setJump] = useState(1);
  const { hash } = useLocation();

  const items = all.filter((s) => s.day === day && (venue === 'all' || s.venue === venue) && (kind === 'all' || (kind === 'demo' ? !!s.c : !s.c))).sort((a, b) => a.start - b.start);
  const nowIdx = items.findIndex((s) => s.st !== 'done');
  const usedVenues = VENUES.filter((v) => all.some((s) => s.venue === v.id));

  // Open on the item happening now, or on a linked item (#id), on arrival and on "Jump to now".
  useEffect(() => {
    const t = setTimeout(() => {
      const target = hash ? document.getElementById(hash.slice(1)) : clock.phase === 'during' && day === clock.day ? nowEl.current : null;
      if (!target) return;
      const header = (document.querySelector('.hdr') as HTMLElement | null)?.offsetHeight ?? 80;
      const y = target.getBoundingClientRect().top + window.scrollY - header - 20;
      window.scrollTo({ top: Math.max(0, y), behavior: jump > 1 ? 'smooth' : 'auto' });
    }, 80);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jump, hash]);

  const jumpNow = () => { setDay(clock.day); setVenue('all'); setKind('all'); setJump((n) => n + 1); };

  return (
    <div className="page">
      <PageHead eyebrow={`Show flow · ${days.map((d) => d.date).join(', ')} · ${settings.place}`} title="Schedule"
        right={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {days.length > 1 && days.map((d) => (
              <button key={d.d} onClick={() => setDay(d.d)} aria-pressed={day === d.d} className={'chip' + (day === d.d ? ' on' : '')}>{d.label} · {d.date}</button>
            ))}
            {clock.phase === 'during' && (
              <button onClick={jumpNow} className="btn" style={{ background: BRAND.red }}><span className="dot-white" style={{ width: 8, height: 8 }} />Jump to now</button>
            )}
          </div>
        }>
        The programme for the day, 9:00 AM onwards. Times update live; items changed by event control are marked <strong style={{ color: '#A65A0B' }}>CHANGED</strong>.
      </PageHead>
      <div className="wrap" style={{ paddingTop: 20, display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
        <aside style={{ flex: '0 1 250px', minWidth: 220, position: 'sticky', top: 104, display: 'flex', flexDirection: 'column', gap: 6 }} className="filters">
          <div className="label-muted">Show</div>
          {[['all', 'Full programme'], ['ceremony', 'Ceremony & presentations'], ['demo', 'Demonstration games']].map(([id, label]) => (
            <button key={id} onClick={() => setKind(id)} className={'side-btn' + (kind === id ? ' on' : '')} aria-pressed={kind === id}>{label}</button>
          ))}
          {usedVenues.length > 1 && (
            <>
              <div className="label-muted" style={{ marginTop: 18 }}>Location</div>
              {[['all', 'All locations'] as const, ...usedVenues.map((v) => [v.id, v.name] as const)].map(([id, label]) => (
                <button key={id} onClick={() => setVenue(id)} className={'side-btn' + (venue === id ? ' on' : '')} aria-pressed={venue === id}>{label}</button>
              ))}
            </>
          )}
        </aside>
        <ol style={{ flex: '1 1 520px', minWidth: 0, listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((s, i) => (
            <li key={s.id} id={s.id} ref={i === nowIdx ? (nowEl as React.Ref<HTMLLIElement>) : undefined}>
              <div className="srow" style={{ border: s.border, opacity: s.op, cursor: 'default', alignItems: 'stretch', flexWrap: 'wrap' }}>
                <div className="bar" style={{ background: s.color }} />
                <div style={{ width: 118, flexShrink: 0 }}>
                  <div className="mono" style={{ fontWeight: 700, fontSize: 14, color: BRAND.navy }}>{s.time}</div>
                  <div style={{ fontSize: 12, color: BRAND.muted, marginTop: 3 }}>{s.end - s.start} min</div>
                  <span className="chip-st" style={{ background: s.stBg, color: s.stFg, display: 'inline-block', marginTop: 8 }}>{s.stLabel}</span>
                </div>
                <div style={{ flex: '1 1 300px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {s.c && <img className="flag" src={flagUrl(s.c)} alt="" width={26} height={19} />}
                    <span style={{ fontWeight: 700, fontSize: 17 }}>{s.title}</span>
                    {s.changed && <span className="changed">CHANGED</span>}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: s.color, marginTop: 4 }}>{s.c ? 'Demonstration Games' : s.kind}</div>
                  <div style={{ fontSize: 14.5, color: 'var(--body)', marginTop: 6, lineHeight: 1.5 }}>{s.brief}</div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap', fontSize: 13 }}>
                    <Link to={s.venueHref} className="venue-tag">{s.venueName}</Link>
                    {s.c && <Link to={s.href} style={{ fontWeight: 700 }}>About {s.c.name} →</Link>}
                  </div>
                </div>
              </div>
            </li>
          ))}
          {items.length === 0 && <li className="card" style={{ padding: 40, textAlign: 'center', color: BRAND.muted, borderRadius: 16 }}>Nothing matches this filter.</li>}
        </ol>
      </div>
    </div>
  );
}

// ================= Countries =================

export function Countries() {
  const { all } = useHub();
  return (
    <div className="page">
      <PageHead eyebrow={`${COUNTRIES.length} countries · ${SPORTS.length} traditional sports`} title="Countries">
        The BRICS countries taking part, with the traditional and indigenous sports each brings to Ahmedabad.
      </PageHead>
      <div className="wrap" style={{ paddingTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 22 }}>
        {COUNTRIES.map((c) => {
          const slot = all.find((s) => s.c === c);
          return (
            <Link key={c.id} to={`/countries/${c.id}`} className="plain card lift" style={{ borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ height: 170, position: 'relative', background: flagArt(c) }}>
                {slot?.isLive && <span className="live-tag" style={{ top: 14, left: 14 }}><span className="dot-white" />LIVE NOW</span>}
                <img className="flag" src={flagUrl(c)} alt={`Flag of ${c.name}`} width={96} height={72} style={{ position: 'absolute', left: 20, bottom: -30, boxShadow: '0 8px 20px rgba(0,0,0,.25)', border: '3px solid #fff', borderRadius: 8 }} />
              </div>
              <div style={{ padding: '42px 22px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                  <span className="display" style={{ fontWeight: 800, fontSize: 30, lineHeight: 1, color: BRAND.navy }}>{c.name}</span>
                  <span className="mono" style={{ fontSize: 12, color: BRAND.muted }}>{c.code}</span>
                </div>
                <div style={{ fontSize: 14.5, color: 'var(--body)', marginTop: 10, lineHeight: 1.5, textWrap: 'pretty' }}>{c.story}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                  {SPORTS.filter((s) => s.c === c.id).map((s) => <span key={s.id} style={{ fontSize: 12.5, fontWeight: 600, borderRadius: 14, padding: '5px 11px', background: 'rgba(23,63,115,.07)', color: BRAND.navy }}>{s.name}</span>)}
                </div>
                {slot && <div style={{ fontSize: 13, fontWeight: 700, color: BRAND.orange, marginTop: 14 }}>Demonstration Games · {slot.time}</div>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SportCard({ s, showCountry = true }: { s: SportView; showCountry?: boolean }) {
  return (
    <Link to={`/sports/${s.id}`} className="plain card lift" style={{ borderRadius: 18, overflow: 'hidden' }}>
      <div style={{ height: 150, position: 'relative', background: s.bg }}>
        {s.isLive && <span className="live-tag" style={{ top: 12, left: 12 }}><span className="dot-white" />LIVE</span>}
        {s.noPhoto && <div className="display" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 60, color: 'rgba(255,255,255,.92)', textShadow: '0 4px 18px rgba(0,0,0,.25)' }}>{s.initials}</div>}
      </div>
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ fontWeight: 700, fontSize: 17.5, color: BRAND.navy }}>{s.name}</div>
        {showCountry
          ? <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: BRAND.muted, marginTop: 5 }}><img className="flag" src={s.flag} alt="" width={18} height={13} />{s.countryName} · {s.type}</div>
          : <div style={{ fontSize: 13, color: BRAND.muted, marginTop: 4 }}>{s.type}</div>}
        <div style={{ fontSize: 12.5, color: BRAND.orange, fontWeight: 700, marginTop: 8 }}>{s.nextLabel}</div>
      </div>
    </Link>
  );
}

export function CountryDetail() {
  const { id } = useParams();
  const { sports, all } = useHub();
  const c = COUNTRIES.find((x) => x.id === id);
  if (!c) return <Navigate to="/countries" replace />;
  const slot = all.find((s) => s.c === c);
  return (
    <div className="page">
      <section style={{ position: 'relative', height: 420, background: flagArt(c), color: '#fff' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(12,24,48,.3),rgba(12,24,48,.05) 40%,rgba(12,24,48,.85))' }} />
        <div className="wrap" style={{ position: 'relative', height: '100%', paddingTop: 24, paddingBottom: 36, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div><BackButton /></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 22, flexWrap: 'wrap' }}>
            <img className="flag" src={flagUrl(c)} alt={`Flag of ${c.name}`} width={120} height={90} style={{ border: '4px solid #fff', borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,.3)' }} />
            <div>
              <span className="mono" style={{ fontSize: 13 }}>{c.code}</span>
              <h1 className="display" style={{ fontWeight: 900, fontSize: 'clamp(52px,7vw,100px)', lineHeight: 0.88, margin: '6px 0 0' }}>{c.name}</h1>
            </div>
          </div>
        </div>
      </section>
      <div className="wrap" style={{ paddingTop: 40, display: 'flex', flexWrap: 'wrap', gap: 36, alignItems: 'flex-start' }}>
        <div style={{ flex: '1.4 1 520px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 30 }}>
          <div className="lede" style={{ fontSize: 19 }}>{c.story}</div>
          <div>
            <div className="label">Traditional sports</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 18 }}>
              {sports.filter((s) => s.c === c.id).map((s) => <SportCard key={s.id} s={s} showCountry={false} />)}
            </div>
          </div>
        </div>
        <div style={{ flex: '1 1 340px', minWidth: 0 }}>
          <div className="label">At the event</div>
          <div className="card" style={{ borderRadius: 18, padding: 22 }}>
            {slot ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <span className="mono" style={{ fontWeight: 700, color: BRAND.navy }}>{slot.time}</span>
                  <span className="chip-st" style={{ background: slot.stBg, color: slot.stFg }}>{slot.stLabel}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 18, marginTop: 10 }}>{slot.title}</div>
                <div style={{ fontSize: 14.5, color: 'var(--body)', marginTop: 6, lineHeight: 1.5 }}>{slot.brief}</div>
                <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                  <Link to={slot.venueHref} className="venue-tag">{slot.venueName}</Link>
                  <Link to={`/schedule#${slot.id}`} style={{ fontWeight: 700, fontSize: 13 }}>See in schedule →</Link>
                </div>
              </>
            ) : (
              <div style={{ fontSize: 15, color: 'var(--body)', lineHeight: 1.55 }}>
                {c.name} takes part as a participating delegation and joins the ceremonies and the recognition of participating countries.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= Sports =================

const TYPES = ['All', 'Wrestling', 'Combat', 'Team', 'Target', 'Strength', 'Skill', 'Equestrian'];

export function Sports() {
  const { sports } = useHub();
  const [q, setQ] = useState('');
  const [type, setType] = useState('All');
  const needle = q.trim().toLowerCase();
  const list = sports.filter((s) => (type === 'All' || s.type === type) && (!needle || s.name.toLowerCase().includes(needle) || s.countryName.toLowerCase().includes(needle)));
  return (
    <div className="page">
      <PageHead eyebrow={`${list.length} of ${SPORTS.length} sports shown`} title="Traditional sports"
        right={
          <label className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, height: 52, width: 'min(100%,380px)', borderRadius: 14, padding: '0 16px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BRAND.muted} strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sports or countries" aria-label="Search sports or countries" style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', fontSize: 15, color: BRAND.ink, minWidth: 0 }} />
          </label>
        }>
        {SPORTS.length} traditional and indigenous sports from {COUNTRIES.length} countries.
      </PageHead>
      <div className="wrap" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 4, paddingBottom: 24 }}>
        {TYPES.map((t) => <button key={t} onClick={() => setType(t)} aria-pressed={type === t} className={'chip' + (type === t ? ' on' : '')}>{t}</button>)}
      </div>
      <div className="wrap">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
          {list.map((s) => <SportCard key={s.id} s={s} />)}
        </div>
        {list.length === 0 && <div style={{ padding: '60px 0', textAlign: 'center', color: BRAND.muted, fontSize: 16 }}>No sports match that search.</div>}
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
  const slot = all.find((s) => s.c === c);
  const siblings = sports.filter((s) => s.c === sp.c && s.id !== sp.id);
  const related = sports.filter((s) => s.type === sp.type && s.c !== sp.c).slice(0, 6);

  return (
    <div className="page">
      <section style={{ position: 'relative', height: 440, background: vm.bg, color: '#fff', overflow: 'hidden' }}>
        {playing && sp.video ? (
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: '#000' }}><Clip src={sp.video} label={`${sp.name} clip`} /></div>
        ) : (
          <>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(12,24,48,.3),rgba(12,24,48,.05) 40%,rgba(12,24,48,.88))' }} />
            {vm.noPhoto && <div className="display" aria-hidden="true" style={{ position: 'absolute', right: '6%', top: 40, fontWeight: 900, fontSize: 'clamp(140px,20vw,260px)', lineHeight: 0.8, color: 'rgba(255,255,255,.16)' }}>{vm.initials}</div>}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
              <div className="wrap" style={{ paddingBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 15, fontWeight: 600 }}><img className="flag" src={flagUrl(c)} alt="" width={26} height={19} />{c.name} · {sp.type}</div>
                <h1 className="display" style={{ fontWeight: 900, fontSize: 'clamp(52px,7vw,100px)', lineHeight: 0.88, margin: '8px 0 0' }}>{sp.name}</h1>
                {sp.video && (
                  <button onClick={() => setPlaying(true)} style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, height: 48, borderRadius: 24, background: '#fff', color: BRAND.ink, padding: '0 20px 0 7px', fontWeight: 700, fontSize: 15 }}>
                    <span style={{ width: 36, height: 36, borderRadius: '50%', background: BRAND.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="14" viewBox="0 0 10 12" aria-hidden="true"><path d="M1 1 L9 6 L1 11 Z" fill="#fff" /></svg></span>Watch clip
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
      <div className="wrap" style={{ paddingTop: 40, display: 'flex', flexWrap: 'wrap', gap: 36, alignItems: 'flex-start' }}>
        <div style={{ flex: '1.4 1 520px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 30 }}>
          {slot?.isLive && (
            <Link to={slot.venueHref} className="plain" style={{ display: 'flex', alignItems: 'center', gap: 12, background: BRAND.navy, color: '#fff', borderRadius: 16, padding: '16px 18px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: BRAND.red, borderRadius: 6, padding: '4px 9px', fontSize: 11, fontWeight: 700, letterSpacing: '.1em' }}><span className="dot-white" style={{ width: 6, height: 6 }} />LIVE</span>
              <span style={{ flex: 1, fontSize: 15.5, fontWeight: 600 }}>{c.name} demonstration happening now in the {slot.venueName}</span><span style={{ color: BRAND.yellow, fontWeight: 600 }}>View on map →</span>
            </Link>
          )}
          <div className="lede" style={{ fontSize: 19 }}>{sp.about}</div>
          {siblings.length > 0 && (
            <div>
              <div className="label">Also from {c.name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
                {siblings.map((s) => <SportCard key={s.id} s={s} showCountry={false} />)}
              </div>
            </div>
          )}
          {related.length > 0 && (
            <div>
              <div className="label">Related {sp.type.toLowerCase()} sports</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14 }}>
                {related.map((s) => (
                  <Link key={s.id} to={`/sports/${s.id}`} className="plain lift" style={{ height: 140, borderRadius: 16, overflow: 'hidden', position: 'relative', background: s.bg }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0) 30%,rgba(12,24,48,.88))' }} />
                    <div style={{ position: 'absolute', left: 14, right: 14, bottom: 12, color: '#fff' }}><div style={{ fontSize: 12, opacity: 0.9, display: 'flex', alignItems: 'center', gap: 6 }}><img className="flag" src={s.flag} alt="" width={16} height={12} />{s.countryName}</div><div style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</div></div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ flex: '1 1 340px', minWidth: 0 }}>
          <div className="label">When &amp; where</div>
          <div className="card" style={{ borderRadius: 18, padding: 22 }}>
            {slot ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <span className="mono" style={{ fontWeight: 700, color: BRAND.navy }}>{slot.dayShort} · {slot.time}</span>
                  <span className="chip-st" style={{ background: slot.stBg, color: slot.stFg }}>{slot.stLabel}</span>
                </div>
                <div style={{ fontSize: 14.5, color: 'var(--body)', marginTop: 10, lineHeight: 1.5 }}>Part of {slot.title} in the {slot.venueName}.</div>
                <Link to={`/schedule#${slot.id}`} style={{ display: 'inline-block', fontWeight: 700, fontSize: 13, marginTop: 12 }}>See in schedule →</Link>
              </>
            ) : (
              <div style={{ fontSize: 15, color: 'var(--body)', lineHeight: 1.55 }}>{sp.name} is part of {c.name}'s sporting heritage. {c.name} takes part as a participating delegation.</div>
            )}
          </div>
          <Stripe style={{ marginTop: 20 }} />
        </div>
      </div>
    </div>
  );
}

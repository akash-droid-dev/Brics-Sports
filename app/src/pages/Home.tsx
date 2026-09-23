import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { COUNTRIES, FACILITIES, SPORTS, STORIES, VENUES, DAY_START, countryById, sportById } from '../../shared/data.ts';
import { artBg, countryPhoto, useHub, type SessionView } from '../lib/hub.tsx';
import { Clip } from '../components/Clip.tsx';
import { KilimPattern, PinIcon, useUnseenUpdates } from '../components/chrome.tsx';

const PX_PER_MIN = 2;
const FEATURED = ['sumo', 'kabaddi', 'sepak', 'hurling', 'oil', 'capoeira', 'kendo', 'ssireum'];

export default function Home() {
  return (
    <div className="page">
      <Hero />
      <QuickAccess />
      <Programme />
      <ExploreCountries />
      <DiscoverSports />
      <VenueInfo />
      <UpdatesAndStories />
      <Partners />
    </div>
  );
}

// The Live Now card always carries footage. Sumo (the design pack's featured clip) leads whenever
// it is live; otherwise another live session with a clip, then the next one coming up, then a
// Sumo highlight. The badge always tells the truth: LIVE only while a session is actually on.
const HERO_SPORT = 'sumo';

interface HeroCard {
  mode: 'live' | 'next' | 'highlight';
  key: string; title: string; video?: string; bg: string; color: string; countryName: string; kind: string;
  href: string; venueHref?: string; venueName?: string; time?: string; right?: string; pct?: string;
}

function Hero() {
  const { live, upNext, upcoming, clock, days, settings } = useHub();
  const navigate = useNavigate();
  const isHero = (x: SessionView) => x.sp?.id === HERO_SPORT;
  const lead = live.find(isHero) ?? live.find((x) => x.video) ?? live[0];
  const others = live.filter((x) => x !== lead);
  const next = lead ? undefined : upcoming.find(isHero) ?? upcoming.find((x) => x.video);
  const heroSport = sportById(HERO_SPORT)!;
  const card: HeroCard = lead
    ? { mode: 'live', key: lead.id, title: lead.title, video: lead.video, bg: lead.bg, color: lead.color, countryName: lead.countryName, kind: lead.kind, href: lead.href, venueHref: lead.venueHref, venueName: lead.venueName, time: lead.time, right: lead.left + ' left', pct: lead.pct }
    : next
      ? { mode: 'next', key: next.id, title: next.title, video: next.video, bg: next.bg, color: next.color, countryName: next.countryName, kind: next.kind, href: next.href, venueHref: next.venueHref, venueName: next.venueName, time: `${next.dayShort} · ${next.time}`, right: next.st === 'soon' ? 'Starts ' + next.stLabel : days[next.day - 1].date }
      : { mode: 'highlight', key: 'highlight', title: heroSport.name, video: heroSport.video, bg: artBg(heroSport.photo, countryById(heroSport.c).color), color: countryById(heroSport.c).color, countryName: countryById(heroSport.c).name, kind: 'Highlights', href: `/sports/${heroSport.id}` };
  const note = clock.phase === 'before'
    ? `The event opens ${days[0].date}`
    : clock.phase === 'after' || (clock.day === days.length && !upNext.length) ? 'The programme has finished. Thank you for coming.'
    : upNext.length ? 'No demonstration live right now' : "Today's programme has finished. See you tomorrow.";
  const dayLabel = clock.phase === 'before' ? 'Opens ' + days[0].date : days[clock.day - 1].label + ' · ' + days[clock.day - 1].date;

  return (
    <section className="hero">
      <KilimPattern id="kilimW" opacity={0.08} />
      <div className="hero-glow" />
      <div className="wrap" style={{ position: 'relative', paddingTop: 36, paddingBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 22 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="dot" style={{ width: 10, height: 10 }} />
              <span className="eyebrow">{dayLabel} · {settings.place}</span>
            </div>
            <h1 className="display" style={{ fontWeight: 900, fontSize: 'clamp(44px,6vw,80px)', lineHeight: 0.9, margin: '10px 0 0' }}>Live now</h1>
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,.65)' }}>{live.length} locations live · {COUNTRIES.length} countries · {SPORTS.length} traditional sports</div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'stretch' }}>
          <div style={{ flex: '1.7 1 560px', minWidth: 0 }}>
            <div className="feature" role="link" tabIndex={0} onClick={(e) => { if (!(e.target as HTMLElement).closest('a,button')) navigate(card.href); }}
              onKeyDown={(e) => e.key === 'Enter' && navigate(card.href)}>
              <div className="feature-art" style={{ background: card.bg }} />
              {card.video && <Clip key={card.key} src={card.video} ambient label={`${card.title} video`} />}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(10,8,6,.5) 0%,rgba(10,8,6,0) 30%,rgba(10,8,6,.15) 55%,rgba(10,8,6,.92) 100%)' }} />
              <div style={{ position: 'absolute', left: 24, right: 24, top: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {card.mode === 'live' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#E1302A', color: '#fff', borderRadius: 7, padding: '7px 12px 7px 10px', fontWeight: 700, fontSize: 13, letterSpacing: '.12em' }}>
                    <span className="dot-white" style={{ width: 8, height: 8 }} />LIVE
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(19,16,13,.6)', backdropFilter: 'blur(8px)', color: '#fff', border: '1px solid rgba(255,255,255,.22)', borderRadius: 7, padding: '7px 12px 7px 10px', fontWeight: 700, fontSize: 13, letterSpacing: '.12em' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F3A53A' }} />{card.mode === 'next' ? 'UP NEXT' : 'HIGHLIGHTS'}
                    <span style={{ fontWeight: 500, letterSpacing: 0, opacity: 0.75 }}>· {note}</span>
                  </span>
                )}
                {card.venueHref && <Link to={card.venueHref} className="glass-pill" style={{ textDecoration: 'none' }}><PinIcon />{card.venueName} · View on map</Link>}
              </div>
              <div style={{ position: 'absolute', left: 28, right: 28, bottom: 24, color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: card.color }} />{card.countryName}<span style={{ opacity: 0.6 }}>· {card.kind}</span>
                </div>
                <div className="display" style={{ fontWeight: 900, fontSize: 'clamp(52px,6vw,88px)', lineHeight: 0.9, marginTop: 6 }}>{card.title}</div>
                {card.time && (
                  <div className="mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 14, fontSize: 14 }}>
                    <span>{card.time} · {card.venueName}</span><span style={{ color: '#F3A53A' }}>{card.right}</span>
                  </div>
                )}
                {card.mode === 'live' && (
                  <div style={{ height: 5, borderRadius: 5, background: 'rgba(255,255,255,.2)', marginTop: 9, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: card.pct, background: '#E1302A', borderRadius: 5, transition: 'width 1s linear' }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ flex: '1 1 340px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span className="display" style={{ fontWeight: 800, fontSize: 28 }}>{clock.phase === 'before' ? 'First up' : 'Up next'}</span>
              <Link to="/schedule" style={{ fontSize: 14, fontWeight: 600, color: '#F3A53A' }}>Full schedule →</Link>
            </div>
            {upNext.map((s) => (
              <Link key={s.id} to={s.href} className="row-dark">
                <div className="bar" style={{ background: s.color }} />
                <div style={{ width: 60, flexShrink: 0 }}>
                  <div className="mono" style={{ fontWeight: 700, fontSize: 17 }}>{s.startT}</div>
                  <div style={{ fontSize: 12, color: '#F3A53A', marginTop: 2 }}>{s.stLabel}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ellipsis" style={{ fontWeight: 700, fontSize: 16.5 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.62)', marginTop: 2 }}>{s.countryName} · {s.kind}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, background: '#fff', color: '#16120E', borderRadius: 7, padding: '4px 9px', whiteSpace: 'nowrap' }}>{s.venueShort}</span>
                  {s.changed && <span style={{ fontSize: 10.5, fontWeight: 700, color: '#16120E', background: '#F3A53A', borderRadius: 5, padding: '2px 6px' }}>CHANGED</span>}
                </div>
              </Link>
            ))}
            {upNext.length === 0 && <div style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', padding: '14px 0' }}>Nothing else scheduled today.</div>}
          </div>
        </div>

        {others.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', marginBottom: 10 }}>Also live at other locations</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 12 }}>
              {others.map((s) => (
                <Link key={s.id} to={s.href} className="tile-dark">
                  <div style={{ width: 64, height: 64, borderRadius: 11, flexShrink: 0, background: s.bg }} />
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#FF6A5F', fontWeight: 700, letterSpacing: '.08em' }}><span className="dot" style={{ width: 6, height: 6 }} />LIVE</span>
                      <span style={{ color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>{s.venueShort}</span>
                    </div>
                    <div className="ellipsis" style={{ fontWeight: 700, fontSize: 15, marginTop: 3 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>{s.countryName} · {s.time}</div>
                    <div style={{ height: 3, borderRadius: 3, background: 'rgba(255,255,255,.15)', marginTop: 6, overflow: 'hidden' }}><div style={{ height: '100%', width: s.pct, background: '#E1302A' }} /></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function QuickAccess() {
  const { today } = useHub();
  const { unseen } = useUnseenUpdates();
  return (
    <section className="wrap" style={{ paddingTop: 44 }}>
      <h2 className="h2" style={{ marginBottom: 16 }}>Quick access</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 14 }}>
        <Link to="/schedule" className="quick dark">
          <div style={{ width: 52, height: 52, borderRadius: 14, background: '#E1302A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4M7.5 14h3M13.5 14h3M7.5 17.5h3" /></svg>
          </div>
          <div><div className="quick-t">Schedule</div><div className="quick-s" style={{ color: 'rgba(255,255,255,.7)' }}>See every demonstration · <span style={{ color: '#F3A53A' }}>{today.length} today</span></div></div>
        </Link>
        <Link to="/countries" className="quick card">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, width: 110 }}>{COUNTRIES.map((c) => <span key={c.id} style={{ width: 17, height: 17, borderRadius: 5, background: c.color }} />)}</div>
          <div><div className="quick-t">Countries</div><div className="quick-s">Explore all {COUNTRIES.length} countries</div></div>
        </Link>
        <Link to="/sports" className="quick card">
          <div className="display" style={{ fontWeight: 900, fontSize: 64, lineHeight: 0.8, color: '#B8411A' }}>{SPORTS.length}</div>
          <div><div className="quick-t">Sports</div><div className="quick-s">Discover every traditional sport</div></div>
        </Link>
        <Link to="/map" className="quick card">
          <svg width="80" height="52" viewBox="0 0 58 38" aria-hidden="true"><path d="M4 22 L29 8 L54 22 L29 36 Z" fill="#E7DCCB" /><path d="M18 20 L29 14 L40 20 L29 26 Z" fill="#16120E" /><path d="M18 20 L29 26 L29 30 L18 24 Z" fill="#3A2F25" /><path d="M40 20 L29 26 L29 30 L40 24 Z" fill="#52443A" /><circle cx="44" cy="10" r="4" fill="#E1302A" /></svg>
          <div><div className="quick-t">Venue map</div><div className="quick-s">Find demonstration locations and facilities</div></div>
        </Link>
        <Link to="/updates" className="quick card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16120E" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" /><path d="M10 21h4" /></svg>
            {unseen > 0 && <span style={{ fontSize: 12.5, fontWeight: 700, background: '#E1302A', color: '#fff', borderRadius: 10, padding: '3px 9px' }}>{unseen} new</span>}
          </div>
          <div><div className="quick-t">Updates</div><div className="quick-s">See schedule changes and important notices</div></div>
        </Link>
      </div>
    </section>
  );
}

function Programme() {
  const { today, clock } = useHub();
  const scroller = useRef<HTMLDivElement>(null);
  const nowX = (clock.minutes - DAY_START) * PX_PER_MIN;
  const showNow = clock.phase === 'during' && nowX >= 0 && nowX <= 1110;
  useEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = Math.max(0, (showNow ? nowX : 0) - 300);
    // Only on mount: afterwards the visitor controls the scroll position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const hours = Array.from({ length: 10 }, (_, i) => ({ x: i * 120, label: String(9 + i).padStart(2, '0') + ':00' }));

  return (
    <section className="wrap section">
      <div className="section-head">
        <h2 className="h2">{clock.phase === 'before' ? 'Day 1 programme' : "Today's programme"}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#6A6056', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 10, borderRadius: 3, background: '#16120E', boxShadow: '0 0 0 2px #E1302A' }} />Live</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 10, borderRadius: 3, background: '#F4EEE4', border: '1px solid rgba(22,18,14,.2)' }} />Upcoming</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 10, borderRadius: 3, background: '#EFE8DC' }} />Ended</span>
          <Link to="/schedule" className="more">Full schedule →</Link>
        </div>
      </div>
      <div className="gantt">
        <div className="gantt-names">{VENUES.map((v) => <Link key={v.id} to={`/map/${v.id}`}>{v.name}</Link>)}</div>
        <div ref={scroller} style={{ flex: 1, overflowX: 'auto', position: 'relative' }}>
          <div style={{ position: 'relative', width: 1110, height: 30 + VENUES.length * 52 + 6 }}>
            {hours.map((h) => (
              <div key={h.x} style={{ position: 'absolute', left: h.x, top: 0, bottom: 0, borderLeft: '1px solid rgba(22,18,14,.06)' }}>
                <span className="mono" style={{ position: 'absolute', top: 8, left: 5, fontSize: 11, color: '#6A6056' }}>{h.label}</span>
              </div>
            ))}
            {VENUES.map((v, ri) => today.filter((s) => s.venue === v.id).map((s) => (
              <Link key={s.id} to={s.href} title={s.title} className="gantt-block" style={{
                left: (s.start - DAY_START) * PX_PER_MIN + 2, top: 30 + ri * 52 + 5, width: (s.end - s.start) * PX_PER_MIN - 4,
                background: s.isLive ? '#16120E' : s.st === 'done' ? '#EFE8DC' : '#F4EEE4', color: s.isLive ? '#fff' : '#16120E',
                borderTop: `3px solid ${s.color}`, boxShadow: s.isLive ? '0 0 0 2px #E1302A' : 'none',
              }}>
                <div className="ellipsis" style={{ fontSize: 11.5, fontWeight: 700 }}>{s.title}</div>
                <div style={{ fontSize: 10, opacity: 0.7, whiteSpace: 'nowrap' }}>{s.startT}</div>
              </Link>
            )))}
            {showNow && (
              <div style={{ position: 'absolute', top: 26, bottom: 0, left: nowX, width: 2, background: '#E1302A', zIndex: 3 }}>
                <span className="dot" style={{ position: 'absolute', top: -5, left: -4, width: 10, height: 10 }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ExploreCountries() {
  const { live } = useHub();
  return (
    <section className="wrap section">
      <div className="section-head">
        <h2 className="h2">Explore countries</h2>
        <Link to="/countries" className="more">All {COUNTRIES.length} countries →</Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 14 }}>
        {COUNTRIES.map((c) => (
          <Link key={c.id} to={`/countries/${c.id}`} className="plain lift" style={{ height: 230, borderRadius: 20, overflow: 'hidden', position: 'relative', background: artBg(countryPhoto(c), c.color) }}>
            <div className="shade-b" />
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 6, background: c.color }} />
            {live.some((s) => s.c === c) && <span className="live-tag" style={{ top: 16, left: 14 }}><span className="dot-white" />LIVE</span>}
            <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16, color: '#fff' }}>
              <div className="mono" style={{ fontSize: 11, opacity: 0.75 }}>{c.code}</div>
              <div className="display" style={{ fontWeight: 800, fontSize: 30, lineHeight: 1 }}>{c.name}</div>
              <div className="ellipsis" style={{ fontSize: 12, opacity: 0.78, marginTop: 4 }}>{SPORTS.filter((s) => s.c === c.id).map((s) => s.name).join(' · ')}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function DiscoverSports() {
  const { sports } = useHub();
  const feat = FEATURED.map((id) => sports.find((s) => s.id === id)!);
  return (
    <section className="wrap section">
      <div className="section-head">
        <h2 className="h2">Discover sports</h2>
        <Link to="/sports" className="more">All {SPORTS.length} sports →</Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gridAutoRows: 190, gridAutoFlow: 'dense', gap: 14 }}>
        {feat.map((s, i) => (
          <Link key={s.id} to={`/sports/${s.id}`} className="plain" style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', background: s.bg, gridRow: i === 0 ? 'span 2' : 'span 1', gridColumn: i === 0 ? 'span 2' : 'span 1', transition: 'box-shadow .2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 18px 34px rgba(22,18,14,.22)')} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '')}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(10,8,6,.88))' }} />
            {s.isLive && <span className="live-tag" style={{ top: 14, left: 14 }}>LIVE</span>}
            <div style={{ position: 'absolute', left: 18, right: 18, bottom: 16, color: '#fff' }}>
              <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, opacity: 0.9 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />{s.countryName} · {s.type}</div>
              <div className="display" style={{ fontWeight: 800, fontSize: i === 0 ? 52 : 26, lineHeight: 0.95, marginTop: 4 }}>{s.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function VenueInfo() {
  const { live, settings } = useHub();
  return (
    <section className="wrap section">
      <h2 className="h2" style={{ marginBottom: 16 }}>Venue information</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', background: '#16120E', color: '#fff', borderRadius: 24, overflow: 'hidden' }}>
        <div style={{ flex: '1 1 380px', padding: 30, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div className="display" style={{ fontWeight: 800, fontSize: 40, lineHeight: 1 }}>{settings.place}</div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,.7)', marginTop: 8, lineHeight: 1.5 }}>6 zones · 3 fields of play · gates open 08:00–19:00. Choose any location on the event map to see what is on there.</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {VENUES.map((v) => <Link key={v.id} to={`/map/${v.id}`} className="pill-dark">{live.some((s) => s.venue === v.id) && <span className="dot" />}{v.name}</Link>)}
          </div>
          <Link to="/map" className="btn-amber" style={{ alignSelf: 'flex-start' }}>Open event map →</Link>
        </div>
        <div style={{ flex: '1 1 420px', padding: 30, background: 'rgba(255,255,255,.04)', borderLeft: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', marginBottom: 12 }}>Facilities</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 8 }}>
            {FACILITIES.map((f) => (
              <Link key={f.id} to={`/map/${f.id}`} className="fac-dark">
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{f.name}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{f.where}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function UpdatesAndStories() {
  const { updates } = useHub();
  const [playing, setPlaying] = useState<string | null>(null);
  return (
    <section className="wrap section" style={{ display: 'flex', flexWrap: 'wrap', gap: 28 }}>
      <div style={{ flex: '1 1 380px', minWidth: 0 }}>
        <div className="section-head">
          <h2 className="h2">Latest updates</h2>
          <Link to="/updates" className="more">All updates →</Link>
        </div>
        <div className="card" style={{ borderRadius: 20, padding: '4px 20px' }}>
          {updates.slice(0, 4).map((u) => (
            <div key={u.id} style={{ display: 'flex', gap: 12, padding: '16px 0', borderBottom: '1px solid rgba(22,18,14,.07)' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', marginTop: 6, flexShrink: 0, background: u.dot }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: '#6A6056' }}><span style={{ fontWeight: 700, color: u.tagInk }}>{u.type}</span> · {u.stamp} · {u.ago}</div>
                <div style={{ fontWeight: 600, fontSize: 15.5, marginTop: 3 }}>{u.title}</div>
              </div>
            </div>
          ))}
          {updates.length === 0 && <div style={{ padding: '18px 0', fontSize: 14, color: '#6A6056' }}>No updates yet. Event control posts schedule changes and notices here.</div>}
        </div>
      </div>
      <div style={{ flex: '1.5 1 560px', minWidth: 0 }}>
        <h2 className="h2" style={{ marginBottom: 16 }}>Cultural stories</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 14 }}>
          {STORIES.map((m) => {
            const sp = sportById(m.sport)!, c = countryById(sp.c), on = playing === m.id;
            return (
              <div key={m.id} style={{ borderRadius: 20, overflow: 'hidden', background: '#16120E', color: '#fff' }}>
                <div style={{ position: 'relative', height: 170, background: artBg(m.photo, c.color) }}>
                  {on ? (
                    <Clip src={m.video} label={m.title} />
                  ) : (
                    <button onClick={() => setPlaying(m.id)} aria-label={`Play: ${m.title}`} style={{ position: 'absolute', inset: 0, width: '100%', background: 'linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.45))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ width: 58, height: 58, borderRadius: '50%', background: 'rgba(255,255,255,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,.35)' }}>
                        <svg width="20" height="22" viewBox="0 0 18 20" aria-hidden="true"><path d="M2 1.5 L16.5 10 L2 18.5 Z" fill="#16120E" /></svg>
                      </span>
                      <span className="mono" style={{ position: 'absolute', right: 12, bottom: 12, fontSize: 11.5, background: 'rgba(0,0,0,.6)', borderRadius: 5, padding: '2px 7px' }}>{m.len}</span>
                    </button>
                  )}
                </div>
                <div style={{ padding: '14px 16px 18px' }}>
                  <div style={{ fontSize: 12, color: '#F3A53A', fontWeight: 600 }}>{c.name} · {sp.name}</div>
                  <div style={{ fontWeight: 600, fontSize: 15.5, lineHeight: 1.35, marginTop: 4, textWrap: 'pretty' }}>{m.title}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Partners() {
  return (
    <section className="wrap section" style={{ paddingBottom: 64 }}>
      <h2 className="h2" style={{ marginBottom: 16 }}>Partners</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 12 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="mono" style={{ height: 84, borderRadius: 14, border: '1px dashed rgba(22,18,14,.24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, color: '#6A6056' }}>Partner logo</div>
        ))}
      </div>
    </section>
  );
}

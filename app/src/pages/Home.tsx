import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { embedUrl, parseYouTube } from '../../shared/youtube.ts';
import { VideoTheater } from '../components/VideoPlayer.tsx';
import { FACILITIES, MASCOT, MASCOT_ABOUT, VENUES, flagUrl } from '../../shared/data.ts';
import { BRAND, ampmRange, flagArt, useHub, type SessionView } from '../lib/hub.tsx';
import { Clip } from '../components/Clip.tsx';
import { PinIcon, Stripe, useUnseenUpdates } from '../components/chrome.tsx';

const FEATURED = ['kabaddi', 'capoeira', 'wushu', 'tahtib', 'zurkhaneh', 'silat', 'falconry', 'gugs', 'mas'];

export default function Home() {
  return (
    <div className="page">
      <Banner />
      <LiveNow />
      <QuickAccess />
      <Programme />
      <MascotAbout />
      <ExploreCountries />
      <DiscoverSports />
      <VenueInfo />
      <LatestUpdates />
      <Partners />
    </div>
  );
}

const mascotLine = () => (MASCOT.name ? `This is our Mascot, ${MASCOT.name}!` : 'This is our Mascot!');

function Banner() {
  const { settings } = useHub();
  return (
    <section className="banner" aria-label={settings.eventName}>
      <div className="banner-img-wrap">
        <picture>
          <source media="(max-width: 900px)" srcSet="/brand/banner-1200.jpg" />
          <img className="banner-img" src="/brand/banner.jpg" alt="BRICS Traditional & Indigenous Sports 2026: Resilience, Innovation, Cooperation, Sustainability" />
        </picture>
      </div>
      <div className="banner-mascot">
        <div className="bubble">Namaste! I am {MASCOT.name}!</div>
        <img src={MASCOT.image} alt="" />
      </div>
    </section>
  );
}

interface HeroCard { mode: 'live' | 'next' | 'done'; s: SessionView }

function LiveNow() {
  const { countries: COUNTRIES, sportsList: SPORTS, countryById, sportById } = useHub();
  const { live, upNext, upcoming, today, clock, days, settings } = useHub();
  const navigate = useNavigate();
  // Lead with a country demonstration when one is live, else whatever is on, else what comes next.
  const lead = live.find((x) => x.c) ?? live[0];
  const others = live.filter((x) => x !== lead);
  const next = upcoming[0];
  const card: HeroCard | null = lead ? { mode: 'live', s: lead } : next ? { mode: 'next', s: next } : today.length ? { mode: 'done', s: today[today.length - 1] } : null;
  const note = clock.phase === 'before' ? `The event opens ${days[0].date}` : clock.phase === 'after' || !next ? 'The programme has finished. Thank you for joining us.' : 'Coming up next';
  const s = card?.s;
  const long = (s?.title.length ?? 0) > 28;
  // The video chosen in Event control plays behind the card; "Watch" opens it with sound and controls.
  const { video } = useHub();
  const yt = video ? parseYouTube(video.url) : null;
  const [watching, setWatching] = useState(false);

  return (
    <section className="wrap" style={{ paddingTop: 28 }}>
      {watching && yt && <VideoTheater yt={yt} title={video!.title} onClose={() => setWatching(false)} />}
      <div className="section-head">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="dot" style={{ width: 10, height: 10 }} />
            <span className="eyebrow">{clock.phase === 'before' ? 'Opens ' + days[0].date : days[clock.day - 1].date} · {settings.place}</span>
          </div>
          <h1 className="h1" style={{ fontSize: 'clamp(44px,6vw,80px)' }}>Live now</h1>
          <Stripe />
        </div>
        <div style={{ fontSize: 14, color: BRAND.muted }}>{live.length} live · {COUNTRIES.length} countries · {SPORTS.length} traditional sports</div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'stretch' }}>
        <div style={{ flex: '1.7 1 560px', minWidth: 0 }}>
          {s && card && (
            <div className="feature" role="link" tabIndex={0}
              onClick={(e) => { if (!(e.target as HTMLElement).closest('a,button')) navigate(s.href); }}
              onKeyDown={(e) => e.key === 'Enter' && navigate(s.href)}>
              <div className="feature-art" style={{ background: s.bg }} />
              {yt ? (
                <iframe key={video!.id} className={'yt-bg' + (yt.kind === 'video' && yt.vertical ? ' vertical' : '')} src={embedUrl(yt, { background: true })} title={video!.title}
                  allow="autoplay; encrypted-media" referrerPolicy="strict-origin-when-cross-origin" tabIndex={-1} aria-hidden="true" />
              ) : s.video && <Clip key={s.id} src={s.video} ambient label={`${s.title} video`} />}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(12,24,48,.45) 0%,rgba(12,24,48,0) 30%,rgba(12,24,48,.2) 55%,rgba(12,24,48,.92) 100%)' }} />
              <div style={{ position: 'absolute', left: 24, right: 24, top: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {card.mode === 'live' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, background: BRAND.red, color: '#fff', borderRadius: 7, padding: '7px 12px 7px 10px', fontWeight: 700, fontSize: 13, letterSpacing: '.12em' }}>
                    <span className="dot-white" style={{ width: 8, height: 8 }} />LIVE
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(12,24,48,.55)', backdropFilter: 'blur(8px)', color: '#fff', border: '1px solid rgba(255,255,255,.25)', borderRadius: 7, padding: '7px 12px 7px 10px', fontWeight: 700, fontSize: 13, letterSpacing: '.12em' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: BRAND.yellow }} />{card.mode === 'next' ? 'UP NEXT' : 'ENDED'}
                    <span style={{ fontWeight: 500, letterSpacing: 0, opacity: 0.8 }}>· {note}</span>
                  </span>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {yt && (
                    <button className="glass-pill" onClick={() => setWatching(true)} title={`Watch on the big screen: ${video!.title}`} style={{ background: 'rgba(225,48,42,.9)', borderColor: 'transparent', maxWidth: 320 }}>
                      <span aria-hidden="true">▶</span><span className="ellipsis">Watch big screen · {video!.title}</span>
                    </button>
                  )}
                  <Link to={s.venueHref} className="glass-pill"><PinIcon />{s.venueName} · View on map</Link>
                </div>
              </div>
              <div style={{ position: 'absolute', left: 28, right: 28, bottom: 24, color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
                  {s.c ? <img className="flag" src={flagUrl(s.c)} alt="" width={22} height={16} /> : <span style={{ width: 12, height: 12, borderRadius: 3, background: s.color }} />}
                  {s.c ? s.c.name : s.kind}<span style={{ opacity: 0.7 }}>· {s.c ? 'Demonstration Games' : s.venueName}</span>
                </div>
                <div className="display" style={{ fontWeight: 900, fontSize: long && !s.c ? 'clamp(34px,4vw,56px)' : 'clamp(48px,6vw,84px)', lineHeight: 0.92, marginTop: 8, textWrap: 'balance' }}>{s.c ? s.c.name : s.title}</div>
                <div className="ellipsis" style={{ fontSize: 14.5, opacity: 0.85, marginTop: 8, maxWidth: 640 }}>{s.brief}</div>
                <div className="mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 12, fontSize: 14 }}>
                  <span>{card.mode === 'next' && s.st === 'later' ? s.dayShort + ' · ' : ''}{s.time}</span>
                  <span style={{ color: BRAND.yellow }}>{card.mode === 'live' ? s.left + ' left' : card.mode === 'next' ? (s.st === 'soon' ? 'Starts ' + s.stLabel : s.dayShort) : 'Ended'}</span>
                </div>
                {card.mode === 'live' && (
                  <div style={{ height: 5, borderRadius: 5, background: 'rgba(255,255,255,.25)', marginTop: 9, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: s.pct, background: BRAND.red, borderRadius: 5, transition: 'width 1s linear' }} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: '1 1 340px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span className="display" style={{ fontWeight: 800, fontSize: 28, color: BRAND.navy }}>{clock.phase === 'before' ? 'First up' : 'Up next'}</span>
            <Link to="/schedule" className="more">Full schedule →</Link>
          </div>
          {upNext.map((x) => (
            <Link key={x.id} to={x.href} className="row">
              <div className="bar" style={{ background: x.color }} />
              <div style={{ width: 74, flexShrink: 0 }}>
                <div className="mono" style={{ fontWeight: 700, fontSize: 14.5, color: BRAND.navy }}>{x.startT}</div>
                <div style={{ fontSize: 12, color: BRAND.orange, marginTop: 2, fontWeight: 600 }}>{x.stLabel}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ellipsis" style={{ fontWeight: 700, fontSize: 15.5 }}>{x.title}</div>
                <div style={{ fontSize: 13, color: BRAND.muted, marginTop: 2 }}>{x.c ? 'Demonstration Games' : x.kind}</div>
              </div>
              {x.c && <img className="flag" src={flagUrl(x.c)} alt={x.c.name} width={28} height={21} />}
              {x.changed && <span className="changed">CHANGED</span>}
            </Link>
          ))}
          {upNext.length === 0 && <div className="card" style={{ borderRadius: 16, padding: 18, fontSize: 14, color: BRAND.muted }}>Nothing else scheduled today.</div>}
        </div>
      </div>

      {others.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div className="label-muted">Also live</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
            {others.map((x) => (
              <Link key={x.id} to={x.href} className="tile">
                <div style={{ width: 64, height: 64, borderRadius: 11, flexShrink: 0, background: x.bg }} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: BRAND.red, fontWeight: 700, letterSpacing: '.08em', fontSize: 11 }}><span className="dot" style={{ width: 6, height: 6 }} />LIVE · {x.venueShort}</span>
                  <div className="ellipsis" style={{ fontWeight: 700, fontSize: 15, marginTop: 3 }}>{x.title}</div>
                  <div style={{ height: 3, borderRadius: 3, background: 'rgba(23,63,115,.12)', marginTop: 6, overflow: 'hidden' }}><div style={{ height: '100%', width: x.pct, background: BRAND.red }} /></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function QuickAccess() {
  const { countries: COUNTRIES, sportsList: SPORTS, countryById, sportById } = useHub();
  const { today } = useHub();
  const { unseen } = useUnseenUpdates();
  const icon = (bg: string, path: React.ReactNode) => (
    <div className="quick-icon" style={{ background: bg }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{path}</svg>
    </div>
  );
  return (
    <section className="wrap section">
      <div className="section-head"><div><h2 className="h2">Quick access</h2><Stripe width={80} /></div></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 18 }}>
        <Link to="/schedule" className="quick primary card">
          {icon(BRAND.orange, <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4M7.5 14h3M13.5 14h3M7.5 17.5h3" /></>)}
          <div><div className="quick-t">Schedule</div><div className="quick-s" style={{ color: 'rgba(255,255,255,.8)' }}>The full show flow · <span style={{ color: BRAND.yellow }}>{today.length} items</span></div></div>
        </Link>
        <Link to="/countries" className="quick card">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, width: 150 }}>{COUNTRIES.map((c) => <img key={c.id} className="flag" src={flagUrl(c)} alt="" width={22} height={16} />)}</div>
          <div><div className="quick-t">Countries</div><div className="quick-s">Explore all {COUNTRIES.length} countries</div></div>
        </Link>
        <Link to="/sports" className="quick card">
          <div className="display" style={{ fontWeight: 900, fontSize: 60, lineHeight: 0.8, color: BRAND.red }}>{SPORTS.length}</div>
          <div><div className="quick-t">Sports</div><div className="quick-s">Discover every traditional sport</div></div>
        </Link>
        <Link to="/map" className="quick card">
          {icon(BRAND.green, <><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14M15 6v14" /></>)}
          <div><div className="quick-t">Venue map</div><div className="quick-s">Find areas and facilities</div></div>
        </Link>
        <Link to="/updates" className="quick card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {icon(BRAND.blue, <><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" /><path d="M10 21h4" /></>)}
            {unseen > 0 && <span style={{ fontSize: 12.5, fontWeight: 700, background: BRAND.red, color: '#fff', borderRadius: 10, padding: '3px 9px' }}>{unseen} new</span>}
          </div>
          <div><div className="quick-t">Updates</div><div className="quick-s">Schedule changes and notices</div></div>
        </Link>
      </div>
    </section>
  );
}

function Programme() {
  const { today, clock, days } = useHub();
  const demos = today.filter((s) => s.c);
  const firstDemo = demos[0]?.start ?? 0, lastDemo = demos[demos.length - 1]?.end ?? 0;
  const phases = [
    { name: 'Opening ceremony', items: today.filter((s) => s.end <= firstDemo) },
    { name: 'Demonstration games', items: demos },
    { name: 'Closing programme', items: today.filter((s) => s.start >= lastDemo) },
  ].map((p) => ({ ...p, from: p.items[0]?.start ?? 0, to: p.items[p.items.length - 1]?.end ?? 0, live: p.items.some((s) => s.isLive) }));
  const colors = [BRAND.orange, BRAND.red, BRAND.green];

  return (
    <section className="wrap section">
      <div className="section-head">
        <div>
          <h2 className="h2">{clock.phase === 'before' ? `Programme · ${days[0].date}` : "Today's programme"}</h2>
          <Stripe width={80} />
          <p>Show flow for {days[0].date}, 9:00 AM onwards. Times update live if event control makes a change.</p>
        </div>
        <Link to="/schedule" className="more">Full schedule →</Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
        {phases.map((p, i) => (
          <div key={p.name} className={'phase card' + (p.live ? ' now' : '')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <div className="mono" style={{ fontSize: 12, color: colors[i], fontWeight: 700 }}>{ampmRange(p.from, p.to)}</div>
                <div className="display" style={{ fontWeight: 800, fontSize: 26, color: BRAND.navy, marginTop: 2 }}>{p.name}</div>
              </div>
              {p.live && <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: BRAND.red, color: '#fff', borderRadius: 6, padding: '4px 9px', fontSize: 11, fontWeight: 700, letterSpacing: '.1em' }}><span className="dot-white" style={{ width: 6, height: 6 }} />LIVE</span>}
            </div>
            <div>
              {p.items.map((s) => (
                <Link key={s.id} to={s.href} className="flow-item" style={{ opacity: s.op, fontWeight: s.isLive ? 700 : 500 }}>
                  <span className="mono">{s.startT}</span>
                  {s.c && <img className="flag" src={flagUrl(s.c)} alt="" width={20} height={15} style={{ alignSelf: 'center' }} />}
                  <span style={{ flex: 1, minWidth: 0 }}>{s.c ? s.c.name : s.title}</span>
                  {s.isLive && <span className="dot" />}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MascotAbout() {
  return (
    <section className="wrap section">
      <div className="mascot-card card">
        <img src={MASCOT.image} alt={MASCOT.name ? `${MASCOT.name}, the event mascot` : 'The event mascot'} />
        <div>
          <div className="eyebrow">Meet our mascot</div>
          <h2 className="h2" style={{ fontSize: 'clamp(34px,4.4vw,54px)', marginTop: 8 }}>{mascotLine()}</h2>
          <Stripe />
          <p className="lede" style={{ marginTop: 18 }}>
            {MASCOT_ABOUT}
          </p>
          <p className="lede" style={{ marginTop: 6 }}>
            BRICS Traditional &amp; Indigenous Sports 2026 is a non-competitive cultural showcase under India's BRICS Chairship, celebrating sporting heritage, cultural diversity and the connections between communities.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
            <Link to="/about" className="btn">About us →</Link>
            <Link to="/countries" className="btn ghost">Meet the countries</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExploreCountries() {
  const { countries: COUNTRIES, sportsList: SPORTS, countryById, sportById } = useHub();
  const { all } = useHub();
  return (
    <section className="wrap section">
      <div className="section-head">
        <div><h2 className="h2">Participating countries</h2><Stripe width={80} /></div>
        <Link to="/countries" className="more">All {COUNTRIES.length} countries →</Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 18 }}>
        {COUNTRIES.map((c) => {
          const slot = all.find((s) => s.c === c);
          return (
            <Link key={c.id} to={`/countries/${c.id}`} className="plain lift" style={{ height: 220, borderRadius: 20, overflow: 'hidden', position: 'relative', background: flagArt(c), boxShadow: 'var(--shadow)' }}>
              <div className="shade-b" />
              {slot?.isLive && <span className="live-tag" style={{ top: 14, left: 14 }}><span className="dot-white" />LIVE</span>}
              <img className="flag" src={flagUrl(c)} alt="" width={44} height={33} style={{ position: 'absolute', top: 14, right: 14, boxShadow: '0 4px 12px rgba(0,0,0,.3)' }} />
              <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16, color: '#fff' }}>
                <div className="mono" style={{ fontSize: 11, opacity: 0.8 }}>{c.code}{slot ? ` · Demo ${slot.startT}` : ''}</div>
                <div className="display" style={{ fontWeight: 800, fontSize: c.name.length > 14 ? 24 : 30, lineHeight: 1 }}>{c.name}</div>
                <div className="ellipsis" style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>{SPORTS.filter((s) => s.c === c.id).map((s) => s.name).join(' · ')}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function DiscoverSports() {
  const { countries: COUNTRIES, sportsList: SPORTS, countryById, sportById } = useHub();
  const { sports } = useHub();
  const feat = FEATURED.map((id) => sports.find((s) => s.id === id)!).filter(Boolean);
  return (
    <section className="wrap section">
      <div className="section-head">
        <div><h2 className="h2">Discover sports</h2><Stripe width={80} /></div>
        <Link to="/sports" className="more">All {SPORTS.length} sports →</Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gridAutoRows: 200, gridAutoFlow: 'dense', gap: 18 }}>
        {feat.map((s, i) => (
          <Link key={s.id} to={`/sports/${s.id}`} className="plain lift" style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', background: s.bg, gridRow: i === 0 ? 'span 2' : 'span 1', gridColumn: i === 0 ? 'span 2' : 'span 1', boxShadow: 'var(--shadow)' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0) 35%,rgba(12,24,48,.85))' }} />
            {s.noPhoto && <div className="display" aria-hidden="true" style={{ position: 'absolute', right: 16, top: 6, fontWeight: 900, fontSize: i === 0 ? 150 : 76, lineHeight: 1, color: 'rgba(255,255,255,.16)' }}>{s.initials}</div>}
            {s.isLive && <span className="live-tag" style={{ top: 14, left: 14 }}>LIVE</span>}
            <div style={{ position: 'absolute', left: 18, right: 18, bottom: 16, color: '#fff' }}>
              <div style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 7, opacity: 0.95 }}><img className="flag" src={s.flag} alt="" width={18} height={13} />{s.countryName} · {s.type}</div>
              <div className="display" style={{ fontWeight: 800, fontSize: i === 0 ? 56 : 28, lineHeight: 0.95, marginTop: 5 }}>{s.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function VenueInfo() {
  const { live, settings, today } = useHub();
  const first = today[0], last = today[today.length - 1];
  return (
    <section className="wrap section">
      <div className="section-head"><div><h2 className="h2">Venue information</h2><Stripe width={80} /></div></div>
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', borderRadius: 24, overflow: 'hidden' }}>
        <div style={{ flex: '1 1 380px', padding: 32, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <div className="display" style={{ fontWeight: 800, fontSize: 36, lineHeight: 1, color: BRAND.navy }}>{settings.place}</div>
            <div style={{ fontSize: 15, color: BRAND.muted, marginTop: 10, lineHeight: 1.55 }}>
              {first && last ? `Programme ${ampmRange(first.start, last.end)}. ` : ''}The ceremony and demonstration games take place in the Main Arena. Choose an area on the map to see what is on there.
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {VENUES.map((v) => <Link key={v.id} to={`/map/${v.id}`} className="pill">{live.some((s) => s.venue === v.id) && <span className="dot" />}{v.name}</Link>)}
          </div>
          <Link to="/map" className="btn navy" style={{ alignSelf: 'flex-start' }}>Open venue map →</Link>
        </div>
        <div style={{ flex: '1 1 420px', padding: 32, borderLeft: '1px solid var(--line)', background: 'rgba(23,63,115,.03)' }}>
          <div className="label-muted" style={{ marginBottom: 14 }}>Facilities</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 10 }}>
            {FACILITIES.map((f) => (
              <Link key={f.id} to={`/map/${f.id === 'water' || f.id === 'prayer' ? 'other' : f.id}`} className="fac">
                <div style={{ fontSize: 14.5, fontWeight: 700, color: BRAND.navy }}>{f.name}</div><div style={{ fontSize: 12, color: BRAND.muted, marginTop: 2 }}>{f.where}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LatestUpdates() {
  const { updates } = useHub();
  return (
    <section className="wrap section">
      <div className="section-head">
        <div><h2 className="h2">Latest updates</h2><Stripe width={80} /></div>
        <Link to="/updates" className="more">All updates →</Link>
      </div>
      <div className="card" style={{ borderRadius: 20, padding: '6px 24px' }}>
        {updates.slice(0, 4).map((u) => (
          <div key={u.id} style={{ display: 'flex', gap: 12, padding: '18px 0', borderBottom: '1px solid var(--line)' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', marginTop: 6, flexShrink: 0, background: u.dot }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: BRAND.muted }}><span style={{ fontWeight: 700, color: u.tagInk }}>{u.type}</span> · {u.stamp} · {u.ago}</div>
              <div style={{ fontWeight: 600, fontSize: 15.5, marginTop: 3 }}>{u.title}</div>
            </div>
          </div>
        ))}
        {updates.length === 0 && <div style={{ padding: '22px 0', fontSize: 15, color: BRAND.muted }}>No updates yet. Schedule changes and notices from event control will appear here as soon as they are published.</div>}
      </div>
    </section>
  );
}

function Partners() {
  return (
    <section className="wrap section">
      <div className="section-head"><div><h2 className="h2">Partners</h2><Stripe width={80} /></div></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 14 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="mono" style={{ height: 88, borderRadius: 14, border: '1px dashed rgba(23,63,115,.25)', background: 'rgba(255,255,255,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, color: BRAND.muted }}>Partner logo</div>
        ))}
      </div>
    </section>
  );
}

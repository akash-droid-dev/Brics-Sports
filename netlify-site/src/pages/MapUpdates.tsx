import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FACILITIES, VENUES, facilityById, type VenueId } from '../../shared/data.ts';
import { shade, useHub, useStored } from '../lib/hub.tsx';
import { PageHead, useUnseenUpdates } from '../components/chrome.tsx';

// Footprints on the 300×300 site plan: x, y, w, h, block height.
const G: Record<VenueId, [number, number, number, number, number]> = {
  main: [95, 18, 110, 84, 26], fop1: [14, 132, 90, 62, 7], fop2: [118, 132, 92, 62, 5], fop3: [224, 132, 62, 62, 7], tsz: [14, 218, 128, 64, 11], cz: [158, 218, 128, 64, 16],
};
const TOPS: Record<VenueId, string> = { main: '#8C7A64', fop1: '#C0674A', fop2: '#5E8F52', fop3: '#C79A4A', tsz: '#7C6A9A', cz: '#4F8A8B' };
const PINS: Record<string, [number, number]> = { registration: [150, 296], info: [210, 60], food: [150, 206], medical: [8, 160], transport: [150, 4], toilets: [290, 110], water: [214, 120], prayer: [290, 240] };
const NEAR: Record<VenueId, string[]> = { main: ['info', 'toilets', 'food'], fop1: ['medical', 'water', 'toilets'], fop2: ['food', 'water', 'toilets'], fop3: ['water', 'toilets', 'registration'], tsz: ['water', 'info', 'toilets'], cz: ['food', 'prayer', 'toilets'] };
const LOCS: [string, string][] = [...VENUES.map((v) => [v.id, v.name] as [string, string]), ['registration', 'Registration'], ['food', 'Food'], ['medical', 'Medical'], ['info', 'Information'], ['transport', 'Transport'], ['toilets', 'Toilets'], ['other', 'Other facilities']];
const LOST_PROPERTY = { id: 'lost', name: 'Lost property', note: 'Handed-in items are kept at Information until the end of each day.', where: 'Information desk', hours: '08:30–19:00' };

export function MapPage() {
  const { loc = 'fop1' } = useParams();
  const navigate = useNavigate();
  const { live, settings } = useHub();
  const sel = LOCS.some(([id]) => id === loc) ? loc : 'fop1';
  const pick = (id: string) => navigate(`/map/${id}`, { replace: true });
  const isLiveAt = (id: string) => live.some((s) => s.venue === id);
  const venue = VENUES.find((v) => v.id === sel);

  const labels = [
    ...VENUES.map((v) => { const [x, y, w, h, hz] = G[v.id]; const on = sel === v.id; return { id: v.id, x: x + w / 2, y: y + h / 2, z: (on ? hz + 10 : hz) + 2, label: v.short, live: isLiveAt(v.id), bg: on ? '#fff' : 'var(--navy)', ink: on ? 'var(--navy)' : '#fff' }; }),
    ...FACILITIES.filter((f) => PINS[f.id] && (sel === f.id || (sel === 'other' && ['water', 'prayer'].includes(f.id))))
      .map((f) => ({ id: f.id, x: PINS[f.id][0], y: PINS[f.id][1], z: 4, label: f.name, live: false, bg: '#F3A53A', ink: 'var(--navy)' })),
  ];

  return (
    <div className="page">
      <PageHead eyebrow={settings.place} title="Venue map">
        Select an area to see what is on there. The programme takes place in the Main Arena; the other areas show an indicative layout until the final venue plan is confirmed.
      </PageHead>
      <div className="wrap" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 8 }}>
        {LOCS.map(([id, label]) => (
          <button key={id} onClick={() => pick(id)} aria-pressed={sel === id} className={'chip' + (sel === id ? ' on' : '')}>
            {isLiveAt(id) && <span className="dot" />}{label}
          </button>
        ))}
      </div>
      <div className="wrap" style={{ paddingTop: 24, display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
        <div className="map-stage">
          <div style={{ position: 'absolute', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle,rgba(249,197,18,.18),rgba(249,197,18,0) 70%)' }} />
          <div className="mono" style={{ position: 'absolute', left: 20, top: 18, fontSize: 11, letterSpacing: '.12em', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase' }}>Indicative layout · tap an area</div>
          <div style={{ position: 'absolute', right: 20, bottom: 18, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,.6)' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E1302A' }} />Live now</div>
          <div className="map-board">
            <div style={{ position: 'absolute', inset: -10, borderRadius: 22, background: '#2A241C', boxShadow: '0 0 0 1px rgba(255,255,255,.08)' }} />
            <svg viewBox="0 0 300 300" width="300" height="300" style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
              <rect x="0" y="0" width="300" height="300" rx="16" fill="#3B4A2E" />
              <path d="M150 0 V300 M0 120 H300 M0 205 H300" stroke="#C9B89A" strokeWidth="8" opacity=".55" />
              <path d="M150 0 V300 M0 120 H300 M0 205 H300" stroke="#E8DCC4" strokeWidth="1" strokeDasharray="3 5" opacity=".6" />
              <rect x="130" y="-2" width="40" height="10" fill="#F3A53A" />
              <rect x="130" y="292" width="40" height="10" fill="#F3A53A" />
            </svg>
            {VENUES.map((v) => {
              const [x, y, w, h, hz0] = G[v.id]; const on = sel === v.id; const hz = on ? hz0 + 10 : hz0; const t = on ? '#F3A53A' : TOPS[v.id];
              return (
                <div key={v.id} onClick={() => pick(v.id)} role="button" aria-label={v.name} style={{ position: 'absolute', left: x, top: y, width: w, height: h, transformStyle: 'preserve-3d', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, width: hz, height: h, transformOrigin: 'left center', transform: 'rotateY(-90deg)', background: shade(t, 0.62), transition: 'width .35s' }} />
                  <div style={{ position: 'absolute', left: 0, top: h, width: w, height: hz, transformOrigin: 'top center', transform: 'rotateX(90deg)', background: shade(t, 0.78), transition: 'height .35s' }} />
                  <div style={{ position: 'absolute', inset: 0, transform: `translateZ(${hz}px)`, background: t, borderRadius: 3, boxShadow: on ? '0 0 30px rgba(243,165,58,.9)' : 'none', transition: 'transform .35s, background .35s' }}>
                    <div style={{ position: 'absolute', inset: 6, border: '1px solid rgba(255,255,255,.25)', borderRadius: 2 }} />
                  </div>
                </div>
              );
            })}
            {labels.map((l) => (
              <div key={l.id} onClick={() => pick(l.id)} style={{ position: 'absolute', left: l.x, top: l.y, width: 0, height: 0, transformStyle: 'preserve-3d', transform: `translateZ(${l.z}px)`, cursor: 'pointer' }}>
                <div style={{ position: 'absolute', left: 0, bottom: 0, transformOrigin: '0 100%', transform: 'rotateZ(38deg) rotateX(-58deg) translate(-50%,0)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', background: l.bg, color: l.ink, fontSize: 10, fontWeight: 700, borderRadius: 8, padding: '3px 7px', boxShadow: '0 4px 10px rgba(0,0,0,.35)' }}>
                    {l.live && <span className="dot" style={{ width: 6, height: 6 }} />}{l.label}
                  </div>
                  <div style={{ width: 2, height: 10, background: l.bg, marginLeft: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: '1 1 400px', minWidth: 0 }}>
          {venue ? <VenuePanel id={venue.id} pick={pick} /> : <FacilityPanel sel={sel} />}
        </div>
      </div>
    </div>
  );
}

function VenuePanel({ id, pick }: { id: VenueId; pick: (id: string) => void }) {
  const { today } = useHub();
  const v = VENUES.find((x) => x.id === id)!;
  const here = today.filter((s) => s.venue === id).sort((a, b) => a.start - b.start);
  const lv = here.filter((s) => s.isLive);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', color: 'var(--muted)', textTransform: 'uppercase' }}>{v.kind} · {v.cap}</div>
        <h2 className="display" style={{ fontWeight: 900, fontSize: 48, lineHeight: 0.95, margin: '4px 0 0', color: 'var(--navy)' }}>{v.name}</h2>
        <div style={{ fontSize: 15, color: 'var(--body)', marginTop: 8, lineHeight: 1.5 }}>{v.desc}</div>
      </div>
      <div>
        <div className="label" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}><span className="dot" style={{ width: 8, height: 8 }} />Live now</div>
        {lv.map((s) => (
          <Link key={s.id} to={s.href} className="plain" style={{ display: 'block', position: 'relative', height: 170, borderRadius: 18, overflow: 'hidden', background: s.bg, marginBottom: 8 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(12,24,48,.92),rgba(12,24,48,.2))' }} />
            <div style={{ position: 'absolute', left: 20, top: 18, right: 20, color: '#fff' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E1302A', borderRadius: 6, padding: '4px 9px', fontSize: 11, fontWeight: 700, letterSpacing: '.1em' }}><span className="dot-white" style={{ width: 6, height: 6 }} />LIVE</span>
              <div className="display" style={{ fontWeight: 900, fontSize: s.title.length > 30 ? 28 : 38, lineHeight: 1, marginTop: 10 }}>{s.title}</div>
              <div style={{ fontSize: 14, opacity: 0.82, marginTop: 4 }}>{s.countryName} · {s.time} · {s.left} left</div>
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 5, background: 'rgba(255,255,255,.2)' }}><div style={{ height: '100%', width: s.pct, background: '#E1302A' }} /></div>
          </Link>
        ))}
        {lv.length === 0 && <div className="card" style={{ border: '1px dashed rgba(23,63,115,.25)', borderRadius: 16, padding: 18, fontSize: 14, color: 'var(--muted)' }}>Nothing live at this location right now.</div>}
      </div>
      <div>
        <div className="label" style={{ marginBottom: 10 }}>Up next</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {here.filter((s) => s.st === 'soon' || s.st === 'later').slice(0, 3).map((s) => (
            <Link key={s.id} to={s.href} className="srow card" style={{ padding: '12px 14px 12px 12px', borderRadius: 14 }}>
              <div className="bar" style={{ background: s.color }} />
              <span className="mono" style={{ fontWeight: 700, fontSize: 13.5, width: 70, color: 'var(--navy)' }}>{s.startT}</span>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 15.5 }}>{s.title}</div><div style={{ fontSize: 13, color: 'var(--muted)' }}>{s.countryName} · {s.kind}</div></div>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#fff', background: 'var(--navy)', borderRadius: 6, padding: '4px 8px', whiteSpace: 'nowrap' }}>{s.stLabel}</span>
            </Link>
          ))}
        </div>
      </div>
      <div>
        <div className="label" style={{ marginBottom: 10 }}>Today's programme here</div>
        <div className="card" style={{ borderRadius: 16, padding: '4px 16px' }}>
          {here.length === 0 && <div style={{ padding: '14px 0', fontSize: 14, color: 'var(--muted)' }}>No programme items here. Everything takes place in the Main Arena.</div>}
          {here.map((s) => (
            <Link key={s.id} to={s.href} className="list-row" style={{ padding: '10px 0', opacity: s.op }}>
              <span className="mono" style={{ fontSize: 12.5, fontWeight: 600, width: 70 }}>{s.startT}</span>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: s.color }} />
              <span className="ellipsis" style={{ flex: 1, fontSize: 14.5, fontWeight: 600, minWidth: 0 }}>{s.title}</span>
              <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{s.countryName}</span>
              <span className="chip-st" style={{ background: s.stBg, color: s.stFg }}>{s.stLabel}</span>
            </Link>
          ))}
        </div>
      </div>
      <div>
        <div className="label" style={{ marginBottom: 10 }}>Facilities nearby</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 8 }}>
          {NEAR[id].map((fid) => facilityById(fid)!).map((f) => (
            <button key={f.id} onClick={() => pick(f.id === 'water' || f.id === 'prayer' ? 'other' : f.id)} className="card" style={{ textAlign: 'left', borderRadius: 14, padding: '12px 14px' }}>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>{f.name}</div><div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{f.where}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FacilityPanel({ sel }: { sel: string }) {
  const items = sel === 'other' ? [facilityById('water')!, facilityById('prayer')!, LOST_PROPERTY] : [facilityById(sel)!].filter(Boolean);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((f) => (
        <div key={f.id} className="card" style={{ borderRadius: 20, padding: 24 }}>
          <h2 className="display" style={{ fontWeight: 900, fontSize: 40, lineHeight: 1, margin: 0, color: 'var(--navy)' }}>{f.name}</h2>
          <div style={{ fontSize: 15, color: 'var(--body)', marginTop: 8 }}>{f.note}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
            <div style={{ background: 'rgba(23,63,115,.06)', borderRadius: 12, padding: '12px 14px' }}><div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Where</div><div style={{ fontSize: 15, fontWeight: 600, marginTop: 3 }}>{f.where}</div></div>
            <div style={{ background: 'rgba(23,63,115,.06)', borderRadius: 12, padding: '12px 14px' }}><div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Hours</div><div style={{ fontSize: 15, fontWeight: 600, marginTop: 3 }}>{f.hours}</div></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ================= Updates =================

const FILTERS: [string, string | null][] = [['All', null], ['Schedule changes', 'Schedule change'], ['Notices', 'Notice'], ['Highlights', 'Highlight'], ['Facilities', 'Facility']];

export function Updates() {
  const { updates, settings } = useHub();
  const { markSeen } = useUnseenUpdates();
  const [filter, setFilter] = useStored<string>('lh-updates-filter', 'All');
  useEffect(() => { markSeen(); });
  const type = FILTERS.find(([l]) => l === filter)?.[1] ?? null;
  const list = updates.filter((u) => !type || u.type === type);
  const a = settings.announcement;
  return (
    <div className="page">
      <PageHead eyebrow="Updated live by event control" title="Live updates">
        Schedule changes, notices and highlights, published by event control during the event.
      </PageHead>
      <div className="wrap" style={{ paddingTop: 20, display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
        <aside style={{ flex: '0 1 280px', minWidth: 240, position: 'sticky', top: 'calc(var(--hdr-h, 78px) + 64px)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="label-muted">Show</div>
          {FILTERS.map(([label]) => <button key={label} onClick={() => setFilter(label)} className={'side-btn' + (filter === label ? ' on' : '')} aria-pressed={filter === label}>{label}</button>)}
          {a.on && (
            <div style={{ marginTop: 16, background: 'linear-gradient(135deg,#F28C28,#F9C512)', borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>Pinned announcement</div>
              <div style={{ fontWeight: 700, fontSize: 17, marginTop: 5 }}>{a.title}</div>
              <div style={{ fontSize: 13.5, marginTop: 4, lineHeight: 1.45 }}>{a.body}</div>
            </div>
          )}
        </aside>
        <div style={{ flex: '1 1 560px', minWidth: 0, maxWidth: 820, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {list.map((u) => (
            <article key={u.id} className="card" style={{ borderRadius: 18, padding: '20px 22px', animation: 'ftsIn .4s ease both' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: u.tagInk }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: u.dot }} />{u.type}</span>
                <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{u.stamp} · {u.ago}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 19, marginTop: 9, lineHeight: 1.3 }}>{u.title}</div>
              {u.body && <div style={{ fontSize: 15, color: 'var(--body)', marginTop: 5, lineHeight: 1.5 }}>{u.body}</div>}
            </article>
          ))}
          {list.length === 0 && <div className="card" style={{ borderRadius: 18, padding: '28px 22px', color: 'var(--muted)', fontSize: 15 }}>No updates here yet. Schedule changes and notices from event control appear here as soon as they are published.</div>}
        </div>
      </div>
    </div>
  );
}

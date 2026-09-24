// Event control: live video library, QR code, and the countries & sports content.
import { useEffect, useRef, useState } from 'react';
import { SPORT_TYPES, flagUrl, type Country, type Sport } from '../../shared/data.ts';
import type { LiveState } from '../../shared/live.ts';
import { parseYouTube, thumbnail } from '../../shared/youtube.ts';
import { useHub } from '../lib/hub.tsx';
import { Qr } from '../components/chrome.tsx';
import { Card, api, type Ctx } from './Admin.tsx';

// ---------- image uploads ----------

/** Shrink photos in the browser before upload (keeps uploads fast and under the size limit). */
async function toDataUrl(file: File, { max, lossless }: { max: number; lossless?: boolean }): Promise<string> {
  if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) throw new Error('Choose a PNG, JPEG, WebP or GIF image.');
  const read = () => new Promise<string>((ok, fail) => { const r = new FileReader(); r.onload = () => ok(r.result as string); r.onerror = () => fail(new Error('Could not read that file.')); r.readAsDataURL(file); });
  if (file.type === 'image/gif') return read();
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  if (scale === 1 && file.size < 1_500_000) return read();
  const c = Object.assign(document.createElement('canvas'), { width: Math.round(bmp.width * scale), height: Math.round(bmp.height * scale) });
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  return lossless ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.86);
}

async function uploadImage(file: File, opts: { max: number; lossless?: boolean }) {
  const data = await toDataUrl(file, opts);
  return (await api<{ url: string }>('POST', '/media', { data })).url;
}

/** Preview + upload / paste link / remove for one image slot. Changes apply when the form is saved. */
function ImageField({ label, value, onChange, hint, lossless, fallback }: { label: string; value: string | null | undefined; onChange: (v: string | null) => void; hint?: string; lossless?: boolean; fallback?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const pick = async (f?: File) => {
    if (!f) return;
    setBusy(true); setErr('');
    try { onChange(await uploadImage(f, { max: lossless ? 1200 : 1600, lossless })); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); if (input.current) input.current.value = ''; }
  };
  const shown = value || fallback;
  return (
    <div className="adm-field">
      <span>{label}</span>
      <div className="adm-img">
        <div className="adm-img-prev" style={{ backgroundImage: shown ? `url("${shown}")` : undefined }}>{!shown && 'No image'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>
          <div className="adm-row wrap">
            <button type="button" className="adm-btn sm" disabled={busy} onClick={() => input.current?.click()}>{busy ? 'Uploading…' : value ? 'Replace…' : 'Upload…'}</button>
            {value && <button type="button" className="adm-btn sm ghost" onClick={() => onChange(null)}>Remove</button>}
          </div>
          <input className="adm-input" placeholder="…or paste an https:// image link" value={value && !value.startsWith('/api/media/') ? value : ''} onChange={(e) => onChange(e.target.value.trim() || null)} />
          {hint && <small className="adm-muted" style={{ fontSize: 12 }}>{hint}</small>}
          {err && <small className="adm-err">{err}</small>}
        </div>
      </div>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}

// ---------- QR ----------

export function QrCard({ ctx }: { ctx: Ctx }) {
  const { settings } = useHub();
  const [copied, setCopied] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const url = 'https://' + settings.publicUrl;
  const copy = async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { prompt('Copy the public URL', url); } };
  const download = () => {
    if (settings.qrImage) { Object.assign(document.createElement('a'), { href: settings.qrImage, download: 'event-qr' }).click(); return; }
    const svg = document.querySelector('#adm-qr svg');
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'event-qr.svg' });
    a.click(); URL.revokeObjectURL(a.href);
  };
  const upload = async (f?: File) => {
    if (!f) return;
    await ctx.run('QR image', async () => api('PUT', '/qr', { image: await uploadImage(f, { max: 1200, lossless: true }) }));
    if (input.current) input.current.value = '';
  };
  return (
    <div className="adm-qr" style={{ flexWrap: 'wrap' }}>
      <div id="adm-qr"><Qr url={settings.publicUrl} image={settings.qrImage} size={120} /></div>
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Universal Event QR</div>
        <div style={{ fontSize: 12, color: '#2F8F46', fontWeight: 700, marginTop: 2 }}>● {settings.qrImage ? 'UPLOADED IMAGE' : 'GENERATED FROM PUBLIC URL'}</div>
        <div className="mono" style={{ fontSize: 12, marginTop: 6, wordBreak: 'break-all' }}>{settings.publicUrl}</div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
          <button onClick={copy} style={{ fontSize: 12.5, fontWeight: 600, color: '#B8411A' }}>{copied ? 'Copied ✓' : 'Copy public URL'}</button>
          <button onClick={download} style={{ fontSize: 12.5, fontWeight: 600, color: '#B8411A' }}>Download</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', width: '100%' }}>
        <button className="adm-btn sm qr-btn" disabled={!!ctx.busy} onClick={() => input.current?.click()}>{settings.qrImage ? 'Change QR image…' : 'Upload QR image…'}</button>
        {settings.qrImage && (
          <button className="adm-btn sm qr-btn ghost" disabled={!!ctx.busy} onClick={() => { if (confirm('Remove the uploaded QR and go back to the generated one?')) ctx.run('QR image removed', () => api('PUT', '/qr', { image: null })); }}>Remove uploaded QR</button>
        )}
      </div>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(e) => upload(e.target.files?.[0])} />
    </div>
  );
}

// ---------- live video ----------

export function VideosCard({ ctx }: { ctx: Ctx }) {
  const { state } = useHub();
  const videos = state.videos ?? [];
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [now, setNow] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: '', url: '' });
  const valid = !!parseYouTube(url);
  const add = async () => { if (await ctx.run('Video added', () => api('POST', '/videos', { title, url, makeLive: now }))) { setTitle(''); setUrl(''); } };
  const setLive = (id: string | null) => ctx.run(id ? 'Live Now video changed' : 'Live Now video turned off', () => api('PUT', '/live-video', { id }));

  return (
    <Card n="05" color="#E1302A" title="Live Now video" sub="Paste any YouTube link (a video, a live stream, or a channel's /live page). The one marked LIVE NOW plays in the Live Now card on the home page.">
      <div className="adm-list" style={{ maxHeight: 'none' }}>
        {videos.map((v) => {
          const ref = parseYouTube(v.url), on = state.liveVideo === v.id, thumb = thumbnail(ref);
          return (
            <div key={v.id} className="adm-sess" style={{ alignItems: 'center' }}>
              {editing === v.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                  <input className="adm-input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Title" />
                  <input className="adm-input" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="YouTube link" />
                  <div className="adm-row">
                    <button className="adm-btn sm primary" disabled={!!ctx.busy || !draft.title.trim() || !parseYouTube(draft.url)} onClick={async () => { if (await ctx.run('Video saved', () => api('PUT', `/videos/${encodeURIComponent(v.id)}`, draft))) setEditing(null); }}>Save</button>
                    <button className="adm-btn sm ghost" onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="adm-sess-main">
                    <div className="adm-thumb" style={{ backgroundImage: thumb ? `url("${thumb}")` : undefined }}>{!thumb && (ref?.kind === 'channel' ? 'LIVE' : '?')}</div>
                    <span className="adm-sess-t">{v.title}<small className="ellipsis" style={{ maxWidth: 360 }}>{v.url}</small></span>
                    {on && <span className="adm-pill live">LIVE NOW</span>}
                  </div>
                  <div className="adm-sess-act">
                    {!on && <button className="adm-btn sm" disabled={!!ctx.busy} onClick={() => setLive(v.id)}>Show on Live Now</button>}
                    <button className="adm-btn sm ghost" onClick={() => { setEditing(v.id); setDraft({ title: v.title, url: v.url }); }}>Edit</button>
                    <button className="adm-btn sm ghost" disabled={!!ctx.busy} onClick={() => { if (confirm(`Remove "${v.title}"?`)) ctx.run('Video removed', () => api('DELETE', `/videos/${encodeURIComponent(v.id)}`)); }}>Remove</button>
                  </div>
                </>
              )}
            </div>
          );
        })}
        {videos.length === 0 && <div className="adm-muted" style={{ padding: 12 }}>No videos yet. Add one below.</div>}
      </div>
      {state.liveVideo && <div><button className="adm-btn sm ghost" disabled={!!ctx.busy} onClick={() => setLive(null)}>Turn off the Live Now video</button></div>}
      <div className="adm-2col" style={{ marginTop: 6 }}>
        <label className="adm-field"><span>Title</span><input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="Opening ceremony, live" /></label>
        <label className="adm-field"><span>YouTube link</span><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=… or /live/…" /></label>
      </div>
      {url && !valid && <div className="adm-err">That doesn't look like a YouTube video, live stream or channel link.</div>}
      <div className="adm-row wrap">
        <label className="adm-check"><input type="checkbox" checked={now} onChange={(e) => setNow(e.target.checked)} />Show it on Live Now straight away</label>
        <button className="adm-btn primary" disabled={!!ctx.busy || !title.trim() || !valid} onClick={add}>Add video</button>
      </div>
    </Card>
  );
}

// ---------- countries ----------

const blankCountry = (): Country => ({ id: 'new', name: '', code: '', iso2: '', color: '#173F73', story: '', image: null, flag: null });

export function CountriesCard({ ctx }: { ctx: Ctx }) {
  const { countries, sportsOf } = useHub();
  const [edit, setEdit] = useState<Country | null>(null);
  const save = async () => { if (edit && (await ctx.run(`${edit.name} saved`, () => api('PUT', `/countries/${encodeURIComponent(edit.id)}`, edit)))) setEdit(null); };
  const remove = (c: Country) => {
    const n = sportsOf(c.id).length;
    if (confirm(`Remove ${c.name}${n ? ` and its ${n} sport${n === 1 ? '' : 's'}` : ''}? This cannot be undone.`)) ctx.run(`${c.name} removed`, () => api('DELETE', `/countries/${encodeURIComponent(c.id)}`));
  };
  return (
    <Card n="06" color="#1FA650" title="Countries" sub="Edit each country's name, flag, photo and introduction, add new countries or remove them. Changes appear on the site as soon as you save.">
      {edit ? (
        <div className="adm-editor">
          <div className="adm-label">{edit.id === 'new' ? 'New country' : `Editing ${edit.name}`}</div>
          <div className="adm-2col">
            <label className="adm-field"><span>Name</span><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></label>
            <label className="adm-field"><span>Short code (e.g. IND)</span><input value={edit.code} maxLength={5} onChange={(e) => setEdit({ ...edit, code: e.target.value.toUpperCase() })} /></label>
            <label className="adm-field"><span>Flag code (two letters, e.g. in)</span><input value={edit.iso2} maxLength={2} onChange={(e) => setEdit({ ...edit, iso2: e.target.value.toLowerCase() })} /></label>
            <label className="adm-field"><span>Colour</span><input type="color" value={edit.color} onChange={(e) => setEdit({ ...edit, color: e.target.value })} style={{ height: 42, padding: 4 }} /></label>
          </div>
          <label className="adm-field"><span>Introduction</span><textarea rows={3} maxLength={500} value={edit.story} onChange={(e) => setEdit({ ...edit, story: e.target.value })} /></label>
          <div className="adm-2col">
            <ImageField label="Flag" value={edit.flag} onChange={(v) => setEdit({ ...edit, flag: v })} fallback={edit.iso2 ? `/flags/${edit.iso2}.svg` : undefined} hint="Leave empty to use the standard flag for the flag code." lossless />
            <ImageField label="Country photo" value={edit.image} onChange={(v) => setEdit({ ...edit, image: v })} hint="Shown on country cards and at the top of the country page." />
          </div>
          <label className="adm-check"><input type="checkbox" checked={!!edit.inscribed} onChange={(e) => setEdit({ ...edit, inscribed: e.target.checked })} />Flag carries sacred text: show it only as a badge, never as background art</label>
          <div className="adm-row wrap">
            <button className="adm-btn primary" disabled={!!ctx.busy || !edit.name.trim()} onClick={save}>Save country</button>
            <button className="adm-btn ghost" onClick={() => setEdit(null)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="adm-list">
            {countries.map((c) => (
              <div key={c.id} className="adm-sess">
                <div className="adm-sess-main">
                  <img src={flagUrl(c)} alt="" width={36} height={27} style={{ borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                  <span className="adm-sess-t">{c.name}<small>{c.code} · {sportsOf(c.id).length} sports{c.image ? ' · photo' : ''}</small></span>
                </div>
                <div className="adm-sess-act">
                  <a className="adm-btn sm ghost" href={`/countries/${c.id}`} target="_blank" rel="noreferrer">View</a>
                  <button className="adm-btn sm" onClick={() => setEdit({ ...blankCountry(), ...c })}>Edit</button>
                  <button className="adm-btn sm ghost" disabled={!!ctx.busy} onClick={() => remove(c)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div><button className="adm-btn primary" onClick={() => setEdit(blankCountry())}>+ Add country</button></div>
        </>
      )}
    </Card>
  );
}

// ---------- sports ----------

export function SportsCard({ ctx }: { ctx: Ctx }) {
  const { countries, sportsList, countryById } = useHub();
  const [filter, setFilter] = useState('all');
  const [edit, setEdit] = useState<Sport | null>(null);
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => { if (edit) top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [edit?.id]);
  const list = sportsList.filter((s) => filter === 'all' || s.c === filter);
  const blank = (): Sport => ({ id: 'new', c: filter !== 'all' ? filter : countries[0]?.id ?? '', name: '', type: 'Team', about: '', photo: null, photoCredit: '', photoSource: '' });
  const save = async () => { if (edit && (await ctx.run(`${edit.name} saved`, () => api('PUT', `/sports/${encodeURIComponent(edit.id)}`, edit)))) setEdit(null); };
  return (
    <Card n="07" color="#F28C28" title="Sports" sub="Edit each sport's name, country, type, description and photo, add new sports or remove them.">
      <div ref={top} />
      {edit ? (
        <div className="adm-editor">
          <div className="adm-label">{edit.id === 'new' ? 'New sport' : `Editing ${edit.name}`}</div>
          <div className="adm-2col">
            <label className="adm-field"><span>Name</span><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></label>
            <label className="adm-field"><span>Country</span>
              <select className="adm-select" value={edit.c} onChange={(e) => setEdit({ ...edit, c: e.target.value })}>{countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            </label>
            <label className="adm-field"><span>Type</span>
              <select className="adm-select" value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value as Sport['type'] })}>{SPORT_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
            </label>
          </div>
          <label className="adm-field"><span>Description</span><textarea rows={3} maxLength={800} value={edit.about} onChange={(e) => setEdit({ ...edit, about: e.target.value })} /></label>
          <ImageField label="Photo" value={edit.photo} onChange={(v) => setEdit({ ...edit, photo: v, ...(v && v.startsWith('/api/media/') ? { photoCredit: edit.photoCredit || '', photoSource: '' } : {}) })} hint="Use photos you have the rights to. Credit the photographer below." />
          <div className="adm-2col">
            <label className="adm-field"><span>Photo credit</span><input value={edit.photoCredit ?? ''} maxLength={160} onChange={(e) => setEdit({ ...edit, photoCredit: e.target.value })} placeholder="e.g. Photographer name / Wikimedia Commons" /></label>
            <label className="adm-field"><span>Credit link (optional)</span><input value={edit.photoSource ?? ''} onChange={(e) => setEdit({ ...edit, photoSource: e.target.value })} placeholder="https://…" /></label>
          </div>
          <div className="adm-row wrap">
            <button className="adm-btn primary" disabled={!!ctx.busy || !edit.name.trim() || !edit.c} onClick={save}>Save sport</button>
            <button className="adm-btn ghost" onClick={() => setEdit(null)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="adm-row wrap">
            <select className="adm-select" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by country">
              <option value="all">All countries ({sportsList.length} sports)</option>
              {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button className="adm-btn primary" onClick={() => setEdit(blank())}>+ Add sport</button>
          </div>
          <div className="adm-list">
            {list.map((s) => (
              <div key={s.id} className="adm-sess">
                <div className="adm-sess-main">
                  <div className="adm-thumb" style={{ backgroundImage: s.photo ? `url("${s.photo}")` : undefined }}>{!s.photo && 'No photo'}</div>
                  <span className="adm-sess-t">{s.name}<small>{countryById(s.c)?.name ?? 'No country'} · {s.type}</small></span>
                </div>
                <div className="adm-sess-act">
                  <a className="adm-btn sm ghost" href={`/sports/${s.id}`} target="_blank" rel="noreferrer">View</a>
                  <button className="adm-btn sm" onClick={() => setEdit({ photoCredit: '', photoSource: '', ...s })}>Edit</button>
                  <button className="adm-btn sm ghost" disabled={!!ctx.busy} onClick={() => { if (confirm(`Remove ${s.name}? This cannot be undone.`)) ctx.run(`${s.name} removed`, () => api('DELETE', `/sports/${encodeURIComponent(s.id)}`)); }}>Remove</button>
                </div>
              </div>
            ))}
            {list.length === 0 && <div className="adm-muted" style={{ padding: 12 }}>No sports here yet.</div>}
          </div>
        </>
      )}
    </Card>
  );
}

export type { LiveState };

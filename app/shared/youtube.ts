// Turns any YouTube link people paste (watch, youtu.be, shorts, live, embed, or a channel's
// live page) into an embeddable player URL.

/** `vertical` marks Shorts, which are filmed 9:16. */
export type YouTubeRef = { kind: 'video'; id: string; vertical?: boolean } | { kind: 'channel'; id: string };

const ID = /^[A-Za-z0-9_-]{11}$/;

export function parseYouTube(input: string): YouTubeRef | null {
  let u: URL;
  try { u = new URL(input.trim()); } catch { return ID.test(input.trim()) ? { kind: 'video', id: input.trim() } : null; }
  const host = u.hostname.replace(/^(www|m|music)\./, '');
  const parts = u.pathname.split('/').filter(Boolean);
  if (host === 'youtu.be' && ID.test(parts[0] ?? '')) return { kind: 'video', id: parts[0] };
  if (host !== 'youtube.com' && host !== 'youtube-nocookie.com') return null;
  const v = u.searchParams.get('v');
  if (v && ID.test(v)) return { kind: 'video', id: v };
  if (parts[0] === 'shorts' && ID.test(parts[1] ?? '')) return { kind: 'video', id: parts[1], vertical: true };
  if (['live', 'embed', 'v'].includes(parts[0]) && ID.test(parts[1] ?? '')) return { kind: 'video', id: parts[1] };
  if (parts[0] === 'embed' && parts[1] === 'live_stream') { const ch = u.searchParams.get('channel'); if (ch) return { kind: 'channel', id: ch }; }
  // youtube.com/channel/UC…/live streams whatever that channel has live right now.
  if (parts[0] === 'channel' && /^UC[A-Za-z0-9_-]{22}$/.test(parts[1] ?? '')) return { kind: 'channel', id: parts[1] };
  return null;
}

/** `api` turns on the IFrame Player API so the page's own buttons can drive the player. */
export function embedUrl(ref: YouTubeRef, opts: { background: boolean; api?: boolean; origin?: string }) {
  const p = new URLSearchParams({ autoplay: '1', playsinline: '1', rel: '0', modestbranding: '1' });
  if (opts.api) { p.set('enablejsapi', '1'); if (opts.origin) p.set('origin', opts.origin); }
  if (opts.background) { p.set('mute', '1'); p.set('controls', '0'); p.set('disablekb', '1'); p.set('iv_load_policy', '3'); }
  else { p.set('mute', '0'); p.set('controls', '1'); }
  if (ref.kind === 'channel') { p.set('channel', ref.id); return `https://www.youtube.com/embed/live_stream?${p}`; }
  if (opts.background) { p.set('loop', '1'); p.set('playlist', ref.id); }
  return `https://www.youtube-nocookie.com/embed/${ref.id}?${p}`;
}

export const thumbnail = (ref: YouTubeRef | null) => (ref?.kind === 'video' ? `https://i.ytimg.com/vi/${ref.id}/mqdefault.jpg` : null);

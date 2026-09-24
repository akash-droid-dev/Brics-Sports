import { useEffect, useRef, useState, type CSSProperties } from 'react';

/**
 * Wikimedia serves each clip as several transcodes. VP9 WebM is the sharpest, but iPhones and
 * older Safari may refuse it, and small source files have no 480p version. So we offer
 * VP9 → VP8 at two sizes → the original upload, and the browser plays the first one it can.
 */
export function clipSources(url: string): string[] {
  // Bundled clip: H.264 MP4 plays everywhere (incl. iPhone); the WebM original is the fallback.
  if (url.startsWith('/media/') && url.endsWith('.mp4')) return [url, url.replace(/\.mp4$/, '.webm')];
  const m = /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/transcoded\/(.+?)\/([^/]+)\.480p\.vp9\.webm$/.exec(url);
  if (!m) return [url];
  const [, base, path, file] = m;
  const t = (suffix: string) => `${base}/transcoded/${path}/${file}.${suffix}`;
  return [t('480p.vp9.webm'), t('480p.webm'), t('360p.vp9.webm'), t('360p.webm'), `${base}/${path}`];
}

/** Local clips ship with a still frame, shown until the video starts. */
const posterOf = (u: string) => (u.startsWith('/media/') ? u.replace(/\.mp4$/, '.jpg') : undefined);

const typeOf = (u: string) => (u.endsWith('.webm') ? 'video/webm' : u.endsWith('.mp4') ? 'video/mp4' : undefined);

interface Props {
  src: string;
  /** Muted, looping background clip that starts by itself (Live Now card). */
  ambient?: boolean;
  fit?: CSSProperties['objectFit'];
  label: string;
}

/**
 * A video that always ends in a visible state: playing, a tap-to-play button when autoplay is
 * blocked (Low Power Mode, data saver), or hidden when no source can be played, so the photo
 * behind it shows instead of a black box.
 */
export function Clip({ src, ambient = false, fit = 'cover', label }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<'loading' | 'playing' | 'blocked' | 'failed'>('loading');
  const sources = clipSources(src);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setState('loading');
    // React does not reflect `muted` as an attribute; browsers need the property set before play().
    el.muted = ambient;
    el.load();
    el.play().then(() => setState('playing')).catch((e: DOMException) => {
      // NotAllowedError = autoplay blocked; anything else is a load error, handled by onError below.
      if (e?.name === 'NotAllowedError') setState('blocked');
    });
  }, [src, ambient]);

  const tapToPlay = () => { ref.current?.play().then(() => setState('playing')).catch(() => setState('failed')); };

  if (state === 'failed') {
    return ambient ? null : (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,8,6,.7)', color: '#fff', fontSize: 14, fontWeight: 600, textAlign: 'center', padding: 16 }}>
        This clip can't play on this device right now.
      </div>
    );
  }
  return (
    <>
      <video
        ref={ref}
        aria-label={label}
        muted={ambient}
        loop
        playsInline
        controls={!ambient && state === 'playing'}
        preload="auto"
        poster={posterOf(src)}
        onPlaying={() => setState('playing')}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: fit, background: ambient ? 'transparent' : '#000', opacity: state === 'playing' ? 1 : 0, transition: 'opacity .4s' }}
      >
        {sources.map((u, i) => (
          <source key={u} src={u} type={typeOf(u)} onError={i === sources.length - 1 ? () => setState('failed') : undefined} />
        ))}
      </video>
      {state === 'blocked' && (
        <button onClick={(e) => { e.stopPropagation(); tapToPlay(); }} aria-label={`Play ${label}`}
          style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 2, display: 'flex', alignItems: 'center', gap: 10, height: 48, borderRadius: 24, background: '#fff', color: '#16120E', padding: '0 20px 0 7px', fontWeight: 700, fontSize: 15, boxShadow: '0 10px 30px rgba(0,0,0,.4)' }}>
          <span style={{ width: 36, height: 36, borderRadius: '50%', background: '#E1302A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="14" viewBox="0 0 10 12" aria-hidden="true"><path d="M1 1 L9 6 L1 11 Z" fill="#fff" /></svg>
          </span>
          Tap to play
        </button>
      )}
      {state === 'loading' && !ambient && (
        <span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '50%', width: 34, height: 34, margin: -17, borderRadius: '50%', border: '3px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'ftsSpin .9s linear infinite' }} />
      )}
    </>
  );
}

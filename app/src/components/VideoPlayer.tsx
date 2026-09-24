import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { embedUrl, type YouTubeRef } from '../../shared/youtube.ts';

// Minimal typing for the parts of the YouTube IFrame Player API we use.
interface YTPlayer {
  playVideo(): void; pauseVideo(): void; mute(): void; unMute(): void; isMuted(): boolean;
  seekTo(s: number, allowSeekAhead: boolean): void; getCurrentTime(): number; getDuration(): number;
  getPlayerState(): number; getVideoData?(): { isLive?: boolean }; destroy(): void;
}
interface YTApi { Player: new (el: HTMLIFrameElement, opts: { events: Record<string, (e: { data: number }) => void> }) => YTPlayer }
declare global { interface Window { YT?: YTApi; onYouTubeIframeAPIReady?: () => void } }

let apiPromise: Promise<YTApi> | null = null;
/** Loads YouTube's official IFrame Player API once. */
function loadApi(): Promise<YTApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ??= new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT!); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = () => { apiPromise = null; reject(new Error('YouTube player API unavailable')); };
    document.head.appendChild(s);
  });
  return apiPromise;
}


const PATHS = {
  play: 'M8 5v14l11-7z',
  pause: 'M7 5h4v14H7zM13 5h4v14h-4z',
  back: 'M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z',
  fwd: 'M12 5V2l5 4-5 4V7a6 6 0 1 0 6 6h2a8 8 0 1 1-8-8z',
  vol: 'M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z',
  mute: 'M4 9v6h4l5 4V5L8 9H4zm12.6 3 2.7-2.7-1.3-1.3-2.7 2.7-2.7-2.7-1.3 1.3 2.7 2.7-2.7 2.7 1.3 1.3 2.7-2.7 2.7 2.7 1.3-1.3z',
  full: 'M4 4h6v2H6v4H4zm10 0h6v6h-2V6h-4zM4 14h2v4h4v2H4zm14 0h2v6h-6v-2h4z',
  exit: 'M8 4h2v6H4V8h4zm6 0h2v4h4v2h-6zM4 14h6v6H8v-4H4zm10 0h6v2h-4v4h-2z',
  close: 'M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6L19 6.4 17.6 5 12 10.6z',
};
const Icon = ({ d }: { d: keyof typeof PATHS }) => <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d={PATHS[d]} fill="currentColor" /></svg>;

const PLAYING = 1, BUFFERING = 3;
const fmt = (s: number) => {
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
};

/**
 * Big-screen YouTube player. The video keeps YouTube's own player and controls, and our
 * buttons sit in a bar below it (never over it), driven through the official IFrame API.
 */
export function VideoTheater({ yt, title, onClose }: { yt: YouTubeRef; title: string; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);
  const [live, setLive] = useState(yt.kind === 'channel');
  const [full, setFull] = useState(false);
  const canFull = typeof document !== 'undefined' && !!document.fullscreenEnabled;
  const vertical = yt.kind === 'video' && !!yt.vertical;

  useEffect(() => {
    let alive = true;
    loadApi().then((YT) => {
      if (!alive || !frame.current) return;
      player.current = new YT.Player(frame.current, {
        events: {
          onReady: () => { if (!alive) return; setReady(true); setMuted(player.current!.isMuted()); },
          onStateChange: (e) => alive && setPlaying(e.data === PLAYING || e.data === BUFFERING),
        },
      });
    }).catch(() => { /* YouTube's own controls still work */ });
    return () => { alive = false; player.current?.destroy?.(); player.current = null; };
  }, []);

  // Follow the playhead for the time readout and seek bar.
  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => {
      const p = player.current; if (!p) return;
      setT(p.getCurrentTime() || 0);
      setDur(p.getDuration() || 0);
      if (p.getVideoData?.().isLive) setLive(true);
    }, 500);
    return () => clearInterval(id);
  }, [ready]);

  const close = useCallback(() => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); onClose(); }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.fullscreenElement) close(); };
    const onFs = () => setFull(document.fullscreenElement === box.current);
    document.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFs);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('fullscreenchange', onFs); document.body.style.overflow = overflow; };
  }, [close]);

  const p = () => player.current;
  const seek = (to: number) => { const x = p(); if (!x) return; const d = x.getDuration() || 0; const v = Math.max(0, d ? Math.min(to, d - 0.5) : to); x.seekTo(v, true); setT(v); };
  const toggle = () => { const x = p(); if (!x) return; if (playing) x.pauseVideo(); else x.playVideo(); setPlaying(!playing); };
  const toggleMute = () => { const x = p(); if (!x) return; if (muted) x.unMute(); else x.mute(); setMuted(!muted); };
  const toggleFull = () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else box.current?.requestFullscreen().catch(() => {}); };
  const atLiveEdge = live && dur - t < 15;

  return createPortal(
    <div className="vt" ref={box} role="dialog" aria-modal="true" aria-label={title}>
      <div className="vt-top">
        <span className="vt-title ellipsis">{live && <span className="vt-live">LIVE</span>}{title}</span>
        <button className="vt-btn" onClick={close} aria-label="Close video"><Icon d="close" /><span className="vt-lbl">Close</span></button>
      </div>
      <div className="vt-stage">
        <div className={'vt-frame' + (vertical ? ' vertical' : '')}>
          <iframe ref={frame} src={embedUrl(yt, { background: false, api: true, origin: location.origin })} title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        </div>
      </div>
      <div className="vt-bar" aria-label="Video controls">
        <button className="vt-btn" onClick={() => seek(t - 10)} disabled={!ready} aria-label="Back 10 seconds"><Icon d="back" /><span className="vt-lbl">10s</span></button>
        <button className="vt-btn vt-play" onClick={toggle} disabled={!ready} aria-label={playing ? 'Pause' : 'Play'}><Icon d={playing ? 'pause' : 'play'} /></button>
        <button className="vt-btn" onClick={() => seek(t + 10)} disabled={!ready || atLiveEdge} aria-label="Forward 10 seconds"><span className="vt-lbl">10s</span><Icon d="fwd" /></button>
        <span className="vt-time mono">{fmt(t)}{dur > 0 && !live ? ` / ${fmt(dur)}` : ''}</span>
        <input className="vt-seek" type="range" min={0} max={Math.max(dur, 1)} step={1} value={Math.min(t, dur || 1)} disabled={!ready || !dur}
          onChange={(e) => seek(Number(e.target.value))} aria-label="Seek" />
        {live && <button className="vt-btn" onClick={() => seek(p()?.getDuration() ?? t)} disabled={!ready || atLiveEdge}>{atLiveEdge ? '● Live' : 'Go live'}</button>}
        <button className="vt-btn" onClick={toggleMute} disabled={!ready} aria-label={muted ? 'Unmute' : 'Mute'}><Icon d={muted ? 'mute' : 'vol'} /></button>
        {canFull && <button className="vt-btn" onClick={toggleFull} aria-label={full ? 'Exit full screen' : 'Full screen'}><Icon d={full ? 'exit' : 'full'} /><span className="vt-lbl">{full ? 'Exit full screen' : 'Full screen'}</span></button>}
      </div>
    </div>,
    document.body,
  );
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// What fades and rises into view as visitors scroll: page sections, cards and tiles.
const SELECTOR = 'main section, main .card, main .quick, main .section-head, main .srow, main .list-row';

/**
 * Scroll animations: each block fades up as it enters the screen, with blocks arriving together
 * staggered slightly. When the animation ends the helper classes are removed, so hover effects and
 * sticky layouts behave exactly as before. Skipped for visitors who ask for reduced motion.
 */
export function ScrollReveal() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const main = document.querySelector('main');
    if (!main) return;
    const seen = new WeakSet<Element>();
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const io = new IntersectionObserver((entries) => {
      let k = 0;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        io.unobserve(el);
        const delay = Math.min(k++, 5) * 70;
        el.style.transitionDelay = `${delay}ms`;
        el.classList.add('in');
        const t = setTimeout(() => { el.classList.remove('reveal', 'in'); el.style.transitionDelay = ''; timers.delete(t); }, 800 + delay);
        timers.add(t);
      }
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    const scan = () => main.querySelectorAll(SELECTOR).forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      // Blocks nested inside one that is still animating ride along with it, and anything already
      // on screen stays put: only content that scrolls into view animates.
      if (el.parentElement?.closest('.reveal')) return;
      if (el.getBoundingClientRect().top < innerHeight) return;
      el.classList.add('reveal');
      io.observe(el);
    });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(main, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); timers.forEach(clearTimeout); };
  }, [pathname]);
  return null;
}

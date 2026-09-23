/**
 * Wheel smooth scrolling, equivalent to Lenis as configured by the site's
 * "Smooth Scroll" component (intensity 20 → duration 2s, Lenis' default
 * exponential ease-out). Touch, keyboard and scrollbar scrolling stay native;
 * native scrolls re-sync the internal position like Lenis does.
 */
(function () {
  'use strict';
  const FourK = (window.FourK = window.FourK || {});

  const DURATION = 2; // seconds (intensity / 10)
  const LINE_HEIGHT = 100 / 6; // Lenis: px per line for deltaMode 1
  const ease = t => Math.min(1, 1.001 - Math.pow(2, -10 * t));

  function init() {
    const root = document.documentElement;
    let animated = window.scrollY; // position we last wrote
    let target = animated;
    let from = animated;
    let elapsed = 0;
    let smoothing = false;
    let lastTime = 0;
    let nativeTimer = 0;

    const limit = () => root.scrollHeight - window.innerHeight;

    const setState = state => {
      root.classList.toggle('lenis-smooth', state === 'smooth');
      root.classList.toggle('lenis-scrolling', !!state);
    };

    const frame = time => {
      const dt = lastTime ? (time - lastTime) / 1000 : 0;
      lastTime = time;
      if (smoothing) {
        elapsed += dt;
        const p = Math.min(elapsed / DURATION, 1);
        animated = from + (target - from) * ease(p);
        if (p >= 1) {
          animated = target;
          smoothing = false;
          setState(false);
        }
        window.scrollTo(0, animated);
      }
      requestAnimationFrame(frame);
    };

    window.addEventListener(
      'wheel',
      event => {
        if (event.ctrlKey) return; // pinch zoom
        if (event.composedPath().some(n => n instanceof Element && n.hasAttribute('data-lenis-prevent'))) return;
        event.preventDefault();
        let delta = event.deltaY;
        if (event.deltaMode === 1) delta *= LINE_HEIGHT;
        else if (event.deltaMode === 2) delta *= window.innerHeight;
        const next = Math.min(Math.max(target + delta, 0), limit());
        if (next === target) return;
        target = next;
        from = animated;
        elapsed = 0;
        smoothing = true;
        setState('smooth');
      },
      { passive: false }
    );

    // Native scrolls (keyboard, scrollbar, touch, anchor jumps) re-sync the position.
    window.addEventListener(
      'scroll',
      () => {
        if (smoothing) return;
        animated = target = window.scrollY;
        setState('native');
        clearTimeout(nativeTimer);
        nativeTimer = setTimeout(() => setState(false), 150);
      },
      { passive: true }
    );

    requestAnimationFrame(frame);
  }

  FourK.smoothScroll = { init };
})();

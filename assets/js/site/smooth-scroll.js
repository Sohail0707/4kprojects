/**
 * Smooth scrolling via Lenis (assets/js/vendor/lenis.min.js), configured like
 * the site's Framer "Smooth Scroll" component: intensity 20 → duration 2s.
 */
(function () {
  'use strict';
  const FourK = (window.FourK = window.FourK || {});

  const INTENSITY = 20;

  function init() {
    if (!window.Lenis) return;
    const lenis = new window.Lenis({ duration: INTENSITY / 10 });
    const raf = time => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    FourK.lenis = lenis;
  }

  FourK.smoothScroll = { init };
})();

/**
 * Stats card counter ("0+ ARTISTS" → "22+ ARTISTS"). Springs from 0 to the
 * target the first time half of it is visible, like the original component
 * (useSpring with stiffness 100, damping 30).
 */
(function () {
  'use strict';
  const FourK = (window.FourK = window.FourK || {});

  const SPRING = { stiffness: 100, damping: 30, mass: 1 };
  const REST_DELTA = 0.5;

  const format = (value, decimals) => {
    const fixed = value.toFixed(decimals);
    return value >= 1000 ? Number(fixed).toLocaleString() : fixed;
  };

  function run(el, from, to, decimals) {
    const at = FourK.motion.springPosition(SPRING, from, to);
    const start = performance.now();
    const tick = now => {
      const v = at(now - start);
      if (Math.abs(to - v) <= REST_DELTA) {
        el.textContent = format(to, decimals);
        return;
      }
      el.textContent = format(v, decimals);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function init() {
    const el = document.querySelector('.framer-gkbekc-container > span');
    const end = FourK.content?.artists;
    if (!el || end === undefined) return;
    FourK.motion.onceInView(el, () => run(el, 0, end, 0), 0.5);
  }

  FourK.counter = { init };
})();

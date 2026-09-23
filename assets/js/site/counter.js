/**
 * Stats card counter ("0+ ARTISTS" → "22+ ARTISTS"). Springs from 0 to the
 * target the first time half of it is visible, like the original component
 * (useSpring with stiffness 100, damping 30).
 */
(function () {
  'use strict';
  const FourK = (window.FourK = window.FourK || {});

  const SPRING = { type: 'spring', stiffness: 100, damping: 30 };

  const format = (value, decimals) => {
    const fixed = value.toFixed(decimals);
    return value >= 1000 ? Number(fixed).toLocaleString() : fixed;
  };

  function init() {
    const el = document.querySelector('.framer-gkbekc-container > span');
    const end = FourK.content?.artists;
    if (!el || end === undefined) return;
    FourK.motion.onceInView(el, () => {
      FourK.motion.animateValue(0, end, SPRING, v => (el.textContent = format(v, 0)));
    }, 0.5);
  }

  FourK.counter = { init };
})();

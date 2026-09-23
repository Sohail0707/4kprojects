/**
 * Scroll-driven effects, ported from Framer's runtime:
 *  - hero title/intro fade out while the "Our story" section scrolls into view
 *  - logo, menu and WhatsApp button hide on scroll down, reappear on scroll up
 *  - the menu switches colour variant depending on which section is under it
 */
(function () {
  'use strict';
  const FourK = (window.FourK = window.FourK || {});

  const SECTION_OFFSET = 1; // Framer subtracts 1px from section tops
  const DIRECTION_THRESHOLD = 4; // px of travel before a direction change counts
  const HIDE_TRANSITION = { type: 'spring', bounce: 0.2, duration: 0.4 };

  // Opacity 1 → 0 across the height of #overview, starting when its top enters
  // the bottom of the viewport (Framer "scroll target" transform, threshold 1).
  function heroFade() {
    const { documentTop, interpolate, onScroll } = FourK.motion;
    const target = document.getElementById('overview');
    const elements = document.querySelectorAll('.framer-s3nmhd, .framer-1xerb4');
    if (!target || !elements.length) return;
    onScroll(y => {
      const start = documentTop(target) - SECTION_OFFSET - window.innerHeight;
      const end = Math.max(start + target.clientHeight, 0);
      const opacity = interpolate([Math.max(start, 0), end], [1, 0], y);
      elements.forEach(el => (el.style.opacity = String(opacity)));
    });
  }

  // Framer "scroll direction" appear effect.
  function hideOnScrollDown() {
    const { animate, onScroll } = FourK.motion;
    const elements = document.querySelectorAll('a.framer-1e377g7, .framer-11ukeun-container, .framer-xkato5-container');
    let last;
    let direction;
    let anchor = 0;
    let hidden = false;
    onScroll((y, limit) => {
      if (y > limit || y < 0) return;
      const d = y < (last ?? 0) ? 'up' : 'down';
      last = y;
      if (d !== direction) {
        direction = d;
        anchor = y;
        return;
      }
      if (Math.abs(y - anchor) < DIRECTION_THRESHOLD) return;
      const hide = d === 'down';
      if (hide === hidden) return;
      hidden = hide;
      elements.forEach(el => animate(el, { opacity: hide ? '0' : '1' }, HIDE_TRANSITION));
    });
  }

  // Framer variant appear effect with scroll targets: the variant of the last
  // section whose top has been passed; the base variant before the first one.
  function sectionVariants(targets, onChange) {
    const { documentTop, interpolate, onScroll } = FourK.motion;
    const refs = targets.map(t => document.getElementById(t.id));
    let current;
    onScroll(y => {
      // Port of Framer's range builder: each section maps to [top, end] → index.
      const input = [];
      const output = [];
      let nextStart;
      for (let i = refs.length - 1; i >= 0; i--) {
        const el = refs[i];
        if (!el) continue;
        const start = documentTop(el) - SECTION_OFFSET;
        const end = Math.max(start + el.clientHeight, 0);
        input.unshift(Math.max(start, 0), nextStart === undefined ? end : Math.min(end, Math.max(nextStart - 1, 0)));
        output.unshift(i, i);
        nextStart = start;
      }
      if (!input.length) return;
      if (input[0] > 1) {
        input.unshift(0, Math.max(input[0] - 1, 0));
        output.unshift(-1, -1);
      }
      const index = Math.floor(interpolate(input, output, y));
      const variant = index >= 0 ? targets[index].variant : undefined;
      if (variant === current) return;
      current = variant;
      onChange(variant);
    });
  }

  function init() {
    heroFade();
    hideOnScrollDown();
    if (FourK.menu) {
      sectionVariants(
        [
          { id: 'overview', variant: 'closedAbout' },
          { id: 'team', variant: 'closed' },
          { id: 'footer2', variant: 'closedAbout' },
        ],
        variant => FourK.menu.setVariant(variant ?? 'closed')
      );
    }
  }

  FourK.scrollEffects = { init };
})();

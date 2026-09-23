/**
 * Framer "appear" text effects. The saved markup already contains the token
 * spans Framer generated (one per word, or one per character for line
 * effects); this animates them the way Framer's runtime does:
 *   word → each word staggered by 0.05s after startDelay
 *   line → characters grouped into rendered lines, each line staggered 0.05s
 *
 * Self-contained (plain Web Animations, no library) so the hero reveal can run
 * inline, straight after the hero markup, without waiting for the JS bundle:
 *   FourK.textEffects.mount() → effects triggered on load (hero)
 *   FourK.textEffects.init()  → effects triggered when scrolled into view
 */
(function () {
  'use strict';
  const FourK = (window.FourK = window.FourK || {});

  const HIDDEN = { opacity: '0.001', transform: 'translateY(30px)' };
  const SHOWN = { opacity: '1', transform: 'none' };
  const TIMING = { duration: 1000, easing: 'cubic-bezier(0.44, 0, 0.05, 1)' };
  const STAGGER = 0.05; // seconds

  // Settings from the page component (Framer effect configs).
  const EFFECTS = [
    { selector: '.framer-s3nmhd', tokenization: 'word', trigger: 'mount', startDelay: 0 },    // "About"
    { selector: '.framer-1xerb4', tokenization: 'line', trigger: 'mount', startDelay: 0.4 },  // hero intro
    { selector: '.framer-pshk9n', tokenization: 'line', trigger: 'inView', threshold: 0.5, startDelay: 0.4 }, // team intro
    { selector: '.framer-42eout', tokenization: 'word', trigger: 'inView', threshold: 0.5, startDelay: 0 },   // FAQ title
  ];

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tokensOf = container => [...container.querySelectorAll('span')].filter(s => s.style.display === 'inline-block');

  // Framer groups tokens into lines by their offsetTop.
  function groupLines(tokens) {
    const lines = [];
    let line = [];
    let top = null;
    for (const token of tokens) {
      const y = token.offsetTop;
      const h = token.offsetHeight;
      if (!h || top === null || y === top) line.push(token);
      else {
        lines.push(line);
        line = [token];
      }
      if (h) top = y;
    }
    lines.push(line);
    return lines;
  }

  function reveal(token, delay) {
    const from = reducedMotion ? { opacity: HIDDEN.opacity } : HIDDEN;
    const to = reducedMotion ? { opacity: SHOWN.opacity } : SHOWN;
    Object.assign(token.style, to); // final state, kept after the animation
    token.animate([from, to], { ...TIMING, delay: delay * 1000, fill: 'backwards' });
  }

  function play(container, effect) {
    const tokens = tokensOf(container);
    const groups = effect.tokenization === 'line' ? groupLines(tokens) : tokens.map(t => [t]);
    groups.forEach((group, i) => group.forEach(token => reveal(token, effect.startDelay + i * STAGGER)));
  }

  function each(trigger, fn) {
    for (const effect of EFFECTS.filter(e => e.trigger === trigger)) {
      document.querySelectorAll(effect.selector).forEach(container => fn(container, effect));
    }
  }

  function mount() {
    each('mount', play);
  }

  function init() {
    each('inView', (container, effect) => {
      const io = new IntersectionObserver(
        entries => {
          if (!entries.some(e => e.isIntersecting && e.intersectionRatio >= effect.threshold)) return;
          io.disconnect();
          play(container, effect);
        },
        { threshold: effect.threshold }
      );
      io.observe(container);
    });
  }

  FourK.textEffects = { mount, init };
})();

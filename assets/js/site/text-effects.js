/**
 * Framer "appear" text effects. The saved markup already contains the token
 * spans Framer generated (one per word, or one per character for line
 * effects); this animates them the way Framer's runtime does:
 *   word → each word staggered by 0.05s after startDelay
 *   line → characters grouped into rendered lines, each line staggered 0.05s
 */
(function () {
  'use strict';
  const FourK = (window.FourK = window.FourK || {});

  const FROM = { opacity: 0.001, y: 30 };
  const TO = { opacity: 1, y: 0 };
  const TRANSITION = { duration: 1, ease: [0.44, 0, 0.05, 1] };
  const STAGGER = 0.05;

  // Settings from the page component (Framer effect configs).
  const EFFECTS = [
    { selector: '.framer-s3nmhd', tokenization: 'word', trigger: 'mount', startDelay: 0 },    // "About"
    { selector: '.framer-1xerb4', tokenization: 'line', trigger: 'mount', startDelay: 0.4 },  // hero intro
    { selector: '.framer-pshk9n', tokenization: 'line', trigger: 'inView', threshold: 0.5, startDelay: 0.4 }, // team intro
    { selector: '.framer-42eout', tokenization: 'word', trigger: 'inView', threshold: 0.5, startDelay: 0 },   // FAQ title
  ];

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

  function play(container, effect) {
    const { animate, reducedMotion } = FourK.motion;
    const [to, from] = reducedMotion ? [{ opacity: TO.opacity }, { opacity: FROM.opacity }] : [TO, FROM];
    const tokens = tokensOf(container);
    const groups = effect.tokenization === 'line' ? groupLines(tokens) : tokens.map(t => [t]);
    groups.forEach((group, i) => {
      const transition = { ...TRANSITION, delay: effect.startDelay + i * STAGGER };
      group.forEach(token => animate(token, to, transition, from));
    });
  }

  function init() {
    const { onceInView, reducedMotion } = FourK.motion;
    for (const effect of EFFECTS) {
      for (const container of document.querySelectorAll(effect.selector)) {
        for (const token of tokensOf(container)) {
          token.style.opacity = String(FROM.opacity);
          token.style.transform = reducedMotion ? 'none' : `translateY(${FROM.y}px)`;
        }
        if (effect.trigger === 'mount') play(container, effect);
        else onceInView(container, () => play(container, effect), effect.threshold);
      }
    }
  }

  FourK.textEffects = { init };
})();

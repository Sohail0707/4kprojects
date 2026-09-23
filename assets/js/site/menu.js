/**
 * Site menu ("navigations/menu" component) with the variants used on this
 * page: two closed colour variants (switched by scroll position) and open.
 * Opening morphs the burger, fades the overlay in and slides the menu panel
 * in with staggered items; the burger or the overlay closes it.
 */
(function () {
  'use strict';
  const FourK = (window.FourK = window.FourK || {});

  const LIGHT = 'var(--token-884cfea7-de33-414f-85f3-697f43a28d53, rgb(219, 220, 208))';
  const VARIANTS = {
    closed: { cls: 'framer-v-14u7uxq', name: 'Closed', line: 'rgb(0, 0, 0)', open: false },
    closedAbout: { cls: 'framer-v-1tt3yf7', name: 'Closed About', line: LIGHT, open: false },
    open: { cls: 'framer-v-185ocwe', name: 'Open', line: 'rgb(255, 255, 255)', open: true },
  };
  const BURGER = {
    closed: { cls: 'framer-v-1cnxdp4', name: 'Default' },
    open: { cls: 'framer-v-14nuivc', name: 'Close' },
  };

  const OVERLAY = { duration: 0.36, ease: [0.64, 0.07, 0.43, 0.94] };
  const LINE_TRANSITIONS = [
    { type: 'spring', bounce: 0.3, duration: 1.6 },
    { type: 'spring', bounce: 0.3, delay: 0.12, duration: 1.5 },
  ];
  const HIDDEN = { opacity: 0.001, x: 150 };
  const SHOWN = { opacity: 1, x: 0 };
  const PANEL_IN = { type: 'spring', bounce: 0, delay: 0.4, duration: 0.8 };
  const INNER_IN = { type: 'spring', bounce: 0.2, delay: 0.3, duration: 0.6 };
  const ITEM_STAGGER = 0.1;
  const itemIn = i => ({ type: 'spring', bounce: 0.2, delay: i * ITEM_STAGGER, duration: 0.6 });

  let state = null;

  // Framer layout animation: animate each line from its old box to its new one.
  function morphLines(lines, change, transitions) {
    const { animate } = FourK.motion;
    const before = lines.map(l => l.getBoundingClientRect());
    change();
    lines.forEach((line, i) => {
      const after = line.getBoundingClientRect();
      if (!after.width || !before[i].width) return;
      const dx = before[i].left - after.left;
      const sx = before[i].width / after.width;
      line.style.transformOrigin = '0 0';
      animate(line, { x: 0, scaleX: 1 }, transitions[i], { x: dx, scaleX: sx });
    });
  }

  function openPanel() {
    const { animate } = FourK.motion;
    const template = document.getElementById('menu-panel');
    if (!template || state.panel) return;
    const panel = template.content.firstElementChild.cloneNode(true);
    const inner = panel.querySelector('.framer-1azb5yw');
    const items = [...panel.querySelectorAll('a.framer-1avswfa')];
    state.overlay.after(panel);
    state.panel = panel;
    animate(panel, SHOWN, PANEL_IN, HIDDEN);
    if (inner) animate(inner, SHOWN, INNER_IN, HIDDEN);
    items.forEach((item, i) => animate(item, SHOWN, itemIn(i), HIDDEN));
  }

  function setVariant(key) {
    if (!state || state.variant === key) return;
    const { animate } = FourK.motion;
    const variant = VARIANTS[key];
    const wasOpen = VARIANTS[state.variant].open;
    state.variant = key;

    const { root, button, lines, overlay } = state;
    Object.values(VARIANTS).forEach(v => root.classList.remove(v.cls));
    root.classList.add(variant.cls);
    root.setAttribute('data-framer-name', variant.name);

    if (variant.open !== wasOpen) {
      const burger = variant.open ? BURGER.open : BURGER.closed;
      morphLines(lines, () => {
        button.classList.remove(BURGER.open.cls, BURGER.closed.cls);
        button.classList.add(burger.cls);
        button.setAttribute('data-framer-name', burger.name);
      }, LINE_TRANSITIONS);
      animate(overlay, { opacity: variant.open ? 1 : 0 }, OVERLAY);
      if (variant.open) openPanel();
      else {
        state.panel?.remove();
        state.panel = null;
      }
    }
    lines.forEach((line, i) => animate(line, { backgroundColor: variant.line }, LINE_TRANSITIONS[i]));
  }

  function init() {
    const root = document.querySelector('.framer-xkato5-container .framer-qAe9z');
    if (!root) return;
    const button = root.querySelector('button.framer-eEBwL');
    const overlay = root.querySelector('.framer-j6ouqj');
    const lines = [root.querySelector('.framer-15dom7a'), root.querySelector('.framer-1x65u3f')];
    if (!button || !overlay || lines.includes(null)) return;
    state = { root, button, overlay, lines, variant: 'closed', panel: null };

    button.addEventListener('click', () => setVariant(VARIANTS[state.variant].open ? 'closed' : 'open'));
    overlay.addEventListener('click', () => {
      if (VARIANTS[state.variant].open) setVariant('closed');
    });
  }

  FourK.menu = { init, setVariant };
})();

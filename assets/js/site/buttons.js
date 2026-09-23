/**
 * Underline button hover ("Button" component, e.g. "See our work"): the
 * resting underline slides out to the right while a second line grows in from
 * the left, and the label switches to medium weight.
 */
(function () {
  'use strict';
  const FourK = (window.FourK = window.FourK || {});

  const TRANSITION = { duration: 0.6, ease: [0.45, 0, 0.05, 1] };
  const GEOMETRY = ['left', 'top', 'width'];

  const box = el => ({ left: `${el.offsetLeft}px`, top: `${el.offsetTop}px`, width: `${el.offsetWidth}px` });
  const running = new WeakMap(); // line → Motion animation controls

  const reset = line => {
    GEOMETRY.forEach(p => (line.style[p] = ''));
    line.style.right = line.style.bottom = '';
  };

  // Framer layout animation for absolutely positioned lines: animate each
  // line's box from where it was to where the new variant's CSS puts it.
  function morph(lines, change) {
    const { animate } = FourK.motion;
    const before = lines.map(box);
    lines.forEach(line => {
      running.get(line)?.stop();
      reset(line);
    });
    change();
    lines.forEach((line, i) => {
      const after = box(line);
      line.style.right = line.style.bottom = 'auto';
      const controls = animate(line, after, TRANSITION, before[i]);
      running.set(line, controls);
      controls.finished.then(() => {
        if (running.get(line) === controls) reset(line);
      });
    });
  }

  function setup(button) {
    const lines = [button.querySelector('.framer-bf6ukw'), button.querySelector('.framer-o8qgr8')];
    const label = button.querySelector('p');
    const baseName = button.getAttribute('data-framer-name');
    if (lines.includes(null)) return;

    const set = hover =>
      morph(lines, () => {
        button.classList.toggle('hover', hover);
        if (hover) button.removeAttribute('data-framer-name');
        else if (baseName) button.setAttribute('data-framer-name', baseName);
        if (label) {
          if (hover) {
            label.style.setProperty('--font-selector', 'R0Y7RE0gU2Fucy01MDA=');
            label.style.setProperty('--framer-font-weight', '500');
          } else {
            label.style.setProperty('--font-selector', 'R0Y7RE0gU2Fucy1yZWd1bGFy');
            label.style.removeProperty('--framer-font-weight');
          }
        }
      });

    button.addEventListener('pointerenter', e => e.pointerType !== 'touch' && set(true));
    button.addEventListener('pointerleave', e => e.pointerType !== 'touch' && set(false));
  }

  function init() {
    document.querySelectorAll('a.framer-eAl6n').forEach(setup);
  }

  FourK.buttons = { init };
})();

/**
 * Thin adapter over Motion (assets/js/vendor/motion.js), the animation engine
 * behind Framer Motion. Transitions are passed straight through in Framer's
 * format, e.g. { type: 'spring', bounce: 0.2, duration: 0.4 } or
 * { duration: 0.6, ease: [0.44, 0, 0.56, 1] }, so timings match the original
 * components exactly. Also holds the small DOM/scroll helpers the Framer
 * runtime used.
 */
(function () {
  'use strict';
  const FourK = (window.FourK = window.FourK || {});
  const Motion = window.Motion;

  /**
   * Animate an element to `to`. Values in `from` become the first keyframe;
   * otherwise Motion starts from the current (possibly mid-animation) value.
   */
  function animate(el, to, transition, from) {
    const keyframes = {};
    for (const key of Object.keys(to)) keyframes[key] = from && key in from ? [from[key], to[key]] : to[key];
    return Motion.animate(el, keyframes, transition);
  }

  /** Animate a plain number, reporting each frame to onUpdate. */
  function animateValue(from, to, transition, onUpdate) {
    return Motion.animate(from, to, { ...transition, onUpdate });
  }

  /** Clamped interpolation, as used by Framer's scroll effects. */
  function interpolate(input, output, value) {
    return Motion.interpolate(input, output)(value);
  }

  /** Document offset of an element, summed through offsetParents (Framer's helper). */
  function documentTop(el) {
    let top = 0;
    for (let node = el; node && node !== document.documentElement && node instanceof HTMLElement; node = node.offsetParent) {
      top += node.offsetTop;
    }
    return top;
  }

  /** Run `callback` once when `amount` of the element is visible. */
  function onceInView(el, callback, amount = 0) {
    const stop = Motion.inView(el, () => {
      stop();
      callback();
    }, { amount });
  }

  /** Subscribe to scroll/resize, batched to one call per animation frame. */
  const scrollListeners = new Set();
  const scrollState = () => [window.scrollY, document.documentElement.scrollHeight - window.innerHeight];
  const notify = () => Motion.frame.read(() => {
    const [y, limit] = scrollState();
    scrollListeners.forEach(fn => fn(y, limit));
  });
  window.addEventListener('scroll', notify, { passive: true });
  window.addEventListener('resize', notify);
  function onScroll(fn) {
    scrollListeners.add(fn);
    fn(...scrollState());
    return () => scrollListeners.delete(fn);
  }

  FourK.motion = {
    animate,
    animateValue,
    interpolate,
    wrap: Motion.wrap,
    documentTop,
    onceInView,
    onScroll,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
})();

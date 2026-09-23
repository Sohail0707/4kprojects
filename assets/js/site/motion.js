/**
 * Minimal animation engine standing in for Framer Motion.
 *
 * Transitions use the same shapes as the Framer components:
 *   tween  { duration, ease: [x1, y1, x2, y2], delay }
 *   spring { type: 'spring', duration, bounce, delay }       (duration-based)
 *   spring { type: 'spring', stiffness, damping, mass, delay } (physics-based)
 *
 * Spring maths is ported from Motion (MIT): duration/bounce springs are
 * resolved to stiffness/damping exactly like Motion's findSpring, and every
 * spring is sampled into a CSS linear() easing so it runs on the Web
 * Animations API. Numeric values that have to be driven from JS (slideshow
 * position, counter) use tweenValue/springValue instead.
 */
(function () {
  'use strict';
  const FourK = (window.FourK = window.FourK || {});

  const SPRING = { minDuration: 0.01, maxDuration: 10, minDamping: 0.05, maxDamping: 1 };
  const SAFE_MIN = 0.001;
  const MAX_SPRING_MS = 20000;
  const SAMPLE_MS = 10;

  const clamp = (min, max, v) => Math.min(Math.max(v, min), max);
  const dampedFreq = (freq, ratio) => freq * Math.sqrt(1 - ratio * ratio);

  // Motion's findSpring (velocity 0, mass 1).
  function resolveDurationSpring(durationS, bounce) {
    const ratio = clamp(SPRING.minDamping, SPRING.maxDamping, 1 - bounce);
    const d = clamp(SPRING.minDuration, SPRING.maxDuration, durationS);
    let envelope, derivative;
    if (ratio < 1) {
      envelope = f => {
        const a = f * ratio;
        return SAFE_MIN - (a / dampedFreq(f, ratio)) * Math.exp(-a * d);
      };
      derivative = f => {
        const b = ratio * ratio * f * f * d;
        const sign = -envelope(f) + SAFE_MIN > 0 ? -1 : 1;
        return (sign * (-b * Math.exp(-f * ratio * d))) / dampedFreq(f * f, ratio);
      };
    } else {
      envelope = f => Math.exp(-f * d) * (f * d + 1) - SAFE_MIN;
      derivative = f => Math.exp(-f * d) * (-f * d * d);
    }
    let f = 5 / d;
    for (let i = 1; i < 12; i++) f -= envelope(f) / derivative(f);
    if (Number.isNaN(f)) return { stiffness: 100, damping: 10, mass: 1, durationMs: d * 1000 };
    const stiffness = f * f;
    return { stiffness, damping: ratio * 2 * Math.sqrt(stiffness), mass: 1, durationMs: d * 1000 };
  }

  // Motion's analytic spring: position at time t (ms) for keyframes [from, to].
  function springPosition({ stiffness, damping, mass }, from, to) {
    const ratio = damping / (2 * Math.sqrt(stiffness * mass));
    const delta = to - from;
    const freq = Math.sqrt(stiffness / mass) / 1000;
    if (ratio < 1) {
      const df = dampedFreq(freq, ratio);
      return t => to - Math.exp(-ratio * freq * t) * (((ratio * freq * delta) / df) * Math.sin(df * t) + delta * Math.cos(df * t));
    }
    if (ratio === 1) return t => to - Math.exp(-freq * t) * (delta + freq * delta * t);
    const df = freq * Math.sqrt(ratio * ratio - 1);
    return t => {
      const e = Math.exp(-ratio * freq * t);
      const x = Math.min(df * t, 300);
      return to - (e * (ratio * freq * delta * Math.sinh(x) + df * delta * Math.cosh(x))) / df;
    };
  }

  // Duration (ms) and progress curve of a spring, normalised to 0 → 1.
  function springCurve(transition) {
    if (transition.stiffness === undefined && transition.damping === undefined) {
      const params = resolveDurationSpring(transition.duration ?? 0.8, transition.bounce ?? 0.3);
      const at = springPosition(params, 0, 1);
      return { durationMs: params.durationMs, progress: p => (p >= 1 ? 1 : at(p * params.durationMs)) };
    }
    // Physics spring: sampled on a 0 → 100 range until it rests, like Motion.
    const params = { stiffness: transition.stiffness ?? 100, damping: transition.damping ?? 10, mass: transition.mass ?? 1 };
    const at = springPosition(params, 0, 100);
    const underdamped = params.damping / (2 * Math.sqrt(params.stiffness * params.mass)) < 1;
    const atRest = t => {
      const v = at(t);
      const prev = Math.max(t - 5, 0);
      const speed = underdamped && t > 0 ? ((v - at(prev)) / (t - prev)) * 1000 : 0;
      return Math.abs(speed) <= 2 && Math.abs(100 - v) <= 0.5;
    };
    let durationMs = 0;
    while (durationMs < MAX_SPRING_MS && !atRest(durationMs)) durationMs += 50;
    return { durationMs, progress: p => (p >= 1 ? 1 : at(p * durationMs) / 100) };
  }

  // Cubic bézier easing, same solver approach as Motion (binary subdivision).
  function cubicBezier(x1, y1, x2, y2) {
    if (x1 === y1 && x2 === y2) return t => t;
    const calc = (t, a1, a2) => (((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t + 3 * a1) * t;
    const solveT = x => {
      let lo = 0, hi = 1, t = x;
      for (let i = 0; i < 12; i++) {
        t = (lo + hi) / 2;
        const dx = calc(t, x1, x2) - x;
        if (Math.abs(dx) < 1e-7) break;
        dx > 0 ? (hi = t) : (lo = t);
      }
      return t;
    };
    return x => (x <= 0 ? 0 : x >= 1 ? 1 : calc(solveT(x), y1, y2));
  }

  const supportsLinear = window.CSS && CSS.supports('transition-timing-function', 'linear(0, 1)');
  const timingCache = new Map();

  // Resolve a Framer transition to WAAPI timing ({ duration, delay, easing }).
  function timing(transition = {}) {
    const key = JSON.stringify(transition);
    if (timingCache.has(key)) return timingCache.get(key);
    const delay = (transition.delay || 0) * 1000;
    let result;
    if (transition.type === 'spring') {
      const curve = springCurve(transition);
      let easing = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
      if (supportsLinear) {
        const n = Math.max(Math.round(curve.durationMs / SAMPLE_MS), 2);
        const points = [];
        for (let i = 0; i < n; i++) points.push(Math.round(curve.progress(i / (n - 1)) * 1e4) / 1e4);
        easing = `linear(${points.join(', ')})`;
      }
      result = { duration: curve.durationMs, delay, easing, progress: curve.progress };
    } else {
      const [x1, y1, x2, y2] = transition.ease || [0.25, 0.1, 0.25, 1];
      result = {
        duration: (transition.duration ?? 0.3) * 1000,
        delay,
        easing: `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`,
        progress: cubicBezier(x1, y1, x2, y2),
      };
    }
    timingCache.set(key, result);
    return result;
  }

  const running = new WeakMap(); // element → Map(property → Animation)

  /**
   * Animate CSS properties of an element to `to`, starting from their current
   * rendered value (so interrupted animations continue smoothly) or from
   * `from` when given. The target value is written inline, so it persists
   * after the animation finishes.
   */
  function animate(el, to, transition, from) {
    const t = timing(transition);
    let active = running.get(el);
    if (!active) running.set(el, (active = new Map()));
    const promises = [];
    for (const prop of Object.keys(to)) {
      const start = from && prop in from ? from[prop] : getComputedStyle(el)[prop];
      active.get(prop)?.cancel();
      el.style[prop] = to[prop];
      const end = getComputedStyle(el)[prop]; // resolves var() references
      const anim = el.animate({ [prop]: [start, end] }, { duration: t.duration, delay: t.delay, easing: t.easing, fill: 'backwards' });
      active.set(prop, anim);
      promises.push(
        anim.finished.then(
          () => { if (active.get(prop) === anim) active.delete(prop); },
          () => {} // cancelled by a newer animation
        )
      );
    }
    return Promise.all(promises);
  }

  /** Stop any engine-driven animation of the given properties. */
  function stop(el, props) {
    const active = running.get(el);
    if (!active) return;
    for (const prop of props) {
      active.get(prop)?.cancel();
      active.delete(prop);
    }
  }

  /** Drive a number from → to with a Framer transition; returns a stop function. */
  function tweenValue(from, to, transition, onUpdate, onComplete) {
    const t = timing(transition);
    let raf = 0;
    const start = performance.now() + t.delay;
    const tick = now => {
      const p = t.duration ? clamp(0, 1, (now - start) / t.duration) : 1;
      if (now >= start) onUpdate(from + (to - from) * t.progress(p));
      if (p < 1 || now < start) raf = requestAnimationFrame(tick);
      else onComplete && onComplete();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }

  /** Motion's clamped interpolate() for ascending input ranges. */
  function interpolate(input, output, v) {
    if (input.length === 1) return output[0];
    if (v <= input[0]) return output[0];
    const last = input.length - 1;
    if (v >= input[last]) return output[last];
    let i = 0;
    while (i < last - 1 && v >= input[i + 1]) i++;
    const span = input[i + 1] - input[i];
    const p = span === 0 ? 1 : (v - input[i]) / span;
    return output[i] + (output[i + 1] - output[i]) * p;
  }

  /** Motion's wrap(). */
  function wrap(min, max, v) {
    const range = max - min;
    return ((((v - min) % range) + range) % range) + min;
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
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting && e.intersectionRatio >= amount)) {
          io.disconnect();
          callback();
        }
      },
      { threshold: amount }
    );
    io.observe(el);
  }

  /** Subscribe to scroll/resize, batched to one call per animation frame. */
  const scrollListeners = new Set();
  let scrollQueued = false;
  function notifyScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;
      const y = window.scrollY;
      const limit = document.documentElement.scrollHeight - window.innerHeight;
      scrollListeners.forEach(fn => fn(y, limit));
    });
  }
  window.addEventListener('scroll', notifyScroll, { passive: true });
  window.addEventListener('resize', notifyScroll);
  function onScroll(fn) {
    scrollListeners.add(fn);
    fn(window.scrollY, document.documentElement.scrollHeight - window.innerHeight);
    return () => scrollListeners.delete(fn);
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  FourK.motion = {
    animate, stop, timing, tweenValue, springPosition,
    interpolate, wrap, clamp, documentTop, onceInView, onScroll, reducedMotion,
  };
})();

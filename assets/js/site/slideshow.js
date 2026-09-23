/**
 * Hero slideshow, replicating Framer's Slideshow component with the settings
 * used on this page: autoplay every 3s to the left, one item per view, 0.6s
 * tween, draggable, no arrows or dots, paused while offscreen.
 *
 * Like the original, the three slides are rendered four times and the track
 * position is an ever-growing value wrapped into the middle copies, so the
 * loop never runs out.
 */
(function () {
  'use strict';
  const FourK = (window.FourK = window.FourK || {});

  const CONFIG = {
    interval: 3, // seconds
    transition: { duration: 0.6, ease: [0.44, 0, 0.56, 1] },
    startFrom: 0,
    swipeVelocity: 200, // px/s
    panThreshold: 3, // px before a drag starts
    lockThreshold: 10, // px before the drag axis locks
  };

  function init() {
    const { animateValue, wrap } = FourK.motion;
    const section = document.querySelector('.framer-18wlzty-container section');
    if (!section) return;
    const track = section.querySelector('ul');
    const slides = [...track.querySelectorAll(':scope > li > div')];
    const count = slides.length / 4; // unique slides
    if (!count) return;

    // Offscreen slides were frozen as hidden in the saved markup.
    slides.forEach(s => (s.style.visibility = 'visible'));

    let itemWidth = 0;
    let loopWidth = 0;
    let index = CONFIG.startFrom + count;
    let position = 0; // unwrapped track offset (px)
    let tween = null;
    let timer = 0;
    let dragging = false;
    let inView = false;

    const render = () => {
      const x = loopWidth ? wrap(-loopWidth, -loopWidth * 2, position) : 0;
      track.style.transform = `translateX(${x}px)`;
    };
    const targetPosition = () => -index * itemWidth;

    const measure = () => {
      itemWidth = slides[0].offsetWidth;
      const last = slides[count - 1];
      loopWidth = last.offsetLeft + last.offsetWidth - slides[0].offsetLeft;
      position = targetPosition();
      render();
    };

    const stopTween = () => {
      tween?.stop();
      tween = null;
    };
    const animateTo = to => {
      stopTween();
      if (position === to) return;
      tween = animateValue(position, to, CONFIG.transition, v => {
        position = v;
        render();
      });
    };

    const playing = () => inView && !document.hidden && !dragging;
    const schedule = () => {
      clearTimeout(timer);
      animateTo(targetPosition());
      if (!playing()) return;
      timer = setTimeout(() => {
        index += 1;
        schedule();
      }, CONFIG.interval * 1000);
    };

    // Dragging (horizontal only; vertical movement is left to the page).
    let origin = null;
    let axis = null;
    let startPosition = 0;
    let history = [];

    const onDown = event => {
      if (event.button !== 0) return;
      origin = { x: event.clientX, y: event.clientY };
      axis = null;
      history = [{ x: event.clientX, t: event.timeStamp }];
    };
    const onMove = event => {
      if (!origin) return;
      const dx = event.clientX - origin.x;
      const dy = event.clientY - origin.y;
      if (!dragging) {
        if (Math.hypot(dx, dy) < CONFIG.panThreshold) return;
        dragging = true;
        stopTween();
        clearTimeout(timer);
        startPosition = position;
        track.style.cursor = 'grabbing';
      }
      if (!axis) {
        if (Math.abs(dy) > CONFIG.lockThreshold) axis = 'y';
        else if (Math.abs(dx) > CONFIG.lockThreshold) axis = 'x';
        else return;
      }
      if (axis !== 'x') return;
      history.push({ x: event.clientX, t: event.timeStamp });
      while (history.length > 2 && event.timeStamp - history[0].t > 100) history.shift();
      position = startPosition + dx;
      render();
    };
    const onUp = event => {
      if (!origin) return;
      const wasDragging = dragging;
      const offset = event.clientX - origin.x;
      origin = null;
      if (!wasDragging) return;
      dragging = false;
      track.style.cursor = 'grab';
      if (axis === 'x') {
        const first = history[0];
        const dt = (event.timeStamp - first.t) / 1000;
        const velocity = dt > 0 ? (event.clientX - first.x) / dt : 0;
        const steps = Math.round(Math.abs(offset) / itemWidth);
        if (velocity > CONFIG.swipeVelocity) index -= steps || 1;
        else if (velocity < -CONFIG.swipeVelocity) index += steps || 1;
        else if (offset < -itemWidth / 2) index += steps;
        else if (offset > itemWidth / 2) index -= steps;
      }
      schedule();
    };

    section.addEventListener('mousedown', e => e.preventDefault());
    track.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      inView ? schedule() : clearTimeout(timer);
    }).observe(section);
    document.addEventListener('visibilitychange', () => (document.hidden ? clearTimeout(timer) : schedule()));

    let resizeTimer = 0;
    new ResizeObserver(() => {
      stopTween();
      clearTimeout(timer);
      measure();
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(schedule, 500);
    }).observe(track);

    measure();
  }

  FourK.slideshow = { init };
})();

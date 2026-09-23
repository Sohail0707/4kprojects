/**
 * Entry point. Replaces the Framer runtime: everything here runs locally from
 * static data and makes no network requests.
 */
(function () {
  'use strict';
  const FourK = window.FourK;

  function start() {
    FourK.textEffects.init(); // first, so hidden start states apply before paint
    FourK.smoothScroll.init();
    FourK.menu.init(); // before scroll effects, which drive its colour variant
    FourK.scrollEffects.init();
    FourK.slideshow.init();
    FourK.counter.init();
    FourK.teamCards.init();
    FourK.faq.init();
    FourK.buttons.init();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

/**
 * Bundle entry for `npm run build`. Imports run in order: the globals first,
 * then the site modules, which are plain scripts that read window.Motion and
 * window.Lenis. The text effects are not bundled: they run inline in the page.
 */
import './globals.js';
import '../assets/js/data/content.js';
import '../assets/js/site/motion.js';
import '../assets/js/site/smooth-scroll.js';
import '../assets/js/site/menu.js';
import '../assets/js/site/scroll-effects.js';
import '../assets/js/site/slideshow.js';
import '../assets/js/site/counter.js';
import '../assets/js/site/team-cards.js';
import '../assets/js/site/faq.js';
import '../assets/js/site/buttons.js';
import '../assets/js/site/main.js';

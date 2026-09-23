/**
 * Only the parts of Motion the site uses, so the bundle is tree-shaken down
 * from the full library the unbundled dev page loads.
 */
import { animate, inView, interpolate, wrap, frame } from 'motion';
import Lenis from 'lenis';

window.Motion = { animate, inView, interpolate, wrap, frame };
window.Lenis = Lenis;

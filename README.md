# 4K Projects – About page replica

1:1 static replica of <https://4kprojects.com/about-us> (a Framer site).

```
about-us.html                  page markup (Framer SSR output)
assets/
  css/
    fonts.css                  @font-face rules (DM Sans, Satoshi, Inter, …)
    framer.css                 Framer SSR component styles (generated, minified)
    lenis.css                  Lenis smooth-scroll base styles
    overlay-gallery.min.css    image lightbox (vendor: pin.supply)
  js/
    overlay-gallery.min.js     image lightbox (vendor: pin.supply)
    framer/
      script_main.*.mjs        Framer runtime entry point
  icons/                       UI icons (carousel arrows)
  images/
    brand/                     logos, BIID partner badge
    showcase/                  hero carousel renders
    team/                      team portraits
```

## Styling conventions

Match the units the site already uses. Do not convert them.

- **px** for all sizes, spacing, radii and font sizes. The site uses no `rem`.
- **em** only for `letter-spacing`.
- **vh / dvh** only for full-viewport heights. **fr** for grid tracks. **%** for fluid widths.
- Breakpoints: desktop `min-width: 1200px`, tablet `810px – 1199.98px`, phone `max-width: 809.98px`.

## Known gaps

The Framer runtime chunks failed to download (CORS), so the page renders but does not
hydrate: no interactions, carousel motion or appear animations. `script_main.*.mjs`
imports its chunks relatively, so drop the missing files into `assets/js/framer/`:

`rolldown-runtime.ClXcc3XR.mjs`, `react.BuBzgzed.mjs`, `motion.BMuNJT2x.mjs`,
`framer.xDkuwXBC.mjs`, `Gjim6gwBQ.Dr7cRZ4M.mjs`, `qFj_JZphP.BRL0WDpJ.mjs`,
`k8WOTXbOu.Bw0mGu0x.mjs`, `shared-lib.DVzDu-tl.mjs`, `Xb0JwNDiQ.CnOTKmVy.mjs`.
Other chunks may load lazily after those. The `modulepreload` links in `about-us.html`
list the full set, served from `framerusercontent.com/sites/1TSGLyxZrt5NXR8lKOFqYQ/`.

## Notes

- Keep the two inline `<style data-framer-html-style>` blocks inside `#main`. React renders
  them as part of the page tree, so moving them would break hydration.
- Responsive `srcset`s still point at `framerusercontent.com`, as on the live site. The
  local files are the `src` fallbacks.
# 4kprojects

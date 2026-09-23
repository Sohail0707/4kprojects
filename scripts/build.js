/**
 * Production build → dist/. Run: npm run build
 *
 *  - CSS: fonts/framer/lenis/menu stylesheets merged, unused rules purged,
 *    minified and inlined (no render-blocking stylesheet requests).
 *  - JS: site modules + the used parts of Motion and Lenis bundled, minified
 *    and loaded after first paint. The hero text reveal is inlined in place.
 *  - HTML: comments stripped; images and icons copied as-is.
 */
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const { PurgeCSS } = require('purgecss');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const SITE_JS = fs.readdirSync(path.join(root, 'assets/js/site')).map(f => `assets/js/site/${f}`);
const STYLESHEETS = ['fonts', 'framer', 'lenis', 'menu'];

function replaceOnce(html, pattern, replacement, label) {
  const matches = html.match(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'));
  if (!matches || matches.length !== 1) throw new Error(`${label}: expected 1 match, found ${matches ? matches.length : 0}`);
  return html.replace(pattern, () => replacement);
}

async function buildCss(html) {
  const css = STYLESHEETS.map(name => read(`assets/css/${name}.css`).replace(/@charset "UTF-8";\s*/, '')).join('\n');
  const [result] = await new PurgeCSS().purge({
    content: [{ raw: html, extension: 'html' }, ...SITE_JS.map(file => ({ raw: read(file), extension: 'js' }))],
    css: [{ raw: css }],
    // Classes added at runtime by Lenis or composed in JS.
    safelist: { standard: ['hover'], greedy: [/^lenis/, /^framer-v-/] },
  });
  const { code } = await esbuild.transform(result.css, { loader: 'css', minify: true });
  return { code: code.trim(), before: css.length };
}

(async () => {
  let html = read('about-us.html');

  fs.rmSync(dist, { recursive: true, force: true });
  for (const dir of ['assets/images', 'assets/icons']) {
    fs.cpSync(path.join(root, dir), path.join(dist, dir), { recursive: true });
  }

  // JS bundle, loaded after first paint.
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'entry.js')],
    outfile: path.join(dist, 'assets/js/app.js'),
    bundle: true,
    minify: true,
    format: 'iife',
    target: 'es2020',
    legalComments: 'none',
  });
  const loader =
    '<script>requestAnimationFrame(function(){setTimeout(function(){' +
    "var s=document.createElement('script');s.src='assets/js/app.js';document.body.appendChild(s)})})</script>";
  html = replaceOnce(html, /\s*<!-- scripts:start -->[\s\S]*?<!-- scripts:end -->/, '', 'scripts block');
  html = replaceOnce(html, /<\/body>/, `${loader}\n</body>`, 'body end');
  const preconnect = '<link href="https://framerusercontent.com" rel="preconnect" crossorigin="">';
  html = replaceOnce(
    html,
    /<link href="https:\/\/framerusercontent\.com" rel="preconnect" crossorigin="">/,
    `${preconnect}<link rel="preload" as="script" href="assets/js/app.js" fetchpriority="low">`,
    'preload'
  );

  // Hero text reveal, inlined where the source page loads it.
  const effects = (await esbuild.transform(read('assets/js/site/text-effects.js'), { loader: 'js', minify: true })).code.trim();
  html = replaceOnce(html, /<script src="assets\/js\/site\/text-effects\.js" data-inline><\/script>/, `<script>${effects}</script>`, 'text effects');

  // CSS: inline the purged stylesheet where fonts.css was; drop the other links.
  const css = await buildCss(html);
  html = replaceOnce(html, /<link rel="stylesheet" href="assets\/css\/fonts\.css"[^>]*>/, `<style>${css.code}</style>`, 'fonts.css');
  for (const name of STYLESHEETS.slice(1)) {
    html = replaceOnce(html, new RegExp(`<link rel="stylesheet" href="assets/css/${name}\\.css"[^>]*>`), '', `${name}.css`);
  }

  html = html.replace(/<!--[\s\S]*?-->/g, '');
  fs.writeFileSync(path.join(dist, 'about-us.html'), html);

  const size = file => `${Math.round(fs.statSync(path.join(dist, file)).size / 1024)} KiB`;
  console.log(`CSS   ${Math.round(css.before / 1024)} KiB → ${Math.round(css.code.length / 1024)} KiB (inlined)`);
  console.log(`JS    assets/js/app.js ${size('assets/js/app.js')}`);
  console.log(`HTML  about-us.html ${size('about-us.html')}`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});

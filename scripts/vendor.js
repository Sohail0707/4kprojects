/**
 * Copies the browser builds of Motion and Lenis into assets/js/vendor so the
 * page loads them locally (no CDN or network requests). Run: npm run vendor
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'assets/js/vendor');
const files = {
  'motion.js': 'node_modules/motion/dist/motion.js',
  'lenis.min.js': 'node_modules/lenis/dist/lenis.min.js',
};

fs.mkdirSync(out, { recursive: true });
for (const [name, src] of Object.entries(files)) {
  // Drop source-map comments: the maps are not vendored.
  const code = fs.readFileSync(path.join(root, src), 'utf8').replace(/\n?\/\/# sourceMappingURL=\S+\s*$/, '\n');
  fs.writeFileSync(path.join(out, name), code);
  console.log(`vendored ${src} → assets/js/vendor/${name}`);
}

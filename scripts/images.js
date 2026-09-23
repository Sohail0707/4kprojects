/**
 * Generates responsive WebP sizes next to each source image
 * (e.g. showcase/lounge.webp → showcase/lounge-640.webp, …). Widths larger
 * than the original are skipped. Run: npm run images
 */
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '../assets/images');
const QUALITY = 80;

// Widths per image, chosen from the sizes each image is displayed at.
const IMAGES = {
  'showcase/lounge.webp': [640, 960, 1280, 1920, 2560],
  'showcase/courtyard.webp': [640, 960, 1280],
  'showcase/reception.webp': [640, 960, 1280, 1536],
  'team/jon-medlock.webp': [400, 600, 800, 1036],
  'team/anna-kawalec.webp': [400, 600, 800, 896],
  'team/georgia-grigoriadi.webp': [400, 600, 800, 896],
  'team/giulia-zanotti.webp': [400, 600, 800, 896],
  'team/paola-maria-baliki.webp': [400, 600, 800, 896],
  'team/namik-pirkic.webp': [400, 600, 800, 896],
  'brand/logo-4k-black.png': [128, 256],
  'brand/logo-4k-white.png': [160, 320],
  'brand/biid-industry-partner.png': [180, 360],
};

(async () => {
  for (const [file, widths] of Object.entries(IMAGES)) {
    const src = path.join(root, file);
    const { width: original } = await sharp(src).metadata();
    const base = file.replace(/\.(webp|png)$/, '');
    for (const width of widths.filter(w => w <= original)) {
      const out = path.join(root, `${base}-${width}.webp`);
      const info = await sharp(src).resize({ width }).webp({ quality: QUALITY }).toFile(out);
      console.log(`${base}-${width}.webp  ${Math.round(info.size / 1024)} KiB`);
    }
  }
})();

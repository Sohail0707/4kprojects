/**
 * Minimal static server with gzip/brotli, for previewing and auditing the site
 * the way a real host serves it. Usage: node scripts/serve.js [dir] [port]
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = path.resolve(process.argv[2] || '.');
const port = Number(process.argv[3] || 8803);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2',
};
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg']);

http.createServer((req, res) => {
  let file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(root)) return res.writeHead(403).end();
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'about-us.html');
  if (!fs.existsSync(file)) return res.writeHead(404).end('Not found');
  const ext = path.extname(file);
  const headers = { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' };
  const body = fs.readFileSync(file);
  const accept = req.headers['accept-encoding'] || '';
  if (COMPRESSIBLE.has(ext) && /\bbr\b/.test(accept)) {
    res.writeHead(200, { ...headers, 'Content-Encoding': 'br' }).end(zlib.brotliCompressSync(body));
  } else if (COMPRESSIBLE.has(ext) && /gzip/.test(accept)) {
    res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip' }).end(zlib.gzipSync(body));
  } else {
    res.writeHead(200, headers).end(body);
  }
}).listen(port, () => console.log(`Serving ${root} at http://localhost:${port}/`));

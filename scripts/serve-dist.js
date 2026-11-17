#!/usr/bin/env node
/**
 * Serves dist/ locally like Vercel/Netlify would: existing file → `<path>.html`
 * → index.html (SPA fallback). Usage: node scripts/serve-dist.js [port]
 * localhost counts as a secure context, so the service worker and install
 * prompt work here.
 */
const fs = require('fs');
const http = require('http');
const path = require('path');

const dist = path.resolve(__dirname, '..', 'dist');
const port = Number(process.argv[2] || process.env.PORT || 4173);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const candidates = [clean, `${clean}.html`, path.join(clean, 'index.html')];
  for (const candidate of candidates) {
    const file = path.join(dist, candidate);
    if (!file.startsWith(dist)) continue;
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  }
  return path.join(dist, 'index.html');
}

if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('dist/ is empty. Run `npm run build:web` first.');
  process.exit(1);
}

http
  .createServer((req, res) => {
    const file = resolveFile(req.url || '/');
    const ext = path.extname(file);
    const headers = { 'Content-Type': types[ext] || 'application/octet-stream' };
    if (file.endsWith(`${path.sep}sw.js`) || ext === '.html') headers['Cache-Control'] = 'no-cache';
    else if (req.url && req.url.startsWith('/_expo/static/')) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    }
    res.writeHead(200, headers);
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`Serving dist/ at http://localhost:${port}`));

#!/usr/bin/env node
/**
 * Generates dist/sw.js from web/service-worker.js after `expo export -p web`.
 * Precaches the app's static files (bundles, fonts, images, icons, manifest,
 * offline page); route HTML is fetched from the network. No dependencies.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const template = path.join(root, 'web', 'service-worker.js');

if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('dist/index.html not found. Run `npx expo export -p web` first.');
  process.exit(1);
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const PRECACHE_PATTERNS = [
  /^\/_expo\/static\/.+\.(js|css)$/,
  /^\/assets\/.+\.(png|jpe?g|gif|webp|svg|ttf|otf|woff2?)$/,
  /^\/icons\/.+\.png$/,
  /^\/(offline\.html|manifest\.webmanifest|favicon\.ico|favicon\.png|apple-touch-icon\.png)$/,
];

const hash = crypto.createHash('sha256');
const urls = walk(dist)
  .map((file) => '/' + path.relative(dist, file).split(path.sep).join('/'))
  .filter((url) => PRECACHE_PATTERNS.some((re) => re.test(url)))
  .sort();

let totalBytes = 0;
for (const url of urls) {
  const buf = fs.readFileSync(path.join(dist, url));
  totalBytes += buf.length;
  hash.update(url).update(buf);
}
// HTML changes (e.g. +html.tsx) should also produce a new worker version.
hash.update(fs.readFileSync(path.join(dist, 'index.html')));
hash.update(fs.readFileSync(template));
const version = hash.digest('hex').slice(0, 12);

const sw = fs
  .readFileSync(template, 'utf8')
  .replace('__CACHE_VERSION__', version)
  .replace('__PRECACHE_URLS__', JSON.stringify(urls, null, 2));

fs.writeFileSync(path.join(dist, 'sw.js'), sw);
console.log(
  `Service worker written to dist/sw.js (version ${version}, ${urls.length} files, ${(totalBytes / 1024 / 1024).toFixed(1)} MB precached)`,
);

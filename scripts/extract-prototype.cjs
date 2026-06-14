// One-shot extractor for the Claude Artifact bundle in
// "Akiba Finance Tracker (shareable) (1).html". Dumps each asset into
// ./tmp/prototype/ so we can read the real design tokens out of the bundle.
// Throwaway script. Safe to delete after Phase 1.

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const HTML = path.join(__dirname, '..', 'Akiba Finance Tracker (shareable) (1).html');
const OUT = path.join(__dirname, '..', 'tmp', 'prototype');

fs.mkdirSync(OUT, { recursive: true });

const html = fs.readFileSync(HTML, 'utf8');

function extractScript(type) {
  const re = new RegExp(`<script type="${type}">([\\s\\S]*?)</script>`, 'i');
  const m = html.match(re);
  if (!m) throw new Error(`script type="${type}" not found`);
  return m[1];
}

const manifest = JSON.parse(extractScript('__bundler/manifest'));
const template = JSON.parse(extractScript('__bundler/template'));

const summary = [];
for (const [uuid, entry] of Object.entries(manifest)) {
  const data = Buffer.from(entry.data, 'base64');
  const bytes = entry.compressed ? zlib.gunzipSync(data) : data;
  const safeName = (entry.name || uuid).replace(/[^a-zA-Z0-9._-]/g, '_');
  const ext = entry.mime && entry.mime.includes('javascript') ? '.js'
            : entry.mime && entry.mime.includes('css') ? '.css'
            : entry.mime && entry.mime.includes('html') ? '.html'
            : entry.mime && entry.mime.includes('json') ? '.json'
            : entry.mime && entry.mime.includes('svg') ? '.svg'
            : '';
  const file = path.join(OUT, `${safeName}${ext}`);
  fs.writeFileSync(file, bytes);
  summary.push({ uuid, name: entry.name || null, mime: entry.mime, size: bytes.length, file: path.relative(process.cwd(), file) });
}

fs.writeFileSync(path.join(OUT, '_template.html'), template);
fs.writeFileSync(path.join(OUT, '_manifest-summary.json'), JSON.stringify(summary, null, 2));

console.log(`Wrote ${summary.length} assets to ${OUT}`);
for (const s of summary) console.log(`  ${s.mime.padEnd(28)} ${String(s.size).padStart(8)}  ${s.file}`);

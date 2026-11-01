// buildwithsaksham design kit: every post gets its own look (palette, pattern, layout)
// derived from a seed (the post slug), but always the same brand system.
import { Resvg } from '@resvg/resvg-js';

const FONT = 'Inter, DejaVu Sans, Arial, sans-serif';
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clip = (v, n) => { const t = String(v ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t; };

// ---------- seeded randomness ----------
function xmur3(str) { let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^= h >>> 16) >>> 0; }; }
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rngFor = (seed) => mulberry32(xmur3(String(seed))());

// ---------- brand palettes (dark and light) ----------
const PALETTES = [
  { n: 'ember', bg: '#1a1423', bg2: '#2f1f3f', ink: '#fff7ed', accent: '#ff6b4a', accent2: '#ffd166', muted: '#c9b8d9', card: '#2a2035', onAccent: '#1a1423' },
  { n: 'mint', bg: '#06241f', bg2: '#0c4037', ink: '#ecfdf5', accent: '#34d399', accent2: '#fde68a', muted: '#9fd8c8', card: '#0e3b33', onAccent: '#06241f' },
  { n: 'citrus', bg: '#fff7e6', bg2: '#ffe3ad', ink: '#1b2a41', accent: '#ff7a00', accent2: '#2563eb', muted: '#5b6b84', card: '#ffffff', onAccent: '#1b2a41' },
  { n: 'orchid', bg: '#f6f1ff', bg2: '#e4d8ff', ink: '#231942', accent: '#7c3aed', accent2: '#ec4899', muted: '#6b5f8f', card: '#ffffff', onAccent: '#ffffff' },
  { n: 'graphite', bg: '#101214', bg2: '#1d2227', ink: '#f4f4f5', accent: '#a3e635', accent2: '#38bdf8', muted: '#a1a1aa', card: '#1e2227', onAccent: '#101214' },
  { n: 'ocean', bg: '#e9f5ff', bg2: '#cde6ff', ink: '#0b2545', accent: '#0ea5e9', accent2: '#f43f5e', muted: '#4b6584', card: '#ffffff', onAccent: '#06243d' },
];
const PATTERNS = ['dots', 'stripes', 'arcs', 'blocks', 'waves'];

function theme(seed) {
  const r = rngFor(seed);
  return { seed, pal: PALETTES[Math.floor(r() * PALETTES.length)], pattern: PATTERNS[Math.floor(r() * PATTERNS.length)], layout: Math.floor(r() * 3), style: Math.floor(r() * 2) };
}

// ---------- text helpers (sized for the widest fallback font) ----------
const maxChars = (px, size, bold) => Math.max(6, Math.floor(px / (size * (bold ? 0.7 : 0.62))));
function wrap(text, max, maxLines) {
  const lines = []; let cur = '';
  for (const w of String(text ?? '').split(/\s+/).filter(Boolean)) {
    if (cur && (cur + ' ' + w).length > max) { lines.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w;
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/[\s,.;:]*\S*$/, '') + '…'; }
  return lines;
}
const block = (lines, x, y, lh, attrs) => lines.map((l, i) => `<text x="${x}" y="${(y + i * lh).toFixed(0)}" ${attrs}>${esc(l)}</text>`).join('');

// ---------- decorative patterns ----------
function pattern(kind, seed, x, y, w, h, c1, c2, k = 1) {
  const r = rngFor(seed + ':pat');
  let g = '';
  if (kind === 'dots') { const st = 38; for (let i = 0; i * st < w; i++) for (let j = 0; j * st < h; j++) g += `<circle cx="${x + i * st + st / 2}" cy="${y + j * st + st / 2}" r="${2 + ((i * 7 + j * 3) % 4)}" fill="${c1}" opacity="${0.4 * k}"/>`; }
  else if (kind === 'stripes') { for (let i = -h; i < w; i += 40) g += `<line x1="${x + i}" y1="${y + h}" x2="${x + i + h}" y2="${y}" stroke="${c1}" stroke-width="7" opacity="${0.24 * k}"/>`; }
  else if (kind === 'arcs') { for (let rad = 70; rad < Math.max(w, h) * 1.3; rad += 64) g += `<circle cx="${x + w}" cy="${y}" r="${rad}" fill="none" stroke="${rad % 128 < 64 ? c1 : c2}" stroke-width="5" opacity="${0.32 * k}"/>`; }
  else if (kind === 'blocks') { for (let n = 0; n < 16; n++) { const s = 40 + r() * 90; g += `<rect x="${(x + r() * (w - s)).toFixed(0)}" y="${(y + r() * (h - s)).toFixed(0)}" width="${s.toFixed(0)}" height="${s.toFixed(0)}" rx="${(s * 0.22).toFixed(0)}" fill="${n % 3 === 0 ? c2 : c1}" opacity="${((0.12 + r() * 0.25) * k).toFixed(2)}"/>`; } }
  else { for (let n = 0; n < 9; n++) { const yy = y + ((n + 0.5) * h) / 9; let d = `M${x} ${yy.toFixed(0)}`; for (let t = 0; t <= w; t += 20) d += ` L${x + t} ${(yy + Math.sin(t / 70 + n * 0.6) * 18).toFixed(1)}`; g += `<path d="${d}" fill="none" stroke="${n % 2 ? c1 : c2}" stroke-width="4" opacity="${0.3 * k}"/>`; } }
  return `<clipPath id="pc"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#pc)">${g}</g>`;
}

// ---------- brand mark: three rising blocks + wordmark ----------
function brand(x, y, p, size = 34) {
  const bw = size * 0.26, gap = size * 0.1;
  const bars = [0.45, 0.72, 1].map((hh, i) => `<rect x="${(x + i * (bw + gap)).toFixed(1)}" y="${(y + size * (1 - hh)).toFixed(1)}" width="${bw.toFixed(1)}" height="${(size * hh).toFixed(1)}" rx="${(bw * 0.3).toFixed(1)}" fill="${i === 2 ? p.accent : p.ink}"/>`).join('');
  return `${bars}<text x="${(x + 3 * bw + 2 * gap + 18).toFixed(0)}" y="${(y + size * 0.78).toFixed(0)}" font-size="${(size * 0.72).toFixed(0)}" font-weight="700" fill="${p.ink}">buildwithsaksham<tspan fill="${p.accent}">.in</tspan></text>`;
}

// ---------- icon set (24px grid, stroke style) ----------
const ICONS = {
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/>',
  chart: '<path d="M5 20V11M12 20V4M19 20v-7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>',
  code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
  cpu: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.5 3-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c3 0 5 2 5 5.3"/>',
  'arrow-up': '<path d="M12 20V5M5 12l7-7 7 7"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  database: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  cloud: '<path d="M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1 0 9H7z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  branch: '<circle cx="6" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><path d="M6 3v12M18 9a9 9 0 0 1-9 9"/>',
};
export const ICON_NAMES = Object.keys(ICONS);
const icon = (name, cx, cy, size, color) => `<g transform="translate(${(cx - size / 2).toFixed(0)} ${(cy - size / 2).toFixed(0)}) scale(${(size / 24).toFixed(3)})" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ICONS.spark}</g>`;

// ---------- shell ----------
const bgDefs = (p, W, H) => `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.bg}"/><stop offset="1" stop-color="${p.bg2}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/>`;
const shell = (W, H, inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}">${inner}</svg>`;
const render = (svg) => new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: 'DejaVu Sans' } }).render().asPng();
const chip = (x, y, text, bg, fg) => { const w = text.length * 19 + 56; return `<rect x="${x}" y="${y}" width="${w}" height="48" rx="24" fill="${bg}"/><text x="${x + w / 2}" y="${y + 32}" font-size="22" font-weight="700" fill="${fg}" text-anchor="middle" letter-spacing="1.5">${esc(text)}</text>`; };

// ---------- site cover (1200x627) ----------
export function makeCover({ title, category, readMin, seed }) {
  const t = theme(seed || title); const p = t.pal;
  const lines = wrap(title, maxChars(1020, 60, true), 4);
  const y0 = 330 - ((lines.length - 1) * 72) / 2;
  const inner = bgDefs(p, 1200, 627)
    + pattern(t.pattern, t.seed, 640, 0, 560, 627, p.accent, p.accent2)
    + chip(80, 70, clip(category, 24).toUpperCase(), p.accent, p.onAccent)
    + block(lines, 80, y0, 72, `font-size="60" font-weight="800" fill="${p.ink}"`)
    + brand(80, 520, p, 38)
    + `<text x="1120" y="556" font-size="24" fill="${p.muted}" text-anchor="end">${readMin} min read</text>`;
  return render(shell(1200, 627, inner));
}

// ---------- LinkedIn slide 1: the big number ----------
function slide1(d, t) {
  const p = t.pal;
  const stat = clip(d.stat?.value, 8);
  const label = wrap(clip(d.stat?.label, 80), maxChars(900, 38, false), 2);
  const headline = wrap(clip(d.headline, 90), maxChars(920, 52, true), 3);
  const kicker = clip(d.kicker, 26).toUpperCase();
  let inner = bgDefs(p, 1080, 1080);
  if (t.layout === 0) {
    const size = Math.min(250, Math.floor(900 / (Math.max(stat.length, 2) * 0.72)));
    inner += pattern(t.pattern, t.seed, 460, 0, 620, 560, p.accent, p.accent2)
      + brand(80, 70, p) + chip(80, 160, kicker, p.accent, p.onAccent)
      + `<text x="80" y="${(250 + size * 0.8).toFixed(0)}" font-size="${size}" font-weight="800" fill="${p.accent}">${esc(stat)}</text>`
      + block(label, 80, 250 + size * 0.8 + 70, 50, `font-size="38" fill="${p.ink}"`)
      + `<rect x="80" y="650" width="120" height="8" rx="4" fill="${p.accent2}"/>`
      + block(headline, 80, 740, 66, `font-size="52" font-weight="800" fill="${p.ink}"`)
      + `<text x="1000" y="1030" font-size="26" fill="${p.muted}" text-anchor="end">swipe →</text>`;
  } else if (t.layout === 1) {
    const size = Math.min(200, Math.floor(430 / (Math.max(stat.length, 2) * 0.72)));
    const lab = wrap(clip(d.stat?.label, 60), maxChars(400, 30, false), 3);
    const blockH = size * 0.8 + 24 + lab.length * 38;
    const top = 690 - blockH / 2;
    inner += pattern(t.pattern, t.seed, 0, 420, 1080, 660, p.accent, p.accent2, 0.8)
      + brand(80, 70, p)
      + block(headline, 80, 220, 66, `font-size="52" font-weight="800" fill="${p.ink}"`)
      + `<circle cx="540" cy="700" r="300" fill="none" stroke="${p.accent2}" stroke-width="6"/><circle cx="540" cy="700" r="270" fill="${p.accent}"/>`
      + `<text x="540" y="${(top + size * 0.8).toFixed(0)}" font-size="${size}" font-weight="800" fill="${p.onAccent}" text-anchor="middle">${esc(stat)}</text>`
      + block(lab, 540, top + size * 0.8 + 56, 38, `font-size="30" fill="${p.onAccent}" text-anchor="middle"`)
      + chip(80, 1000, kicker, p.card, p.ink).replace(`fill="${p.card}"`, `fill="${p.card}" stroke="${p.accent}" stroke-width="2"`);
  } else {
    const size = Math.min(250, Math.floor(900 / (Math.max(stat.length, 2) * 0.72)));
    inner += `<rect width="1080" height="560" fill="${p.accent}"/>`
      + pattern(t.pattern, t.seed, 0, 0, 1080, 560, p.onAccent, p.onAccent, 0.55)
      + chip(80, 70, kicker, p.onAccent, p.accent)
      + `<text x="80" y="${(190 + size * 0.8).toFixed(0)}" font-size="${size}" font-weight="800" fill="${p.onAccent}">${esc(stat)}</text>`
      + block(label, 80, 190 + size * 0.8 + 62, 46, `font-size="36" fill="${p.onAccent}"`)
      + block(headline, 80, 680, 66, `font-size="52" font-weight="800" fill="${p.ink}"`)
      + `<rect x="80" y="900" width="120" height="8" rx="4" fill="${p.accent2}"/>`
      + brand(80, 960, p)
      + `<text x="1000" y="1030" font-size="26" fill="${p.muted}" text-anchor="end">swipe →</text>`;
  }
  return shell(1080, 1080, inner);
}

// ---------- LinkedIn slide 2: icon cards + call to action ----------
function slide2(d, t) {
  const p = t.pal;
  const pts = (d.points || []).slice(0, 4);
  const n = pts.length;
  const ch = n === 4 ? 144 : 190, gap = 22, top = 236;
  let inner = bgDefs(p, 1080, 1080)
    + pattern(t.pattern, t.seed, 700, 0, 380, 200, p.accent, p.accent2, 0.7)
    + brand(60, 56, p, 30)
    + `<text x="60" y="176" font-size="52" font-weight="800" fill="${p.ink}">${esc(clip(d.title2 || 'Key takeaways', 24))}</text>`;
  pts.forEach((pt, i) => {
    const y = top + i * (ch + gap);
    const cy = y + ch / 2;
    inner += `<rect x="60" y="${y}" width="960" height="${ch}" rx="30" fill="${t.style ? p.card : 'none'}" stroke="${p.accent}" stroke-opacity="${t.style ? 0.25 : 0.7}" stroke-width="3"/>`
      + (t.style ? `<circle cx="140" cy="${cy}" r="44" fill="${p.accent}"/>` : `<rect x="96" y="${cy - 44}" width="88" height="88" rx="24" fill="${p.accent}"/>`)
      + icon(pt.icon, 140, cy, 44, p.onAccent)
      + `<text x="214" y="${(cy - (ch > 160 ? 14 : 12)).toFixed(0)}" font-size="34" font-weight="800" fill="${p.ink}">${esc(clip(pt.title, 27))}</text>`
      + block(wrap(clip(pt.text, 92), maxChars(780, 27, false), 2), 214, cy + 26, 33, `font-size="27" fill="${p.muted}"`);
  });
  inner += `<rect x="60" y="910" width="960" height="120" rx="40" fill="${p.accent}"/>`
    + `<text x="110" y="966" font-size="36" font-weight="800" fill="${p.onAccent}">Read the full breakdown</text>`
    + `<text x="110" y="1002" font-size="25" fill="${p.onAccent}" opacity="0.85">buildwithsaksham.in/blog</text>`
    + `<circle cx="946" cy="970" r="36" fill="${p.onAccent}"/><path d="M928 970h36M950 954l16 16-16 16" fill="none" stroke="${p.accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  return shell(1080, 1080, inner);
}

export const makeSlides = (d, seed) => { const t = theme(seed ?? d.headline); return [render(slide1(d, t)), render(slide2(d, t))]; };

export const themeFor = theme;

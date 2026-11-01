import { Resvg } from '@resvg/resvg-js';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrap(text, max = 22, maxLines = 4) {
  const lines = [];
  let cur = '';
  for (const w of text.split(/\s+/)) {
    if (cur && (cur + ' ' + w).length > max) { lines.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w;
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + '…';
  }
  return lines;
}

// 1200x627 = LinkedIn's recommended link/cover image size
export function makeCover({ title, category, readMin }) {
  const lines = wrap(title);
  const size = lines.length > 3 ? 58 : 66;
  const lh = size * 1.22;
  const y0 = 340 - ((lines.length - 1) * lh) / 2;
  const chipW = category.length * 13 + 44;
  const text = lines.map((l, i) => `<text x="80" y="${(y0 + i * lh).toFixed(0)}" font-size="${size}" font-weight="700" fill="#ffffff">${esc(l)}</text>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="627" viewBox="0 0 1200 627" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1020"/><stop offset="1" stop-color="#1e1b4b"/></linearGradient>
<radialGradient id="r" cx="1" cy="0" r="0.9"><stop offset="0" stop-color="#6366f1" stop-opacity="0.5"/><stop offset="1" stop-color="#6366f1" stop-opacity="0"/></radialGradient>
</defs>
<rect width="1200" height="627" fill="url(#g)"/>
<rect width="1200" height="627" fill="url(#r)"/>
<rect x="80" y="76" rx="20" ry="20" width="${chipW}" height="40" fill="#6366f1"/>
<text x="${80 + chipW / 2}" y="103" font-size="20" font-weight="700" fill="#ffffff" text-anchor="middle">${esc(category.toUpperCase())}</text>
${text}
<rect x="80" y="520" width="64" height="4" rx="2" fill="#818cf8"/>
<text x="80" y="566" font-size="26" font-weight="700" fill="#c7d2fe">buildwithsaksham.in</text>
<text x="1120" y="566" font-size="24" fill="#a5b4fc" text-anchor="end">${readMin} min read</text>
</svg>`;
  return new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: 'DejaVu Sans' } }).render().asPng();
}

// ---------- LinkedIn 2-image set (square, terminal style) ----------
const clip = (v, n) => { const t = String(v ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; };
const MONO = 'DejaVu Sans Mono, Menlo, Consolas, monospace';
const png = (svg) => new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: 'DejaVu Sans Mono' } }).render().asPng();
const shell = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080" font-family="${MONO}"><rect width="1080" height="1080" fill="#ffffff"/>${inner}</svg>`;

function slideA(d) {
  const facts = (d.facts || []).slice(0, 6).map((f) => (Array.isArray(f) ? f : [f?.key, f?.value]));
  const n = facts.length;
  const rows = facts.map(([k, v], i) => {
    const key = clip(k, 14);
    const val = clip(v, Math.max(8, 38 - key.length));
    return `<text x="148" y="${464 + i * 52}" font-size="30" fill="#e2e8f0"><tspan fill="#fbbf24">"${esc(key)}"</tspan>: "${esc(val)}"${i === n - 1 ? '' : ','}</text>`;
  }).join('');
  const tags = [0, 1, 2].map((i) => {
    const x = 48 + i * 336;
    return `<rect x="${x}" y="884" width="312" height="100" rx="16" fill="#eef2ff"/><rect x="${x}" y="884" width="312" height="14" rx="4" fill="#1e1b4b"/>
<text x="${x + 24}" y="952" font-size="26" font-weight="700" fill="#fbbf24">0${i + 1}<tspan dx="14" fill="#1e1b4b">${esc(clip((d.tags || [])[i] ?? '', 16))}</tspan></text>`;
  }).join('');
  return shell(`<rect x="48" y="48" width="984" height="236" rx="36" fill="#1e1b4b"/>
<text x="96" y="112" font-size="28" fill="#fbbf24">dev.note</text>
<text x="96" y="192" font-size="64" font-weight="700" fill="#ffffff">${esc(clip(d.headline, 22))}</text>
<text x="96" y="248" font-size="24" fill="#a5b4fc">${esc(clip(d.source, 44))}</text>
<rect x="48" y="304" width="984" height="560" rx="36" fill="#eef2ff"/>
<rect x="84" y="340" width="912" height="488" rx="24" fill="#0f172a"/>
<rect x="104" y="348" width="872" height="6" rx="3" fill="#fbbf24"/>
<text x="112" y="410" font-size="30" fill="#e2e8f0">{</text>${rows}
<text x="112" y="${464 + n * 52}" font-size="30" fill="#e2e8f0">}</text>
${tags}
<text x="48" y="1040" font-size="22" fill="#94a3b8">buildwithsaksham.in</text>`);
}

function slideB(d) {
  let y = 346;
  let body = '';
  for (const sec of (d.sections || []).slice(0, 2)) {
    body += `<text x="112" y="${y}" font-size="34" font-weight="700" fill="#fbbf24"># ${esc(clip(sec.h, 16))}</text>`;
    y += 50;
    for (const it of (sec.items || []).slice(0, 3)) {
      body += `<text x="112" y="${y}" font-size="30" fill="#e2e8f0">- ${esc(clip(it, 40))}</text>`;
      y += 46;
    }
    y += 30;
  }
  body += `<text x="112" y="${y + 10}" font-size="34" font-weight="700" fill="#fbbf24">${esc(clip(d.punch, 36))}</text>`;
  return shell(`<rect x="48" y="48" width="984" height="170" rx="36" fill="#1e1b4b"/>
<text x="96" y="110" font-size="28" fill="#fbbf24">$ takeaways</text>
<text x="96" y="176" font-size="38" fill="#ffffff">${esc(clip(d.sub, 34))}</text>
<rect x="48" y="238" width="984" height="760" rx="36" fill="#eef2ff"/>
<rect x="84" y="274" width="912" height="688" rx="24" fill="#0f172a"/>
<rect x="104" y="282" width="872" height="6" rx="3" fill="#fbbf24"/>
${body}
<rect x="112" y="868" width="856" height="2" fill="#334155"/>
<text x="112" y="918" font-size="30" font-weight="700" fill="#fbbf24">read the full breakdown →</text>
<text x="112" y="954" font-size="26" fill="#a5b4fc">buildwithsaksham.in/blog</text>
<text x="48" y="1040" font-size="22" fill="#94a3b8">buildwithsaksham.in · dev notes</text>`);
}

export const makeSlides = (d) => [png(slideA(d)), png(slideB(d))];

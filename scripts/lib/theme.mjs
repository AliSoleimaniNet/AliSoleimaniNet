// Shared design tokens and SVG helpers for every generated asset (static and CI-generated).
// All output is camo-safe: no scripts, no external fonts or images, SMIL animation only.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const SITE = 'https://alisoleimaninet.github.io';
export const GH = 'https://github.com/AliSoleimaniNet';
export const LINKEDIN = 'https://www.linkedin.com/in/ali-soleimani-net/';
export const EMAIL = 'AliSoleimaniWorks@gmail.com';
export const RAW = 'https://raw.githubusercontent.com/AliSoleimaniNet/AliSoleimaniNet/output';

// Featured open-source repos. Descriptions are curated here; stars, forks, language and dates come live from the API.
export const FEATURED_REPOS = [
  { name: 'Uber-Data-Intelligence-Platform', desc: 'End-to-end data platform on .NET Aspire: medallion lakehouse on PostgreSQL, Qdrant semantic search and a local LLM.', tags: ['.NET Aspire', 'PostgreSQL', 'Qdrant', 'Ollama'] },
  { name: 'QuizDSL-Studio', desc: 'Model-driven development: an Xtext DSL plus a .NET 10 service that turn prompts into models and generated apps.', tags: ['Xtext', 'MDSD', '.NET 10', 'LLM'] },
  { name: 'ProxyChainer', desc: 'Xray-core config builder that chains VLESS traffic through SOCKS proxies, with a Flet desktop UI.', tags: ['Python', 'Flet', 'Xray'] },
  { name: 'ExpressFinder', desc: 'Windows tool that automates the ExpressVPN CLI to test every location and connect to one that works.', tags: ['Python', 'CLI', 'Windows'] },
  { name: 'TSP-Bokeh-Genetic-PSO-AntColony', desc: 'Travelling-salesman solver comparing genetic, particle-swarm and ant-colony algorithms in a Bokeh app.', tags: ['Python', 'Bokeh', 'Metaheuristics'] },
  { name: 'ShamsiDate', desc: 'C# library for Persian (Shamsi) calendar dates, official holidays and events.', tags: ['C#', '.NET', 'Calendar'] },
];

export const FONT = `'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif`;
export const MONO = `'Cascadia Code', 'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace`;

export const themes = {
  dark: {
    name: 'dark', bg0: '#07090f', bg1: '#0b1020', text: '#e6e9ef', muted: '#8b93a3', line: 'rgba(255,255,255,0.07)',
    accent: '#22d3ee', accent2: '#a78bfa', chip: 'rgba(34,211,238,0.10)', chipText: '#9be9f5', chipBorder: 'rgba(34,211,238,0.35)',
    edge: 'rgba(34,211,238,0.22)', card: '#0e1219', cardBorder: 'rgba(255,255,255,0.10)', track: 'rgba(255,255,255,0.07)',
    ok: '#34d399',
  },
  light: {
    name: 'light', bg0: '#ffffff', bg1: '#f3f6fb', text: '#0f172a', muted: '#526077', line: 'rgba(15,23,42,0.07)',
    accent: '#0891b2', accent2: '#7c3aed', chip: 'rgba(8,145,178,0.08)', chipText: '#0e7490', chipBorder: 'rgba(8,145,178,0.35)',
    edge: 'rgba(8,145,178,0.25)', card: '#ffffff', cardBorder: 'rgba(15,23,42,0.12)', track: 'rgba(15,23,42,0.07)',
    ok: '#059669',
  },
};

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Rough glyph widths (em) for a Segoe-UI-like sans; good enough to size pills, used with textLength as a hard guarantee.
const NARROW = new Set([...'il.,:;!|\'`ſ']);
const SEMI = new Set([...'fjrtI()[]{} -·/\\"']);
const WIDE = new Set([...'mwMW@%']);
export function measure(text, size, { mono = false, bold = false } = {}) {
  if (mono) return text.length * size * 0.6;
  let w = 0;
  for (const ch of text) {
    if (NARROW.has(ch)) w += 0.27;
    else if (SEMI.has(ch)) w += 0.36;
    else if (WIDE.has(ch)) w += 0.86;
    else if (ch >= 'A' && ch <= 'Z') w += 0.64;
    else if (ch >= '0' && ch <= '9') w += 0.56;
    else w += 0.53;
  }
  return w * size * (bold ? 1.06 : 1);
}

/** A <text> that is forced to an exact width, so layouts never overlap whatever font the viewer has. */
export function fitText(text, { x, y, size, width, weight = 400, fill, family = FONT, anchor = 'start', extra = '' }) {
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"` +
    ` textLength="${width.toFixed(1)}" lengthAdjust="spacingAndGlyphs" ${extra}>${esc(text)}</text>`;
}

export const svgOpen = (w, h, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">`;

export const pulseDot = (t, x, y) =>
  `<g transform="translate(${x},${y})"><circle r="3" fill="${t.accent}"><animate attributeName="opacity" values="1;.25;1" dur="2s" repeatCount="indefinite"/></circle>` +
  `<circle r="7" fill="none" stroke="${t.accent}"><animate attributeName="r" values="3;11" dur="2s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values=".6;0" dur="2s" repeatCount="indefinite"/></circle></g>`;

/** Sweeping highlight that crosses a card every few seconds: cheap "alive" feeling. */
export const sheen = (id, w, h, t, delay = 0) =>
  `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${t.accent}" stop-opacity="0"/>` +
  `<stop offset=".5" stop-color="${t.accent}" stop-opacity=".10"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></linearGradient></defs>` +
  `<rect x="${-w * 0.4}" y="0" width="${w * 0.4}" height="${h}" fill="url(#${id})"><animate attributeName="x" values="${-w * 0.4};${w};${w}" keyTimes="0;.35;1" dur="7s" begin="${delay}s" repeatCount="indefinite"/></rect>`;

export function cardFrame(t, w, h, { rail = true, glow = true } = {}) {
  return `<defs><linearGradient id="rail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.accent}"/><stop offset="1" stop-color="${t.accent2}"/></linearGradient>` +
    `<radialGradient id="glow" cx="1" cy="0" r="1"><stop offset="0" stop-color="${t.accent}" stop-opacity=".16"/><stop offset=".6" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>` +
    `<clipPath id="clip"><rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="14"/></clipPath></defs>` +
    `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="14" fill="${t.card}" stroke="${t.cardBorder}"/>` +
    (glow ? `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="14" fill="url(#glow)"/>` : '') +
    (rail ? `<rect x="0" y="14" width="3" height="${h - 28}" rx="1.5" fill="url(#rail)"/>` : '');
}

/** Tag pills laid out left to right; returns svg and the x after the last pill. */
export function tagRow(t, tags, x, y, { size = 12.5, h = 24, gap = 8, maxX = Infinity } = {}) {
  let s = '';
  for (const tag of tags) {
    const tw = measure(tag, size, { mono: true });
    const w = Math.round(tw + 20);
    if (x + w > maxX) break;
    s += `<g transform="translate(${x},${y})"><rect width="${w}" height="${h}" rx="${h / 2}" fill="${t.chip}" stroke="${t.chipBorder}" stroke-opacity=".5"/>` +
      fitText(tag, { x: w / 2, y: h / 2 + size * 0.36, size, width: tw, fill: t.chipText, family: MONO, anchor: 'middle' }) + `</g>`;
    x += w + gap;
  }
  return { svg: s, x };
}

/** Wrap text into lines of at most `max` characters. */
export function wrap(text, max, lines = 2) {
  const words = text.split(/\s+/);
  const out = [''];
  for (const w of words) {
    const cur = out[out.length - 1];
    if ((cur + ' ' + w).trim().length > max) {
      if (out.length === lines) { out[out.length - 1] = cur.replace(/[\s,.;:]*$/, '') + '…'; return out; }
      out.push(w);
    } else out[out.length - 1] = (cur + ' ' + w).trim();
  }
  return out;
}

/** Inline a downloaded icon SVG as a nested <svg> at (x,y,size). Optional colour inversion for dark-on-dark logos. */
export function inlineIcon(iconsDir, name, x, y, size, { invert = false } = {}) {
  let src = readFileSync(join(iconsDir, `${name}.svg`), 'utf8');
  src = src.replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<!DOCTYPE[^>]*>/gi, '').trim();
  const open = /<svg\b[^>]*>/i.exec(src)[0];
  let attrs = open;
  const vb = /viewBox="([^"]+)"/i.exec(open)?.[1];
  const wAttr = /\swidth="([\d.]+)/i.exec(open)?.[1];
  const hAttr = /\sheight="([\d.]+)/i.exec(open)?.[1];
  attrs = attrs.replace(/\s(width|height|x|y)="[^"]*"/gi, '');
  const viewBox = vb ?? (wAttr && hAttr ? `0 0 ${wAttr} ${hAttr}` : '0 0 128 128');
  if (!vb) attrs = attrs.replace(/<svg/i, `<svg viewBox="${viewBox}"`);
  attrs = attrs.replace(/<svg/i, `<svg x="${x}" y="${y}" width="${size}" height="${size}"`);
  // make ids unique per icon to avoid clashes if two icons ever share a file
  const body = src.slice(src.indexOf(open) + open.length).replace(/id="([^"]+)"/g, `id="${name}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${name}-$1)`).replace(/href="#([^"]+)"/g, `href="#${name}-$1"`);
  const nested = attrs + body;
  if (!invert) return nested;
  return `<filter id="inv-${name}"><feColorMatrix type="matrix" values="-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0"/></filter><g filter="url(#inv-${name})">${nested}</g>`;
}

export const relTime = (iso, now = Date.now()) => {
  const d = (now - new Date(iso).getTime()) / 1000;
  if (d < 3600) return `${Math.max(1, Math.floor(d / 60))}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  if (d < 86400 * 30) return `${Math.floor(d / 86400)}d ago`;
  if (d < 86400 * 365) return `${Math.floor(d / (86400 * 30))}mo ago`;
  return `${Math.floor(d / (86400 * 365))}y ago`;
};

export const LANG_COLORS = {
  'C#': '#178600', Go: '#00ADD8', Python: '#3572A5', TypeScript: '#3178c6', JavaScript: '#f1e05a', 'C++': '#f34b7d', C: '#555555',
  Java: '#b07219', HTML: '#e34c26', CSS: '#563d7c', Dockerfile: '#384d54', Shell: '#89e051', PHP: '#4F5D95', Rust: '#dea584', Kotlin: '#A97BFF',
};

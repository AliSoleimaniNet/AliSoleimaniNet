// Builds assets-style "Most used languages" cards (dark + light) from the GitHub API.
// Aggregates language bytes across all repositories the token can see (private included),
// skips generated/coursework repos and non-code languages, and renders a self-contained SVG.
// Usage: GITHUB_TOKEN=... node scripts/languages-card.mjs <outDir>
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const token = process.env.GITHUB_TOKEN || process.env.METRICS_TOKEN;
const out = process.argv[2] || 'dist/metrics';
if (!token) { console.error('GITHUB_TOKEN missing'); process.exit(1); }

const SKIP_REPOS = new Set(['quizdsl-studio', 'hw3nlp', 'idash2018_docker', 'matrixmultiplymr', 'bdhw5-lakehouse', 'alisoleimaninet', 'alisoleimaninet.github.io']);
const SKIP_LANGS = new Set(['java', 'gap', 'systemverilog', 'html', 'css', 'scss', 'jupyter notebook', 'tex', 'makefile', 'dockerfile', 'shell', 'batchfile', 'qmake', 'xtend', 'powershell', 'cmake', 'smarty', 'plpgsql', 'tsql', 'hcl', 'procfile', 'mdx']);
const LIMIT = 8;
const COLORS = {
  'c#': '#178600', go: '#00ADD8', python: '#3572A5', typescript: '#3178c6', javascript: '#f1e05a', 'c++': '#f34b7d', c: '#555555',
  rust: '#dea584', kotlin: '#A97BFF', dart: '#00B4AB', swift: '#F05138', php: '#4F5D95', ruby: '#701516', vue: '#41b883', svelte: '#ff3e00', lua: '#000080', glsl: '#5686a5',
};

const api = async (url) => {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'languages-card' } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return { json: await r.json(), link: r.headers.get('link') || '' };
};

// Own repositories, plus an allowlist of shared repositories where I am the main author
// (EXTRA_REPOS="org/repo,org/repo2"; kept in a secret so private names stay out of this file).
const repos = [];
let url = 'https://api.github.com/user/repos?affiliation=owner&per_page=100&sort=pushed';
while (url) {
  const { json, link } = await api(url);
  repos.push(...json);
  url = /<([^>]+)>;\s*rel="next"/.exec(link)?.[1] ?? null;
}
for (const full of (process.env.EXTRA_REPOS || '').split(',').map((s) => s.trim()).filter(Boolean)) {
  try { repos.push((await api(`https://api.github.com/repos/${full}`)).json); }
  catch (e) { console.error('extra repo skipped', full, e.message); }
}
const totals = new Map();
let counted = 0;
for (const r of repos) {
  if (r.fork || r.archived || SKIP_REPOS.has(r.name.toLowerCase())) continue;
  try {
    const { json } = await api(`https://api.github.com/repos/${r.full_name}/languages`);
    for (const [lang, bytes] of Object.entries(json)) {
      if (SKIP_LANGS.has(lang.toLowerCase())) continue;
      totals.set(lang, (totals.get(lang) || 0) + bytes);
    }
    counted++;
  } catch (e) { console.error('skip', r.full_name, e.message); }
}
const sum = [...totals.values()].reduce((a, b) => a + b, 0);
const top = [...totals.entries()].sort((a, b) => b[1] - a[1])
  .map(([name, bytes]) => ({ name, bytes, pct: (bytes / sum) * 100 }))
  .filter((l) => l.pct >= 0.5)
  .slice(0, LIMIT);
console.log(`repos scanned: ${counted}, languages: ${totals.size}`);
top.forEach((l) => console.log(`  ${l.name.padEnd(14)} ${l.pct.toFixed(1)}%`));

const fmt = (b) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} kB`);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const themes = {
  dark: { bg: '#0e1219', border: 'rgba(255,255,255,0.09)', text: '#e6e9ef', muted: '#8b93a3', accent: '#22d3ee', track: 'rgba(255,255,255,0.06)' },
  light: { bg: '#ffffff', border: 'rgba(15,23,42,0.10)', text: '#0f172a', muted: '#526077', accent: '#0891b2', track: 'rgba(15,23,42,0.06)' },
};
const FONT = `'Segoe UI', -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif`;
const MONO = `'Cascadia Code', Consolas, 'Courier New', monospace`;

function card(t) {
  const W = 600, rowH = 26, top0 = 92, H = top0 + top.length * rowH + 22;
  let x = 24, stacked = '';
  top.forEach((l, i) => {
    const w = Math.max(2, (W - 48) * (l.pct / 100));
    stacked += `<rect x="${x.toFixed(1)}" y="56" width="${w.toFixed(1)}" height="10" fill="${COLORS[l.name.toLowerCase()] || t.accent}" rx="${i === 0 ? 5 : 0}"><animate attributeName="width" from="0" to="${w.toFixed(1)}" dur="1s" begin="${(i * 0.08).toFixed(2)}s" fill="freeze"/></rect>`;
    x += w;
  });
  const rows = top.map((l, i) => {
    const y = top0 + i * rowH;
    const c = COLORS[l.name.toLowerCase()] || t.accent;
    const trackW = W - 48 - 300;
    const bw = trackW * (l.pct / top[0].pct);
    return `<g transform="translate(24,${y})">
      <circle cx="6" cy="9" r="5" fill="${c}"/>
      <text x="20" y="13" font-family="${FONT}" font-size="13" font-weight="600" fill="${t.text}">${esc(l.name)}</text>
      <rect x="150" y="5" width="${trackW}" height="8" rx="4" fill="${t.track}"/>
      <rect x="150" y="5" width="${bw.toFixed(1)}" height="8" rx="4" fill="${c}"><animate attributeName="width" from="0" to="${bw.toFixed(1)}" dur=".9s" begin="${(0.3 + i * 0.06).toFixed(2)}s" fill="freeze"/></rect>
      <text x="${W - 48 - 60}" y="13" text-anchor="end" font-family="${MONO}" font-size="11.5" fill="${t.muted}">${fmt(l.bytes)}</text>
      <text x="${W - 48}" y="13" text-anchor="end" font-family="${MONO}" font-size="12" font-weight="700" fill="${t.text}">${l.pct.toFixed(1)}%</text>
    </g>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Most used languages">
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="${t.bg}" stroke="${t.border}"/>
<text x="24" y="32" font-family="${FONT}" font-size="15" font-weight="700" fill="${t.accent}">Most used languages</text>
<text x="${W - 24}" y="32" text-anchor="end" font-family="${MONO}" font-size="11" fill="${t.muted}">${counted} repos I author · public + private · by bytes</text>
${stacked}${rows}
</svg>`;
}

mkdirSync(out, { recursive: true });
for (const [name, t] of Object.entries(themes)) writeFileSync(join(out, `languages-${name}.svg`), card(t));
console.log('written', out);

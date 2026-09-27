// Renders the live parts of the profile from the GitHub API (runs in CI every 6 hours):
//   stats/{contributions,streak,prs,overview}-{dark,light}.svg
//   repos/<name>-{dark,light}.svg      one card per featured repository
//   metrics/languages-{dark,light}.svg language share across repositories I author
// Usage: GITHUB_TOKEN=... [EXTRA_REPOS=org/a,org/b] node scripts/dynamic.mjs <outDir>
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
  themes, esc, measure, fitText, svgOpen, pulseDot, sheen, cardFrame, tagRow, wrap, relTime,
  FONT, MONO, LANG_COLORS, FEATURED_REPOS,
} from './lib/theme.mjs';

const USER = 'AliSoleimaniNet';
const token = process.env.GITHUB_TOKEN || process.env.METRICS_TOKEN;
const OUT = process.argv[2] || 'dist';
if (!token) { console.error('GITHUB_TOKEN missing'); process.exit(1); }
const write = (rel, svg) => { const p = join(OUT, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, svg); };

const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'profile-dynamic' };
async function rest(url) {
  const r = await fetch(url.startsWith('http') ? url : `https://api.github.com${url}`, { headers });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return { json: await r.json(), link: r.headers.get('link') || '' };
}
async function gql(query, variables = {}) {
  const r = await fetch('https://api.github.com/graphql', { method: 'POST', headers, body: JSON.stringify({ query, variables }) });
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  return j.data;
}
const fmtN = (n) => (n >= 10000 ? `${(n / 1000).toFixed(1)}k` : n.toLocaleString('en-US'));

/* ───────────────────────── data ───────────────────────── */
const data = await gql(`query($login: String!) {
  user(login: $login) {
    followers { totalCount }
    pullRequests { totalCount }
    repositories(ownerAffiliations: OWNER, isFork: false, first: 100) { totalCount nodes { stargazerCount forkCount } }
    contributionsCollection {
      totalCommitContributions totalPullRequestContributions totalPullRequestReviewContributions
      totalIssueContributions restrictedContributionsCount
      commitContributionsByRepository(maxRepositories: 100) { repository { isPrivate } contributions { totalCount } }
      pullRequestContributionsByRepository(maxRepositories: 100) { repository { isPrivate } contributions { totalCount } }
      contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
    }
  }
}`, { login: USER });
const u = data.user, cc = u.contributionsCollection;
const days = cc.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
const weeks = cc.contributionCalendar.weeks.map((w) => w.contributionDays.reduce((a, d) => a + d.contributionCount, 0));
const stars = u.repositories.nodes.reduce((a, r) => a + r.stargazerCount, 0);
// Viewing my own profile, private work is not "restricted", so sum private repositories explicitly.
const privateWork = cc.restrictedContributionsCount + [...cc.commitContributionsByRepository, ...cc.pullRequestContributionsByRepository]
  .filter((x) => x.repository.isPrivate).reduce((a, x) => a + x.contributions.totalCount, 0);

// streaks (today may still be empty: the current streak then counts up to yesterday)
let longest = 0, run = 0;
for (const d of days) { run = d.contributionCount > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
let current = 0;
for (let i = days.length - 1; i >= 0; i--) {
  if (days[i].contributionCount > 0) current++;
  else if (i === days.length - 1) continue;
  else break;
}
const activeDays = days.filter((d) => d.contributionCount > 0).length;
console.log({ privateWork, total: cc.contributionCalendar.totalContributions, current, longest, activeDays, stars });

/* ───────────────────────── stat tiles ───────────────────────── */
function tile(t, { label, value, unit, foot, viz, delay }) {
  const W = 400, H = 170;
  return `${svgOpen(W, H, `${label}: ${value}`)}
${cardFrame(t, W, H, { rail: false })}
<g clip-path="url(#clip)">${sheen('sh', W, H, t, delay)}</g>
<text x="24" y="38" font-family="${MONO}" font-size="12.5" letter-spacing="1.2" fill="${t.accent}">${esc(label.toUpperCase())}</text>
${pulseDot(t, W - 26, 34)}
<text x="22" y="96" font-family="${FONT}" font-size="50" font-weight="800" letter-spacing="-1.5" fill="${t.text}">${esc(value)}<tspan font-size="18" font-weight="600" fill="${t.muted}" dx="8">${esc(unit)}</tspan></text>
${viz}
<text x="24" y="${H - 20}" font-family="${FONT}" font-size="14" fill="${t.muted}">${esc(foot)}</text>
</svg>`;
}
function sparkBars(t, values, x, y, w, h) {
  const max = Math.max(1, ...values), bw = w / values.length;
  return values.map((v, i) => {
    const bh = Math.max(1.5, (v / max) * h);
    return `<rect x="${(x + i * bw).toFixed(1)}" y="${(y + h - bh).toFixed(1)}" width="${(bw - 1.2).toFixed(1)}" height="${bh.toFixed(1)}" rx="1" fill="${t.accent}" opacity="${(0.35 + 0.65 * (v / max)).toFixed(2)}">` +
      `<animate attributeName="height" from="0" to="${bh.toFixed(1)}" dur=".8s" begin="${(i * 0.012).toFixed(2)}s" fill="freeze"/>` +
      `<animate attributeName="y" from="${y + h}" to="${(y + h - bh).toFixed(1)}" dur=".8s" begin="${(i * 0.012).toFixed(2)}s" fill="freeze"/></rect>`;
  }).join('');
}
function dayRow(t, recent, x, y) {
  const max = Math.max(1, ...recent.map((d) => d.contributionCount));
  return recent.map((d, i) => {
    const v = d.contributionCount, o = v === 0 ? 1 : 0.35 + 0.65 * (v / max);
    return `<rect x="${x + i * 17}" y="${y}" width="13" height="13" rx="3" fill="${v === 0 ? t.track : t.accent}" opacity="${o.toFixed(2)}"/>`;
  }).join('');
}

/* ───────────────────────── overview card ───────────────────────── */
function overview(t) {
  const W = 600, H = 250;
  const cells = [
    ['Repositories', fmtN(u.repositories.totalCount), 'owned, not forks'],
    ['Stars earned', fmtN(stars), 'across my repositories'],
    ['Followers', fmtN(u.followers.totalCount), 'on GitHub'],
    ['Private work', fmtN(privateWork), 'contributions this year'],
  ];
  const cw = (W - 48) / 2;
  return `${svgOpen(W, H, 'GitHub overview')}
${cardFrame(t, W, H, { rail: false })}
<text x="24" y="36" font-family="${FONT}" font-size="17" font-weight="700" fill="${t.accent}">At a glance</text>
<text x="${W - 24}" y="36" text-anchor="end" font-family="${MONO}" font-size="12" fill="${t.muted}">${activeDays} active days this year</text>
${cells.map(([l, v, s], i) => {
    const x = 24 + (i % 2) * cw, y = 60 + Math.floor(i / 2) * 88;
    return `<g transform="translate(${x},${y})"><rect width="${cw - 12}" height="76" rx="12" fill="${t.chip}" stroke="${t.chipBorder}" stroke-opacity=".5"/>` +
      `<text x="16" y="44" font-family="${FONT}" font-size="30" font-weight="800" fill="${t.text}">${esc(v)}</text>` +
      `<text x="${cw - 28}" y="30" text-anchor="end" font-family="${MONO}" font-size="12" fill="${t.accent}">${esc(l)}</text>` +
      `<text x="${cw - 28}" y="52" text-anchor="end" font-family="${FONT}" font-size="12.5" fill="${t.muted}">${esc(s)}</text></g>`;
  }).join('')}
</svg>`;
}

/* ───────────────────────── repo cards ───────────────────────── */
const REPO_GLYPH = '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5V4.5M8 6h8"/>';
function repoCard(t, r, meta) {
  const W = 600, H = 200;
  const lines = wrap(meta.desc, 70, 2);
  const lang = r.language || '';
  const lc = LANG_COLORS[lang] || t.muted;
  const tags = tagRow(t, meta.tags, 24, 116, { maxX: W - 24, size: 12 });
  const nameW = Math.min(measure(r.name, 20, { bold: true }), W - 120);
  let mx = 24;
  const metaParts = [];
  if (lang) { metaParts.push(`<circle cx="${mx + 6}" cy="${H - 26}" r="6" fill="${lc}"/><text x="${mx + 18}" y="${H - 21}" font-family="${FONT}" font-size="14" fill="${t.muted}">${esc(lang)}</text>`); mx += 30 + measure(lang, 14); }
  metaParts.push(`<text x="${mx}" y="${H - 21}" font-family="${FONT}" font-size="14" fill="${t.muted}">★ ${r.stargazers_count}</text>`); mx += 52;
  metaParts.push(`<text x="${mx}" y="${H - 21}" font-family="${FONT}" font-size="14" fill="${t.muted}">⑂ ${r.forks_count}</text>`);
  return `${svgOpen(W, H, `${r.name}: ${meta.desc}`)}
${cardFrame(t, W, H)}
<g transform="translate(24,24) scale(.83)" fill="none" stroke="${t.accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${REPO_GLYPH}</g>
${fitText(r.name, { x: 52, y: 42, size: 20, width: nameW, weight: 700, fill: t.text })}
<text x="${W - 24}" y="42" text-anchor="end" font-family="${MONO}" font-size="12" fill="${t.muted}">${r.archived ? 'archived' : 'public'}</text>
${lines.map((l, i) => `<text x="24" y="${74 + i * 21}" font-family="${FONT}" font-size="15" fill="${t.muted}">${esc(l)}</text>`).join('')}
${tags.svg}
<rect x="24" y="${H - 50}" width="${W - 48}" height="1" fill="${t.cardBorder}"/>
${metaParts.join('')}
<text x="${W - 24}" y="${H - 21}" text-anchor="end" font-family="${MONO}" font-size="12.5" fill="${t.muted}">updated ${relTime(r.pushed_at)}</text>
</svg>`;
}

/* ───────────────────────── languages ───────────────────────── */
const SKIP_REPOS = new Set(['quizdsl-studio', 'hw3nlp', 'idash2018_docker', 'matrixmultiplymr', 'bdhw5-lakehouse', 'alisoleimaninet', 'alisoleimaninet.github.io']);
const SKIP_LANGS = new Set(['java', 'gap', 'systemverilog', 'html', 'css', 'scss', 'jupyter notebook', 'tex', 'makefile', 'dockerfile', 'shell', 'batchfile', 'qmake', 'xtend', 'powershell', 'cmake', 'smarty', 'plpgsql', 'tsql', 'hcl', 'procfile', 'mdx', 'asp.net']);
async function languages() {
  const repos = [];
  let url = '/user/repos?affiliation=owner&per_page=100&sort=pushed';
  while (url) { const { json, link } = await rest(url); repos.push(...json); url = /<([^>]+)>;\s*rel="next"/.exec(link)?.[1] ?? null; }
  for (const full of (process.env.EXTRA_REPOS || '').split(',').map((s) => s.trim()).filter(Boolean)) {
    try { repos.push((await rest(`/repos/${full}`)).json); } catch (e) { console.error('extra repo skipped:', e.message); }
  }
  const totals = new Map();
  let counted = 0;
  for (const r of repos) {
    if (r.fork || r.archived || SKIP_REPOS.has(r.name.toLowerCase())) continue;
    try {
      const { json } = await rest(`/repos/${r.full_name}/languages`);
      for (const [lang, bytes] of Object.entries(json)) if (!SKIP_LANGS.has(lang.toLowerCase())) totals.set(lang, (totals.get(lang) || 0) + bytes);
      counted++;
    } catch (e) { console.error('skip', r.full_name, e.message); }
  }
  const sum = [...totals.values()].reduce((a, b) => a + b, 0) || 1;
  const top = [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([name, bytes]) => ({ name, bytes, pct: (bytes / sum) * 100 }))
    .filter((l) => l.pct >= 0.5).slice(0, 6);
  return { top, counted };
}
function languagesCard(t, { top, counted }) {
  const W = 600, H = 250, trackW = W - 48 - 290;
  let x = 24;
  const stacked = top.map((l, i) => {
    const w = Math.max(2, (W - 48) * (l.pct / 100)), c = LANG_COLORS[l.name] || t.accent;
    const s = `<rect x="${x.toFixed(1)}" y="54" width="${w.toFixed(1)}" height="10" fill="${c}"><animate attributeName="width" from="0" to="${w.toFixed(1)}" dur="1s" begin="${(i * 0.08).toFixed(2)}s" fill="freeze"/></rect>`;
    x += w; return s;
  }).join('');
  const fmt = (b) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} kB`);
  const rows = top.map((l, i) => {
    const y = 88 + i * 26, c = LANG_COLORS[l.name] || t.accent, bw = trackW * (l.pct / top[0].pct);
    return `<g transform="translate(24,${y})"><circle cx="6" cy="9" r="5" fill="${c}"/>
      <text x="20" y="14" font-family="${FONT}" font-size="14.5" font-weight="600" fill="${t.text}">${esc(l.name)}</text>
      <rect x="140" y="5" width="${trackW}" height="8" rx="4" fill="${t.track}"/>
      <rect x="140" y="5" width="${bw.toFixed(1)}" height="8" rx="4" fill="${c}"><animate attributeName="width" from="0" to="${bw.toFixed(1)}" dur=".9s" begin="${(0.3 + i * 0.06).toFixed(2)}s" fill="freeze"/></rect>
      <text x="${W - 48 - 66}" y="14" text-anchor="end" font-family="${MONO}" font-size="12" fill="${t.muted}">${fmt(l.bytes)}</text>
      <text x="${W - 48}" y="14" text-anchor="end" font-family="${MONO}" font-size="13" font-weight="700" fill="${t.text}">${l.pct.toFixed(1)}%</text></g>`;
  }).join('');
  return `${svgOpen(W, H, 'Most used languages')}
${cardFrame(t, W, H, { rail: false })}
<defs><clipPath id="bar"><rect x="24" y="54" width="${W - 48}" height="10" rx="5"/></clipPath></defs>
<text x="24" y="36" font-family="${FONT}" font-size="17" font-weight="700" fill="${t.accent}">Most used languages</text>
<text x="${W - 24}" y="36" text-anchor="end" font-family="${MONO}" font-size="12" fill="${t.muted}">${counted} repos I author · public + private</text>
<rect x="24" y="54" width="${W - 48}" height="10" rx="5" fill="${t.track}"/>
<g clip-path="url(#bar)">${stacked}</g>
${rows}
</svg>`;
}

/* ───────────────────────── render ───────────────────────── */
const langs = await languages();
console.log('languages:', langs.top.map((l) => `${l.name} ${l.pct.toFixed(1)}%`).join(', '));
const repoData = [];
for (const meta of FEATURED_REPOS) {
  try { repoData.push([(await rest(`/repos/${USER}/${meta.name}`)).json, meta]); } catch (e) { console.error('repo skipped', meta.name, e.message); }
}

for (const [name, t] of Object.entries(themes)) {
  write(`stats/contributions-${name}.svg`, tile(t, {
    label: 'Contributions', value: fmtN(cc.contributionCalendar.totalContributions), unit: 'this year',
    foot: `${fmtN(cc.totalCommitContributions)} commits · ${fmtN(privateWork)} in private repos`,
    viz: sparkBars(t, weeks.slice(-40), 232, 58, 144, 46), delay: 0,
  }));
  write(`stats/streak-${name}.svg`, tile(t, {
    label: 'Streak', value: String(current), unit: current === 1 ? 'day' : 'days',
    foot: `longest ${longest} days · ${activeDays} active days`,
    viz: dayRow(t, days.slice(-8), 232, 74), delay: 1.2,
  }));
  write(`stats/prs-${name}.svg`, tile(t, {
    label: 'Pull requests', value: fmtN(u.pullRequests.totalCount), unit: 'opened',
    foot: `${fmtN(cc.totalPullRequestContributions)} this year · ${fmtN(cc.totalPullRequestReviewContributions)} reviews`,
    viz: '', delay: 2.4,
  }));
  write(`stats/overview-${name}.svg`, overview(t));
  write(`metrics/languages-${name}.svg`, languagesCard(t, langs));
  for (const [r, meta] of repoData) write(`repos/${meta.name}-${name}.svg`, repoCard(t, r, meta));
}
console.log('dynamic assets written to', OUT);

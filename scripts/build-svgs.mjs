// Generates assets/header-{dark,light}.svg and assets/cards/*-{dark,light}.svg.
// Pure SMIL animation, system fonts only, no external requests (GitHub camo-safe).
// Run: node scripts/build-svgs.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FONT = `'Segoe UI', -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif`;
const MONO = `'Cascadia Code', 'Fira Code', Consolas, 'Courier New', monospace`;

const themes = {
  dark: {
    bg0: '#07090f', bg1: '#0b1020', text: '#e6e9ef', muted: '#8b93a3', line: 'rgba(255,255,255,0.07)',
    accent: '#22d3ee', accent2: '#a78bfa', chip: 'rgba(34,211,238,0.10)', chipText: '#9be9f5',
    edge: 'rgba(34,211,238,0.22)', card: '#0e1219', cardBorder: 'rgba(255,255,255,0.09)',
  },
  light: {
    bg0: '#ffffff', bg1: '#f3f6fb', text: '#0f172a', muted: '#526077', line: 'rgba(15,23,42,0.07)',
    accent: '#0891b2', accent2: '#7c3aed', chip: 'rgba(8,145,178,0.10)', chipText: '#0e7490',
    edge: 'rgba(8,145,178,0.25)', card: '#ffffff', cardBorder: 'rgba(15,23,42,0.10)',
  },
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ── Mesh motif (right side of header) ─────────────────────────────────────
const NODES = [
  [760, 70], [850, 150], [930, 60], [1010, 140], [1100, 80], [1150, 190],
  [1060, 240], [960, 220], [870, 250], [790, 190], [1140, 30], [700, 140],
];
const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 0],
  [1, 7], [3, 6], [2, 4], [4, 10], [0, 11], [9, 11], [1, 9], [3, 7],
];

function edgePath([ax, ay], [bx, by], i) {
  const mx = (ax + bx) / 2, my = (ay + by) / 2;
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
  const bend = (i % 2 ? 1 : -1) * Math.min(28, len * 0.22);
  const cx = mx + (-dy / len) * bend, cy = my + (dx / len) * bend;
  return `M${ax},${ay} Q${cx},${cy} ${bx},${by}`;
}

function mesh(t) {
  let s = '';
  EDGES.forEach(([a, b], i) => {
    const d = edgePath(NODES[a], NODES[b], i);
    const dur = (2.6 + ((i * 0.37) % 2.2)).toFixed(2);
    const begin = ((i * 0.53) % 3).toFixed(2);
    s += `<path id="e${i}" d="${d}" fill="none" stroke="${t.edge}" stroke-width="1"/>`;
    s += `<circle r="2.2" fill="${t.accent}">` +
      `<animateMotion dur="${dur}s" begin="${begin}s" repeatCount="indefinite"><mpath href="#e${i}"/></animateMotion>` +
      `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.9;1" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></circle>`;
  });
  NODES.forEach(([x, y], i) => {
    const d = (2.4 + (i % 4) * 0.5).toFixed(1);
    const b = (i * 0.3).toFixed(1);
    s += `<circle cx="${x}" cy="${y}" r="9" fill="${t.accent}" opacity=".12"><animate attributeName="r" values="7;12;7" dur="${d}s" begin="${b}s" repeatCount="indefinite"/></circle>`;
    s += `<circle cx="${x}" cy="${y}" r="3.2" fill="${t.accent}"><animate attributeName="r" values="3;4.2;3" dur="${d}s" begin="${b}s" repeatCount="indefinite"/></circle>`;
  });
  return s;
}

// ── Header ────────────────────────────────────────────────────────────────
const ROLES = ['Backend .NET Tech Lead', 'Go Engineer', 'Distributed Systems Builder', 'M.Sc. Software Engineering'];
const TYPED = 'building scalable, maintainable microservices';

function chip(t, x, label) {
  const w = Math.round(label.length * 7.2 + 22);
  return `<g transform="translate(${x},0)"><rect width="${w}" height="24" rx="12" fill="${t.chip}" stroke="${t.accent}" stroke-opacity=".35"/>` +
    `<text x="${w / 2}" y="16" text-anchor="middle" fill="${t.chipText}">${esc(label)}</text></g>`;
}

function header(t) {
  const roleDur = 3, total = ROLES.length * roleDur;
  const roles = ROLES.map((r, i) => {
    const kt = [0, 0.04, (roleDur - 0.3) / total, roleDur / total, 1].map((n) => n.toFixed(4)).join(';');
    return `<text x="0" y="0" opacity="0" font-family="${FONT}" font-size="26" font-weight="600" fill="${t.accent}">${esc(r)}` +
      `<animate attributeName="opacity" values="0;1;1;0;0" keyTimes="${kt}" dur="${total}s" begin="${i * roleDur}s" repeatCount="indefinite"/></text>`;
  }).join('');
  const typedW = Math.round(TYPED.length * 9.65);
  const chips = [
    ['Tech Lead @ Helpsy', 0], ['.NET · Go', 150], ['M.Sc. SE · University of Isfahan', 236], ['Isfahan, IR', 470],
  ].map(([l, x]) => chip(t, x, l)).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300" viewBox="0 0 1200 300" role="img" aria-label="Ali Soleimani, ${ROLES[0]}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.bg0}"/><stop offset="1" stop-color="${t.bg1}"/></linearGradient>
  <linearGradient id="name" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${t.text}"/><stop offset=".5" stop-color="${t.accent}"/><stop offset="1" stop-color="${t.accent2}"/>
    <animate attributeName="x1" values="-1;1" dur="6s" repeatCount="indefinite"/>
    <animate attributeName="x2" values="0;2" dur="6s" repeatCount="indefinite"/>
  </linearGradient>
  <radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${t.accent}" stop-opacity=".22"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>
  <clipPath id="typeClip"><rect x="0" y="-18" width="0" height="26"><animate attributeName="width" values="0;0;${typedW};${typedW};0" keyTimes="0;.08;.55;.92;1" dur="9s" repeatCount="indefinite"/></rect></clipPath>
  <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="${t.line}" stroke-width="1"/></pattern>
</defs>
<rect width="1200" height="300" rx="16" fill="url(#bg)"/>
<rect width="1200" height="300" rx="16" fill="url(#grid)"/>
<ellipse cx="960" cy="150" rx="330" ry="170" fill="url(#glow)"/>
<g>${mesh(t)}</g>
<g transform="translate(64,0)">
  <text x="0" y="74" font-family="${MONO}" font-size="15" fill="${t.muted}">// hi, I am</text>
  <text x="-2" y="140" font-family="${FONT}" font-size="64" font-weight="800" letter-spacing="-1.5" fill="url(#name)">Ali Soleimani</text>
  <g transform="translate(0,182)">${roles}</g>
  <g transform="translate(0,230)" font-family="${MONO}" font-size="16">
    <text x="0" y="0" fill="${t.muted}">›</text>
    <text x="16" y="0" fill="${t.text}" clip-path="url(#typeClip)">${esc(TYPED)}</text>
    <rect x="16" y="-14" width="9" height="18" fill="${t.accent}">
      <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.5;.5;1" dur="1s" repeatCount="indefinite"/>
      <animate attributeName="x" values="16;16;${16 + typedW};${16 + typedW};16" keyTimes="0;.08;.55;.92;1" dur="9s" repeatCount="indefinite"/>
    </rect>
  </g>
  <g transform="translate(0,258)" font-family="${FONT}" font-size="12.5" font-weight="600">${chips}</g>
</g>
</svg>`;
}

// ── Project cards ─────────────────────────────────────────────────────────
const CARDS = [
  {
    id: 'helpsy', kicker: 'TECH LEAD · PRODUCTION', title: 'Helpsy', sub: 'Mental-health clinic & therapy platform · helpsy.ir',
    lines: [
      '8 .NET 9 microservices behind a YARP gateway · gRPC · MassTransit/RabbitMQ outbox',
      'PostgreSQL · Redis · Hangfire · multi-tenant sub-domains · payments & settlement',
      'Next.js + React panels · GitLab CI · Docker · Grafana observability',
    ],
    tags: ['.NET 9', 'gRPC', 'RabbitMQ', 'PostgreSQL', 'Redis', 'YARP', 'Next.js'],
  },
  {
    id: 'kiosk', kicker: 'OWNER · PRODUCTION', title: 'Kiosk Management', sub: 'Self-service payment kiosks for a public-sector client',
    lines: [
      'Bank PC-POS terminals (Sadad, FanAva) + thermal receipt printers',
      'Offline-first kiosks: SQLite store-and-forward, sync workers, fleet auto-update',
      'Dozens of kiosks · thousands of transactions a day · years in production',
    ],
    tags: ['.NET 8', 'Clean Architecture', 'CQRS', 'PostgreSQL', 'SQLite', 'Docker'],
  },
  {
    id: 'kiosell', kicker: 'OWNER · IN PROGRESS', title: 'KioSell', sub: 'Multi-tenant commerce & reservation SaaS',
    lines: [
      '.NET 10 modular monolith · OpenIddict auth server · Postgres row-level security',
      'Redpanda/Kafka outbox-inbox · Redis · MinIO · OpenTelemetry · Testcontainers',
      'Go gRPC gateways · Next.js monorepo (eShop, tenant admin, platform console)',
    ],
    tags: ['.NET 10', 'OpenIddict', 'Kafka', 'Go', 'OTel', 'Next.js'],
  },
  {
    id: 'iam', kicker: 'GO · CONFIDENTIAL', title: 'Healthcare IAM Platform', sub: 'Identity & access platform for a healthcare company',
    lines: [
      '6 Go services: gateway · auth · session · token/JWKS · policy decision point · admin',
      'SSO · MFA & step-up · mutual-TLS channels · key rotation · tenant lifecycle',
      'PostgreSQL · Redis · OpenTelemetry · Prometheus · single sign-on across 4 products',
    ],
    tags: ['Go', 'OAuth2 / OIDC', 'JWKS', 'mTLS', 'PostgreSQL', 'OTel'],
  },
];

function card(t, c) {
  const W = 590, H = 210;
  let tagX = 24;
  const tags = c.tags.map((tag) => {
    const w = Math.round(tag.length * 6.6 + 18);
    const s = `<g transform="translate(${tagX},166)"><rect width="${w}" height="22" rx="11" fill="${t.chip}"/>` +
      `<text x="${w / 2}" y="15" text-anchor="middle" font-family="${MONO}" font-size="11" fill="${t.chipText}">${esc(tag)}</text></g>`;
    tagX += w + 8;
    return s;
  }).join('');
  const lines = c.lines.map((l, i) =>
    `<text x="24" y="${96 + i * 20}" font-family="${FONT}" font-size="13" fill="${t.muted}">${esc(l)}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.title)}">
<defs>
  <linearGradient id="a" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${t.accent}"/><stop offset="1" stop-color="${t.accent2}"/></linearGradient>
  <radialGradient id="g" cx="1" cy="0" r="1"><stop offset="0" stop-color="${t.accent}" stop-opacity=".18"/><stop offset=".6" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>
</defs>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="${t.card}" stroke="${t.cardBorder}"/>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="url(#g)"/>
<rect x="0" y="0" width="4" height="${H}" rx="2" fill="url(#a)"/>
<text x="24" y="34" font-family="${MONO}" font-size="11" letter-spacing="1.5" fill="${t.accent}">${esc(c.kicker)}</text>
<text x="24" y="62" font-family="${FONT}" font-size="22" font-weight="700" fill="${t.text}">${esc(c.title)}</text>
<text x="24" y="80" font-family="${FONT}" font-size="13" fill="${t.text}" opacity=".8">${esc(c.sub)}</text>
${lines}${tags}
<g transform="translate(${W - 48},22)">
  <circle r="3" fill="${t.accent}"><animate attributeName="opacity" values="1;.2;1" dur="2s" repeatCount="indefinite"/></circle>
  <circle r="8" fill="none" stroke="${t.accent}" stroke-opacity=".5"><animate attributeName="r" values="4;12" dur="2s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values=".6;0" dur="2s" repeatCount="indefinite"/></circle>
</g>
</svg>`;
}

mkdirSync(join(root, 'assets/cards'), { recursive: true });
for (const [name, t] of Object.entries(themes)) {
  writeFileSync(join(root, `assets/header-${name}.svg`), header(t));
  for (const c of CARDS) writeFileSync(join(root, `assets/cards/${c.id}-${name}.svg`), card(t, c));
}
console.log('svgs written');

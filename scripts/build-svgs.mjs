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
  let cx = 0;
  const chips = ['Tech Lead @ Helpsy', '.NET · Go', 'M.Sc. SE · University of Isfahan', 'Isfahan, IR']
    .map((l) => { const s = chip(t, cx, l); cx += Math.round(l.length * 7.2 + 22) + 10; return s; }).join('');

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
      'Multi-tenant platform for clinics, therapists and organizations',
      'Booking, online payments, psychology tests, ticketing and SMS notifications',
      'I lead the .NET backend, the frontend team and the delivery pipeline',
    ],
    tags: ['.NET', 'gRPC', 'RabbitMQ', 'PostgreSQL', 'Redis', 'Docker', 'Next.js'],
  },
  {
    id: 'kiosk', kicker: 'OWNER · PRODUCTION', title: 'Kiosk Management', sub: 'Self-service payment kiosks for a public-sector client',
    lines: [
      'Bank POS terminal and receipt-printer integration',
      'Offline-first kiosk agent: store-and-forward sync and fleet auto-update',
      'Dozens of kiosks · thousands of transactions a day · years in production',
    ],
    tags: ['.NET 8', 'Clean Architecture', 'CQRS', 'PostgreSQL', 'SQLite', 'Docker'],
  },
  {
    id: 'kiosell', kicker: 'OWNER · IN PROGRESS', title: 'KioSell', sub: 'Multi-tenant commerce & reservation SaaS',
    lines: [
      '.NET 10 modular monolith with a dedicated auth server and tenant data isolation',
      'Event-driven messaging with outbox/inbox · OpenTelemetry · container-based tests',
      'Go gRPC gateways · Next.js monorepo (shop, tenant admin, platform console)',
    ],
    tags: ['.NET 10', 'OpenIddict', 'Kafka', 'Go', 'OTel', 'Next.js'],
  },
  {
    id: 'iam', kicker: 'GO · PRODUCTION', title: 'Barnabus IAM', sub: 'Identity & access platform · barnabus.ai',
    lines: [
      'Go identity provider: single sign-on, MFA and OAuth2 / OIDC flows',
      'Multi-tenant, audited, instrumented with OpenTelemetry and Prometheus',
      'Signs users into the Barnabus healthcare product family',
    ],
    tags: ['Go', 'OAuth2 / OIDC', 'PostgreSQL', 'Redis', 'OTel'],
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


// ── Architecture diagram (Helpsy topology) ────────────────────────────────
function architecture(t) {
  const W = 1200, H = 560;
  const box = (x, y, w, h, title, sub, accent = false) =>
    `<g transform="translate(${x},${y})"><rect width="${w}" height="${h}" rx="10" fill="${t.card}" stroke="${accent ? t.accent : t.cardBorder}" stroke-opacity="${accent ? .7 : 1}"/>` +
    (accent ? `<rect width="${w}" height="${h}" rx="10" fill="${t.accent}" fill-opacity=".06"/>` : '') +
    `<text x="${w / 2}" y="${sub ? h / 2 - 3 : h / 2 + 5}" text-anchor="middle" font-family="${FONT}" font-size="13.5" font-weight="700" fill="${t.text}">${esc(title)}</text>` +
    (sub ? `<text x="${w / 2}" y="${h / 2 + 14}" text-anchor="middle" font-family="${MONO}" font-size="10.5" fill="${t.muted}">${esc(sub)}</text>` : '') + `</g>`;
  const clients = ['Web app', 'Admin panel', 'Mobile / kiosk', 'Partner API'];
  const services = ['Identity', 'Catalog', 'Booking', 'Billing', 'Notifications', 'Reporting'];
  const infra = [['PostgreSQL', 'one database per service'], ['Redis', 'cache · sessions · limits'], ['Message broker', 'transactional outbox'], ['Job scheduler', 'retries · reminders'], ['Observability', 'traces · metrics · logs'], ['CI/CD', 'containers · pipelines']];
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Reference architecture">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.bg0}"/><stop offset="1" stop-color="${t.bg1}"/></linearGradient>
<pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="${t.line}" stroke-width="1"/></pattern></defs>
<rect width="${W}" height="${H}" rx="16" fill="url(#bg)"/><rect width="${W}" height="${H}" rx="16" fill="url(#grid)"/>
<text x="32" y="36" font-family="${MONO}" font-size="12" letter-spacing="2" fill="${t.accent}">REFERENCE ARCHITECTURE · HOW I BUILD BACKENDS</text>
<text x="${W - 32}" y="36" text-anchor="end" font-family="${MONO}" font-size="11" fill="${t.muted}">gateway in front · services behind · outbox everywhere</text>`;
  const paths = [];
  // clients row
  const cw = 200, cy = 62, cgap = (W - 64 - clients.length * cw) / (clients.length - 1);
  clients.forEach((c, i) => { const x = 32 + i * (cw + cgap); s += box(x, cy, cw, 44, c); paths.push(`M${x + cw / 2},${cy + 44} C${x + cw / 2},${cy + 80} ${W / 2},${cy + 60} ${W / 2},${cy + 104}`); });
  // gateway
  const gw = 520, gx = (W - gw) / 2, gy = 166;
  s += box(gx, gy, gw, 56, 'API Gateway', 'authentication · rate limiting · routing · fail-closed', true);
  // services row
  const sw = 128, sy = 296, sgap = (W - 64 - services.length * sw) / (services.length - 1);
  services.forEach((svc, i) => { const x = 32 + i * (sw + sgap); s += box(x, sy, sw, 46, svc, 'gRPC · REST'); paths.push(`M${W / 2},${gy + 56} C${W / 2},${gy + 100} ${x + sw / 2},${sy - 40} ${x + sw / 2},${sy}`); });
  // infra row
  const iw = 172, iy = 430, igap = (W - 64 - infra.length * iw) / (infra.length - 1);
  infra.forEach(([n, sub], i) => { const x = 32 + i * (iw + igap); s += box(x, iy, iw, 52, n, sub); });
  // service → infra links (a representative fan-out)
  const link = (si, ii) => { const sx = 32 + si * (sw + sgap) + sw / 2, ix = 32 + ii * (iw + igap) + iw / 2; paths.push(`M${sx},${sy + 46} C${sx},${sy + 90} ${ix},${iy - 50} ${ix},${iy}`); };
  [[0, 0], [0, 1], [1, 0], [2, 0], [2, 2], [2, 3], [3, 0], [3, 2], [4, 2], [4, 3], [5, 0], [5, 4], [1, 4], [3, 4]].forEach(([a, b]) => link(a, b));
  paths.forEach((d, i) => {
    s += `<path id="ap${i}" d="${d}" fill="none" stroke="${t.edge}" stroke-width="1.2"/>`;
    const dur = (2.2 + (i * 0.41) % 2.4).toFixed(2), begin = ((i * 0.37) % 3).toFixed(2);
    s += `<circle r="2.4" fill="${t.accent}"><animateMotion dur="${dur}s" begin="${begin}s" repeatCount="indefinite"><mpath href="#ap${i}"/></animateMotion><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.85;1" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></circle>`;
  });
  s += `<text x="32" y="${H - 18}" font-family="${MONO}" font-size="10.5" fill="${t.muted}">the shape I reach for: requests enter through one gateway, services own their data, every cross-service side effect goes through the outbox</text></svg>`;
  return s;
}

mkdirSync(join(root, 'assets/cards'), { recursive: true });
for (const [name, t] of Object.entries(themes)) {
  writeFileSync(join(root, `assets/header-${name}.svg`), header(t));
  writeFileSync(join(root, `assets/reference-architecture-${name}.svg`), architecture(t));
  for (const c of CARDS) writeFileSync(join(root, `assets/cards/${c.id}-${name}.svg`), card(t, c));
}
console.log('svgs written');

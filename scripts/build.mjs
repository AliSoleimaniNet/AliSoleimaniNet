// Builds every static SVG piece of the profile and writes README.md from them.
// Each piece is its own file so it can carry its own link. Dynamic pieces (stats, repo cards,
// languages, snake, 3D graph) are produced in CI by scripts/dynamic.mjs onto the `output` branch.
// Run: node scripts/build.mjs
import { writeFileSync, mkdirSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  themes, esc, measure, fitText, svgOpen, pulseDot, sheen, cardFrame, tagRow, inlineIcon,
  FONT, MONO, SITE, GH, LINKEDIN, EMAIL, RAW, FEATURED_REPOS,
} from './lib/theme.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const A = join(root, 'assets');
const ICONS = join(A, 'icons');
const out = (rel, svg) => { const p = join(A, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, svg); };

/* ───────────────────────── content ───────────────────────── */

const PILLS = [
  { id: 'helpsy', label: 'Tech Lead & Architect @ Helpsy', href: 'https://helpsy.ir', glyph: 'briefcase' },
  { id: 'gymivo', label: 'Co-founder @ Gymivo', href: `${SITE}/#project-gymivo`, glyph: 'rocket' },
  { id: 'barnabus', label: 'Go IAM @ Barnabus', href: 'https://barnabus.ai', glyph: 'key' },
  { id: 'stack', label: 'System design · .NET · Go', href: `${SITE}/#architecture`, glyph: 'layers' },
  { id: 'msc', label: 'M.Sc. SE · University of Isfahan', href: LINKEDIN, glyph: 'cap' },
  { id: 'location', label: 'Isfahan, Iran · open to remote', href: `${SITE}/#contact`, glyph: 'pin' },
];

const BUTTONS = [
  { id: 'portfolio', label: 'Portfolio', hint: 'alisoleimaninet.github.io', href: SITE, primary: true, glyph: 'globe' },
  { id: 'linkedin', label: 'LinkedIn', hint: 'ali-soleimani-net', href: LINKEDIN, glyph: 'linkedin' },
  { id: 'email', label: 'Email', hint: EMAIL, href: `mailto:${EMAIL}`, glyph: 'mail' },
];

const SECTIONS = [
  { id: 'about', n: '01', title: 'About', sub: 'Tech lead, software architect, systems person', href: `${SITE}/#about`, hint: 'read more on the site' },
  { id: 'building', n: '02', title: 'What I am building', sub: 'Products I lead or own', href: `${SITE}/#projects`, hint: 'all projects' },
  { id: 'opensource', n: '03', title: 'Open source', sub: 'Live stars, forks and activity from the GitHub API', href: `${GH}?tab=repositories`, hint: 'all repositories' },
  { id: 'architecture', n: '04', title: 'System design', sub: 'The reference architecture I design towards, not any one product', href: `${SITE}/#architecture`, hint: 'interactive on the site' },
  { id: 'principles', n: '05', title: 'How I work', sub: 'Principles I keep coming back to', href: `${SITE}/#principles`, hint: 'on the site' },
  { id: 'experience', n: '06', title: 'Experience', sub: 'Where I have shipped', href: LINKEDIN, hint: 'full history on LinkedIn' },
  { id: 'stack', n: '07', title: 'Stack', sub: 'Every chip links to the tool', href: `${SITE}/#stack`, hint: 'on the site' },
  { id: 'activity', n: '08', title: 'Activity', sub: 'Regenerated every 6 hours, private work included', href: GH, hint: 'contribution graph' },
  { id: 'contact', n: '09', title: 'Let us talk', sub: 'Backend, platform and tech-lead roles, .NET and Go consulting', href: `${SITE}/#contact`, hint: 'contact page' },
];

const PROJECTS = [
  {
    id: 'helpsy', kicker: 'TECH LEAD & ARCHITECT · PRODUCTION', title: 'Helpsy', sub: 'Mental-health clinic & therapy platform', site: 'helpsy.ir',
    lines: ['Multi-tenant platform for clinics and therapists', 'Booking, payments, psychology tests, ticketing', 'I designed the architecture and lead the teams'],
    tags: ['.NET', 'gRPC', 'RabbitMQ', 'PostgreSQL', 'Redis', 'Next.js'],
  },
  {
    id: 'barnabus', kicker: 'GO · PRODUCTION', title: 'Barnabus IAM', sub: 'Identity & access platform', site: 'barnabus.ai',
    lines: ['Designed and built the Go identity provider', 'Single sign-on, MFA and OAuth2 / OIDC flows', 'Multi-tenant, audited, fully instrumented'],
    tags: ['Go', 'OAuth2 / OIDC', 'PostgreSQL', 'Redis', 'OTel'],
  },
  {
    id: 'gymivo', kicker: 'CO-FOUNDER · LAUNCHING SOON', title: 'Gymivo', sub: 'Fitness platform for athletes and coaches', site: 'gymivo.ir',
    lines: ['Find a coach, get a workout plan, track progress', 'Challenges, exercise library and coach chat', 'Co-founder, I designed and lead the .NET backend'],
    tags: ['.NET 10', 'Clean Arch', 'EF Core', 'PostgreSQL', 'Next.js'],
  },
  {
    id: 'kiosk', kicker: 'OWNER & ARCHITECT · PRODUCTION', title: 'Kiosk Management', sub: 'Self-service payment kiosks', site: 'varzesh.kish.ir',
    lines: ['Bank POS terminal and receipt-printer integration', 'Offline-first agent with store-and-forward sync', 'Dozens of kiosks, thousands of payments a day'],
    tags: ['.NET 8', 'Clean Arch', 'CQRS', 'PostgreSQL', 'SQLite'],
  },
  {
    id: 'kiosell', kicker: 'OWNER & ARCHITECT · LAUNCHING SOON', title: 'KioSell', sub: 'Multi-tenant commerce & reservation SaaS', site: 'kiosell.ir',
    lines: ['.NET 10 modular monolith with its own auth server', 'Event-driven outbox / inbox, OpenTelemetry', 'Go gRPC gateways and a Next.js monorepo'],
    tags: ['.NET 10', 'OpenIddict', 'Kafka', 'Go', 'Next.js'],
  },
];

const PRINCIPLES = [
  ['Boring infrastructure, interesting products', 'PostgreSQL, Redis and a broker cover most problems.', 'Novelty goes into the domain, not the plumbing.'],
  ['Outbox or it did not happen', 'Every cross-service side effect goes through a', 'transactional outbox with retries and a DLQ.'],
  ['Fail closed at the edge', 'The gateway authenticates, rate-limits and denies', 'by default. Services never trust the client.'],
  ['Measure before tuning', 'Traces and dashboards first. I only optimise', 'what a p99 proves is slow.'],
  ['Docs are part of the code', 'Decisions, runbooks and team commands live in', 'the repo, next to the code they describe.'],
  ['Offline is a feature', 'Kiosks and flaky networks taught me store-and-', 'forward, idempotency keys and reconciliation.'],
];

// Order is curated by hand (not sorted). Barnabus must never show "now".
const EXPERIENCE = [
  { id: 'helpsy', period: 'Aug 2024 — now', role: 'Tech Lead & Software Architect', org: 'Helpsy', href: 'https://helpsy.ir', note: 'Designed the architecture · lead backend and frontend teams · run the servers', current: true },
  { id: 'gymivo', period: 'Sep 2025 — now', role: 'Co-founder & Backend Lead', org: 'Gymivo', href: `${SITE}/#project-gymivo`, note: 'Fitness platform launching at gymivo.ir · ASP.NET Core 10 API', current: true },
  { id: 'ta-ase', period: 'Sep 2026 — now', role: 'Teaching Assistant · Advanced Software Engineering', org: 'University of Isfahan', href: LINKEDIN, note: 'Graduate (M.Sc.) course taught by Dr. Sharbaf', current: true },
  { id: 'barnabus', period: '2026', role: 'Go Engineer · Identity & Access', org: 'Barnabus', href: 'https://barnabus.ai', note: 'Designed and built SSO, MFA and OAuth2 / OIDC for a healthcare product family' },
  { id: 'msc', period: '2025 — now', role: 'M.Sc. Software Engineering', org: 'University of Isfahan', href: LINKEDIN, note: 'Graduate program in progress · TA for Advanced Software Engineering', edu: true, current: true },
  { id: 'kiosk', period: '2023 — now', role: 'Owner & Architect · Self-service kiosks', org: 'Kiosk Management', href: `${SITE}/#project-kiosk`, note: 'Designed and built end to end · in production behind varzesh.kish.ir, still maintained' },
  { id: 'ta', period: '2022 — 2023', role: 'Teaching Assistant · three undergraduate courses', org: 'University of Isfahan', href: LINKEDIN, note: 'Intro Programming · Data Structures & Algorithms · Social Networks, with Dr. Hosseini-Pozveh' },
  { id: 'bar1', period: 'Oct 2023 — Apr 2024', role: 'Full-Stack Developer', org: 'Bar1', href: 'https://bar1.ir', note: 'Internal panels of a freight-transport platform in .NET' },
  { id: 'bsc', period: '2020 — 2024', role: 'B.Sc. Computer Engineering', org: 'University of Isfahan', href: LINKEDIN, note: 'Undergraduate degree in computer engineering', edu: true },
  { id: 'oje', period: '2016 — 2019', role: 'Co-founder · where it started', org: 'OjeAmoozesh', href: 'https://ojeamoozesh.ir', note: 'Study-planning platform · as a teenager, company sites and my own hosting' },
];


// icon: file in assets/icons · mono: fallback monogram · url: where the chip links
const STACK = [
  ['Backend', [
    ['C#', 'csharp', 'https://learn.microsoft.com/dotnet/csharp/'], ['.NET', 'dot-net', 'https://dotnet.microsoft.com/'],
    ['ASP.NET Core', 'dotnetcore', 'https://learn.microsoft.com/aspnet/core/'], ['Go', 'go', 'https://go.dev/'],
    ['gRPC', 'grpc', 'https://grpc.io/'], ['EF Core', null, 'https://learn.microsoft.com/ef/core/', 'EF'],
    ['Dapper', null, 'https://github.com/DapperLib/Dapper', 'Dp'], ['MediatR / CQRS', null, 'https://github.com/jbogard/MediatR', 'CQ'],
    ['MassTransit', null, 'https://masstransit.io/', 'MT'], ['YARP', null, 'https://microsoft.github.io/reverse-proxy/', 'YP'],
    ['Hangfire', null, 'https://www.hangfire.io/', 'HF'], ['OpenIddict', null, 'https://documentation.openiddict.com/', 'OI'],
    ['Python', 'python', 'https://www.python.org/'],
  ]],
  ['Data & messaging', [
    ['PostgreSQL', 'postgresql', 'https://www.postgresql.org/'], ['SQL Server', 'microsoftsqlserver', 'https://www.microsoft.com/sql-server'],
    ['SQLite', 'sqlite', 'https://www.sqlite.org/'], ['Redis', 'redis', 'https://redis.io/'], ['RabbitMQ', 'rabbitmq', 'https://www.rabbitmq.com/'],
    ['Kafka', 'apachekafka', 'https://kafka.apache.org/'], ['MinIO', 'minio', 'https://min.io/'], ['Qdrant', 'qdrant', 'https://qdrant.tech/'],
  ]],
  ['Infra & observability', [
    ['Docker', 'docker', 'https://www.docker.com/'], ['Kubernetes', 'kubernetes', 'https://kubernetes.io/'], ['nginx', 'nginx', 'https://nginx.org/'],
    ['Linux', 'linux', 'https://kernel.org/'], ['GitLab CI', 'gitlab', 'https://docs.gitlab.com/ci/'], ['GitHub Actions', 'githubactions', 'https://github.com/features/actions'],
    ['Grafana', 'grafana', 'https://grafana.com/'], ['Prometheus', 'prometheus', 'https://prometheus.io/'], ['OpenTelemetry', 'opentelemetry', 'https://opentelemetry.io/'],
    ['Testcontainers', null, 'https://testcontainers.com/', 'TC'],
  ]],
  ['Frontend & tooling', [
    ['TypeScript', 'typescript', 'https://www.typescriptlang.org/'], ['Next.js', 'nextjs', 'https://nextjs.org/'], ['React', 'react', 'https://react.dev/'],
    ['Tailwind', 'tailwindcss', 'https://tailwindcss.com/'], ['Three.js', 'threejs', 'https://threejs.org/'], ['Git', 'git', 'https://git-scm.com/'],
    ['Ollama', 'ollama', 'https://ollama.com/'],
  ]],
];
// logos that are dark-on-transparent (invert on dark) or white (invert on light)
const INVERT = { dark: new Set(['apachekafka', 'threejs', 'github']), light: new Set(['ollama', 'grpc']) };

const CONTACT = [
  { id: 'email', title: 'Email', value: EMAIL, sub: 'Fastest way to reach me', href: `mailto:${EMAIL}`, glyph: 'mail' },
  { id: 'linkedin', title: 'LinkedIn', value: 'in/ali-soleimani-net', sub: 'Career, roles and background', href: LINKEDIN, glyph: 'linkedin' },
  { id: 'site', title: 'Portfolio', value: 'alisoleimaninet.github.io', sub: 'Interactive 3D site', href: SITE, glyph: 'globe' },
];

// Stats tiles and repo cards are rendered in CI (scripts/dynamic.mjs); listed here only for the README.
const TILES = [
  { id: 'contributions', href: GH, alt: 'Contributions in the last year' },
  { id: 'streak', href: GH, alt: 'Current and longest streak' },
  { id: 'prs', href: 'https://github.com/search?q=author%3AAliSoleimaniNet+is%3Apr&type=pullrequests', alt: 'Pull requests' },
];
const REPOS = FEATURED_REPOS.map((r) => r.name);

/* ───────────────────────── glyphs (stroke icons, 24-unit grid) ───────────────────────── */
const GLYPHS = {
  rocket: '<path d="M5 15c-1.5 1.3-2 4-2 6 2 0 4.7-.5 6-2"/><path d="M9 18 6 15c.7-3.8 3-8.6 9-11 2.3-.9 4.6-1 6-1 0 1.4-.1 3.7-1 6-2.4 6-7.2 8.3-11 9z"/><circle cx="15" cy="9" r="1.6"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 8.2-8.2M17 6l2 2M15 8l2 2"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  cap: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
  arrow: '<path d="M7 17 17 7M9 7h8v8"/>',
};
const glyph = (name, x, y, size, color, sw = 1.8) =>
  `<g transform="translate(${x},${y}) scale(${size / 24})" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${GLYPHS[name]}</g>`;

/* ───────────────────────── header ───────────────────────── */
const NODES = [[760, 62], [850, 140], [930, 52], [1010, 130], [1100, 72], [1150, 176], [1060, 214], [960, 200], [870, 222], [790, 176], [1140, 26], [700, 128]];
const EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 0], [1, 7], [3, 6], [2, 4], [4, 10], [0, 11], [9, 11], [1, 9], [3, 7]];
function edgePath([ax, ay], [bx, by], i) {
  const mx = (ax + bx) / 2, my = (ay + by) / 2, dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
  const bend = (i % 2 ? 1 : -1) * Math.min(28, len * 0.22);
  return `M${ax},${ay} Q${mx + (-dy / len) * bend},${my + (dx / len) * bend} ${bx},${by}`;
}
function mesh(t) {
  let s = '';
  EDGES.forEach(([a, b], i) => {
    const dur = (2.6 + ((i * 0.37) % 2.2)).toFixed(2), begin = ((i * 0.53) % 3).toFixed(2);
    s += `<path id="e${i}" d="${edgePath(NODES[a], NODES[b], i)}" fill="none" stroke="${t.edge}"/>` +
      `<circle r="2.2" fill="${t.accent}"><animateMotion dur="${dur}s" begin="${begin}s" repeatCount="indefinite"><mpath href="#e${i}"/></animateMotion>` +
      `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.9;1" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></circle>`;
  });
  NODES.forEach(([x, y], i) => {
    const d = (2.4 + (i % 4) * 0.5).toFixed(1), b = (i * 0.3).toFixed(1);
    s += `<circle cx="${x}" cy="${y}" r="9" fill="${t.accent}" opacity=".12"><animate attributeName="r" values="7;12;7" dur="${d}s" begin="${b}s" repeatCount="indefinite"/></circle>` +
      `<circle cx="${x}" cy="${y}" r="3.2" fill="${t.accent}"/>`;
  });
  return s;
}
const ROLES = ['Tech Lead & Software Architect', 'System Designer', 'Backend .NET & Go Engineer', 'Co-founder @ Gymivo'];
const TYPED = 'leading teams, designing scalable systems';
function header(t) {
  const roleDur = 3, total = ROLES.length * roleDur;
  const roles = ROLES.map((r, i) => {
    const kt = [0, 0.04, (roleDur - 0.3) / total, roleDur / total, 1].map((n) => n.toFixed(4)).join(';');
    // first role is visible without animation, so static renderers still show it
    return `<text opacity="${i === 0 ? 1 : 0}" font-family="${FONT}" font-size="26" font-weight="600" fill="${t.accent}">${esc(r)}` +
      `<animate attributeName="opacity" values="0;1;1;0;0" keyTimes="${kt}" dur="${total}s" begin="${i * roleDur}s" repeatCount="indefinite"/></text>`;
  }).join('');
  const typedW = Math.round(measure(TYPED, 16, { mono: true }) * 1.06 + 4);
  return `${svgOpen(1200, 250, `Ali Soleimani, ${ROLES[0]}`)}
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.bg0}"/><stop offset="1" stop-color="${t.bg1}"/></linearGradient>
  <linearGradient id="name" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${t.text}"/><stop offset=".55" stop-color="${t.accent}"/><stop offset="1" stop-color="${t.accent2}"/>
    <animate attributeName="x1" values="-1;1" dur="6s" repeatCount="indefinite"/><animate attributeName="x2" values="0;2" dur="6s" repeatCount="indefinite"/></linearGradient>
  <radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${t.accent}" stop-opacity=".22"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>
  <clipPath id="typeClip"><rect x="0" y="-18" width="${typedW}" height="26"><animate attributeName="width" values="0;0;${typedW};${typedW};0" keyTimes="0;.08;.55;.92;1" dur="9s" repeatCount="indefinite"/></rect></clipPath>
  <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="${t.line}"/></pattern>
</defs>
<rect width="1200" height="250" rx="16" fill="url(#bg)"/><rect width="1200" height="250" rx="16" fill="url(#grid)"/>
<rect x=".5" y=".5" width="1199" height="249" rx="16" fill="none" stroke="${t.cardBorder}"/>
<ellipse cx="960" cy="130" rx="330" ry="160" fill="url(#glow)"/>
<g>${mesh(t)}</g>
<g transform="translate(64,0)">
  <text x="0" y="66" font-family="${MONO}" font-size="15" fill="${t.muted}">// hi, I am</text>
  <text x="-2" y="132" font-family="${FONT}" font-size="66" font-weight="800" letter-spacing="-1.5" fill="url(#name)">Ali Soleimani</text>
  <g transform="translate(0,176)">${roles}</g>
  <g transform="translate(0,218)" font-family="${MONO}" font-size="16">
    <text x="0" y="0" fill="${t.muted}">›</text>
    <text x="16" y="0" fill="${t.text}" clip-path="url(#typeClip)">${esc(TYPED)}</text>
    <rect x="${16 + typedW}" y="-14" width="9" height="18" fill="${t.accent}">
      <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.5;.5;1" dur="1s" repeatCount="indefinite"/>
      <animate attributeName="x" values="16;16;${16 + typedW};${16 + typedW};16" keyTimes="0;.08;.55;.92;1" dur="9s" repeatCount="indefinite"/>
    </rect>
  </g>
</g>
<text x="1176" y="234" text-anchor="end" font-family="${MONO}" font-size="12" fill="${t.muted}">alisoleimaninet.github.io ↗</text>
</svg>`;
}

/* ───────────────────────── pills & buttons ───────────────────────── */
function pill(t, p) {
  const size = 14, tw = measure(p.label, size, { bold: true }), h = 38, w = Math.round(tw + 62);
  return `${svgOpen(w, h, p.label)}
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${h / 2}" fill="${t.card}" stroke="${t.chipBorder}"/>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${h / 2}" fill="${t.chip}"/>
${glyph(p.glyph, 14, 10, 18, t.accent)}
${fitText(p.label, { x: 40, y: 24, size, width: tw, weight: 600, fill: t.text })}
${glyph('arrow', w - 20, 14, 10, t.muted, 2.2)}
</svg>`;
}
function button(t, b) {
  const size = 16, sub = 11.5, tw = measure(b.label, size, { bold: true }), hw = measure(b.hint, sub, { mono: true });
  const h = 56, w = Math.round(Math.max(tw, hw) + 88);
  const fill = b.primary ? t.accent : t.card, txt = b.primary ? (t.name === 'dark' ? '#041014' : '#ffffff') : t.text;
  const hint = b.primary ? (t.name === 'dark' ? '#0b3a44' : '#e0f7fb') : t.muted;
  return `${svgOpen(w, h, `${b.label}: ${b.hint}`)}
<defs><clipPath id="c"><rect width="${w}" height="${h}" rx="14"/></clipPath></defs>
<g clip-path="url(#c)">
<rect width="${w}" height="${h}" fill="${fill}"/>
${b.primary ? '' : `<rect width="${w}" height="${h}" fill="${t.chip}"/>`}
${sheen('s', w, h, b.primary ? { accent: '#ffffff' } : t, b.primary ? 0 : 1.5)}
</g>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="14" fill="none" stroke="${b.primary ? 'none' : t.chipBorder}"/>
${glyph(b.glyph, 18, 16, 24, txt)}
${fitText(b.label, { x: 54, y: 26, size, width: tw, weight: 700, fill: txt })}
${fitText(b.hint, { x: 54, y: 43, size: sub, width: hw, fill: hint, family: MONO })}
${glyph('arrow', w - 26, 21, 12, txt, 2.2)}
</svg>`;
}

/* ───────────────────────── section banners ───────────────────────── */
function banner(t, s) {
  const W = 1200, H = 84;
  const tw = measure(s.title, 30, { bold: true });
  const hint = `${s.hint} ↗`, hw = measure(hint, 12.5, { mono: true });
  const lineX = 64 + tw + 20;
  return `${svgOpen(W, H, `${s.n} ${s.title}`)}
<defs><linearGradient id="l" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${t.accent}"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></linearGradient></defs>
<text x="0" y="40" font-family="${MONO}" font-size="14" font-weight="700" fill="${t.accent}">${s.n}</text>
<rect x="30" y="31" width="22" height="2" fill="${t.accent}" opacity=".6"/>
${fitText(s.title, { x: 64, y: 44, size: 30, width: tw, weight: 800, fill: t.text })}
<text x="64" y="72" font-family="${FONT}" font-size="15" fill="${t.muted}">${esc(s.sub)}</text>
<rect x="${lineX}" y="35" width="0" height="1.5" fill="url(#l)"><animate attributeName="width" values="0;${W - lineX - hw - 36}" dur="1.4s" fill="freeze"/></rect>
<rect x="${lineX}" y="35" width="${W - lineX - hw - 36}" height="1.5" fill="url(#l)" opacity=".35"/>
${fitText(hint, { x: W, y: 40, size: 12.5, width: hw, fill: t.muted, family: MONO, anchor: 'end' })}
</svg>`;
}

/* ───────────────────────── project cards ───────────────────────── */
function project(t, p) {
  const W = 600, H = 250;
  const lines = p.lines.map((l, i) =>
    `<circle cx="30" cy="${116 + i * 26}" r="2.5" fill="${t.accent}"/><text x="42" y="${121 + i * 26}" font-family="${FONT}" font-size="16" fill="${t.muted}">${esc(l)}</text>`).join('');
  const tags = tagRow(t, p.tags, 24, 202, { maxX: W - 24 });
  const siteW = measure(p.site, 12.5, { mono: true });
  return `${svgOpen(W, H, p.title)}
${cardFrame(t, W, H)}
<g clip-path="url(#clip)">${sheen('sh', W, H, t, PROJECTS.indexOf(p) * 1.7)}</g>
<text x="24" y="38" font-family="${MONO}" font-size="12" letter-spacing="1.5" fill="${t.accent}">${esc(p.kicker)}</text>
${pulseDot(t, W - 30, 33)}
<text x="24" y="72" font-family="${FONT}" font-size="28" font-weight="800" fill="${t.text}">${esc(p.title)}</text>
<text x="24" y="94" font-family="${FONT}" font-size="15" fill="${t.text}" opacity=".78">${esc(p.sub)}</text>
${fitText(p.site, { x: W - 24, y: 72, size: 12.5, width: siteW, fill: t.muted, family: MONO, anchor: 'end' })}
${lines}${tags.svg}
</svg>`;
}

/* ───────────────────────── principles ───────────────────────── */
function principle(t, [title, a, b], i) {
  const W = 600, H = 150;
  return `${svgOpen(W, H, title)}
${cardFrame(t, W, H, { rail: false })}
<text x="${W - 24}" y="64" text-anchor="end" font-family="${FONT}" font-size="64" font-weight="800" fill="${t.accent}" opacity=".10">${String(i + 1).padStart(2, '0')}</text>
<text x="26" y="48" font-family="${FONT}" font-size="21" font-weight="700" fill="${t.text}">${esc(title)}</text>
<rect x="26" y="62" width="36" height="2" rx="1" fill="${t.accent}"/>
<text x="26" y="96" font-family="${FONT}" font-size="16" fill="${t.muted}">${esc(a)}</text>
<text x="26" y="120" font-family="${FONT}" font-size="16" fill="${t.muted}">${esc(b)}</text>
</svg>`;
}

/* ───────────────────────── experience timeline rows ───────────────────────── */
function experience(t, e, i, n) {
  const W = 1200, H = 92;
  const first = i === 0, last = i === n - 1;
  const orgW = measure(e.org, 15, { bold: true });
  return `${svgOpen(W, H, `${e.role} at ${e.org}`)}
<rect x="23" y="${first ? 46 : 0}" width="2" height="${last ? 46 : H - (first ? 46 : 0)}" fill="${t.accent}" opacity=".35"/>
<circle cx="24" cy="46" r="${e.current ? 7 : 6}" fill="${t.bg0}" stroke="${e.edu ? t.accent2 : t.accent}" stroke-width="2.5"/>
${e.current ? `<circle cx="24" cy="46" r="7" fill="none" stroke="${e.edu ? t.accent2 : t.accent}"><animate attributeName="r" values="7;16" dur="2s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values=".7;0" dur="2s" repeatCount="indefinite"/></circle>` : ''}
<g transform="translate(56,6)">
  <rect x=".5" y=".5" width="${W - 57}" height="${H - 13}" rx="12" fill="${t.card}" stroke="${t.cardBorder}"/>
  <text x="22" y="34" font-family="${FONT}" font-size="19" font-weight="700" fill="${t.text}">${esc(e.role)}</text>
  <text x="22" y="60" font-family="${FONT}" font-size="15" fill="${t.muted}">${esc(e.note)}</text>
  <text x="${W - 80}" y="34" text-anchor="end" font-family="${MONO}" font-size="13" fill="${t.muted}">${esc(e.period)}</text>
  ${fitText(e.org, { x: W - 98, y: 60, size: 15, width: orgW, weight: 700, fill: e.edu ? t.accent2 : t.accent, anchor: 'end' })}
  ${glyph('arrow', W - 92, 49, 12, e.edu ? t.accent2 : t.accent, 2.2)}
</g>
</svg>`;
}

/* ───────────────────────── stack chips ───────────────────────── */
function stackChip(t, [label, icon, , mono]) {
  const size = 15, tw = measure(label, size, { bold: true }), h = 44, w = Math.round(tw + 64);
  const vis = icon
    ? inlineIcon(ICONS, icon, 12, 10, 24, { invert: INVERT[t.name].has(icon) })
    : `<rect x="12" y="10" width="24" height="24" rx="6" fill="${t.accent}" opacity=".9"/><text x="24" y="27" text-anchor="middle" font-family="${MONO}" font-size="11" font-weight="700" fill="${t.name === 'dark' ? '#041014' : '#ffffff'}">${esc(mono)}</text>`;
  return `${svgOpen(w, h, label)}
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="12" fill="${t.card}" stroke="${t.cardBorder}"/>
${vis}
${fitText(label, { x: 46, y: 27, size, width: tw, weight: 600, fill: t.text })}
</svg>`;
}
function stackLabel(t, label) {
  const up = label.toUpperCase(), tw = measure(up, 13, { mono: true }) + up.length * 1.6, W = Math.round(tw + 50), H = 44;
  return `${svgOpen(W, H, label)}
<rect x="0" y="21" width="16" height="2" fill="${t.accent}"/>
${fitText(up, { x: 26, y: 27, size: 13, width: tw, weight: 700, fill: t.accent, family: MONO })}
</svg>`;
}

/* ───────────────────────── contact cards ───────────────────────── */
function contact(t, c) {
  const W = 400, H = 132, vw = measure(c.value, 14, { mono: true }), maxVw = W - 48;
  return `${svgOpen(W, H, `${c.title}: ${c.value}`)}
${cardFrame(t, W, H, { rail: false })}
<rect x="22" y="22" width="44" height="44" rx="12" fill="${t.chip}" stroke="${t.chipBorder}"/>
${glyph(c.glyph, 32, 32, 24, t.accent)}
<text x="80" y="42" font-family="${FONT}" font-size="20" font-weight="700" fill="${t.text}">${esc(c.title)}</text>
<text x="80" y="62" font-family="${FONT}" font-size="13.5" fill="${t.muted}">${esc(c.sub)}</text>
${fitText(c.value, { x: 22, y: 106, size: 14, width: Math.min(vw, maxVw), fill: t.accent, family: MONO })}
${glyph('arrow', W - 36, 24, 14, t.muted, 2.2)}
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
<rect width="${W}" height="${H}" rx="16" fill="url(#bg)"/><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="${t.cardBorder}"/><rect width="${W}" height="${H}" rx="16" fill="url(#grid)"/>
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


/* ───────────────────────── write assets ───────────────────────── */
rmSync(join(A, 'cards'), { recursive: true, force: true });
for (const [name, t] of Object.entries(themes)) {
  out(`header-${name}.svg`, header(t));
  out(`reference-architecture-${name}.svg`, architecture(t));
  PILLS.forEach((p) => out(`pills/${p.id}-${name}.svg`, pill(t, p)));
  BUTTONS.forEach((b) => out(`buttons/${b.id}-${name}.svg`, button(t, b)));
  SECTIONS.forEach((s) => out(`sections/${s.id}-${name}.svg`, banner(t, s)));
  PROJECTS.forEach((p) => out(`projects/${p.id}-${name}.svg`, project(t, p)));
  PRINCIPLES.forEach((p, i) => out(`principles/${i + 1}-${name}.svg`, principle(t, p, i)));
  EXPERIENCE.forEach((e, i) => out(`experience/${e.id}-${name}.svg`, experience(t, e, i, EXPERIENCE.length)));
  STACK.forEach(([group, items]) => {
    const gid = group.toLowerCase().replace(/[^a-z]+/g, '-');
    out(`stack/_${gid}-${name}.svg`, stackLabel(t, group));
    items.forEach((it) => out(`stack/${it[0].toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${name}.svg`, stackChip(t, it)));
  });
  CONTACT.forEach((c) => out(`contact/${c.id}-${name}.svg`, contact(t, c)));
}

/* ───────────────────────── README ───────────────────────── */
const pic = (base, alt, attrs = '') =>
  `<picture><source media="(prefers-color-scheme: dark)" srcset="${base}-dark.svg"><source media="(prefers-color-scheme: light)" srcset="${base}-light.svg"><img src="${base}-dark.svg" alt="${esc(alt)}" ${attrs}></picture>`;
const link = (href, inner) => `<a href="${href}">${inner}</a>`;
const section = (id) => { const s = SECTIONS.find((x) => x.id === id); return `\n<br>\n\n${link(s.href, pic(`assets/sections/${s.id}`, `${s.n} ${s.title}`, 'width="100%"'))}\n`; };
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const readmePath = join(root, 'README.md');
const prev = existsSync(readmePath) ? readFileSync(readmePath, 'utf8') : '';
const actMatch = /<!--START_SECTION:activity-->[\s\S]*?<!--END_SECTION:activity-->/.exec(prev);
const activity = actMatch ? actMatch[0] : '<!--START_SECTION:activity-->\n<!--END_SECTION:activity-->';

const md = `${link(SITE, pic('assets/header', 'Ali Soleimani — Tech Lead & Software Architect', 'width="100%"'))}

<p align="center">
${PILLS.map((p) => link(p.href, pic(`assets/pills/${p.id}`, p.label, 'height="38"'))).join('\n')}
</p>

<p align="center">
${BUTTONS.map((b) => link(b.href, pic(`assets/buttons/${b.id}`, `${b.label}: ${b.hint}`, 'height="56"'))).join('\n')}
</p>
${section('about')}
I am tech lead and software architect at **[Helpsy](https://helpsy.ir)**, a mental-health clinic platform: I designed its system architecture, lead the backend and frontend teams, and run the servers and delivery pipeline behind it. I am co-founder of **[Gymivo](${SITE}/#project-gymivo)**, a fitness platform launching soon, where I lead the backend. I also write **Go**, and designed and built the identity and access platform behind **[Barnabus](https://barnabus.ai)**. Before that I designed, built and still operate a self-service payment kiosk network that handles thousands of payments a day. It all started when I was a teenager, building websites for companies and online stores and hosting them myself.

I like the hard parts: distributed systems, identity, payments and the infrastructure that keeps them honest. I am a graduate student in Software Engineering at the University of Isfahan, and I care about clean architecture, developer tooling and documentation people actually read.
${section('building')}
<p align="center">
${PROJECTS.map((p) => link(`${SITE}/#project-${p.id}`, pic(`assets/projects/${p.id}`, p.title, 'width="49%"'))).join('\n')}
</p>
${section('opensource')}
<p align="center">
${REPOS.map((r) => link(`${GH}/${r}`, pic(`${RAW}/repos/${r}`, r, 'width="49%"'))).join('\n')}
</p>
${section('architecture')}
${link(`${SITE}/#architecture`, pic('assets/reference-architecture', 'Reference architecture: clients, API gateway, independent services, data and platform layer', 'width="100%"'))}
${section('principles')}
<p align="center">
${PRINCIPLES.map((p, i) => link(`${SITE}/#principles`, pic(`assets/principles/${i + 1}`, p[0], 'width="49%"'))).join('\n')}
</p>
${section('experience')}
${EXPERIENCE.map((e) => link(e.href, pic(`assets/experience/${e.id}`, `${e.role} — ${e.org} (${e.period})`, 'width="100%"'))).join('\n')}
${section('stack')}
${STACK.map(([group, items]) => `<p>
${link(`${SITE}/#stack`, pic(`assets/stack/_${slug(group)}`, group, 'height="44"'))}
${items.map((it) => link(it[2], pic(`assets/stack/${slug(it[0])}`, it[0], 'height="44"'))).join('\n')}
</p>`).join('\n')}
${section('activity')}
<p align="center">
${TILES.map((x) => link(x.href, pic(`${RAW}/stats/${x.id}`, x.alt, 'width="32.5%"'))).join('\n')}
</p>

<p align="center">
${link(`${GH}?tab=repositories`, pic(`${RAW}/metrics/languages`, 'Most used languages', 'width="49%"'))}
${link(`${GH}?tab=repositories`, pic(`${RAW}/stats/overview`, 'Repositories, stars and followers', 'width="49%"'))}
</p>

${link(GH, `<picture><source media="(prefers-color-scheme: dark)" srcset="${RAW}/3d/profile-night-green.svg"><source media="(prefers-color-scheme: light)" srcset="${RAW}/3d/profile-green-animate.svg"><img src="${RAW}/3d/profile-night-green.svg" alt="3D contribution graph (language donut covers public repositories only)" width="100%"></picture>`)}
<p align="center"><sub>The 3D graph and its language donut only see public repositories. The languages card above includes private work.</sub></p>

${link(GH, `<picture><source media="(prefers-color-scheme: dark)" srcset="${RAW}/snake/snake-dark.svg"><source media="(prefers-color-scheme: light)" srcset="${RAW}/snake/snake-light.svg"><img src="${RAW}/snake/snake-dark.svg" alt="Contribution snake" width="100%"></picture>`)}

#### Latest
${activity}
${section('contact')}
<p align="center">
${CONTACT.map((c) => link(c.href, pic(`assets/contact/${c.id}`, `${c.title}: ${c.value}`, 'width="32.5%"'))).join('\n')}
</p>

<p align="center">
  <img alt="Profile views" src="https://komarev.com/ghpvc/?username=AliSoleimaniNet&color=22d3ee&style=flat-square&label=profile+views">
  <br>
  <sub>Every card on this page is a link. Stats, repository cards and the activity list are regenerated every 6 hours by <a href=".github/workflows">GitHub Actions</a>.</sub>
</p>
`;
writeFileSync(readmePath, md);
console.log('assets and README written');

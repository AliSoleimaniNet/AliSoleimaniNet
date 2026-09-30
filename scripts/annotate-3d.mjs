// The 3D contribution graph's language donut only sees public repositories, while the languages
// card includes private work. This stamps a "public repositories only" note under the donut legend.
// Usage: node scripts/annotate-3d.mjs dist/3d
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] || 'dist/3d';
const NOTE = 'languages: public repositories only';

for (const f of readdirSync(dir).filter((x) => x.endsWith('.svg'))) {
  const p = join(dir, f);
  let s = readFileSync(p, 'utf8');
  if (s.includes(NOTE)) continue;
  // legend = two nested translate groups followed by `x="26" y="…"` labels; take the last label's position
  const legend = /<g transform="translate\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\)">\s*<g transform="translate\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\)">/g;
  let x = 40, y = 780, m, found = false;
  while ((m = legend.exec(s))) {
    const tail = s.slice(m.index, m.index + 20000);
    const ys = [...tail.matchAll(/<text dominant-baseline="middle" x="26" y="([\d.]+)"/g)].map((r) => Number(r[1]));
    if (ys.length >= 2) {
      x = Number(m[1]) + Number(m[3]) + 26;
      y = Number(m[2]) + Number(m[4]) + Math.max(...ys) + 36;
      found = true;
    }
  }
  const text = `<text x="${x}" y="${y}" font-size="15" font-style="italic" class="fill-weak" style="font-size:15px">${NOTE}</text>`;
  s = s.replace(/<\/svg>\s*$/, `${text}</svg>`);
  writeFileSync(p, s);
  console.log(`${f}: note at (${x}, ${y})${found ? '' : ' [fallback position]'}`);
}

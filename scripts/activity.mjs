// Rewrites the "Latest" block of README.md from my public GitHub events, plus a private-work summary.
// Every line links to the repo, commit, PR or release it describes.
// Usage: GITHUB_TOKEN=... node scripts/activity.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const USER = 'AliSoleimaniNet';
const MAX = 8;
const HIDE = new Set([`${USER}/${USER}`]);
const token = process.env.GITHUB_TOKEN;
const readme = join(dirname(fileURLToPath(import.meta.url)), '..', 'README.md');
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'profile-activity', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

const events = await (await fetch(`https://api.github.com/users/${USER}/events/public?per_page=100`, { headers })).json();
const day = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Tehran' });
const repoLink = (name) => `[${name.split('/')[1] === USER ? name : name.replace(`${USER}/`, '')}](https://github.com/${name})`;

const lines = [];
const pushSeen = new Map(); // repo|day -> line index, to merge pushes on the same day
for (const e of Array.isArray(events) ? events : []) {
  const repo = e.repo?.name;
  if (!repo || HIDE.has(repo)) continue;
  const d = day(e.created_at), p = e.payload || {};
  if (e.type === 'PushEvent') {
    const n = p.size ?? p.commits?.length ?? 1;
    const key = `${repo}|${d}`;
    if (pushSeen.has(key)) { const L = lines[pushSeen.get(key)]; L.count += n; continue; }
    const msg = (p.commits?.at(-1)?.message ?? '').split('\n')[0].slice(0, 70);
    const sha = p.commits?.at(-1)?.sha ?? p.head;
    pushSeen.set(key, lines.length);
    lines.push({ kind: 'push', d, repo, count: n, msg, sha });
  } else if (e.type === 'CreateEvent' && p.ref_type === 'repository') {
    lines.push({ kind: 'text', d, text: `🆕 Created ${repoLink(repo)}` });
  } else if (e.type === 'ReleaseEvent' && p.action === 'published') {
    lines.push({ kind: 'text', d, text: `🏷️ Released [${p.release.tag_name}](${p.release.html_url}) of ${repoLink(repo)}` });
  } else if (e.type === 'PullRequestEvent' && ['opened', 'closed'].includes(p.action)) {
    const pr = p.pull_request, verb = p.action === 'closed' ? (pr.merged ? 'Merged' : 'Closed') : 'Opened';
    lines.push({ kind: 'text', d, text: `🔀 ${verb} PR [#${pr.number} ${pr.title.slice(0, 60)}](${pr.html_url}) in ${repoLink(repo)}` });
  } else if (e.type === 'IssuesEvent' && p.action === 'opened') {
    lines.push({ kind: 'text', d, text: `🐞 Opened issue [#${p.issue.number} ${p.issue.title.slice(0, 60)}](${p.issue.html_url}) in ${repoLink(repo)}` });
  } else if (e.type === 'WatchEvent') {
    lines.push({ kind: 'text', d, text: `⭐ Starred ${repoLink(repo)}` });
  } else if (e.type === 'ForkEvent') {
    lines.push({ kind: 'text', d, text: `🍴 Forked ${repoLink(repo)}` });
  }
  if (lines.length >= MAX) break;
}

// The events API no longer ships commit messages: look up the head commit of each push.
for (const l of lines) {
  if (l.kind !== 'push' || l.msg || !l.sha) continue;
  try {
    const c = await (await fetch(`https://api.github.com/repos/${l.repo}/commits/${l.sha}`, { headers })).json();
    l.msg = (c.commit?.message ?? '').split(/\r?\n/)[0].slice(0, 70);
  } catch { /* keep the line without a message */ }
}

const render = (l) => {
  if (l.kind === 'push') {
    const what = `${l.count} commit${l.count === 1 ? '' : 's'}`;
    const commit = l.sha ? `[${what}](https://github.com/${l.repo}/commit/${l.sha})` : what;
    return `⬆️ Pushed ${commit} to ${repoLink(l.repo)}${l.msg ? ` · <sub>${l.msg.replace(/[<>|]/g, '')}</sub>` : ''}`;
  }
  return l.text;
};

// private work summary (last 30 days), counted by GitHub but not listed publicly
let privateLine = '';
if (token) {
  const to = new Date(), from = new Date(Date.now() - 30 * 86400e3);
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST', headers,
    body: JSON.stringify({ query: `query($l:String!,$f:DateTime!,$t:DateTime!){user(login:$l){contributionsCollection(from:$f,to:$t){restrictedContributionsCount
      commitContributionsByRepository(maxRepositories:100){repository{isPrivate} contributions{totalCount}}
      pullRequestContributionsByRepository(maxRepositories:100){repository{isPrivate} contributions{totalCount}}}}}`, variables: { l: USER, f: from.toISOString(), t: to.toISOString() } }),
  });
  const c = (await r.json())?.data?.user?.contributionsCollection;
  const n = c ? c.restrictedContributionsCount + [...c.commitContributionsByRepository, ...c.pullRequestContributionsByRepository]
    .filter((x) => x.repository.isPrivate).reduce((a, x) => a + x.contributions.totalCount, 0) : 0;
  if (n) privateLine = `- 🔒 **${n} contributions to private repositories** in the last 30 days · [contribution graph](https://github.com/${USER})`;
}

const table = [
  ...(privateLine ? [privateLine] : []),
  ...lines.slice(0, MAX).map((l) => `- \`${l.d}\` ${render(l)}`),
].join(String.fromCharCode(10));
const block = `<!--START_SECTION:activity-->\n${lines.length || privateLine ? table : '_Quiet week on public repos._'}\n<!--END_SECTION:activity-->`;

const md = readFileSync(readme, 'utf8');
const next = md.replace(/<!--START_SECTION:activity-->[\s\S]*?<!--END_SECTION:activity-->/, block);
if (next !== md) { writeFileSync(readme, next); console.log('README activity updated'); } else console.log('no change');

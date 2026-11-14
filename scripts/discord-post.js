// Posts CAGR Club content to Discord through webhooks. No dependencies.
// Usage: node scripts/discord-post.js daily|weekly
// Secrets (set in GitHub → Settings → Secrets and variables → Actions):
//   DISCORD_WEBHOOK_DAILY   webhook for #daily-set
//   DISCORD_WEBHOOK_LESSONS webhook for #lesson-notes (optional; falls back to DAILY)
const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'assets', 'content.js'), 'utf8'), ctx);
const { QS, LESSONS, MODULES, GLOSS } = ctx;
const SITE = 'https://cagrclub.com';
const DAY = Math.floor(Date.now() / 864e5), BASE = Math.floor(Date.UTC(2026, 10, 14) / 864e5);
// Same selection as the website's daily set.
let t = [(DAY * 7) % QS.length, (DAY * 7 + 13) % QS.length, (DAY * 7 + 29) % QS.length];
if (t[1] === t[0]) t[1] = (t[1] + 1) % QS.length;
if (t[2] === t[0] || t[2] === t[1]) t[2] = (t[2] + 2) % QS.length;
const strip = s => String(s).replace(/<[^>]+>/g, '');
const fmt = q => q.type === 'mcq' ? q.o[q.a] : (q.unit === '₹ cr' ? '₹' + q.a.toLocaleString('en-IN') + ' crore' : q.a.toLocaleString('en-IN') + (q.unit ? (q.unit === '%' || q.unit === '×' ? q.unit : ' ' + q.unit) : ''));

async function post(url, body) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) { console.error('Discord returned', r.status, await r.text()); process.exit(1); }
}

async function daily() {
  const url = process.env.DISCORD_WEBHOOK_DAILY;
  if (!url) { console.log('DISCORD_WEBHOOK_DAILY not set; skipping.'); return; }
  const no = Math.max(1, DAY - BASE + 1), q = QS[t[0]];
  const opts = q.type === 'mcq' ? '\n\n' + q.o.map((o, i) => '**' + 'ABCD'[i] + '.** ' + o).join('\n') : '';
  const term = GLOSS[DAY % GLOSS.length];
  await post(url, {
    username: 'CAGR Club',
    content: '**Answer:** ||' + fmt(q) + '||\n**Working:** ||' + q.s + '||',
    embeds: [{
      title: 'Daily #' + no + ' · ' + q.t + ' · ' + q.d,
      description: q.q + opts + '\n\nReply with your answer before you open the spoiler. Two more questions are on the site.',
      color: 0x5A38FF,
      fields: [{ name: 'Term of the day: ' + term[0], value: term[1] }],
      url: SITE + '/#daily',
      footer: { text: 'cagrclub.com · Education only, not investment advice' }
    }]
  });
  console.log('Posted daily #' + no);
}

async function weekly() {
  const url = process.env.DISCORD_WEBHOOK_LESSONS || process.env.DISCORD_WEBHOOK_DAILY;
  if (!url) { console.log('No lessons webhook set; skipping.'); return; }
  const wk = Math.floor((DAY - BASE) / 7), n = (wk % LESSONS.length) + 1, L = LESSONS[n - 1];
  const mi = MODULES.findIndex(m => m.l.includes(n));
  await post(url, {
    username: 'CAGR Club',
    embeds: [{
      title: 'Lesson of the week: ' + L.t,
      description: '**' + strip(L.key) + '**\n\n' + L.secs.map(s => '**' + s[0] + '.** ' + strip(s[1])).join('\n\n').slice(0, 3200) + '\n\n**Check yourself:** ' + L.cq + '\n||' + L.ca + '||',
      color: 0xFF5FA8,
      url: SITE + '/#lesson-' + n,
      footer: { text: 'Module ' + (mi + 1) + ': ' + MODULES[mi].t + ' · Lesson ' + n + ' of ' + LESSONS.length }
    }]
  });
  console.log('Posted weekly lesson ' + n);
}

({ daily, weekly })[process.argv[2] || 'daily']().catch(e => { console.error(e); process.exit(1); });

// Sunday Wrap: a weekly email built from the week's BSE filings (Mon-Fri) and the week's lesson,
// sent to everyone on the list with a one-click unsubscribe. No dependencies.
// Usage: node scripts/sunday-wrap.js [--preview]
// Secrets: BREVO_API_KEY (free, 300 emails a day) or RESEND_API_KEY, plus ADMIN_KEY (same value as the Worker secret), optional MAIL_FROM.
// Without an email key, or with --preview, it only writes wrap-preview.html.
const fs = require('fs'), vm = require('vm'), path = require('path'), crypto = require('crypto');
const { RULES, classify, fetchDay, pdf, clip } = require('./desk-radar.js');
const SITE = 'https://cagrclub.com', DISCORD = 'https://discord.gg/qUfEwkCe';
const ctx = {}; vm.createContext(ctx);
for (const f of ['content.js', 'glossary.js', 'lessons.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'assets', f), 'utf8'), ctx);
const { LESSONS } = ctx;
const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strip = s => String(s).replace(/<[^>]+>/g, '');
const pad = n => String(n).padStart(2, '0');
const ymd = d => d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate());
const token = (email, key) => crypto.createHmac('sha256', key).update(email).digest('hex').slice(0, 32);

// The five weekdays before today (IST).
function weekDays() {
  const now = new Date(Date.now() + 5.5 * 36e5), out = [];
  for (let i = 1; i <= 7 && out.length < 5; i++) { const d = new Date(now - i * 864e5); const w = d.getUTCDay(); if (w > 0 && w < 6) out.unshift(d); }
  return out;
}

async function build() {
  const days = weekDays(), groups = {}, seen = new Set(); let total = 0;
  for (const d of days) {
    let rows = [];
    try { rows = await fetchDay(ymd(d)); } catch (e) { console.log('Skipped', ymd(d), e.message); }
    total += rows.length;
    for (const a of rows) {
      const k = classify(a); if (!k) continue;
      const key = a.SCRIP_CD + '|' + k + '|' + (a.HEADLINE || '').slice(0, 60); if (seen.has(key)) continue; seen.add(key);
      (groups[k] = groups[k] || []).push(a);
    }
  }
  const flagged = Object.values(groups).reduce((s, g) => s + g.length, 0);
  const red = (groups.redflag || []).length;
  const range = days[0].getUTCDate() + '–' + days[days.length - 1].toUTCString().slice(5, 16);
  const DAY = Math.floor(Date.now() / 864e5), BASE = Math.floor(Date.UTC(2026, 10, 14) / 864e5);
  const n = (Math.floor((DAY - BASE) / 7) % LESSONS.length) + 1, L = LESSONS[n - 1];

  const H = (t) => `<h2 style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#4a6b5c;margin:32px 0 8px">${t}</h2>`;
  let body = '';
  body += `<p style="font-size:22px;font-weight:600;line-height:1.3;margin:0 0 8px">${total.toLocaleString('en-IN')} filings. ${flagged} worth a second look.</p>`;
  body += `<p style="color:#444;margin:0">Listed companies told BSE ${total.toLocaleString('en-IN')} things between ${esc(range)}. Most were routine. These were not.</p>`;
  body += H('The number that mattered');
  body += `<p style="margin:0"><b style="font-size:28px">${red}</b> red-flag filings: auditor, CFO or independent-director exits, defaults, insolvency and regulator action. ${red ? 'Each is linked below. Read the letter, not the headline.' : 'A quiet week, which is rarer than it sounds.'}</p>`;
  for (const r of RULES) {
    const g = groups[r.k]; if (!g || !g.length) continue;
    body += H(esc(r.name) + ' · ' + g.length);
    body += '<ul style="padding-left:18px;margin:0">' + g.slice(0, 5).map(a => `<li style="margin:0 0 8px"><b>${esc(clip(a.SLONGNAME, 48))}</b>: ${esc(clip(a.HEADLINE || a.NEWSSUB, 150))} <a href="${pdf(a)}" style="color:#0f6b4a">filing</a></li>`).join('') + '</ul>';
    if (g.length > 5) body += `<p style="color:#666;font-size:14px;margin:0">${g.length - 5} more in <a href="${DISCORD}" style="color:#0f6b4a">#desk-radar</a>.</p>`;
    body += `<p style="color:#555;font-size:14px;margin:6px 0 0"><i>${esc(r.why)}</i></p>`;
  }
  body += H('This week’s lesson');
  body += `<p style="margin:0 0 6px"><b>${esc(L.t)}</b></p><p style="margin:0 0 10px;color:#333">${esc(strip(L.key))}</p><p style="margin:0"><a href="${SITE}/#lesson-${n}" style="color:#0f6b4a;font-weight:600">Read the lesson</a></p>`;
  body += H('Your turn');
  body += `<p style="margin:0">${esc(L.cq)} Post your answer in <a href="${DISCORD}" style="color:#0f6b4a">the club Discord</a>.</p>`;

  const subject = 'Sunday Wrap: ' + flagged + ' filings worth a second look' + (red ? ', ' + red + ' red flags' : '');
  const wrap = (unsub) => `<!doctype html><html><body style="margin:0;background:#f4f7f5"><div style="font:16px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#111;max-width:600px;margin:0 auto;padding:28px 20px;background:#fff">
<p style="font-weight:700;margin:0 0 24px;color:#0f3d2e">CAGR Club · Sunday Wrap</p>${body}
<p style="color:#777;font-size:13px;margin-top:40px;border-top:1px solid #e3e9e5;padding-top:16px">Built from public BSE disclosures. Education, not investment advice. You get this because you joined at cagrclub.com. <a href="${unsub}" style="color:#777">Unsubscribe</a>.</p></div></body></html>`;
  return { subject, wrap, total, flagged };
}

async function subscribers(key) {
  const r = await fetch(SITE + '/api/subscribers?key=' + encodeURIComponent(key));
  if (!r.ok) throw new Error('Subscriber export returned ' + r.status);
  return (await r.text()).split('\n').slice(1).map(l => (l.match(/^"([^"]+)"/) || [])[1]).filter(Boolean);
}

async function main() {
  const w = await build();
  console.log('Filings:', w.total, '· flagged:', w.flagged, '·', w.subject);
  const key = process.env.ADMIN_KEY, brevo = process.env.BREVO_API_KEY, api = brevo || process.env.RESEND_API_KEY;
  if (process.argv.includes('--preview') || !api || !key) {
    fs.writeFileSync('wrap-preview.html', w.wrap('#'));
    console.log('Preview written to wrap-preview.html' + (!api || !key ? ' (no email key or ADMIN_KEY set, nothing sent)' : ''));
    return;
  }
  const list = await subscribers(key);
  console.log('Sending to', list.length, 'subscribers');
  const from = process.env.MAIL_FROM || 'CAGR Club <club@cagrclub.com>';
  if (brevo && list.length > 290) console.warn('Brevo free plan sends 300 a day. Only the first 290 will get this week\'s wrap; upgrade or split the send.');
  const m = from.match(/^(.*?)\s*<(.+)>$/) || [null, 'CAGR Club', from];
  let sent = 0;
  for (const e of (brevo ? list.slice(0, 290) : list)) {
    const u = SITE + '/api/unsubscribe?e=' + encodeURIComponent(e) + '&t=' + token(e, key);
    const headers = { 'List-Unsubscribe': '<' + u + '>', 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' };
    const r = brevo
      ? await fetch('https://api.brevo.com/v3/smtp/email', { method: 'POST', headers: { 'api-key': brevo, 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ sender: { name: m[1] || 'CAGR Club', email: m[2] }, to: [{ email: e }], subject: w.subject, htmlContent: w.wrap(u), headers }) })
      : await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: 'Bearer ' + api, 'content-type': 'application/json' }, body: JSON.stringify({ from, to: [e], subject: w.subject, html: w.wrap(u), headers }) });
    if (!r.ok) console.error('Send failed for one address:', r.status, (await r.text()).slice(0, 200)); else sent++;
    await new Promise(r => setTimeout(r, 250));
  }
  console.log('Sent', sent, 'of', list.length);
}
main().catch(e => { console.error(e); process.exit(1); });

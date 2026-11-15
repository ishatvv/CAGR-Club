// Desk Radar: every evening, reads the day's BSE corporate filings and posts the ones most people never read:
// auditor and CFO exits, rating actions, insolvency updates, fund-use deviations, open offers, preferential issues,
// large orders and acquisitions. Public filings only, linked to the source PDF. No recommendations.
// Usage: node scripts/desk-radar.js [YYYYMMDD]   Secret: DISCORD_WEBHOOK_RADAR
const DAYMS = 864e5;
const ist = new Date(Date.now() + 5.5 * 36e5);
const pad = n => String(n).padStart(2, '0');
const DATE = process.argv[2] || (ist.getUTCFullYear() + pad(ist.getUTCMonth() + 1) + pad(ist.getUTCDate()));
const H = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', 'Accept': 'application/json, text/plain, */*', 'Referer': 'https://www.bseindia.com/', 'Origin': 'https://www.bseindia.com' };

// What we look for, in order of how much an analyst should care. Matched on BSE sub-category, then on headline text.
const RULES = [
  { k: 'redflag', name: 'Red flags', icon: '🚩', why: 'Auditors, CFOs and independent directors rarely leave a healthy company mid-year. Read the resignation letter: the reason is often in the second paragraph.',
    sub: /Resignation of Statutory Auditors|Resignation of Chief Financial Officer|Resignation of Independent Director|Corporate Insolvency|CIRP|Default|Forensic|Fraud/i,
    head: /auditor.{0,40}resign|resign.{0,40}auditor|forensic audit|default in (re)?payment|SEBI order|show cause|insolvency|fraud/i },
  { k: 'rating', name: 'Credit ratings', icon: '📉', why: 'Rating agencies see the debt side first. A downgrade or a "watch with negative implications" often comes before trouble shows in profits.',
    sub: /Credit Rating/i, head: /downgrad|rating watch|negative|withdraw|upgrad/i },
  { k: 'control', name: 'Control and capital', icon: '🏛️', why: 'Open offers, preferential issues and schemes change who owns the company and on what terms. Check the issue price against the market price.',
    sub: /Open Offer|Preferential Issue|Qualified Institutional|Buy ?back|Delisting|Scheme of Arrangement|Rights Issue/i, head: /open offer|preferential|QIP|buy-?back|delist/i },
  { k: 'deals', name: 'Orders and acquisitions', icon: '📦', why: 'Compare the order or deal size with last year\'s revenue. A ₹500 crore order means little to a large company and everything to a small one.',
    sub: /Award of Order|Receipt of Order|Acquisition|Diversification|Disinvestment|Joint Venture/i, head: null },
  { k: 'mgmt', name: 'Management changes', icon: '🔁', why: 'Watch for clusters: several senior exits in a short period at one company says more than any single one.',
    sub: /Resignation of Director|Resignation of Company Secretary|Cessation|Change in Management/i, head: /resign|cessation/i }
];

async function page(p, d = DATE) {
  const u = 'https://api.bseindia.com/BseIndiaAPI/api/AnnSubCategoryGetData/w?pageno=' + p + '&strCat=-1&strPrevDate=' + d + '&strScrip=&strSearch=P&strToDate=' + d + '&strType=C&subcategory=-1';
  const r = await fetch(u, { headers: H });
  if (!r.ok) { if (p === 1) throw new Error('BSE returned ' + r.status); return null; }
  const j = await r.json();
  return j.Table || [];
}

function classify(a) {
  const sub = a.SUBCATNAME || '', head = (a.HEADLINE || '') + ' ' + (a.NEWSSUB || '');
  for (const r of RULES) {
    const hit = r.sub.test(sub) || (r.head && r.head.test(head));
    if (!hit) continue;
    if (r.k === 'mgmt' && !r.head.test(head + ' ' + sub)) continue;      // exits only, not appointments
    if (r.k === 'rating' && !(r.head.test(head) && (/rating/i.test(head) || r.sub.test(sub)))) continue; // rating actions only, not "reaffirmed"
    return r.k;
  }
  return null;
}

const clip = (s, n) => (s = String(s || '').replace(/\s+/g, ' ').trim()).length > n ? s.slice(0, n - 1) + '…' : s;
const pdf = a => a.ATTACHMENTNAME ? 'https://www.bseindia.com/xml-data/corpfiling/AttachLive/' + a.ATTACHMENTNAME : (a.NSURL || 'https://www.bseindia.com/corporates/ann.html');

async function fetchDay(d = DATE) {
  let all = [];
  for (let p = 1; p <= 80; p++) { const t = await page(p, d); if (!t) break; all = all.concat(t); if (t.length < 50) break; await new Promise(r => setTimeout(r, 400)); }
  return all;
}

async function main() {
  const all = await fetchDay();
  const seen = new Set(), groups = {};
  for (const a of all) {
    const k = classify(a); if (!k) continue;
    const key = a.SCRIP_CD + '|' + k + '|' + (a.HEADLINE || '').slice(0, 60); if (seen.has(key)) continue; seen.add(key);
    (groups[k] = groups[k] || []).push(a);
  }
  const total = Object.values(groups).reduce((s, g) => s + g.length, 0);
  console.log('Filings read:', all.length, '· flagged:', total, Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length])));

  const nice = DATE.slice(6, 8) + '/' + DATE.slice(4, 6) + '/' + DATE.slice(0, 4);
  const embeds = [];
  for (const r of RULES) {
    const g = groups[r.k]; if (!g || !g.length) continue;
    const lines = g.slice(0, 8).map(a => '• **' + clip(a.SLONGNAME, 40) + '**: ' + clip(a.HEADLINE || a.NEWSSUB, 140) + ' · [filing](' + pdf(a) + ')');
    if (g.length > 8) lines.push('…and ' + (g.length - 8) + ' more on BSE.');
    embeds.push({ title: r.icon + ' ' + r.name + ' (' + g.length + ')', description: lines.join('\n').slice(0, 3900) + '\n\n*Why it matters:* ' + r.why, color: r.k === 'redflag' ? 0xF2765E : 0x2B9D79 });
  }
  if (!embeds.length) embeds.push({ title: 'A quiet day', description: 'Nothing unusual in the ' + all.length + ' BSE filings today. Quiet days are when to read an annual report.', color: 0x2B9D79 });
  embeds[embeds.length - 1].footer = { text: 'From ' + all.length + ' BSE filings on ' + nice + ' · Public disclosures, not recommendations · cagrclub.com' };

  const url = process.env.DISCORD_WEBHOOK_RADAR;
  if (!url) { console.log('DISCORD_WEBHOOK_RADAR not set. Preview:\n' + JSON.stringify(embeds, null, 1).slice(0, 4000)); return; }
  for (let i = 0; i < embeds.length; i += 10) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'Desk Radar', content: i ? '' : '**Desk Radar · ' + nice + '**\nWhat today\'s ' + all.length + ' BSE filings said that most people will not read.', embeds: embeds.slice(i, i + 10) }) });
    if (!r.ok) { console.error('Discord returned', r.status, await r.text()); process.exit(1); }
  }
}
module.exports = { RULES, classify, fetchDay, pdf, clip };
if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });

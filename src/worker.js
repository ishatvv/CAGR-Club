/* CAGR Club worker: serves the site and handles newsletter sign-ups.
   Sign-ups are stored in the KV namespace bound as SUBS (see README). */
const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i;
const DISCORD = 'https://discord.gg/qUfEwkCe';
const SITE = 'https://cagrclub.com';

// Unsubscribe links carry an HMAC of the email, keyed by ADMIN_KEY, so nobody can remove someone else.
async function token(email, secret) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(email));
  return [...new Uint8Array(sig)].slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
}
const unsubUrl = async (email, env) => SITE + '/api/unsubscribe?e=' + encodeURIComponent(email) + '&t=' + await token(email, env.ADMIN_KEY);

// Sends one email through Brevo (free: 300 a day) or, if that key is absent, Resend.
async function sendMail(env, to, subject, html, unsub) {
  const from = env.MAIL_FROM || 'CAGR Club <club@cagrclub.com>';
  const m = from.match(/^(.*?)\s*<(.+)>$/) || [null, 'CAGR Club', from];
  const headers = { 'List-Unsubscribe': '<' + unsub + '>', 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' };
  if (env.BREVO_API_KEY) return fetch('https://api.brevo.com/v3/smtp/email', { method: 'POST', headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ sender: { name: m[1] || 'CAGR Club', email: m[2] }, to: [{ email: to }], subject, htmlContent: html, headers }) });
  return fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: 'Bearer ' + env.RESEND_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html, headers }) });
}
// Welcome email, sent once on sign-up when RESEND_API_KEY is set. Plain, readable, one link that matters.
async function welcome(email, env) {
  if (!(env.BREVO_API_KEY || env.RESEND_API_KEY) || !env.ADMIN_KEY) return;
  const u = await unsubUrl(email, env);
  const html = `<div style="font:16px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#111;max-width:560px;margin:0 auto;padding:24px">
<p style="font-size:20px;font-weight:600;margin:0 0 16px">You're in.</p>
<p>CAGR Club is a small group that reads companies properly: the annual report, the notes, and the exchange filings most people skip.</p>
<p><a href="${DISCORD}" style="display:inline-block;background:#0f3d2e;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">Join the Discord</a></p>
<p>Inside: a finance question every morning, <b>Desk Radar</b> every weekday evening (the unusual BSE filings of the day, each linked to its source), and one deep lesson a week.</p>
<p>Every Sunday you'll get the Sunday Wrap by email. Start with the first lesson while you wait: <a href="${SITE}/#lesson-1">read a real P&amp;L</a>.</p>
<p style="color:#666;font-size:13px;margin-top:32px">Public information only, never investment advice. <a href="${u}" style="color:#666">Unsubscribe</a>.</p></div>`;
  await sendMail(env, email, 'Your CAGR Club invite', html, u);
}
const page = (msg) => new Response(`<!doctype html><meta name=viewport content="width=device-width"><title>CAGR Club</title><body style="font:17px/1.6 -apple-system,Segoe UI,sans-serif;background:#0b1410;color:#e8efe9;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px"><div style="max-width:420px;text-align:center"><p>${msg}</p><p><a style="color:#7fd1a8" href="/">Back to cagrclub.com</a></p></div>`, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname === '/api/subscribe') {
      if (req.method !== 'POST') return json({ error: 'method' }, 405);
      if (!env.SUBS) return json({ error: 'not_ready' }, 503);
      let body;
      try { body = await req.json(); } catch { return json({ error: 'bad_json' }, 400); }
      const email = String(body.email || '').trim().toLowerCase();
      if (!EMAIL.test(email) || body.website) return json({ error: 'invalid' }, 400);
      const key = 'sub:' + email;
      if (await env.SUBS.get(key)) return json({ ok: true, already: true });
      await env.SUBS.put(key, JSON.stringify({ t: new Date().toISOString(), src: String(body.src || '').slice(0, 40), country: (req.cf && req.cf.country) || '' }));
      if (ctx) ctx.waitUntil(welcome(email, env).catch(() => {}));
      return json({ ok: true, discord: DISCORD });
    }
    if (url.pathname === '/api/unsubscribe') {
      // GET shows a confirm button (mail scanners prefetch links); POST removes. One-click POST from mail clients also works.
      const email = String(url.searchParams.get('e') || '').toLowerCase(), t = url.searchParams.get('t') || '';
      if (!env.SUBS || !env.ADMIN_KEY || !email || t !== await token(email, env.ADMIN_KEY)) return page('That unsubscribe link is not valid.');
      if (req.method === 'POST') { await env.SUBS.delete('sub:' + email); return page('Done. ' + email.replace(/</g, '') + ' will not get any more emails from us.'); }
      return page('Stop emails to <b>' + email.replace(/</g, '') + '</b>?</p><form method=post><button style="font:inherit;padding:10px 20px;border-radius:999px;border:0;background:#7fd1a8;color:#0b1410;font-weight:600;cursor:pointer">Unsubscribe</button></form><p>');
    }
    if (url.pathname === '/api/subscribers') {
      // Export: https://cagrclub.com/api/subscribers?key=YOUR_ADMIN_KEY  (set ADMIN_KEY as a Worker secret)
      const given = (url.searchParams.get('key') || '').trim(), real = String(env.ADMIN_KEY || '').trim();
      // The hint says only whether a key is set and whether the lengths match; it never reveals the key.
      if (!real || given !== real) return json({ error: 'forbidden', admin_key_set: !!real, length_matches: !!real && given.length === real.length }, 403);
      if (!env.SUBS) return json({ error: 'not_ready' }, 503);
      const rows = ['email,signed_up_at,source,country'];
      let cursor;
      do {
        const page = await env.SUBS.list({ prefix: 'sub:', cursor });
        for (const k of page.keys) {
          const v = JSON.parse((await env.SUBS.get(k.name)) || '{}');
          rows.push([k.name.slice(4), v.t || '', v.src || '', v.country || ''].map(x => '"' + String(x).replace(/"/g, '""') + '"').join(','));
        }
        cursor = page.list_complete ? null : page.cursor;
      } while (cursor);
      return new Response(rows.join('\n'), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="cagr-club-subscribers.csv"', 'cache-control': 'no-store' } });
    }
    return env.ASSETS.fetch(req);
  }
};

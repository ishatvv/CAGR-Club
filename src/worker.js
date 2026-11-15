/* CAGR Club worker: serves the site and handles newsletter sign-ups.
   Sign-ups are stored in the KV namespace bound as SUBS (see README). */
const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i;

export default {
  async fetch(req, env) {
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
      return json({ ok: true });
    }
    if (url.pathname === '/api/subscribers') {
      // Export: https://cagrclub.com/api/subscribers?key=YOUR_ADMIN_KEY  (set ADMIN_KEY as a Worker secret)
      if (!env.ADMIN_KEY || url.searchParams.get('key') !== env.ADMIN_KEY) return json({ error: 'forbidden' }, 403);
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

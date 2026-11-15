# CAGR Club

The website for cagrclub.com: a learning site for equity research and finance.

- `index.html` is the whole site (one self-contained page).
- Any change saved to the `main` branch is published by the host.

Content is for education only and is not investment advice.

## Newsletter sign-ups (The Sunday Wrap)

The form on the home page posts to `/api/subscribe`, handled by `src/worker.js`. Emails are stored in a Cloudflare KV namespace bound as `SUBS`. Until that binding exists, the form tells visitors that sign-ups open soon.

To switch it on: Cloudflare dashboard → Storage & Databases → KV → Create namespace `cagr-subscribers`. Then Workers & Pages → cagr-club → Settings → Bindings → Add → KV namespace, variable name `SUBS`, pick `cagr-subscribers`. Sign-ups appear as keys `sub:<email>` in that namespace.

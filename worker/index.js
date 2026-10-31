// Cloudflare Worker: catches Approve/Reject taps from the email.
// Env vars (Settings > Variables): SIGNING_SECRET, GH_TOKEN, GH_REPO ("owner/repo"), optional BASE_BRANCH
const enc = new TextEncoder();

async function sig(env, a, b, e) {
  const key = await crypto.subtle.importKey('raw', enc.encode(env.SIGNING_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const s = await crypto.subtle.sign('HMAC', key, enc.encode(`${a}.${b}.${e}`));
  return [...new Uint8Array(s)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
const page = (title, body = '') =>
  new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:system-ui;max-width:480px;margin:15vh auto;text-align:center"><h2>${title}</h2>${body}</body>`, { headers: { 'content-type': 'text/html;charset=utf-8' } });
const gh = (env, path, init = {}) =>
  fetch(`https://api.github.com/repos/${env.GH_REPO}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${env.GH_TOKEN}`, 'User-Agent': 'blog-worker', Accept: 'application/vnd.github+json', ...(init.headers || {}) },
  });

export default {
  async fetch(req, env) {
    const q = new URL(req.url).searchParams;
    const [a, b, e, s] = ['a', 'b', 'e', 's'].map((k) => q.get(k));
    if (!['approve', 'reject'].includes(a) || !b?.startsWith('draft/') || !e || !s) return page('Nothing here');
    if (Date.now() > Number(e)) return page('Link expired');
    if (s !== (await sig(env, a, b, e))) return page('Bad link');

    // GET only shows a confirm button, so email scanners pre-fetching links can't trigger anything
    if (req.method === 'GET') {
      const label = a === 'approve' ? 'Yes, publish' : 'Yes, reject';
      return page(a === 'approve' ? 'Publish this post?' : 'Reject this draft?', `<form method="post"><button style="font-size:20px;padding:14px 28px">${label}</button></form>`);
    }

    if (a === 'approve') {
      const r = await gh(env, '/merges', { method: 'POST', body: JSON.stringify({ base: env.BASE_BRANCH || 'main', head: b, commit_message: `publish ${b}` }) });
      if (!r.ok) return page('Merge failed', `<p>GitHub said ${r.status}</p>`);
    }
    await gh(env, `/git/refs/heads/${b}`, { method: 'DELETE' });
    return page(a === 'approve' ? 'Published ✅' : 'Rejected 🗑️');
  },
};

// One-time login (repeat every ~60 days). Run on your Mac:
//   export LINKEDIN_CLIENT_ID=... LINKEDIN_CLIENT_SECRET=...
//   node scripts/linkedin-login.mjs
import http from 'node:http';
import crypto from 'node:crypto';
import { exec } from 'node:child_process';

const id = process.env.LINKEDIN_CLIENT_ID;
const secret = process.env.LINKEDIN_CLIENT_SECRET;
if (!id || !secret) { console.error('Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET first.'); process.exit(1); }

const redirect = 'http://localhost:3000/callback';
const state = crypto.randomBytes(16).toString('hex');
const authUrl = 'https://www.linkedin.com/oauth/v2/authorization?' + new URLSearchParams({
  response_type: 'code', client_id: id, redirect_uri: redirect, state, scope: 'openid profile w_member_social',
});

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost:3000');
  if (u.pathname !== '/callback') { res.writeHead(404); return res.end(); }
  if (u.searchParams.get('state') !== state) { res.end('Bad state, start again.'); return; }
  const code = u.searchParams.get('code');
  if (!code) { res.end('No code: ' + (u.searchParams.get('error_description') || 'login cancelled')); server.close(); return; }
  try {
    const t = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirect, client_id: id, client_secret: secret }),
    }).then((r) => r.json());
    if (!t.access_token) throw new Error(JSON.stringify(t));
    const me = await fetch('https://api.linkedin.com/v2/userinfo', { headers: { Authorization: `Bearer ${t.access_token}` } }).then((r) => r.json());
    if (!me.sub) throw new Error('userinfo failed: ' + JSON.stringify(me));
    const expires = new Date(Date.now() + t.expires_in * 1000).toISOString().slice(0, 10);
    res.end('Done. You can close this tab and go back to the terminal.');
    console.log('\nAdd these 3 as GitHub repo secrets (Settings > Secrets and variables > Actions):\n');
    console.log('LINKEDIN_ACCESS_TOKEN =', t.access_token);
    console.log('LINKEDIN_AUTHOR_URN   =', `urn:li:person:${me.sub}`);
    console.log('LINKEDIN_EXPIRES_AT   =', expires);
    console.log(`\nLogged in as ${me.name || 'your profile'}. Token expires ${expires}; the daily email warns you 10 days before.\n`);
  } catch (e) {
    res.end('Failed: ' + e.message);
    console.error('Login failed:', e.message);
  }
  server.close();
});
server.listen(3000, () => {
  console.log('Opening LinkedIn in your browser. If nothing opens, paste this URL:\n\n' + authUrl + '\n');
  exec(`open "${authUrl}"`);
});

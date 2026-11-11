// Posts social/<slug>.json to your LinkedIn profile: text + the 2 summary images.
// Usage: node scripts/post-linkedin.mjs social/<slug>.json      (DRY_RUN=1 to only print what would be sent)
import fs from 'node:fs';
import path from 'node:path';

const TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const AUTHOR = process.env.LINKEDIN_AUTHOR_URN;
const VERSION = process.env.LINKEDIN_VERSION || '202608'; // YYYYMM; LinkedIn answers 426 if the version is retired
const DRY = process.env.DRY_RUN === '1';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const file = process.argv[2];
if (!file) { console.error('usage: node scripts/post-linkedin.mjs social/<slug>.json'); process.exit(1); }
if (!DRY && (!TOKEN || !AUTHOR)) throw new Error('LINKEDIN_ACCESS_TOKEN or LINKEDIN_AUTHOR_URN is missing');
if (!DRY && process.env.LINKEDIN_EXPIRES_AT && new Date(process.env.LINKEDIN_EXPIRES_AT) < new Date()) {
  throw new Error('The LinkedIn login expired. Run scripts/linkedin-login.mjs and update the 3 LINKEDIN_ secrets.');
}

const slug = path.basename(file, '.json');
const s = JSON.parse(fs.readFileSync(file, 'utf8'));
const marker = path.join(path.dirname(file), `${slug}.posted.json`);
const done = fs.existsSync(marker) ? JSON.parse(fs.readFileSync(marker, 'utf8')) : {};
if (done.linkedin) { console.log('Already posted to LinkedIn:', slug); process.exit(0); }
if (!s.linkedin) throw new Error('No linkedin text in ' + file);

// LinkedIn reads the text as "little text": these characters must be escaped or the post gets cut off
const escapeLittle = (t) => t.replace(/[\\|{}@\[\]()<>#*_~]/g, '\\$&');
const text = s.linkedin.trim().slice(0, 2900);
const images = ['slide-1.png', 'slide-2.png'].map((n) => path.join('social', slug, n)).filter((f) => fs.existsSync(f));
const alt = `${s.title || slug}: key points`.slice(0, 120);

if (DRY) {
  console.log('--- would post as', AUTHOR || '(author urn)');
  console.log(escapeLittle(text));
  console.log('--- images:', images.join(', ') || 'none');
  process.exit(0);
}

const H = { Authorization: `Bearer ${TOKEN}`, 'LinkedIn-Version': VERSION, 'X-Restli-Protocol-Version': '2.0.0', 'Content-Type': 'application/json' };

// the post links to the new blog page, so wait until the site has deployed it (up to ~7 minutes)
if (s.link) {
  let live = false;
  for (let i = 0; i < 42 && !live; i++) {
    try { live = (await fetch(s.link, { headers: { 'cache-control': 'no-cache' } })).ok; } catch {}
    if (!live) await sleep(10000);
  }
  console.log(live ? 'Blog post is live.' : 'Blog post not live yet, posting anyway.');
}

async function uploadImage(f) {
  const init = await fetch('https://api.linkedin.com/rest/images?action=initializeUpload', { method: 'POST', headers: H, body: JSON.stringify({ initializeUploadRequest: { owner: AUTHOR } }) });
  if (!init.ok) throw new Error(`image init ${init.status} ${(await init.text()).slice(0, 300)}`);
  const { value } = await init.json();
  const put = await fetch(value.uploadUrl, { method: 'PUT', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/octet-stream' }, body: fs.readFileSync(f) });
  if (!put.ok) throw new Error(`image upload ${put.status}`);
  return value.image;
}

const ids = [];
for (const f of images) ids.push(await uploadImage(f));
let content;
if (ids.length >= 2) content = { multiImage: { images: ids.map((id) => ({ id, altText: alt })) } };
else if (ids.length === 1) content = { media: { id: ids[0], altText: alt } };

const body = {
  author: AUTHOR,
  commentary: escapeLittle(text),
  visibility: 'PUBLIC',
  distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
  ...(content ? { content } : {}),
  lifecycleState: 'PUBLISHED',
  isReshareDisabledByAuthor: false,
};
const r = await fetch('https://api.linkedin.com/rest/posts', { method: 'POST', headers: H, body: JSON.stringify(body) });
if (!r.ok) throw new Error(`post ${r.status} ${(await r.text()).slice(0, 400)}`);
const urn = r.headers.get('x-restli-id');
fs.writeFileSync(marker, JSON.stringify({ ...done, linkedin: urn, linkedinAt: new Date().toISOString() }, null, 2));
console.log('Posted to LinkedIn:', urn ? `https://www.linkedin.com/feed/update/${urn}/` : '(no id returned)');

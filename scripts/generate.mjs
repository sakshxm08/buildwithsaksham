import fs from 'node:fs';
import path from 'node:path';
import { makeCover, makeSlides, ICON_NAMES } from './cover.mjs';

const BLOG_DIR = process.env.BLOG_DIR || 'src/content/blog';
const SITE = (process.env.SITE_URL || 'https://buildwithsaksham.in').replace(/\/$/, '');
const URL_PATH = process.env.BLOG_URL_PATH || '/blog/';
const COVER_DIR = process.env.COVER_DIR || 'public/blog-covers';
const UA = { 'User-Agent': 'buildwithsaksham-bot/1.0' };
const today = new Date().toISOString().slice(0, 10);

const j = async (url, headers = UA) => {
  const r = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
};
const t = async (url) => {
  const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
};
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

// ---------- LLM (Groq first, OpenRouter fallback) ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// OpenRouter free models come and go, so look up what is free right now.
async function freeOrModels() {
  if (process.env.OPENROUTER_MODEL) return [process.env.OPENROUTER_MODEL];
  const d = await j('https://openrouter.ai/api/v1/models');
  const pref = ['llama-3.3-70b', 'gpt-oss', 'qwen', 'gemma', 'deepseek', 'mistral'];
  const rank = (id) => { const i = pref.findIndex((x) => id.includes(x)); return i < 0 ? 99 : i; };
  return d.data
    .filter((m) => Number(m.pricing?.prompt) === 0 && Number(m.pricing?.completion) === 0 && (m.context_length || 0) >= 32000 && String(m.architecture?.modality || 'text').startsWith('text'))
    .sort((a, b) => rank(a.id) - rank(b.id))
    .slice(0, 3)
    .map((m) => m.id);
}

async function chat(p, model, system, user) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const body = { model, temperature: 0.4, max_tokens: 2500, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] };
    if (p.name === 'groq' && model.includes('gpt-oss')) body.reasoning_effort = 'low';
    const r = await fetch(p.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${p.key}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120000),
    });
    if (r.status === 429 && attempt < 3) {
      const wait = Math.min(65, Math.max(Number(r.headers.get('retry-after')) || 0, 20));
      console.warn(`${p.name} 429 rate limit, waiting ${wait}s`);
      await sleep(wait * 1000);
      continue;
    }
    if (!r.ok) throw new Error(`${p.name} ${model} ${r.status} ${(await r.text()).slice(0, 200)}`);
    const out = (await r.json()).choices?.[0]?.message?.content?.trim();
    if (!out) throw new Error(`${p.name} ${model} empty reply`);
    return out;
  }
}

async function llm(system, user) {
  const providers = [
    { name: 'groq', url: 'https://api.groq.com/openai/v1/chat/completions', key: process.env.GROQ_API_KEY, models: async () => [process.env.GROQ_MODEL || 'openai/gpt-oss-120b'] },
    { name: 'openrouter', url: 'https://openrouter.ai/api/v1/chat/completions', key: process.env.OPENROUTER_API_KEY, models: freeOrModels },
  ];
  let lastErr;
  for (const p of providers) {
    if (!p.key) continue;
    try {
      for (const model of await p.models()) {
        try { return await chat(p, model, system, user); }
        catch (e) { lastErr = e; console.warn('LLM failed:', e.message.slice(0, 300)); }
      }
    } catch (e) { lastErr = e; console.warn('LLM failed:', e.message.slice(0, 300)); }
  }
  throw lastErr || new Error('No LLM API key set');
}

// ---------- Market scan ----------
const KW = /\b(ai|llm|gpt|claude|gemini|model|agent|rag|mcp|open.?source|api|rust|python|typescript|javascript|react|developer|code|coding|framework|database|cloud|kubernetes|docker|security|inference)\b/i;

async function hn() {
  const d = await j('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=50');
  return d.hits.filter((h) => h.url && KW.test(h.title)).map((h) => ({ title: h.title, url: h.url, source: 'Hacker News', score: h.points }));
}
async function devto() {
  const d = await j('https://dev.to/api/articles?top=1&per_page=20');
  return d.map((a) => ({ title: a.title, url: a.url, source: 'dev.to', score: a.positive_reactions_count }));
}
async function github() {
  const since = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  const h = { ...UA, Accept: 'application/vnd.github+json', ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) };
  const d = await j(`https://api.github.com/search/repositories?q=${encodeURIComponent(`topic:llm created:>${since}`)}&sort=stars&per_page=10`, h);
  return d.items.map((r) => ({ title: `${r.full_name}: ${r.description || ''}`.slice(0, 140), url: r.html_url, source: 'GitHub', score: r.stargazers_count }));
}
async function reddit() {
  const out = [];
  for (const s of ['LocalLLaMA', 'programming', 'MachineLearning', 'webdev']) {
    try {
      const x = await t(`https://www.reddit.com/r/${s}/top/.rss?t=day`);
      for (const m of x.matchAll(/<entry>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link href="([^"]+)"/g))
        out.push({ title: decode(m[1]), url: m[2], source: `r/${s}`, score: 0 });
    } catch (e) { console.warn(`reddit r/${s} skipped:`, e.message); }
  }
  return out;
}
const safe = (f) => f().catch((e) => { console.warn(f.name, 'failed:', e.message); return []; });

// ---------- Dedupe against old posts ----------
function loadHistory() {
  const titles = [];
  if (fs.existsSync(BLOG_DIR)) {
    for (const f of fs.readdirSync(BLOG_DIR)) {
      if (!/\.mdx?$/.test(f)) continue;
      const m = fs.readFileSync(path.join(BLOG_DIR, f), 'utf8').match(/^title:\s*["']?(.+?)["']?\s*$/m);
      titles.push(m ? m[1] : f.replace(/\.mdx?$/, ''));
    }
  }
  const used = fs.existsSync('data/used.json') ? JSON.parse(fs.readFileSync('data/used.json', 'utf8')) : { urls: [], titles: [] };
  return { titles: [...new Set([...titles, ...used.titles])], urls: new Set(used.urls), used };
}

async function page(url) {
  try {
    const h = await t(url);
    return h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<nav[\s\S]*?<\/nav>|<footer[\s\S]*?<\/footer>/gi, ' ')
      .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 4500);
  } catch { return ''; }
}

// ---------- Main ----------
const hist = loadHistory();
const all = (await Promise.all([safe(hn), safe(devto), safe(github), safe(reddit)])).flat();
const seen = new Set();
const bySource = {};
for (const c of all) {
  if (seen.has(c.url) || hist.urls.has(c.url)) continue;
  seen.add(c.url);
  (bySource[c.source] ||= []).push(c);
}
const cands = Object.values(bySource).flatMap((l) => l.sort((a, b) => b.score - a.score).slice(0, 10));
if (!cands.length) throw new Error('No candidates found');
console.log(`${cands.length} candidates`);

const list = cands.map((c, i) => `${i}. [${c.source}] ${c.title}`).join('\n');
const pickRaw = await llm(
  'You are the editor of a developer blog about software development, AI and LLMs. Reply with JSON only.',
  `Pick ONE topic from the candidates that is newsworthy and useful to developers.\nDo NOT pick anything similar to these already-published posts:\n${hist.titles.join('\n') || '(none)'}\n\nCANDIDATES:\n${list}\n\nReturn exactly: {"index":<number>,"also":[<up to 2 other related candidate indexes>],"title":"<blog post title>","category":"<one of: AI & LLMs | Software Development | Open Source | Tools & Automation | Security>"}`
);
const pick = JSON.parse(pickRaw.match(/\{[\s\S]*\}/)[0]);
if (!cands[pick.index]) throw new Error('Bad pick: ' + pickRaw);

const idxs = [pick.index, ...(pick.also || [])].filter((i, n, a) => cands[i] && a.indexOf(i) === n).slice(0, 3);
const sources = [];
for (const i of idxs) sources.push({ ...cands[i], text: await page(cands[i].url) });
const material = sources.reduce((n, s) => n + s.text.length, 0);
if (material < 500) throw new Error('Not enough source text fetched, aborting instead of guessing');

const srcBlock = sources.map((s, n) => `SOURCE ${n + 1}: ${s.title}\nURL: ${s.url}\n${s.text}`).join('\n\n---\n\n');
const SYS = 'You write for buildwithsaksham.in, a developer blog on development, AI and LLMs. Voice: clear, conversational and practical, like a developer explaining the news to a peer ("you", "we"). No hype. Never claim personal experience and never invent anecdotes. FACT RULES: every specific number, date, name, version, benchmark and quote must come from SOURCES; if it is not there, leave it out. You may add general, well-established background (what a technology is, how it works) but no invented specifics. Output markdown paragraphs only, no headings unless told.';
const outlineRaw = await llm(
  SYS + ' Reply with JSON only.',
  `Plan a long-form blog post titled "${pick.title}" from SOURCES. Return exactly: {"sections":[{"h":"<section heading>","points":["<fact or idea to cover>"]}]} with 6 sections in this order: what happened, why it matters, how it works (background), the key details and numbers, what it means for developers, limits and caveats. Each section has 3-5 points drawn from SOURCES.\n\nSOURCES:\n${srcBlock}`
);
const outline = (JSON.parse(outlineRaw.match(/\{[\s\S]*\}/)[0]).sections || []).filter((x) => x.h && x.points?.length).slice(0, 7);
if (outline.length < 4) throw new Error('Outline too short');
const parts = [await llm(SYS, `Write the opening of the post "${pick.title}": 2 short paragraphs (110-150 words in total) that hook the reader with the news and say what the post covers. No heading.\n\nSOURCES:\n${srcBlock}`)];
for (const sec of outline) {
  const text = await llm(SYS, `Write the section "${sec.h}" for the post "${pick.title}". 250-320 words in 3-4 paragraphs of 3-5 sentences each. Cover these points:\n- ${sec.points.join('\n- ')}\nDo not repeat what earlier sections said. No heading.\n\nSOURCES:\n${srcBlock}`);
  parts.push(`## ${sec.h.replace(/[#*]/g, '')}\n\n${text}`);
}
const takeaways = await llm(SYS, `Write 4-6 bullet points ("- " lines) of key takeaways for developers from the post "${pick.title}", one sentence each, using only facts from SOURCES. Output only the bullets.\n\nSOURCES:\n${srcBlock}`);
parts.push(`## Key takeaways\n\n${takeaways}`);
parts.push(`## Sources\n\n${sources.map((x) => `- [${x.title.replace(/[\[\]]/g, '')}](${x.url})`).join('\n')}`);
const body = parts.join('\n\n');
const brief = body.replace(/## Sources[\s\S]*$/, '').slice(0, 9000);
console.log(`Blog body: ${body.split(/\s+/).length} words`);

const slug = pick.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const link = `${SITE}${URL_PATH}${slug}`;

const socialRaw = await llm(
  'You write social posts that tease a developer blog post and send readers to it. Use ONLY facts from the blog post provided. Neutral third-person voice: never use "I", "my" or "me", never invent personal experience or anecdotes. The posts must read like social posts, not like the blog: keep the deep detail for the blog and point readers to the link. Output exactly the three sections below, each starting with its marker line, nothing else.',
  `Blog post:\n${brief}\n\nWrite:\n===X===\nA teaser thread of 4-5 tweets. Tweet 1 is a punchy hook (a surprising fact or number from the post), no hashtags. Tweets 2-3 each carry ONE striking fact in plain language, numbered "2/", "3/". Do not explain the details. The last tweet says the full breakdown with sources is on the blog and includes {{LINK}}. Each tweet under 270 characters. At most 1 hashtag in the whole thread.\n===THREADS===\nOne casual post, 2-4 short lines, under 450 characters, like talking to a friend. At most one emoji, no hashtags, ends with a question, and {{LINK}} alone on the last line.\n===LINKEDIN===\nWrite a LinkedIn post of 1400-1900 characters. Plain text only: no hashtags, no emojis, no bullet symbols. Short paragraphs of 1-3 sentences separated by blank lines, in this order:\n1) Hook: 1-2 sentences, a sharp question or surprising statement about the news, naming the source.\n2) The core finding with the specific numbers.\n3) What else changed, with more specific numbers.\n4) Only if the post contains a direct quote: include it in quotation marks, under 20 words.\n5) Why it matters: 1-2 factual, neutral sentences.\n6) A caveat about the data, only if the post mentions one.\n7) One specific question to the reader.\n8) Last line exactly: Full breakdown with sources: {{LINK}}\nIt must read like a social post written from the news, NOT like a copy or summary of the blog. Keep the deep detail (how it works, implications, step by step) for the blog.\n`
);
const marks = [...socialRaw.matchAll(/===(X|THREADS|LINKEDIN)===/g)];
const social = {};
marks.forEach((m, i) => { social[m[1].toLowerCase()] = socialRaw.slice(m.index + m[0].length, marks[i + 1]?.index ?? socialRaw.length).trim().replaceAll('{{LINK}}', link); });
if (!social.x || !social.threads || !social.linkedin) throw new Error('Social parse failed');

let slideFiles = [];
try {
  const raw = await llm(
    'You turn a blog post into two LinkedIn image cards. Reply with JSON only. Use ONLY facts from the post.',
    `Post:\n${brief}\n\nReturn exactly this JSON shape and respect the length limits:\n{"kicker":"<=26 chars, the report or source name","stat":{"value":"<=7 chars, the single most striking number, like 80% or 6:1 or 27→9%","label":"<=70 chars, what that number measures"},"headline":"<=70 chars, the news in one sentence-case line","title2":"<=24 chars, like Key takeaways","points":[{"icon":"<one of: ${ICON_NAMES.join(', ')}>","title":"<=26 chars","text":"<=80 chars"}]}\n"points" must hold 3 or 4 items, each a distinct fact from the post.`
  );
  const d = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);
  if (!d.stat?.value || !Array.isArray(d.points) || d.points.length < 3) throw new Error('bad slide json');
  const dir = path.join('social', slug);
  fs.mkdirSync(dir, { recursive: true });
  slideFiles = makeSlides(d, slug).map((buf, i) => { const f = path.join(dir, `slide-${i + 1}.png`); fs.writeFileSync(f, buf); return f; });
} catch (e) { console.warn('Slides skipped:', e.message); }

const desc = body.replace(/^#+.*$/gm, '').replace(/[#*_`>\[\]]/g, '').trim().split(/\n\s*\n/)[0].replace(/\s+/g, ' ').slice(0, 155);
const readTime = Math.max(1, Math.ceil(body.split(/\s+/).length / 200));
const CATS = ['AI & LLMs', 'Software Development', 'Open Source', 'Tools & Automation', 'Security'];
const category = CATS.includes(pick.category) ? pick.category : 'AI & LLMs';
const coverUrl = `/blog-covers/${slug}.png`;
const post = `---\ntitle: ${JSON.stringify(pick.title)}\ndescription: ${JSON.stringify(desc)}\npubDate: ${today}\ncategory: ${JSON.stringify(category)}\nreadTime: ${readTime}\ncover: ${JSON.stringify(coverUrl)}\n---\n\n${body}\n`;

fs.mkdirSync(BLOG_DIR, { recursive: true });
fs.mkdirSync(COVER_DIR, { recursive: true });
fs.mkdirSync('social', { recursive: true });
fs.mkdirSync('data', { recursive: true });
const file = path.join(BLOG_DIR, `${slug}.md`);
const coverFile = path.join(COVER_DIR, `${slug}.png`);
fs.writeFileSync(file, post);
fs.writeFileSync(coverFile, makeCover({ title: pick.title, category, readMin: readTime, seed: slug }));
fs.writeFileSync(`social/${slug}.json`, JSON.stringify({ link, cover: coverUrl, ...social }, null, 2));
hist.used.urls.push(...sources.map((s) => s.url));
hist.used.titles.push(pick.title);
fs.writeFileSync('data/used.json', JSON.stringify(hist.used, null, 2));
fs.writeFileSync('.draft-meta.json', JSON.stringify({ branch: `draft/${today}-${slug}`, slug, title: pick.title, file, coverFile, slides: slideFiles, link, preview: body.slice(0, 700), x: social.x, threads: social.threads, linkedin: social.linkedin }, null, 2));
console.log('Draft ready:', pick.title);

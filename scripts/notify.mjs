import fs from 'node:fs';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';

const m = JSON.parse(fs.readFileSync('.draft-meta.json', 'utf8'));
const exp = Date.now() + 48 * 3600 * 1000;
const sign = (a) => crypto.createHmac('sha256', process.env.SIGNING_SECRET).update(`${a}.${m.branch}.${exp}`).digest('hex');
const link = (a) => `${process.env.WORKER_URL.replace(/\/$/, '')}/?a=${a}&b=${encodeURIComponent(m.branch)}&e=${exp}&s=${sign(a)}`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const btn = (href, label, bg) => `<a href="${href}" style="display:inline-block;padding:14px 26px;margin:6px 8px 6px 0;background:${bg};color:#fff;text-decoration:none;border-radius:8px;font-weight:600">${label}</a>`;

const html = `<div style="font-family:system-ui,sans-serif;max-width:560px">
<h2>${esc(m.title)}</h2>
<p style="white-space:pre-wrap;color:#333">${esc(m.preview)}…</p>
<p><a href="https://github.com/${process.env.REPO}/blob/${encodeURIComponent(m.branch).replace(/%2F/g, '/')}/${m.file}">Read full draft</a></p>
<p>${btn(link('approve'), 'Approve', '#16a34a')}${btn(link('reject'), 'Reject', '#dc2626')}</p>
<p style="color:#666;font-size:13px">Links expire in 48h. X thread to copy-paste after approving:</p>
<pre style="white-space:pre-wrap;background:#f4f4f5;padding:12px;border-radius:8px;font-size:13px">${esc(m.x)}</pre>
</div>`;

const tx = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
await tx.sendMail({ from: process.env.GMAIL_USER, to: process.env.GMAIL_USER, subject: `Blog draft: ${m.title}`, html });
console.log('Email sent');

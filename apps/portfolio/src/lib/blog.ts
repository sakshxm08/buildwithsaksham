import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

const DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readTime: number;
  cover: string;
};

export type Blocks = {
  tldr: string[];
  stats: { value: string; label: string }[];
  chart: {
    title: string;
    unit: string;
    note: string;
    items: { label: string; value: number }[];
  } | null;
  flow: {
    kind: "steps" | "timeline";
    title: string;
    steps: { label: string; text: string }[];
  } | null;
};

export type Post = PostMeta & {
  html: string;
  blocks: Blocks;
  toc: { id: string; text: string }[];
};

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const slugify = (t: string) =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Posts are AI-written from web sources: never let raw HTML or javascript: links through.
marked.use({
  renderer: {
    html({ text }: { text: string }) {
      return esc(text);
    },
    heading(
      this: { parser: { parseInline: (t: unknown) => string } },
      { tokens, depth, text }: { tokens: unknown; depth: number; text: string },
    ) {
      return `<h${depth} id="${esc(slugify(text))}">${this.parser.parseInline(tokens)}</h${depth}>`;
    },
    link(
      this: { parser: { parseInline: (t: unknown) => string } },
      {
        href,
        title,
        tokens,
      }: { href: string; title?: string | null; tokens: unknown },
    ) {
      const safe = /^(https?:|mailto:|#|\/)/i.test(href) ? href : "#";
      const t = title ? ` title="${esc(title)}"` : "";
      return `<a href="${esc(safe)}"${t} target="_blank" rel="noopener noreferrer">${this.parser.parseInline(tokens)}</a>`;
    },
  },
  // biome-ignore lint/suspicious/noExplicitAny: marked renderer typing
} as any);

// ---- structured blocks written by the bot into front matter (rendered as React, never as raw HTML) ----
type Raw = Record<string, unknown>;
const str = (v: unknown, n: number) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, n) : "";
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function parseBlocks(raw?: string): Blocks {
  const empty: Blocks = { tldr: [], stats: [], chart: null, flow: null };
  if (!raw) return empty;
  try {
    const d = JSON.parse(raw) as Raw;
    const tldr = arr(d.tldr)
      .map((x) => str(x, 160))
      .filter(Boolean)
      .slice(0, 4);
    const stats = arr(d.stats)
      .map((x) => ({
        value: str((x as Raw)?.value, 8),
        label: str((x as Raw)?.label, 80),
      }))
      .filter((x) => x.value && x.label)
      .slice(0, 4);

    const c = (d.chart ?? {}) as Raw;
    const items = arr(c.items)
      .map((x) => ({
        label: str((x as Raw)?.label, 22),
        value: Number((x as Raw)?.value),
      }))
      .filter((x) => x.label && Number.isFinite(x.value))
      .slice(0, 6);
    const chart =
      items.length >= 2
        ? {
            title: str(c.title, 80),
            unit: str(c.unit, 6),
            note: str(c.note, 100),
            items,
          }
        : null;

    const f = (d.flow ?? {}) as Raw;
    const steps = arr(f.steps)
      .map((x) => ({
        label: str((x as Raw)?.label, 34),
        text: str((x as Raw)?.text, 120),
      }))
      .filter((x) => x.label)
      .slice(0, 6);
    const flow =
      steps.length >= 3
        ? {
            kind: (f.kind === "timeline" ? "timeline" : "steps") as
              | "steps"
              | "timeline",
            title: str(f.title, 70),
            steps,
          }
        : null;

    return { tldr, stats, chart, flow };
  } catch {
    return empty;
  }
}

function parse(file: string): Post | null {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return null;
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    let v = line.slice(i + 1).trim();
    if (v.startsWith('"')) {
      try {
        v = JSON.parse(v);
      } catch {}
    }
    meta[line.slice(0, i).trim()] = v;
  }
  const slug = file.replace(/\.md$/, "");
  const words = m[2].split(/\s+/).length;
  const toc = marked
    .lexer(m[2])
    .filter(
      (t): t is Extract<typeof t, { type: "heading" }> =>
        t.type === "heading" && t.depth === 2,
    )
    .map((t) => ({ id: slugify(t.text), text: t.text.replace(/[*_`]/g, "") }));
  return {
    slug,
    title: meta.title ?? slug,
    description: meta.description ?? "",
    date: meta.pubDate ?? "",
    category: meta.category || "General",
    readTime: Number(meta.readTime) || Math.max(1, Math.ceil(words / 200)),
    cover: meta.cover ?? "",
    html: marked.parse(m[2]) as string,
    blocks: parseBlocks(meta.blocks),
    toc,
  };
}

export function getPosts(): Post[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map(parse)
    .filter((p): p is Post => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export const getPost = (slug: string) =>
  getPosts().find((p) => p.slug === slug);

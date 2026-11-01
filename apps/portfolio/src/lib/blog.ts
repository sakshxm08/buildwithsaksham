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
export type Post = PostMeta & { html: string };

const esc = (s: string) =>
	s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

// Posts are AI-written from web sources: never let raw HTML or javascript: links through.
marked.use({
	renderer: {
		html({ text }: { text: string }) {
			return esc(text);
		},
		link(
			this: { parser: { parseInline: (t: unknown) => string } },
			{ href, title, tokens }: { href: string; title?: string | null; tokens: unknown },
		) {
			const safe = /^(https?:|mailto:|#|\/)/i.test(href) ? href : "#";
			const t = title ? ` title="${esc(title)}"` : "";
			return `<a href="${esc(safe)}"${t} target="_blank" rel="noopener noreferrer">${this.parser.parseInline(tokens)}</a>`;
		},
	},
	// biome-ignore lint/suspicious/noExplicitAny: marked renderer typing
} as any);

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
	return {
		slug,
		title: meta.title ?? slug,
		description: meta.description ?? "",
		date: meta.pubDate ?? "",
		category: meta.category || "General",
		readTime: Number(meta.readTime) || Math.max(1, Math.ceil(words / 200)),
		cover: meta.cover ?? "",
		html: marked.parse(m[2]) as string,
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

export const getPost = (slug: string) => getPosts().find((p) => p.slug === slug);

import { getPosts } from "../../lib/blog";
import { BlogList } from "./_components/blog-list";

export const metadata = {
	title: "Blog | Saksham",
	description: "Notes on development, AI and LLMs.",
};

export default function BlogPage() {
	// biome-ignore lint/correctness/noUnusedVariables: html is stripped so it is not shipped to the client
	const posts = getPosts().map(({ html, ...meta }) => meta);
	return (
		<main className="mx-auto max-w-5xl px-6 py-16">
			<h1 className="text-4xl font-bold">Insights &amp; Notes</h1>
			<p className="mt-3 max-w-2xl opacity-75">Daily notes on development, AI and LLMs, with sources.</p>
			<BlogList posts={posts} />
		</main>
	);
}

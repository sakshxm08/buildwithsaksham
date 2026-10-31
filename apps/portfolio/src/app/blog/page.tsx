import Link from "next/link";
import { getPosts } from "../../lib/blog";

export const metadata = {
	title: "Blog | Saksham",
	description: "Notes on development, AI and LLMs.",
};

export default function BlogPage() {
	const posts = getPosts();
	return (
		<main className="mx-auto max-w-3xl px-6 py-16">
			<h1 className="text-4xl font-bold">Blog</h1>
			<ul className="mt-10 space-y-8">
				{posts.map((p) => (
					<li key={p.slug}>
						<Link href={`/blog/${p.slug}`} className="block">
							<h2 className="text-2xl font-semibold">{p.title}</h2>
							<p className="mt-1 text-sm opacity-60">{p.date}</p>
							<p className="mt-2 opacity-80">{p.description}</p>
						</Link>
					</li>
				))}
			</ul>
		</main>
	);
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "../../../lib/blog";

export const dynamicParams = false;

export function generateStaticParams() {
	return getPosts().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const p = getPost(slug);
	return p ? { title: `${p.title} | Saksham`, description: p.description } : {};
}

export default async function PostPage({ params }: Props) {
	const { slug } = await params;
	const post = getPost(slug);
	if (!post) notFound();
	return (
		<main className="mx-auto max-w-3xl px-6 py-16">
			<h1 className="text-4xl font-bold">{post.title}</h1>
			<p className="mt-2 text-sm opacity-60">{post.date}</p>
			<article
				className="mt-10 leading-relaxed [&_a]:underline [&_code]:text-sm [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_ul]:list-disc [&_ul]:pl-6"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is escaped/sanitised in lib/blog.ts
				dangerouslySetInnerHTML={{ __html: post.html }}
			/>
		</main>
	);
}

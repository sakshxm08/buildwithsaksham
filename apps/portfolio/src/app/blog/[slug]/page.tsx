import type { Metadata } from "next";
import Link from "next/link";
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
	if (!p) return {};
	return {
		metadataBase: new URL("https://buildwithsaksham.in"),
		title: `${p.title} | Saksham`,
		description: p.description,
		openGraph: { title: p.title, description: p.description, images: p.cover ? [p.cover] : [] },
		twitter: { card: "summary_large_image", images: p.cover ? [p.cover] : [] },
	};
}

export default async function PostPage({ params }: Props) {
	const { slug } = await params;
	const post = getPost(slug);
	if (!post) notFound();
	return (
		<main className="mx-auto max-w-3xl px-6 py-16">
			<Link href="/blog" className="text-sm opacity-70 hover:opacity-100">
				← All posts
			</Link>
			<div className="mt-6 flex items-center gap-2 text-xs">
				<span className="rounded-full bg-indigo-500/20 px-2.5 py-1 font-semibold">{post.category}</span>
				<span className="opacity-60">
					{post.date} · {post.readTime} min read
				</span>
			</div>
			<h1 className="mt-4 text-4xl font-bold leading-tight">{post.title}</h1>
			{post.cover && (
				// biome-ignore lint/performance/noImgElement: static export, images are unoptimized
				<img src={post.cover} alt="" className="mt-8 w-full rounded-2xl" />
			)}
			<article
				className="mt-10 leading-relaxed [&_a]:underline [&_code]:text-sm [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_ul]:list-disc [&_ul]:pl-6"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is escaped/sanitised in lib/blog.ts
				dangerouslySetInnerHTML={{ __html: post.html }}
			/>
		</main>
	);
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "../../../lib/blog";
import {
  ChartBlock,
  FlowBlock,
  StatCards,
  TldrBox,
} from "../_components/post-blocks";
import { ReadingProgress, Toc } from "../_components/toc";

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
    openGraph: {
      title: p.title,
      description: p.description,
      images: p.cover ? [p.cover] : [],
    },
    twitter: { card: "summary_large_image", images: p.cover ? [p.cover] : [] },
  };
}

const PROSE =
  "leading-relaxed [&_a]:underline [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-500/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:text-sm [&_h2]:mt-12 [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_table]:my-6 [&_table]:w-full [&_table]:text-sm [&_td]:border-b [&_td]:border-current/10 [&_td]:py-2 [&_th]:border-b [&_th]:border-current/20 [&_th]:py-2 [&_th]:text-left [&_ul]:list-disc [&_ul]:pl-6";

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { tldr, stats, chart, flow } = post.blocks;
  // split at each section heading so the diagram and chart can sit between sections
  const [intro, ...sections] = post.html.split(/(?=<h2 )/);
  const flowAt = Math.min(2, sections.length - 1);
  const chartAt = Math.min(3, sections.length - 1);

  return (
    <>
      <ReadingProgress />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-12">
          <div className="mx-auto w-full max-w-3xl">
            <Link href="/blog" className="text-sm opacity-70 hover:opacity-100">
              ← All posts
            </Link>
            <div className="mt-6 flex items-center gap-2 text-xs">
              <span className="rounded-full bg-indigo-500/20 px-2.5 py-1 font-semibold">
                {post.category}
              </span>
              <span className="opacity-60">
                {post.date} · {post.readTime} min read
              </span>
            </div>
            <h1 className="mt-4 text-4xl font-bold leading-tight">{post.title}</h1>
            {post.cover && (
              // biome-ignore lint/performance/noImgElement: static export, images are unoptimized
              <img src={post.cover} alt="" className="mt-8 w-full rounded-2xl" />
            )}
            {tldr.length > 0 && <TldrBox items={tldr} />}
            {stats.length >= 2 && <StatCards stats={stats} />}
            <Toc items={post.toc} variant="inline" />
            <article>
              <div
                className={PROSE}
                // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is escaped/sanitised in lib/blog.ts
                dangerouslySetInnerHTML={{ __html: intro }}
              />
              {sections.map((html, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static list
                <div key={i}>
                  <div
                    className={PROSE}
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is escaped/sanitised in lib/blog.ts
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                  {i === flowAt && flow && <FlowBlock flow={flow} />}
                  {i === chartAt && chart && <ChartBlock chart={chart} />}
                </div>
              ))}
            </article>
          </div>
          <aside className="hidden lg:block">
            <Toc items={post.toc} variant="side" />
          </aside>
        </div>
      </main>
    </>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import type { PostMeta } from "../../../lib/blog";

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export function BlogList({ posts }: { posts: PostMeta[] }) {
  const cats = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];
  const [active, setActive] = useState("All");
  const shown =
    active === "All" ? posts : posts.filter((p) => p.category === active);
  const newest = posts[0]?.slug;

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            className={`rounded-full border border-current/20 px-4 py-1.5 text-sm transition ${active === c ? "bg-current/15 font-semibold" : "opacity-70 hover:opacity-100"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {shown.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-current/15 bg-current/5 transition hover:-translate-y-1"
          >
            {p.cover ? (
              // biome-ignore lint/performance/noImgElement: static export, images are unoptimized
              <img
                src={p.cover}
                alt=""
                loading="lazy"
                className="aspect-[1200/627] w-full object-cover"
              />
            ) : (
              <div className="aspect-[1200/627] w-full bg-gradient-to-br from-indigo-950 to-indigo-700" />
            )}
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-indigo-500/20 px-2.5 py-1 font-semibold">
                  {p.category}
                </span>
                {p.slug === newest && (
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 font-semibold">
                    NEW
                  </span>
                )}
                <span className="opacity-60">
                  {fmt(p.date)} · {p.readTime} min read
                </span>
              </div>
              <h2 className="mt-3 text-xl font-semibold leading-snug">
                {p.title}
              </h2>
              <p className="mt-2 line-clamp-3 opacity-75">{p.description}</p>
              <span className="mt-4 text-sm font-semibold underline-offset-4 group-hover:underline">
                Read more →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

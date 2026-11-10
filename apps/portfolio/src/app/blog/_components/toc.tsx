"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? Math.min(1, window.scrollY / h) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className="fixed left-0 top-0 z-50 h-1 w-full origin-left bg-indigo-500"
      style={{ transform: `scaleX(${p})` }}
    />
  );
}

type Item = { id: string; text: string };

export function Toc({ items, variant }: { items: Item[]; variant: "side" | "inline" }) {
  const [active, setActive] = useState("");

  useEffect(() => {
    if (variant !== "side") return;
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    for (const e of els) io.observe(e);
    return () => io.disconnect();
  }, [items, variant]);

  if (items.length < 3) return null;

  if (variant === "inline") {
    return (
      <details className="my-8 rounded-2xl border border-current/15 p-4 lg:hidden">
        <summary className="cursor-pointer font-semibold">On this page</summary>
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.id}>
              <a href={`#${i.id}`} className="underline-offset-4 hover:underline">
                {i.text}
              </a>
            </li>
          ))}
        </ul>
      </details>
    );
  }

  return (
    <nav className="sticky top-24">
      <p className="text-xs font-bold uppercase tracking-widest opacity-60">
        On this page
      </p>
      <ul className="mt-4 space-y-1 border-l border-current/15 text-sm">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              className={`-ml-px block border-l-2 py-1 pl-4 transition ${
                active === i.id
                  ? "border-indigo-500 font-semibold"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {i.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

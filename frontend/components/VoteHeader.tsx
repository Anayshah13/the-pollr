"use client";

import Link from "next/link";
import { trackCtaClick } from "@/lib/analytics";

interface Props {
  index: string;
  title: React.ReactNode;
  caption: string;
  meta?: React.ReactNode;
}

export function VoteHeader({ index, title, caption, meta }: Props) {
  return (
    <section className="border-b border-ink-700/80 pt-4">
      <div className="flex items-baseline justify-between border-b border-ink-700/80 pb-3">
        <span className="eyebrow eyebrow-lime">{index}</span>
        <Link
          href="/"
          onClick={() =>
            trackCtaClick({
              id: "vote_header_index",
              label: "Index",
              href: "/",
              location: "vote_header",
            })
          }
          className="font-mono text-[10px] uppercase tracking-widest text-ink-300 hover:text-lime"
        >
          ← Index
        </Link>
      </div>
      <div className="grid grid-cols-1 items-start gap-4 py-4 md:items-end md:grid-cols-12">
        <div className="md:col-span-8">
          <h1 className="display text-[clamp(34px,7vw,104px)] text-ink-50">
            {title}
          </h1>
          <p className="italic-display mt-2 max-w-xl text-sm text-ink-200 sm:text-base md:text-lg">
            {caption}
          </p>
        </div>
        <div className="w-full md:col-span-4 md:w-auto md:justify-self-end">{meta}</div>
      </div>
    </section>
  );
}

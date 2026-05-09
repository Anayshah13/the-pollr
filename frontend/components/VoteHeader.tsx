"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VOTE_MODES } from "@/lib/constants";

interface Props {
  index: string;
  title: React.ReactNode;
  caption: string;
  meta?: React.ReactNode;
}

export function VoteHeader({ index, title, caption, meta }: Props) {
  const path = usePathname();
  return (
    <section className="border-b border-ink-100/80 pt-8">
      <div className="flex items-baseline justify-between border-b border-ink-700/80 pb-3">
        <span className="eyebrow eyebrow-lime">{index}</span>
        <Link
          href="/"
          className="font-mono text-[10px] uppercase tracking-widest text-ink-300 hover:text-lime"
        >
          ← Index
        </Link>
      </div>
      <div className="grid grid-cols-1 items-end gap-6 py-6 md:grid-cols-12">
        <div className="md:col-span-8">
          <h1 className="display text-[clamp(56px,10vw,140px)] text-ink-50">
            {title}
          </h1>
          <p className="italic-display text-xl text-ink-200 mt-2 max-w-xl">
            {caption}
          </p>
        </div>
        <div className="md:col-span-4 md:justify-self-end">{meta}</div>
      </div>
      <nav className="flex flex-wrap gap-px bg-ink-700/80">
        {VOTE_MODES.map((m) => {
          const active = path?.startsWith(m.path);
          return (
            <Link
              key={m.id}
              href={m.path}
              className={`flex-1 min-w-[120px] px-4 py-3 text-center font-mono text-[11px] uppercase tracking-widest transition-colors ${
                active
                  ? "bg-ink-50 text-ink-950"
                  : "bg-ink-950 text-ink-300 hover:text-ink-50"
              }`}
            >
              {m.label} <span className="opacity-50">/ {m.system}</span>
            </Link>
          );
        })}
      </nav>
    </section>
  );
}

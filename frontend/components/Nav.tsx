"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, SITE } from "@/lib/constants";

export function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-ink-700/80 bg-ink-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-baseline gap-3 group">
          <span className="display text-3xl text-ink-50 group-hover:text-lime transition-colors">
            Pollr
          </span>
          <span className="hidden md:inline italic-display text-base text-ink-300">
            — {SITE.tagline.toLowerCase()}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => {
            const active =
              l.href === "/" ? path === "/" : path?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors ${
                  active
                    ? "text-lime"
                    : "text-ink-200 hover:text-ink-50"
                }`}
              >
                {l.label}
                {active && (
                  <span className="ml-2 inline-block h-1.5 w-1.5 -translate-y-[2px] rounded-full bg-lime" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline font-mono text-[10px] uppercase tracking-widest text-ink-300">
            {SITE.volume} · {SITE.issue}
          </span>
          <span className="flex items-center gap-2 border border-ink-600 px-2.5 py-1.5">
            <span className="live-dot" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-100">
              Live
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}

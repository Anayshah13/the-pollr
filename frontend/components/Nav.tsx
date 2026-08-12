"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Instagram, Menu, X } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { trackNavClick } from "@/lib/analytics";

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-700/80 bg-ink-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6 md:px-10">
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
                onClick={() =>
                  trackNavClick({
                    label: l.label,
                    href: l.href,
                    surface: "desktop",
                  })
                }
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
          <Link
            href="/committees/social"
            onClick={() =>
              trackNavClick({
                label: "Committees",
                href: "/committees/social",
                surface: "desktop",
              })
            }
            className={`ml-1 inline-flex items-center gap-1.5 border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
              path?.startsWith("/committees/social")
                ? "border-lime/70 bg-lime/[0.08] text-lime"
                : "border-lime/35 text-ink-100 hover:border-lime/60 hover:bg-lime/[0.06] hover:text-lime"
            }`}
          >
            <Instagram size={14} strokeWidth={1.75} className="text-lime/90" aria-hidden />
            Committees
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline font-mono text-[11px] uppercase tracking-[0.22em] text-ink-100">
            {SITE.volume} · {SITE.issue}
          </span>
          <span className="flex items-center gap-2 border border-ink-600 px-2.5 py-1.5">
            <span className="live-dot" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-100">
              Live
            </span>
          </span>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="md:hidden flex h-9 w-9 items-center justify-center border border-ink-600 text-ink-100 hover:border-lime hover:text-lime transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden overflow-hidden border-t border-ink-700/80 transition-[max-height] duration-300 ease-out ${
          open ? "max-h-[480px]" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col px-4 py-3 sm:px-6">
          {NAV_LINKS.map((l) => {
            const active =
              l.href === "/" ? path === "/" : path?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => {
                  trackNavClick({
                    label: l.label,
                    href: l.href,
                    surface: "mobile",
                  });
                  setOpen(false);
                }}
                className={`flex items-center justify-between border-b border-ink-700/80 py-3 font-mono text-[12px] uppercase tracking-widest transition-colors ${
                  active ? "text-lime" : "text-ink-100 hover:text-lime"
                }`}
              >
                <span>{l.label}</span>
                {active && (
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-lime" />
                )}
              </Link>
            );
          })}
          <Link
            href="/committees/social"
            onClick={() => {
              trackNavClick({
                label: "Committees",
                href: "/committees/social",
                surface: "mobile",
              });
              setOpen(false);
            }}
            className={`mt-3 inline-flex w-full items-center justify-center gap-2 border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
              path?.startsWith("/committees/social")
                ? "border-lime/70 bg-lime/[0.08] text-lime"
                : "border-lime/35 text-ink-100 hover:border-lime/60 hover:bg-lime/[0.06] hover:text-lime"
            }`}
          >
            <Instagram size={15} strokeWidth={1.75} className="text-lime/90" aria-hidden />
            Committees on Instagram
          </Link>
          <span className="mt-4 font-mono text-[10px] uppercase tracking-widest text-ink-300">
            {SITE.volume} · {SITE.issue}
          </span>
        </nav>
      </div>
    </header>
  );
}

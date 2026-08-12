import type { Metadata } from "next";
import { Instagram } from "lucide-react";
import {
  CATEGORIES,
  COMMITTEES,
  COMMITTEE_INSTAGRAM_LINKS,
} from "@/lib/constants";
import type { Category } from "@/lib/types";
import { CommitteeImage } from "@/components/CommitteeImage";
import { CategoryChip } from "@/components/CategoryChip";
import { TrackedOutbound } from "@/components/TrackedOutbound";

export const metadata: Metadata = {
  title: "Committees on Instagram — Pollr",
  description:
    "Official Instagram profiles for student chapters, committees, and teams indexed on Pollr.",
};

export default function CommitteesSocialPage() {
  const byCat = (cat: Category) =>
    COMMITTEES.filter((c) => c.category === cat).sort((a, b) =>
      a.shortName.localeCompare(b.shortName)
    );

  const listed = Object.keys(COMMITTEE_INSTAGRAM_LINKS).length;
  const missing = COMMITTEES.filter((c) => !COMMITTEE_INSTAGRAM_LINKS[c.id]);

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
      <section className="border-b border-ink-100/80 pt-4 pb-4 md:pt-5">
        <span className="eyebrow eyebrow-lime">Directory</span>
        <h1 className="mt-2 display text-[clamp(24px,5vw,56px)] leading-[1.05] text-ink-50">
          Committees on <span className="italic-display text-lime">Instagram</span>.
        </h1>
        <p className="mt-2 max-w-2xl italic-display text-sm leading-snug text-ink-200 sm:text-base">
          Direct links to recognized handles. Opens in a new tab.
        </p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-ink-400">
          {listed} of {COMMITTEES.length} committees linked
          {missing.length > 0
            ? ` · Missing: ${missing.map((c) => c.shortName).join(", ")}`
            : ""}
        </p>
      </section>

      {CATEGORIES.map((cat) => {
        const rows = byCat(cat.id);
        if (rows.length === 0) return null;
        return (
          <section key={cat.id} className="border-b border-ink-700/80 py-5 md:py-6">
            <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="eyebrow">{cat.abbr}</span>
                <h2 className="mt-2 display text-3xl text-ink-50 sm:text-4xl">{cat.label}</h2>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-500">
                {rows.length} bodies
              </span>
            </header>
            <ul className="flex flex-wrap justify-center gap-3 md:gap-4">
              {rows.map((c) => {
                const url = COMMITTEE_INSTAGRAM_LINKS[c.id];
                return (
                  <li
                    key={c.id}
                    className="flex w-full flex-col gap-4 border border-ink-700/80 bg-ink-950 p-4 sm:w-[calc(50%-0.75rem)] sm:flex-row sm:items-center sm:justify-between sm:p-5 lg:w-[calc(33.333%-1rem)]"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      <CommitteeImage slug={c.slug} name={c.name} className="h-14 w-14 shrink-0" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="display text-xl text-ink-50">{c.shortName}</h3>
                          <CategoryChip category={c.category} />
                        </div>
                        <p className="mt-1 truncate font-mono text-[11px] uppercase tracking-widest text-ink-500">
                          {c.name}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 sm:pl-2">
                      {url ? (
                        <TrackedOutbound
                          href={url}
                          committeeId={c.id}
                          destination="instagram"
                          className="inline-flex items-center justify-center gap-2 border border-ink-600 bg-ink-900 px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-ink-100 transition-colors hover:border-lime/60 hover:bg-ink-800 hover:text-lime"
                        >
                          <Instagram size={16} strokeWidth={1.75} aria-hidden />
                          Profile
                        </TrackedOutbound>
                      ) : (
                        <span className="inline-flex items-center px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-ink-500">
                          Not listed
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { COMMITTEES, CATEGORIES } from "@/lib/constants";
import type { Category } from "@/lib/types";
import { CommitteeImage } from "@/components/CommitteeImage";
import { CategoryChip } from "@/components/CategoryChip";
import { VoteHeader } from "@/components/VoteHeader";
import { Toast } from "@/components/Toast";

type Filter = "all" | Category;

export default function StarsPage() {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<Filter>("all");
  const [toast, setToast] = useState<{ msg: string; cap?: string } | null>(null);

  const visible = useMemo(
    () =>
      filter === "all"
        ? COMMITTEES
        : COMMITTEES.filter((c) => c.category === filter),
    [filter]
  );

  const setRating = (id: string, val: number, name: string) => {
    setRatings((r) => ({ ...r, [id]: val }));
    setToast({
      msg: "Rating Saved",
      cap: `${name} → ${val}.0 ★`,
    });
    setTimeout(() => setToast(null), 1500);
  };

  const ratedCount = Object.keys(ratings).length;
  const avg =
    ratedCount === 0
      ? 0
      : Object.values(ratings).reduce((a, b) => a + b, 0) / ratedCount;

  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-10">
      <VoteHeader
        index="§ MODE 02 · Stars"
        title={
          <>
            One to <span className="italic-display text-lime">five</span>.
          </>
        }
        caption="A direct, classical rating. Rate any committee on a 1–5 scale. Mean values feed into the unified score with a calibrated weight."
        meta={
          <div className="flex items-center justify-end gap-6">
            <Counter label="Rated" value={`${ratedCount} / ${COMMITTEES.length}`} />
            <Counter label="Your Avg" value={avg ? avg.toFixed(2) : "—"} accent />
          </div>
        }
      />

      <section className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-12">
        {/* FILTERS */}
        <aside className="md:col-span-3">
          <p className="eyebrow mb-4">Filter by category</p>
          <ul className="space-y-px bg-ink-700/80">
            <FilterBtn active={filter === "all"} onClick={() => setFilter("all")} label="All Committees" count={COMMITTEES.length} />
            {CATEGORIES.map((cat) => (
              <FilterBtn
                key={cat.id}
                active={filter === cat.id}
                onClick={() => setFilter(cat.id)}
                label={cat.label}
                count={COMMITTEES.filter((c) => c.category === cat.id).length}
              />
            ))}
          </ul>

          <div className="mt-10">
            <p className="eyebrow mb-3">Distribution</p>
            <RatingDistribution ratings={ratings} />
          </div>
        </aside>

        {/* LIST */}
        <ul className="md:col-span-9 divide-y divide-ink-700/80">
          {visible.map((c) => {
            const value = ratings[c.id] ?? 0;
            return (
              <li
                key={c.id}
                className="grid grid-cols-12 items-center gap-4 py-5"
              >
                <CommitteeImage
                  slug={c.slug}
                  name={c.name}
                  className="col-span-2 md:col-span-1 h-14 w-14"
                />
                <div className="col-span-10 md:col-span-5">
                  <h3 className="text-lg text-ink-50">{c.name}</h3>
                  <div className="mt-1.5 flex items-center gap-2">
                    <CategoryChip category={c.category} />
                    <span className="italic-display text-sm text-ink-300 truncate">
                      “{c.tagline}”
                    </span>
                  </div>
                </div>
                <div className="col-span-7 md:col-span-4">
                  <StarRow value={value} onSet={(n) => setRating(c.id, n, c.shortName)} />
                </div>
                <div className="col-span-5 md:col-span-2 text-right">
                  <span
                    className={`stat-num text-2xl ${
                      value > 0 ? "text-lime" : "text-ink-500"
                    }`}
                  >
                    {value > 0 ? `${value}.0` : "—"}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <Toast show={!!toast} message={toast?.msg ?? ""} caption={toast?.cap} />
    </div>
  );
}

function StarRow({ value, onSet }: { value: number; onSet: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div
      className="flex items-center gap-1"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= display;
        return (
          <button
            key={n}
            onMouseEnter={() => setHover(n)}
            onClick={() => onSet(n)}
            className="p-1.5 transition-transform hover:scale-110"
            aria-label={`${n} stars`}
          >
            <Star
              size={22}
              strokeWidth={1.25}
              className={
                filled
                  ? "fill-lime stroke-lime"
                  : "fill-transparent stroke-ink-500"
              }
            />
          </button>
        );
      })}
    </div>
  );
}

function FilterBtn({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${
          active
            ? "bg-ink-50 text-ink-950"
            : "bg-ink-950 text-ink-200 hover:bg-ink-900 hover:text-ink-50"
        }`}
      >
        <span className="font-mono text-[11px] uppercase tracking-widest">
          {label}
        </span>
        <span
          className={`stat-num text-xs ${
            active ? "text-ink-950" : "text-ink-400"
          }`}
        >
          {count}
        </span>
      </button>
    </li>
  );
}

function Counter({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="text-right">
      <p className="eyebrow">{label}</p>
      <p className={`stat-num text-2xl mt-1 ${accent ? "text-lime" : "text-ink-50"}`}>
        {value}
      </p>
    </div>
  );
}

function RatingDistribution({ ratings }: { ratings: Record<string, number> }) {
  const buckets = [0, 0, 0, 0, 0];
  Object.values(ratings).forEach((v) => {
    if (v >= 1 && v <= 5) buckets[v - 1]++;
  });
  const max = Math.max(1, ...buckets);
  return (
    <ul className="space-y-2">
      {buckets.map((b, i) => (
        <li key={i} className="flex items-center gap-3 text-xs">
          <span className="font-mono text-ink-400 w-4">{i + 1}</span>
          <Star size={12} className="fill-lime stroke-lime" />
          <span className="relative flex-1 h-2 bg-ink-800 overflow-hidden">
            <span
              className="absolute inset-y-0 left-0 bg-lime"
              style={{ width: `${(b / max) * 100}%` }}
            />
          </span>
          <span className="stat-num text-ink-300 w-6 text-right">{b}</span>
        </li>
      ))}
    </ul>
  );
}

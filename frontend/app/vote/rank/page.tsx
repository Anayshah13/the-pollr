"use client";

import { useState } from "react";
import { Reorder } from "framer-motion";
import { ArrowUp, ArrowDown, RotateCcw, Save, Filter as FilterIcon } from "lucide-react";
import { COMMITTEES, CATEGORIES } from "@/lib/constants";
import type { Category, Committee } from "@/lib/types";
import { ApiError, ensureSession, submitRankBallot } from "@/lib/api";
import { CommitteeImage } from "@/components/CommitteeImage";
import { CategoryChip } from "@/components/CategoryChip";
import { VoteHeader } from "@/components/VoteHeader";
import { Toast } from "@/components/Toast";
import {
  trackRankFilterChange,
  trackRankReset,
  trackRankSubmit,
} from "@/lib/analytics";

type FilterValue = "all" | Category;

function listFor(filter: FilterValue): Committee[] {
  return filter === "all" ? [...COMMITTEES] : COMMITTEES.filter((c) => c.category === filter);
}

export default function RankPage() {
  const [filter, setFilter] = useState<FilterValue>("Clubs");
  const [orders, setOrders] = useState<Record<FilterValue, Committee[]>>(() => ({
    all: listFor("all"),
    "Student Chapters": listFor("Student Chapters"),
    "Tech Committees": listFor("Tech Committees"),
    Clubs: listFor("Clubs"),
    "SAE Teams": listFor("SAE Teams"),
    "IETE Teams": listFor("IETE Teams"),
  }));
  const [toast, setToast] = useState<{ msg: string; cap?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const items = orders[filter];

  const setItems = (updater: Committee[] | ((prev: Committee[]) => Committee[])) => {
    setOrders((prev) => {
      const current = prev[filter];
      const next = typeof updater === "function" ? updater(current) : updater;
      return { ...prev, [filter]: next };
    });
  };

  const onChangeFilter = (f: FilterValue) => {
    trackRankFilterChange(f);
    setFilter(f);
  };

  const moveBy = (id: string, delta: number) => {
    setItems((arr) => {
      const i = arr.findIndex((x) => x.id === id);
      if (i === -1) return arr;
      const j = Math.max(0, Math.min(arr.length - 1, i + delta));
      if (i === j) return arr;
      const copy = [...arr];
      const [removed] = copy.splice(i, 1);
      copy.splice(j, 0, removed);
      return copy;
    });
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    trackRankSubmit({
      filter,
      itemCount: items.length,
      rankingIds: items.map((c) => c.id),
    });
    try {
      await ensureSession();
      await submitRankBallot(filter, items.map((c) => c.id));
      setToast({
        msg: "Ranking Saved",
        cap: `${items.length} committees · #1 ${items[0]?.shortName ?? "—"}`,
      });
    } catch (err) {
      const detail = err instanceof ApiError ? err.detail : "Could not save ranking";
      setToast({ msg: "Save Failed", cap: detail });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 2200);
    }
  };

  const reset = () => {
    trackRankReset(filter);
    setItems(listFor(filter));
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-10">
      <VoteHeader
        index="§ MODE 03 · Rank"
        title={
          <>
            In strict <span className="italic-display text-lime">order</span>.
          </>
        }
        caption="Order the list top to bottom. Position scores map linearly from +100 to −100, then shrink by sample size into the Pollr Score."
        meta={
          <div className="flex items-center justify-end gap-3">
            <button onClick={reset} className="btn-ghost flex items-center gap-2" disabled={submitting}>
              <RotateCcw size={14} /> Reset
            </button>
            <button onClick={submit} className="btn-lime flex items-center gap-2" disabled={submitting}>
              <Save size={14} /> {submitting ? "Saving…" : "Submit Order"}
            </button>
          </div>
        }
      />

      <section className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">
        {/* CATEGORY FILTER */}
        <aside className="md:col-span-3">
          <p className="eyebrow mb-4 flex items-center gap-2"><FilterIcon size={11} /> Category</p>
          <ul className="-mx-4 flex gap-px overflow-x-auto bg-ink-700/80 px-4 no-scrollbar sm:mx-0 sm:px-0 md:flex-col md:overflow-visible">
            <FilterBtn active={filter === "all"} onClick={() => onChangeFilter("all")} label="All Committees" count={COMMITTEES.length} />
            {CATEGORIES.map((cat) => (
              <FilterBtn
                key={cat.id}
                active={filter === cat.id}
                onClick={() => onChangeFilter(cat.id)}
                label={cat.label}
                count={COMMITTEES.filter((c) => c.category === cat.id).length}
              />
            ))}
          </ul>

          <div className="mt-8 border border-ink-700/80 p-4 md:mt-10">
            <p className="eyebrow mb-2">Position Score Preview</p>
            <p className="italic-display text-sm text-ink-300 mb-4 leading-snug">
              #1 earns +100; last earns −100. Mid ranks fall on a straight line.
              Rankings are saved per category (or All).
            </p>
            <ScorePreview n={items.length} />
          </div>
        </aside>

        {/* RANKED LIST */}
        <div className="md:col-span-9">
          <header className="flex items-baseline justify-between border-b border-ink-100/80 pb-3">
            <span className="eyebrow eyebrow-lime">
              Your Ranking · {filter === "all" ? "All" : filter}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
              {items.length} positions
            </span>
          </header>

          <Reorder.Group
            axis="y"
            values={items}
            onReorder={setItems}
            className="divide-y divide-ink-700/80"
          >
            {items.map((c, idx) => (
              <RankRow
                key={c.id}
                item={c}
                index={idx}
                total={items.length}
                onUp={() => moveBy(c.id, -1)}
                onDown={() => moveBy(c.id, 1)}
              />
            ))}
          </Reorder.Group>
        </div>
      </section>

      <Toast show={!!toast} message={toast?.msg ?? ""} caption={toast?.cap} />
    </div>
  );
}

function RankRow({
  item,
  index,
  total,
  onUp,
  onDown,
}: {
  item: Committee;
  index: number;
  total: number;
  onUp: () => void;
  onDown: () => void;
}) {
  const positionScore = total <= 1 ? 0 : 100 - (200 * index) / (total - 1);
  const positionWeight = ((positionScore + 100) / 200) * 100;

  return (
    <Reorder.Item
      value={item}
      whileDrag={{
        boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
        backgroundColor: "#101010",
      }}
      className="flex cursor-grab flex-col gap-3 py-4 select-none active:cursor-grabbing md:grid md:grid-cols-12 md:items-center md:gap-3"
    >
      {/* Row 1 on mobile / merged on desktop */}
      <div className="flex items-center gap-3 md:contents">
        {/* Rank number */}
        <span className="stat-num text-2xl text-ink-300 w-8 shrink-0 md:col-span-1 md:text-3xl md:w-auto">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Committee */}
        <CommitteeImage
          slug={item.slug}
          name={item.name}
          className="h-10 w-10 shrink-0 md:col-span-1 md:h-12 md:w-12"
        />
        <div className="flex-1 min-w-0 md:col-span-5">
          <p className="truncate text-sm text-ink-50 md:text-base">{item.name}</p>
          <div className="mt-1 flex items-center gap-2 min-w-0">
            <CategoryChip category={item.category} />
            <span className="italic-display text-sm text-ink-300 truncate">
              {item.tagline}
            </span>
          </div>
        </div>
      </div>

      {/* Borda weight bar */}
      <div className="hidden md:col-span-3 md:block">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-ink-400 w-12">
            Weight
          </span>
          <div className="relative h-1 flex-1 bg-ink-800">
            <span
              className="absolute inset-y-0 left-0 bg-lime"
              style={{ width: `${positionWeight}%` }}
            />
          </div>
          <span className="stat-num text-[10px] text-ink-300 w-10 text-right">
            {positionScore >= 0 ? "+" : ""}
            {positionScore.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 md:col-span-2 md:gap-1">
        <button
          onClick={onUp}
          disabled={index === 0}
          className="flex h-10 w-10 items-center justify-center border border-lime/60 bg-ink-900 text-lime hover:bg-lime hover:text-ink-950 disabled:opacity-25 md:h-auto md:w-auto md:p-2"
          aria-label="Move up"
        >
          <ArrowUp size={18} strokeWidth={2.25} />
        </button>
        <button
          onClick={onDown}
          disabled={index === total - 1}
          className="flex h-10 w-10 items-center justify-center border border-lime/60 bg-ink-900 text-lime hover:bg-lime hover:text-ink-950 disabled:opacity-25 md:h-auto md:w-auto md:p-2"
          aria-label="Move down"
        >
          <ArrowDown size={18} strokeWidth={2.25} />
        </button>
      </div>
    </Reorder.Item>
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
    <li className="flex">
      <button
        onClick={onClick}
        className={`flex w-full items-center justify-between gap-3 whitespace-nowrap px-4 py-3 text-left transition-colors ${
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
function ScorePreview({ n }: { n: number }) {
  const pts = Array.from({ length: Math.min(8, n) }, (_, i) => {
    const score = n <= 1 ? 0 : 100 - (200 * i) / (n - 1);
    const bar = ((score + 100) / 200) * 100;
    return { rank: i + 1, score, bar };
  });
  return (
    <ul className="space-y-1.5">
      {pts.map((p) => (
        <li key={p.rank} className="flex items-center gap-2 text-xs">
          <span className="font-mono text-ink-400 w-6">#{p.rank}</span>
          <span className="relative flex-1 h-1 bg-ink-800">
            <span
              className="absolute inset-y-0 left-0 bg-lime"
              style={{ width: `${p.bar}%` }}
            />
          </span>
          <span className="stat-num text-ink-300 w-10 text-right">
            {p.score >= 0 ? "+" : ""}
            {p.score.toFixed(0)}
          </span>
        </li>
      ))}
    </ul>
  );
}


"use client";

import { useMemo, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, ArrowUp, ArrowDown, RotateCcw, Save, Filter as FilterIcon } from "lucide-react";
import { COMMITTEES, CATEGORIES } from "@/lib/constants";
import type { Category, Committee } from "@/lib/types";
import { CommitteeImage } from "@/components/CommitteeImage";
import { CategoryChip } from "@/components/CategoryChip";
import { VoteHeader } from "@/components/VoteHeader";
import { Toast } from "@/components/Toast";

type FilterValue = "all" | Category;

export default function RankPage() {
  const [filter, setFilter] = useState<FilterValue>("Clubs");
  const [items, setItems] = useState<Committee[]>(() =>
    COMMITTEES.filter((c) => c.category === "Clubs")
  );
  const [toast, setToast] = useState<{ msg: string; cap?: string } | null>(null);

  const onChangeFilter = (f: FilterValue) => {
    setFilter(f);
    const next = f === "all" ? COMMITTEES : COMMITTEES.filter((c) => c.category === f);
    setItems(next);
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

  const submit = () => {
    setToast({
      msg: "Ranking Saved",
      cap: `${items.length} committees ordered · #1 ${items[0]?.shortName ?? "—"}`,
    });
    setTimeout(() => setToast(null), 1800);
  };

  const reset = () => {
    const base = filter === "all" ? COMMITTEES : COMMITTEES.filter((c) => c.category === filter);
    setItems(base);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-10">
      <VoteHeader
        index="§ MODE 04 · Rank"
        title={
          <>
            In strict <span className="italic-display text-lime">order</span>.
          </>
        }
        caption="The Borda input. Drag rows to reorder, or use the arrows. Position-weighted scoring transforms ordinal rank into a continuous signal."
        meta={
          <div className="flex items-center justify-end gap-3">
            <button onClick={reset} className="btn-ghost flex items-center gap-2">
              <RotateCcw size={14} /> Reset
            </button>
            <button onClick={submit} className="btn-lime flex items-center gap-2">
              <Save size={14} /> Submit Order
            </button>
          </div>
        }
      />

      <section className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-12">
        {/* CATEGORY FILTER */}
        <aside className="md:col-span-3">
          <p className="eyebrow mb-4 flex items-center gap-2"><FilterIcon size={11} /> Category</p>
          <ul className="space-y-px bg-ink-700/80">
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

          <div className="mt-10 border border-ink-700/80 p-4">
            <p className="eyebrow mb-2">Borda Score Preview</p>
            <p className="italic-display text-sm text-ink-300 mb-4 leading-snug">
              Top of list earns full weight; bottom earns near-zero. Mid-rank
              weight decays quadratically.
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
  const controls = useDragControls();
  const positionWeight = ((total - index) / total) * 100;

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      whileDrag={{
        boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
        backgroundColor: "#101010",
      }}
      className="grid grid-cols-12 items-center gap-3 py-4 select-none"
    >
      {/* Rank number */}
      <span className="col-span-1 stat-num text-3xl text-ink-300">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Committee */}
      <CommitteeImage
        slug={item.slug}
        name={item.name}
        className="col-span-1 h-12 w-12"
      />
      <div className="col-span-5">
        <p className="text-base text-ink-50">{item.name}</p>
        <div className="mt-1 flex items-center gap-2">
          <CategoryChip category={item.category} />
          <span className="italic-display text-sm text-ink-300 truncate">
            {item.tagline}
          </span>
        </div>
      </div>

      {/* Borda weight bar */}
      <div className="col-span-3 hidden md:block">
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
          <span className="stat-num text-[10px] text-ink-300 w-8 text-right">
            {positionWeight.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="col-span-2 flex items-center justify-end gap-1">
        <button
          onClick={onUp}
          disabled={index === 0}
          className="border border-ink-700 p-2 hover:border-lime disabled:opacity-25"
          aria-label="Move up"
        >
          <ArrowUp size={14} />
        </button>
        <button
          onClick={onDown}
          disabled={index === total - 1}
          className="border border-ink-700 p-2 hover:border-lime disabled:opacity-25"
          aria-label="Move down"
        >
          <ArrowDown size={14} />
        </button>
        <button
          onPointerDown={(e) => controls.start(e)}
          className="cursor-grab border border-ink-700 p-2 hover:border-lime active:cursor-grabbing"
          aria-label="Drag handle"
        >
          <GripVertical size={14} />
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

function ScorePreview({ n }: { n: number }) {
  const pts = Array.from({ length: Math.min(8, n) }, (_, i) => {
    const w = Math.pow((n - i) / n, 1.4) * 100;
    return { rank: i + 1, w };
  });
  return (
    <ul className="space-y-1.5">
      {pts.map((p) => (
        <li key={p.rank} className="flex items-center gap-2 text-xs">
          <span className="font-mono text-ink-400 w-6">#{p.rank}</span>
          <span className="relative flex-1 h-1 bg-ink-800">
            <span
              className="absolute inset-y-0 left-0 bg-lime"
              style={{ width: `${p.w}%` }}
            />
          </span>
          <span className="stat-num text-ink-300 w-8 text-right">
            {p.w.toFixed(0)}
          </span>
        </li>
      ))}
    </ul>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Shuffle, RotateCcw } from "lucide-react";
import { COMMITTEES, TIERS, type TierId } from "@/lib/constants";
import { CommitteeImage } from "@/components/CommitteeImage";
import { VoteHeader } from "@/components/VoteHeader";
import { Toast } from "@/components/Toast";

type Bucket = "pool" | TierId;

export default function TierPage() {
  const initial = useMemo<Record<Bucket, string[]>>(
    () => ({
      pool: COMMITTEES.map((c) => c.id),
      S: [],
      A: [],
      B: [],
      C: [],
      D: [],
      F: [],
    }),
    []
  );

  const [buckets, setBuckets] = useState<Record<Bucket, string[]>>(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [hoverBucket, setHoverBucket] = useState<Bucket | null>(null);
  const [toast, setToast] = useState<{ msg: string; cap?: string } | null>(null);

  const move = (id: string, target: Bucket) => {
    setBuckets((prev) => {
      const next: Record<Bucket, string[]> = { ...prev };
      (Object.keys(next) as Bucket[]).forEach((k) => {
        next[k] = next[k].filter((x) => x !== id);
      });
      next[target] = [...next[target], id];
      return next;
    });
    const c = COMMITTEES.find((x) => x.id === id);
    if (target !== "pool" && c) {
      setToast({ msg: "Tier Updated", cap: `${c.shortName} → Tier ${target}` });
      setTimeout(() => setToast(null), 1400);
    }
  };

  const reset = () => setBuckets(initial);

  const shuffle = () => {
    const ids = COMMITTEES.map((c) => c.id);
    const tiers: TierId[] = ["S", "A", "B", "C", "D", "F"];
    const next: Record<Bucket, string[]> = { pool: [], S: [], A: [], B: [], C: [], D: [], F: [] };
    ids.forEach((id, i) => {
      const t = tiers[i % tiers.length];
      next[t].push(id);
    });
    setBuckets(next);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-10">
      <VoteHeader
        index="§ MODE 03 · Tier"
        title={
          <>
            S to <span className="italic-display text-lime">F</span>.
          </>
        }
        caption="Bucketed sentiment. Drag any committee from the pool into one of six tiers. The bucket signal is normalised across users."
        meta={
          <div className="flex items-center justify-end gap-4">
            <button onClick={shuffle} className="btn-ghost flex items-center gap-2">
              <Shuffle size={14} /> Auto-Spread
            </button>
            <button onClick={reset} className="btn-ghost flex items-center gap-2">
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        }
      />

      {/* TIER ROWS */}
      <section className="mt-10 space-y-px bg-ink-700/80">
        {TIERS.map((t) => (
          <TierRow
            key={t.id}
            tier={t}
            ids={buckets[t.id]}
            onDropId={(id) => move(id, t.id)}
            isHover={hoverBucket === t.id}
            setHover={(h) => setHoverBucket(h ? t.id : null)}
            onDrag={(id) => setDragId(id)}
            dragging={dragId}
          />
        ))}
      </section>

      {/* POOL */}
      <section
        onDragOver={(e) => {
          e.preventDefault();
          setHoverBucket("pool");
        }}
        onDragLeave={() => setHoverBucket(null)}
        onDrop={(e) => {
          e.preventDefault();
          const id = e.dataTransfer.getData("text/plain");
          if (id) move(id, "pool");
          setHoverBucket(null);
          setDragId(null);
        }}
        className={`mt-10 border ${
          hoverBucket === "pool" ? "border-lime" : "border-ink-700"
        } bg-ink-900 p-6`}
      >
        <header className="mb-4 flex items-center justify-between border-b border-ink-700/80 pb-3">
          <span className="eyebrow">Pool · Unranked</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
            {buckets.pool.length} remaining
          </span>
        </header>

        <div className="flex flex-wrap gap-3">
          {buckets.pool.length === 0 && (
            <p className="italic-display text-lg text-ink-300">
              All committees have been tiered. Bravo.
            </p>
          )}
          {buckets.pool.map((id) => (
            <DraggableChip
              key={id}
              id={id}
              compact={false}
              onDragStart={() => setDragId(id)}
              onDragEnd={() => setDragId(null)}
              isDragging={dragId === id}
            />
          ))}
        </div>
      </section>

      <Toast show={!!toast} message={toast?.msg ?? ""} caption={toast?.cap} />
    </div>
  );
}

function TierRow({
  tier,
  ids,
  onDropId,
  isHover,
  setHover,
  onDrag,
  dragging,
}: {
  tier: { id: TierId; label: string; caption: string; accent: string };
  ids: string[];
  onDropId: (id: string) => void;
  isHover: boolean;
  setHover: (h: boolean) => void;
  onDrag: (id: string | null) => void;
  dragging: string | null;
}) {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        if (id) onDropId(id);
        setHover(false);
        onDrag(null);
      }}
      className={`grid grid-cols-12 items-stretch gap-0 bg-ink-950 transition-colors ${
        isHover ? "bg-ink-900" : ""
      }`}
    >
      {/* Tier label */}
      <div
        className="col-span-2 flex flex-col items-center justify-center border-r border-ink-700/80 px-4 py-6 md:col-span-1"
        style={{ background: `${tier.accent}11` }}
      >
        <span
          className="display text-7xl leading-none"
          style={{ color: tier.accent }}
        >
          {tier.label}
        </span>
        <span className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-300">
          {tier.caption}
        </span>
      </div>

      {/* drop zone */}
      <div
        className={`col-span-10 md:col-span-11 flex flex-wrap items-center gap-2.5 px-4 py-4 ${
          isHover ? "outline outline-1 -outline-offset-2 outline-lime" : ""
        }`}
        style={{ minHeight: 96 }}
      >
        {ids.length === 0 && (
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">
            Drag committees here · {tier.caption}
          </p>
        )}
        {ids.map((id) => (
          <DraggableChip
            key={id}
            id={id}
            compact
            onDragStart={() => onDrag(id)}
            onDragEnd={() => onDrag(null)}
            isDragging={dragging === id}
          />
        ))}
      </div>
    </div>
  );
}

function DraggableChip({
  id,
  compact,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  id: string;
  compact: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  const c = COMMITTEES.find((x) => x.id === id);
  if (!c) return null;
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={`group flex cursor-grab items-center gap-2 border border-ink-700 bg-ink-900 px-2 py-1.5 transition-all hover:border-lime active:cursor-grabbing ${
        isDragging ? "opacity-30 border-lime" : ""
      }`}
      title={c.name}
    >
      <CommitteeImage
        slug={c.slug}
        name={c.name}
        className={compact ? "h-7 w-7" : "h-9 w-9"}
      />
      <span
        className={`text-ink-100 ${
          compact ? "text-xs" : "text-sm"
        } group-hover:text-lime`}
      >
        {c.shortName}
      </span>
    </div>
  );
}

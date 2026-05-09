"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, SkipForward, Undo2 } from "lucide-react";
import { COMMITTEES } from "@/lib/constants";
import type { Committee } from "@/lib/types";
import { CommitteeImage } from "@/components/CommitteeImage";
import { CategoryChip } from "@/components/CategoryChip";
import { VoteHeader } from "@/components/VoteHeader";
import { Toast } from "@/components/Toast";

/* Build a deterministic pairing list from constants */
function buildPairs(): [Committee, Committee][] {
  const pairs: [Committee, Committee][] = [];
  const list = [...COMMITTEES];
  for (let i = 0; i < list.length - 1; i += 2) {
    pairs.push([list[i], list[i + 1]]);
  }
  // some cross-category showdowns
  const crossA = ["arya", "infomatrix", "ieee", "ecell", "racing"];
  const crossB = ["dhadak", "tedx", "acm", "iic", "karting"];
  for (let i = 0; i < crossA.length; i++) {
    const a = COMMITTEES.find((c) => c.id === crossA[i]);
    const b = COMMITTEES.find((c) => c.id === crossB[i]);
    if (a && b) pairs.push([a, b]);
  }
  return pairs;
}

export default function SwipePage() {
  const pairs = useMemo(buildPairs, []);
  const [idx, setIdx] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [toast, setToast] = useState<{ msg: string; cap?: string } | null>(null);

  const current = pairs[idx];
  const next = pairs[idx + 1];

  const recordVote = (winner: Committee | null, loser: Committee | null) => {
    if (winner && loser) {
      setHistory((h) => [`${winner.shortName} > ${loser.shortName}`, ...h].slice(0, 8));
      setToast({
        msg: "Vote Recorded",
        cap: `${winner.shortName} chosen over ${loser.shortName}`,
      });
    } else {
      setToast({ msg: "Pair Skipped" });
    }
    setTimeout(() => setToast(null), 1800);
    setIdx((i) => Math.min(i + 1, pairs.length - 1));
  };

  const undo = () => {
    setIdx((i) => Math.max(0, i - 1));
    setHistory((h) => h.slice(1));
  };

  const isDone = idx >= pairs.length - 1 && history.length > 0;

  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-10">
      <VoteHeader
        index="§ MODE 01 · Swipe"
        title={
          <>
            Pairwise<span className="italic-display text-lime">.</span>
          </>
        }
        caption="Two committees enter, one leaves. Each decision feeds the ELO model — fast, intuitive, weighted by relative strength."
        meta={
          <div className="flex items-center justify-end gap-6">
            <Counter label="Pair" value={`${idx + 1} / ${pairs.length}`} />
            <Counter label="Decisions" value={`${history.length}`} accent />
          </div>
        }
      />

      {/* DECK */}
      <section className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-12">
        {/* Left rail — instructions / history */}
        <aside className="md:col-span-3 order-2 md:order-1">
          <p className="eyebrow mb-4">How to vote</p>
          <ol className="space-y-3 text-sm text-ink-200">
            <Tip n="01">Drag the top card LEFT or RIGHT.</Tip>
            <Tip n="02">Or use the choice buttons below.</Tip>
            <Tip n="03">Skip if undecided. Votes are anonymous.</Tip>
          </ol>

          <div className="mt-10">
            <p className="eyebrow mb-3">Recent decisions</p>
            <ul className="space-y-2 font-mono text-xs">
              {history.length === 0 && (
                <li className="text-ink-400">— No decisions yet —</li>
              )}
              {history.map((h, i) => (
                <li
                  key={i}
                  className="border-b border-ink-700/70 pb-1.5 text-ink-200"
                >
                  <span className="text-ink-500">[{String(history.length - i).padStart(2, "0")}]</span>{" "}
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* CARD STAGE */}
        <div className="md:col-span-9 order-1 md:order-2">
          {isDone ? (
            <FinishedState onReset={() => { setIdx(0); setHistory([]); }} />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <SwipeCard
                committee={current[0]}
                side="left"
                onChoose={() => recordVote(current[0], current[1])}
              />
              <SwipeCard
                committee={current[1]}
                side="right"
                onChoose={() => recordVote(current[1], current[0])}
              />
            </div>
          )}

          {!isDone && (
            <div className="mt-8 grid grid-cols-2 gap-px bg-ink-700/80 md:grid-cols-4">
              <ActionBtn
                onClick={() => recordVote(current[0], current[1])}
                icon={<ArrowLeft size={16} />}
                label="Pick Left"
                primary
              />
              <ActionBtn
                onClick={() => recordVote(null, null)}
                icon={<SkipForward size={16} />}
                label="Skip"
              />
              <ActionBtn
                onClick={undo}
                icon={<Undo2 size={16} />}
                label="Undo"
                disabled={idx === 0}
              />
              <ActionBtn
                onClick={() => recordVote(current[1], current[0])}
                icon={<ArrowRight size={16} />}
                label="Pick Right"
                primary
              />
            </div>
          )}

          {/* Up next preview */}
          {next && !isDone && (
            <div className="mt-8 flex items-center gap-4 border border-ink-700/80 px-4 py-3">
              <span className="eyebrow">Up next</span>
              <div className="flex items-center gap-2">
                <CommitteeImage slug={next[0].slug} name={next[0].name} className="h-7 w-7" />
                <span className="text-sm text-ink-200">{next[0].shortName}</span>
              </div>
              <span className="font-mono text-xs text-ink-400">vs</span>
              <div className="flex items-center gap-2">
                <CommitteeImage slug={next[1].slug} name={next[1].name} className="h-7 w-7" />
                <span className="text-sm text-ink-200">{next[1].shortName}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <Toast show={!!toast} message={toast?.msg ?? ""} caption={toast?.cap} />
    </div>
  );
}

function SwipeCard({
  committee,
  side,
  onChoose,
}: {
  committee: Committee;
  side: "left" | "right";
  onChoose: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);
  const limeOpacity = useTransform(x, side === "left" ? [-180, -40, 0] : [0, 40, 180], side === "left" ? [1, 0, 0] : [0, 0, 1]);
  const emberOpacity = useTransform(x, side === "left" ? [0, 40, 180] : [-180, -40, 0], side === "left" ? [0, 0, 1] : [1, 0, 0]);
  const [exiting, setExiting] = useState(false);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 110;
    const dirRight = info.offset.x > threshold;
    const dirLeft = info.offset.x < -threshold;
    if ((side === "left" && dirRight) || (side === "right" && dirLeft)) {
      setExiting(true);
      setTimeout(() => {
        onChoose();
        setExiting(false);
        x.set(0);
      }, 180);
    } else {
      x.set(0);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.article
        key={committee.id}
        drag="x"
        style={{ x, rotate }}
        onDragEnd={handleDragEnd}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        whileTap={{ cursor: "grabbing" }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: exiting ? 0 : 1, y: 0, scale: exiting ? 0.92 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring", damping: 24, stiffness: 220 }}
        className="relative flex cursor-grab flex-col overflow-hidden border border-ink-700/80 bg-ink-900 select-none"
      >
        <motion.span
          style={{ opacity: limeOpacity }}
          className="pointer-events-none absolute inset-0 z-10 border-2 border-lime"
        />
        <motion.span
          style={{ opacity: emberOpacity }}
          className="pointer-events-none absolute inset-0 z-10 border-2 border-ember"
        />

        <div className="relative h-72 w-full overflow-hidden bg-ink-800 md:h-80">
          <img
            src={`/committee_imgs/${committee.slug}.jpg`}
            alt={committee.name}
            className="h-full w-full object-cover"
            draggable={false}
          />
          <span className="absolute left-3 top-3">
            <CategoryChip category={committee.category} />
          </span>
          <span className="absolute right-3 top-3 border border-ink-50/40 bg-ink-950/60 px-2 py-1 backdrop-blur">
            <span className="stat-num text-xs text-ink-50">{committee.elo}</span>
            <span className="ml-1 font-mono text-[9px] uppercase tracking-widest text-ink-300">
              elo
            </span>
          </span>
        </div>

        <div className="p-5">
          <h3 className="display text-4xl text-ink-50">{committee.name}</h3>
          <p className="italic-display text-base text-ink-300 mt-1">
            “{committee.tagline}”
          </p>

          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-ink-700/80 pt-4">
            <Mini label="Win Rate" value={`${committee.winRate.toFixed(0)}%`} />
            <Mini label="Votes" value={committee.totalVotes.toLocaleString()} />
            <Mini label="Δ Week" value={`${committee.delta >= 0 ? "+" : ""}${committee.delta}`} accent={committee.delta >= 0} />
          </div>

          <button
            onClick={onChoose}
            className="mt-5 w-full border border-lime/40 py-3 font-mono text-[11px] uppercase tracking-widest text-lime transition-colors hover:bg-lime hover:text-ink-950"
          >
            Choose {committee.shortName} →
          </button>
        </div>
      </motion.article>
    </AnimatePresence>
  );
}

/* ---- bits ---- */

function Counter({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-right">
      <p className="eyebrow">{label}</p>
      <p className={`stat-num text-2xl mt-1 ${accent ? "text-lime" : "text-ink-50"}`}>{value}</p>
    </div>
  );
}

function Tip({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">{n}</span>
      <span className="leading-snug">{children}</span>
    </li>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className={`stat-num text-base mt-0.5 ${accent ? "text-lime" : "text-ink-50"}`}>{value}</p>
    </div>
  );
}

function ActionBtn({
  onClick,
  icon,
  label,
  primary,
  disabled,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-4 py-4 font-mono text-[11px] uppercase tracking-widest transition-colors disabled:opacity-30 ${
        primary
          ? "bg-ink-50 text-ink-950 hover:bg-lime"
          : "bg-ink-950 text-ink-100 hover:bg-ink-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function FinishedState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center border border-lime bg-ink-900 px-8 py-20 text-center">
      <span className="eyebrow eyebrow-lime">Session complete</span>
      <h3 className="mt-4 display text-7xl text-ink-50">
        That's a <span className="italic-display text-lime">wrap</span>.
      </h3>
      <p className="mt-3 italic-display text-lg text-ink-300 max-w-md">
        Every preference has been logged into the ELO matrix. Run another set or
        switch modalities.
      </p>
      <button onClick={onReset} className="btn-lime mt-6">
        Reset Session
      </button>
    </div>
  );
}

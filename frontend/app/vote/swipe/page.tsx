"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, SkipForward, Undo2 } from "lucide-react";
import { COMMITTEES } from "@/lib/constants";
import type { Committee } from "@/lib/types";
import { ApiError, ensureSession, submitSwipeVote } from "@/lib/api";
import { CommitteeImage } from "@/components/CommitteeImage";
import { CategoryChip } from "@/components/CategoryChip";
import { VoteHeader } from "@/components/VoteHeader";
import { Toast } from "@/components/Toast";
import {
  trackSwipeSessionComplete,
  trackSwipeSessionReset,
  trackSwipeSkip,
  trackSwipeUndo,
  trackSwipeVote,
} from "@/lib/analytics";

type HistoryEntry = {
  label: string;
  winnerId: string | null;
  loserId: string | null;
  skipped: boolean;
  persisted: boolean;
};

function buildPairs(): [Committee, Committee][] {
  const pairs: [Committee, Committee][] = [];
  const list = [...COMMITTEES];
  for (let i = 0; i < list.length - 1; i += 2) {
    pairs.push([list[i], list[i + 1]]);
  }
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
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [toast, setToast] = useState<{ msg: string; cap?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const sessionReady = useRef(false);

  const current = pairs[idx];
  const next = pairs[idx + 1];
  const decisions = history.filter((h) => !h.skipped).length;

  useEffect(() => {
    ensureSession()
      .then(() => {
        sessionReady.current = true;
      })
      .catch(() => {
        setToast({ msg: "API offline", cap: "Start the Pollr API to save votes" });
        setTimeout(() => setToast(null), 2800);
      });
  }, []);

  const recordVote = async (
    winner: Committee | null,
    loser: Committee | null,
    method: "swipe" | "button" | "card" = "button"
  ) => {
    if (busy) return;
    setBusy(true);

    if (winner && loser) {
      trackSwipeVote({
        winnerId: winner.id,
        loserId: loser.id,
        winnerCategory: winner.category,
        loserCategory: loser.category,
        pairIndex: idx,
        method,
      });

      let persisted = false;
      try {
        if (!sessionReady.current) await ensureSession();
        await submitSwipeVote(winner.id, loser.id);
        persisted = true;
        setToast({
          msg: "Vote Saved",
          cap: `${winner.shortName} over ${loser.shortName}`,
        });
      } catch (err) {
        const detail = err instanceof ApiError ? err.detail : "Could not save vote";
        if (err instanceof ApiError && err.status === 409) {
          persisted = true;
          setToast({ msg: "Already Voted", cap: "This pair was saved earlier" });
        } else {
          setToast({ msg: "Save Failed", cap: detail });
          setBusy(false);
          setTimeout(() => setToast(null), 2200);
          return;
        }
      }

      setHistory((h) =>
        [
          {
            label: `${winner.shortName} > ${loser.shortName}`,
            winnerId: winner.id,
            loserId: loser.id,
            skipped: false,
            persisted,
          },
          ...h,
        ].slice(0, 8)
      );
    } else {
      trackSwipeSkip({
        pairIndex: idx,
        leftId: current[0].id,
        rightId: current[1].id,
      });
      setHistory((h) =>
        [
          {
            label: `Skipped ${current[0].shortName} vs ${current[1].shortName}`,
            winnerId: null,
            loserId: null,
            skipped: true,
            persisted: false,
          },
          ...h,
        ].slice(0, 8)
      );
      setToast({ msg: "Pair Skipped" });
    }

    setIdx((i) => Math.min(i + 1, pairs.length - 1));
    setBusy(false);
    setTimeout(() => setToast(null), 1800);
  };

  const undo = () => {
    trackSwipeUndo(idx);
    setIdx((i) => Math.max(0, i - 1));
    setHistory((h) => h.slice(1));
    setToast({ msg: "Undid locally", cap: "Saved votes stay in the tally" });
    setTimeout(() => setToast(null), 1600);
  };

  const isDone = idx >= pairs.length - 1 && history.length > 0;
  const completedRef = useRef(false);

  useEffect(() => {
    if (isDone && !completedRef.current) {
      completedRef.current = true;
      trackSwipeSessionComplete(decisions, pairs.length);
    }
    if (!isDone) completedRef.current = false;
  }, [isDone, decisions, pairs.length]);

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4.75rem)] max-w-[1320px] flex-col px-4 sm:px-6 md:px-10">
      <VoteHeader
        index="MODE 01 · Swipe"
        title={
          <>
            Pairwise<span className="italic-display text-lime">.</span>
          </>
        }
        caption="Two committees enter, one leaves. Each choice adds +50 / −25 to the pairwise Pollr Score — saved anonymously."
        meta={
          <div className="flex items-center justify-end gap-6">
            <Counter label="Pair" value={`${idx + 1} / ${pairs.length}`} />
            <Counter label="Saved" value={`${decisions}`} accent />
          </div>
        }
      />

      <section className="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-3 pb-2 md:grid-cols-12">
        <aside className="order-2 flex min-h-0 flex-col overflow-hidden border border-ink-700/80 bg-ink-900/70 p-3 md:order-1 md:col-span-3">
          <p className="eyebrow mb-3">How to vote</p>
          <ol className="space-y-2 text-sm text-ink-200">
            <Tip n="01">Swipe a card outward to vote quickly.</Tip>
            <Tip n="02">Use the buttons for precise selection.</Tip>
            <Tip n="03">Skip if uncertain — skips are not scored.</Tip>
          </ol>

          <div className="mt-4 flex min-h-0 flex-1 flex-col border-t border-ink-700/80 pt-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="eyebrow">Recent decisions</p>
              {next && !isDone && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
                  Next: {next[0].shortName} vs {next[1].shortName}
                </span>
              )}
            </div>
            <ul className="max-h-[28vh] flex-1 space-y-2 overflow-auto pr-1 font-mono text-xs md:max-h-none">
              {history.length === 0 && <li className="text-ink-400">No decisions yet.</li>}
              {history.map((h, i) => (
                <li key={i} className="border-b border-ink-700/70 pb-1.5 text-ink-200">
                  <span className="text-ink-500">[{String(history.length - i).padStart(2, "0")}]</span>{" "}
                  {h.label}
                  {h.persisted && <span className="ml-1 text-lime">· saved</span>}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="order-1 flex min-h-0 flex-col md:order-2 md:col-span-9">
          <div className="flex-1 min-h-0">
            {isDone ? (
              <FinishedState
                onReset={() => {
                  trackSwipeSessionReset(decisions);
                  setIdx(0);
                  setHistory([]);
                }}
              />
            ) : (
              <div className="grid h-full min-h-0 grid-cols-1 gap-4 md:grid-cols-2">
                <SwipeCard
                  committee={current[0]}
                  side="left"
                  disabled={busy}
                  onChoose={(method) => recordVote(current[0], current[1], method)}
                />
                <SwipeCard
                  committee={current[1]}
                  side="right"
                  disabled={busy}
                  onChoose={(method) => recordVote(current[1], current[0], method)}
                />
              </div>
            )}
          </div>

          {!isDone && (
            <div className="mt-2 grid grid-cols-2 gap-px bg-ink-700/80 md:grid-cols-4">
              <ActionBtn
                onClick={() => recordVote(current[0], current[1], "button")}
                icon={<ArrowLeft size={16} />}
                label="Pick Left"
                primary
                disabled={busy}
              />
              <ActionBtn
                onClick={() => recordVote(null, null, "button")}
                icon={<SkipForward size={16} />}
                label="Skip"
                disabled={busy}
              />
              <ActionBtn
                onClick={undo}
                icon={<Undo2 size={16} />}
                label="Undo"
                disabled={idx === 0 || busy}
              />
              <ActionBtn
                onClick={() => recordVote(current[1], current[0], "button")}
                icon={<ArrowRight size={16} />}
                label="Pick Right"
                primary
                disabled={busy}
              />
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
  disabled,
}: {
  committee: Committee;
  side: "left" | "right";
  onChoose: (method: "swipe" | "card") => void;
  disabled?: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);
  const limeOpacity = useTransform(x, side === "left" ? [-180, -40, 0] : [0, 40, 180], side === "left" ? [1, 0, 0] : [0, 0, 1]);
  const emberOpacity = useTransform(x, side === "left" ? [0, 40, 180] : [-180, -40, 0], side === "left" ? [0, 0, 1] : [1, 0, 0]);
  const [exiting, setExiting] = useState(false);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (disabled) {
      x.set(0);
      return;
    }
    const threshold = 110;
    const expectedSign = side === "left" ? -1 : 1;
    const isVoteSwipe = info.offset.x * expectedSign > threshold;
    if (isVoteSwipe) {
      setExiting(true);
      setTimeout(() => {
        onChoose("swipe");
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
        drag={disabled ? false : "x"}
        style={{ x, rotate, touchAction: "pan-y" }}
        onDragEnd={handleDragEnd}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        whileTap={{ cursor: "grabbing" }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: exiting ? 0 : 1, y: 0, scale: exiting ? 0.92 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring", damping: 24, stiffness: 220 }}
        className="relative flex h-full min-h-[220px] cursor-grab flex-col overflow-hidden border border-ink-700/80 bg-ink-900 p-4 select-none"
      >
        <motion.span style={{ opacity: limeOpacity }} className="pointer-events-none absolute inset-0 z-10 border-2 border-lime" />
        <motion.span style={{ opacity: emberOpacity }} className="pointer-events-none absolute inset-0 z-10 border-2 border-ember" />

        <div className="flex items-center justify-between">
          <CategoryChip category={committee.category} />
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
            {side === "left" ? "Left" : "Right"}
          </span>
        </div>

        <div className="mt-3 flex flex-1 flex-col items-center text-center">
          <CommitteeImage
            slug={committee.slug}
            name={committee.name}
            className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28"
          />
          <h3 className="mt-3 display text-xl text-ink-50 sm:text-2xl md:text-[1.65rem]">{committee.name}</h3>
          <p className="italic-display mt-1 text-xs text-ink-300 sm:text-sm">
            “{committee.tagline}”
          </p>

          <button
            disabled={disabled}
            onClick={() => onChoose("card")}
            className="mt-6 w-full border border-lime/40 py-2 font-mono text-[10px] uppercase tracking-widest text-lime transition-colors hover:bg-lime hover:text-ink-950 disabled:opacity-40"
          >
            Choose {committee.shortName} →
          </button>
        </div>
      </motion.article>
    </AnimatePresence>
  );
}

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
      className={`flex items-center justify-center gap-2 px-3 py-3 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-30 ${
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
    <div className="flex h-full flex-col items-center justify-center border border-lime bg-ink-900 px-6 py-10 text-center sm:px-8 sm:py-12">
      <span className="eyebrow eyebrow-lime">Session complete</span>
      <h3 className="mt-3 display text-4xl text-ink-50 sm:text-5xl md:text-6xl">
        That&apos;s a <span className="italic-display text-lime">wrap</span>.
      </h3>
      <p className="mt-3 italic-display text-base text-ink-300 max-w-md sm:text-lg">
        Saved pairwise picks are in the Pollr Score. Run another set or switch modalities.
      </p>
      <button onClick={onReset} className="btn-lime mt-6">
        Reset Session
      </button>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { Save } from "lucide-react";
import { COMMITTEES, TIERS, type TierId } from "@/lib/constants";
import type { Committee } from "@/lib/types";
import { ApiError, ensureSession, submitTierBallot } from "@/lib/api";
import { CommitteeImage } from "@/components/CommitteeImage";
import { VoteHeader } from "@/components/VoteHeader";
import { Toast } from "@/components/Toast";
import { trackEvent, trackTierAssign, trackTierReset } from "@/lib/analytics";

type ZoneId = "pool" | TierId;

const ZONES: ZoneId[] = ["pool", "S", "A", "B", "C", "F"];
const TIER_IDS = TIERS.map((t) => t.id);
const MIN_TIER_PLACEMENTS = 5;

function emptyZones(): Record<ZoneId, Committee[]> {
  return {
    pool: [...COMMITTEES],
    S: [],
    A: [],
    B: [],
    C: [],
    F: [],
  };
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type GhostState = {
  committee: Committee;
  x: number;
  y: number;
  w: number;
  h: number;
  offsetX: number;
  offsetY: number;
};

export default function TierPage() {
  const [zones, setZones] = useState<Record<ZoneId, Committee[]>>(() => emptyZones());
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverZone, setHoverZone] = useState<ZoneId | null>(null);
  const [ghost, setGhost] = useState<GhostState | null>(null);
  const [toast, setToast] = useState<{ msg: string; cap?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  const zonesRef = useRef(zones);
  zonesRef.current = zones;
  const draggingIdRef = useRef<string | null>(null);

  const assignedCount = COMMITTEES.length - zones.pool.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!draggingId) {
      setHoverZone(null);
      return;
    }
    document.body.classList.add("tier-drag-active");
    const prevCursor = document.body.style.cursor;
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
    return () => {
      document.body.classList.remove("tier-drag-active");
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevUserSelect;
    };
  }, [draggingId]);

  const zoneFromPoint = useCallback((clientX: number, clientY: number): ZoneId | null => {
    const stack = (document.elementsFromPoint?.(clientX, clientY) ?? []) as HTMLElement[];
    for (const el of stack) {
      const zone = el.closest?.("[data-tier-zone]") as HTMLElement | null;
      const id = zone?.dataset.tierZone as ZoneId | undefined;
      if (id && ZONES.includes(id)) return id;
    }
    return null;
  }, []);

  const findZoneOf = useCallback((id: string, z: Record<ZoneId, Committee[]>) => {
    for (const key of ZONES) {
      if (z[key].some((committee) => committee.id === id)) return key;
    }
    return null;
  }, []);

  const moveCommittee = useCallback(
    (committee: Committee, toZone: ZoneId) => {
      setZones((prev) => {
        const fromZone = findZoneOf(committee.id, prev);
        if (!fromZone || fromZone === toZone) return prev;

        const next = {
          ...prev,
          [fromZone]: prev[fromZone].filter((item) => item.id !== committee.id),
          [toZone]: [...prev[toZone], committee],
        };
        trackTierAssign({
          committeeId: committee.id,
          fromZone,
          toZone,
          assignedCount: COMMITTEES.length - next.pool.length,
        });
        return next;
      });
    },
    [findZoneOf]
  );

  const handleDropAt = useCallback(
    (committee: Committee, clientX: number, clientY: number) => {
      const targetZone = zoneFromPoint(clientX, clientY);
      setHoverZone(null);

      if (!targetZone) {
        setToast({ msg: "Drop on a zone", cap: "Pool or S–F row" });
        setTimeout(() => setToast(null), 1000);
        return;
      }

      const sourceZone = findZoneOf(committee.id, zonesRef.current);
      if (sourceZone === targetZone) return;

      moveCommittee(committee, targetZone);
      setToast({
        msg: "Updated",
        cap: `${committee.shortName} → ${targetZone === "pool" ? "Pool" : targetZone}`,
      });
      setTimeout(() => setToast(null), 900);
    },
    [moveCommittee, findZoneOf, zoneFromPoint]
  );

  const beginDrag = useCallback((committee: Committee, e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingIdRef.current = committee.id;
    setDraggingId(committee.id);
    setGhost({
      committee,
      x: e.clientX,
      y: e.clientY,
      w: rect.width,
      h: rect.height,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
    setHoverZone(zoneFromPoint(e.clientX, e.clientY));
  }, [zoneFromPoint]);

  const updateDrag = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggingIdRef.current) return;
      setGhost((g) => (g ? { ...g, x: e.clientX, y: e.clientY } : g));
      setHoverZone(zoneFromPoint(e.clientX, e.clientY));
    },
    [zoneFromPoint]
  );

  const endDrag = useCallback(
    (committee: Committee, e: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggingIdRef.current || draggingIdRef.current !== committee.id) return;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      handleDropAt(committee, e.clientX, e.clientY);
      draggingIdRef.current = null;
      setDraggingId(null);
      setGhost(null);
    },
    [handleDropAt]
  );

  const reset = () => {
    trackTierReset(assignedCount);
    setZones(emptyZones());
    setSaved(false);
  };

  const autoSpread = () => {
    const next = emptyZones();
    next.pool = [];
    const shuffled = shuffle(COMMITTEES);
    shuffled.forEach((c, i) => {
      next[TIER_IDS[i % TIER_IDS.length]].push(c);
    });
    setZones(next);
    setSaved(false);
    trackEvent("tier_auto_spread", { assigned_count: COMMITTEES.length });
    setToast({ msg: "Auto-spread", cap: "Committees distributed across S–F" });
    setTimeout(() => setToast(null), 1400);
  };

  const canSubmit = assignedCount >= MIN_TIER_PLACEMENTS;

  const submit = async () => {
    if (!canSubmit) {
      setToast({
        msg: "Need more placements",
        cap: `Place at least ${MIN_TIER_PLACEMENTS} committees (${assignedCount} so far)`,
      });
      setTimeout(() => setToast(null), 2000);
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    const placements = TIERS.flatMap((tier) =>
      zones[tier.id].map((c) => ({ committee_id: c.id, tier: tier.id }))
    );
    try {
      await ensureSession();
      await submitTierBallot(placements);
      setSaved(true);
      setToast({ msg: "Tier Ballot Saved", cap: `${placements.length} placements locked` });
    } catch (err) {
      const detail = err instanceof ApiError ? err.detail : "Could not save ballot";
      setToast({ msg: "Save Failed", cap: detail });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 2200);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4.75rem)] max-w-[1320px] flex-col px-4 sm:px-6 md:px-10">
      <VoteHeader
        index="MODE 02 · Tier"
        title={
          <>
            S to <span className="italic-display text-lime">F</span>.
          </>
        }
        caption="Bucketized sentiment. Drag committees from the pool into a tier — at least 5 to submit. Unranked stay out of your ballot."
        meta={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={autoSpread}
              className="btn-ghost"
              disabled={submitting}
            >
              Auto-spread
            </button>
            <button type="button" onClick={reset} className="btn-ghost" disabled={submitting}>
              Reset
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={submitting || !canSubmit}
              className="btn-lime flex items-center gap-2 disabled:opacity-40"
            >
              <Save size={14} /> {submitting ? "Saving…" : saved ? "Update" : "Submit"}
            </button>
          </div>
        }
      />

      <section className="mt-3 flex min-h-0 flex-1 flex-col gap-3 pb-4">
        <div className="flex min-h-0 flex-1 flex-col border border-ink-600/90 bg-ink-950">
          {TIERS.map((tier, i) => {
            const active = hoverZone === tier.id && draggingId !== null;
            return (
              <div
                key={tier.id}
                data-tier-zone={tier.id}
                className={`grid min-h-[4.5rem] flex-1 grid-cols-[3.25rem_1fr] sm:grid-cols-[4rem_1fr] ${
                  i < TIERS.length - 1 ? "border-b border-ink-700/90" : ""
                } ${active ? "bg-lime/[0.04]" : ""}`}
              >
                <div
                  className="flex flex-col items-center justify-center gap-1 border-r border-ink-700/90 px-1 py-2"
                  style={{ borderRightColor: `${tier.accent}40` }}
                >
                  <span
                    className="display text-[1.65rem] leading-none sm:text-[2rem]"
                    style={{ color: tier.accent }}
                  >
                    {tier.label}
                  </span>
                  <span
                    className="font-mono text-[7px] uppercase tracking-[0.18em] sm:text-[8px]"
                    style={{ color: tier.accent, opacity: 0.75 }}
                  >
                    {tier.caption}
                  </span>
                </div>
                <div
                  className={`relative min-h-0 overflow-y-auto overscroll-contain p-1.5 sm:p-2 ${
                    active ? "ring-1 ring-inset ring-lime/50" : ""
                  }`}
                >
                  {zones[tier.id].length === 0 && !draggingId && (
                    <p className="pointer-events-none absolute inset-0 flex items-center px-3 font-mono text-[10px] uppercase tracking-widest text-ink-500">
                      Drop here
                    </p>
                  )}
                  <div className="grid min-h-full content-start [grid-template-columns:repeat(auto-fill,minmax(7.25rem,1fr))] gap-1.5">
                    {zones[tier.id].map((c) => (
                      <DraggableChip
                        key={c.id}
                        committee={c}
                        draggingId={draggingId}
                        onPointerDown={(e) => beginDrag(c, e)}
                        onPointerMove={updateDrag}
                        onPointerUp={(e) => endDrag(c, e)}
                        onPointerCancel={(e) => endDrag(c, e)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div
          data-tier-zone="pool"
          className={`shrink-0 border border-ink-600/90 bg-ink-950 ${
            hoverZone === "pool" && draggingId ? "ring-1 ring-inset ring-lime/50" : ""
          }`}
        >
          <div className="flex items-center justify-between border-b border-ink-700/90 px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300">
              Pool / Unranked
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-400">
              {zones.pool.length} remaining
            </span>
          </div>
          <div className="max-h-[11rem] min-h-[5.5rem] overflow-y-auto overscroll-contain p-2 sm:max-h-[13rem]">
            {zones.pool.length === 0 ? (
              <p className="px-1 py-3 font-mono text-[10px] uppercase tracking-widest text-ink-500">
                All placed — drag chips back here to re-pool.
              </p>
            ) : (
              <div className="grid [grid-template-columns:repeat(auto-fill,minmax(7.25rem,1fr))] gap-1.5">
                {zones.pool.map((c) => (
                  <DraggableChip
                    key={c.id}
                    committee={c}
                    draggingId={draggingId}
                    dimOthers
                    onPointerDown={(e) => beginDrag(c, e)}
                    onPointerMove={updateDrag}
                    onPointerUp={(e) => endDrag(c, e)}
                    onPointerCancel={(e) => endDrag(c, e)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-ink-500">
          Assigned {assignedCount} / {COMMITTEES.length}
          {canSubmit
            ? " · ready to submit"
            : ` · need ${MIN_TIER_PLACEMENTS - assignedCount} more to submit`}
        </p>
      </section>

      {mounted &&
        ghost &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[200] flex items-center gap-2 border border-ink-100/60 bg-ink-900 px-2 py-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.65)]"
            style={{
              left: ghost.x - ghost.offsetX,
              top: ghost.y - ghost.offsetY,
              width: ghost.w,
              height: ghost.h,
            }}
          >
            <ChipContent committee={ghost.committee} />
          </div>,
          document.body
        )}

      <Toast show={!!toast} message={toast?.msg ?? ""} caption={toast?.cap} />
    </div>
  );
}

function ChipContent({ committee }: { committee: Committee }) {
  return (
    <>
      <CommitteeImage
        slug={committee.slug}
        name={committee.name}
        className="h-5 w-5 shrink-0 !rounded-sm"
      />
      <p className="min-w-0 truncate font-mono text-[10px] font-medium uppercase tracking-wide text-ink-100">
        {committee.shortName}
      </p>
    </>
  );
}

function DraggableChip({
  committee,
  draggingId,
  dimOthers = false,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: {
  committee: Committee;
  draggingId: string | null;
  dimOthers?: boolean;
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (e: ReactPointerEvent<HTMLDivElement>) => void;
}) {
  const active = draggingId === committee.id;
  const anyDrag = draggingId !== null;

  return (
    <div
      data-committee-id={committee.id}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      className={`flex min-w-0 cursor-grab items-center gap-2 border border-ink-500/80 bg-ink-900 px-2 py-1.5 select-none active:cursor-grabbing ${
        active ? "opacity-30" : anyDrag && dimOthers ? "opacity-45" : ""
      }`}
      style={{ touchAction: "none" }}
      title={`${committee.name} · drag to move`}
    >
      <ChipContent committee={committee} />
    </div>
  );
}

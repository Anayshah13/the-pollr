"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Swords } from "lucide-react";
import { COMMITTEES, CATEGORIES, findCommittee } from "@/lib/constants";
import type { Category, HeadToHeadResponse, LeaderboardResponse, LeaderboardRow } from "@/lib/types";
import { fetchHeadToHead, fetchLeaderboard } from "@/lib/api";
import { CommitteeImage } from "@/components/CommitteeImage";
import { CategoryChip } from "@/components/CategoryChip";
import { trackAnalyticsFilter, trackAnalyticsH2H } from "@/lib/analytics";

type CatFilter = "all" | Category;

function parseCategoryParam(raw: string | null): CatFilter {
  if (!raw || raw === "all") return "all";
  return CATEGORIES.some((c) => c.id === raw) ? (raw as Category) : "all";
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={null}>
      <AnalyticsPageInner />
    </Suspense>
  );
}

function AnalyticsPageInner() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<CatFilter>(() =>
    parseCategoryParam(searchParams.get("category"))
  );
  const [a, setA] = useState<string>("ieee");
  const [b, setB] = useState<string>("acm");
  const [board, setBoard] = useState<LeaderboardResponse | null>(null);
  const [h2h, setH2h] = useState<HeadToHeadResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onFilter = (next: CatFilter) => {
    setFilter(next);
    trackAnalyticsFilter(next);
  };

  const onSelectA = (id: string) => {
    setA(id);
    trackAnalyticsH2H({ side: "A", committeeId: id, opponentId: b });
  };

  const onSelectB = (id: string) => {
    setB(id);
    trackAnalyticsH2H({ side: "B", committeeId: id, opponentId: a });
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchLeaderboard(filter)
      .then((data) => {
        if (!cancelled) {
          setBoard(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter]);

  useEffect(() => {
    let cancelled = false;
    fetchHeadToHead(a, b)
      .then((data) => {
        if (!cancelled) setH2h(data);
      })
      .catch(() => {
        if (!cancelled) setH2h(null);
      });
    return () => {
      cancelled = true;
    };
  }, [a, b]);

  const rows = board?.rows ?? [];
  const ca = findCommittee(a);
  const cb = findCommittee(b);
  const rowA = useMemo(() => rows.find((r) => r.id === a) ?? null, [rows, a]);
  const rowB = useMemo(() => rows.find((r) => r.id === b) ?? null, [rows, b]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-10">
      <section className="border-b border-ink-100/80 pt-8 pb-8 md:pt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="eyebrow eyebrow-lime">§ Analytics · Live ballots</span>
          <span className="eyebrow">Direct pairwise + tier + rank</span>
        </div>
        <h1 className="mt-4 display text-[clamp(36px,9vw,140px)] text-ink-50">
          Comparative <span className="italic-display text-lime">readouts</span>.
        </h1>
        <p className="mt-3 italic-display text-lg text-ink-200 max-w-3xl sm:text-xl md:text-2xl">
          Head-to-head uses only real pairwise votes. Rankings are Pollr Scores with
          per-mode sample sizes — no synthetic fill-ins.
        </p>
        {board && (
          <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-ink-500">
            Scope {board.scope} · swipe {board.total_pairwise_votes} · tier {board.total_tier_ballots} ·
            rank {board.total_rank_ballots}
          </p>
        )}
      </section>

      <section className="mt-10 border border-ink-700/80">
        <header className="flex items-center justify-between gap-3 border-b border-ink-700/80 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Swords size={18} className="text-lime" />
            <span className="eyebrow eyebrow-lime">§ Head-to-Head</span>
          </div>
          <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-widest text-ink-400">
            Direct pairwise only
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-4 border-b border-ink-700/80 p-4 sm:p-6 md:border-b-0 md:border-r">
            <p className="eyebrow mb-3">Committee A</p>
            <Selector value={a} onChange={onSelectA} />
            {ca && <CommitteeBlock committee={ca} row={rowA} side="A" />}
          </div>

          <div className="md:col-span-4 flex flex-col items-center justify-center border-b border-ink-700/80 p-4 sm:p-6 md:border-b-0 md:border-r">
            {h2h && ca && cb ? (
              <H2HOutcome a={ca} b={cb} h2h={h2h} />
            ) : (
              <span className="italic-display text-ink-400">Select two committees</span>
            )}
          </div>

          <div className="md:col-span-4 p-4 sm:p-6">
            <p className="eyebrow mb-3">Committee B</p>
            <Selector value={b} onChange={onSelectB} />
            {cb && <CommitteeBlock committee={cb} row={rowB} side="B" />}
          </div>
        </div>
      </section>

      <section className="mt-12 pb-16">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ink-100/80 pb-4">
          <div>
            <span className="eyebrow eyebrow-lime">§ Category Rankings</span>
            <h2 className="mt-2 display text-3xl text-ink-50 sm:text-4xl md:text-5xl">
              Filter by <span className="italic-display">discipline</span>.
            </h2>
          </div>
          <div className="flex flex-wrap gap-px bg-ink-700/80">
            <CatChip active={filter === "all"} onClick={() => onFilter("all")} label="All" />
            {CATEGORIES.map((cat) => (
              <CatChip
                key={cat.id}
                active={filter === cat.id}
                onClick={() => onFilter(cat.id)}
                label={cat.label}
              />
            ))}
          </div>
        </header>

        {loading && <p className="mt-6 italic-display text-ink-500">Loading rankings…</p>}
        {!loading && error && (
          <p className="mt-6 italic-display text-ember">API unavailable — {error}</p>
        )}
        {!loading && !error && rows.every((r) => r.pollr_score === null) && (
          <p className="mt-6 italic-display text-ink-500">
            No scored committees in this scope yet. Vote first, then refresh.
          </p>
        )}

        <ol className="mt-2">
          {rows.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 border-b border-ink-700/80 py-3 transition-colors hover:bg-ink-900 md:grid md:grid-cols-12 md:gap-4 md:py-4"
            >
              <span className="stat-num text-xl text-ink-300 w-7 shrink-0 md:col-span-1 md:text-2xl md:w-auto">
                {String(c.rank).padStart(2, "0")}
              </span>
              <CommitteeImage
                slug={c.slug}
                name={c.name}
                className="h-10 w-10 shrink-0 md:col-span-1 md:h-11 md:w-11"
              />
              <div className="flex-1 min-w-0 md:col-span-4">
                <p className="truncate text-sm text-ink-50 md:text-base">{c.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <CategoryChip category={c.category} />
                  <span className="hidden font-mono text-[10px] uppercase tracking-widest text-ink-400 sm:inline">
                    n={c.sample_size} · modes {c.mode_coverage}/3
                  </span>
                </div>
              </div>
              <div className="hidden md:col-span-3 md:block">
                <ModeLine label="Swipe" value={c.modes.swipe} n={c.modes.swipe_n} />
                <ModeLine label="Tier" value={c.modes.tier} n={c.modes.tier_n} />
                <ModeLine label="Rank" value={c.modes.rank} n={c.modes.rank_n} />
              </div>
              <div className="hidden text-right md:col-span-1 md:block">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-500">
                  {c.win_rate == null ? "—" : `${c.win_rate.toFixed(0)}%`}
                </span>
              </div>
              <div className="text-right shrink-0 md:col-span-2">
                <span className="stat-num text-lg text-ink-50 md:text-xl">
                  {c.pollr_score == null ? "—" : c.pollr_score.toFixed(1)}
                </span>
              </div>
            </li>
          ))}
        </ol>

        {board && (
          <p className="mt-8 max-w-3xl text-xs leading-relaxed text-ink-500">
            {board.methodology}
          </p>
        )}
      </section>
    </div>
  );
}

function Selector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none border border-ink-700 bg-ink-900 px-4 py-3 pr-10 font-mono text-sm uppercase tracking-widest text-ink-100 focus:border-lime outline-none"
      >
        {CATEGORIES.map((cat) => (
          <optgroup key={cat.id} label={cat.label}>
            {COMMITTEES.filter((c) => c.category === cat.id).map((c) => (
              <option key={c.id} value={c.id}>
                {c.shortName}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
      />
    </div>
  );
}

function CommitteeBlock({
  committee,
  row,
  side,
}: {
  committee: NonNullable<ReturnType<typeof findCommittee>>;
  row: LeaderboardRow | null;
  side: "A" | "B";
}) {
  return (
    <div className="mt-5 flex items-start gap-4">
      <CommitteeImage slug={committee.slug} name={committee.name} className="h-16 w-16" />
      <div className="flex-1 min-w-0">
        <span className="font-mono text-[9px] uppercase tracking-widest text-ink-400">Side {side}</span>
        <h3 className="display text-3xl text-ink-50 truncate">{committee.shortName}</h3>
        <CategoryChip category={committee.category} />
        <p className="italic-display text-sm text-ink-300 mt-2">“{committee.tagline}”</p>
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-ink-700/80 pt-3">
          <Mini label="Score" value={row?.pollr_score == null ? "—" : row.pollr_score.toFixed(1)} />
          <Mini label="Swipe n" value={String(row?.modes.swipe_n ?? 0)} />
          <Mini label="Win%" value={row?.win_rate == null ? "—" : `${row.win_rate.toFixed(0)}%`} />
        </div>
      </div>
    </div>
  );
}

function H2HOutcome({
  a,
  b,
  h2h,
}: {
  a: NonNullable<ReturnType<typeof findCommittee>>;
  b: NonNullable<ReturnType<typeof findCommittee>>;
  h2h: HeadToHeadResponse;
}) {
  if (h2h.total === 0 || h2h.a_share == null) {
    return (
      <div className="w-full text-center">
        <p className="eyebrow">Insufficient pairwise data</p>
        <p className="mt-3 italic-display text-sm text-ink-400 leading-snug">
          No direct {a.shortName} vs {b.shortName} votes yet. Swipe them against each other to
          populate this matchup.
        </p>
      </div>
    );
  }

  const share = h2h.a_share;
  return (
    <div className="w-full">
      <p className="eyebrow text-center">Win Share</p>
      <div className="mt-3 flex h-3 w-full overflow-hidden border border-ink-700">
        <span style={{ width: `${share}%` }} className="bg-lime" />
        <span style={{ width: `${100 - share}%` }} className="bg-ember/80" />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-widest">
        <span className="text-lime">
          {a.shortName} · {share}% ({h2h.a_wins})
        </span>
        <span className="text-ember">
          {b.shortName} · {(100 - share).toFixed(1)}% ({h2h.b_wins})
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-ink-700/80 pt-4">
        <Mini label="Direct votes" value={String(h2h.total)} />
        <Mini label="Ready" value={h2h.sufficient ? "Yes (≥3)" : "Building"} />
      </div>

      <p className="mt-4 italic-display text-sm text-ink-300 text-center">
        Computed only from swipe ballots where these two met.
      </p>
    </div>
  );
}

function ModeLine({ label, value, n }: { label: string; value: number | null; n: number }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="w-10 font-mono text-[9px] uppercase tracking-widest text-ink-500">{label}</span>
      <div className="relative h-1 flex-1 bg-ink-800">
        {value != null && (
          <span
            className="absolute inset-y-0 left-0 bg-lime/80"
            style={{ width: `${Math.max(2, ((value + 100) / 200) * 100)}%` }}
          />
        )}
      </div>
      <span className="w-16 text-right font-mono text-[9px] text-ink-400">
        {value == null ? "—" : value.toFixed(0)} · n={n}
      </span>
    </div>
  );
}

function CatChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`bg-ink-950 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
        active ? "bg-ink-50 text-ink-950" : "text-ink-200 hover:text-ink-50"
      }`}
      style={active ? { background: "#f4f1e8", color: "#070707" } : {}}
    >
      {label}
    </button>
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

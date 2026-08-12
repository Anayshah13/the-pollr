"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import type { InsightsResponse, LeaderboardResponse, LeaderboardRow } from "@/lib/types";
import { fetchInsights, fetchLeaderboard } from "@/lib/api";
import { CommitteeImage } from "@/components/CommitteeImage";
import { CategoryChip } from "@/components/CategoryChip";
import { LandingHero } from "@/components/LandingHero";
import { TrackedLink } from "@/components/TrackedLink";

export default function LandingPage() {
  const [board, setBoard] = useState<LeaderboardResponse | null>(null);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [lb, ins] = await Promise.all([fetchLeaderboard("all"), fetchInsights()]);
        if (!cancelled) {
          setBoard(lb);
          setInsights(ins);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load rankings");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const scored = board?.rows.filter((r) => r.pollr_score !== null) ?? [];
  const top10 = scored.slice(0, 10);
  const controversy = insights?.most_controversial ?? null;

  return (
    <div>
      <LandingHero />

      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
        <section className="grid grid-cols-1 gap-px bg-ink-700/80 md:grid-cols-12 md:[&>*]:bg-ink-950">
          <div className="md:col-span-8 p-4 sm:p-6 md:p-10">
            <header className="flex items-end justify-between border-b border-ink-100/80 pb-4">
              <div>
                <span className="eyebrow eyebrow-lime">§ 01 · Global Leaderboard</span>
                <h2 className="mt-2 display text-4xl text-ink-50 sm:text-5xl md:text-6xl">
                  The Top <span className="italic-display">Ten</span>.
                </h2>
              </div>
              <span className="hidden md:block font-mono text-[10px] uppercase tracking-widest text-ink-400">
                Pollr Score · live ballots
              </span>
            </header>

            {loading && <EmptyNote text="Loading live rankings…" />}
            {!loading && error && <EmptyNote text={`API unavailable — ${error}`} />}
            {!loading && !error && top10.length === 0 && (
              <EmptyNote text="No scored committees yet. Cast swipe, tier, or rank ballots to populate the board." />
            )}

            <ol className="mt-2">
              {top10.map((c) => (
                <li
                  key={c.id}
                  className="group flex items-center gap-3 border-b border-ink-700/80 py-3 transition-colors hover:bg-ink-900 md:grid md:grid-cols-12 md:gap-4 md:py-4"
                >
                  <span className="stat-num text-xl text-ink-300 group-hover:text-lime w-7 shrink-0 md:col-span-1 md:text-2xl md:w-auto">
                    {String(c.rank).padStart(2, "0")}
                  </span>
                  <CommitteeImage
                    slug={c.slug}
                    name={c.name}
                    className="h-10 w-10 shrink-0 md:col-span-1 md:h-12 md:w-12"
                  />
                  <div className="flex-1 min-w-0 md:col-span-5">
                    <p className="truncate text-sm text-ink-50 md:text-base">{c.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <CategoryChip category={c.category} />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
                        n={c.sample_size} · {c.mode_coverage}/3 modes
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:col-span-3 md:block">
                    <ModeBars row={c} />
                  </div>
                  <div className="text-right shrink-0 md:col-span-2">
                    <span className="stat-num text-lg text-ink-50 md:text-2xl">
                      {c.pollr_score?.toFixed(1)}
                    </span>
                    <span className="ml-1 font-mono text-[10px] uppercase tracking-widest text-ink-400">
                      score
                    </span>
                  </div>
                </li>
              ))}
            </ol>

            {board && (
              <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-ink-500">
                Ballots · swipe {board.total_pairwise_votes} · tier {board.total_tier_ballots} · rank{" "}
                {board.total_rank_ballots}
              </p>
            )}
          </div>

          <div className="md:col-span-4 p-4 sm:p-6 md:p-10">
            <header className="border-b border-ink-100/80 pb-4">
              <span className="eyebrow eyebrow-lime">§ 02 · Category Leaders</span>
              <h2 className="mt-2 display text-3xl text-ink-50 sm:text-4xl md:text-5xl">
                By <span className="italic-display">discipline</span>.
              </h2>
            </header>

            <ul className="divide-y divide-ink-700/80">
              {CATEGORIES.map((cat) => {
                const leader = insights?.category_leaders?.[cat.id] ?? null;
                return (
                  <li key={cat.id} className="py-5">
                    <div className="flex items-center justify-between">
                      <span className="eyebrow">{cat.label}</span>
                      <span className="stat-num text-[10px] text-ink-400">{cat.abbr}</span>
                    </div>
                    {leader && leader.pollr_score !== null ? (
                      <TrackedLink
                        href={`/analytics?category=${encodeURIComponent(cat.id)}`}
                        id={`category_leader_${cat.id}`}
                        label={leader.short_name}
                        location="landing_category_leaders"
                        className="mt-3 flex items-center gap-3 group"
                      >
                        <CommitteeImage
                          slug={leader.slug}
                          name={leader.name}
                          className="h-11 w-11"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="display text-2xl text-ink-50 group-hover:text-lime truncate">
                            {leader.short_name}
                          </p>
                          <p className="italic-display text-xs text-ink-300 truncate">
                            {leader.tagline}
                          </p>
                        </div>
                        <span className="stat-num text-lg text-ink-200">
                          {leader.pollr_score.toFixed(1)}
                        </span>
                      </TrackedLink>
                    ) : (
                      <p className="mt-3 italic-display text-sm text-ink-500">
                        No scored leader yet.
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="mt-px grid grid-cols-1 gap-px bg-ink-700/80 md:grid-cols-12 md:[&>*]:bg-ink-950">
          <article className="md:col-span-7 p-4 sm:p-6 md:p-10">
            <header className="flex items-center justify-between gap-3 border-b border-ink-100/80 pb-4">
              <div className="flex items-center gap-3">
                <Flame size={18} className="text-ember" />
                <span className="eyebrow">§ 03 · Most Controversial</span>
              </div>
              <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-widest text-ink-400">
                Tier entropy
              </span>
            </header>

            {!controversy || controversy.controversy == null ? (
              <EmptyNote text="Needs tier ballots with mixed S–F placements before controversy can be measured." />
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-7">
                  <div className="flex items-center gap-4">
                    <CommitteeImage
                      slug={controversy.slug}
                      name={controversy.name}
                      className="h-16 w-16 shrink-0 sm:h-20 sm:w-20"
                    />
                    <div className="min-w-0">
                      <CategoryChip category={controversy.category} />
                      <h3 className="mt-2 display text-3xl text-ink-50 sm:text-4xl md:text-5xl">
                        {controversy.short_name}
                      </h3>
                      <p className="italic-display text-base text-ink-200 sm:text-lg">
                        “{controversy.tagline}”
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-300">
                    Highest Shannon entropy across submitted tier placements. This is observed
                    disagreement, not a narrative claim.
                  </p>
                </div>
                <div className="md:col-span-5">
                  <p className="eyebrow mb-3">Tier distribution</p>
                  <TierDistribution dist={controversy.tier_distribution} />
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-ink-700/80 pt-4">
                    <Stat label="Entropy" value={`${controversy.controversy}`} small />
                    <Stat label="Tier n" value={`${controversy.modes.tier_n}`} small />
                  </div>
                </div>
              </div>
            )}
          </article>

          <article className="md:col-span-5 p-4 sm:p-6 md:p-10">
            <header className="border-b border-ink-100/80 pb-4">
              <span className="eyebrow">§ 04 · Score Method</span>
              <h2 className="mt-2 display text-3xl text-ink-50 sm:text-4xl">
                How scores <span className="italic-display text-lime">work</span>.
              </h2>
            </header>
            <ul className="mt-6 space-y-4 text-sm leading-relaxed text-ink-300">
              <li>
                <span className="text-lime font-mono text-[10px] uppercase tracking-widest">Swipe</span>
                <p className="mt-1">Winner +50, loser −25, mapped to [−100, 100], shrunk by n/(n+10).</p>
              </li>
              <li>
                <span className="text-lime font-mono text-[10px] uppercase tracking-widest">Tier</span>
                <p className="mt-1">S/A/B/C/F = +100/+50/0/−50/−100, averaged across ballots.</p>
              </li>
              <li>
                <span className="text-lime font-mono text-[10px] uppercase tracking-widest">Rank</span>
                <p className="mt-1">Linear +100…−100 by position within each submitted scope.</p>
              </li>
              <li>
                <span className="text-lime font-mono text-[10px] uppercase tracking-widest">Pollr Score</span>
                <p className="mt-1">Equal mean of available mode scores. Missing modes are omitted, not invented.</p>
              </li>
            </ul>
          </article>
        </section>
      </div>
    </div>
  );
}

function ModeBars({ row }: { row: LeaderboardRow }) {
  const modes = [
    { label: "S", value: row.modes.swipe, n: row.modes.swipe_n },
    { label: "T", value: row.modes.tier, n: row.modes.tier_n },
    { label: "R", value: row.modes.rank, n: row.modes.rank_n },
  ];
  return (
    <div className="space-y-1">
      {modes.map((m) => (
        <div key={m.label} className="flex items-center gap-2">
          <span className="w-3 font-mono text-[9px] text-ink-500">{m.label}</span>
          <div className="relative h-1 flex-1 bg-ink-800">
            {m.value != null && (
              <span
                className="absolute inset-y-0 left-0 bg-lime/80"
                style={{ width: `${Math.max(2, ((m.value + 100) / 200) * 100)}%` }}
              />
            )}
          </div>
          <span className="w-10 text-right font-mono text-[9px] text-ink-400">
            {m.value == null ? "—" : m.value.toFixed(0)}
          </span>
        </div>
      ))}
    </div>
  );
}

function TierDistribution({ dist }: { dist: Record<string, number> }) {
  const segments = ["S", "A", "B", "C", "F"];
  const colors = ["#d4ff3a", "#9be0a8", "#7ec8ff", "#e8e4d8", "#ff4d3a"];
  const pcts = segments.map((s) => dist[s] ?? 0);
  const hasData = pcts.some((p) => p > 0);
  if (!hasData) return <EmptyNote text="No tier distribution yet." />;
  return (
    <div>
      <div className="flex h-8 w-full overflow-hidden border border-ink-700">
        {pcts.map((p, i) =>
          p > 0 ? (
            <span
              key={segments[i]}
              style={{ width: `${p}%`, background: colors[i] }}
              className="block"
              title={`${segments[i]} · ${p}%`}
            />
          ) : null
        )}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-ink-300">
        {segments.map((s, i) => (
          <span key={s} className="flex flex-col items-center">
            <span style={{ color: colors[i] }}>{s}</span>
            <span>{pcts[i]}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  small,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="eyebrow">{label}</span>
      <span className={`stat-num ${small ? "text-lg sm:text-xl" : "text-2xl"} mt-1.5 text-ink-50`}>
        {value}
      </span>
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return <p className="mt-6 italic-display text-sm text-ink-500 leading-snug">{text}</p>;
}

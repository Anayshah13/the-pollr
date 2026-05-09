"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Swords, TrendingUp, Activity } from "lucide-react";
import { COMMITTEES, CATEGORIES, HEAD_TO_HEAD, findCommittee } from "@/lib/constants";
import type { Category } from "@/lib/types";
import { CommitteeImage } from "@/components/CommitteeImage";
import { CategoryChip } from "@/components/CategoryChip";
import { Sparkline } from "@/components/Sparkline";
import { BarTrend } from "@/components/BarTrend";

type CatFilter = "all" | Category;

export default function AnalyticsPage() {
  const [filter, setFilter] = useState<CatFilter>("all");
  const [a, setA] = useState<string>("ieee");
  const [b, setB] = useState<string>("acm");

  const filtered = useMemo(
    () =>
      (filter === "all" ? COMMITTEES : COMMITTEES.filter((c) => c.category === filter))
        .slice()
        .sort((x, y) => y.elo - x.elo),
    [filter]
  );

  const ca = findCommittee(a);
  const cb = findCommittee(b);

  // Build a head-to-head from data (if exists) or synthesise from ELO diff
  const h2h = useMemo(() => {
    const found = HEAD_TO_HEAD.find(
      (h) => (h.a === a && h.b === b) || (h.a === b && h.b === a)
    );
    if (found) {
      return found.a === a ? found : { ...found, share: 100 - found.share, a, b };
    }
    if (!ca || !cb) return null;
    const diff = ca.elo - cb.elo;
    const expected = 1 / (1 + Math.pow(10, -diff / 400));
    return {
      a,
      b,
      share: Math.round(expected * 100),
      totalVotes: Math.round((ca.totalVotes + cb.totalVotes) / 6),
      trend: ca.sparkline.map((v, i) => Math.round((v + (cb.sparkline[i] ?? 50)) / 2)),
    };
  }, [a, b, ca, cb]);

  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-10">
      {/* MASTHEAD */}
      <section className="border-b border-ink-100/80 pt-10 pb-8">
        <div className="flex items-baseline justify-between">
          <span className="eyebrow eyebrow-lime">§ Analytics · Q2 Window</span>
          <span className="eyebrow">Auto-refresh every 5 min</span>
        </div>
        <h1 className="mt-4 display text-[clamp(56px,10vw,140px)] text-ink-50">
          Comparative <span className="italic-display text-lime">readouts</span>.
        </h1>
        <p className="mt-3 italic-display text-2xl text-ink-200 max-w-3xl">
          Head-to-head matchups, category leaders, and trend lines aggregated
          from all four input modalities.
        </p>
      </section>

      {/* HEAD TO HEAD */}
      <section className="mt-10 border border-ink-700/80">
        <header className="flex items-center justify-between border-b border-ink-700/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <Swords size={18} className="text-lime" />
            <span className="eyebrow eyebrow-lime">§ Head-to-Head</span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
            ELO-derived expected outcome
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Selector A */}
          <div className="md:col-span-4 border-b border-ink-700/80 p-6 md:border-b-0 md:border-r">
            <p className="eyebrow mb-3">Committee A</p>
            <Selector value={a} onChange={setA} />
            {ca && <CommitteeBlock committee={ca} side="A" />}
          </div>

          {/* center: outcome */}
          <div className="md:col-span-4 flex flex-col items-center justify-center border-b border-ink-700/80 p-6 md:border-b-0 md:border-r">
            {h2h && ca && cb ? (
              <H2HOutcome a={ca} b={cb} share={h2h.share} totalVotes={h2h.totalVotes} trend={h2h.trend} />
            ) : (
              <span className="italic-display text-ink-400">Select two committees</span>
            )}
          </div>

          {/* Selector B */}
          <div className="md:col-span-4 p-6">
            <p className="eyebrow mb-3">Committee B</p>
            <Selector value={b} onChange={setB} />
            {cb && <CommitteeBlock committee={cb} side="B" />}
          </div>
        </div>
      </section>

      {/* CATEGORY-FILTERED RANKINGS */}
      <section className="mt-12">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ink-100/80 pb-4">
          <div>
            <span className="eyebrow eyebrow-lime">§ Category Rankings</span>
            <h2 className="mt-2 display text-5xl text-ink-50">
              Filter by <span className="italic-display">discipline</span>.
            </h2>
          </div>
          <div className="flex flex-wrap gap-px bg-ink-700/80">
            <CatChip active={filter === "all"} onClick={() => setFilter("all")} label="All" />
            {CATEGORIES.map((cat) => (
              <CatChip
                key={cat.id}
                active={filter === cat.id}
                onClick={() => setFilter(cat.id)}
                label={cat.label}
              />
            ))}
          </div>
        </header>

        <ol className="mt-2">
          {filtered.map((c, i) => (
            <li
              key={c.id}
              className="grid grid-cols-12 items-center gap-4 border-b border-ink-700/80 py-4 transition-colors hover:bg-ink-900"
            >
              <span className="col-span-1 stat-num text-2xl text-ink-300">
                {String(i + 1).padStart(2, "0")}
              </span>
              <CommitteeImage slug={c.slug} name={c.name} className="col-span-1 h-11 w-11" />
              <div className="col-span-4">
                <p className="text-base text-ink-50">{c.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <CategoryChip category={c.category} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
                    {c.totalVotes.toLocaleString()} votes
                  </span>
                </div>
              </div>
              <div className="col-span-2 hidden md:block">
                <Sparkline values={c.sparkline} width={120} height={26} />
              </div>
              <div className="col-span-2 hidden md:block">
                <Bar value={c.winRate} max={100} label={`${c.winRate.toFixed(0)}%`} caption="Win" />
              </div>
              <div className="col-span-1 text-right hidden md:block">
                <span className={`stat-num text-sm ${c.delta >= 0 ? "text-lime" : "text-ember"}`}>
                  {c.delta >= 0 ? "+" : ""}{c.delta}
                </span>
              </div>
              <div className="col-span-2 md:col-span-1 text-right">
                <span className="stat-num text-xl text-ink-50">{c.elo}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* INSIGHT STRIP */}
      <section className="mt-12 grid grid-cols-1 gap-px bg-ink-700/80 md:grid-cols-3 md:[&>*]:bg-ink-950">
        <Insight
          icon={<Activity size={16} className="text-lime" />}
          title="Engagement"
          stat="93.2%"
          caption="Sessions completing at least one full vote cycle this week."
        />
        <Insight
          icon={<TrendingUp size={16} className="text-lime" />}
          title="Lift Pattern"
          stat="+18.4 ELO"
          caption="Average week-over-week ELO gain across rising committees."
        />
        <Insight
          icon={<Swords size={16} className="text-lime" />}
          title="Decisive Pairs"
          stat="64%"
          caption="Of pairwise matches resolve with a >70/30 sentiment split."
        />
      </section>
    </div>
  );
}

/* ===== components ===== */

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

function CommitteeBlock({ committee, side }: { committee: ReturnType<typeof findCommittee>; side: "A" | "B" }) {
  if (!committee) return null;
  return (
    <div className="mt-5 flex items-start gap-4">
      <CommitteeImage slug={committee.slug} name={committee.name} className="h-16 w-16" />
      <div className="flex-1 min-w-0">
        <span className="font-mono text-[9px] uppercase tracking-widest text-ink-400">Side {side}</span>
        <h3 className="display text-3xl text-ink-50 truncate">{committee.shortName}</h3>
        <CategoryChip category={committee.category} />
        <p className="italic-display text-sm text-ink-300 mt-2">“{committee.tagline}”</p>
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-ink-700/80 pt-3">
          <Mini label="ELO" value={String(committee.elo)} />
          <Mini label="Win" value={`${committee.winRate.toFixed(0)}%`} />
          <Mini label="Δ" value={`${committee.delta >= 0 ? "+" : ""}${committee.delta}`} accent={committee.delta >= 0} />
        </div>
      </div>
    </div>
  );
}

function H2HOutcome({
  a,
  b,
  share,
  totalVotes,
  trend,
}: {
  a: ReturnType<typeof findCommittee>;
  b: ReturnType<typeof findCommittee>;
  share: number;
  totalVotes: number;
  trend: number[];
}) {
  if (!a || !b) return null;
  return (
    <div className="w-full">
      <p className="eyebrow text-center">Win Share</p>
      <div className="mt-3 flex h-3 w-full overflow-hidden border border-ink-700">
        <span style={{ width: `${share}%` }} className="bg-lime" />
        <span style={{ width: `${100 - share}%` }} className="bg-ember/80" />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-widest">
        <span className="text-lime">{a.shortName} · {share}%</span>
        <span className="text-ember">{b.shortName} · {100 - share}%</span>
      </div>

      <div className="mt-6">
        <p className="eyebrow text-center mb-2">Popularity Trend · 12wk</p>
        <BarTrend values={trend} width={300} height={64} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-ink-700/80 pt-4">
        <Mini label="Sample Size" value={totalVotes.toLocaleString()} />
        <Mini
          label="ELO Δ"
          value={`${(a.elo - b.elo) >= 0 ? "+" : ""}${a.elo - b.elo}`}
          accent={a.elo - b.elo >= 0}
        />
      </div>

      <p className="mt-4 italic-display text-sm text-ink-300 text-center">
        “{share >= 60 ? a.shortName : share <= 40 ? b.shortName : "Either"} carries
        the matchup” — derived from cumulative pairwise data.
      </p>
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

function Bar({ value, max, label, caption }: { value: number; max: number; label: string; caption: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[9px] uppercase tracking-widest text-ink-400 w-8">
        {caption}
      </span>
      <div className="relative h-1 flex-1 bg-ink-800">
        <span
          className="absolute inset-y-0 left-0 bg-lime"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="stat-num text-[10px] text-ink-200 w-9 text-right">{label}</span>
    </div>
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

function Insight({
  icon,
  title,
  stat,
  caption,
}: {
  icon: React.ReactNode;
  title: string;
  stat: string;
  caption: string;
}) {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2">
        {icon}
        <span className="eyebrow">{title}</span>
      </div>
      <p className="mt-3 stat-num text-5xl text-ink-50">{stat}</p>
      <p className="mt-2 italic-display text-base text-ink-300">{caption}</p>
    </div>
  );
}

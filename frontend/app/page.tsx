import Link from "next/link";
import { ArrowUpRight, Flame, TrendingUp } from "lucide-react";
import {
  SITE,
  PLATFORM_STATS,
  VOTE_MODES,
  CATEGORIES,
  sortedByElo,
  topByCategory,
  mostControversial,
  trendingUp,
} from "@/lib/constants";
import { Sparkline } from "@/components/Sparkline";
import { BarTrend } from "@/components/BarTrend";
import { CommitteeImage } from "@/components/CommitteeImage";
import { CategoryChip } from "@/components/CategoryChip";

const today = new Date("2026-05-09").toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

export default function LandingPage() {
  const top10 = sortedByElo().slice(0, 10);
  const controversy = mostControversial(1)[0];
  const trending = trendingUp(1)[0];

  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-10">
      {/* MASTHEAD */}
      <section className="border-b border-ink-100/90 pt-10 pb-8">
        <div className="flex items-baseline justify-between">
          <span className="eyebrow">{today.toUpperCase()}</span>
          <span className="eyebrow">
            Edition 0046 · {SITE.volume} {SITE.issue}
          </span>
        </div>
        <h1 className="mt-6 display text-[clamp(64px,12vw,180px)] text-ink-50">
          The Public
          <span className="italic-display text-lime"> Sentiment</span> Index.
        </h1>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12">
          <p className="md:col-span-7 italic-display text-2xl leading-tight text-ink-200">
            {SITE.manifesto}
          </p>
          <div className="md:col-span-5 grid grid-cols-3 gap-x-6 self-end border-l border-ink-700 pl-6">
            <Stat label="Committees" value={PLATFORM_STATS.committees.toString()} />
            <Stat
              label="Votes Today"
              value={`+${PLATFORM_STATS.votesToday.toLocaleString()}`}
              accent
            />
            <Stat
              label="Active"
              value={PLATFORM_STATS.activeNow.toString()}
            />
          </div>
        </div>
      </section>

      {/* VOTE MODES */}
      <section className="border-b border-ink-700/80 py-8">
        <div className="flex items-baseline justify-between">
          <span className="eyebrow">Cast Your Preference · Four Modalities</span>
          <Link
            href="/analytics"
            className="font-mono text-[11px] uppercase tracking-widest text-ink-300 hover:text-lime"
          >
            View Analytics →
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-px bg-ink-700/80 md:grid-cols-4">
          {VOTE_MODES.map((m, i) => (
            <Link
              key={m.id}
              href={m.path}
              className="group relative bg-ink-950 p-6 transition-colors hover:bg-ink-900"
            >
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
                0{i + 1} / {m.system}
              </span>
              <h3 className="mt-3 display text-5xl text-ink-50 group-hover:text-lime">
                {m.label}.
              </h3>
              <p className="mt-2 italic-display text-base text-ink-300">
                {m.caption}
              </p>
              <ArrowUpRight
                className="absolute right-5 top-5 text-ink-500 transition-colors group-hover:text-lime"
                size={18}
              />
            </Link>
          ))}
        </div>
      </section>

      {/* MAIN GRID */}
      <section className="grid grid-cols-1 gap-px bg-ink-700/80 md:grid-cols-12 md:[&>*]:bg-ink-950">
        {/* LEADERBOARD */}
        <div className="md:col-span-8 p-6 md:p-10">
          <header className="flex items-end justify-between border-b border-ink-100/80 pb-4">
            <div>
              <span className="eyebrow eyebrow-lime">§ 01 · Global Leaderboard</span>
              <h2 className="mt-2 display text-6xl text-ink-50">
                The Top <span className="italic-display">Ten</span>.
              </h2>
            </div>
            <span className="hidden md:block font-mono text-[10px] uppercase tracking-widest text-ink-400">
              Weighted ELO · 12-week trend
            </span>
          </header>

          <ol className="mt-2">
            {top10.map((c, i) => (
              <li
                key={c.id}
                className="group grid grid-cols-12 items-center gap-4 border-b border-ink-700/80 py-4 transition-colors hover:bg-ink-900"
              >
                <span className="col-span-1 stat-num text-2xl text-ink-300 group-hover:text-lime">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <CommitteeImage
                  slug={c.slug}
                  name={c.name}
                  className="col-span-1 h-12 w-12"
                />
                <div className="col-span-4">
                  <p className="text-base text-ink-50">{c.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <CategoryChip category={c.category} />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
                      {c.totalVotes.toLocaleString()} votes
                    </span>
                  </div>
                </div>
                <div className="col-span-3 hidden md:block">
                  <Sparkline values={c.sparkline} width={160} height={28} />
                </div>
                <div className="col-span-1 hidden text-right md:block">
                  <span
                    className={`stat-num text-sm ${
                      c.delta >= 0 ? "text-lime" : "text-ember"
                    }`}
                  >
                    {c.delta >= 0 ? "+" : ""}
                    {c.delta}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="stat-num text-2xl text-ink-50">{c.elo}</span>
                  <span className="ml-1 font-mono text-[10px] uppercase tracking-widest text-ink-400">
                    elo
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* CATEGORY LEADERS */}
        <div className="md:col-span-4 p-6 md:p-10">
          <header className="border-b border-ink-100/80 pb-4">
            <span className="eyebrow eyebrow-lime">§ 02 · Category Leaders</span>
            <h2 className="mt-2 display text-5xl text-ink-50">By <span className="italic-display">discipline</span>.</h2>
          </header>

          <ul className="divide-y divide-ink-700/80">
            {CATEGORIES.map((cat) => {
              const leader = topByCategory(cat.id, 1)[0];
              return (
                <li key={cat.id} className="py-5">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow">{cat.label}</span>
                    <span className="stat-num text-[10px] text-ink-400">
                      {cat.abbr}
                    </span>
                  </div>
                  <Link
                    href={`/analytics?category=${encodeURIComponent(cat.id)}`}
                    className="mt-3 flex items-center gap-3 group"
                  >
                    <CommitteeImage
                      slug={leader.slug}
                      name={leader.name}
                      className="h-11 w-11"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="display text-2xl text-ink-50 group-hover:text-lime truncate">
                        {leader.shortName}
                      </p>
                      <p className="italic-display text-xs text-ink-300 truncate">
                        {leader.tagline}
                      </p>
                    </div>
                    <span className="stat-num text-lg text-ink-200">
                      {leader.elo}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* CONTROVERSY + TREND */}
      <section className="mt-px grid grid-cols-1 gap-px bg-ink-700/80 md:grid-cols-12 md:[&>*]:bg-ink-950">
        {/* MOST CONTROVERSIAL */}
        <article className="md:col-span-7 p-6 md:p-10">
          <header className="flex items-center justify-between border-b border-ink-100/80 pb-4">
            <div className="flex items-center gap-3">
              <Flame size={18} className="text-ember" />
              <span className="eyebrow">§ 03 · Most Controversial</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
              Highest variance
            </span>
          </header>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="md:col-span-7">
              <div className="flex items-center gap-4">
                <CommitteeImage
                  slug={controversy.slug}
                  name={controversy.name}
                  className="h-20 w-20"
                />
                <div>
                  <CategoryChip category={controversy.category} />
                  <h3 className="mt-2 display text-5xl text-ink-50">
                    {controversy.shortName}
                  </h3>
                  <p className="italic-display text-lg text-ink-200">
                    “{controversy.tagline}”
                  </p>
                </div>
              </div>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-300">
                Polarising sentiment dominates this committee's profile. Roughly
                equal share of users place it in opposing tiers — a high-variance
                signature characteristic of brand-defining work that splits opinion.
              </p>
            </div>
            <div className="md:col-span-5">
              <p className="eyebrow mb-3">Vote distribution</p>
              <Distribution committee={controversy} />
              <div className="mt-4 grid grid-cols-3 border-t border-ink-700/80 pt-4">
                <Stat label="Variance" value={`${controversy.controversy}`} small />
                <Stat label="Votes" value={controversy.totalVotes.toLocaleString()} small />
                <Stat label="Delta" value={`${controversy.delta >= 0 ? "+" : ""}${controversy.delta}`} small accent={controversy.delta >= 0} />
              </div>
            </div>
          </div>
        </article>

        {/* TREND OF THE WEEK */}
        <article className="md:col-span-5 p-6 md:p-10">
          <header className="flex items-center justify-between border-b border-ink-100/80 pb-4">
            <div className="flex items-center gap-3">
              <TrendingUp size={18} className="text-lime" />
              <span className="eyebrow">§ 04 · Trend of the Week</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
              Sharpest gain
            </span>
          </header>
          <div className="mt-6">
            <div className="flex items-center gap-4">
              <CommitteeImage
                slug={trending.slug}
                name={trending.name}
                className="h-20 w-20"
              />
              <div>
                <CategoryChip category={trending.category} />
                <h3 className="mt-2 display text-5xl text-ink-50">
                  {trending.shortName}
                </h3>
                <p className="flex items-center gap-1 stat-num text-lime text-2xl">
                  <ArrowUpRight size={20} strokeWidth={1.5} />
                  +{trending.delta} ELO
                </p>
              </div>
            </div>

            <div className="mt-6">
              <BarTrend values={trending.sparkline} width={420} height={84} />
            </div>

            <p className="mt-4 italic-display text-base text-ink-200 leading-snug">
              “{trending.tagline}” — sentiment up sharply over the past week,
              pulled by category-wide engagement and a cluster of decisive
              pairwise wins.
            </p>
          </div>
        </article>
      </section>

      {/* CTA STRIP */}
      <section className="mt-px bg-lime text-ink-950">
        <div className="grid grid-cols-1 items-center gap-6 px-6 py-10 md:grid-cols-12 md:px-10">
          <div className="md:col-span-7">
            <span className="font-mono text-[11px] uppercase tracking-widest">
              Your turn
            </span>
            <h2 className="mt-2 display text-6xl">
              Cast a preference. <span className="italic-display">Shape the index.</span>
            </h2>
          </div>
          <div className="md:col-span-5 flex flex-wrap items-center justify-end gap-3">
            <Link href="/vote/swipe" className="btn-ghost border-ink-950 text-ink-950 hover:bg-ink-950 hover:text-lime">
              Swipe →
            </Link>
            <Link href="/vote/rank" className="btn-ghost border-ink-950 text-ink-950 hover:bg-ink-950 hover:text-lime">
              Rank →
            </Link>
            <Link href="/vote/tier" className="btn-ghost border-ink-950 text-ink-950 hover:bg-ink-950 hover:text-lime">
              Tier →
            </Link>
            <Link href="/vote/stars" className="btn-ghost border-ink-950 text-ink-950 hover:bg-ink-950 hover:text-lime">
              Star →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- helpers ---------- */

function Stat({
  label,
  value,
  accent,
  small,
}: {
  label: string;
  value: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="eyebrow">{label}</span>
      <span
        className={`stat-num ${small ? "text-xl" : "text-3xl md:text-4xl"} mt-1.5 ${
          accent ? "text-lime" : "text-ink-50"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Distribution({
  committee,
}: {
  committee: { sparkline: number[]; totalVotes: number };
}) {
  // build a fake distribution from sparkline last vals to look like S/A/B/C/D/F
  const segments = ["S", "A", "B", "C", "D", "F"];
  const base = committee.sparkline.slice(-6);
  const sum = base.reduce((a, b) => a + b, 0);
  const pcts = base.map((v) => Math.max(2, Math.round((v / sum) * 100)));
  const colors = ["#d4ff3a", "#9be0a8", "#7ec8ff", "#e8e4d8", "#b48a5a", "#ff4d3a"];
  return (
    <div>
      <div className="flex h-8 w-full overflow-hidden border border-ink-700">
        {pcts.map((p, i) => (
          <span
            key={segments[i]}
            style={{ width: `${p}%`, background: colors[i] }}
            className="block"
            title={`${segments[i]} · ${p}%`}
          />
        ))}
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

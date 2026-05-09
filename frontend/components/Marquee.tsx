import { trendingUp, mostControversial, PLATFORM_STATS } from "@/lib/constants";

export function Marquee() {
  const up = trendingUp(4);
  const hot = mostControversial(3);
  const items = [
    `Today · ${PLATFORM_STATS.votesToday.toLocaleString()} votes recorded`,
    ...up.map((c) => `▲ ${c.shortName} +${c.delta} ELO`),
    `Total · ${PLATFORM_STATS.totalVotes.toLocaleString()} preferences aggregated`,
    ...hot.map((c) => `◆ ${c.shortName} controversy ${c.controversy}`),
    `${PLATFORM_STATS.activeNow} active sessions`,
  ];

  const line = items.join("    ·    ");

  return (
    <div className="overflow-hidden border-b border-ink-700/80 bg-ink-900 py-2">
      <div className="marquee-track font-mono text-[10px] uppercase tracking-widest text-ink-300">
        <span className="px-6">{line}</span>
        <span className="px-6">{line}</span>
      </div>
    </div>
  );
}

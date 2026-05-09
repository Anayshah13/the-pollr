import Link from "next/link";
import { SITE, NAV_LINKS, PLATFORM_STATS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-ink-700/80">
      <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <h3 className="display text-5xl text-ink-50">{SITE.name}.</h3>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-300">
              {SITE.manifesto}
            </p>
            <p className="mt-6 italic-display text-base text-ink-200">
              Anonymous by design. Aggregated by mathematics. Disclosed by intent.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="eyebrow mb-4">Sections</p>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink-200 hover:text-lime"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="eyebrow mb-4">Live counters</p>
            <dl className="space-y-3 font-mono text-sm">
              <div className="flex items-baseline justify-between border-b border-ink-700/80 pb-2">
                <dt className="text-ink-300 text-[11px] uppercase tracking-widest">Total Votes</dt>
                <dd className="stat-num text-ink-50">
                  {PLATFORM_STATS.totalVotes.toLocaleString()}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-b border-ink-700/80 pb-2">
                <dt className="text-ink-300 text-[11px] uppercase tracking-widest">Today</dt>
                <dd className="stat-num text-lime">
                  +{PLATFORM_STATS.votesToday.toLocaleString()}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-b border-ink-700/80 pb-2">
                <dt className="text-ink-300 text-[11px] uppercase tracking-widest">Active Now</dt>
                <dd className="stat-num text-ink-50">{PLATFORM_STATS.activeNow}</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-ink-300 text-[11px] uppercase tracking-widest">Updated</dt>
                <dd className="text-ink-200 text-[11px] uppercase tracking-widest">
                  {PLATFORM_STATS.lastUpdated}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-ink-700/80 pt-6 text-[10px] uppercase tracking-widest text-ink-400 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Pollr Editorial · Prototype Build</span>
          <span>
            Disclaimer · No personal data is stored. All sentiment is aggregated.
          </span>
        </div>
      </div>
    </footer>
  );
}

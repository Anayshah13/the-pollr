/**
 * Google Analytics 4 helpers for Pollr.
 *
 * Measurement ID: set NEXT_PUBLIC_GA_MEASUREMENT_ID (e.g. G-XXXXXXXXXX).
 *
 * Events emitted (register as custom dimensions / mark as key events in GA4):
 *
 * | Event                    | Params (high-signal)                                      | Analysis use                          |
 * |--------------------------|-----------------------------------------------------------|---------------------------------------|
 * | page_view                | page_path, page_title, page_location                      | Funnel, landing, bounce               |
 * | cta_click                | cta_id, cta_label, cta_href, cta_location                 | Hero / nav conversion                 |
 * | nav_click                | link_label, link_href, nav_surface                        | Nav usage (desktop vs mobile)         |
 * | vote_mode_select         | vote_mode, source                                         | Mode preference                       |
 * | swipe_vote               | winner_id, loser_id, categories, pair_index, method       | Pairwise preference matrix            |
 * | swipe_skip               | pair_index, left_id, right_id                             | Uncertainty / friction                |
 * | swipe_undo               | pair_index                                                | Hesitation                            |
 * | swipe_session_complete   | decisions_count, pairs_total                              | Completion rate                       |
 * | swipe_session_reset      | decisions_count                                           | Re-engagement                         |
 * | rank_filter_change       | filter                                                    | Category interest                     |
 * | rank_submit              | filter, item_count, top_1..top_5, ranking_ids             | Ordered preference lists              |
 * | rank_reset               | filter                                                    | Abandon / redo                        |
 * | tier_assign              | committee_id, from_zone, to_zone, assigned_count          | Tier distribution                     |
 * | tier_reset               | assigned_count                                            | Abandon / redo                        |
 * | analytics_filter         | filter                                                    | Which leaderboards are viewed         |
 * | analytics_h2h_select     | side, committee_id, opponent_id                           | Comparison interest                   |
 * | outbound_click           | committee_id, destination, link_url                       | Instagram / external engagement       |
 */

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";

export const isGaEnabled = () =>
  typeof window !== "undefined" && Boolean(GA_MEASUREMENT_ID);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  if (!isGaEnabled() || typeof window.gtag !== "function") return;
  window.gtag(...args);
}

export function trackPageView(url: string, title?: string) {
  if (!GA_MEASUREMENT_ID) return;
  gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
    page_title: title ?? (typeof document !== "undefined" ? document.title : undefined),
    page_location:
      typeof window !== "undefined" ? window.location.href : undefined,
    send_page_view: true,
  });
}

type EventParams = Record<string, string | number | boolean | undefined | null>;

function cleanParams(params?: EventParams): Record<string, string | number | boolean> {
  if (!params) return {};
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    // GA4 custom params: keep strings short
    out[key] = typeof value === "string" ? value.slice(0, 100) : value;
  }
  return out;
}

export function trackEvent(name: string, params?: EventParams) {
  gtag("event", name, cleanParams(params));
}

/* ---------- typed domain helpers ---------- */

export function trackCtaClick(opts: {
  id: string;
  label: string;
  href: string;
  location: string;
}) {
  trackEvent("cta_click", {
    cta_id: opts.id,
    cta_label: opts.label,
    cta_href: opts.href,
    cta_location: opts.location,
  });
}

export function trackNavClick(opts: {
  label: string;
  href: string;
  surface: "desktop" | "mobile";
}) {
  trackEvent("nav_click", {
    link_label: opts.label,
    link_href: opts.href,
    nav_surface: opts.surface,
  });
}

export function trackVoteModeSelect(mode: string, source: string) {
  trackEvent("vote_mode_select", { vote_mode: mode, source });
}

export function trackSwipeVote(opts: {
  winnerId: string;
  loserId: string;
  winnerCategory: string;
  loserCategory: string;
  pairIndex: number;
  method: "swipe" | "button" | "card";
}) {
  trackEvent("swipe_vote", {
    winner_id: opts.winnerId,
    loser_id: opts.loserId,
    winner_category: opts.winnerCategory,
    loser_category: opts.loserCategory,
    pair_index: opts.pairIndex,
    method: opts.method,
  });
}

export function trackSwipeSkip(opts: {
  pairIndex: number;
  leftId: string;
  rightId: string;
}) {
  trackEvent("swipe_skip", {
    pair_index: opts.pairIndex,
    left_id: opts.leftId,
    right_id: opts.rightId,
  });
}

export function trackSwipeUndo(pairIndex: number) {
  trackEvent("swipe_undo", { pair_index: pairIndex });
}

export function trackSwipeSessionComplete(decisions: number, pairsTotal: number) {
  trackEvent("swipe_session_complete", {
    decisions_count: decisions,
    pairs_total: pairsTotal,
  });
}

export function trackSwipeSessionReset(decisions: number) {
  trackEvent("swipe_session_reset", { decisions_count: decisions });
}

export function trackRankFilterChange(filter: string) {
  trackEvent("rank_filter_change", { filter });
}

export function trackRankSubmit(opts: {
  filter: string;
  itemCount: number;
  rankingIds: string[];
}) {
  const top = opts.rankingIds.slice(0, 5);
  trackEvent("rank_submit", {
    filter: opts.filter,
    item_count: opts.itemCount,
    top_1: top[0],
    top_2: top[1],
    top_3: top[2],
    top_4: top[3],
    top_5: top[4],
    ranking_ids: opts.rankingIds.join(","),
  });
}

export function trackRankReset(filter: string) {
  trackEvent("rank_reset", { filter });
}

export function trackTierAssign(opts: {
  committeeId: string;
  fromZone: string;
  toZone: string;
  assignedCount: number;
}) {
  trackEvent("tier_assign", {
    committee_id: opts.committeeId,
    from_zone: opts.fromZone,
    to_zone: opts.toZone,
    assigned_count: opts.assignedCount,
  });
}

export function trackTierReset(assignedCount: number) {
  trackEvent("tier_reset", { assigned_count: assignedCount });
}

export function trackAnalyticsFilter(filter: string) {
  trackEvent("analytics_filter", { filter });
}

export function trackAnalyticsH2H(opts: {
  side: "A" | "B";
  committeeId: string;
  opponentId: string;
}) {
  trackEvent("analytics_h2h_select", {
    side: opts.side,
    committee_id: opts.committeeId,
    opponent_id: opts.opponentId,
  });
}

export function trackOutboundClick(opts: {
  committeeId: string;
  destination: string;
  url: string;
}) {
  trackEvent("outbound_click", {
    committee_id: opts.committeeId,
    destination: opts.destination,
    link_url: opts.url,
  });
}

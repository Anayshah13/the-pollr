export type Category =
  | "Student Chapters"
  | "Tech Committees"
  | "Clubs"
  | "SAE Teams"
  | "IETE Teams";

/** Static catalog fields (seeded from constants / GET /committees). */
export interface Committee {
  id: string;
  /** matches /public/committee_imgs/{slug}.jpg */
  slug: string;
  name: string;
  shortName: string;
  category: Category;
  tagline: string;
  established?: number | null;
  instagramUrl?: string | null;
}

export interface ModeScores {
  swipe: number | null;
  tier: number | null;
  rank: number | null;
  swipe_n: number;
  tier_n: number;
  rank_n: number;
}

export interface LeaderboardRow {
  rank: number;
  id: string;
  slug: string;
  name: string;
  short_name: string;
  category: Category;
  tagline: string;
  pollr_score: number | null;
  modes: ModeScores;
  sample_size: number;
  mode_coverage: number;
  win_rate: number | null;
  controversy: number | null;
  tier_distribution: Record<string, number>;
  delta: number | null;
  trend: number[];
}

export interface LeaderboardResponse {
  scope: string;
  methodology: string;
  total_committees: number;
  total_pairwise_votes: number;
  total_tier_ballots: number;
  total_rank_ballots: number;
  rows: LeaderboardRow[];
}

export interface HeadToHeadResponse {
  a: string;
  b: string;
  a_wins: number;
  b_wins: number;
  total: number;
  a_share: number | null;
  sufficient: boolean;
}

export interface InsightsResponse {
  most_controversial: LeaderboardRow | null;
  category_leaders: Partial<Record<Category, LeaderboardRow | null>>;
  methodology: string;
}

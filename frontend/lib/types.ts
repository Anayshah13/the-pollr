export type Category =
  | "Student Chapters"
  | "Tech Committees"
  | "Clubs"
  | "SAE Teams"
  | "IETE Teams";

export interface Committee {
  id: string;
  /** matches /public/committee_imgs/{slug}.jpg */
  slug: string;
  name: string;
  shortName: string;
  category: Category;
  tagline: string;
  established: number;
  followers: number;
  /** ELO rating */
  elo: number;
  totalVotes: number;
  /** 0–100 */
  winRate: number;
  /** 0–100, higher = more polarising */
  controversy: number;
  /** week-on-week ELO delta */
  delta: number;
  /** 12 data points, normalised 0–100 */
  sparkline: number[];
}

export interface HeadToHead {
  a: string;
  b: string;
  /** 0–100 win share for committee A */
  share: number;
  totalVotes: number;
  trend: number[];
}

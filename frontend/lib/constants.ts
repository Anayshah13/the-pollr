import type { Category, Committee, HeadToHead } from "./types";

export const SITE = {
  name: "Pollr",
  tagline: "The Public Sentiment Index",
  volume: "Vol. IV",
  issue: "No. 12",
  edition: "Saturday Edition",
  manifesto:
    "Aggregated preference data across forty-six student bodies, four input modalities, one weighted score. Updated continuously. Anonymous by design.",
};

export const CATEGORIES: { id: Category; label: string; abbr: string }[] = [
  { id: "Student Chapters", label: "Student Chapters", abbr: "SC" },
  { id: "Tech Committees", label: "Tech Committees", abbr: "TC" },
  { id: "Clubs", label: "Clubs", abbr: "CL" },
  { id: "SAE Teams", label: "SAE Teams", abbr: "SAE" },
  { id: "IETE Teams", label: "IETE Teams", abbr: "IETE" },
];

const sp = (...n: number[]) => n;

export const COMMITTEES: Committee[] = [
  // Student Chapters
  { id: "ieee", slug: "ieee", name: "IEEE Student Chapter", shortName: "IEEE", category: "Student Chapters", tagline: "Engineers, signals, and the noise between.", established: 1998, followers: 12480, elo: 1842, totalVotes: 1192, winRate: 71.4, controversy: 18, delta: 24, sparkline: sp(48,52,55,58,61,60,64,66,69,72,74,78) },
  { id: "acm", slug: "acm", name: "ACM Student Chapter", shortName: "ACM", category: "Student Chapters", tagline: "Computing machinery, made human.", established: 2004, followers: 9320, elo: 1801, totalVotes: 1044, winRate: 68.2, controversy: 22, delta: 18, sparkline: sp(40,44,46,49,52,55,57,60,62,65,68,71) },
  { id: "djscsi", slug: "djscsi", name: "DJS Computer Society of India", shortName: "CSI", category: "Student Chapters", tagline: "Codebases, careers, and community.", established: 2007, followers: 8210, elo: 1764, totalVotes: 982, winRate: 64.8, controversy: 27, delta: 9, sparkline: sp(50,52,49,52,55,53,56,58,59,61,62,64) },
  { id: "iete", slug: "iete", name: "IETE Student Chapter", shortName: "IETE", category: "Student Chapters", tagline: "Telecommunications and beyond.", established: 2001, followers: 6890, elo: 1702, totalVotes: 814, winRate: 60.1, controversy: 31, delta: -4, sparkline: sp(60,58,57,55,57,58,55,56,54,55,53,52) },
  { id: "iic", slug: "iic", name: "Institution Innovation Council", shortName: "IIC", category: "Student Chapters", tagline: "From idea to incubation.", established: 2018, followers: 4120, elo: 1612, totalVotes: 510, winRate: 55.4, controversy: 36, delta: 14, sparkline: sp(35,38,41,40,42,45,47,46,49,52,54,57) },
  { id: "isaca", slug: "isaca", name: "ISACA Student Chapter", shortName: "ISACA", category: "Student Chapters", tagline: "Audit, govern, secure.", established: 2015, followers: 3850, elo: 1588, totalVotes: 472, winRate: 53.7, controversy: 24, delta: 6, sparkline: sp(42,43,45,44,46,47,49,48,50,51,53,54) },
  { id: "gdg", slug: "gdg", name: "Google Developer Group", shortName: "GDG", category: "Student Chapters", tagline: "Build with Google. Build for the world.", established: 2019, followers: 7430, elo: 1748, totalVotes: 911, winRate: 63.2, controversy: 19, delta: 21, sparkline: sp(45,48,51,53,55,58,60,62,65,68,70,73) },
  { id: "isme", slug: "isme", name: "ISME Student Chapter", shortName: "ISME", category: "Student Chapters", tagline: "Mechanical minds, moving parts.", established: 2010, followers: 3210, elo: 1542, totalVotes: 411, winRate: 51.2, controversy: 29, delta: -2, sparkline: sp(50,51,49,52,50,53,51,52,50,51,49,48) },
  { id: "ecell", slug: "ecell", name: "Entrepreneurship Cell", shortName: "E-Cell", category: "Student Chapters", tagline: "Founders, in the making.", established: 2012, followers: 11240, elo: 1819, totalVotes: 1098, winRate: 69.4, controversy: 41, delta: 32, sparkline: sp(44,46,49,52,56,58,62,65,68,72,75,79) },
  { id: "nsdc", slug: "nsdc", name: "NSDC Cell", shortName: "NSDC", category: "Student Chapters", tagline: "Skills for tomorrow's economy.", established: 2016, followers: 2640, elo: 1488, totalVotes: 354, winRate: 47.8, controversy: 22, delta: -6, sparkline: sp(58,57,56,54,55,53,52,51,50,49,48,47) },

  // Tech Committees
  { id: "codestars", slug: "codestars", name: "Codestars", shortName: "Codestars", category: "Tech Committees", tagline: "Where competitive coders are forged.", established: 2014, followers: 5840, elo: 1726, totalVotes: 882, winRate: 62.1, controversy: 21, delta: 11, sparkline: sp(46,48,50,52,53,56,57,59,61,63,65,67) },
  { id: "codeai", slug: "codeai", name: "CodeAI", shortName: "CodeAI", category: "Tech Committees", tagline: "Models, math, and machine intuition.", established: 2020, followers: 4920, elo: 1689, totalVotes: 814, winRate: 59.7, controversy: 38, delta: 17, sparkline: sp(40,43,46,48,51,54,57,59,62,65,67,70) },
  { id: "infomatrix", slug: "infomatrix", name: "Infomatrix", shortName: "Infomatrix", category: "Tech Committees", tagline: "The annual technical festival.", established: 1995, followers: 14820, elo: 1898, totalVotes: 1410, winRate: 74.6, controversy: 33, delta: 28, sparkline: sp(52,55,58,62,64,68,70,73,76,80,83,87) },
  { id: "init", slug: "init", name: "Init", shortName: "Init", category: "Tech Committees", tagline: "First-year on-ramp to engineering.", established: 2017, followers: 3120, elo: 1554, totalVotes: 442, winRate: 50.4, controversy: 26, delta: 4, sparkline: sp(44,45,46,47,48,49,50,51,52,53,54,55) },
  { id: "synapse", slug: "synapse", name: "Synapse", shortName: "Synapse", category: "Tech Committees", tagline: "Neural pathways across departments.", established: 2018, followers: 2890, elo: 1532, totalVotes: 401, winRate: 49.1, controversy: 31, delta: 2, sparkline: sp(48,49,48,50,49,51,50,52,51,53,52,54) },
  { id: "compute", slug: "compute", name: "Compute", shortName: "Compute", category: "Tech Committees", tagline: "Systems, networks, infrastructure.", established: 2013, followers: 4310, elo: 1648, totalVotes: 712, winRate: 56.4, controversy: 23, delta: 8, sparkline: sp(45,46,48,49,51,52,54,55,57,58,60,61) },
  { id: "unicode", slug: "unicode", name: "Unicode", shortName: "Unicode", category: "Tech Committees", tagline: "Web, app, and product engineering.", established: 2016, followers: 6210, elo: 1735, totalVotes: 894, winRate: 62.8, controversy: 19, delta: 15, sparkline: sp(48,50,52,55,57,59,61,63,65,67,69,71) },
  { id: "robocon", slug: "robocon", name: "Robocon", shortName: "Robocon", category: "Tech Committees", tagline: "Autonomous machines, championship rules.", established: 2008, followers: 7820, elo: 1771, totalVotes: 962, winRate: 65.4, controversy: 27, delta: 19, sparkline: sp(42,45,48,51,54,57,60,62,65,68,70,73) },
  { id: "s4ds", slug: "s4ds", name: "Statistics for Data Science", shortName: "S4DS", category: "Tech Committees", tagline: "Distributions, decisions, dashboards.", established: 2019, followers: 3540, elo: 1597, totalVotes: 524, winRate: 54.0, controversy: 25, delta: 7, sparkline: sp(46,47,49,50,52,53,55,56,58,59,61,62) },
  { id: "sigai", slug: "sigai", name: "SIG AI", shortName: "SIG AI", category: "Tech Committees", tagline: "Special interest. Generally intelligent.", established: 2021, followers: 4180, elo: 1631, totalVotes: 612, winRate: 56.9, controversy: 34, delta: 13, sparkline: sp(40,42,45,48,50,53,55,57,60,62,65,67) },

  // Clubs
  { id: "arya", slug: "arya", name: "Arya", shortName: "Arya", category: "Clubs", tagline: "The cultural heartbeat.", established: 1989, followers: 16240, elo: 1912, totalVotes: 1488, winRate: 76.2, controversy: 21, delta: 31, sparkline: sp(54,57,60,63,66,69,72,75,78,81,84,87) },
  { id: "litsoc", slug: "litsoc", name: "Literary Society", shortName: "LitSoc", category: "Clubs", tagline: "Words, weighted.", established: 1996, followers: 5210, elo: 1684, totalVotes: 798, winRate: 59.4, controversy: 28, delta: 12, sparkline: sp(46,48,50,52,54,56,58,60,62,64,66,68) },
  { id: "munsoc", slug: "munsoc", name: "MUN Society", shortName: "MUNSoc", category: "Clubs", tagline: "Diplomacy, debated.", established: 2001, followers: 4120, elo: 1622, totalVotes: 612, winRate: 55.8, controversy: 32, delta: 6, sparkline: sp(48,49,51,52,53,55,56,57,59,60,61,62) },
  { id: "beats", slug: "beats", name: "Beats", shortName: "Beats", category: "Clubs", tagline: "The music collective.", established: 2003, followers: 8920, elo: 1788, totalVotes: 1024, winRate: 66.7, controversy: 24, delta: 18, sparkline: sp(50,52,55,57,60,62,65,67,70,72,75,77) },
  { id: "dhadak", slug: "dhadak", name: "Dhadak", shortName: "Dhadak", category: "Clubs", tagline: "Dance, in heartbeats.", established: 2005, followers: 9810, elo: 1812, totalVotes: 1102, winRate: 68.3, controversy: 26, delta: 22, sparkline: sp(48,51,54,57,60,63,66,69,72,75,78,81) },
  { id: "aura", slug: "aura", name: "Aura", shortName: "Aura", category: "Clubs", tagline: "Fashion as language.", established: 2009, followers: 6420, elo: 1716, totalVotes: 856, winRate: 61.4, controversy: 44, delta: 14, sparkline: sp(45,47,50,52,54,57,59,61,64,66,68,71) },
  { id: "djsantariksh", slug: "djsantariksh", name: "DJS Antariksh", shortName: "Antariksh", category: "Clubs", tagline: "Astronomy, made earthly.", established: 2011, followers: 5310, elo: 1675, totalVotes: 781, winRate: 58.9, controversy: 23, delta: 16, sparkline: sp(44,46,49,51,54,56,59,61,64,66,69,71) },
  { id: "express", slug: "express", name: "Express", shortName: "Express", category: "Clubs", tagline: "The publication of record.", established: 1998, followers: 7240, elo: 1742, totalVotes: 902, winRate: 63.6, controversy: 19, delta: 17, sparkline: sp(47,49,51,53,55,58,60,62,64,67,69,71) },
  { id: "miles", slug: "miles", name: "Miles", shortName: "Miles", category: "Clubs", tagline: "Service, in motion.", established: 2002, followers: 3920, elo: 1602, totalVotes: 581, winRate: 54.7, controversy: 20, delta: 5, sparkline: sp(46,47,48,50,51,52,53,54,55,56,57,58) },
  { id: "trinity", slug: "trinity", name: "Trinity", shortName: "Trinity", category: "Clubs", tagline: "Theatre, dramatised.", established: 2007, followers: 4810, elo: 1654, totalVotes: 712, winRate: 57.8, controversy: 30, delta: 11, sparkline: sp(45,47,49,51,53,55,57,59,61,63,65,67) },
  { id: "nova", slug: "nova", name: "Nova", shortName: "Nova", category: "Clubs", tagline: "Innovation, sparked.", established: 2014, followers: 3680, elo: 1592, totalVotes: 542, winRate: 53.8, controversy: 27, delta: 8, sparkline: sp(44,46,47,49,51,52,54,55,57,58,60,61) },
  { id: "panache", slug: "panache", name: "Panache", shortName: "Panache", category: "Clubs", tagline: "The runway showcase.", established: 2010, followers: 6890, elo: 1729, totalVotes: 884, winRate: 62.4, controversy: 39, delta: 13, sparkline: sp(46,48,51,53,55,58,60,62,65,67,69,72) },
  { id: "impulse", slug: "impulse", name: "Impulse", shortName: "Impulse", category: "Clubs", tagline: "Sports, sharpened.", established: 2006, followers: 5420, elo: 1681, totalVotes: 794, winRate: 59.1, controversy: 22, delta: 9, sparkline: sp(47,49,51,53,55,57,59,61,63,65,67,69) },
  { id: "tedx", slug: "tedx", name: "TEDx DJSCE", shortName: "TEDx", category: "Clubs", tagline: "Ideas worth amplifying.", established: 2015, followers: 8420, elo: 1779, totalVotes: 988, winRate: 65.8, controversy: 25, delta: 20, sparkline: sp(48,51,53,56,58,61,64,66,69,72,74,77) },
  { id: "phoenix", slug: "phoenix", name: "Phoenix", shortName: "Phoenix", category: "Clubs", tagline: "Athletics committee.", established: 2008, followers: 4210, elo: 1614, totalVotes: 624, winRate: 55.2, controversy: 21, delta: 4, sparkline: sp(45,46,48,49,51,52,53,55,56,57,59,60) },
  { id: "skylark", slug: "skylark", name: "Skylark", shortName: "Skylark", category: "Clubs", tagline: "Adventure & trekking.", established: 2013, followers: 2980, elo: 1521, totalVotes: 392, winRate: 49.4, controversy: 18, delta: -3, sparkline: sp(53,52,51,50,49,48,49,48,47,48,47,46) },
  { id: "nss", slug: "nss", name: "National Service Scheme", shortName: "NSS", category: "Clubs", tagline: "Service before self.", established: 1985, followers: 3410, elo: 1568, totalVotes: 461, winRate: 52.4, controversy: 17, delta: 3, sparkline: sp(48,49,50,50,51,52,52,53,53,54,55,56) },

  // SAE Teams
  { id: "sae", slug: "sae", name: "SAE Collegiate Club", shortName: "SAE", category: "SAE Teams", tagline: "Vehicles, velocity, victory.", established: 1992, followers: 7820, elo: 1768, totalVotes: 942, winRate: 64.8, controversy: 20, delta: 16, sparkline: sp(48,50,52,54,57,59,61,63,65,67,69,71) },
  { id: "karting", slug: "karting", name: "Team Karting", shortName: "Karting", category: "SAE Teams", tagline: "Carbon-fiber. Apex hunter.", established: 2009, followers: 5940, elo: 1714, totalVotes: 821, winRate: 61.7, controversy: 22, delta: 14, sparkline: sp(46,48,50,52,55,57,59,61,63,65,68,70) },
  { id: "racing", slug: "racing", name: "Team Racing", shortName: "Racing", category: "SAE Teams", tagline: "Formula collegiate.", established: 2007, followers: 6420, elo: 1738, totalVotes: 874, winRate: 63.2, controversy: 25, delta: 17, sparkline: sp(47,49,52,54,57,59,62,64,66,69,71,74) },
  { id: "speedsters", slug: "speedsters", name: "Team Speedsters", shortName: "Speedsters", category: "SAE Teams", tagline: "Supra. Sustained.", established: 2011, followers: 4820, elo: 1652, totalVotes: 728, winRate: 57.4, controversy: 26, delta: 9, sparkline: sp(46,47,49,51,52,54,56,57,59,61,62,64) },
  { id: "astra", slug: "astra", name: "Team Astra", shortName: "Astra", category: "SAE Teams", tagline: "All-terrain ambitions.", established: 2014, followers: 3920, elo: 1598, totalVotes: 612, winRate: 54.2, controversy: 23, delta: 6, sparkline: sp(45,46,48,49,51,52,54,55,57,58,60,61) },
  { id: "helios", slug: "helios", name: "Team Helios", shortName: "Helios", category: "SAE Teams", tagline: "Solar-powered, future-bound.", established: 2016, followers: 4210, elo: 1624, totalVotes: 658, winRate: 55.8, controversy: 21, delta: 11, sparkline: sp(44,46,48,50,52,54,56,58,60,62,64,66) },
  { id: "kronos", slug: "kronos", name: "Team Kronos", shortName: "Kronos", category: "SAE Teams", tagline: "Endurance, engineered.", established: 2015, followers: 3640, elo: 1576, totalVotes: 542, winRate: 52.1, controversy: 24, delta: 5, sparkline: sp(46,47,48,49,50,51,52,53,54,55,56,57) },

  // IETE Teams
  { id: "microminds", slug: "microminds", name: "Microminds", shortName: "Microminds", category: "IETE Teams", tagline: "Embedded, by intent.", established: 2012, followers: 3210, elo: 1564, totalVotes: 472, winRate: 51.4, controversy: 22, delta: 7, sparkline: sp(45,46,47,48,49,50,51,52,53,54,55,56) },
  { id: "consulting", slug: "consulting", name: "IETE Consulting", shortName: "Consulting", category: "IETE Teams", tagline: "Strategy, simulated.", established: 2017, followers: 2740, elo: 1502, totalVotes: 384, winRate: 48.2, controversy: 26, delta: -1, sparkline: sp(50,49,48,49,48,49,48,47,48,47,48,47) },
];

export const HEAD_TO_HEAD: HeadToHead[] = [
  { a: "ieee", b: "acm", share: 58, totalVotes: 412, trend: sp(52,53,55,56,57,57,58,59,58,59,58,58) },
  { a: "arya", b: "infomatrix", share: 54, totalVotes: 388, trend: sp(48,50,51,52,53,54,55,55,54,55,54,54) },
  { a: "djsantariksh", b: "arya", share: 36, totalVotes: 302, trend: sp(40,38,37,36,37,35,36,35,34,36,35,36) },
  { a: "racing", b: "karting", share: 61, totalVotes: 274, trend: sp(55,56,57,59,60,61,61,62,61,62,61,61) },
  { a: "ecell", b: "iic", share: 67, totalVotes: 318, trend: sp(60,62,63,64,65,66,66,67,67,67,67,67) },
];

export const PLATFORM_STATS = {
  totalVotes: 248341,
  votesToday: 8432,
  activeNow: 142,
  committees: COMMITTEES.length,
  lastUpdated: "2 minutes ago",
};

export const TIERS = [
  { id: "S", label: "S", caption: "Sublime", accent: "#d4ff3a" },
  { id: "A", label: "A", caption: "Excellent", accent: "#9be0a8" },
  { id: "B", label: "B", caption: "Good", accent: "#7ec8ff" },
  { id: "C", label: "C", caption: "Average", accent: "#e8e4d8" },
  { id: "D", label: "D", caption: "Below", accent: "#b48a5a" },
  { id: "F", label: "F", caption: "Failing", accent: "#ff4d3a" },
] as const;

export type TierId = (typeof TIERS)[number]["id"];

export const VOTE_MODES = [
  { id: "swipe", label: "Swipe", caption: "Pairwise", path: "/vote/swipe", system: "ELO" },
  { id: "stars", label: "Stars", caption: "1–5 Rating", path: "/vote/stars", system: "Mean" },
  { id: "tier", label: "Tier", caption: "S → F", path: "/vote/tier", system: "Bucket" },
  { id: "rank", label: "Rank", caption: "Direct Order", path: "/vote/rank", system: "Borda" },
] as const;

export const NAV_LINKS = [
  { href: "/", label: "Index" },
  { href: "/vote/swipe", label: "Swipe" },
  { href: "/vote/stars", label: "Stars" },
  { href: "/vote/tier", label: "Tier" },
  { href: "/vote/rank", label: "Rank" },
  { href: "/analytics", label: "Analytics" },
];

// Derived helpers
export const byCategory = (cat: Category) =>
  COMMITTEES.filter((c) => c.category === cat);

export const sortedByElo = () =>
  [...COMMITTEES].sort((a, b) => b.elo - a.elo);

export const topByCategory = (cat: Category, n = 1) =>
  byCategory(cat).sort((a, b) => b.elo - a.elo).slice(0, n);

export const mostControversial = (n = 5) =>
  [...COMMITTEES].sort((a, b) => b.controversy - a.controversy).slice(0, n);

export const trendingUp = (n = 5) =>
  [...COMMITTEES].sort((a, b) => b.delta - a.delta).slice(0, n);

export const findCommittee = (id: string) =>
  COMMITTEES.find((c) => c.id === id);

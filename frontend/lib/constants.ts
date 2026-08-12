import type { Category, Committee } from "./types";

export const SITE = {
  name: "Pollr",
  tagline: "The Public Sentiment Index",
  volume: "Vol. IV",
  issue: "No. 12",
  manifesto:
    "Forty-six committees. Three ways to vote. One live Pollr Score. Anonymous, always.",
};

export const CATEGORIES: { id: Category; label: string; abbr: string }[] = [
  { id: "Student Chapters", label: "Student Chapters", abbr: "SC" },
  { id: "Tech Committees", label: "Tech Committees", abbr: "TC" },
  { id: "Clubs", label: "Clubs", abbr: "CL" },
  { id: "SAE Teams", label: "SAE Teams", abbr: "SAE" },
  { id: "IETE Teams", label: "IETE Teams", abbr: "IETE" },
];

export const COMMITTEES: Committee[] = [
  // Student Chapters
  { id: "acm", slug: "acm", name: "DJS ACM", shortName: "ACM", category: "Student Chapters", tagline: "Computing machinery, made human.", established: 2004 },
  { id: "sigai", slug: "sigai", name: "DJS ACM SIGAI", shortName: "SIGAI", category: "Student Chapters", tagline: "Special interest. Generally intelligent.", established: 2021 },
  { id: "djscsi", slug: "djscsi", name: "DJS CSI", shortName: "CSI", category: "Student Chapters", tagline: "Codebases, careers, and community.", established: 2007 },
  { id: "iete", slug: "iete", name: "DJS IETE", shortName: "IETE", category: "Student Chapters", tagline: "Telecommunications and beyond.", established: 2001 },
  { id: "isme", slug: "isme", name: "DJS ISME", shortName: "ISME", category: "Student Chapters", tagline: "Mechanical minds, moving parts.", established: 2010 },
  { id: "sae", slug: "sae", name: "DJS SAE", shortName: "SAE", category: "Student Chapters", tagline: "Vehicles, velocity, victory.", established: 1992 },
  { id: "s4ds", slug: "s4ds", name: "DJS S4DS", shortName: "S4DS", category: "Student Chapters", tagline: "Distributions, decisions, dashboards.", established: 2019 },
  { id: "isaca", slug: "isaca", name: "DJS ISACA", shortName: "ISACA", category: "Student Chapters", tagline: "Audit, govern, secure.", established: 2015 },
  { id: "nsdc", slug: "nsdc", name: "DJS NSDC", shortName: "NSDC", category: "Student Chapters", tagline: "Skills for tomorrow's economy.", established: 2016 },
  { id: "gdg", slug: "gdg", name: "DJS GDSC", shortName: "GDSC", category: "Student Chapters", tagline: "Build with Google. Build for the world.", established: 2019 },
  { id: "ieee", slug: "ieee", name: "DJS IEEE", shortName: "IEEE", category: "Student Chapters", tagline: "Engineers, signals, and the noise between.", established: 1998 },

  // Tech Committees
  { id: "unicode", slug: "unicode", name: "DJS Unicode", shortName: "Unicode", category: "Tech Committees", tagline: "Web, app, and product engineering.", established: 2016 },
  { id: "synapse", slug: "synapse", name: "DJS Synapse", shortName: "Synapse", category: "Tech Committees", tagline: "Neural pathways across departments.", established: 2018 },
  { id: "init", slug: "init", name: "DJS Init.ai", shortName: "Init.ai", category: "Tech Committees", tagline: "First-year on-ramp to engineering.", established: 2017 },
  { id: "codeai", slug: "codeai", name: "DJS CodeAI", shortName: "CodeAI", category: "Tech Committees", tagline: "Models, math, and machine intuition.", established: 2020 },
  { id: "compute", slug: "compute", name: "DJS Compute", shortName: "Compute", category: "Tech Committees", tagline: "Systems, networks, infrastructure.", established: 2013 },
  { id: "microminds", slug: "microminds", name: "DJS Microminds", shortName: "Microminds", category: "Tech Committees", tagline: "Embedded, by intent.", established: 2012 },
  { id: "infomatrix", slug: "infomatrix", name: "DJS Infomatrix", shortName: "Infomatrix", category: "Tech Committees", tagline: "The annual technical festival.", established: 1995 },

  // Clubs
  { id: "iic", slug: "iic", name: "DJS IIC", shortName: "IIC", category: "Clubs", tagline: "From idea to incubation.", established: 2018 },
  { id: "trinity", slug: "trinity", name: "DJS Trinity", shortName: "Trinity", category: "Clubs", tagline: "Theatre, dramatised.", established: 2007 },
  { id: "nss", slug: "nss", name: "DJS NSS", shortName: "NSS", category: "Clubs", tagline: "Service before self.", established: 1985 },
  { id: "codestars", slug: "codestars", name: "DJS Codestars", shortName: "Codestars", category: "Clubs", tagline: "Where competitive coders are forged.", established: 2014 },
  { id: "litsoc", slug: "litsoc", name: "DJS LITSOC", shortName: "LITSOC", category: "Clubs", tagline: "Words, weighted.", established: 1996 },
  { id: "beats", slug: "beats", name: "DJS Beats", shortName: "Beats", category: "Clubs", tagline: "The music collective.", established: 2003 },
  { id: "aura", slug: "aura", name: "DJS Aura", shortName: "Aura", category: "Clubs", tagline: "Fashion as language.", established: 2009 },
  { id: "panache", slug: "panache", name: "DJS Panache", shortName: "Panache", category: "Clubs", tagline: "The runway showcase.", established: 2010 },
  { id: "dhadak", slug: "dhadak", name: "DJS Dhadak", shortName: "Dhadak", category: "Clubs", tagline: "Dance, in heartbeats.", established: 2005 },
  { id: "express", slug: "express", name: "DJS Express", shortName: "Express", category: "Clubs", tagline: "The publication of record.", established: 1998 },
  { id: "munsoc", slug: "munsoc", name: "DJS MUNSOC", shortName: "MUNSOC", category: "Clubs", tagline: "Diplomacy, debated.", established: 2001 },
  { id: "ecell", slug: "ecell", name: "DJS E-Cell", shortName: "E-Cell", category: "Clubs", tagline: "Founders, in the making.", established: 2012 },
  { id: "nova", slug: "nova", name: "DJS NOVA", shortName: "NOVA", category: "Clubs", tagline: "Innovation, sparked.", established: 2014 },
  { id: "consulting", slug: "consulting", name: "DJS Consulting Group (DCG)", shortName: "DCG", category: "Clubs", tagline: "Strategy, simulated.", established: 2017 },
  { id: "tedx", slug: "tedx", name: "DJS TEDx", shortName: "TEDx", category: "Clubs", tagline: "Ideas worth amplifying.", established: 2015 },

  // SAE Teams
  { id: "racing", slug: "racing", name: "DJS Racing", shortName: "Racing", category: "SAE Teams", tagline: "Formula collegiate.", established: 2007 },
  { id: "karting", slug: "karting", name: "DJS Karting", shortName: "Karting", category: "SAE Teams", tagline: "Carbon-fiber. Apex hunter.", established: 2009 },
  { id: "skylark", slug: "skylark", name: "DJS Skylark", shortName: "Skylark", category: "SAE Teams", tagline: "Adventure & trekking.", established: 2013 },
  { id: "helios", slug: "helios", name: "DJS Helios", shortName: "Helios", category: "SAE Teams", tagline: "Solar-powered, future-bound.", established: 2016 },
  { id: "phoenix", slug: "phoenix", name: "DJS Phoenix", shortName: "Phoenix", category: "SAE Teams", tagline: "Athletics committee.", established: 2008 },
  { id: "speedsters", slug: "speedsters", name: "DJS Speedster", shortName: "Speedster", category: "SAE Teams", tagline: "Supra. Sustained.", established: 2011 },
  { id: "miles", slug: "miles", name: "DJS Miles", shortName: "Miles", category: "SAE Teams", tagline: "Service, in motion.", established: 2002 },
  { id: "astra", slug: "astra", name: "DJS Astra", shortName: "Astra", category: "SAE Teams", tagline: "All-terrain ambitions.", established: 2014 },
  { id: "kronos", slug: "kronos", name: "DJS Kronos", shortName: "Kronos", category: "SAE Teams", tagline: "Endurance, engineered.", established: 2015 },
  { id: "impulse", slug: "impulse", name: "DJS Impulse", shortName: "Impulse", category: "SAE Teams", tagline: "Sports, sharpened.", established: 2006 },
  { id: "robocon", slug: "robocon", name: "DJS Robocon", shortName: "Robocon", category: "SAE Teams", tagline: "Autonomous machines, championship rules.", established: 2008 },

  // IETE Teams
  { id: "djsantariksh", slug: "djsantariksh", name: "DJS Antariksh", shortName: "Antariksh", category: "IETE Teams", tagline: "Astronomy, made earthly.", established: 2011 },
  { id: "arya", slug: "arya", name: "DJS Arya", shortName: "Arya", category: "IETE Teams", tagline: "The cultural heartbeat.", established: 1989 },
];

/** Official Instagram URLs keyed by committee `id`. */
export const COMMITTEE_INSTAGRAM_LINKS: Record<string, string> = {
  acm: "https://www.instagram.com/djsanghvi_acm/",
  djsantariksh: "https://www.instagram.com/djsantariksh/",
  arya: "https://www.instagram.com/djs_arya/",
  astra: "https://www.instagram.com/djs.astra/",
  aura: "https://www.instagram.com/aura.djsce/",
  beats: "https://www.instagram.com/beats.djs/",
  codeai: "https://www.instagram.com/djscodeai/",
  codestars: "https://www.instagram.com/djsce_codestars/",
  compute: "https://www.instagram.com/djscompute/",
  consulting: "https://www.instagram.com/djsconsultinggroup/",
  djscsi: "https://www.instagram.com/djs.csi/",
  dhadak: "https://www.instagram.com/dhadak.djsce/",
  ecell: "https://www.instagram.com/ecell_djsce/",
  express: "https://www.instagram.com/djsce.express/",
  gdg: "https://www.instagram.com/gdg_djsce/",
  helios: "https://www.instagram.com/djs_helios/",
  ieee: "https://www.instagram.com/djs_ieee/",
  iete: "https://www.instagram.com/djsce_iete/",
  iic: "https://www.instagram.com/iic_djsce/",
  impulse: "https://www.instagram.com/djs_impulse/",
  infomatrix: "https://www.instagram.com/djsinfomatrix/",
  init: "https://www.instagram.com/djs_init.ai/",
  isaca: "https://www.instagram.com/isacadjsce/",
  isme: "https://www.instagram.com/djsce_isme/",
  karting: "https://www.instagram.com/djskartingindia/",
  kronos: "https://www.instagram.com/djs_kronos_india/",
  litsoc: "https://www.instagram.com/djsce_litsoc/",
  microminds: "https://www.instagram.com/djs.microminds/",
  miles: "https://www.instagram.com/djs_miles/",
  munsoc: "https://www.instagram.com/djsce_munsoc/",
  nova: "https://www.instagram.com/djs.nova/",
  nsdc: "https://www.instagram.com/djs.nsdc/",
  nss: "https://www.instagram.com/nss_djsanghvi/",
  panache: "https://www.instagram.com/panache.djsce/",
  phoenix: "https://www.instagram.com/djscephoenix/",
  racing: "https://www.instagram.com/djsracingindia/",
  robocon: "https://www.instagram.com/djsrobocon/",
  s4ds: "https://www.instagram.com/djs_s4ds/",
  sae: "https://www.instagram.com/djsce_sae/",
  sigai: "https://www.instagram.com/djs_sigai/",
  skylark: "https://www.instagram.com/djsskylark/",
  speedsters: "https://www.instagram.com/djs_speedsters/",
  synapse: "https://www.instagram.com/synapse.djsce/",
  tedx: "https://www.instagram.com/tedxdjsce/",
  trinity: "https://www.instagram.com/djsce.trinity/",
  unicode: "https://www.instagram.com/unicode.djsce/",
};

export const TIERS = [
  { id: "S", label: "S", caption: "Godlike", accent: "#d4ff3a" },
  { id: "A", label: "A", caption: "Excellent", accent: "#9be0a8" },
  { id: "B", label: "B", caption: "Good", accent: "#7ec8ff" },
  { id: "C", label: "C", caption: "Average", accent: "#c4b8a0" },
  { id: "F", label: "F", caption: "Failure", accent: "#ff4d3a" },
] as const;

export type TierId = (typeof TIERS)[number]["id"];

export const VOTE_MODES = [
  {
    id: "swipe",
    label: "tinder swipe mode!",
    shortLabel: "Swipe",
    caption: "Snap left or right — pairwise picks that feed the live Pollr Score.",
    path: "/vote/swipe",
    system: "Pairwise",
  },
  {
    id: "tier",
    label: "tierlist!",
    shortLabel: "Tier",
    caption: "Sort every committee into S through F. Gut check, then lock it.",
    path: "/vote/tier",
    system: "Bucket",
  },
  {
    id: "rank",
    label: "rank them!",
    shortLabel: "Rank",
    caption: "Drag the full list into your exact order — first to last, no ties.",
    path: "/vote/rank",
    system: "Position",
  },
] as const;

export const NAV_LINKS = [
  { href: "/", label: "Index" },
  { href: "/vote/swipe", label: "Swipe" },
  { href: "/vote/tier", label: "Tier" },
  { href: "/vote/rank", label: "Rank" },
  { href: "/analytics", label: "Analytics" },
];

export const byCategory = (cat: Category) =>
  COMMITTEES.filter((c) => c.category === cat);

export const findCommittee = (id: string) =>
  COMMITTEES.find((c) => c.id === id);

"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SITE, VOTE_MODES } from "@/lib/constants";
import { trackCtaClick, trackVoteModeSelect } from "@/lib/analytics";

gsap.registerPlugin(useGSAP);

const easeOut = [0.22, 1, 0.36, 1] as const;

const fade = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 * i,
      duration: 0.6,
      ease: easeOut,
    },
  }),
};

export function LandingHero() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduceMotion) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(".hero-glow-br", {
          opacity: 0.72,
          duration: 5.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

        gsap.to(".hero-shape-drift", {
          y: "+=10",
          x: "+=4",
          duration: 9,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          stagger: { each: 0.45, from: "random" },
        });

        gsap.to(".hero-shape-spin", {
          rotation: 360,
          duration: 90,
          ease: "none",
          repeat: -1,
          svgOrigin: "1180 160",
        });

        gsap.to(".hero-shape-breathe", {
          opacity: "+=0.05",
          duration: 4.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          stagger: 0.35,
        });

        gsap.from(".hero-shape-line", {
          opacity: 0,
          duration: 1.4,
          stagger: 0.08,
          ease: "power2.out",
          delay: 0.2,
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [reduceMotion] }
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[calc(100svh-4.5rem)] flex-col overflow-hidden border-b border-ink-700/90"
    >
      <HeroBackdrop />

      <div className="relative z-10 mx-auto flex w-full max-w-[1320px] flex-1 flex-col px-4 pb-8 pt-5 sm:px-6 md:px-10 md:pb-10 md:pt-6">
        <motion.div
          custom={0}
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          variants={fade}
          className="flex justify-end"
        >
          <Link
            href="/analytics"
            onClick={() =>
              trackCtaClick({
                id: "hero_analytics",
                label: "Analytics",
                href: "/analytics",
                location: "landing_hero",
              })
            }
            className="border border-ink-600/90 bg-ink-950/40 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-200 backdrop-blur-sm transition-colors hover:border-ink-400 hover:text-ink-50"
          >
            Analytics
          </Link>
        </motion.div>

        <div className="mt-8 flex flex-1 flex-col sm:mt-10 md:mt-12">
          <div className="text-center sm:text-left">
            <motion.h1
              custom={1}
              initial={reduceMotion ? false : "hidden"}
              animate="visible"
              variants={fade}
              aria-label="Pollr"
              className="font-pollr text-[clamp(4.25rem,16vw,9.5rem)] font-semibold leading-[0.86] tracking-[-0.04em] text-ink-50"
            >
              Poll<span className="text-lime">r</span>
              <span className="text-ink-50">.</span>
            </motion.h1>

            <motion.p
              custom={2}
              initial={reduceMotion ? false : "hidden"}
              animate="visible"
              variants={fade}
              className="italic-display mt-5 max-w-xl text-lg leading-snug text-ink-100 sm:mt-6 sm:text-xl md:text-2xl"
            >
              {SITE.manifesto}
            </motion.p>
          </div>

          <motion.div
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.08, delayChildren: 0.2 },
              },
            }}
            className="mt-10 grid flex-1 grid-cols-1 content-start gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4 md:mt-14"
          >
            {VOTE_MODES.map((mode, i) => (
              <motion.div
                key={mode.id}
                custom={i}
                variants={fade}
                whileHover={
                  reduceMotion
                    ? undefined
                    : { y: -3, transition: { duration: 0.22, ease: easeOut } }
                }
              >
                <Link
                  href={mode.path}
                  onClick={() => {
                    trackVoteModeSelect(mode.id, "landing_hero");
                    trackCtaClick({
                      id: `hero_mode_${mode.id}`,
                      label: mode.label,
                      href: mode.path,
                      location: "landing_hero",
                    });
                  }}
                  className="group flex h-full min-h-[8.5rem] flex-col justify-between gap-4 border border-ink-600/90 bg-ink-950/35 px-5 py-6 backdrop-blur-[2px] transition-colors hover:border-lime/50 hover:bg-ink-900/50 sm:min-h-[11rem] sm:px-6 sm:py-7 md:min-h-[12.5rem]"
                >
                  <span className="font-pollr text-[1.65rem] font-semibold leading-[1.05] tracking-tight text-ink-50 group-hover:text-lime sm:text-3xl md:text-[2.35rem]">
                    {mode.label}
                  </span>
                  <span className="max-w-[18rem] text-sm leading-snug text-ink-100/90 sm:text-[0.95rem]">
                    {mode.caption}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* Soft lime washes — top-left balance */}
      <div className="absolute -left-[18%] top-[-20%] h-[55%] w-[55%] rounded-full bg-[radial-gradient(circle,rgba(212,255,58,0.11)_0%,transparent_68%)]" />
      <div className="absolute right-[-12%] top-[8%] h-[48%] w-[42%] rounded-full bg-[radial-gradient(circle,rgba(212,255,58,0.055)_0%,transparent_70%)]" />

      {/* Bottom-right: diagonal lime → white luxury wash */}
      <div className="hero-glow-br absolute bottom-[-22%] right-[-14%] h-[78%] w-[68%] opacity-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_82%,rgba(212,255,58,0.16)_0%,rgba(236,255,170,0.08)_22%,rgba(255,255,255,0.05)_42%,rgba(255,255,255,0.015)_58%,transparent_74%)]" />
        <div className="absolute bottom-[6%] right-[2%] h-[48%] w-[56%] rotate-[-28deg] bg-[linear-gradient(118deg,transparent_8%,rgba(212,255,58,0.09)_34%,rgba(255,255,255,0.07)_52%,rgba(255,255,255,0.02)_68%,transparent_86%)] blur-[1px]" />
        <div className="absolute bottom-[10%] right-[10%] h-[36%] w-[42%] rotate-[-34deg] bg-[linear-gradient(125deg,transparent_18%,rgba(255,255,255,0.06)_45%,rgba(212,255,58,0.04)_62%,transparent_82%)]" />
      </div>

      {/* Soft diagonal ribbon across BR corner */}
      <div className="absolute bottom-0 right-0 h-[55%] w-[55%] bg-[linear-gradient(318deg,rgba(212,255,58,0.08)_0%,rgba(255,255,255,0.035)_26%,transparent_58%)]" />
      <div className="absolute bottom-[-5%] right-[-5%] h-[40%] w-[40%] bg-[conic-gradient(from_210deg_at_70%_70%,rgba(212,255,58,0.06),transparent_40%,rgba(255,255,255,0.03)_70%,transparent_100%)] opacity-80" />

      {/* Cool counter-wash so lime doesn’t dominate */}
      <div className="absolute inset-0 bg-[linear-gradient(165deg,transparent_40%,rgba(7,7,7,0.45)_100%)]" />
      <div className="absolute right-0 top-0 h-full w-[42%] bg-[linear-gradient(240deg,rgba(126,200,255,0.02)_0%,transparent_55%)]" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {/* Large arc family — right */}
        <g className="hero-shape-spin">
          <circle
            className="hero-shape-breathe"
            cx="1180"
            cy="160"
            r="320"
            stroke="#d4ff3a"
            strokeWidth="1"
            opacity="0.16"
          />
          <circle
            cx="1180"
            cy="160"
            r="220"
            stroke="#d4ff3a"
            strokeWidth="1"
            opacity="0.08"
          />
          <circle
            cx="1180"
            cy="160"
            r="140"
            stroke="#ffffff"
            strokeWidth="0.75"
            opacity="0.05"
          />
        </g>

        {/* Offset arc — left lower */}
        <g className="hero-shape-drift">
          <circle
            className="hero-shape-breathe"
            cx="120"
            cy="720"
            r="260"
            stroke="#d4ff3a"
            strokeWidth="1"
            opacity="0.1"
          />
          <circle
            cx="120"
            cy="720"
            r="180"
            stroke="#ffffff"
            strokeWidth="0.75"
            opacity="0.04"
          />
        </g>

        {/* Mid field orbit */}
        <g className="hero-shape-drift">
          <circle
            cx="720"
            cy="480"
            r="190"
            stroke="#d4ff3a"
            strokeWidth="1"
            opacity="0.06"
            strokeDasharray="4 10"
          />
          <circle
            cx="720"
            cy="480"
            r="8"
            stroke="#d4ff3a"
            strokeWidth="1"
            opacity="0.18"
          />
        </g>

        {/* Upper partial arc */}
        <path
          className="hero-shape-line"
          d="M 980 40 A 180 180 0 0 1 1320 220"
          stroke="#d4ff3a"
          strokeWidth="1"
          opacity="0.12"
        />

        {/* Diagonal structure lines */}
        <path
          className="hero-shape-line"
          d="M -40 540 L 520 120"
          stroke="#d4ff3a"
          strokeWidth="1"
          opacity="0.1"
        />
        <path
          className="hero-shape-line"
          d="M 980 900 L 1440 420"
          stroke="#d4ff3a"
          strokeWidth="1"
          opacity="0.09"
        />
        <path
          className="hero-shape-line"
          d="M 600 900 L 1100 280"
          stroke="#ffffff"
          strokeWidth="0.75"
          opacity="0.05"
        />
        <path
          className="hero-shape-line"
          d="M 40 200 L 380 40"
          stroke="#d4ff3a"
          strokeWidth="1"
          opacity="0.08"
        />

        {/* Thin horizontal / vertical rule accents */}
        <path
          className="hero-shape-line"
          d="M 640 78 H 860"
          stroke="#d4ff3a"
          strokeWidth="1"
          opacity="0.22"
        />
        <path
          className="hero-shape-line"
          d="M 70 310 H 190"
          stroke="#d4ff3a"
          strokeWidth="1"
          opacity="0.14"
        />
        <path
          className="hero-shape-line"
          d="M 1080 620 H 1240"
          stroke="#ffffff"
          strokeWidth="0.75"
          opacity="0.1"
        />
        <path
          className="hero-shape-line"
          d="M 360 760 V 840"
          stroke="#d4ff3a"
          strokeWidth="1"
          opacity="0.12"
        />

        {/* Small geometric marks */}
        <g className="hero-shape-drift">
          <rect
            x="1320"
            y="640"
            width="28"
            height="28"
            stroke="#d4ff3a"
            strokeWidth="1"
            opacity="0.18"
            transform="rotate(18 1334 654)"
          />
        </g>
        <g className="hero-shape-drift">
          <path
            d="M 210 140 L 228 140 L 219 156 Z"
            stroke="#d4ff3a"
            strokeWidth="1"
            opacity="0.2"
          />
        </g>
        <g className="hero-shape-drift">
          <path
            d="M 1280 420 L 1292 420 M 1286 414 L 1286 426"
            stroke="#ffffff"
            strokeWidth="1"
            opacity="0.16"
          />
        </g>
        <g className="hero-shape-drift">
          <rect
            x="480"
            y="220"
            width="18"
            height="18"
            stroke="#d4ff3a"
            strokeWidth="1"
            opacity="0.12"
            transform="rotate(45 489 229)"
          />
        </g>
        <g className="hero-shape-drift">
          <circle
            cx="900"
            cy="740"
            r="3"
            fill="#d4ff3a"
            opacity="0.28"
          />
          <circle
            cx="920"
            cy="755"
            r="2"
            fill="#ffffff"
            opacity="0.18"
          />
        </g>
        <g className="hero-shape-drift">
          <path
            d="M 150 480 L 170 480 L 160 498 Z"
            stroke="#ffffff"
            strokeWidth="0.75"
            opacity="0.1"
          />
        </g>

        {/* Bottom-right scaffold marks near gradient */}
        <path
          className="hero-shape-line"
          d="M 1180 780 L 1380 560"
          stroke="#d4ff3a"
          strokeWidth="1"
          opacity="0.08"
        />
        <circle
          className="hero-shape-breathe"
          cx="1360"
          cy="820"
          r="54"
          stroke="#ffffff"
          strokeWidth="0.75"
          opacity="0.07"
        />
      </svg>
    </div>
  );
}

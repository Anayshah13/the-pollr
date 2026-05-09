import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#070707",
          900: "#0b0b0b",
          850: "#101010",
          800: "#161616",
          700: "#1f1f1f",
          600: "#2a2a2a",
          500: "#3a3a3a",
          400: "#5a5a5a",
          300: "#8a8a8a",
          200: "#b4b1a8",
          100: "#e8e4d8",
          50: "#f4f1e8",
        },
        lime: {
          DEFAULT: "#d4ff3a",
          dim: "#a8cc2e",
        },
        ember: "#ff4d3a",
        sky: "#7ec8ff",
      },
      fontFamily: {
        display: ['"Instrument Serif"', "ui-serif", "Georgia", "serif"],
        sans: ['"Geist"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "Menlo", "monospace"],
      },
      letterSpacing: {
        widest: "0.24em",
        ultra: "0.32em",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset",
      },
    },
  },
  plugins: [],
};

export default config;

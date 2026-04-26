import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#07090C",
          elev: "#0E1218",
          elev2: "#141A22",
        },
        ink: {
          DEFAULT: "#E8ECEF",
          dim: "#A6B0BA",
          mute: "#6B7681",
        },
        line: "#1B2230",
        brand: {
          DEFAULT: "#34D399",
          hi: "#5EEAB4",
          lo: "#10B981",
        },
        accent: {
          DEFAULT: "#FBBF24",
          hi: "#FCD34D",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 60px -10px rgba(52, 211, 153, 0.45)",
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 30px 60px -30px rgba(0,0,0,0.5)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "radial-brand":
          "radial-gradient(ellipse at top, rgba(52,211,153,0.18), transparent 60%)",
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/canvas/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        botanic: {
          50: "#fbfaf8",
          100: "#f4f1ea",
          200: "#e6e0d3",
          300: "#d3c8b4",
          400: "#b9a990",
          500: "#9f8c70",
          600: "#837157",
          700: "#685845",
          800: "#55493b",
          900: "#473e33",
        },
        rose: {
          soft: "#ff758f",
          deep: "#c9184a",
          petal: "#ffb3c1",
        },
        kraft: {
          paper: "#c8ad8d",
          dark: "#9c7c58",
        }
      },
      fontFamily: {
        serif: ["'Agrave Pro'", "Georgia", "serif"],
        sans: ["'Agrave Pro'", "system-ui", "sans-serif"],
        mono: ["'Agrave Pro'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.08)",
        "glass-hover": "0 12px 40px 0 rgba(0, 0, 0, 0.14)",
        "glass-card": "0 20px 50px rgba(0, 0, 0, 0.12)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "float": "float 4s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 20s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

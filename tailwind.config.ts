import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F1B3D",
        navy: {
          DEFAULT: "#1B2F6B",
          light: "#2A4290",
          dark: "#101E48",
        },
        orange: {
          DEFAULT: "#F5811E",
          light: "#FFB25B",
          dark: "#D9690D",
        },
        canvas: "#FBF9F5",
        slate: {
          DEFAULT: "#33384A",
          muted: "#6B7080",
        },
      },
      fontFamily: {
        display: ["var(--font-sora)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        card: "1rem",
      },
      backgroundImage: {
        "diagonal-split":
          "linear-gradient(115deg, #101E48 0%, #101E48 46%, #F5811E 46%, #F5811E 100%)",
      },
    },
  },
  plugins: [],
};
export default config;

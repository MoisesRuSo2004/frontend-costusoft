import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["var(--font-poppins)", "sans-serif"],
      },
      colors: {
        brand: {
          gold: "#c8a96e",
          "gold-dark": "#a8843a",
          dark: "#0f0f1a",
          "dark-card": "#13131f",
          "dark-left": "#1a1225",
        },
      },
    },
  },
  plugins: [],
};

export default config;

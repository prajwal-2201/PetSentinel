import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Colors are primarily managed via @theme inline in globals.css per Tailwind v4 standards,
      // but configured here for compatibility.
      colors: {
        guardian: {
          DEFAULT: "var(--color-secondary)",
          container: "var(--color-secondary-container)",
          dim: "var(--color-secondary-dim)",
          on: "var(--color-on-secondary)",
        },
        care: {
          DEFAULT: "var(--color-tertiary)",
          container: "var(--color-tertiary-container)",
          dim: "var(--color-tertiary-dim)",
          on: "var(--color-on-tertiary)",
        },
      },
    },
  },
  plugins: [],
};
export default config;

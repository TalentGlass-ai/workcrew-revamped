import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./pages/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
    "./workcrew-ui/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // maps to Typography.tsx "font-sans"
        sans: ["Schibsted Grotesk", "sans-serif"],

        // maps to Typography.tsx "font-display"
        display: ["Schibsted Grotesk", "sans-serif"],

        // maps to Typography.tsx "font-alt"
        alt: ["Archivo", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;

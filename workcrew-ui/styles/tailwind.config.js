/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./workcrew-ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brandGray: "#A2A2A2",
        brandFooter: "#444953",
        brandBlack: "#000000",
      },
      borderRadius: { sm: "3px", lg: "12px" },
      spacing: { 97: "97px", 1280: "1280px" },
      letterSpacing: { tighter1: "0.01em", tight1pct: ".03em", wide2pct: ".02em", wide3pct: ".03em" },
      lineHeight: { h1: "62px", body: "27px" },
      fontSize: {
        h1: ["48px", { lineHeight: "62px" }],
        body: ["20px", { lineHeight: "27px" }],
        btn: ["16px", { lineHeight: "1" }],
        chip: ["14px", { lineHeight: "1" }],
        caption: ["14px", { lineHeight: "100%", fontWeight: "500" }],
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        alt: ['var(--font-alt)', 'system-ui', 'sans-serif'],
        archivo: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        schibsted: ['var(--font-display)', 'system-ui', 'sans-serif'],
        manrope: ['var(--font-alt)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

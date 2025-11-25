import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./pages/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
    "./workcrew-ui/**/*.{ts,tsx,js,jsx,mdx}",
  ],

  // Prevent purge of dynamic/arbitrary utilities used in UI components
  safelist: [
    // Marquee duration via CSS var / arbitrary property
    { pattern: /\[--marquee-duration:\d+s\]/ },
    { pattern: /\[animation-duration:\d+s\]/ },
    { pattern: /duration-\[\d+s\]/ },

    // Clamp heights (e.g., h-[clamp(80px,16vw,128px)])
    { pattern: /min-h-\[clamp\(\d+px,\d+vw,\d+px\)\]/ },
    { pattern: /h-\[clamp\(\d+px,\d+vw,\d+px\)\]/ },

    // Pixel gaps/paddings at runtime (e.g., gap-[12px], px-[8px])
    { pattern: /gap-\[\d+px\]/ },
    { pattern: /px-\[\d+px\]/ },
    { pattern: /py-\[\d+px\]/ },

    // Fixed px sizes / radii used in components
    { pattern: /w-\[\d+px\]/ },
    { pattern: /h-\[\d+px\]/ },
    { pattern: /min-w-\[\d+px\]/ },
    { pattern: /rounded-\[\d+px\]/ },

    // Percentage widths (e.g., w-[220%] for review rows)
    { pattern: /w-\[\d+%]/ },

    // Position offsets (e.g., left-[51px], right-[400px], ml-[93px])
    { pattern: /(left|right|top|bottom|m[trbl]?|p[trbl]?)-\[\d+px\]/ },

    // Typography (custom sizes/leading/tracking)
    { pattern: /text-\[\d+px\]/ },
    { pattern: /leading-\[(\d+(\.\d+)?|normal|1(\.\d+)?)\]/ },
    { pattern: /tracking-\[-?\d*\.?\d+(px|em)\]/ },

    // Arbitrary gradients / colors / shadows used across sections
    { pattern: /bg-\[.*\]/ },                // e.g., bg-[linear-gradient(...)] / bg-[radial-gradient(...)]
    { pattern: /shadow-\[.*\]/ },            // e.g., shadow-[0_0_100px_rgba(...)]
    { pattern: /(bg|text|border|ring)-\[#?[A-Fa-f0-9]{3,8}\]/ }, // e.g., text-[#4D31EC], ring-[#E9ECF6]

    // Misc
    { pattern: /aspect-\[\d+\/\d+\]/ },      // e.g., aspect-[3/1]
  ],

  theme: {
    extend: {
      // Fonts used across Typography.tsx
      fontFamily: {
        sans: ["Schibsted Grotesk", "sans-serif"],
        display: ["Schibsted Grotesk", "sans-serif"],
        alt: ["Archivo", "sans-serif"],
      },

      // Marquee animation (duration overridden per instance via --marquee-duration)
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee var(--marquee-duration,100s) linear infinite",
      },
    },
  },

  plugins: [],
} satisfies Config;

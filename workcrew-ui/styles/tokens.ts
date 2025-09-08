// src/styles/tokens.ts
export const tokens = {
  colors: {
    // Brand
    primary: "#4D31EC",      // confirmed Figma HEX for "Start hiring" button
    primaryFg: "#FFFFFF",
    secondary: "#6366F1",    // lighter violet (used in gradients / hover)
    secondaryFg: "#FFFFFF",

    accent: "#3B82F6",       // blue accents (badges, highlight text)

    success: "#22C55E",      // Interview Scheduled (green)
    warning: "#FACC15",      // Under Review (yellow)
    danger: "#EF4444",       // generic error red

    bg: "#FFFFFF",           // page background
    surface: "#F9FAFB",      // light section background
    border: "#E5E7EB",       // input borders, card lines

    footerBg: "#1F2937",     // footer dark background
    footerFg: "#FFFFFF",     // footer text/icons

    gray: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
    },
  },

  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans'",
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    headings: {
      h1: { size: 56, lh: 64, ls: -0.5 },  // Hero
      h2: { size: 40, lh: 48, ls: -0.25 }, // Sections
      h3: { size: 32, lh: 40, ls: -0.2 },
      h4: { size: 24, lh: 32, ls: -0.1 },
      h5: { size: 20, lh: 28, ls: 0 },
      h6: { size: 18, lh: 24, ls: 0 },
    },
    body: {
      sm: { size: 14, lh: 20 },
      md: { size: 16, lh: 24 },  // paragraphs, form fields
      lg: { size: 18, lh: 28 },
    },
    button: {
      md: { size: 16, lh: 20, weight: 600, transform: "none", letterSpacing: 0 },
    },
  },

  spacing: [0,2,4,6,8,12,16,20,24,32,40,48,64],


  radii: {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
  xxl: 30, // ← matches Button
},

  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 4px 6px rgba(0,0,0,0.1)",
    lg: "0 10px 15px rgba(0,0,0,0.15)",
  },

  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },

  container: {
    max: 1200,
    padX: { base: 16, md: 24 },
  },
} as const;

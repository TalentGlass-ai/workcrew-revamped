import { tokens } from "./tokens";

// pixels + spacing
export const px = (n: number) => `${n}px`;
export const space = (n: number) => px(n); 

// media queries
export const mq = (bp: keyof typeof tokens.breakpoints) =>
  `@media (min-width: ${tokens.breakpoints[bp]}px)`;

// typography helper
type TextName =
  | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  | "body-sm" | "body-md" | "body-lg"
  | "button";

export const text = (name: TextName) => {
  const t = tokens.typography;
  const base = { fontFamily: t.fontFamily, fontWeight: t.weights.regular as 400|500|600|700 };

  const map: Record<TextName, { size: number; lh: number; weight?: number; ls?: number }> = {
    h1: { ...t.headings.h1 },
    h2: { ...t.headings.h2 },
    h3: { ...t.headings.h3 },
    h4: { ...t.headings.h4 },
    h5: { ...t.headings.h5 },
    h6: { ...t.headings.h6 },
    "body-sm": { ...t.body.sm },
    "body-md": { ...t.body.md },
    "body-lg": { ...t.body.lg },
    button: { ...t.button.md },
  } as any;

  const s = map[name];
  return {
    ...base,
    fontSize: px(s.size),
    lineHeight: px(s.lh),
    letterSpacing: s.ls !== undefined ? `${s.ls}px` : undefined,
    fontWeight: (s as any).weight ?? base.fontWeight,
  } as const;
};

// shadows, radii, container
export const shadow = (level: keyof typeof tokens.shadows) => tokens.shadows[level];
export const radius = (level: keyof typeof tokens.radii) => px(tokens.radii[level]);

export const container = (max = tokens.container.max) =>
  `
    max-width: ${px(max)};
    margin-left: auto;
    margin-right: auto;
    padding-left: ${px(tokens.container.padX.base)};
    padding-right: ${px(tokens.container.padX.base)};
    ${mq("md")} {
      padding-left: ${px(tokens.container.padX.md)};
      padding-right: ${px(tokens.container.padX.md)};
    }
  `;

// background variants for Section
export const sectionBg = {
  default: tokens.colors.bg,
  subtle: tokens.colors.surface,
  tinted: `linear-gradient(180deg, rgba(99,102,241,0.06) 0%, rgba(77,49,236,0.06) 100%)`,
} as const;

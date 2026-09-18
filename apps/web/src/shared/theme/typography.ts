export const fontFamily = {
  display: "'Unbounded', sans-serif",
  body: "'Manrope', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace"
} as const;

export const typography = {
  fontFamily: fontFamily.body,
  h1: { fontFamily: fontFamily.display, fontWeight: 700 },
  h2: { fontFamily: fontFamily.display, fontWeight: 700 },
  h3: { fontFamily: fontFamily.display, fontWeight: 700 },
  h4: { fontFamily: fontFamily.display, fontWeight: 700 }
} as const;

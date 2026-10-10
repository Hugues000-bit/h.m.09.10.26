// HOW MUCH?! brand tokens — taken from the live app (src/index.css + tailwind.config.ts)
import { staticFile } from "remotion";

export const BRAND: Record<string, string | number> & { [k: string]: any } = {
  bg: "#0A0A0A", // --background 0 0% 4%
  card: "#121212", // --card 0 0% 7%
  border: "#262626", // --border 0 0% 15%
  text: "#E6E6E6", // --foreground 0 0% 90%
  muted: "#8C8C8C", // --muted-foreground 0 0% 55%
  green: "#00FF80", // --neon-green / --primary 150 100% 50%
  pink: "#FF3399", // --neon-pink / --accent 330 100% 60%
  cyan: "#00FFFF", // --neon-cyan 180 100% 50%
  yellow: "#FFD91A", // --neon-yellow 50 100% 55%
  heading: "'Space Grotesk', sans-serif",
  mono: "'JetBrains Mono', monospace",
  vignette: "rgba(0,0,0,0.75)",
  scan: "rgba(255,255,255,0.022)",
  glow: 1, // multiplier for neon glows (lower on white)
};

// Light theme = the app's .light tokens (src/index.css)
const THEMES = {
  dark: { bg: "#0A0A0A", card: "#121212", border: "#262626", text: "#E6E6E6", muted: "#8C8C8C", green: "#00FF80", pink: "#FF3399", cyan: "#00FFFF", yellow: "#FFD91A", vignette: "rgba(0,0,0,0.75)", scan: "rgba(255,255,255,0.022)", glow: 1 },
  light: { bg: "#FAFAFA", card: "#FFFFFF", border: "#D9D9D9", text: "#1A1A1A", muted: "#737373", green: "#12A15A", pink: "#E61A80", cyan: "#12A1A1", yellow: "#DAA60B", vignette: "rgba(0,0,0,0.06)", scan: "rgba(0,0,0,0.018)", glow: 0.45 },
};
export type Theme = keyof typeof THEMES;
export const applyTheme = (t: Theme = "dark") => Object.assign(BRAND, THEMES[t]);

// hex + alpha → rgba()
export const a = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
};
// glow alpha scaled by theme
export const g = (hex: string, alpha: number) => a(hex, Math.min(1, alpha * (BRAND.glow as number)));

// Fonts are bundled locally (public/howmuch/fonts) so rendering never depends on Google Fonts.
const FONTS: Array<[string, string, string]> = [
  ["Space Grotesk", "space-grotesk-latin-500-normal.woff2", "500"],
  ["Space Grotesk", "space-grotesk-latin-700-normal.woff2", "700"],
  ["JetBrains Mono", "jetbrains-mono-latin-500-normal.woff2", "500"],
  ["JetBrains Mono", "jetbrains-mono-latin-700-normal.woff2", "700"],
];

let fontsPromise: Promise<void> | null = null;
// Loads the brand fonts once per page; components wait on it with delayRender().
export const loadBrandFonts = (): Promise<void> => {
  if (!fontsPromise) {
    fontsPromise = Promise.all(
      FONTS.map(([family, file, weight]) => {
        const face = new FontFace(family, `url(${staticFile(`howmuch/fonts/${file}`)})`, { weight });
        return face.load().then((loaded) => {
          document.fonts.add(loaded);
        });
      })
    ).then(() => undefined);
  }
  return fontsPromise;
};

export const euro = (v: number) => `${v.toFixed(2).replace(".", ",")} €`;

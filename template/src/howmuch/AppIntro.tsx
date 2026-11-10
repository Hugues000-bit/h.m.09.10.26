// HOW MUCH?! — 2-second opener showing the real app map (cropped screenshot of howmuch.live, pins only:
// no venue list, no "typical prices" bar), under the same header block as the format that follows.
// Use inside a <Series> before TierList / ReceiptFact so the hook text stays in place when the map leaves.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BRAND, applyTheme, loadBrandFonts, Theme } from "./brand";
import { Accented, Backdrop, Sfx, Sub } from "./PriceVideo";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const INTRO_FRAMES = 60;

export type AppIntroProps = { theme?: Theme; label: string; hook: string[]; hookDe: string; accent?: "green" | "pink"; chip: string };

export const AppIntro: React.FC<AppIntroProps> = ({ theme = "dark", label, hook, hookDe, accent = "green", chip }) => {
  applyTheme(theme);
  const f = useCurrentFrame();
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    loadBrandFonts().then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
  const zoom = interpolate(f, [0, INTRO_FRAMES], [1.0, 1.18], clamp);
  const out = interpolate(f, [INTRO_FRAMES - 8, INTRO_FRAMES - 1], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      <Backdrop />
      <Sfx at={1} src="maximize_006" volume={0.4} />
      <div style={{ position: "absolute", top: 240, left: 80, right: 180 }}>
        <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 32, letterSpacing: 5, color: BRAND.green, marginBottom: 14 }}>{label}</div>
        {hook.map((ln, i) => (
          <div key={i} style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: Math.min(92, Math.floor(820 / (ln.replace(/\*/g, "").length * 0.52))), lineHeight: 1.04, letterSpacing: -3, color: BRAND.text, whiteSpace: "nowrap" }}>
            <Accented text={ln} accent={accent === "green" ? BRAND.green : BRAND.pink} glow />
          </div>
        ))}
        <Sub text={hookDe} style={{ marginTop: 10, fontSize: 36 }} />
      </div>
      <div style={{ position: "absolute", top: 700, left: 80, width: 820, height: 700, borderRadius: 28, overflow: "hidden", border: `3px solid ${BRAND.border}`, boxShadow: "0 30px 80px rgba(0,0,0,0.35)", opacity: out, transform: `scale(${0.97 + 0.03 * out})` }}>
        <Img src={staticFile("howmuch/app-map.png")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, transformOrigin: "55% 50%" }} />
        <div style={{ position: "absolute", left: 20, top: 20, background: "rgba(10,10,10,0.82)", color: "#fff", fontFamily: BRAND.mono, fontWeight: 700, fontSize: 26, letterSpacing: 2, padding: "10px 16px", borderRadius: 12 }}>
          <span style={{ color: "#19E57F" }}>●</span> {chip}
        </div>
        <div style={{ position: "absolute", right: 12, bottom: 8, fontFamily: BRAND.mono, fontSize: 16, color: "rgba(40,40,40,0.8)" }}>© OpenStreetMap contributors</div>
      </div>
      <div style={{ position: "absolute", top: 170, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontFamily: BRAND.mono, fontSize: 28, letterSpacing: 2 }}>
        <span style={{ color: BRAND.green, fontWeight: 700 }}>HOW MUCH?!</span>
        <span style={{ color: BRAND.muted, fontWeight: 500 }}>howmuch.live</span>
      </div>
    </AbsoluteFill>
  );
};

// HOW MUCH?! — "the map filling up", 1080x1920, 30 fps, 15 s.
// One dot per place with a real price, appearing in the order the first price was added (places-data.ts).
// Made for the end-of-month / challenge result: the counter and the month run while the city fills.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, a, g, applyTheme, loadBrandFonts, Theme } from "./brand";
import { Accented, Bloom, Sfx, Sub, entrance } from "./PriceVideo";
import { MapShade, ViennaMap } from "./ViennaMap";
import { DOTS, MONTHS, PLACES } from "./places-data";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const FILL_FRAMES = 450;
const START = 40;
const FULL = 300;
const END_AT = 350;

export type FillProps = {
  theme?: Theme;
  label: string;
  hook: string[];
  hookDe: string;
  counterLabel: string; // "places with a real price"
  counterDe: string;
  end: string[];
  endDe: string;
  ctaSub: string;
  footer?: string;
};

export const MapFill: React.FC<FillProps> = ({ theme = "dark", label, hook, hookDe, counterLabel, counterDe, end, endDe, ctaSub, footer }) => {
  applyTheme(theme);
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    loadBrandFonts().then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);

  const N = DOTS.length;
  const at = (i: number) => START + (i / (N - 1)) * (FULL - START);
  const shown = Math.max(0, Math.min(N, Math.floor(((f - START) / (FULL - START)) * (N - 1)) + 1));
  const month = [...MONTHS].reverse().find((m) => shown - 1 >= m[0]) ?? MONTHS[0];
  const zoom = interpolate(f, [0, FULL], [0, 1], clamp);
  const endP = interpolate(f, [END_AT - 4, END_AT + 8], [0, 1], clamp);
  const loop = interpolate(f, [FILL_FRAMES - 9, FILL_FRAMES - 1], [0, 1], clamp);
  const done = spring({ frame: f - FULL, fps, config: { damping: 9, stiffness: 200, mass: 0.7 } });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      <Sfx at={START} src="powerUp2" volume={0.35} />
      {[0.25, 0.5, 0.75].map((k) => <Sfx key={k} at={START + k * (FULL - START)} src="pluck_002" volume={0.35} />)}
      <Sfx at={FULL} src="impactPlate_heavy_001" volume={0.55} />
      <Sfx at={END_AT} src="confirmation_002" volume={0.55} />

      <ViennaMap cam={{ x: 440, y: 440, s: 2.05 + 0.3 * zoom }} focus={[540, 960]} dotColor={BRAND.green as string}
        dot={(i) => (f < at(i) ? 0 : 1 + 0.9 * Math.max(0, 1 - (f - at(i)) / 9))} />
      <MapShade top={640} bottom={860} />

      <div style={{ position: "absolute", top: 170, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontFamily: BRAND.mono, fontSize: 28, letterSpacing: 2, opacity: 1 - endP }}>
        <span style={{ color: BRAND.green, fontWeight: 700 }}>HOW MUCH?!</span>
        <span style={{ color: BRAND.muted, fontWeight: 500 }}>howmuch.live</span>
      </div>
      <div style={{ position: "absolute", top: 240, left: 80, right: 180, opacity: 1 - endP }}>
        <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 32, letterSpacing: 5, color: BRAND.green, marginBottom: 12 }}>{label}</div>
        {hook.map((ln, i) => (
          <div key={i} style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: Math.min(100, Math.floor(820 / (ln.replace(/\*/g, "").length * 0.52))), lineHeight: 1.04, letterSpacing: -3, color: BRAND.text, whiteSpace: "nowrap" }}>
            <Accented text={ln} accent={BRAND.green as string} glow />
          </div>
        ))}
        <Sub text={hookDe} style={{ marginTop: 10, fontSize: 38 }} />
      </div>

      {/* counter */}
      <div style={{ position: "absolute", top: 1086, left: 80, width: 820, opacity: (1 - endP) * interpolate(f, [START - 10, START], [0, 1], clamp) }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
          <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 170, lineHeight: 1, color: BRAND.green, fontVariantNumeric: "tabular-nums", textShadow: `0 0 34px ${g(BRAND.green as string, 0.5)}`, transform: `scale(${f >= FULL ? 0.94 + 0.06 * Math.min(1.3, done) : 1})`, transformOrigin: "left bottom" }}>{shown}</div>
          <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 40, letterSpacing: 3, color: BRAND.yellow, border: `3px solid ${BRAND.yellow}`, borderRadius: 14, padding: "4px 16px" }}>{month[1]}</div>
        </div>
        <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 52, letterSpacing: -1.5, color: BRAND.text, marginTop: 6 }}>{counterLabel}</div>
        <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 34, color: BRAND.muted, marginTop: 2 }}>{counterDe}</div>
      </div>

      {f >= END_AT - 4 && (
        <AbsoluteFill>
          <AbsoluteFill style={{ backgroundColor: a(BRAND.bg as string, 0.88), opacity: endP }} />
          <Bloom color={a(BRAND.green as string, 0.85 * (BRAND.glow as number))} start={END_AT} top={720} size={900} />
          <div style={{ position: "absolute", top: 470, left: 80, width: 820, textAlign: "center", ...entrance("slam", f - END_AT, 0, fps, "center") }}>
            {end.map((ln, i) => (
              <div key={i} style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 84, lineHeight: 1.06, letterSpacing: -3, color: BRAND.text }}>
                <Accented text={ln} accent={BRAND.green as string} glow />
              </div>
            ))}
            <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 40, color: BRAND.muted, marginTop: 12 }}>{endDe}</div>
          </div>
          <div style={{ position: "absolute", top: 830, left: 80, width: 820, textAlign: "center", ...entrance("rise", f - END_AT, 8, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 112, letterSpacing: -3, color: BRAND.green, textShadow: `0 0 26px ${g(BRAND.green as string, 0.5)}` }}>howmuch.live</div>
          </div>
          <div style={{ position: "absolute", top: 1040, left: 80, width: 820, textAlign: "center", ...entrance("rise", f - END_AT, 14, fps, "center") }}>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 32, color: BRAND.muted }}>{ctaSub}</div>
          </div>
        </AbsoluteFill>
      )}

      <div style={{ position: "absolute", top: 1420, left: 80, right: 180, fontFamily: BRAND.mono, fontSize: 20, color: BRAND.muted, opacity: 1 - endP }}>
        {footer ?? `1 dot = 1 place · ${PLACES.prices} real prices · ${PLACES.date_en} · HOW MUCH?!`}
      </div>
      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(f / (FILL_FRAMES - 1)) * 100}%`, background: BRAND.green }} />
      <AbsoluteFill style={{ backgroundColor: BRAND.bg, opacity: loop, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

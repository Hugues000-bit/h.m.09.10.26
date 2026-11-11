// HOW MUCH?! — "why this map exists", 1080x1920, 30 fps, about 17 s (length follows the voice).
// Two real prices for the same product in the same Bezirk, nobody knows which place is which, so every price goes on a map.
// The places are never named: the name line under each price is a blurred bar. Dots and counts come from places-data.ts.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, a, g, applyTheme, loadBrandFonts, Theme } from "./brand";
import { Accented, Backdrop, Bloom, Sfx, entrance } from "./PriceVideo";
import { Captions, Cue, VoiceOver, voiceFrames } from "./Voice";
import { MapShade, ViennaMap } from "./ViennaMap";
import { DOTS, PLACES } from "./places-data";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SET = "why-map";
const IDS = ["v1", "v2", "v3", "v4", "v5"];

export const whySchedule = () => {
  const start: number[] = [];
  let t = 0;
  IDS.forEach((id) => {
    start.push(t);
    t += Math.max(54, voiceFrames(SET, id) + 16);
  });
  return { start, endAt: t, total: t + Math.max(100, voiceFrames(SET, "end") + 66) };
};

export type WhyProps = { theme?: Theme; label: string; item: string; low: string; high: string; where: string; footer: string };

export const WhyMap: React.FC<WhyProps> = ({ theme = "dark", label, item, low, high, where, footer }) => {
  applyTheme(theme);
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    loadBrandFonts().then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);

  const S = whySchedule();
  const step = Math.max(0, S.start.filter((t) => f >= t).length - 1);
  const rel = f - S.start[step];
  const inEnd = f >= S.endAt;
  const endP = interpolate(f, [S.endAt - 4, S.endAt + 8], [0, 1], clamp);
  const loop = interpolate(f, [S.total - 9, S.total - 1], [0, 1], clamp);
  const cues: Cue[] = [...IDS.map((id, i) => ({ id, at: S.start[i] + 4 })), { id: "end", at: S.endAt + 8 }];
  const G = BRAND.green as string;
  const P = BRAND.pink as string;
  const mapOn = step >= 3;
  const mapIn = interpolate(f, [S.start[3] - 2, S.start[3] + 10], [0, 1], clamp);
  const fillEnd = S.start[4] - 8;
  const dotAt = (i: number) => S.start[3] + 8 + (i / (DOTS.length - 1)) * (fillEnd - S.start[3] - 8);
  const shown = Math.max(0, Math.min(DOTS.length, Math.floor(((f - S.start[3] - 8) / (fillEnd - S.start[3] - 8)) * (DOTS.length - 1)) + 1));

  const heads: string[][] = [
    ["Same city.", `Same *${item}*.`],
    ["Same city.", `Same *${item}*.`],
    ["Which café", "is *which*?"],
    ["So we put", "every price", "on a *map*."],
    ["Added by", "people in *Vienna*."],
  ];
  const des = ["Gleiche Stadt. Gleicher Cappuccino.", "Gleiche Stadt. Gleicher Cappuccino.", "Welches Café ist welches? Sagt dir keiner.", "Also kommt jeder Preis auf eine Karte.", "Eingetragen von Leuten aus Wien."];
  const headKey = step <= 1 ? 0 : step;
  const headRel = step <= 1 ? f : rel;

  const Card = ({ price, col, side }: { price: string; col: string; side: 0 | 1 }) => {
    const p = spring({ frame: f + (side === 0 ? 14 : 8), fps, config: { damping: 11, stiffness: 220, mass: 0.6 } });
    const hide = step >= 2 ? interpolate(rel, [0, 10], [0, 1], clamp) : 0;
    const said = step >= 1 && (side === 0 ? rel >= 0 : rel >= 22);
    return (
      <div style={{ width: 398, height: 420, borderRadius: 30, background: a(BRAND.card as string, 0.85), border: `4px solid ${step >= 1 && said ? col : BRAND.border}`, boxShadow: said ? `0 0 46px ${g(col, 0.45)}` : "none",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: Math.min(1, p), transform: `scale(${0.8 + 0.2 * Math.min(1, p)})` }}>
        <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 21, letterSpacing: 2, color: BRAND.muted, whiteSpace: "nowrap" }}>{where}</div>
        <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 92, lineHeight: 1.1, color: col, textShadow: `0 0 28px ${g(col, 0.45)}`, whiteSpace: "nowrap", marginTop: 14 }}>{price}</div>
        {/* the place: never shown */}
        <div style={{ marginTop: 26, width: 300, height: 54, borderRadius: 12, background: a(BRAND.muted as string, 0.28), display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 8, borderRadius: 8, background: `repeating-linear-gradient(90deg, ${a(BRAND.muted as string, 0.5)} 0 22px, transparent 22px 30px)`, filter: "blur(5px)" }} />
          <div style={{ position: "relative", fontFamily: BRAND.heading, fontWeight: 700, fontSize: 40, color: BRAND.yellow, opacity: hide, transform: `scale(${0.6 + 0.4 * hide})` }}>?</div>
        </div>
        <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 22, color: BRAND.muted, marginTop: 12 }}>café · Lokal</div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      <Backdrop />
      <VoiceOver set={SET} cues={cues} />
      <Sfx at={S.start[1]} src="pluck_002" volume={0.25} />
      <Sfx at={S.start[1] + 22} src="pluck_002" volume={0.25} />
      <Sfx at={S.start[2]} src="glitch_002" volume={0.28} />
      <Sfx at={S.start[3]} src="maximize_006" volume={0.28} />
      <Sfx at={S.start[4]} src="impactPlate_heavy_001" volume={0.3} />
      <Sfx at={S.endAt} src="confirmation_002" volume={0.35} />

      {mapOn && (
        <AbsoluteFill style={{ opacity: mapIn * (1 - endP) }}>
          <ViennaMap cam={{ x: 440, y: 440, s: 2.0 + 0.25 * interpolate(f, [S.start[3], S.endAt], [0, 1], clamp) }} focus={[540, 980]} dotColor={G} dot={(i) => (f < dotAt(i) ? 0 : 1 + 0.9 * Math.max(0, 1 - (f - dotAt(i)) / 8))} />
          <MapShade top={660} bottom={860} />
        </AbsoluteFill>
      )}

      <div style={{ position: "absolute", top: 170, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontFamily: BRAND.mono, fontSize: 28, letterSpacing: 2, opacity: 1 - endP }}>
        <span style={{ color: BRAND.green, fontWeight: 700 }}>HOW MUCH?!</span>
        <span style={{ color: BRAND.muted, fontWeight: 500 }}>howmuch.live</span>
      </div>
      <div style={{ position: "absolute", top: 240, left: 80, right: 180, opacity: 1 - endP }}>
        <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 32, letterSpacing: 5, color: BRAND.green, marginBottom: 14 }}>{label}</div>
        <div key={headKey} style={headKey === 0 ? {} : entrance("snapRight", headRel, 0, fps)}>
          {heads[step].map((ln, i) => (
            <div key={i} style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: Math.min(heads[step].length > 2 ? 96 : 108, Math.floor(820 / (ln.replace(/\*/g, "").length * 0.52))), lineHeight: 1.05, letterSpacing: -3, color: BRAND.text, whiteSpace: "nowrap" }}>
              <Accented text={ln} accent={step === 2 ? (BRAND.yellow as string) : G} glow />
            </div>
          ))}
          <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 36, color: BRAND.muted, marginTop: 10, whiteSpace: "nowrap" }}>{des[step]}</div>
        </div>
      </div>

      {/* two prices, same Bezirk */}
      {step <= 2 && (
        <div style={{ position: "absolute", top: 690, left: 80, width: 820, display: "flex", justifyContent: "space-between" }}>
          <Card price={low} col={G} side={0} />
          <Card price={high} col={P} side={1} />
        </div>
      )}

      {/* counter on the map */}
      {step >= 3 && !inEnd && (
        <div style={{ position: "absolute", top: 1090, left: 80, width: 820, opacity: mapIn }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 130, lineHeight: 1, color: G, fontVariantNumeric: "tabular-nums", textShadow: `0 0 30px ${g(G, 0.5)}` }}>{shown}</div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 46, color: BRAND.text }}>places · Lokale</div>
          </div>
        </div>
      )}

      {!inEnd && <Captions set={SET} cues={cues.filter((c) => c.id !== "end")} top={step >= 3 ? 1262 : 1200} />}

      {f >= S.endAt - 4 && (
        <AbsoluteFill>
          <Bloom color={a(G, 0.85 * (BRAND.glow as number))} start={S.endAt} top={720} size={900} />
          <div style={{ position: "absolute", top: 470, left: 80, width: 820, textAlign: "center", ...entrance("slam", f - S.endAt, 0, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 92, lineHeight: 1.06, letterSpacing: -3, color: BRAND.text }}>
              Is <Accented text="*your*" accent={G} glow /> café
              <br />
              on it?
            </div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 40, color: BRAND.muted, marginTop: 12 }}>Ist dein Café schon dabei?</div>
          </div>
          <div style={{ position: "absolute", top: 850, left: 80, width: 820, textAlign: "center", ...entrance("rise", f - S.endAt, 8, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 112, letterSpacing: -3, color: G, textShadow: `0 0 26px ${g(G, 0.5)}` }}>howmuch.live</div>
          </div>
        </AbsoluteFill>
      )}

      <div style={{ position: "absolute", top: 1404, left: 80, right: 180, fontFamily: BRAND.mono, fontSize: 20, lineHeight: 1.35, color: BRAND.muted, opacity: 1 - endP }}>
        {footer} · {PLACES.n} places with a real price · {PLACES.date_en}
      </div>
      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(f / (S.total - 1)) * 100}%`, background: BRAND.green }} />
      <AbsoluteFill style={{ backgroundColor: BRAND.bg, opacity: loop, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

// HOW MUCH?! — "still under X €?", 1080x1920, 30 fps, 16 s.
// Every place is one dot on a price axis (exact price, no average). A scan runs from the priciest to the cheapest:
// over the limit = pink, exactly on it = yellow, under = green. Then the count ("7 of 28"), where they are (Bezirke only),
// how old the prices are ("Still true?") and the end card. No venue is named.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, a, g, euro, applyTheme, loadBrandFonts, Theme } from "./brand";
import { Accented, Backdrop, Bloom, Sfx, Sub, entrance } from "./PriceVideo";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const UNDER_FRAMES = 480;
const SCAN = [60, 125, 140, 185];
const RESULT = 192;
const TWIST = 300;
const END_AT = 380;
const AXIS_Y = 1090;
const CHART_H = 340;

export type UnderProps = {
  theme?: Theme;
  label: string; // "WIEN · DÖNER"
  hook: string[];
  hookDe: string;
  limit: number; // 5
  prices: number[]; // latest price per place
  where: string[]; // ["All in 3 Bezirke:", "*15.* · *16.* · *20.*"]
  resultDe: string;
  twist: string[];
  twistDe: string;
  end: string[];
  endDe: string;
  ctaSub: string;
  footer: string;
};

export const UnderX: React.FC<UnderProps> = ({ theme = "dark", label, hook, hookDe, limit, prices, where, resultDe, twist, twistDe, end, endDe, ctaSub, footer }) => {
  applyTheme(theme);
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    loadBrandFonts().then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);

  const sorted = [...prices].sort((x, y) => x - y);
  const lo = Math.floor(sorted[0] * 2) / 2 - 0.25;
  const hi = Math.ceil(sorted[sorted.length - 1] * 2) / 2 + 0.25;
  const X = (p: number) => 80 + ((p - lo) / (hi - lo)) * 820;
  // dot plot: exact x, stacked on the first free level
  // the dot size shrinks until the tallest stack fits the chart
  const place = (d: number) => {
    const levels: number[][] = [];
    const out = sorted.map((p) => {
      const x = X(p);
      let lv = 0;
      while (levels[lv] && levels[lv].some((q) => Math.abs(q - x) < d + 1)) lv++;
      (levels[lv] = levels[lv] ?? []).push(x);
      return { p, x, y: AXIS_Y - d / 2 - 10 - lv * (d + 4) };
    });
    return { out, tall: levels.length * (d + 4) };
  };
  let D = 28;
  while (D > 12 && place(D).tall > CHART_H) D -= 2;
  const dots = place(D).out;
  const under = sorted.filter((p) => p < limit).length;
  const exact = sorted.filter((p) => p === limit).length;
  const over = sorted.length - under - exact;
  const scanX = interpolate(f, SCAN, [X(hi), X(limit) + 26, X(limit) - 26, X(lo)], clamp);
  const hitFrame = (x: number) => {
    const xs = [X(hi), X(limit) + 26, X(limit) - 26, X(lo)];
    for (let i = 0; i < 3; i++) if (x <= xs[i] && x >= xs[i + 1]) return SCAN[i] + ((xs[i] - x) / (xs[i] - xs[i + 1])) * (SCAN[i + 1] - SCAN[i]);
    return SCAN[3];
  };
  const tone = (p: number) => (p < limit ? BRAND.green : p === limit ? BRAND.yellow : BRAND.pink) as string;
  const nUnder = f >= SCAN[3] ? under : dots.filter((d) => d.p < limit && d.x >= scanX).length;
  const nExact = dots.filter((d) => d.p === limit && d.x >= scanX).length;
  const nOver = dots.filter((d) => d.p > limit && d.x >= scanX).length;
  const endP = interpolate(f, [END_AT - 4, END_AT + 8], [0, 1], clamp);
  const loop = interpolate(f, [UNDER_FRAMES - 9, UNDER_FRAMES - 1], [0, 1], clamp);
  const phase = f < RESULT ? 0 : f < TWIST ? 1 : 2;
  const lines = phase === 0 ? hook : phase === 1 ? [`Only *${under}* of ${sorted.length}.`, ...where] : twist;
  const de = phase === 0 ? hookDe : phase === 1 ? resultDe : twistDe;
  const t0 = phase === 0 ? 0 : phase === 1 ? RESULT : TWIST;
  const accent = (phase === 0 ? BRAND.green : phase === 1 ? BRAND.green : BRAND.yellow) as string;
  const ticks: number[] = [];
  for (let e = Math.ceil(lo); e <= Math.floor(hi); e++) ticks.push(e);
  const big = spring({ frame: f - SCAN[3], fps, config: { damping: 9, stiffness: 220, mass: 0.7 } });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      <Backdrop />
      {/* one sound per frame at most, however many dots light up */}
      {Array.from(new Map(dots.map((d) => [Math.round(hitFrame(d.x)), d.p < limit] as [number, boolean])).entries()).map(([fr, green]) => (
        <Sfx key={fr} at={fr} src={green ? "pluck_002" : "tick_001"} volume={green ? 0.45 : 0.22} />
      ))}
      <Sfx at={RESULT} src="impactPlate_heavy_001" volume={0.55} />
      <Sfx at={TWIST} src="glitch_002" volume={0.5} />
      <Sfx at={END_AT} src="confirmation_002" volume={0.55} />

      <div style={{ position: "absolute", top: 170, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontFamily: BRAND.mono, fontSize: 28, letterSpacing: 2, opacity: 1 - endP }}>
        <span style={{ color: BRAND.green, fontWeight: 700 }}>HOW MUCH?!</span>
        <span style={{ color: BRAND.muted, fontWeight: 500 }}>howmuch.live</span>
      </div>
      <div style={{ position: "absolute", top: 240, left: 80, right: 180, opacity: 1 - endP }}>
        <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 32, letterSpacing: 5, color: BRAND.green, marginBottom: 14 }}>{label}</div>
        {lines.map((ln, i) => (
          <div key={`${phase}-${i}`} style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: Math.min(108, Math.floor(820 / (ln.replace(/\*/g, "").length * 0.52))), lineHeight: 1.05, letterSpacing: -3, color: BRAND.text, whiteSpace: "nowrap", ...(phase === 0 ? {} : entrance(i === 0 ? "slam" : "rise", f - t0, i * 5, fps)) }}>
            <Accented text={ln} accent={accent} glow />
          </div>
        ))}
        <Sub text={de} style={{ marginTop: 10, fontSize: 36, opacity: phase === 0 ? 1 : interpolate(f - t0, [10, 18], [0, 1], clamp) }} />
      </div>

      {/* dot plot */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - endP }}>
        <div style={{ position: "absolute", left: 80, width: X(limit) - 80, top: 752, height: AXIS_Y - 752, background: a(BRAND.green as string, 0.07 * interpolate(f, [SCAN[2], SCAN[3]], [0, 1], clamp)), borderRadius: 14 }} />
        <div style={{ position: "absolute", left: 80, width: 820, top: AXIS_Y, height: 3, background: BRAND.border }} />
        {ticks.map((e) => (
          <div key={e} style={{ position: "absolute", left: X(e) - 50, width: 100, top: AXIS_Y + 12, textAlign: "center", fontFamily: BRAND.mono, fontWeight: e === limit ? 700 : 500, fontSize: 26, color: (e === limit ? BRAND.yellow : BRAND.muted) as string }}>{e} €</div>
        ))}
        <div style={{ position: "absolute", left: X(limit) - 2, top: 752, height: AXIS_Y - 752, borderLeft: `4px dashed ${BRAND.yellow}` }} />
        <div style={{ position: "absolute", left: X(limit) - 110, width: 220, top: 706, textAlign: "center", fontFamily: BRAND.mono, fontWeight: 700, fontSize: 30, letterSpacing: 2, color: BRAND.yellow }}>{euro(limit)}</div>
        {dots.map((d, i) => {
          const hit = d.x >= scanX && f >= SCAN[0];
          const pop = hit ? spring({ frame: f - hitFrame(d.x), fps, config: { damping: 9, stiffness: 260, mass: 0.5 } }) : 0;
          const col = hit ? tone(d.p) : (a(BRAND.muted as string, 0.55) as string);
          return <div key={i} style={{ position: "absolute", left: d.x - D / 2, top: d.y - D / 2, width: D, height: D, borderRadius: D, background: col, transform: `scale(${hit ? 0.8 + 0.2 * Math.min(1.4, pop) : 0.8})`, boxShadow: hit && d.p < limit ? `0 0 16px ${g(BRAND.green as string, 0.7)}` : "none" }} />;
        })}
        {f >= SCAN[0] && f < SCAN[3] && <div style={{ position: "absolute", left: scanX - 2, top: 752, height: AXIS_Y - 752, width: 4, background: BRAND.text, opacity: 0.7, boxShadow: `0 0 18px ${a(BRAND.text as string, 0.6)}` }} />}
        {f >= RESULT && (
          <div style={{ position: "absolute", left: dots[0].x - 66, top: dots[0].y - 84, width: 132, display: "flex", justifyContent: "center", ...entrance("pop", f - RESULT, 8, fps, "center") }}>
            <div style={{ background: BRAND.green, color: BRAND.bg as string, borderRadius: 12, padding: "4px 10px", fontFamily: BRAND.mono, fontWeight: 700, fontSize: 30, whiteSpace: "nowrap" }}>{euro(sorted[0])}</div>
          </div>
        )}
        {/* tally */}
        <div style={{ position: "absolute", top: 1166, left: 80, width: 820, display: "flex", alignItems: "center", gap: 30 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, transform: `scale(${f >= SCAN[3] ? 0.94 + 0.06 * Math.min(1.3, big) : 1})`, transformOrigin: "left center" }}>
            <span style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 150, lineHeight: 1, color: BRAND.green, textShadow: `0 0 30px ${g(BRAND.green as string, 0.5)}`, fontVariantNumeric: "tabular-nums" }}>{nUnder}</span>
            <span style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 54, color: BRAND.muted }}>/{sorted.length}</span>
          </div>
          <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 28, lineHeight: 1.5 }}>
            <div style={{ color: BRAND.green }}>● under {euro(limit)} · unter {euro(limit)}</div>
            <div style={{ color: BRAND.yellow, opacity: nExact ? 1 : 0.35 }}>● {nExact} × exactly {euro(limit)}</div>
            <div style={{ color: BRAND.pink, opacity: nOver ? 1 : 0.35 }}>● {nOver} × over · darüber</div>
          </div>
        </div>
      </div>

      {f >= END_AT - 4 && (
        <AbsoluteFill>
          <Bloom color={a(BRAND.green as string, 0.85 * (BRAND.glow as number))} start={END_AT} top={720} size={900} />
          <div style={{ position: "absolute", top: 480, left: 80, width: 820, textAlign: "center", ...entrance("slam", f - END_AT, 0, fps, "center") }}>
            {end.map((ln, i) => (
              <div key={i} style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: Math.min(100, Math.floor(820 / (ln.replace(/\*/g, "").length * 0.52))), lineHeight: 1.08, letterSpacing: -3, color: BRAND.text, whiteSpace: "nowrap" }}>
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

      <div style={{ position: "absolute", top: 1400, left: 80, right: 180, fontFamily: BRAND.mono, fontSize: 20, lineHeight: 1.35, color: BRAND.muted, opacity: 1 - endP }}>{footer}</div>
      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(f / (UNDER_FRAMES - 1)) * 100}%`, background: BRAND.green }} />
      <AbsoluteFill style={{ backgroundColor: BRAND.bg, opacity: loop, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

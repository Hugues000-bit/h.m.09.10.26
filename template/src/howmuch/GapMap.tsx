// HOW MUCH?! — "The map has holes": 10 s Reel (1080x1920, 30 fps, 120 BPM grid)
// Real Bezirk boundaries + real count of places with prices per Bezirk. Pushes people to add the first price.
import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Easing, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, a, g, applyTheme, loadBrandFonts, Theme } from "./brand";
import { Accented, Backdrop, Bloom, Sfx, Sub, entrance, typed } from "./PriceVideo";
import { DISTRICTS, MAP_H, MAP_W } from "./gapmap-data";

const BEAT = 15;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const GAP_FRAMES = 270; // v2 (22 Oct): full map on frame 0, 9 s

const MAP_X = 80;
const MAP_Y = 770;
const ZERO_AT = 4 * BEAT; // 60
const LOW_AT = 7 * BEAT; // 105
const FIRST_AT = 10 * BEAT; // 150
const END_AT = 13 * BEAT; // 195
const LOW_MAX = 5; // 1–5 places = "almost empty"
// small central Bezirke: number only, nudged so they don't overlap
const LOW_NUDGE: Record<number, [number, number]> = { 3: [4, 10], 4: [6, 0], 5: [-10, 14] };

type Block = { from: number; to: number; label?: string; lines: string[]; accent: string; de?: string; size?: number };

const TextBlock: React.FC<{ b: Block }> = ({ b }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < b.from - 2 || f > b.to) return null;
  const out = interpolate(f, [b.to - 7, b.to], [1, 0], clamp);
  const lf = f - b.from;
  const kinds = ["slam", "snapLeft", "rise"] as const;
  return (
    <div style={{ position: "absolute", top: 300, left: 80, right: 80, opacity: out, transform: `translateY(${(1 - out) * -30}px)` }}>
      {b.label && (
        <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 32, letterSpacing: 6, color: BRAND.green, marginBottom: 18 }}>
          {b.from === 0 ? b.label : typed(b.label, lf, 0, 12)}
        </div>
      )}
      {b.lines.map((ln, i) => (
        <div
          key={i}
          style={{
            fontFamily: BRAND.heading,
            fontWeight: 700,
            fontSize: b.size ?? 118,
            lineHeight: 1.04,
            letterSpacing: -3,
            color: BRAND.text,
            whiteSpace: "nowrap",
            ...(b.from === 0 ? {} : entrance(kinds[i % 3], lf, i * 5, fps)),
          }}
        >
          <Accented text={ln} accent={b.accent} glow />
        </div>
      ))}
      <Sub text={b.de} style={{ marginTop: 16, fontSize: 42, opacity: b.from === 0 ? 1 : interpolate(lf, [12, 20], [0, 1], clamp) }} />
    </div>
  );
};

export const GapMap: React.FC<{ theme?: Theme }> = ({ theme = "light" }) => {
  applyTheme(theme);
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    loadBrandFonts().then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);

  const total = DISTRICTS.reduce((s, d) => s + d.n, 0);
  const zeros = DISTRICTS.filter((d) => d.n === 0);
  const lows = DISTRICTS.filter((d) => d.n > 0 && d.n <= LOW_MAX).sort((x, y) => x.n - y.n);
  const weak = zeros.length + lows.length;
  // fill order: fullest first; the almost-empty ones are left unfilled until LOW_AT
  const order = useMemo(() => [...DISTRICTS].filter((d) => d.n > LOW_MAX).sort((x, y) => y.n - x.n), []);
  const fillAt = (_nr: number) => 0; // v2: everything is on screen from frame 0 (cover = the full map)
  const draw = 1;
  const zeroPhase = f >= ZERO_AT && f < LOW_AT;
  const lowPhase = f >= LOW_AT && f < FIRST_AT;
  const endP = interpolate(f, [END_AT - 4, END_AT + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const zeroPulse = 0.5 + 0.5 * Math.sin(((f - ZERO_AT) / BEAT) * Math.PI);
  const lowPulse = 0.5 + 0.5 * Math.sin(((f - LOW_AT) / BEAT) * Math.PI);

  const blocks: Block[] = [
    { from: 0, to: ZERO_AT, label: `WIEN · ${total} PLACES · 23 BEZIRKE`, lines: ["Is *your* Bezirk", "on the map?"], accent: BRAND.green, de: "Ist dein Bezirk auf der Karte?", size: 108 },
    { from: ZERO_AT, to: LOW_AT, label: `${zeros.length} × ZERO · MEIDLING · WÄHRING …`, lines: [`*${zeros.length}* Bezirke:`, "zero prices."], accent: BRAND.pink, de: `${zeros.length} Bezirke: null Preise.` },
    { from: LOW_AT, to: FIRST_AT, label: `${lows.length} × UNDER 6 · FAVORITEN · DÖBLING …`, lines: [`*${lows.length}* more:`, "almost empty."], accent: BRAND.yellow, de: `${lows.length} weitere: fast leer.` },
    { from: FIRST_AT, to: END_AT, label: "1 PRICE = 10 SECONDS", lines: ["Be the *first*", "in your Bezirk."], accent: BRAND.green, de: "Sei der Erste in deinem Bezirk.", size: 104 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      <Backdrop />
      <Sfx at={1} src="impactPlate_heavy_001" volume={0.4} />
      <Sfx at={LOW_AT} src="glitch_002" volume={0.5} />
      <Sfx at={ZERO_AT} src="glitch_002" volume={0.6} />
      <Sfx at={ZERO_AT + 2} src="impactPlate_heavy_001" volume={0.45} />
      <Sfx at={FIRST_AT} src="powerUp2" volume={0.4} />
      <Sfx at={END_AT} src="confirmation_002" volume={0.55} />
      {[ZERO_AT, FIRST_AT].map((t) => (
        <Sfx key={t} at={t} src="maximize_006" volume={0.35} />
      ))}

      {/* map */}
      <div style={{ position: "absolute", left: MAP_X, top: MAP_Y, width: MAP_W, height: MAP_H, opacity: 1 - 0.88 * endP, transform: `scale(${1 - 0.06 * endP})`, transformOrigin: "50% 40%" }}>
        <svg width={MAP_W} height={MAP_H} viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ overflow: "visible" }}>
          {DISTRICTS.map((d) => {
            const at = fillAt(d.nr);
            const fp2 = d.n > LOW_MAX ? (zeroPhase || lowPhase ? 0.45 : 1) : 0; // dim the full ones while we point at the holes
            void at;
            const strength = d.n < 20 ? 0.45 : 0.8;
            const isZero = d.n === 0;
            const isLow = d.n > 0 && d.n <= LOW_MAX;
            const zp = zeroPhase ? zeroPulse : 0.4;
            const lp = lowPhase ? lowPulse : 0.4;
            const fill = d.n > LOW_MAX ? a(BRAND.green, strength * Math.min(1, fp2)) : isZero ? a(BRAND.pink, (lowPhase ? 0.05 : 0.08) + 0.12 * zp) : isLow ? a(BRAND.yellow, (zeroPhase ? 0.05 : 0.1) + 0.14 * lp) : "transparent";
            const hot = isZero ? BRAND.pink : isLow ? BRAND.yellow : null;
            const hotPulse = isZero ? zp : lp;
            return (
              <path
                key={d.nr}
                d={d.d}
                pathLength={1}
                fill={fill}
                stroke={hot ?? BRAND.muted}
                strokeWidth={hot ? 3.5 : 2}
                strokeDasharray={hot ? "0.012 0.008" : `${draw} 1`}
                strokeLinejoin="round"
                style={{ filter: hot ? `drop-shadow(0 0 ${6 + 8 * hotPulse}px ${g(hot, 0.8)})` : undefined }}
              />
            );
          })}
        </svg>
        {/* counts on the fullest Bezirke */}
        {DISTRICTS.filter((d) => d.n >= 9999).map((d) => {
          const p = spring({ frame: f - fillAt(d.nr) - 4, fps, config: { damping: 12, stiffness: 200 } });
          return (
            <div key={d.nr} style={{ position: "absolute", left: d.cx, top: d.cy, transform: `translate(-50%,-50%) scale(${p})`, fontFamily: BRAND.mono, fontWeight: 700, fontSize: d.n >= 20 ? 30 : 24, color: BRAND.bg, background: BRAND.green, borderRadius: 6, padding: "2px 8px" }}>
              {d.n}
            </div>
          );
        })}
        {/* almost-empty labels (1–5 places) */}
        {lows.map((d, i) => {
          const p = spring({ frame: f - LOW_AT - i * 2, fps, config: { damping: 9, stiffness: 220, mass: 0.6 } });
          const small = d.nr in LOW_NUDGE;
          const [dx, dy] = LOW_NUDGE[d.nr] ?? (d.nr === 2 ? [40, -30] : [0, 0]);
          return (
            <div key={d.nr} style={{ position: "absolute", left: d.cx + dx, top: d.cy + dy, transform: `translate(-50%,-50%) scale(${lowPhase ? 1 + 0.18 * Math.min(1, p) : 1})`, textAlign: "center", whiteSpace: "nowrap" }}>
              <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: small ? 30 : 42, lineHeight: 1, color: BRAND.yellow, textShadow: `0 0 16px ${g(BRAND.yellow, 0.6)}` }}>{d.n}</div>
              {!small && <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 18, letterSpacing: 1, color: BRAND.yellow, marginTop: 2 }}>{d.name.toUpperCase()}</div>}
            </div>
          );
        })}
        {/* zero labels */}
        {zeros.map((d, i) => {
          const p = spring({ frame: f - ZERO_AT - i * 2, fps, config: { damping: 9, stiffness: 220, mass: 0.6 } });
          return (
            <div key={d.nr} style={{ position: "absolute", left: d.cx, top: d.cy + (d.nr === 18 ? -10 : 0), transform: `translate(-50%,-50%) scale(${zeroPhase ? 1 + 0.18 * Math.min(1, p) : 1})`, textAlign: "center", whiteSpace: "nowrap" }}>
              <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 46, lineHeight: 1, color: BRAND.pink, textShadow: `0 0 18px ${g(BRAND.pink, 0.6)}` }}>0</div>
              <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 19, letterSpacing: 1, color: BRAND.pink, marginTop: 2 }}>{d.name.toUpperCase()}</div>
            </div>
          );
        })}
      </div>

      {blocks.map((b, i) => (
        <TextBlock key={i} b={b} />
      ))}

      {/* end card */}
      {f >= END_AT - 4 && (
        <AbsoluteFill>
          <Bloom color={a(BRAND.green, 0.85 * (BRAND.glow as number))} start={END_AT} top={720} size={900} />
          <div style={{ position: "absolute", top: 520, width: "100%", textAlign: "center", ...entrance("slam", f - END_AT, 0, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 112, letterSpacing: -3, color: BRAND.text }}>
              Add <Accented text="*one*" accent={BRAND.green} glow /> price.
            </div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 44, color: BRAND.muted, marginTop: 6 }}>Trag einen Preis ein.</div>
          </div>
          <div style={{ position: "absolute", top: 760, width: "100%", textAlign: "center", ...entrance("rise", f - END_AT, 6, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 96, letterSpacing: -2, color: BRAND.green, textShadow: `0 0 26px ${g(BRAND.green, 0.5)}` }}>howmuch.live</div>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 32, color: BRAND.muted, marginTop: 10 }}>link in bio · Link in Bio</div>
          </div>
          <div style={{ position: "absolute", top: 1010, width: "100%", textAlign: "center", ...entrance("rise", f - END_AT, 12, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 64, color: BRAND.text }}>
              Comment your <Accented text="*Bezirk*" accent={BRAND.yellow} />
            </div>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 30, color: BRAND.muted, marginTop: 8 }}>Schreib deinen Bezirk in die Kommentare</div>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 84, color: BRAND.yellow, marginTop: 8, transform: `translateY(${Math.sin((f / fps) * Math.PI * 4) * 12}px)` }}>↓</div>
          </div>
        </AbsoluteFill>
      )}

      <div style={{ position: "absolute", top: 1440, left: 80, right: 80, textAlign: "center", fontFamily: BRAND.mono, fontWeight: 500, fontSize: 22, color: BRAND.muted, opacity: interpolate(f, [END_AT, END_AT + 10], [0, 0.9], clamp) }}>
        Places with prices per Bezirk · HOW MUCH?! · 22 Oct 2026 · Map: data.wien.gv.at (CC BY 4.0)
      </div>

      {/* chrome */}
      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(f / (GAP_FRAMES - 1)) * 100}%`, background: BRAND.green }} />
      <div style={{ position: "absolute", top: 190, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontFamily: BRAND.mono, fontSize: 28, letterSpacing: 2, opacity: 1 - endP }}>
        <span style={{ color: BRAND.green, fontWeight: 700 }}>HOW MUCH?!</span>
        <span style={{ color: BRAND.muted, fontWeight: 500 }}>howmuch.live</span>
      </div>
    </AbsoluteFill>
  );
};

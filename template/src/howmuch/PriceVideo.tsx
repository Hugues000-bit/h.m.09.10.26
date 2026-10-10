// HOW MUCH?! — reusable 10 s price video (1080x1920, 30 fps).
// One component for every product/city: data + copy come in as props.
//
// Motion rules applied (from the Remotion + HyperFrames skills):
// - every hit sits on a 120 BPM grid (1 beat = 15 frames) so the cut lands on any trending sound
// - real scene transitions (TransitionSeries) instead of hand-made fade-outs
// - one spring/ease per role: smooth for text, snappy for UI, bouncy only for dots and the stamp
// - distinct entrances per phrase (slam / side-snap / rise), with motion blur riding the same ease
// - counters ease out hard, grow while counting, and use tabular figures so digits never jitter
// - ambient glow blooms behind hero elements (peak opacity <= 0.45)
// - sound effects (CC0, Kenney) on every hit
import React, { useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { fade } from "@remotion/transitions/fade";
import { BRAND, euro, loadBrandFonts, a, g, applyTheme, Theme } from "./brand";
import { PricePoint, stats } from "./data";

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------

type Tone = "text" | "green" | "pink" | "yellow";
export type Line = { t: string; c?: Tone; underline?: boolean };

export type PriceVideoCopy = {
  hookLabel: string;
  hookLines: string[]; // *word* = green accent
  rateLabel: string;
  tickerFinal: string;
  dataLabel: string; // tokens: {n} {min} {max} {median} {pct} {minPlz} {maxPlz}
  dataLines: Line[];
  minLabel: string;
  maxLabel: string;
  punchKicker: string;
  punchLines: Line[];
  pctCaption: string;
  stamp: string;
  ctaQuestion: string; // *word* = yellow accent
  ctaSub: string;
  footer: string;
  // Optional German sub-lines (small, muted) under the English hero text
  hookDe?: string;
  dataDe?: string;
  pctDe?: string;
  stampDe?: string;
  ctaDe?: string;
  showMedian?: boolean; // default true
  theme?: Theme; // default dark
};

export const Sub: React.FC<{ text?: string; style?: React.CSSProperties }> = ({ text, style }) =>
  text ? (
    <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 46, color: BRAND.muted, letterSpacing: -0.5, whiteSpace: "nowrap", ...style }}>
      {text}
    </div>
  ) : null;

export type PriceVideoProps = { points: PricePoint[]; copy: PriceVideoCopy };

const BEAT = 15; // frames per beat at 30 fps = 120 BPM
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const TONE = new Proxy({} as Record<Tone, string>, { get: (_, k: string) => BRAND[k] as string });

// Scene lengths are chosen so every scene starts on a beat:
// S1 0 · S2 75 (beat 5) · S3 180 (beat 12) · S4 240 (beat 16) · end 300
const S1 = 87;
const T1 = 12;
const S2 = 117;
const T2 = 12;
const S3 = 70;
const T3 = 10;
const S4 = 60;
const START = { s2: S1 - T1, s3: S1 - T1 + S2 - T2, s4: S1 - T1 + S2 - T2 + S3 - T3 };

const fillTokens = (s: string, t: Record<string, string>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => (k in t ? t[k] : `{${k}}`));

export const typed = (text: string, f: number, start: number, end: number) =>
  text.slice(0, Math.floor(interpolate(f, [start, end], [0, text.length], clamp)));

export const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 0.5 }) => (
  <Sequence from={Math.max(0, Math.round(at))} durationInFrames={45} layout="none">
    <Audio src={staticFile(`howmuch/sfx/${src}.wav`)} volume={volume} />
  </Sequence>
);

type Entrance = "slam" | "snapLeft" | "snapRight" | "rise" | "pop";

// Entrances (HyperFrames motion vocabulary, translated to frame math).
// Blur shares the position ease, so it peaks at max speed and is 0 on arrival.
export const entrance = (
  kind: Entrance,
  f: number,
  start: number,
  fps: number,
  origin = "left center"
): React.CSSProperties => {
  if (kind === "slam") {
    const p = interpolate(f, [start, start + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.poly(4)) });
    return {
      opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
      transform: `scale(${1.35 - 0.35 * p})`,
      transformOrigin: origin,
      filter: `blur(${(1 - p) * 14}px)`,
    };
  }
  if (kind === "snapLeft" || kind === "snapRight") {
    const p = interpolate(f, [start, start + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.exp) });
    const dir = kind === "snapLeft" ? -1 : 1;
    return {
      opacity: interpolate(p, [0, 0.25], [0, 1], clamp),
      transform: `translateX(${(1 - p) * 260 * dir}px)`,
      filter: `blur(${(1 - p) * 10}px)`,
    };
  }
  if (kind === "rise") {
    const p = interpolate(f, [start, start + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.circle) });
    return {
      opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
      transform: `translateY(${(1 - p) * 90}px) rotate(${(1 - p) * 5}deg)`,
      transformOrigin: origin,
    };
  }
  const s = spring({ frame: f - start, fps, config: { damping: 9, stiffness: 200, mass: 0.6 } });
  return {
    opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
    transform: `scale(${0.6 + 0.4 * s})`,
    transformOrigin: origin,
  };
};

export const Accented: React.FC<{ text: string; accent: string; glow?: boolean }> = ({ text, accent, glow }) => (
  <>
    {text.split(" ").map((w, i) => {
      // *word* (optionally followed by punctuation, e.g. *DU*?) is the accent
      const m = w.match(/^\*([^*]+)\*(.*)$/);
      return (
        <React.Fragment key={i}>
          {i > 0 ? " " : ""}
          {m ? (
            <>
              <span style={{ color: accent, textShadow: glow ? `0 0 28px ${g(accent,0.53)}` : undefined }}>{m[1]}</span>
              {m[2]}
            </>
          ) : (
            w
          )}
        </React.Fragment>
      );
    })}
  </>
);

// Same idea as the app's .glitch-text: cyan slice on top, pink slice at the bottom.
export const Glitch: React.FC<{
  text: string;
  active: boolean;
  seed: string;
  style?: React.CSSProperties;
  intensity?: number;
}> = ({ text, active, seed, style, intensity = 10 }) => {
  const frame = useCurrentFrame();
  const r = (k: string) => random(`${seed}-${k}-${frame}`) - 0.5;
  const slice: React.CSSProperties = { position: "absolute", inset: 0, whiteSpace: "nowrap", textShadow: "none" };
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        whiteSpace: "nowrap",
        transform: active ? `skewX(${r("c") * 8}deg)` : undefined,
        ...style,
      }}
    >
      {text}
      {active && (
        <>
          <span
            style={{
              ...slice,
              color: BRAND.cyan,
              clipPath: "polygon(0 0, 100% 0, 100% 36%, 0 36%)",
              transform: `translateX(${r("a") * intensity * 2}px)`,
            }}
          >
            {text}
          </span>
          <span
            style={{
              ...slice,
              color: BRAND.pink,
              clipPath: "polygon(0 64%, 100% 64%, 100% 100%, 0 100%)",
              transform: `translateX(${r("b") * intensity * 2}px)`,
            }}
          >
            {text}
          </span>
        </>
      )}
    </span>
  );
};

// Soft radial bloom behind a hero element; never brighter than 0.45.
export const Bloom: React.FC<{ color: string; start: number; size?: number; top: number }> = ({
  color,
  start,
  size = 900,
  top,
}) => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [start, start + 18], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const breathe = 1 + 0.06 * Math.sin(((f - start) / 30) * Math.PI);
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) scale(${breathe})`,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 62%)`,
        opacity: 0.38 * inP,
      }}
    />
  );
};

// ---------------------------------------------------------------------------
// Persistent layers
// ---------------------------------------------------------------------------

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const drift = (frame * 0.6) % 60;
  const band = ((frame * 16) % (height + 500)) - 250;
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            `linear-gradient(${a(BRAND.green,0.055)} 1px, transparent 1px), linear-gradient(90deg, ${a(BRAND.green,0.055)} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          backgroundPosition: `0 ${drift}px`,
        }}
      />
      <AbsoluteFill
        style={{ background: `radial-gradient(ellipse 70% 45% at 50% 40%, ${a(BRAND.green,0.08)}, transparent 70%)` }}
      />
      <AbsoluteFill
        style={{ background: `radial-gradient(ellipse at center, transparent 50%, ${BRAND.vignette} 100%)` }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: band,
          height: 250,
          background: `linear-gradient(transparent, ${a(BRAND.green,0.045)}, transparent)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            `repeating-linear-gradient(0deg, ${BRAND.scan} 0px, ${BRAND.scan} 1px, transparent 1px, transparent 4px)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Chrome: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const bugOpacity = interpolate(frame, [START.s4 - 8, START.s4], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 8,
          width: `${(frame / (durationInFrames - 1)) * 100}%`,
          background: BRAND.green,
          boxShadow: `0 0 18px ${g(BRAND.green,1)}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 190,
          left: 80,
          right: 80,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: BRAND.mono,
          fontSize: 28,
          letterSpacing: 2,
          opacity: bugOpacity,
        }}
      >
        <span style={{ color: BRAND.green, fontWeight: 700 }}>HOW MUCH?!</span>
        <span style={{ color: BRAND.muted, fontWeight: 500 }}>howmuch.live</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 1 — hook: question + slot-machine price ticker
// ---------------------------------------------------------------------------

const ROW_H = 250;
const ROLL_FROM = 16;
const ROLL_TO = 4 * BEAT; // lands on beat 4

const Hook: React.FC<{ copy: PriceVideoCopy }> = ({ copy }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rows = useMemo(() => {
    const r: string[] = [];
    for (let i = 0; i < 21; i++) r.push(euro(Math.round((3.5 + random(`roll-${i}`) * 5) * 10) / 10));
    r.push(copy.tickerFinal);
    return r;
  }, [copy.tickerFinal]);
  const last = rows.length - 1;
  const pos = (t: number) =>
    interpolate(t, [ROLL_FROM, ROLL_TO], [0, last], { ...clamp, easing: Easing.out(Easing.cubic) });
  const tickFrames = useMemo(() => {
    const out: number[] = [];
    for (let t = ROLL_FROM + 1; t <= ROLL_TO; t++) if (Math.floor(pos(t) + 0.5) > Math.floor(pos(t - 1) + 0.5)) out.push(t);
    return out;
  }, [last]);

  const p = pos(f);
  const velocity = Math.abs(p - pos(f - 1)) * ROW_H;
  const landed = f >= ROLL_TO;
  const boxIn = spring({ frame: f - 8, fps, config: { damping: 20, stiffness: 200 } });
  const kinds: Entrance[] = ["slam", "snapLeft", "rise"];
  const starts = [-6, 3, 9];

  return (
    <AbsoluteFill>
      {tickFrames.map((t, i) => (
        <Sfx key={t} at={t} src={i % 2 ? "tick_001" : "tick_002"} volume={0.5} />
      ))}
      <Sfx at={ROLL_TO} src="glitch_002" volume={0.7} />

      <div
        style={{
          position: "absolute",
          top: 330,
          left: 80,
          fontFamily: BRAND.mono,
          fontWeight: 700,
          fontSize: 34,
          letterSpacing: 6,
          color: BRAND.green,
        }}
      >
        {typed(copy.hookLabel, f, -10, 10)}
        <span style={{ opacity: Math.floor(f / 8) % 2 === 0 ? 1 : 0 }}>_</span>
      </div>

      <div style={{ position: "absolute", top: 440, left: 80, right: 80 }}>
        {copy.hookLines.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: BRAND.heading,
              fontWeight: 700,
              fontSize: 124,
              lineHeight: 1.06,
              letterSpacing: -3,
              color: BRAND.text,
              whiteSpace: "nowrap",
              ...entrance(kinds[i % 3], f, starts[i % 3] ?? i * 6, fps),
            }}
          >
            <Accented text={line} accent={BRAND.green} glow />
          </div>
        ))}
        <Sub text={copy.hookDe} style={{ marginTop: 22, opacity: interpolate(f, [16, 26], [0, 1], clamp) }} />
      </div>

      <div
        style={{
          position: "absolute",
          top: 1050,
          left: 80,
          right: 120,
          height: 250,
          border: `3px solid ${landed ? BRAND.pink : BRAND.green}`,
          borderRadius: 4,
          background: a(BRAND.card,0.85),
          boxShadow: `0 0 40px ${landed ? g(BRAND.pink,0.3) : g(BRAND.green,0.25)}`,
          overflow: "hidden",
          opacity: interpolate(boxIn, [0, 0.5], [0, 1], clamp),
          transform: `scale(${0.88 + 0.12 * boxIn})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: (250 - ROW_H) / 2 - p * ROW_H,
            filter: `blur(${Math.min(12, velocity * 0.05)}px)`,
          }}
        >
          {rows.map((r, i) => (
            <div
              key={i}
              style={{
                height: ROW_H,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Glitch
                text={r}
                active={i === last && f >= ROLL_TO && f < ROLL_TO + 7}
                seed="ticker"
                intensity={14}
                style={{
                  fontFamily: BRAND.mono,
                  fontWeight: 700,
                  fontSize: 150,
                  letterSpacing: -4,
                  fontVariantNumeric: "tabular-nums",
                  color: i === last ? BRAND.pink : BRAND.yellow,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 1335,
          left: 80,
          fontFamily: BRAND.mono,
          fontWeight: 700,
          fontSize: 34,
          letterSpacing: 8,
          color: BRAND.muted,
          opacity: interpolate(f, [2 * BEAT, 2 * BEAT + 6], [0, 1], clamp),
        }}
      >
        {copy.rateLabel}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 2 — every real price as a dot (auto-binned unit histogram)
// ---------------------------------------------------------------------------

const X0 = 90;
const X1 = 900;
const BASE = 1290;
const CHART_H = 470;

type DotLayout = { lo: number; hi: number; bin: number; perRow: number; d: number; step: number };

// Picks the bin width and dots-per-row that give the biggest readable dots inside the chart box.
const chooseLayout = (prices: number[]): DotLayout => {
  const lo = Math.floor(Math.min(...prices) * 2) / 2;
  const hi = Math.ceil((Math.max(...prices) + 0.001) * 2) / 2;
  let best: DotLayout | null = null;
  for (const bin of [0.5, 0.25, 0.2, 0.1]) {
    const slots = Math.round((hi - lo) / bin);
    const slotW = (X1 - X0) / slots;
    const counts: Record<number, number> = {};
    for (const p of prices) {
      const k = Math.min(slots - 1, Math.floor((p - lo) / bin + 1e-9));
      counts[k] = (counts[k] ?? 0) + 1;
    }
    const maxC = Math.max(...Object.values(counts));
    for (const perRow of [1, 2, 3, 4]) {
      const d = Math.min(60, (slotW / perRow) * 0.86);
      const step = d + Math.max(4, d * 0.12);
      if (Math.ceil(maxC / perRow) * step <= CHART_H && (!best || d > best.d + 0.5)) {
        best = { lo, hi, bin, perRow, d, step };
      }
    }
  }
  return best ?? { lo, hi, bin: 0.1, perRow: 4, d: 10, step: 12 };
};

const DotPlot: React.FC<{ points: PricePoint[]; copy: PriceVideoCopy; tokens: Record<string, string> }> = ({
  points,
  copy,
  tokens,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { sorted, n, median, min, max } = stats(points);
  const L = useMemo(() => chooseLayout(sorted.map((s) => s.price)), [sorted]);
  const xOf = (p: number) => X0 + ((p - L.lo) / (L.hi - L.lo)) * (X1 - X0);
  const slots = Math.round((L.hi - L.lo) / L.bin);
  const slotW = (X1 - X0) / slots;

  const dots = useMemo(() => {
    const fill: Record<number, number> = {};
    return sorted.map((pt, i) => {
      const k = Math.min(slots - 1, Math.floor((pt.price - L.lo) / L.bin + 1e-9));
      const idx = fill[k] ?? 0;
      fill[k] = idx + 1;
      const row = Math.floor(idx / L.perRow);
      const col = idx % L.perRow;
      const cx = X0 + k * slotW + slotW / 2 + (col - (L.perRow - 1) / 2) * (slotW / L.perRow);
      const cy = BASE - 8 - L.d / 2 - row * L.step;
      return { pt, i, cx, cy };
    });
  }, [sorted, L]);
  const topOfColumns = Math.min(...dots.map((d) => d.cy)) - L.d / 2;

  const DROP_FROM = BEAT; // beat 6 overall
  const DROP_SPAN = 2.5 * BEAT;
  const MEDIAN_AT = 4 * BEAT; // beat 9
  const CALLOUT_AT = 5 * BEAT; // beat 10
  const delayOf = (i: number) => DROP_FROM + (n > 1 ? (i / (n - 1)) * DROP_SPAN : 0);

  const axisGrow = interpolate(f, [6, 20], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const medianSpring = spring({ frame: f - MEDIAN_AT, fps, config: { damping: 20, stiffness: 200 } });
  const medianTop = topOfColumns - 70;
  const pulse = (start: number) =>
    1 + 0.35 * Math.sin(Math.PI * interpolate(f, [start, start + 10], [0, 1], clamp));
  const pluckEvery = Math.max(1, Math.round(n / 12));

  return (
    <AbsoluteFill>
      {dots
        .filter((d) => d.i % pluckEvery === 0)
        .map((d, k) => (
          <Sfx key={d.i} at={delayOf(d.i) + 5} src={k % 2 ? "pluck_001" : "pluck_002"} volume={0.28} />
        ))}
      {copy.showMedian !== false && <Sfx at={MEDIAN_AT} src="tick_001" volume={0.6} />}
      <Sfx at={CALLOUT_AT} src="switch_002" volume={0.55} />

      <div
        style={{
          position: "absolute",
          top: 330,
          left: 80,
          fontFamily: BRAND.mono,
          fontWeight: 700,
          fontSize: 32,
          letterSpacing: 5,
          color: BRAND.green,
        }}
      >
        {typed(fillTokens(copy.dataLabel, tokens), f, 0, 14)}
      </div>
      {copy.dataLines.map((ln, k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            top: 400 + k * 104,
            left: 80,
            fontFamily: BRAND.heading,
            fontWeight: 700,
            fontSize: 100,
            letterSpacing: -2,
            whiteSpace: "nowrap",
            color: TONE[ln.c ?? "text"],
            ...entrance(k === 0 ? "rise" : "snapLeft", f, 2 + k * 6, fps),
          }}
        >
          {ln.t}
        </div>
      ))}
      <Sub
        text={copy.dataDe}
        style={{ position: "absolute", top: 400 + copy.dataLines.length * 104 + 12, left: 80, fontSize: 42, opacity: interpolate(f, [14, 24], [0, 1], clamp) }}
      />

      {/* median marker sits behind the dots */}
      {copy.showMedian !== false && (
        <>
      <div
        style={{
          position: "absolute",
          left: xOf(median) - 1.5,
          top: BASE - (BASE - medianTop) * medianSpring,
          height: (BASE - medianTop) * medianSpring,
          width: 0,
          borderLeft: `3px dashed ${BRAND.text}`,
          opacity: 0.8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: xOf(median),
          top: medianTop - 52,
          transform: `translateX(-50%) scale(${0.7 + 0.3 * medianSpring})`,
          fontFamily: BRAND.mono,
          fontWeight: 700,
          fontSize: 30,
          color: BRAND.bg,
          background: BRAND.text,
          padding: "6px 14px",
          borderRadius: 4,
          whiteSpace: "nowrap",
          opacity: interpolate(medianSpring, [0, 0.4], [0, 1], clamp),
        }}
      >
        MEDIAN {euro(median)}
      </div>

        </>
      )}

      {dots.map(({ pt, i, cx, cy }) => {
        const delay = delayOf(i);
        const s = spring({ frame: f - delay, fps, config: { damping: 14, stiffness: 180, mass: 0.5 } });
        const isMin = i === 0;
        const isMax = i === n - 1;
        const color = isMax ? BRAND.pink : BRAND.green;
        const scale = isMin ? pulse(CALLOUT_AT) : isMax ? pulse(CALLOUT_AT + 3) : 1;
        return (
          <div
            key={`${pt.name}-${i}`}
            style={{
              position: "absolute",
              left: cx - L.d / 2,
              top: cy - L.d / 2 - (1 - Math.min(s, 1)) * 260,
              width: L.d,
              height: L.d,
              borderRadius: "50%",
              border: `${Math.max(2, L.d / 20)}px solid ${color}`,
              background: isMin || isMax ? color : a(BRAND.green,0.16),
              boxShadow: isMin || isMax ? `0 0 ${L.d * 0.6}px ${g(color,1)}` : undefined,
              opacity: interpolate(f, [delay, delay + 3], [0, 1], clamp),
              transform: `scale(${scale})`,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: X0 - 10,
          top: BASE,
          height: 4,
          width: (X1 - X0 + 20) * axisGrow,
          background: BRAND.text,
        }}
      />
      {(() => { const st = L.hi - L.lo > 12 ? 5 : L.hi - L.lo > 6 ? 2 : 1; const t0 = Math.ceil(L.lo / st) * st; return Array.from({ length: Math.floor((L.hi - t0) / st) + 1 }, (_, k) => t0 + k * st); })().map(
        (t, k) => (
          <div
            key={t}
            style={{
              position: "absolute",
              left: xOf(t),
              top: BASE + 4,
              transform: "translateX(-50%)",
              textAlign: "center",
              fontFamily: BRAND.mono,
              fontWeight: 500,
              fontSize: 30,
              color: BRAND.muted,
              opacity: interpolate(f, [10 + k * 2, 16 + k * 2], [0, 1], clamp),
            }}
          >
            <div style={{ width: 3, height: 14, background: BRAND.muted, margin: "0 auto 8px" }} />
            {t} €
          </div>
        )
      )}

      <div
        style={{
          position: "absolute",
          top: BASE + 110,
          left: 80,
          right: 180,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={entrance("snapLeft", f, CALLOUT_AT, fps)}>
          <div
            style={{
              fontFamily: BRAND.mono,
              fontWeight: 700,
              fontSize: 76,
              fontVariantNumeric: "tabular-nums",
              color: BRAND.green,
              textShadow: `0 0 24px ${g(BRAND.green,0.5)}`,
            }}
          >
            {euro(min.price)}
          </div>
          <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 26, letterSpacing: 2, color: BRAND.muted }}>
            {copy.minLabel} · {min.plz}
          </div>
        </div>
        <div style={{ textAlign: "right", ...entrance("snapRight", f, CALLOUT_AT + 3, fps) }}>
          <div
            style={{
              fontFamily: BRAND.mono,
              fontWeight: 700,
              fontSize: 76,
              fontVariantNumeric: "tabular-nums",
              color: BRAND.pink,
              textShadow: `0 0 24px ${g(BRAND.pink,0.5)}`,
            }}
          >
            {euro(max.price)}
          </div>
          <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 26, letterSpacing: 2, color: BRAND.muted }}>
            {copy.maxLabel} · {max.plz}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 3 — punchline: twist lines + dynamic-scale counter + brand stamp
// ---------------------------------------------------------------------------

const Punch: React.FC<{ points: PricePoint[]; copy: PriceVideoCopy; tokens: Record<string, string> }> = ({
  points,
  copy,
  tokens,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { pct } = stats(points);
  const solo = copy.punchLines.length === 0;

  const COUNT_FROM = solo ? 4 : BEAT; // counter lands on beat 14 (or earlier when it is the only hero)
  const COUNT_TO = solo ? 22 : 2 * BEAT;
  const STAMP_AT = 3 * BEAT; // beat 15
  const prog = interpolate(f, [COUNT_FROM, COUNT_TO], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const value = Math.round(prog * pct);
  const counterIn = interpolate(f, [COUNT_FROM - 2, COUNT_FROM + 3], [0, 1], clamp);
  const stamp = spring({ frame: f - STAMP_AT, fps, config: { damping: 9, stiffness: 220, mass: 0.7 } });
  const shake = f >= STAMP_AT + 2 && f < STAMP_AT + 9 ? (random(`shake-${f}`) - 0.5) * 18 : 0;
  const glitchOn = (f >= COUNT_TO && f < COUNT_TO + 6) || (f >= STAMP_AT + 14 && f < STAMP_AT + 17);
  const lineKinds: Entrance[] = ["slam", "snapLeft", "rise"];

  return (
    <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
      {!solo && <Sfx at={2} src="impactPlate_heavy_001" volume={0.5} />}
      <Sfx at={COUNT_FROM} src="powerUp2" volume={0.45} />
      <Sfx at={STAMP_AT + 2} src="impactPunch_heavy_000" volume={0.95} />

      <Bloom color={a(BRAND.pink,0.9*(BRAND.glow as number))} start={COUNT_FROM} top={solo ? 760 : 1010} size={solo ? 1000 : 820} />

      <div
        style={{
          position: "absolute",
          top: solo ? 500 : 430,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
        }}
      >
        <div
          style={{
            fontFamily: BRAND.mono,
            fontWeight: 700,
            fontSize: 36,
            letterSpacing: 4,
            color: BRAND.muted,
            height: 46,
            whiteSpace: "nowrap",
          }}
        >
          {typed(fillTokens(copy.punchKicker, tokens), f, 0, 12)}
        </div>

        {copy.punchLines.map((ln, k) => {
          const big = !!ln.c && ln.c !== "text";
          const start = 2 + k * 6;
          const sweep = interpolate(f, [start + 8, start + 18], [0, 1], {
            ...clamp,
            easing: Easing.inOut(Easing.cubic),
          });
          return (
            <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  fontFamily: BRAND.heading,
                  fontWeight: 700,
                  fontSize: big ? 150 : 112,
                  lineHeight: 1.0,
                  letterSpacing: big ? -5 : -3,
                  whiteSpace: "nowrap",
                  color: TONE[ln.c ?? "text"],
                  textShadow: big ? `0 0 34px ${g(TONE[ln.c ?? "text"],0.4)}` : undefined,
                  ...entrance(lineKinds[k % 3], f, start, fps, "center"),
                }}
              >
                {ln.t}
              </div>
              {ln.underline && (
                <div
                  style={{
                    marginTop: 10,
                    height: 10,
                    width: 520,
                    background: TONE[ln.c ?? "green"],
                    boxShadow: `0 0 18px ${g(TONE[ln.c ?? "green"],1)}`,
                    transform: `scaleX(${sweep})`,
                    transformOrigin: "left center",
                  }}
                />
              )}
            </div>
          );
        })}

        <div
          style={{
            opacity: counterIn,
            transform: `scale(${0.7 + 0.3 * prog})`,
            marginTop: solo ? 0 : 10,
          }}
        >
          <Glitch
            text={`+${value} %`}
            active={glitchOn}
            seed="pct"
            intensity={18}
            style={{
              fontFamily: BRAND.heading,
              fontWeight: 700,
              fontSize: solo ? 250 : 210,
              lineHeight: 1.0,
              letterSpacing: -8,
              fontVariantNumeric: "tabular-nums",
              color: BRAND.pink,
              textShadow: `0 0 50px ${g(BRAND.pink,0.6)}`,
            }}
          />
        </div>

        <div
          style={
            solo
              ? {
                  fontFamily: BRAND.heading,
                  fontWeight: 500,
                  fontSize: 66,
                  color: BRAND.text,
                  opacity: interpolate(f, [COUNT_TO - 4, COUNT_TO + 4], [0, 1], clamp),
                }
              : {
                  fontFamily: BRAND.mono,
                  fontWeight: 700,
                  fontSize: 34,
                  letterSpacing: 6,
                  color: BRAND.muted,
                  marginTop: -6,
                  opacity: interpolate(f, [COUNT_TO - 4, COUNT_TO + 4], [0, 1], clamp),
                }
          }
        >
          {copy.pctCaption}
        </div>
        <Sub text={copy.pctDe} style={{ fontSize: 40, marginTop: -10, opacity: interpolate(f, [COUNT_TO, COUNT_TO + 8], [0, 1], clamp) }} />

        <div
          style={{
            marginTop: 18,
            opacity: f >= STAMP_AT ? interpolate(stamp, [0, 0.3], [0, 1], clamp) : 0,
            transform: `scale(${1.7 - 0.7 * stamp}) rotate(-4deg)`,
          }}
        >
          <div
            style={{
              border: `5px solid ${BRAND.yellow}`,
              borderRadius: 4,
              padding: "14px 28px",
              background: a(BRAND.yellow,0.08),
              fontFamily: BRAND.heading,
              fontWeight: 700,
              fontSize: 62,
              letterSpacing: -1,
              color: BRAND.yellow,
              whiteSpace: "nowrap",
              boxShadow: `0 0 40px ${g(BRAND.yellow,0.25)}`,
            }}
          >
            {copy.stamp}
          </div>
          <Sub text={copy.stampDe} style={{ fontSize: 34, textAlign: "center", marginTop: 10, color: BRAND.yellow, opacity: 0.75 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 4 — end card + comment CTA
// ---------------------------------------------------------------------------

const EndCard: React.FC<{ copy: PriceVideoCopy; tokens: Record<string, string> }> = ({ copy, tokens }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const CTA_AT = BEAT; // beat 17
  const arrowBob = Math.sin((f / fps) * Math.PI * 4) * 12; // bobs on the beat
  const sweep = interpolate(f, [8, 18], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  return (
    <AbsoluteFill>
      <Sfx at={1} src="confirmation_002" volume={0.55} />
      <Sfx at={CTA_AT} src="pluck_002" volume={0.4} />
      <Bloom color={a(BRAND.green,0.85*(BRAND.glow as number))} start={0} top={640} size={900} />

      <div
        style={{
          position: "absolute",
          top: 560,
          width: "100%",
          textAlign: "center",
          ...entrance("slam", f, 0, fps, "center"),
        }}
      >
        <Glitch
          text="HOW MUCH?!"
          active={f < 8 || (f >= 3 * BEAT && f < 3 * BEAT + 3)}
          seed="logo"
          intensity={16}
          style={{
            fontFamily: BRAND.heading,
            fontWeight: 700,
            fontSize: 128,
            letterSpacing: -3,
            color: BRAND.green,
            textShadow: `0 0 7px ${g(BRAND.green,0.8)}, 0 0 30px ${g(BRAND.green,0.45)}`,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 760,
          width: "100%",
          textAlign: "center",
          fontFamily: BRAND.mono,
          fontWeight: 500,
          fontSize: 50,
          color: BRAND.text,
          letterSpacing: 2,
          opacity: interpolate(f, [5, 12], [0, 1], clamp),
        }}
      >
        howmuch.live
      </div>
      <div
        style={{
          position: "absolute",
          top: 870,
          left: 470,
          width: 140,
          height: 4,
          background: BRAND.green,
          boxShadow: `0 0 14px ${g(BRAND.green,1)}`,
          transform: `scaleX(${sweep})`,
          transformOrigin: "left center",
        }}
      />

      <div style={{ position: "absolute", top: 960, width: "100%", textAlign: "center", ...entrance("rise", f, CTA_AT, fps, "center") }}>
        <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 84, letterSpacing: -2, color: BRAND.text, whiteSpace: "nowrap" }}>
          <Accented text={fillTokens(copy.ctaQuestion, { ...tokens, min: tokens.min.replace(" ", "\u00a0"), max: tokens.max.replace(" ", "\u00a0") })} accent={BRAND.yellow} />
        </div>
        <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 32, color: BRAND.muted, marginTop: 14 }}>
          {copy.ctaSub}
        </div>
        <Sub text={copy.ctaDe} style={{ fontSize: 32, fontFamily: BRAND.mono, marginTop: 8 }} />
        <div
          style={{
            fontFamily: BRAND.mono,
            fontWeight: 700,
            fontSize: 90,
            color: BRAND.yellow,
            marginTop: 18,
            transform: `translateY(${arrowBob}px)`,
          }}
        >
          ↓
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 1420,
          width: "100%",
          textAlign: "center",
          fontFamily: BRAND.mono,
          fontWeight: 500,
          fontSize: 24,
          color: BRAND.muted,
          opacity: interpolate(f, [2 * BEAT, 2 * BEAT + 8], [0, 0.9], clamp),
        }}
      >
        {fillTokens(copy.footer, tokens)}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------

export const PRICE_VIDEO_FRAMES = S1 + S2 + S3 + S4 - T1 - T2 - T3; // 300

export const PriceVideo: React.FC<PriceVideoProps> = ({ points, copy }) => {
  applyTheme(copy.theme ?? "dark");
  const st = stats(points);
  const tokens = {
    n: String(st.n),
    min: euro(st.min.price),
    max: euro(st.max.price),
    median: euro(st.median),
    pct: `${st.pct} %`,
    minPlz: st.min.plz,
    maxPlz: st.max.plz,
  };
  const [fontHandle] = useState(() => delayRender("Loading HOW MUCH?! fonts"));
  useEffect(() => {
    loadBrandFonts()
      .then(() => continueRender(fontHandle))
      .catch((err) => {
        console.error(err);
        continueRender(fontHandle);
      });
  }, [fontHandle]);

  const smooth = (d: number) => springTiming({ config: { damping: 200 }, durationInFrames: d });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      <Backdrop />
      {[START.s2, START.s3, START.s4].map((at) => (
        <Sfx key={at} at={at} src="maximize_006" volume={0.45} />
      ))}
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={S1}>
          <Hook copy={copy} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={smooth(T1)} />
        <TransitionSeries.Sequence durationInFrames={S2}>
          <DotPlot points={points} copy={copy} tokens={tokens} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={smooth(T2)} />
        <TransitionSeries.Sequence durationInFrames={S3}>
          <Punch points={points} copy={copy} tokens={tokens} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={smooth(T3)} />
        <TransitionSeries.Sequence durationInFrames={S4}>
          <EndCard copy={copy} tokens={tokens} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Chrome />
    </AbsoluteFill>
  );
};

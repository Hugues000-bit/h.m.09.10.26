// HOW MUCH?! — motion-design concept film, 1080x1920, 30 fps, about 20 s (length follows the voice).
// Pure motion (no screenshots): kinetic type synced to the voice, a swinging price tag, a seesaw of two real prices,
// a receipt, the real dots of the map, counters, three steps, logo reveal. Scenes change with a circle wipe.
// Prices: lowest and highest latest cappuccino price found on howmuch.live (no venue named, no average).
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Easing, continueRender, delayRender, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, a, g, euro, applyTheme, loadBrandFonts, Theme } from "./brand";
import { Backdrop, Bloom, Glitch, Sfx } from "./PriceVideo";
import { Cue, VoiceOver, voiceFrames } from "./Voice";
import { VOICE } from "./voice-data";
import { MapShade, ViennaMap } from "./ViennaMap";
import { DOTS } from "./places-data";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SET = "motion-intro";
const IDS = ["m1", "m2", "m3", "m4", "m5", "m6"];
const MIN = [70, 84, 66, 78, 84, 90];
const WIPE = 12;

export const motionSchedule = () => {
  const start: number[] = [];
  let t = 0;
  IDS.forEach((id, i) => {
    start.push(t);
    t += Math.max(MIN[i], voiceFrames(SET, id) + 20);
  });
  return { start, endAt: t, total: t + Math.max(105, voiceFrames(SET, "end") + 70) };
};

export type MotionProps = { theme?: Theme; low: number; high: number; places: string; prices: string; item: string };

// One word at a time, timed over the voice line; *word* = accent.
const Kinetic: React.FC<{ text: string; rel: number; frames: number; size: number; accent: string; top: number; align?: "left" | "center" }> = ({ text, rel, frames, size, accent, top, align = "left" }) => {
  const { fps } = useVideoConfig();
  const lines = text.split("|");
  const all = lines.flatMap((l) => l.trim().split(" "));
  const weight = (w: string) => w.replace(/[*~]/g, "").length + 2;
  const total = all.reduce((s, w) => s + weight(w), 0);
  let acc = 0;
  const at = all.map((w) => {
    const v = (acc / total) * frames;
    acc += weight(w);
    return v;
  });
  let k = 0;
  return (
    <div style={{ position: "absolute", top, left: 80, width: 820, textAlign: align }}>
      {lines.map((l, li) => (
        <div key={li} style={{ whiteSpace: "nowrap", lineHeight: 1.04 }}>
          {l.trim().split(" ").map((w, wi) => {
            const i = k++;
            const p = spring({ frame: rel - at[i], fps, config: { damping: 13, stiffness: 260, mass: 0.6 } });
            const acc2 = /^\*.*\*[.,?!]?$/.test(w);
            const pink = /^~.*~[.,?!]?$/.test(w);
            const clean = w.replace(/[*~]/g, "");
            return (
              <span key={wi} style={{ display: "inline-block", marginRight: size * 0.24, fontFamily: BRAND.heading, fontWeight: 700, fontSize: size, letterSpacing: -size * 0.035,
                color: pink ? (BRAND.pink as string) : acc2 ? accent : (BRAND.text as string), textShadow: acc2 || pink ? `0 0 ${size * 0.3}px ${g(pink ? (BRAND.pink as string) : accent, 0.5)}` : "none",
                opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - Math.min(1, p)) * size * 0.6}px) scale(${0.85 + 0.15 * Math.min(1, p)})` }}>
                {clean}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const Tag: React.FC<{ label: string; col: string; w?: number; rot?: number }> = ({ label, col, w = 420, rot = 0 }) => (
  <div style={{ position: "relative", width: w, height: w * 0.46, transform: `rotate(${rot}deg)` }}>
    <svg width={w} height={w * 0.46} viewBox="0 0 420 194" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <path d="M70 6 H404 a10 10 0 0 1 10 10 V178 a10 10 0 0 1 -10 10 H70 L8 97 Z" fill={BRAND.card as string} stroke={col} strokeWidth={7} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 18px ${g(col, 0.55)})` }} />
      <circle cx={62} cy={97} r={14} fill="none" stroke={col} strokeWidth={6} />
    </svg>
    <div style={{ position: "absolute", left: w * 0.22, right: w * 0.04, top: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: BRAND.mono, fontWeight: 700, fontSize: w * 0.2, color: col, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{label}</div>
  </div>
);

const Cup: React.FC<{ draw: number; size?: number }> = ({ draw, size = 260 }) => {
  const L = 900;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }}>
      <g fill="none" stroke={BRAND.text as string} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={L} strokeDashoffset={L * (1 - draw)}>
        <path d="M40 80 H150 V120 a50 50 0 0 1 -50 50 h-10 a50 50 0 0 1 -50 -50 Z" />
        <path d="M150 92 h12 a20 20 0 0 1 0 40 h-14" />
        <path d="M20 182 H170" />
      </g>
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${72 + i * 24} 62 q -10 -14 0 -28 q 10 -14 0 -28`} fill="none" stroke={a(BRAND.muted as string, 0.8)} strokeWidth={5} strokeLinecap="round"
          strokeDasharray={60} strokeDashoffset={60 * (1 - interpolate(draw, [0.6 + i * 0.1, 1], [0, 1], clamp))} />
      ))}
    </svg>
  );
};

export const MotionIntro: React.FC<MotionProps> = ({ theme = "dark", low, high, places, prices, item }) => {
  applyTheme(theme);
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    loadBrandFonts().then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);

  const S = motionSchedule();
  const G = BRAND.green as string;
  const P = BRAND.pink as string;
  const Y = BRAND.yellow as string;
  const cues: Cue[] = [...IDS.map((id, i) => ({ id, at: S.start[i] + 6 })), { id: "end", at: S.endAt + 16 }];
  const vf = (id: string) => VOICE[SET]?.[id]?.frames ?? 60;
  const loop = interpolate(f, [S.total - 9, S.total - 1], [0, 1], clamp);

  const scene = (i: number, rel: number): React.ReactNode => {
    const v = vf(IDS[i]);
    const kin = (text: string, size: number, top = 300, accent = G) => <Kinetic text={text} rel={rel - 6} frames={v} size={size} accent={accent} top={top} />;
    if (i === 0) {
      // the question: a cup draws itself, a tag swings in with scrambling digits
      const swing = spring({ frame: rel - 18, fps, config: { damping: 6, stiffness: 70, mass: 0.9 } });
      const ang = (1 - swing) * 60;
      const scramble = Array.from({ length: 4 }, (_, k) => Math.floor(random(`d${k}-${Math.floor(rel / 2)}`) * 10));
      return (
        <>
          {kin(`How much is|a *${item}*|in Vienna?`, 112)}
          <div style={{ position: "absolute", top: 1020, left: 140 }}>
            <Cup draw={interpolate(rel, [4, 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) })} />
          </div>
          <div style={{ position: "absolute", top: 720, left: 470, width: 4, height: 230 * swing, background: BRAND.muted as string, transformOrigin: "top", transform: `rotate(${ang * 0.3}deg)` }} />
          <div style={{ position: "absolute", top: 930, left: 400, transformOrigin: "60px 0px", transform: `rotate(${ang}deg)`, opacity: Math.min(1, swing * 2) }}>
            <Tag label={`${scramble[0]},${scramble[1]}${scramble[2]} €`} col={Y} w={460} rot={-90 + 90} />
          </div>
        </>
      );
    }
    if (i === 1) {
      // the answer: a seesaw tilts between the lowest and the highest price
      const tilt = interpolate(spring({ frame: rel - 30, fps, config: { damping: 8, stiffness: 90 } }), [0, 1], [0, 9]);
      const inL = spring({ frame: rel - 4, fps, config: { damping: 11, stiffness: 200 } });
      const inR = spring({ frame: rel - 24, fps, config: { damping: 11, stiffness: 200 } });
      return (
        <>
          {kin(`*${euro(low).replace(" ", " ")}* or|~${euro(high).replace(" ", " ")}~.|Same city.`, 118, 300, G)}
          <div style={{ position: "absolute", top: 1010, left: 120, width: 840, height: 360 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 210, height: 14, borderRadius: 14, background: BRAND.text as string, transform: `rotate(${tilt}deg)`, transformOrigin: "50% 50%" }}>
              <div style={{ position: "absolute", left: 10, bottom: 14, transform: `translateY(${(1 - inL) * -600}px) rotate(${-tilt}deg)` }}>
                <Tag label={euro(low)} col={G} w={330} />
              </div>
              <div style={{ position: "absolute", right: 10, bottom: 14, transform: `translateY(${(1 - inR) * -600}px) rotate(${-tilt}deg)` }}>
                <Tag label={euro(high)} col={P} w={330} />
              </div>
            </div>
            <svg width={840} height={360} style={{ position: "absolute", inset: 0 }}>
              <path d="M420 224 L370 330 H470 Z" fill={BRAND.muted as string} />
            </svg>
          </div>
        </>
      );
    }
    if (i === 2) {
      // the problem: a receipt prints, then gets stamped
      const print = interpolate(rel, [4, 34], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
      const stamp = spring({ frame: rel - 38, fps, config: { damping: 9, stiffness: 260, mass: 0.7 } });
      return (
        <>
          {kin(`And you find out|*after* you order.`, 104, 300, P)}
          <div style={{ position: "absolute", top: 640, left: 290, width: 500, height: 640 * print, overflow: "hidden" }}>
            <div style={{ width: 500, height: 640, background: "#F6F1E6", padding: "40px 40px", boxSizing: "border-box", fontFamily: BRAND.mono, color: "#1C1A17", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
              <div style={{ fontSize: 30, fontWeight: 700, textAlign: "center", letterSpacing: 4 }}>RECHNUNG</div>
              <div style={{ borderTop: "4px dashed #7A7368", margin: "26px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 36, fontWeight: 700 }}><span>1 × {item.toUpperCase()}</span></div>
              <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 64, fontWeight: 700, marginTop: 14 }}>{euro(high)}</div>
              <div style={{ borderTop: "4px dashed #7A7368", margin: "26px 0" }} />
              <div style={{ fontSize: 26, color: "#7A7368" }}>DANKE · BIS BALD</div>
            </div>
          </div>
          {rel >= 38 && (
            <div style={{ position: "absolute", top: 1060, left: 270, width: 540, textAlign: "center", transform: `rotate(-9deg) scale(${2 - Math.min(1, stamp)})`, opacity: Math.min(1, stamp * 1.5) }}>
              <span style={{ display: "inline-block", border: `8px solid ${P}`, borderRadius: 18, padding: "6px 26px", fontFamily: BRAND.heading, fontWeight: 700, fontSize: 92, color: P, background: a(BRAND.bg as string, 0.85) }}>SURPRISE!</span>
            </div>
          )}
        </>
      );
    }
    if (i === 3) {
      // the idea: the real dots of the map rain in
      const fillEnd = 52;
      const shown = (k: number) => 4 + (k / (DOTS.length - 1)) * fillEnd;
      return (
        <>
          <ViennaMap cam={{ x: 440, y: 450, s: 2.0 + 0.2 * interpolate(rel, [0, 90], [0, 1], clamp) }} focus={[540, 1080]} dotColor={G}
            dot={(k) => (rel < shown(k) ? 0 : 1 + 1.2 * Math.max(0, 1 - (rel - shown(k)) / 7))} />
          <MapShade top={760} bottom={520} />
          {kin(`So we put|every price|on *one map*.`, 108)}
        </>
      );
    }
    if (i === 4) {
      // the people: two counters, little avatars dropping pins
      const c1 = interpolate(rel, [6, 46], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
      return (
        <>
          {kin(`*Real* prices.|Added by *real*|people in Vienna.`, 100)}
          {[
            { v: places, l: "places · Lokale", top: 760, col: G },
            { v: prices, l: "prices · Preise", top: 1000, col: Y },
          ].map((c, k) => {
            const n = parseInt(c.v.replace(/\D/g, ""), 10);
            const shownN = Math.round(n * interpolate(rel, [6 + k * 8, 46 + k * 8], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }));
            return (
              <div key={k} style={{ position: "absolute", top: c.top, left: 80, display: "flex", alignItems: "baseline", gap: 24, opacity: Math.min(1, c1 * 3) }}>
                <span style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 170, color: c.col, textShadow: `0 0 30px ${g(c.col, 0.5)}`, fontVariantNumeric: "tabular-nums" }}>
                  {String(shownN).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}{shownN === n && c.v.endsWith("+") ? "+" : ""}
                </span>
                <span style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 48, color: BRAND.text }}>{c.l}</span>
              </div>
            );
          })}
          <div style={{ position: "absolute", top: 1250, left: 80, width: 820, display: "flex", gap: 18 }}>
            {Array.from({ length: 9 }, (_, k) => {
              const p = spring({ frame: rel - 20 - k * 4, fps, config: { damping: 10, stiffness: 220 } });
              return (
                <svg key={k} width={74} height={110} viewBox="0 0 74 110" style={{ opacity: Math.min(1, p), transform: `translateY(${(1 - Math.min(1, p)) * 60}px)` }}>
                  <circle cx={37} cy={26} r={18} fill={k % 3 === 0 ? G : k % 3 === 1 ? Y : P} />
                  <path d="M8 104 a29 29 0 0 1 58 0 Z" fill={a(BRAND.text as string, 0.85)} />
                </svg>
              );
            })}
          </div>
        </>
      );
    }
    // i === 5: three steps
    const steps = [
      { icon: "pin", t: "Find the cheap one", d: "Finde das Günstige", col: G },
      { icon: "eq", t: "Compare", d: "Vergleiche", col: Y },
      { icon: "plus", t: "Add what you paid", d: "Trag deinen Preis ein", col: P },
    ];
    return (
      <>
        {kin(`Find the *cheap one*.|Or add the price|you *just paid*.`, 96)}
        {steps.map((s, k) => {
          const p = spring({ frame: rel - 10 - k * 16, fps, config: { damping: 11, stiffness: 220, mass: 0.6 } });
          return (
            <div key={k} style={{ position: "absolute", top: 760 + k * 190, left: 80, width: 820, height: 160, borderRadius: 28, background: a(BRAND.card as string, 0.9), border: `3px solid ${s.col}`,
              display: "flex", alignItems: "center", gap: 34, padding: "0 34px", boxSizing: "border-box", opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - Math.min(1, p)) * 900}px)`, boxShadow: `0 0 34px ${g(s.col, 0.25)}` }}>
              <svg width={90} height={90} viewBox="0 0 90 90">
                {s.icon === "pin" && <path d="M45 84 C20 54 12 42 12 30 a33 33 0 0 1 66 0 c0 12 -8 24 -33 54 Z M45 18 a12 12 0 1 0 0.1 0 Z" fill={s.col} fillRule="evenodd" />}
                {s.icon === "eq" && (
                  <g fill={s.col}>
                    <rect x={10} y={46} width={18} height={34} rx={4} />
                    <rect x={36} y={26} width={18} height={54} rx={4} />
                    <rect x={62} y={8} width={18} height={72} rx={4} />
                  </g>
                )}
                {s.icon === "plus" && <path d="M38 10 h14 v28 h28 v14 h-28 v28 h-14 v-28 h-28 v-14 h28 Z" fill={s.col} />}
              </svg>
              <div>
                <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 56, color: BRAND.text, letterSpacing: -1.5, whiteSpace: "nowrap" }}>{s.t}</div>
                <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 32, color: BRAND.muted }}>{s.d}</div>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  // current scene + the previous one under the circle wipe
  const idx = Math.max(0, S.start.filter((t) => f >= t).length - 1);
  const inEnd = f >= S.endAt;
  const rel = f - S.start[idx];
  const wipeP = (start: number) => interpolate(f, [start, start + WIPE], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const layer = (node: React.ReactNode, clip: number | null, key: string) => (
    <AbsoluteFill key={key} style={{ backgroundColor: BRAND.bg, clipPath: clip === null ? undefined : `circle(${clip * 130}% at 50% 62%)` }}>
      <Backdrop />
      {node}
    </AbsoluteFill>
  );
  const endRel = f - S.endAt;
  const logo = spring({ frame: endRel - 4, fps, config: { damping: 9, stiffness: 160, mass: 0.8 } });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      <VoiceOver set={SET} cues={cues} />
      {S.start.slice(1).map((t, k) => <Sfx key={k} at={t} src="maximize_006" volume={0.22} />)}
      <Sfx at={S.start[0] + 18} src="pluck_001" volume={0.25} />
      <Sfx at={S.start[1] + 30} src="impactPunch_heavy_000" volume={0.3} />
      <Sfx at={S.start[2] + 38} src="impactPlate_heavy_001" volume={0.3} />
      <Sfx at={S.start[3] + 4} src="powerUp2" volume={0.22} />
      <Sfx at={S.endAt + 4} src="glitch_002" volume={0.3} />
      <Sfx at={S.endAt + 12} src="confirmation_002" volume={0.3} />

      {!inEnd && idx > 0 && f < S.start[idx] + WIPE && layer(scene(idx - 1, f - S.start[idx - 1]), null, `prev-${idx}`)}
      {!inEnd && layer(scene(idx, rel), idx === 0 ? null : wipeP(S.start[idx]), `cur-${idx}`)}

      {f >= S.endAt - 1 && (
        <AbsoluteFill style={{ clipPath: `circle(${wipeP(S.endAt) * 130}% at 50% 62%)`, backgroundColor: BRAND.bg }}>
          <Backdrop />
          <Bloom color={a(G, 0.85 * (BRAND.glow as number))} start={S.endAt} top={700} size={1000} />
          <div style={{ position: "absolute", top: 560, left: 0, width: 1080, textAlign: "center", transform: `scale(${0.6 + 0.4 * Math.min(1.1, logo)})`, opacity: Math.min(1, logo * 1.5) }}>
            <Glitch text="HOW MUCH?!" active={endRel >= 4 && endRel < 14} seed="mi" style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 136, letterSpacing: -5, color: G, textShadow: `0 0 40px ${g(G, 0.6)}` }} />
          </div>
          <div style={{ position: "absolute", top: 800, left: 80, width: 920 - 80, textAlign: "center", opacity: interpolate(endRel, [14, 24], [0, 1], clamp), transform: `translateY(${interpolate(endRel, [14, 24], [30, 0], clamp)}px)` }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 60, color: BRAND.text, letterSpacing: -1.5 }}>Real prices. Real people.</div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 38, color: BRAND.muted, marginTop: 10 }}>Echte Preise. Echte Leute.</div>
          </div>
          <div style={{ position: "absolute", top: 1010, left: 80, width: 920 - 80, textAlign: "center", opacity: interpolate(endRel, [22, 32], [0, 1], clamp) }}>
            <span style={{ display: "inline-block", border: `4px solid ${G}`, borderRadius: 24, padding: "14px 40px", fontFamily: BRAND.heading, fontWeight: 700, fontSize: 84, color: G, letterSpacing: -2 }}>howmuch.live</span>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 30, color: BRAND.muted, marginTop: 22 }}>Free · in your browser · Gratis im Browser</div>
          </div>
        </AbsoluteFill>
      )}

      <div style={{ position: "absolute", top: 170, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontFamily: BRAND.mono, fontSize: 28, letterSpacing: 2, opacity: inEnd ? 0 : 1 }}>
        <span style={{ color: BRAND.green, fontWeight: 700 }}>HOW MUCH?!</span>
        <span style={{ color: BRAND.muted, fontWeight: 500 }}>howmuch.live</span>
      </div>
      <div style={{ position: "absolute", top: 1404, left: 80, right: 180, fontFamily: BRAND.mono, fontSize: 20, lineHeight: 1.35, color: BRAND.muted, opacity: inEnd ? 0 : 1 }}>
        Lowest and highest {item} price found on howmuch.live · latest price per place · Vienna · Nov 2026
      </div>
      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(f / (S.total - 1)) * 100}%`, background: BRAND.green }} />
      <AbsoluteFill style={{ backgroundColor: BRAND.bg, opacity: loop, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

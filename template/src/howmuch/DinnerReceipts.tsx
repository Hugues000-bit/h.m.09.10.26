// HOW MUCH?! — "same dinner, two bills": two receipts print side by side, 1080x1920, 30 fps, 12 s.
// Same order at two places (e.g. Schnitzel + Krügerl), cheapest total vs priciest total. Only the Bezirk is shown, never the venue.
// With beer on it this one is for Instagram / Facebook only (no alcohol on TikTok).
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Easing, continueRender, delayRender, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, a, g, applyTheme, loadBrandFonts, Theme } from "./brand";
import { Accented, Backdrop, Bloom, Sfx, Sub, entrance } from "./PriceVideo";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const DINNER_FRAMES = 360;
const SIDE_AT = [20, 104]; // first line of each receipt
const LINE_GAP = 26;
const DIFF_AT = 196;
const END_AT = 284;
const PAPER = "#F6F1E6";
const INK = "#1C1A17";
const INK_MUTED = "#7A7368";
const TEAR = "polygon(0 0,100% 0,100% calc(100% - 14px),95% 100%,90% calc(100% - 14px),85% 100%,80% calc(100% - 14px),75% 100%,70% calc(100% - 14px),65% 100%,60% calc(100% - 14px),55% 100%,50% calc(100% - 14px),45% 100%,40% calc(100% - 14px),35% 100%,30% calc(100% - 14px),25% 100%,20% calc(100% - 14px),15% 100%,10% calc(100% - 14px),5% 100%,0 calc(100% - 14px))";

export type Bill = { tag: string; tagSub: string; lines: { label: string; sub?: string; price: string }[]; total: string };
export type DinnerProps = {
  theme?: Theme;
  label: string;
  hook: string[];
  hookDe: string;
  left: Bill; // the cheap one
  right: Bill; // the pricey one
  stampTop: string; // "SAME ORDER"
  stampMain: string; // "+26,60 €"
  punch: string[];
  punchDe: string;
  cta: string;
  ctaDe: string;
  ctaSub: string;
  footer: string;
};

export const DinnerReceipts: React.FC<DinnerProps> = ({ theme = "dark", label, hook, hookDe, left, right, stampTop, stampMain, punch, punchDe, cta, ctaDe, ctaSub, footer }) => {
  applyTheme(theme);
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    loadBrandFonts().then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);

  const endP = interpolate(f, [END_AT - 4, END_AT + 8], [0, 1], clamp);
  const loop = interpolate(f, [DINNER_FRAMES - 9, DINNER_FRAMES - 1], [0, 1], clamp);
  const hookOut = interpolate(f, [DIFF_AT - 6, DIFF_AT], [1, 0], clamp);
  const stamp = spring({ frame: f - DIFF_AT, fps, config: { damping: 9, stiffness: 240, mass: 0.7 } });
  const shake = f >= DIFF_AT + 1 && f < DIFF_AT + 8 ? (random(`dr-${f}`) - 0.5) * 16 : 0;

  const Receipt = ({ bill, side }: { bill: Bill; side: 0 | 1 }) => {
    const t0 = SIDE_AT[side];
    const ink = side === 0 ? "#118A4E" : "#D21F6B";
    const totalAt = t0 + bill.lines.length * LINE_GAP + 6;
    const totalP = interpolate(f, [totalAt, totalAt + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    return (
      <div style={{ width: 398, transform: `rotate(${side === 0 ? -1.6 : 1.4}deg)` }}>
        <div style={{ background: PAPER, padding: "26px 24px 44px", boxShadow: "0 26px 70px rgba(0,0,0,0.38)", clipPath: TEAR }}>
          <div style={{ textAlign: "center", fontFamily: BRAND.mono, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: INK }}>HOW MUCH?!</div>
          <div style={{ textAlign: "center", fontFamily: BRAND.heading, fontWeight: 700, fontSize: 46, letterSpacing: -1, color: ink, marginTop: 8 }}>{bill.tag}</div>
          <div style={{ textAlign: "center", fontFamily: BRAND.mono, fontWeight: 500, fontSize: 19, letterSpacing: 1, color: INK_MUTED, marginTop: 2 }}>{bill.tagSub}</div>
          <div style={{ borderTop: `3px dashed ${INK_MUTED}`, margin: "16px 0 10px" }} />
          {bill.lines.map((ln, i) => {
            const at = t0 + i * LINE_GAP;
            const p = interpolate(f, [at, at + 8], [0, 1], clamp);
            return (
              <div key={i} style={{ height: 104, display: "flex", flexDirection: "column", justifyContent: "center", opacity: f < at ? 0 : p, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}>
                <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 28, color: INK, whiteSpace: "nowrap" }}>{ln.label}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 19, color: INK_MUTED }}>{ln.sub ?? ""}</div>
                  <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 46, color: INK }}>{ln.price}</div>
                </div>
              </div>
            );
          })}
          <div style={{ borderTop: `3px dashed ${INK_MUTED}`, margin: "10px 0 10px" }} />
          <div style={{ opacity: totalP }}>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 24, letterSpacing: 2, color: INK_MUTED }}>TOTAL · SUMME</div>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 78, lineHeight: 1.05, color: ink, textAlign: "right", transform: `scale(${0.82 + 0.18 * totalP})`, transformOrigin: "right center", whiteSpace: "nowrap" }}>{bill.total}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      <Backdrop />
      {[left, right].map((b, s) => (
        <React.Fragment key={s}>
          {b.lines.map((_, i) => <Sfx key={i} at={SIDE_AT[s] + i * LINE_GAP} src="tick_002" volume={0.5} />)}
          <Sfx at={SIDE_AT[s] + b.lines.length * LINE_GAP + 6} src={s === 0 ? "pluck_002" : "powerUp2"} volume={0.4} />
        </React.Fragment>
      ))}
      <Sfx at={DIFF_AT + 1} src="impactPunch_heavy_000" volume={0.9} />
      <Sfx at={END_AT} src="confirmation_002" volume={0.55} />

      <div style={{ position: "absolute", top: 240, left: 80, right: 180, opacity: 1 - endP }}>
        <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 32, letterSpacing: 5, color: BRAND.green, marginBottom: 14 }}>{label}</div>
        <div style={{ opacity: hookOut }}>
          {hook.map((ln, i) => (
            <div key={i} style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: Math.min(112, Math.floor(820 / (ln.replace(/\*/g, "").length * 0.52))), lineHeight: 1.04, letterSpacing: -3, color: BRAND.text, whiteSpace: "nowrap" }}>
              <Accented text={ln} accent={BRAND.pink as string} glow />
            </div>
          ))}
          <Sub text={hookDe} style={{ marginTop: 10, fontSize: 38 }} />
        </div>
        {f >= DIFF_AT && f < END_AT && (
          <div style={{ position: "absolute", top: 46, left: 0, right: 0 }}>
            {punch.map((ln, i) => (
              <div key={i} style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: Math.min(112, Math.floor(820 / (ln.replace(/\*/g, "").length * 0.52))), lineHeight: 1.04, letterSpacing: -3, color: BRAND.text, whiteSpace: "nowrap", ...entrance(i === 0 ? "slam" : "rise", f - DIFF_AT, i * 5, fps) }}>
                <Accented text={ln} accent={BRAND.pink as string} glow />
              </div>
            ))}
            <Sub text={punchDe} style={{ marginTop: 10, fontSize: 38, opacity: interpolate(f - DIFF_AT, [10, 18], [0, 1], clamp) }} />
          </div>
        )}
      </div>

      <div style={{ position: "absolute", top: 640, left: 80, width: 820, display: "flex", justifyContent: "space-between", alignItems: "flex-start", opacity: 1 - endP }}>
        <Receipt bill={left} side={0} />
        <Receipt bill={right} side={1} />
      </div>
      {f >= DIFF_AT && f < END_AT && (
        <div style={{ position: "absolute", top: 1232, left: 80, width: 820, display: "flex", justifyContent: "center" }}>
          <div style={{ transform: `translate(${shake}px,0) rotate(-5deg) scale(${1.8 - 0.8 * Math.min(1, stamp)})`, opacity: Math.min(1, stamp * 1.5), border: `7px solid ${BRAND.pink}`, borderRadius: 18, padding: "10px 34px", textAlign: "center", background: a(BRAND.bg as string, 0.88), boxShadow: `0 0 40px ${g(BRAND.pink as string, 0.5)}` }}>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: BRAND.pink }}>{stampTop}</div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 84, letterSpacing: -2, lineHeight: 1.05, color: BRAND.pink, whiteSpace: "nowrap" }}>{stampMain}</div>
          </div>
        </div>
      )}

      {f >= END_AT - 4 && (
        <AbsoluteFill>
          <Bloom color={a(BRAND.green as string, 0.85 * (BRAND.glow as number))} start={END_AT} top={720} size={900} />
          <div style={{ position: "absolute", top: 500, left: 80, width: 820, textAlign: "center", ...entrance("slam", f - END_AT, 0, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 72, letterSpacing: -3, color: BRAND.text }}><Accented text={cta} accent={BRAND.green as string} glow /></div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 40, color: BRAND.muted, marginTop: 8 }}>{ctaDe}</div>
          </div>
          <div style={{ position: "absolute", top: 760, left: 80, width: 820, textAlign: "center", ...entrance("rise", f - END_AT, 6, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 96, letterSpacing: -2, color: BRAND.green, textShadow: `0 0 26px ${g(BRAND.green as string, 0.5)}` }}>howmuch.live</div>
          </div>
          <div style={{ position: "absolute", top: 960, left: 80, width: 820, textAlign: "center", ...entrance("rise", f - END_AT, 12, fps, "center") }}>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 32, color: BRAND.muted }}>{ctaSub}</div>
          </div>
        </AbsoluteFill>
      )}

      <div style={{ position: "absolute", top: 1420, left: 80, right: 180, fontFamily: BRAND.mono, fontSize: 20, color: BRAND.muted, opacity: 1 - endP }}>{footer}</div>
      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(f / (DINNER_FRAMES - 1)) * 100}%`, background: BRAND.green }} />
      <div style={{ position: "absolute", top: 170, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontFamily: BRAND.mono, fontSize: 28, letterSpacing: 2, opacity: 1 - endP }}>
        <span style={{ color: BRAND.green, fontWeight: 700 }}>HOW MUCH?!</span>
        <span style={{ color: BRAND.muted, fontWeight: 500 }}>howmuch.live</span>
      </div>
      <AbsoluteFill style={{ backgroundColor: BRAND.bg, opacity: loop, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

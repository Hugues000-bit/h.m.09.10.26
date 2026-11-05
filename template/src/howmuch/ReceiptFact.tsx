// HOW MUCH?! — "surprising fact" on a receipt (Kassenbon), 1080x1920, 30 fps, 11 s.
// A different look from the price videos: a paper receipt prints two or three lines, a rubber stamp lands
// (e.g. "SAME BEZIRK · INNERE STADT"), the difference is totalled, then the punchline and howmuch.live.
// No venue is ever named (neither the priciest nor the cheapest).
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Easing, continueRender, delayRender, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, a, g, applyTheme, loadBrandFonts, Theme } from "./brand";
import { Accented, Backdrop, Bloom, Sfx, Sub, entrance } from "./PriceVideo";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const RECEIPT_FRAMES = 330;
const LINE_AT = [14, 48, 82]; // each printed line
const STAMP_AT = 105; // 3,5 s
const TOTAL_AT = 150; // 5 s
const PUNCH_AT = 195; // 6,5 s
const END_AT = 255; // 8,5 s

export type ReceiptLine = { label: string; sub?: string; price: string; tone: "green" | "pink" | "text" };
export type ReceiptProps = {
  theme?: Theme;
  label: string; // "WIEN · CAPPUCCINO"
  hook: string[]; // big lines, *word* = accent
  hookDe: string;
  lines: ReceiptLine[]; // 2 or 3 lines
  stampTop: string; // "SAME BEZIRK"
  stampMain: string; // "INNERE STADT"
  totalLabel: string; // "DIFFERENCE"
  total: string; // "+226 %"
  punch: string[]; // ["Same Bezirk.", "*3×* the price."]
  punchDe: string;
  cta: string; // "Where's the *2,30 €* one?"
  ctaDe: string;
  ctaSub: string; // "📩 Send this to your coffee buddy"
  footer: string; // "latest price per place · 119 places · 5 Nov 2026"
};

const PAPER = "#F6F1E6";
const INK = "#1C1A17";
const INK_MUTED = "#7A7368";

export const ReceiptFact: React.FC<ReceiptProps> = ({ theme = "dark", label, hook, hookDe, lines, stampTop, stampMain, totalLabel, total, punch, punchDe, cta, ctaDe, ctaSub, footer }) => {
  applyTheme(theme);
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    loadBrandFonts().then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);

  const tone = (t: ReceiptLine["tone"]) => (t === "green" ? "#118A4E" : t === "pink" ? "#D21F6B" : INK);
  const stamp = spring({ frame: f - STAMP_AT, fps, config: { damping: 9, stiffness: 240, mass: 0.7 } });
  const shake = f >= STAMP_AT + 1 && f < STAMP_AT + 8 ? (random(`rs-${f}`) - 0.5) * 16 : 0;
  const totalP = interpolate(f, [TOTAL_AT, TOTAL_AT + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const endP = interpolate(f, [END_AT - 4, END_AT + 8], [0, 1], clamp);
  const paperIn = 1; // the paper is there on frame 0 (hook), lines print after
  const hookOut = interpolate(f, [PUNCH_AT - 6, PUNCH_AT], [1, 0], clamp);
  const punchP = f >= PUNCH_AT ? 1 : 0;
  // receipt grows as it prints (y offset of the paper bottom)
  const loop = interpolate(f, [RECEIPT_FRAMES - 9, RECEIPT_FRAMES - 1], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      <Backdrop />
      {lines.map((_, i) => <Sfx key={i} at={LINE_AT[i]} src="tick_002" volume={0.5} />)}
      <Sfx at={STAMP_AT + 1} src="impactPunch_heavy_000" volume={0.9} />
      <Sfx at={TOTAL_AT} src="powerUp2" volume={0.4} />
      <Sfx at={PUNCH_AT} src="glitch_002" volume={0.5} />
      <Sfx at={END_AT} src="confirmation_002" volume={0.55} />

      {/* hook (visible on frame 0), then the punchline in the same place */}
      <div style={{ position: "absolute", top: 240, left: 80, right: 180, opacity: (1 - endP) }}>
        <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 32, letterSpacing: 5, color: BRAND.green, marginBottom: 14 }}>{label}</div>
        <div style={{ opacity: hookOut }}>
          {hook.map((ln, i) => (
            <div key={i} style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: Math.min(92, Math.floor(820 / (ln.replace(/\*/g, "").length * 0.52))), lineHeight: 1.04, letterSpacing: -3, color: BRAND.text, whiteSpace: "nowrap" }}>
              <Accented text={ln} accent={BRAND.pink} glow />
            </div>
          ))}
          <Sub text={hookDe} style={{ marginTop: 10, fontSize: 38 }} />
        </div>
        {punchP > 0 && f < END_AT && (
          <div style={{ position: "absolute", top: 46, left: 0, right: 0 }}>
            {punch.map((ln, i) => (
              <div key={i} style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: Math.min(100, Math.floor(820 / (ln.replace(/\*/g, "").length * 0.52))), lineHeight: 1.04, letterSpacing: -3, color: BRAND.text, whiteSpace: "nowrap", ...entrance(i === 0 ? "slam" : "rise", f - PUNCH_AT, i * 5, fps) }}>
                <Accented text={ln} accent={BRAND.pink} glow />
              </div>
            ))}
            <Sub text={punchDe} style={{ marginTop: 10, fontSize: 38, opacity: interpolate(f - PUNCH_AT, [10, 18], [0, 1], clamp) }} />
          </div>
        )}
      </div>

      {/* the receipt */}
      <div style={{ position: "absolute", left: 90, width: 800, top: 640, opacity: paperIn * (1 - endP), transform: `translateY(${(1 - paperIn) * 60}px) rotate(-1.5deg)` }}>
        <div style={{ background: PAPER, padding: "40px 48px 64px", boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
          clipPath: "polygon(0 0,100% 0,100% calc(100% - 18px),96% 100%,92% calc(100% - 18px),88% 100%,84% calc(100% - 18px),80% 100%,76% calc(100% - 18px),72% 100%,68% calc(100% - 18px),64% 100%,60% calc(100% - 18px),56% 100%,52% calc(100% - 18px),48% 100%,44% calc(100% - 18px),40% 100%,36% calc(100% - 18px),32% 100%,28% calc(100% - 18px),24% 100%,20% calc(100% - 18px),16% 100%,12% calc(100% - 18px),8% 100%,4% calc(100% - 18px),0 100%)" }}>
          <div style={{ textAlign: "center", fontFamily: BRAND.mono, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: INK }}>HOW MUCH?!</div>
          <div style={{ textAlign: "center", fontFamily: BRAND.mono, fontWeight: 500, fontSize: 20, letterSpacing: 2, color: INK_MUTED, marginTop: 4 }}>KASSENBON · WIEN · howmuch.live</div>
          <div style={{ borderTop: `3px dashed ${INK_MUTED}`, margin: "22px 0 18px" }} />
          {lines.map((ln, i) => {
            const p = interpolate(f, [LINE_AT[i], LINE_AT[i] + 8], [0, 1], clamp);
            if (f < LINE_AT[i]) return <div key={i} style={{ height: 124 }} />;
            return (
              <div key={i} style={{ height: 124, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: p, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}>
                <div>
                  <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 38, color: INK }}>{ln.label}</div>
                  {ln.sub && <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 22, color: INK_MUTED, marginTop: 4 }}>{ln.sub}</div>}
                </div>
                <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 66, color: tone(ln.tone) }}>{ln.price}</div>
              </div>
            );
          })}
          <div style={{ borderTop: `3px dashed ${INK_MUTED}`, margin: "14px 0 18px" }} />
          <div style={{ height: 96, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: totalP }}>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 36, color: INK }}>{totalLabel}</div>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 76, color: "#D21F6B", transform: `scale(${0.8 + 0.2 * totalP})`, transformOrigin: "right center" }}>{total}</div>
          </div>
          <div style={{ textAlign: "center", fontFamily: BRAND.mono, fontWeight: 500, fontSize: 18, color: INK_MUTED, marginTop: 18 }}>{footer}</div>
        </div>
        {/* rubber stamp */}
        {f >= STAMP_AT && (
          <div style={{ position: "absolute", right: -24, top: 6, transform: `translate(${shake}px,0) rotate(-9deg) scale(${1.8 - 0.8 * Math.min(1, stamp)})`, opacity: Math.min(1, stamp * 1.5),
            border: "6px solid #D21F6B", borderRadius: 14, padding: "10px 22px", color: "#D21F6B", textAlign: "center", background: "rgba(246,241,230,0.55)", mixBlendMode: "multiply" }}>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 26, letterSpacing: 4 }}>{stampTop}</div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 52, letterSpacing: -1, lineHeight: 1.05 }}>{stampMain}</div>
          </div>
        )}
      </div>

      {f >= END_AT - 4 && (
        <AbsoluteFill>
          <Bloom color={a(BRAND.green, 0.85 * (BRAND.glow as number))} start={END_AT} top={720} size={900} />
          <div style={{ position: "absolute", top: 500, left: 80, width: 820, textAlign: "center", ...entrance("slam", f - END_AT, 0, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 72, letterSpacing: -3, color: BRAND.text }}><Accented text={cta} accent={BRAND.green} glow /></div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 40, color: BRAND.muted, marginTop: 8 }}>{ctaDe}</div>
          </div>
          <div style={{ position: "absolute", top: 760, left: 80, width: 820, textAlign: "center", ...entrance("rise", f - END_AT, 6, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 96, letterSpacing: -2, color: BRAND.green, textShadow: `0 0 26px ${g(BRAND.green, 0.5)}` }}>howmuch.live</div>
          </div>
          <div style={{ position: "absolute", top: 960, left: 80, width: 820, textAlign: "center", ...entrance("rise", f - END_AT, 12, fps, "center") }}>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 32, color: BRAND.muted }}>{ctaSub}</div>
          </div>
        </AbsoluteFill>
      )}

      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(f / (RECEIPT_FRAMES - 1)) * 100}%`, background: BRAND.green }} />
      <div style={{ position: "absolute", top: 170, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontFamily: BRAND.mono, fontSize: 28, letterSpacing: 2, opacity: 1 - endP }}>
        <span style={{ color: BRAND.green, fontWeight: 700 }}>HOW MUCH?!</span>
        <span style={{ color: BRAND.muted, fontWeight: 500 }}>howmuch.live</span>
      </div>
      {/* loop back to frame 0 */}
      <AbsoluteFill style={{ backgroundColor: BRAND.bg, opacity: loop, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

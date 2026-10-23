// HOW MUCH?! — "Price quiz" (1080x1920, 30 fps, 9 s). Built for comments: question + 3 answers on frame 0,
// a 3-2-1 countdown (people comment A/B/C), the reveal, then the cheapest price as the hook to howmuch.live.
// No venue is named (neither the priciest nor the cheapest).
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, a, g, applyTheme, loadBrandFonts, Theme } from "./brand";
import { Accented, Backdrop, Bloom, Glitch, Sfx, Sub, entrance } from "./PriceVideo";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const QUIZ_FRAMES = 270;
const COUNT_AT = 40; // 3 · 2 · 1, 25 frames each
const REVEAL = 115;
const CHEAP_AT = 165;
const END_AT = 205;

export type QuizProps = {
  theme?: Theme;
  label: string; // "QUIZ · WIEN · CAPPUCCINO"
  question: string[]; // big lines, *word* = accent
  questionDe: string;
  options: string[]; // ["4,50 €", "6,00 €", "7,50 €"]
  answer: number; // index in options
  answerLine: string; // "for one cappuccino."
  answerDe: string;
  cheapest: string; // "3,00 €"
  n: number; // places compared
  item: string; // "cappuccino"
  itemDe: string;
};

export const PriceQuiz: React.FC<QuizProps> = ({ theme = "light", label, question, questionDe, options, answer, answerLine, answerDe, cheapest, n, item, itemDe }) => {
  applyTheme(theme);
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    loadBrandFonts().then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);

  const revealed = f >= REVEAL;
  const count = f >= COUNT_AT && f < REVEAL ? 3 - Math.floor((f - COUNT_AT) / 25) : null;
  const countP = count ? spring({ frame: (f - COUNT_AT) % 25, fps, config: { damping: 10, stiffness: 300 } }) : 0;
  const pAns = revealed ? spring({ frame: f - REVEAL, fps, config: { damping: 10, stiffness: 260 } }) : 0;
  const cheapIn = f >= CHEAP_AT ? spring({ frame: f - CHEAP_AT, fps, config: { damping: 12, stiffness: 240 } }) : 0;
  const endP = interpolate(f, [END_AT - 4, END_AT + 8], [0, 1], clamp);
  const letters = ["A", "B", "C", "D"];

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      <Backdrop />
      <Sfx at={1} src="impactPlate_heavy_001" volume={0.4} />
      {[0, 1, 2].map((i) => <Sfx key={i} at={COUNT_AT + i * 25} src="tick_002" volume={0.55} />)}
      <Sfx at={REVEAL} src="glitch_002" volume={0.7} />
      <Sfx at={CHEAP_AT} src="powerUp2" volume={0.4} />
      <Sfx at={END_AT} src="confirmation_002" volume={0.55} />

      <div style={{ position: "absolute", top: 250, left: 80, right: 80, opacity: 1 - endP }}>
        <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 32, letterSpacing: 5, color: BRAND.green, marginBottom: 14 }}>{label}</div>
        {question.map((ln, i) => (
          <div key={i} style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: Math.min(100, Math.floor(920 / (ln.replace(/\*/g, "").length * 0.52))), lineHeight: 1.04, letterSpacing: -3, color: BRAND.text, whiteSpace: "nowrap" }}>
            <Accented text={ln} accent={BRAND.pink} glow />
          </div>
        ))}
        <Sub text={questionDe} style={{ marginTop: 12, fontSize: 40 }} />
      </div>

      {/* answers */}
      <div style={{ position: "absolute", top: 760, left: 80, right: 80, opacity: 1 - endP }}>
        {options.map((o, i) => {
          const right = i === answer;
          const on = revealed && right;
          const off = revealed && !right;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 36, height: 150, marginBottom: 24, padding: "0 40px", borderRadius: 20,
              border: `${on ? 5 : 3}px solid ${on ? BRAND.green : BRAND.border}`,
              background: on ? a(BRAND.green, 0.14) : a(BRAND.card, 0.7),
              boxShadow: on ? `0 0 40px ${g(BRAND.green, 0.5)}` : "none",
              opacity: off ? 0.3 : 1, transform: on ? `scale(${1 + 0.05 * Math.min(1, pAns)})` : undefined,
            }}>
              <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 64, color: on ? BRAND.green : BRAND.yellow }}>{letters[i]}</div>
              {on ? (
                <Glitch text={o} active={f < REVEAL + 6} seed="quiz" intensity={14} style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 96, letterSpacing: -3, color: BRAND.green }} />
              ) : (
                <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 96, letterSpacing: -3, color: BRAND.text }}>{o}</div>
              )}
              {on && <div style={{ marginLeft: "auto", fontFamily: BRAND.mono, fontWeight: 700, fontSize: 64, color: BRAND.green }}>✓</div>}
            </div>
          );
        })}
        {/* status line under the answers */}
        <div style={{ marginTop: 16, height: 120, textAlign: "center" }}>
          {!revealed && count === null && (
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 48, color: BRAND.text }}>
              Comment your answer <span style={{ color: BRAND.yellow }}>↓</span>
              <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 28, color: BRAND.muted, marginTop: 6 }}>Kommentier deine Antwort</div>
            </div>
          )}
          {count !== null && (
            <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 120, lineHeight: 1, color: BRAND.yellow, transform: `scale(${1.4 - 0.4 * Math.min(1, countP)})`, textShadow: `0 0 30px ${g(BRAND.yellow, 0.5)}` }}>{count}</div>
          )}
          {revealed && f < CHEAP_AT && (
            <div style={{ ...entrance("rise", f - REVEAL, 4, fps, "center") }}>
              <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 56, color: BRAND.text }}>{answerLine}</div>
              <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 28, color: BRAND.muted, marginTop: 6 }}>{answerDe}</div>
            </div>
          )}
          {f >= CHEAP_AT && (
            <div style={{ transform: `scale(${0.8 + 0.2 * Math.min(1, cheapIn)})`, opacity: Math.min(1, cheapIn) }}>
              <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 56, color: BRAND.text }}>
                Cheapest? <Accented text={`*${cheapest.replace(" ", " ")}*`} accent={BRAND.green} glow />
              </div>
              <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 28, color: BRAND.muted, marginTop: 6 }}>Der billigste: {cheapest} · {n} places</div>
            </div>
          )}
        </div>
      </div>

      {f >= END_AT - 4 && (
        <AbsoluteFill>
          <Bloom color={a(BRAND.green, 0.85 * (BRAND.glow as number))} start={END_AT} top={720} size={900} />
          <div style={{ position: "absolute", top: 520, width: "100%", textAlign: "center", ...entrance("slam", f - END_AT, 0, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 92, letterSpacing: -3, color: BRAND.text }}>
              Where's the <Accented text={`*${cheapest.replace(" ", " ")}*`} accent={BRAND.green} glow /> one?
            </div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 42, color: BRAND.muted, marginTop: 6 }}>Wo gibt's den {itemDe} um {cheapest}?</div>
          </div>
          <div style={{ position: "absolute", top: 760, width: "100%", textAlign: "center", ...entrance("rise", f - END_AT, 6, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 96, letterSpacing: -2, color: BRAND.green, textShadow: `0 0 26px ${g(BRAND.green, 0.5)}` }}>howmuch.live</div>
          </div>
          <div style={{ position: "absolute", top: 960, width: "100%", textAlign: "center", ...entrance("rise", f - END_AT, 12, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 56, color: BRAND.text }}>
              You got it? <span style={{ color: BRAND.yellow }}>A, B or C</span> 👇
            </div>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 28, color: BRAND.muted, marginTop: 8 }}>Richtig geraten? Kommentier's.</div>
          </div>
        </AbsoluteFill>
      )}

      <div style={{ position: "absolute", top: 1560, left: 80, right: 80, textAlign: "center", fontFamily: BRAND.mono, fontSize: 20, color: BRAND.muted, opacity: 1 - endP }}>
        latest {item} price per place · {n} places in Vienna · HOW MUCH?! community
      </div>
      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(f / (QUIZ_FRAMES - 1)) * 100}%`, background: BRAND.green }} />
      <div style={{ position: "absolute", top: 160, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontFamily: BRAND.mono, fontSize: 28, letterSpacing: 2, opacity: 1 - endP }}>
        <span style={{ color: BRAND.green, fontWeight: 700 }}>HOW MUCH?!</span>
        <span style={{ color: BRAND.muted, fontWeight: 500 }}>howmuch.live</span>
      </div>
    </AbsoluteFill>
  );
};

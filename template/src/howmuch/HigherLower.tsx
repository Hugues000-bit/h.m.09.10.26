// HOW MUCH?! — "Higher or lower?" game, 1080x1920, 30 fps, about 33 s with 5 rounds.
// Each round: a real price extreme (cheapest / priciest found in Vienna) against a reference price.
// The viewer guesses during the countdown, the real price lands, next round. Ends on "your score?".
// Length follows the voice lines (scripts/voice.py); without a voice set it runs on fixed timings.
// No venue is ever named. Keep it alcohol-free so the same file can go on TikTok.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Easing, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, a, g, euro, applyTheme, loadBrandFonts, Theme } from "./brand";
import { Accented, Backdrop, Bloom, Sfx, entrance } from "./PriceVideo";
import { Captions, Cue, VoiceOver, voiceFrames } from "./Voice";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const THINK = 30; // silent countdown after the question
const SILENT_Q = 105;

export type HLRound = {
  kind: "cheapest" | "priciest";
  item: string; // "espresso"
  itemDe: string; // "Der billigste Espresso"
  note: string; // "119 places"
  ref: number;
  real: number;
};
export type HLProps = { theme?: Theme; rounds: HLRound[]; voice?: string; footer: string };

export const hlSchedule = (n: number, voice?: string) => {
  const vf = (id: string) => (voice ? voiceFrames(voice, id) : 0);
  const intro = Math.max(57, vf("intro") + 15);
  let t = intro;
  const r: { start: number; reveal: number; end: number }[] = [];
  for (let i = 1; i <= n; i++) {
    const q = voice ? vf(`q${i}`) + THINK : SILENT_Q;
    const an = Math.max(60, vf(`a${i}`) + 18);
    r.push({ start: t, reveal: t + q, end: t + q + an });
    t += q + an;
  }
  const outro = Math.max(105, vf("outro") + 48);
  return { intro, r, outroAt: t, total: t + outro };
};

export const HigherLower: React.FC<HLProps> = ({ theme = "dark", rounds, voice, footer }) => {
  applyTheme(theme);
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    loadBrandFonts().then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);

  const S = hlSchedule(rounds.length, voice);
  const cues: Cue[] = voice
    ? [{ id: "intro", at: 4 }, ...S.r.flatMap((r, i) => [{ id: `q${i + 1}`, at: r.start + 4 }, { id: `a${i + 1}`, at: r.reveal + 2 }]), { id: "outro", at: S.outroAt + 8 }]
    : [];
  const idx = S.r.findIndex((r) => f >= r.start && f < r.end);
  const inIntro = f < S.intro;
  const inOutro = f >= S.outroAt;
  const done = S.r.filter((r) => f >= r.reveal).length;
  const loop = interpolate(f, [S.total - 9, S.total - 1], [0, 1], clamp);
  const sfxVol = voice ? 0.28 : 0.5;

  const Pips = ({ n, size = 22 }: { n: number; size?: number }) => (
    <div style={{ display: "flex", gap: 10 }}>
      {rounds.map((_, i) => (
        <div key={i} style={{ width: size, height: size, borderRadius: size, background: i < n ? (BRAND.green as string) : "transparent", border: `3px solid ${i < n ? BRAND.green : BRAND.border}`, boxShadow: i < n ? `0 0 12px ${g(BRAND.green as string, 0.6)}` : "none" }} />
      ))}
    </div>
  );

  const Btn = ({ dir, state }: { dir: "up" | "down"; state: "idle" | "win" | "lose" }) => {
    const col = dir === "up" ? (BRAND.pink as string) : (BRAND.green as string);
    const pulse = state === "idle" ? 1 + 0.025 * Math.sin((f / 30) * Math.PI * 2 + (dir === "up" ? 0 : Math.PI)) : 1;
    return (
      <div style={{ width: 398, height: 168, borderRadius: 26, border: `4px solid ${state === "lose" ? BRAND.border : col}`, background: state === "win" ? col : a(BRAND.card as string, 0.75), opacity: state === "lose" ? 0.28 : 1,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${state === "win" ? 1.04 : pulse})`, transformOrigin: dir === "up" ? "left center" : "right center", boxShadow: state === "win" ? `0 0 46px ${g(col, 0.7)}` : "none" }}>
        <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 62, letterSpacing: -1, color: state === "win" ? (BRAND.bg as string) : col, lineHeight: 1 }}>
          {dir === "up" ? "▲ HIGHER" : "▼ LOWER"}
        </div>
        <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 26, color: state === "win" ? (BRAND.bg as string) : (BRAND.muted as string), marginTop: 10 }}>{dir === "up" ? "teurer" : "billiger"}</div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      <Backdrop />
      {voice && <VoiceOver set={voice} cues={cues} />}
      {S.r.map((r, i) => (
        <React.Fragment key={i}>
          <Sfx at={r.start} src="switch_002" volume={sfxVol} />
          <Sfx at={r.reveal - 30} src="tick_001" volume={sfxVol} />
          <Sfx at={r.reveal - 20} src="tick_001" volume={sfxVol} />
          <Sfx at={r.reveal - 10} src="tick_002" volume={sfxVol} />
          <Sfx at={r.reveal} src="impactPlate_heavy_001" volume={voice ? 0.32 : 0.6} />
        </React.Fragment>
      ))}
      <Sfx at={S.outroAt} src="confirmation_002" volume={voice ? 0.35 : 0.55} />

      {/* fixed header: what the game is, and where we are */}
      <div style={{ position: "absolute", top: 170, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontFamily: BRAND.mono, fontSize: 28, letterSpacing: 2 }}>
        <span style={{ color: BRAND.green, fontWeight: 700 }}>HOW MUCH?!</span>
        <span style={{ color: BRAND.muted, fontWeight: 500 }}>howmuch.live</span>
      </div>
      {!inOutro && (
        <div style={{ position: "absolute", top: 244, left: 80, width: 820, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: BRAND.green }}>HIGHER OR LOWER? · WIEN</div>
          <Pips n={done} />
        </div>
      )}

      {/* intro (frame 0 = cover) */}
      {inIntro && (
        <div style={{ position: "absolute", top: 420, left: 80, width: 820, opacity: interpolate(f, [S.intro - 6, S.intro], [1, 0], clamp) }}>
          <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 168, lineHeight: 0.98, letterSpacing: -7, color: BRAND.text }}>
            <span style={{ color: BRAND.pink, textShadow: `0 0 30px ${g(BRAND.pink as string, 0.5)}` }}>Higher</span>
            <br />
            or <span style={{ color: BRAND.green, textShadow: `0 0 30px ${g(BRAND.green as string, 0.5)}` }}>lower</span>?
          </div>
          <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 64, letterSpacing: -2, color: BRAND.text, marginTop: 44 }}>{rounds.length} real Vienna prices.</div>
          <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 40, color: BRAND.muted, marginTop: 10, whiteSpace: "nowrap" }}>Teurer oder billiger? {rounds.length} echte Preise.</div>
          <div style={{ display: "flex", gap: 24, marginTop: 70 }}>
            <Btn dir="up" state="idle" />
            <Btn dir="down" state="idle" />
          </div>
        </div>
      )}

      {/* rounds */}
      {idx >= 0 &&
        (() => {
          const R = rounds[idx];
          const r = S.r[idx];
          const rel = f - r.start;
          const revealed = f >= r.reveal;
          const rr = f - r.reveal;
          const higher = R.real > R.ref;
          const col = (higher ? BRAND.pink : BRAND.green) as string;
          const kindCol = (R.kind === "cheapest" ? BRAND.green : BRAND.pink) as string;
          const count = interpolate(rr, [0, 14], [R.ref, R.real], { ...clamp, easing: Easing.out(Easing.cubic) });
          const land = spring({ frame: rr, fps, config: { damping: 10, stiffness: 220, mass: 0.7 } });
          const timer = interpolate(f, [r.start + 10, r.reveal], [1, 0], clamp);
          const itemSize = Math.min(150, Math.floor(820 / (R.item.length * 0.56)));
          return (
            <>
              <div style={{ position: "absolute", top: 318, left: 80, width: 820, ...entrance("snapRight", rel, 0, fps) }}>
                <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 60, letterSpacing: -2, color: BRAND.text }}>
                  {idx + 1}/{rounds.length} · The <span style={{ color: kindCol }}>{R.kind}</span>
                </div>
                <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: itemSize, lineHeight: 1.02, letterSpacing: -5, color: BRAND.text, whiteSpace: "nowrap" }}>{R.item}</div>
                <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 38, color: BRAND.muted, marginTop: 6, whiteSpace: "nowrap" }}>
                  {R.itemDe} · {R.note}
                </div>
              </div>

              {/* price card */}
              <div style={{ position: "absolute", top: 640, left: 80, width: 820, height: 290, borderRadius: 32, background: a(BRAND.card as string, 0.82), border: `4px solid ${revealed ? col : BRAND.border}`,
                boxShadow: revealed ? `0 0 60px ${g(col, 0.45)}` : "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", ...entrance("pop", rel, 4, fps, "center") }}>
                <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 24, letterSpacing: 2, color: revealed ? col : (BRAND.muted as string) }}>
                  {revealed ? `REAL PRICE · ECHTER PREIS` : `HIGHER OR LOWER THAN · TEURER ODER BILLIGER ALS`}
                </div>
                <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 176, lineHeight: 1.05, color: revealed ? col : (BRAND.text as string), fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap",
                  transform: `scale(${revealed ? 0.92 + 0.08 * Math.min(1.2, land) : 1})`, textShadow: revealed ? `0 0 34px ${g(col, 0.5)}` : "none" }}>
                  {revealed ? euro(count) : `${euro(R.ref)}?`}
                </div>
              </div>

              <div style={{ position: "absolute", top: 970, left: 80, width: 820, display: "flex", justifyContent: "space-between", ...entrance("rise", rel, 8, fps, "center") }}>
                <Btn dir="up" state={!revealed ? "idle" : higher ? "win" : "lose"} />
                <Btn dir="down" state={!revealed ? "idle" : higher ? "lose" : "win"} />
              </div>
              {/* countdown */}
              <div style={{ position: "absolute", top: 1168, left: 80, width: 820, height: 12, borderRadius: 12, background: a(BRAND.border as string, 0.9), opacity: revealed ? 0 : 1 }}>
                <div style={{ width: `${timer * 100}%`, height: "100%", borderRadius: 12, background: BRAND.yellow }} />
              </div>
              {revealed && <Bloom color={a(col, 0.5 * (BRAND.glow as number))} start={r.reveal} top={780} size={820} />}
            </>
          );
        })()}

      {/* outro */}
      {inOutro && (
        <AbsoluteFill>
          <Bloom color={a(BRAND.green as string, 0.8 * (BRAND.glow as number))} start={S.outroAt} top={700} size={900} />
          <div style={{ position: "absolute", top: 380, left: 80, width: 820, textAlign: "center", ...entrance("slam", f - S.outroAt, 0, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 124, letterSpacing: -5, lineHeight: 1, color: BRAND.text }}>
              Your <Accented text="*score*?" accent={BRAND.green as string} glow />
            </div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 44, color: BRAND.muted, marginTop: 14 }}>Wie viele hattest du richtig?</div>
          </div>
          <div style={{ position: "absolute", top: 690, left: 80, width: 820, display: "flex", flexDirection: "column", alignItems: "center", ...entrance("pop", f - S.outroAt, 8, fps, "center") }}>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 190, color: BRAND.green, textShadow: `0 0 34px ${g(BRAND.green as string, 0.5)}`, lineHeight: 1 }}>?/{rounds.length}</div>
            <div style={{ marginTop: 26 }}>
              <Pips n={rounds.length} size={34} />
            </div>
          </div>
          <div style={{ position: "absolute", top: 1010, left: 80, width: 820, textAlign: "center", ...entrance("rise", f - S.outroAt, 14, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 58, letterSpacing: -2, color: BRAND.text }}>💬 Drop it in the comments.</div>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 30, color: BRAND.muted, marginTop: 12 }}>Schreib deinen Score in die Kommentare.</div>
          </div>
        </AbsoluteFill>
      )}

      {voice && !inIntro && <Captions set={voice} cues={cues} top={inOutro ? 1210 : 1228} />}

      <div style={{ position: "absolute", top: 1396, left: 80, right: 180, fontFamily: BRAND.mono, fontSize: 20, lineHeight: 1.35, color: BRAND.muted }}>{footer}</div>
      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(f / (S.total - 1)) * 100}%`, background: BRAND.green }} />
      <AbsoluteFill style={{ backgroundColor: BRAND.bg, opacity: loop, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

// HOW MUCH?! — "what is this app?" explainer, 1080x1920, 30 fps, about 24 s (length follows the voice).
// Only real crops of howmuch.live are shown (map, legend, category chips, "Add a price" button): never a made-up interface.
// Not used: the list of places (names next to red dots) and the "Typical prices" bar (an average).
// TikTok-safe by default: no alcohol or cigarette chips. Crops: public/howmuch/app/ (cut from a 1920x1080 screenshot, 10 Nov 2026).
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, a, g, applyTheme, loadBrandFonts, Theme } from "./brand";
import { Accented, Backdrop, Bloom, Sfx, entrance } from "./PriceVideo";
import { Captions, Cue, VoiceOver, voiceFrames } from "./Voice";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SET = "app-explainer";
const STEPS = ["l1", "l2", "l3", "l4", "l5", "l6"];
// chip file, width of the crop in px (height 102)
const CHIPS: [string, number][] = [
  ["coffee", 222], ["doener", 213], ["schnitzel", 264], ["pizza", 198], ["burger", 225], ["currywurst", 294], ["bratwurst", 276], ["leberkaese", 279],
  ["kaesekrainer", 300], ["frenchfries", 306], ["sandwich", 273], ["croissant", 267], ["energydrink", 318], ["tea", 171], ["juice", 204], ["pasta", 207],
];
const CHIP_S = 0.74;

export const explainerSchedule = () => {
  const start: number[] = [];
  let t = 0;
  STEPS.forEach((id) => {
    start.push(t);
    t += Math.max(66, voiceFrames(SET, id) + 18);
  });
  return { start, endAt: t, total: t + Math.max(100, voiceFrames(SET, "end") + 66) };
};

export type ExplainerProps = { theme?: Theme; prices: string; ctaSub: string };

export const AppExplainer: React.FC<ExplainerProps> = ({ theme = "dark", prices, ctaSub }) => {
  applyTheme(theme);
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    loadBrandFonts().then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);

  const S = explainerSchedule();
  const step = Math.max(0, S.start.filter((t) => f >= t).length - 1);
  const rel = f - S.start[step];
  const inEnd = f >= S.endAt;
  const endP = interpolate(f, [S.endAt - 4, S.endAt + 8], [0, 1], clamp);
  const loop = interpolate(f, [S.total - 9, S.total - 1], [0, 1], clamp);
  const cues: Cue[] = [...STEPS.map((id, i) => ({ id, at: S.start[i] + 4 })), { id: "end", at: S.endAt + 10 }];

  const G = BRAND.green as string;
  const P = BRAND.pink as string;
  const head: Record<number, { lines: React.ReactNode[]; de: string }> = {
    0: { lines: ["What things", <>*really* cost</>, "in Vienna."], de: "Was Dinge in Wien wirklich kosten." },
    1: { lines: ["Every dot =", <>a *real* price.</>], de: "Jeder Punkt = ein echter Preis, von Leuten aus Wien." },
    2: { lines: [<><span style={{ color: G }}>Green</span> = cheap.</>, <><span style={{ color: P }}>Red</span> = expensive.</>], de: "Grün = günstig. Rot = teuer." },
    3: { lines: ["Pick what", <>you *want*.</>], de: "Such dir aus, was du willst." },
    4: { lines: ["Price missing?", <>{"*Add\u00a0it.*"}</>], de: "Preis fehlt oder stimmt nicht? Trag ihn ein." },
    5: { lines: [<>*Free.*</>, "In your browser."], de: "Gratis. Direkt im Browser." },
  };
  const txt = (n: React.ReactNode) =>
    typeof n === "string" ? n : React.isValidElement(n) && typeof (n.props as { children?: unknown }).children === "string" ? <Accented text={(n.props as { children: string }).children} accent={G} glow /> : n;

  // chips laid out in rows inside the card
  const rows: { file: string; w: number; x: number; y: number; i: number }[] = [];
  let cx = 0;
  let cy = 0;
  CHIPS.forEach(([file, w], i) => {
    const ww = w * CHIP_S;
    if (cx + ww > 760) {
      cx = 0;
      cy += 102 * CHIP_S + 12;
    }
    rows.push({ file, w: ww, x: cx, y: cy, i });
    cx += ww + 8;
  });
  const picked = Math.floor(rel / 14) % CHIPS.length;
  const mapZoom = 1 + 0.28 * interpolate(f, [0, S.start[3]], [0, 1], clamp);
  const mapOn = step <= 2;

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      <Backdrop />
      <VoiceOver set={SET} cues={cues} />
      {S.start.slice(1).map((t, i) => <Sfx key={i} at={t} src={i === 3 ? "maximize_006" : "switch_002"} volume={0.28} />)}
      <Sfx at={S.endAt} src="confirmation_002" volume={0.35} />

      <div style={{ position: "absolute", top: 170, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontFamily: BRAND.mono, fontSize: 28, letterSpacing: 2, opacity: 1 - endP }}>
        <span style={{ color: BRAND.green, fontWeight: 700 }}>HOW MUCH?!</span>
        <span style={{ color: BRAND.muted, fontWeight: 500 }}>howmuch.live</span>
      </div>
      <div style={{ position: "absolute", top: 240, left: 80, right: 180, opacity: 1 - endP }}>
        <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 32, letterSpacing: 5, color: BRAND.green, marginBottom: 14 }}>
          WHAT IS HOW MUCH?! · {step + 1}/{STEPS.length}
        </div>
        <div key={step} style={step === 0 ? {} : entrance("snapRight", rel, 0, fps)}>
          {head[step].lines.map((ln, i) => (
            <div key={i} style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: head[step].lines.length > 2 ? 98 : 104, lineHeight: 1.05, letterSpacing: -3, color: BRAND.text, whiteSpace: "nowrap" }}>{txt(ln)}</div>
          ))}
          <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 36, color: BRAND.muted, marginTop: 10, whiteSpace: "nowrap" }}>{head[step].de}</div>
        </div>
      </div>

      {/* the "screen": real crops of the app */}
      <div style={{ position: "absolute", top: 670, left: 80, width: 820, height: 540, borderRadius: 28, overflow: "hidden", border: `3px solid ${BRAND.border}`, background: "#FAFAFA", boxShadow: "0 30px 80px rgba(0,0,0,0.45)", opacity: 1 - endP }}>
        {mapOn && (
          <>
            <Img src={staticFile("howmuch/app-map-coffee.png")} style={{ position: "absolute", width: 820, height: 600, top: -30, left: 0, objectFit: "cover", transform: `scale(${mapZoom})`, transformOrigin: "46% 52%" }} />
            {step === 2 && (
              <div style={{ position: "absolute", left: 20, right: 20, bottom: 20, display: "flex", justifyContent: "center", ...entrance("rise", rel, 2, fps, "center") }}>
                <Img src={staticFile("howmuch/app/legend.png")} style={{ width: 780, borderRadius: 14, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }} />
              </div>
            )}
          </>
        )}
        {step === 3 && (
          <div style={{ position: "absolute", top: 38, left: 30, width: 760, height: 470 }}>
            {rows.map((c) => {
              const p = spring({ frame: rel - c.i * 2, fps, config: { damping: 12, stiffness: 240, mass: 0.5 } });
              const on = c.i === picked;
              return (
                <Img key={c.file} src={staticFile(`howmuch/app/chip-${c.file}.png`)} style={{ position: "absolute", left: c.x, top: c.y, width: c.w, height: 102 * CHIP_S, borderRadius: 12, opacity: Math.min(1, p),
                  transform: `scale(${(0.7 + 0.3 * Math.min(1, p)) * (on ? 1.1 : 1)})`, boxShadow: on ? `0 0 0 5px ${G}, 0 0 26px ${g(G, 0.7)}` : "none", zIndex: on ? 2 : 1 }} />
              );
            })}
          </div>
        )}
        {step === 4 && (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "relative", transform: `scale(${1 + 0.05 * Math.sin((rel / 30) * Math.PI * 2)})` }}>
              <Img src={staticFile("howmuch/app/add-a-price.png")} style={{ width: 600, borderRadius: 16, boxShadow: "0 18px 50px rgba(0,0,0,0.3)" }} />
              <div style={{ position: "absolute", left: 300 - 60, top: 100 - 60, width: 120, height: 120, borderRadius: 120, border: "6px solid #1C1A17", opacity: interpolate(rel % 40, [0, 30], [0.7, 0], clamp), transform: `scale(${interpolate(rel % 40, [0, 30], [0.5, 1.8], clamp)})` }} />
            </div>
          </AbsoluteFill>
        )}
        {step === 5 && (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: BRAND.card as string }}>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 190, lineHeight: 1, color: G, textShadow: `0 0 34px ${g(G, 0.5)}`, ...entrance("pop", rel, 0, fps, "center") }}>{prices}</div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 52, color: BRAND.text, marginTop: 14 }}>real prices so far</div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 34, color: BRAND.muted, marginTop: 4 }}>echte Preise bisher</div>
          </AbsoluteFill>
        )}
      </div>

      {!inEnd && <Captions set={SET} cues={cues.filter((c) => c.id !== "end")} top={1250} />}

      {f >= S.endAt - 4 && (
        <AbsoluteFill>
          <Bloom color={a(G, 0.85 * (BRAND.glow as number))} start={S.endAt} top={720} size={900} />
          <div style={{ position: "absolute", top: 470, left: 80, width: 820, textAlign: "center", ...entrance("slam", f - S.endAt, 0, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 84, lineHeight: 1.06, letterSpacing: -3, color: BRAND.text }}>
              Find the <Accented text={"*cheap\u00a0one*"} accent={G} glow />
              <br />
              near you.
            </div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 40, color: BRAND.muted, marginTop: 12 }}>Finde das Günstige in deiner Nähe.</div>
          </div>
          <div style={{ position: "absolute", top: 850, left: 80, width: 820, textAlign: "center", ...entrance("rise", f - S.endAt, 8, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 112, letterSpacing: -3, color: G, textShadow: `0 0 26px ${g(G, 0.5)}` }}>howmuch.live</div>
          </div>
          <div style={{ position: "absolute", top: 1050, left: 80, width: 820, textAlign: "center", ...entrance("rise", f - S.endAt, 14, fps, "center") }}>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 32, color: BRAND.muted }}>{ctaSub}</div>
          </div>
        </AbsoluteFill>
      )}

      <div style={{ position: "absolute", top: 1404, left: 80, right: 180, fontFamily: BRAND.mono, fontSize: 20, lineHeight: 1.35, color: BRAND.muted, opacity: 1 - endP }}>
        Real screenshots of howmuch.live · Map © OpenStreetMap contributors © CARTO
      </div>
      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(f / (S.total - 1)) * 100}%`, background: BRAND.green }} />
      <AbsoluteFill style={{ backgroundColor: BRAND.bg, opacity: loop, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

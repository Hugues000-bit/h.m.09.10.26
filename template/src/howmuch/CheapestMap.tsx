// HOW MUCH?! — "Cheapest X in every Bezirk" tile map (1080x1920, 30 fps, 9 s)
// One tile per Bezirk, laid out roughly like the real city. Tiles with data show the lowest price (no venue named,
// the answer is on howmuch.live); tiles without data show a pink "?" and ask people to add the first price.
// Built for saves (people keep a reference) and sends ("look, in the 16th it's 3,50 €").
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Easing, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, a, g, applyTheme, loadBrandFonts, Theme } from "./brand";
import { Accented, Backdrop, Bloom, Sfx, Sub, entrance } from "./PriceVideo";
import { CHEAPEST } from "./cheapest-data";

const BEAT = 15;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const CHEAPEST_FRAMES = 270;
const FILL_AT = 8;
const TOP_AT = 4 * BEAT; // 60
const HOLES_AT = 8 * BEAT; // 120
const END_AT = 13 * BEAT; // 195

// [Bezirk, column, row] — approximate geography on a 6 x 6 grid
const GRID: [number, number, number][] = [
  [19, 2, 0], [21, 4, 0],
  [17, 1, 1], [18, 2, 1], [9, 3, 1], [20, 4, 1], [22, 5, 1],
  [14, 0, 2], [16, 1, 2], [8, 2, 2], [1, 3, 2], [2, 4, 2],
  [13, 0, 3], [15, 1, 3], [7, 2, 3], [4, 3, 3], [3, 4, 3], [11, 5, 3],
  [12, 1, 4], [6, 2, 4], [5, 3, 4], [10, 4, 4],
  [23, 1, 5],
];
const SHORT: Record<number, string> = {
  1: "INNERE ST.", 2: "LEOPOLDST.", 3: "LANDSTR.", 4: "WIEDEN", 5: "MARGARET.", 6: "MARIAHILF", 7: "NEUBAU", 8: "JOSEFST.",
  9: "ALSERGR.", 10: "FAVORITEN", 11: "SIMMERING", 12: "MEIDLING", 13: "HIETZING", 14: "PENZING", 15: "FÜNFHAUS", 16: "OTTAKRING",
  17: "HERNALS", 18: "WÄHRING", 19: "DÖBLING", 20: "BRIGITTEN.", 21: "FLORIDSD.", 22: "DONAUST.", 23: "LIESING",
};
const NAME: Record<number, string> = {
  1: "Innere Stadt", 2: "Leopoldstadt", 3: "Landstraße", 4: "Wieden", 5: "Margareten", 6: "Mariahilf", 7: "Neubau", 8: "Josefstadt",
  9: "Alsergrund", 10: "Favoriten", 11: "Simmering", 12: "Meidling", 13: "Hietzing", 14: "Penzing", 15: "Rudolfsheim-Fünfhaus",
  16: "Ottakring", 17: "Hernals", 18: "Währing", 19: "Döbling", 20: "Brigittenau", 21: "Floridsdorf", 22: "Donaustadt", 23: "Liesing",
};
const TILE = 146;
const GAP = 6;
const GX = (1080 - (6 * TILE + 5 * GAP)) / 2;
const GY = 690;

export type CheapestProps = {
  theme?: Theme;
  set: keyof typeof CHEAPEST.sets;
  item: string; // "Krügerl", "cappuccino"
  itemDe: string; // "Krügerl", "Cappuccino"
  label: string; // "WIEN · KRÜGERL 0,5 L"
  challenge?: boolean; // November Krügerl challenge: "X/23 Bezirke", "Who takes <Bezirk>?", "Comment BEER"
  date?: string; // overrides CHEAPEST.date_en in the footer
};

const fmt = (v: number) => v.toFixed(2).replace(".", ",");

export const CheapestMap: React.FC<CheapestProps> = ({ theme = "dark", set, item, itemDe, label, challenge = false, date }) => {
  applyTheme(theme);
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    loadBrandFonts().then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);

  const per = CHEAPEST.sets[set] as unknown as Record<string, { min: number; n: number }>;
  const has = (nr: number) => per[String(nr)] !== undefined;
  const filled = GRID.filter(([nr]) => has(nr));
  const holes = GRID.filter(([nr]) => !has(nr));
  const best = Math.min(...filled.map(([nr]) => per[String(nr)].min));
  const bestNrs = filled.filter(([nr]) => per[String(nr)].min === best).map(([nr]) => nr);
  const bestName = bestNrs.length === 1 ? NAME[bestNrs[0]] : `${bestNrs.length} Bezirke`;
  const total = filled.reduce((s, [nr]) => s + per[String(nr)].n, 0);
  const inTop = f >= TOP_AT && f < HOLES_AT;
  const inHoles = f >= HOLES_AT && f < END_AT;
  const pulse = 0.5 + 0.5 * Math.sin(((f - HOLES_AT) / BEAT) * Math.PI);
  const endP = interpolate(f, [END_AT - 4, END_AT + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  const target = holes.find(([nr]) => nr === 11) ?? holes[0]; // "Wer holt Simmering?"
  const holeList = [...holes].sort((x, y) => x[0] - y[0]).map(([nr]) => `${nr}.`).join(" ");
  const blocks = [
    challenge
      ? { from: 0, to: TOP_AT, label: `KRÜGERL-CHALLENGE · STAND ${filled.length}/23`, lines: [`*${filled.length}/23* Bezirke`, "have a Krügerl price."], accent: BRAND.green, de: `Stand: ${filled.length}/23 Bezirke. Bis 30. November: alle 23.` }
      : { from: 0, to: TOP_AT, label, lines: [`Cheapest ${item}`, "in *every* Bezirk."], accent: BRAND.green, de: `Das billigste ${itemDe} in jedem Bezirk.` },
    { from: TOP_AT, to: HOLES_AT, label: `#1 · ${bestName.toUpperCase()}`, lines: [`*${fmt(best)} €* in`, `${bestName}.`], accent: BRAND.green, de: `Das billigste: ${fmt(best)} € in ${bestName}.` },
    holes.length === 0
      ? { from: HOLES_AT, to: END_AT, label: "23/23 · DANKE", lines: ["The map is", "*full*. Danke!"], accent: BRAND.green, de: "Alle 23 Bezirke. Danke an alle!" }
      : challenge && target
        ? { from: HOLES_AT, to: END_AT, label: `MISSING · ${holeList}`, lines: ["Who takes", `*${NAME[target[0]]}*?`], accent: BRAND.pink, de: `Wer holt ${NAME[target[0]]}? Kommentier deinen Bezirk.` }
        : { from: HOLES_AT, to: END_AT, label: `${holes.length} BEZIRKE · NO PRICE YET`, lines: ["*?* = nobody", "checked yet."], accent: BRAND.pink, de: "Noch keiner hat nachgeschaut. Du?" },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      <Backdrop />
      {filled.map(([nr], i) => (i % 2 === 0 ? <Sfx key={nr} at={FILL_AT + i * 2} src="pluck_001" volume={0.25} /> : null))}
      <Sfx at={TOP_AT} src="impactPlate_heavy_001" volume={0.4} />
      <Sfx at={HOLES_AT} src="glitch_002" volume={0.55} />
      <Sfx at={END_AT} src="confirmation_002" volume={0.55} />

      {blocks.map((b, bi) => {
        if (f < b.from - 2 || f > b.to) return null;
        const out = interpolate(f, [b.to - 6, b.to], [1, 0], clamp);
        const lf = f - b.from;
        return (
          <div key={bi} style={{ position: "absolute", top: 250, left: 80, right: 80, opacity: out }}>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 32, letterSpacing: 5, color: bi === 2 ? BRAND.pink : BRAND.green, marginBottom: 14 }}>{b.label}</div>
            {b.lines.map((ln, i) => (
              <div key={i} style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 104, lineHeight: 1.04, letterSpacing: -3, color: BRAND.text, whiteSpace: "nowrap", ...(bi === 0 ? {} : entrance(i ? "snapLeft" : "slam", lf, i * 4, fps)), fontSize: Math.min(104, Math.floor(920 / (ln.replace(/\*/g, "").length * 0.53))) }}>
                <Accented text={ln} accent={b.accent} glow />
              </div>
            ))}
            <Sub text={b.de} style={{ marginTop: 12, fontSize: 40 }} />
          </div>
        );
      })}

      {/* tile map */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: 1 - 0.96 * endP, transform: `scale(${1 - 0.05 * endP})`, transformOrigin: "50% 60%" }}>
        {GRID.map(([nr, c, r]) => {
          const d = per[String(nr)];
          const i = filled.findIndex(([n]) => n === nr);
          const p = d ? spring({ frame: f - FILL_AT - i * 2, fps, config: { damping: 13, stiffness: 220 } }) : 0;
          const isBest = d && d.min === best;
          const hiBest = inTop && isBest;
          const dim = (inTop && !isBest) || (inHoles && d) ? 0.35 : 1;
          const hole = !d;
          const holeOn = inHoles && hole;
          const border = hiBest ? BRAND.green : holeOn ? BRAND.pink : BRAND.border;
          return (
            <div key={nr} style={{
              position: "absolute", left: GX + c * (TILE + GAP), top: GY + r * (TILE + GAP), width: TILE, height: TILE,
              borderRadius: 14, border: `${hiBest || holeOn ? 4 : 2}px ${hole ? "dashed" : "solid"} ${border}`,
              background: d ? a(BRAND.green, (0.08 + 0.14 * Math.min(1, p)) * dim + (hiBest ? 0.15 : 0)) : holeOn ? a(BRAND.pink, 0.06 + 0.1 * pulse) : a(BRAND.card, 0.6),
              boxShadow: hiBest ? `0 0 30px ${g(BRAND.green, 0.6)}` : holeOn ? `0 0 ${8 + 10 * pulse}px ${g(BRAND.pink, 0.6)}` : "none",
              transform: hiBest ? `scale(${1 + 0.06 * spring({ frame: f - TOP_AT, fps, config: { damping: 9 } })})` : undefined,
              zIndex: hiBest ? 2 : 1, overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 10, left: 12, fontFamily: BRAND.mono, fontWeight: 700, fontSize: 20, color: hole ? (holeOn ? BRAND.pink : BRAND.muted) : BRAND.text, opacity: dim }}>
                {String(nr).padStart(2, "0")}
              </div>
              <div style={{ position: "absolute", top: 50, left: 0, right: 0, textAlign: "center", fontFamily: BRAND.mono, fontWeight: 700, fontSize: d ? 44 : 56, lineHeight: 1,
                color: d ? (isBest ? BRAND.green : BRAND.text) : holeOn ? BRAND.pink : BRAND.muted, opacity: d ? Math.min(1, p) * dim : 1,
                transform: d ? `scale(${0.6 + 0.4 * Math.min(1, p)})` : undefined }}>
                {d ? fmt(d.min) : "?"}
              </div>
              <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center", fontFamily: BRAND.mono, fontWeight: 500, fontSize: 15, letterSpacing: 0.5, color: BRAND.muted, opacity: dim }}>
                {SHORT[nr]}
              </div>
            </div>
          );
        })}
        <div style={{ position: "absolute", top: GY + 6 * (TILE + GAP) + 4, left: 80, right: 80, textAlign: "center", fontFamily: BRAND.mono, fontSize: 20, color: BRAND.muted }}>
          lowest price per Bezirk, € · {total} places · HOW MUCH?! · {date ?? CHEAPEST.date_en}
        </div>
      </div>

      {f >= END_AT - 4 && (
        <AbsoluteFill>
          <Bloom color={a(BRAND.green, 0.85 * (BRAND.glow as number))} start={END_AT} top={720} size={900} />
          <div style={{ position: "absolute", top: 470, width: "100%", textAlign: "center", ...entrance("slam", f - END_AT, 0, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 104, letterSpacing: -3, color: BRAND.text }}>
              <Accented text="*Save* this. 📌" accent={BRAND.green} glow />
            </div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 42, color: BRAND.muted, marginTop: 6 }}>Speichern für den nächsten {itemDe}.</div>
          </div>
          <div style={{ position: "absolute", top: 700, width: "100%", textAlign: "center", ...entrance("rise", f - END_AT, 6, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 44, color: BRAND.text }}>Which place? →</div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 92, letterSpacing: -2, color: BRAND.green, textShadow: `0 0 26px ${g(BRAND.green, 0.5)}` }}>howmuch.live</div>
          </div>
          <div style={{ position: "absolute", top: 960, width: "100%", textAlign: "center", ...entrance("rise", f - END_AT, 12, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 58, color: BRAND.text }}>
              {challenge ? <>Snap the menu. Comment <Accented text="*BEER*" accent={BRAND.yellow} glow /></> : <>Your Bezirk is a <Accented text="*?*" accent={BRAND.pink} glow /> Add one price.</>}
            </div>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 28, color: BRAND.muted, marginTop: 8 }}>{challenge ? "Foto von der Karte, fertig. Kommentier BEER → Link per DM" : "Dein Bezirk ist ein ? Trag einen Preis ein."}</div>
          </div>
        </AbsoluteFill>
      )}

      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(f / (CHEAPEST_FRAMES - 1)) * 100}%`, background: BRAND.green }} />
      <div style={{ position: "absolute", top: 160, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontFamily: BRAND.mono, fontSize: 28, letterSpacing: 2, opacity: 1 - endP }}>
        <span style={{ color: BRAND.green, fontWeight: 700 }}>HOW MUCH?!</span>
        <span style={{ color: BRAND.muted, fontWeight: 500 }}>howmuch.live</span>
      </div>
    </AbsoluteFill>
  );
};

// HOW MUCH?! — Bezirke tier list (S/A/B/C), 1080x1920, 30 fps, 11 s.
// Each Bezirk is ranked by its cheapest price for one product (lowest price found there, never an average).
// Reveal goes C → B → A → S for suspense, then the "?" row (no price yet) asks people to add theirs.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, a, g, applyTheme, loadBrandFonts, Theme } from "./brand";
import { Accented, Backdrop, Bloom, Sfx, Sub, entrance } from "./PriceVideo";
import { CHEAPEST } from "./cheapest-data";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const TIER_FRAMES = 330;
const ROW_AT = { C: 30, B: 72, A: 114, S: 160 } as const;
const HOLES_AT = 210;
const END_AT = 255;

const SHORT: Record<number, string> = {
  1: "INNERE ST.", 2: "LEOPOLDST.", 3: "LANDSTR.", 4: "WIEDEN", 5: "MARGARET.", 6: "MARIAHILF", 7: "NEUBAU", 8: "JOSEFST.",
  9: "ALSERGR.", 10: "FAVORITEN", 11: "SIMMERING", 12: "MEIDLING", 13: "HIETZING", 14: "PENZING", 15: "FÜNFHAUS", 16: "OTTAKRING",
  17: "HERNALS", 18: "WÄHRING", 19: "DÖBLING", 20: "BRIGITTEN.", 21: "FLORIDSD.", 22: "DONAUST.", 23: "LIESING",
};
const fmt = (v: number) => v.toFixed(2).replace(".", ",");

export type TierProps = {
  theme?: Theme;
  set: keyof typeof CHEAPEST.sets;
  item: string; // "espresso"
  itemDe: string; // "Espresso"
  label: string; // "WIEN · ESPRESSO"
  cut: [number, number, number]; // max price for S, A, B (C = above)
  ctaSub: string;
};

export const TierList: React.FC<TierProps> = ({ theme = "dark", set, item, itemDe, label, cut, ctaSub }) => {
  applyTheme(theme);
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    loadBrandFonts().then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);

  const per = CHEAPEST.sets[set] as unknown as Record<string, { min: number; n: number }>;
  const rows: Record<"S" | "A" | "B" | "C", [number, number][]> = { S: [], A: [], B: [], C: [] };
  Object.entries(per).forEach(([nr, d]) => {
    const t = d.min <= cut[0] ? "S" : d.min <= cut[1] ? "A" : d.min <= cut[2] ? "B" : "C";
    rows[t].push([Number(nr), d.min]);
  });
  (Object.keys(rows) as (keyof typeof rows)[]).forEach((k) => rows[k].sort((x, y) => x[1] - y[1]));
  const holes = 23 - Object.keys(per).length;
  const places = Object.values(per).reduce((s, d) => s + d.n, 0);
  const TIER_COLOR = { S: BRAND.green, A: "#5BC8F5", B: BRAND.yellow, C: BRAND.pink } as Record<string, string>;
  const endP = interpolate(f, [END_AT - 4, END_AT + 8], [0, 1], clamp);
  const loop = interpolate(f, [TIER_FRAMES - 9, TIER_FRAMES - 1], [0, 1], clamp);
  const sBest = rows.S[0];

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      <Backdrop />
      {(["C", "B", "A"] as const).map((k) => <Sfx key={k} at={ROW_AT[k]} src="pluck_002" volume={0.4} />)}
      <Sfx at={ROW_AT.S} src="impactPlate_heavy_001" volume={0.5} />
      <Sfx at={HOLES_AT} src="glitch_002" volume={0.5} />
      <Sfx at={END_AT} src="confirmation_002" volume={0.55} />

      <div style={{ position: "absolute", top: 240, left: 80, right: 180, opacity: 1 - endP }}>
        <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 32, letterSpacing: 5, color: BRAND.green, marginBottom: 14 }}>{label} · TIER LIST</div>
        {[`Every Bezirk,`, `ranked by its`, `cheapest *${item}*.`].map((ln, i) => (
          <div key={i} style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: Math.min(92, Math.floor(820 / (ln.replace(/\*/g, "").length * 0.52))), lineHeight: 1.04, letterSpacing: -3, color: BRAND.text, whiteSpace: "nowrap" }}>
            <Accented text={ln} accent={BRAND.green} glow />
          </div>
        ))}
        <Sub text={`Jeder Bezirk, nach seinem billigsten ${itemDe}.`} style={{ marginTop: 10, fontSize: 36 }} />
      </div>

      {/* tier rows */}
      <div style={{ position: "absolute", top: 700, left: 80, width: 820, opacity: 1 - endP }}>
        {(["S", "A", "B", "C"] as const).map((k) => {
          const on = f >= ROW_AT[k];
          return (
            <div key={k} style={{ display: "flex", gap: 14, height: 132, marginBottom: 12, alignItems: "stretch" }}>
              <div style={{ width: 112, borderRadius: 16, background: a(TIER_COLOR[k], on ? 0.95 : 0.25), display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: BRAND.heading, fontWeight: 700, fontSize: 80, color: BRAND.bg, boxShadow: on && k === "S" ? `0 0 40px ${g(TIER_COLOR[k], 0.6)}` : "none" }}>{k}</div>
              <div style={{ flex: 1, borderRadius: 16, background: a(BRAND.card, 0.6), border: `2px solid ${BRAND.border}`, display: "flex", gap: 8, padding: 8, alignItems: "center" }}>
                {on && rows[k].length === 0 && <div style={{ fontFamily: BRAND.mono, fontSize: 24, color: BRAND.muted, paddingLeft: 12 }}>—</div>}
                {rows[k].map(([nr, v], i) => {
                  const p = on ? spring({ frame: f - ROW_AT[k] - i * 3, fps, config: { damping: 11, stiffness: 240 } }) : 0;
                  const best = k === "S" && i === 0;
                  return (
                    <div key={nr} style={{ width: 128, height: 112, borderRadius: 12, background: best ? a(BRAND.green, 0.18) : a(BRAND.bg, 0.6), border: `2px solid ${best ? BRAND.green : BRAND.border}`,
                      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", opacity: Math.min(1, p), transform: `scale(${0.6 + 0.4 * Math.min(1, p)})` }}>
                      <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 16, color: BRAND.muted, letterSpacing: 0.5, whiteSpace: "nowrap" }}>{SHORT[nr]}</div>
                      <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 34, color: best ? BRAND.green : BRAND.text, marginTop: 6 }}>{fmt(v)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {/* the "?" row */}
        <div style={{ display: "flex", gap: 14, height: 112, alignItems: "stretch", opacity: f >= HOLES_AT ? 1 : 0.35 }}>
          <div style={{ width: 112, borderRadius: 16, border: `3px dashed ${BRAND.pink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BRAND.heading, fontWeight: 700, fontSize: 70, color: BRAND.pink }}>?</div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 10 }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 46, color: BRAND.text }}><Accented text={`*${holes}* Bezirke: no price yet.`} accent={BRAND.pink} /></div>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 24, color: BRAND.muted, marginTop: 4 }}>{holes} Bezirke ohne Preis. Deiner dabei?</div>
          </div>
        </div>
      </div>
      {f >= ROW_AT.S && f < END_AT && sBest && <Bloom color={a(BRAND.green, 0.5 * (BRAND.glow as number))} start={ROW_AT.S} top={780} size={700} />}

      {f >= END_AT - 4 && (
        <AbsoluteFill>
          <Bloom color={a(BRAND.green, 0.85 * (BRAND.glow as number))} start={END_AT} top={720} size={900} />
          <div style={{ position: "absolute", top: 500, left: 80, width: 820, textAlign: "center", ...entrance("slam", f - END_AT, 0, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 72, letterSpacing: -3, color: BRAND.text }}>Your Bezirk in <Accented text="*C*" accent={BRAND.pink} glow />?</div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 40, color: BRAND.muted, marginTop: 8 }}>Dein Bezirk zu Unrecht in C? Beweis es.</div>
          </div>
          <div style={{ position: "absolute", top: 740, left: 80, width: 820, textAlign: "center", ...entrance("rise", f - END_AT, 6, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 96, letterSpacing: -2, color: BRAND.green, textShadow: `0 0 26px ${g(BRAND.green, 0.5)}` }}>howmuch.live</div>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 30, color: BRAND.muted, marginTop: 10 }}>Add a cheaper one · Trag einen billigeren ein</div>
          </div>
          <div style={{ position: "absolute", top: 980, left: 80, width: 820, textAlign: "center", ...entrance("rise", f - END_AT, 12, fps, "center") }}>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 32, color: BRAND.muted }}>{ctaSub}</div>
          </div>
        </AbsoluteFill>
      )}

      <div style={{ position: "absolute", top: 1440, left: 80, right: 180, fontFamily: BRAND.mono, fontSize: 20, color: BRAND.muted, opacity: 1 - endP }}>
        Lowest {item} price found per Bezirk · {places} places · {CHEAPEST.date_en} · HOW MUCH?!
      </div>
      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(f / (TIER_FRAMES - 1)) * 100}%`, background: BRAND.green }} />
      <div style={{ position: "absolute", top: 170, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontFamily: BRAND.mono, fontSize: 28, letterSpacing: 2, opacity: 1 - endP }}>
        <span style={{ color: BRAND.green, fontWeight: 700 }}>HOW MUCH?!</span>
        <span style={{ color: BRAND.muted, fontWeight: 500 }}>howmuch.live</span>
      </div>
      <AbsoluteFill style={{ backgroundColor: BRAND.bg, opacity: loop, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

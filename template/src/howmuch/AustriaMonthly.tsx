// HOW MUCH?! — "Austria" monthly Reel (1080x1920, 30 fps, 120 BPM grid).
// Frame 0 = Austria with every city lit + hook. Then the camera flies into Vienna, then into each other city
// with >= ZOOM_MIN new prices this month, then a short "also new" beat for smaller cities, then back to Austria.
// The last 9 frames fade back to frame 0 (perfect loop). Data: austria-data.ts (scripts/austria_data.py).
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Easing, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, a, g, applyTheme, loadBrandFonts, Theme } from "./brand";
import { Accented, Backdrop, Sfx, Sub, entrance } from "./PriceVideo";
import { AUSTRIA } from "./austria-data";

const BEAT = 15;
const LOOP = 9;
const ZOOM_MIN = 10; // a city gets its own zoom only with >= 10 new prices this month
const MAX_ZOOMS = 4; // Vienna + 3
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// map viewport (safe band: x 80–900, y 220–1420)
const CX = 490;
const CY = 1060;

type City = { key: string; name: string; nameDe: string; x: number; y: number; total: number; newPrices: number; newPlaces: number; pts: number[][] };
const D = AUSTRIA as unknown as { month_en: string; month_de: string; next_en: string; next_de: string; demo: boolean; W: number; H: number; outline: string; vienna: string; cities: City[] };
const cities = D.cities;
const wien = cities.find((c) => c.key === "wien");
const zooms = [...(wien ? [wien] : []), ...cities.filter((c) => c.key !== "wien" && c.newPrices >= ZOOM_MIN)].slice(0, MAX_ZOOMS);
const minors = cities.filter((c) => !zooms.includes(c) && c.newPrices > 0);
const multi = zooms.length > 1;

type View = { x: number; y: number; s: number };
const AT: View = { x: D.W / 2, y: D.H / 2, s: 1 };
const cityView = (c: City): View => {
  // frame the central 90 % of places, so a few outliers (airport, suburbs) don't shrink the city
  const q = (v: number[], p: number) => { const o = [...v].sort((m, n) => m - n); return o[Math.min(o.length - 1, Math.floor(p * (o.length - 1)))]; };
  const xs = c.pts.map((p) => p[0]);
  const ys = c.pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [q(xs, 0.05), q(xs, 0.95), q(ys, 0.05), q(ys, 0.95)];
  const spread = Math.max(x1 - x0, (y1 - y0) * 1.3, 1.5);
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, s: Math.min(80, Math.max(6, 600 / spread)) };
};

// timeline
const T = (() => {
  let t = 0;
  const s: { k: string; from: number; to: number; city?: City }[] = [];
  const add = (k: string, beats: number, city?: City) => { s.push({ k, from: t, to: t + beats * BEAT, city }); t += beats * BEAT; };
  add("hook", 5); // 1 s + 0,3 s per English word (pace rule of 5 Nov)
  zooms.forEach((c) => add("city", 6, c));
  if (minors.length) add("minor", 4);
  add("end", 7);
  return { s, total: t };
})();
export const AUSTRIA_FRAMES = T.total;
const seg = (k: string) => T.s.find((x) => x.k === k);

// camera keyframes [frame, view]
const KEYS: [number, View][] = (() => {
  const k: [number, View][] = [[0, AT]];
  let prev = AT;
  T.s.forEach((sg) => {
    if (sg.k === "city" && sg.city) {
      const v = cityView(sg.city);
      if (prev !== AT) { k.push([sg.from, prev]); k.push([sg.from + 14, AT]); k.push([sg.from + 34, v]); }
      else { k.push([sg.from, AT]); k.push([sg.from + 24, v]); }
      prev = v;
    } else if (prev !== AT) { k.push([sg.from, prev]); k.push([sg.from + 20, AT]); prev = AT; }
  });
  return k;
})();
const camera = (f: number): View => {
  let i = 0;
  while (i < KEYS.length - 1 && KEYS[i + 1][0] <= f) i++;
  if (i === KEYS.length - 1) return KEYS[i][1];
  const [f0, v0] = KEYS[i];
  const [f1, v1] = KEYS[i + 1];
  if (v0 === v1) return v0;
  const t = Easing.inOut(Easing.cubic)(interpolate(f, [f0, f1], [0, 1], clamp));
  const s = Math.exp(Math.log(v0.s) + (Math.log(v1.s) - Math.log(v0.s)) * t);
  // keep the motion steady on screen while zooming
  const u = Math.abs(Math.log(v1.s / v0.s)) > 0.1 ? (1 / v0.s - 1 / s) / (1 / v0.s - 1 / v1.s) : t;
  return { x: v0.x + (v1.x - v0.x) * u, y: v0.y + (v1.y - v0.y) * u, s };
};

const Block: React.FC<{ from: number; to: number; label: string; lines: string[]; de?: string; accent: string; size?: number; still?: boolean; fadeIn?: number }> = ({ from, to, label, lines, de, accent, size = 112, still, fadeIn }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < from - 2 || f > to) return null;
  const out = interpolate(f, [to - 7, to], [1, 0], clamp);
  const lf = f - from;
  const kinds = ["slam", "snapLeft", "rise"] as const;
  return (
    <div style={{ position: "absolute", top: 300, left: 80, right: 180, opacity: fadeIn !== undefined ? interpolate(f, [fadeIn, to - 1], [0, 1], clamp) : out }}>
      <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 32, letterSpacing: 6, color: accent, marginBottom: 18, whiteSpace: "nowrap" }}>{label}</div>
      {lines.map((ln, i) => (
        <div key={i} style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: Math.min(size, Math.floor(820 / (ln.replace(/\*/g, "").length * 0.53))), lineHeight: 1.04, letterSpacing: -3, color: BRAND.text, whiteSpace: "nowrap", ...(still ? {} : entrance(kinds[i % 3], lf, i * 5, fps)) }}>
          <Accented text={ln} accent={accent} glow />
        </div>
      ))}
      <Sub text={de} style={{ marginTop: 16, fontSize: 42, opacity: still ? 1 : interpolate(lf, [12, 20], [0, 1], clamp) }} />
    </div>
  );
};

export const AustriaMonthly: React.FC<{ theme?: Theme }> = ({ theme = "dark" }) => {
  applyTheme(theme);
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    loadBrandFonts().then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);

  const cam = camera(f);
  const sx = (x: number) => CX + (x - cam.x) * cam.s;
  const sy = (y: number) => CY + (y - cam.y) * cam.s;
  const zoomed = interpolate(cam.s, [2.5, 6], [0, 1], clamp); // 0 = country view, 1 = city view
  const end = seg("end")!;
  const minor = seg("minor");
  const mon = D.month_en.toUpperCase();
  const hookLines = multi ? ["Not just *Vienna*", "anymore."] : ["What changed", "on the *map*?"];
  const hookDe = multi ? "Nicht mehr nur Wien." : "Was hat sich getan?";
  const maxTotal = Math.max(1, ...cities.map((c) => c.total));

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      <Backdrop />
      {T.s.filter((x) => x.k !== "hook").map((x, i) => <Sfx key={i} at={x.from} src={x.k === "end" ? "confirmation_002" : "maximize_006"} volume={0.45} />)}
      {T.s.filter((x) => x.k === "city").map((x, i) => <Sfx key={"p" + i} at={x.from + (i ? 34 : 24)} src="pluck_001" volume={0.35} />)}

      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.12" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.88" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="band"><rect x={0} y={680} width={1080} height={760} fill="url(#fade)" /></mask>
        </defs>
        <g mask="url(#band)">
          <g transform={`translate(${CX - cam.x * cam.s},${CY - cam.y * cam.s}) scale(${cam.s})`}>
            <path d={D.outline} fill={a(BRAND.green, 0.05)} stroke={BRAND.muted} strokeWidth={2.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
            <path d={D.vienna} fill="none" stroke={a(BRAND.muted as string, 0.45 * zoomed)} strokeWidth={1.3} vectorEffect="non-scaling-stroke" />
          </g>
          {/* places, visible when zoomed in */}
          {zoomed > 0 && cities.map((c) => {
            const sg = T.s.find((x) => x.city === c);
            const popAt = sg ? sg.from + (sg === T.s.find((x) => x.k === "city") ? 24 : 34) : -1e9;
            return c.pts.map((p, i) => {
              const X = sx(p[0]);
              const Y = sy(p[1]);
              if (X < -20 || X > 1100 || Y < 640 || Y > 1480) return null;
              const isNew = p[2] === 1;
              const pop = isNew ? spring({ frame: Math.max(-1, Math.min(60, f - popAt - (i % 24))), fps, config: { damping: 10, stiffness: 200, mass: 0.5 } }) : 1;
              const r = Math.min(11, Math.max(4, cam.s / 5));
              return (
                <circle key={c.key + i} cx={X} cy={Y} r={r * (isNew ? 0.3 + 0.9 * pop : 1)}
                  fill={isNew && pop > 0.05 ? BRAND.green : a(BRAND.muted as string, 0.55)}
                  opacity={zoomed}
                  style={isNew && pop > 0.05 ? { filter: `drop-shadow(0 0 6px ${g(BRAND.green, 0.8)})` } : undefined} />
              );
            });
          })}
          {/* city markers, visible from the country view */}
          {cities.map((c) => {
            const X = sx(c.x);
            const Y = sy(c.y);
            const big = zooms.includes(c);
            const minorOn = minor && f >= minor.from && f < minor.to && minors.includes(c);
            const pulse = minorOn ? 0.5 + 0.5 * Math.sin(((f - minor!.from) / BEAT) * Math.PI) : 0;
            const r = 7 + 17 * Math.sqrt(c.total / maxTotal);
            const col = big || minorOn ? BRAND.green : BRAND.muted;
            return (
              <g key={c.key} opacity={1 - zoomed}>
                <circle cx={X} cy={Y} r={r + 10 * pulse} fill={a(col as string, 0.25)} />
                <circle cx={X} cy={Y} r={Math.max(5, r * 0.45)} fill={col} style={{ filter: `drop-shadow(0 0 10px ${g(col as string, 0.8)})` }} />
                <text x={X} y={Y - r - 12} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={big ? 30 : 22} fill={col}>{c.nameDe.toUpperCase()}</text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* hook (frame 0 is complete, and it fades back in at the end for the loop) */}
      <Block from={0} to={seg("hook")!.to} label={`ÖSTERREICH · ${mon}`} lines={hookLines} de={hookDe} accent={BRAND.green} still />
      <Block from={T.total - 5} to={T.total} fadeIn={T.total - 6} label={`ÖSTERREICH · ${mon}`} lines={hookLines} de={hookDe} accent={BRAND.green} still />

      {T.s.filter((x) => x.k === "city").map((x) => {
        const c = x.city!;
        const fresh = c.total === c.newPlaces; // every place on the map was added this month
        return (
          <Block key={c.key} from={x.from + 6} to={x.to} accent={BRAND.green} size={120}
            label={`${fresh ? "NEW · " : ""}${c.nameDe.toUpperCase()} · ${mon}`}
            lines={[`*+${c.newPrices}* prices.`, `*+${c.newPlaces}* places.`]}
            de={`+${c.newPrices} Preise · +${c.newPlaces} Lokale · ${c.total} auf der Karte`} />
        );
      })}
      {minor && (
        <Block from={minor.from + 4} to={minor.to} accent={BRAND.green} size={96} label="ALSO NEW · AUCH NEU"
          lines={[minors.slice(0, 3).map((c) => c.nameDe).join(" · ")]}
          de={minors.slice(0, 3).map((c) => `${c.nameDe} +${c.newPrices}`).join(" · ")} />
      )}

      {f >= end.from - 2 && f < T.total - LOOP + 9 && (() => {
        const lf = f - end.from;
        const out = interpolate(f, [T.total - LOOP, T.total - LOOP + 4], [1, 0], clamp);
        return (
          <AbsoluteFill style={{ opacity: out }}>
            <div style={{ position: "absolute", top: 300, left: 80, right: 180 }}>
              <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 32, letterSpacing: 6, color: BRAND.yellow, marginBottom: 18 }}>YOUR CITY · DEINE STADT</div>
              <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 108, lineHeight: 1.04, letterSpacing: -3, color: BRAND.text, whiteSpace: "nowrap", ...entrance("slam", lf, 0, fps) }}>
                <Accented text="Is yours *next*?" accent={BRAND.yellow} glow />
              </div>
              <Sub text="Ist deine Stadt die nächste?" style={{ marginTop: 16, fontSize: 42, opacity: interpolate(lf, [10, 18], [0, 1], clamp) }} />
              <div style={{ marginTop: 30, fontFamily: BRAND.heading, fontWeight: 700, fontSize: 84, letterSpacing: -2, color: BRAND.green, textShadow: `0 0 26px ${g(BRAND.green, 0.5)}`, ...entrance("rise", lf, 8, fps) }}>howmuch.live</div>
            </div>
            <div style={{ position: "absolute", top: 1290, left: 80, right: 180, ...entrance("rise", lf, 14, fps) }}>
              <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 36, letterSpacing: 2, color: BRAND.text }}>Add one price · Ein Preis reicht.</div>
              <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 30, letterSpacing: 2, color: BRAND.yellow, marginTop: 14 }}>NEXT UPDATE · {D.next_en.toUpperCase()}</div>
              <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 26, color: BRAND.muted, marginTop: 6 }}>Nächstes Update: {D.next_de}</div>
            </div>
          </AbsoluteFill>
        );
      })()}

      <div style={{ position: "absolute", top: 1440, left: 80, right: 80, textAlign: "center", fontFamily: BRAND.mono, fontWeight: 500, fontSize: 22, color: BRAND.muted, opacity: interpolate(f, [end.from, end.from + 10, T.total - LOOP, T.total], [0, 0.9, 0.9, 0], clamp) }}>
        Prices dated {D.month_en} · HOW MUCH?! community · Map: Natural Earth, data.wien.gv.at (CC BY 4.0)
      </div>
      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(f / (AUSTRIA_FRAMES - 1)) * 100}%`, background: BRAND.green }} />
      <div style={{ position: "absolute", top: 190, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontFamily: BRAND.mono, fontSize: 28, letterSpacing: 2 }}>
        <span style={{ color: BRAND.green, fontWeight: 700 }}>HOW MUCH?!</span>
        <span style={{ color: BRAND.muted, fontWeight: 500 }}>MONTHLY · ÖSTERREICH</span>
      </div>
      {D.demo && (
        <div style={{ position: "absolute", top: 900, left: -100, width: 1280, textAlign: "center", transform: "rotate(-18deg)", fontFamily: BRAND.mono, fontWeight: 700, fontSize: 90, color: a(BRAND.pink as string, 0.55), letterSpacing: 8 }}>
          DEMO · FAKE DATA
        </div>
      )}
    </AbsoluteFill>
  );
};

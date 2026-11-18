// HOW MUCH?! — two motion-design map infographics, all in German, 1080x1920, 30 fps (length follows the voice).
//  LeereKarte  — "Die leere Karte": where the prices are, and the Bezirke that still have none.
//  InnenAussen — inner districts (1.–9.) vs outer districts (10.–23.): lowest and highest price on each side.
// Numbers: data/maps/<date>.json via scripts/bezirk_data.py (aggregates only: counts, lowest and highest price,
// count under a price). No average, no venue named. District outlines: data.wien.gv.at (CC BY 4.0).
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Easing, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, a, g, applyTheme, loadBrandFonts, Theme } from "./brand";
import { Backdrop, Bloom, Glitch, Sfx } from "./PriceVideo";
import { Cue, VoiceOver, voiceFrames } from "./Voice";
import { Kinetic } from "./MotionIntro";
import { BEZIRKE, DOTS } from "./places-data";
import { DOT_BEZ, MAPDATA } from "./bezirk-data";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.inOut(Easing.cubic);
type Cam = { x: number; y: number; s: number };
const FOCUS: [number, number] = [540, 1010];
const FULL: Cam = { x: 499, y: 393, s: 0.92 };
const COUNT: Record<number, number> = Object.fromEntries(Object.entries(MAPDATA.bezirke).map(([k, v]) => [Number(k), v as number]));
const NAME: Record<number, string> = Object.fromEntries(BEZIRKE.map((b) => [b.nr, b.name]));
const CENTER: Record<number, [number, number]> = Object.fromEntries(BEZIRKE.map((b) => [b.nr, [b.cx, b.cy] as [number, number]]));
const eur = (v: number) => `${v.toFixed(2).replace(".", ",")} €`;

// ---------- schedule: one scene per voice line, then the end card ----------
const schedule = (set: string, ids: string[], min: number[]) => {
  const start: number[] = [];
  let t = 0;
  ids.forEach((id, i) => {
    start.push(t);
    t += Math.max(min[i], voiceFrames(set, id) + 22);
  });
  return { start, endAt: t, total: t + Math.max(105, voiceFrames(set, "end") + 70) };
};
const K_SET = "leere-karte";
const K_IDS = ["k1", "k2", "k3", "k4", "k5", "k6"];
const K_MIN = [84, 110, 104, 175, 130, 104];
export const leereSchedule = () => schedule(K_SET, K_IDS, K_MIN);
const A_SET = "innen-aussen";
const A_IDS = ["a1", "a2", "a3", "a4", "a5", "a6", "a7"];
const A_MIN = [84, 196, 126, 108, 126, 196, 132];
export const innenSchedule = () => schedule(A_SET, A_IDS, A_MIN);

// ---------- the district map ----------
type DStyle = { fill: string; tint?: string; stroke?: string; sw?: number; draw?: number; dash?: number };
type Label = { x: number; y: number; text: string; col: string; size: number; weight?: number; op?: number };
const DistrictMap: React.FC<{
  cam: Cam;
  style: (nr: number) => DStyle;
  union?: { nrs: number[]; col: string; w: number; tint: string; op: number }; // one glowing outline around a group of districts
  dot?: (i: number, bez: number) => { k: number; col: string } | null;
  labels?: Label[];
  opacity?: number;
}> = ({ cam, style, union, dot, labels = [], opacity = 1 }) => {
  const s = cam.s;
  const r = (3.2 + 1.1 * s) / s;
  const inU = (nr: number) => !!union && union.nrs.includes(nr);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, opacity }}>
      <g transform={`translate(${FOCUS[0]},${FOCUS[1]}) scale(${s}) translate(${-cam.x},${-cam.y})`}>
        {BEZIRKE.map((b) => {
          const st = style(b.nr);
          return <path key={`f${b.nr}`} d={b.d} fill={st.fill} stroke="none" />;
        })}
        {BEZIRKE.map((b) => {
          const st = style(b.nr);
          return st.tint ? <path key={`h${b.nr}`} d={b.d} fill={st.tint} stroke="none" /> : null;
        })}
        {union && union.op > 0 && (
          <g opacity={union.op}>
            {/* thick stroke under, opaque fill over: only the outer edge of the group stays visible */}
            {BEZIRKE.filter((b) => inU(b.nr)).map((b) => (
              <path key={`u${b.nr}`} d={b.d} fill="none" stroke={union.col} strokeWidth={(2 * union.w) / s} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 ${12 / s}px ${g(union.col, 0.8)})` }} />
            ))}
            {BEZIRKE.filter((b) => inU(b.nr)).map((b) => (
              <path key={`c${b.nr}`} d={b.d} fill={BRAND.card as string} stroke={BRAND.card as string} strokeWidth={1 / s} />
            ))}
            {BEZIRKE.filter((b) => inU(b.nr)).map((b) => (
              <path key={`t${b.nr}`} d={b.d} fill={union.tint} stroke="none" />
            ))}
          </g>
        )}
        {BEZIRKE.map((b) => {
          const st = style(b.nr);
          if (!st.stroke) return null;
          return (
            <path key={`s${b.nr}`} d={b.d} fill="none" stroke={st.stroke} strokeWidth={(st.sw ?? 2) / s} strokeLinejoin="round" pathLength={1}
              strokeDasharray={st.dash ? `${st.dash} ${st.dash}` : 1} strokeDashoffset={st.dash ? 0 : 1 - (st.draw ?? 1)} />
          );
        })}
        {dot &&
          DOTS.map((d, i) => {
            const o = dot(i, DOT_BEZ[i]);
            if (!o || o.k <= 0) return null;
            return <circle key={i} cx={d[0]} cy={d[1]} r={r * Math.min(o.k, 1.8)} fill={a(o.col, 0.9)} stroke={BRAND.bg as string} strokeWidth={1 / s} />;
          })}
        {labels.map((l, i) => (
          <text key={i} x={l.x} y={l.y} textAnchor="middle" dominantBaseline="central" fontFamily={BRAND.heading as string} fontWeight={l.weight ?? 700} fontSize={l.size / s}
            fill={l.col} stroke={BRAND.bg as string} strokeWidth={(l.size * 0.22) / s} paintOrder="stroke" strokeLinejoin="round" opacity={l.op ?? 1}>
            {l.text}
          </text>
        ))}
      </g>
    </svg>
  );
};

// camera keyframes: one target per scene, eased over the first frames of each scene
const camAt = (f: number, starts: number[], cams: Cam[], dur = 26): Cam => {
  let cur = cams[0];
  for (let i = 1; i < starts.length; i++) {
    const p = interpolate(f, [starts[i], starts[i] + dur], [0, 1], { ...clamp, easing: ease });
    if (p <= 0) break;
    const nx = cams[i];
    cur = { x: cur.x + (nx.x - cur.x) * p, y: cur.y + (nx.y - cur.y) * p, s: cur.s + (nx.s - cur.s) * p };
  }
  return cur;
};

// ---------- shared frame: header, footer, progress, end card, fonts ----------
const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    loadBrandFonts().then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
const Chrome: React.FC<{ f: number; total: number; inEnd: boolean; left: string; footer: string }> = ({ f, total, inEnd, left, footer }) => (
  <>
    <div style={{ position: "absolute", top: 170, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontFamily: BRAND.mono, fontSize: 28, letterSpacing: 2, opacity: inEnd ? 0 : 1 }}>
      <span style={{ color: BRAND.green, fontWeight: 700 }}>{left}</span>
      <span style={{ color: BRAND.muted, fontWeight: 500 }}>howmuch.live</span>
    </div>
    <div style={{ position: "absolute", top: 1404, left: 80, right: 180, fontFamily: BRAND.mono, fontSize: 20, lineHeight: 1.35, color: BRAND.muted, opacity: inEnd ? 0 : 1 }}>{footer}</div>
    <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(f / (total - 1)) * 100}%`, background: BRAND.green }} />
    <AbsoluteFill style={{ backgroundColor: BRAND.bg, opacity: interpolate(f, [total - 9, total - 1], [0, 1], clamp), pointerEvents: "none" }} />
  </>
);
const EndCard: React.FC<{ f: number; endAt: number; line: string; sub: string; seed: string }> = ({ f, endAt, line, sub, seed }) => {
  const { fps } = useVideoConfig();
  const G = BRAND.green as string;
  const endRel = f - endAt;
  const logo = spring({ frame: endRel - 4, fps, config: { damping: 9, stiffness: 160, mass: 0.8 } });
  if (f < endAt - 1) return null;
  return (
    <AbsoluteFill style={{ clipPath: `circle(${interpolate(f, [endAt, endAt + 12], [0, 1], { ...clamp, easing: ease }) * 130}% at 50% 55%)`, backgroundColor: BRAND.bg }}>
      <Backdrop />
      <Bloom color={a(G, 0.85 * (BRAND.glow as number))} start={endAt} top={700} size={1000} />
      <div style={{ position: "absolute", top: 560, left: 0, width: 1080, textAlign: "center", transform: `scale(${0.6 + 0.4 * Math.min(1.1, logo)})`, opacity: Math.min(1, logo * 1.5) }}>
        <Glitch text="HOW MUCH?!" active={endRel >= 4 && endRel < 14} seed={seed} style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 136, letterSpacing: -5, color: G, textShadow: `0 0 40px ${g(G, 0.6)}` }} />
      </div>
      <div style={{ position: "absolute", top: 800, left: 80, width: 840, textAlign: "center", opacity: interpolate(endRel, [14, 24], [0, 1], clamp), transform: `translateY(${interpolate(endRel, [14, 24], [30, 0], clamp)}px)` }}>
        <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 58, color: BRAND.text, letterSpacing: -1.5 }}>{line}</div>
      </div>
      <div style={{ position: "absolute", top: 960, left: 80, width: 840, textAlign: "center", opacity: interpolate(endRel, [22, 32], [0, 1], clamp) }}>
        <span style={{ display: "inline-block", border: `4px solid ${G}`, borderRadius: 24, padding: "14px 40px", fontFamily: BRAND.heading, fontWeight: 700, fontSize: 84, color: G, letterSpacing: -2 }}>howmuch.live</span>
        <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 30, color: BRAND.muted, marginTop: 22 }}>{sub}</div>
      </div>
    </AbsoluteFill>
  );
};

// keeps the headline and the footer readable when the camera zooms in
const Shade: React.FC = () => (
  <>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 700, background: `linear-gradient(${BRAND.bg} 0%, ${a(BRAND.bg as string, 0.92)} 80%, ${a(BRAND.bg as string, 0)} 100%)` }} />
    <div style={{ position: "absolute", top: 1370, left: 0, right: 0, bottom: 0, background: `linear-gradient(${a(BRAND.bg as string, 0)} 0%, ${a(BRAND.bg as string, 0.92)} 30%, ${BRAND.bg} 100%)` }} />
  </>
);

// headline of the current scene; the previous one fades out under it
const Headlines: React.FC<{ f: number; S: { start: number[]; endAt: number }; set: string; ids: string[]; lines: [string, number][]; top?: number }> = ({ f, S, set, ids, lines, top = 280 }) => {
  const idx = Math.max(0, S.start.filter((t) => f >= t).length - 1);
  if (f >= S.endAt) return null;
  const one = (i: number, op: number) => (
    <div key={i} style={{ position: "absolute", inset: 0, opacity: op }}>
      <Kinetic text={lines[i][0]} rel={f - S.start[i] - 6} frames={voiceFrames(set, ids[i]) || 60} size={lines[i][1]} accent={BRAND.green as string} top={top} />
    </div>
  );
  return (
    <>
      {idx > 0 && f < S.start[idx] + 8 && one(idx - 1, interpolate(f, [S.start[idx], S.start[idx] + 8], [1, 0], clamp))}
      {one(idx, 1)}
    </>
  );
};

const Chip: React.FC<{ text: string; col: string; top: number; op: number; size?: number; solid?: boolean }> = ({ text, col, top, op, size = 40, solid }) => (
  <div style={{ position: "absolute", top, left: 0, width: 1080, display: "flex", justifyContent: "center", opacity: op, transform: `translateY(${(1 - op) * 30}px)` }}>
    <span style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: size, color: solid ? (BRAND.bg as string) : col, background: solid ? col : a(BRAND.bg as string, 0.85), border: `3px solid ${col}`,
      borderRadius: 999, padding: "10px 30px", whiteSpace: "nowrap", boxShadow: `0 0 26px ${g(col, 0.35)}` }}>{text}</span>
  </div>
);

// =====================================================================================
// 1) Die leere Karte
// =====================================================================================
export type LeereProps = { theme?: Theme };
export const LeereKarte: React.FC<LeereProps> = ({ theme = "dark" }) => {
  applyTheme(theme);
  useFonts();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const S = leereSchedule();
  const G = BRAND.green as string;
  const P = BRAND.pink as string;
  const Y = BRAND.yellow as string;
  const idx = Math.max(0, S.start.filter((t) => f >= t).length - 1);
  const rel = f - S.start[idx];
  const at = (i: number) => f - S.start[i]; // frames since scene i started (negative before)
  const inEnd = f >= S.endAt;
  const cues: Cue[] = [...K_IDS.map((id, i) => ({ id, at: S.start[i] + 6 })), { id: "end", at: S.endAt + 16 }];
  const EMPTY = Object.entries(COUNT).filter(([, v]) => v === 0).map(([k]) => Number(k));
  const FEW = Object.entries(COUNT).filter(([, v]) => v <= 2).map(([k]) => Number(k));
  const total = MAPDATA.total as number;
  const first = COUNT[1];
  const [fx, fy] = CENTER[10];
  const cams: Cam[] = [FULL, FULL, { x: 470, y: 445, s: 1.9 }, FULL, { x: fx - 10, y: fy - 70, s: 1.45 }, FULL];
  const cam = camAt(f, S.start, cams);

  // heat by number of places (k3 onwards): a count, not an average
  const heat = interpolate(at(2), [8, 34], [0, 1], clamp);
  const style = (nr: number): DStyle => {
    const c = COUNT[nr] ?? 0;
    const draw = interpolate(at(0), [2 + (nr - 1) * 1.6, 22 + (nr - 1) * 1.6], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    const fill = a(BRAND.card as string, 0.95 * Math.min(1, draw * 1.5));
    let tint: string | undefined = c > 0 && heat > 0 ? a(G, (0.04 + 0.7 * Math.pow(c / first, 0.6)) * heat) : undefined;
    let stroke: string | undefined = a(BRAND.muted as string, 0.55);
    let sw = 2;
    let dash: number | undefined;
    if (idx === 2 && nr === 1) { stroke = G; sw = 5; }
    if (idx === 3 && c === 0) {
      const k = EMPTY.indexOf(nr);
      const on = at(3) > 30 + k * 16;
      if (on) { stroke = P; sw = 5; dash = 0.012; tint = a(P, 0.16 + 0.1 * Math.sin((f / 30) * Math.PI * 2)); }
    }
    if (idx === 4 && nr === 10) { stroke = Y; sw = 6; tint = a(Y, 0.22 + 0.08 * Math.sin((f / 30) * Math.PI * 2)); }
    if (idx === 5 && FEW.includes(nr)) { stroke = P; sw = 4; tint = a(P, 0.16 + 0.12 * Math.sin((f / 22) * Math.PI * 2)); }
    return { fill, tint, stroke, sw, draw, dash };
  };
  const dotOn = (i: number) => 4 + (i / (DOTS.length - 1)) * 44;
  const dot = (i: number, bez: number) => {
    if (at(1) < dotOn(i)) return null;
    const pop = 1 + 1.1 * Math.max(0, 1 - (at(1) - dotOn(i)) / 8);
    const dim = idx >= 3 && !(idx === 4 && bez === 10) ? 0.55 : 1;
    const col = idx === 4 && bez === 10 ? Y : G;
    return { k: pop * dim, col };
  };

  const labels: Label[] = [];
  // Bezirk numbers while the outlines draw
  if (idx <= 1) BEZIRKE.forEach((b) => labels.push({ x: b.cx, y: b.cy, text: String(b.nr), col: a(BRAND.muted as string, 0.7), size: 26, op: interpolate(at(0), [20 + b.nr, 34 + b.nr], [0, 1], clamp) * (idx === 1 ? interpolate(rel, [0, 20], [1, 0.25], clamp) : 1) }));
  if (idx === 2) {
    const p = spring({ frame: at(2) - 30, fps, config: { damping: 10, stiffness: 200 } });
    labels.push({ x: CENTER[1][0], y: CENTER[1][1] - 6, text: String(first), col: BRAND.text as string, size: 26 + 50 * Math.min(1, p), op: Math.min(1, p * 2) });
    labels.push({ x: CENTER[1][0], y: CENTER[1][1] + 34, text: "Lokale", col: G, size: 26, op: Math.min(1, p * 2) });
    [7, 16, 6].forEach((nr, k) => {
      const q = interpolate(at(2), [44 + k * 6, 54 + k * 6], [0, 1], clamp);
      labels.push({ x: CENTER[nr][0], y: CENTER[nr][1], text: String(COUNT[nr]), col: BRAND.text as string, size: 30, op: q });
    });
  }
  if (idx === 3) {
    EMPTY.forEach((nr, k) => {
      const q = interpolate(at(3), [30 + k * 16, 40 + k * 16], [0, 1], clamp);
      labels.push({ x: CENTER[nr][0], y: CENTER[nr][1] - 16, text: NAME[nr], col: BRAND.text as string, size: 30, op: q });
      labels.push({ x: CENTER[nr][0], y: CENTER[nr][1] + 20, text: "0", col: P, size: 38, op: q });
    });
  }
  if (idx === 4) {
    const q = interpolate(at(4), [10, 22], [0, 1], clamp);
    labels.push({ x: fx, y: fy - 24, text: "Favoriten", col: BRAND.text as string, size: 40, op: q });
    labels.push({ x: fx, y: fy + 26, text: `${COUNT[10]} Lokal`, col: Y, size: 44, op: interpolate(at(4), [52, 62], [0, 1], clamp) });
  }
  if (idx === 5) FEW.forEach((nr) => labels.push({ x: CENTER[nr][0], y: CENTER[nr][1], text: "+", col: P, size: 54, op: interpolate(at(5), [16, 26], [0, 1], clamp) }));

  const H: [string, number][] = [
    [`Wien hat|*23* Bezirke.`, 112],
    [`*${total}* Lokale|mit echten|Preisen.`, 110],
    [`Fast *ein Drittel*|davon: im|*1. Bezirk*.`, 100],
    [`Und hier?|~Kein einziger~|~Preis.~`, 104],
    [`^Favoriten^:|200.000+ Menschen.|*${COUNT[10]}* Lokal.`, 88],
    [`Wohnst du *dort*?|Trag den|*ersten Preis* ein.`, 92],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      <Backdrop />
      <VoiceOver set={K_SET} cues={cues} />
      <Sfx at={S.start[0] + 4} src="maximize_006" volume={0.2} />
      <Sfx at={S.start[1] + 4} src="powerUp2" volume={0.2} />
      <Sfx at={S.start[2] + 30} src="pluck_001" volume={0.28} />
      {EMPTY.map((_, k) => <Sfx key={k} at={S.start[3] + 30 + k * 16} src="tick_002" volume={0.24} />)}
      <Sfx at={S.start[4] + 52} src="impactPlate_heavy_001" volume={0.26} />
      <Sfx at={S.start[5] + 16} src="switch_002" volume={0.26} />
      <Sfx at={S.endAt + 4} src="glitch_002" volume={0.28} />
      <Sfx at={S.endAt + 12} src="confirmation_002" volume={0.3} />

      {!inEnd && <DistrictMap cam={cam} style={style} dot={dot} labels={labels} />}
      {!inEnd && <Shade />}
      {!inEnd && <Headlines f={f} S={S} set={K_SET} ids={K_IDS} lines={H} />}
      {!inEnd && idx === 5 && <Chip text="+ Preis eintragen · howmuch.live" col={G} top={596} op={interpolate(at(5), [30, 42], [0, 1], clamp)} solid />}

      <EndCard f={f} endAt={S.endAt} line="Dein Bezirk fehlt noch?" sub="Gratis · direkt im Browser" seed="lk" />
      <Chrome f={f} total={S.total} inEnd={inEnd} left="HOW MUCH?! · WIEN" footer={`Lokale mit mindestens einem Preis auf howmuch.live · Stand ${MAPDATA.date} · Einwohner Favoriten: Statistik Austria · Bezirksgrenzen: data.wien.gv.at`} />
    </AbsoluteFill>
  );
};

// =====================================================================================
// 2) Innen vs. Außen
// =====================================================================================
const INNER = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const RangeChart: React.FC<{ rel: number; item: { label: string; in: readonly number[]; out: readonly number[] }; max: number; step: number }> = ({ rel, item, max, step }) => {
  const { fps } = useVideoConfig();
  const G = BRAND.green as string;
  const Y = BRAND.yellow as string;
  const P = BRAND.pink as string;
  const X0 = 110;
  const X1 = 850;
  const x = (v: number) => X0 + ((X1 - X0) * v) / max;
  const rows = [
    { name: "INNEN", sub: "1.–9. Bezirk", v: item.in, col: G, top: 720, d: 6 },
    { name: "AUSSEN", sub: "10.–23. Bezirk", v: item.out, col: Y, top: 930, d: 18 },
  ];
  const ticks = Array.from({ length: Math.floor(max / step) + 1 }, (_, k) => k * step);
  const extremes = interpolate(rel, [62, 72], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {rows.map((r, k) => {
        const inP = spring({ frame: rel - r.d, fps, config: { damping: 12, stiffness: 200 } });
        const grow = interpolate(rel, [r.d + 8, r.d + 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        const lo = r.v[0];
        const hi = lo + (r.v[1] - lo) * grow;
        const isIn = k === 0;
        return (
          <div key={k} style={{ position: "absolute", left: 0, top: r.top, width: 1080, opacity: Math.min(1, inP * 1.5), transform: `translateY(${(1 - Math.min(1, inP)) * 40}px)` }}>
            <div style={{ position: "absolute", left: 80, top: 0, display: "flex", alignItems: "baseline", gap: 16, whiteSpace: "nowrap" }}>
              <span style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 34, letterSpacing: 4, color: r.col }}>{r.name}</span>
              <span style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 28, color: BRAND.muted }}>{r.sub} · {r.v[2]} Lokale</span>
            </div>
            <div style={{ position: "absolute", left: X0, top: 104, width: X1 - X0, height: 10, borderRadius: 10, background: a(BRAND.muted as string, 0.2) }} />
            <div style={{ position: "absolute", left: x(lo), top: 96, width: x(hi) - x(lo), height: 26, borderRadius: 26, background: `linear-gradient(90deg, ${a(r.col, 0.55)}, ${r.col})`, boxShadow: `0 0 24px ${g(r.col, 0.45)}` }} />
            {[lo, r.v[1]].map((v, e) => {
              const show = e === 0 ? 1 : grow >= 0.98 ? 1 : 0;
              const ring = isIn && extremes > 0;
              const ringCol = e === 0 ? G : P;
              return (
                <React.Fragment key={e}>
                  <div style={{ position: "absolute", left: (e === 0 ? x(lo) : x(hi)) - 21, top: 88, width: 42, height: 42, borderRadius: 42, background: BRAND.bg as string, border: `7px solid ${r.col}`, boxSizing: "border-box", opacity: e === 0 ? 1 : Math.min(1, grow * 3) }} />
                  {ring && (
                    <div style={{ position: "absolute", left: x(v) - 36, top: 73, width: 72, height: 72, borderRadius: 72, border: `4px solid ${ringCol}`, boxSizing: "border-box", opacity: extremes * (0.6 + 0.4 * Math.sin((rel / 10) * Math.PI)), boxShadow: `0 0 20px ${g(ringCol, 0.6)}` }} />
                  )}
                  <div style={{ position: "absolute", left: x(v) - 110, width: 220, top: 146, textAlign: "center", fontFamily: BRAND.mono, fontWeight: 700, fontSize: 38, color: isIn && extremes > 0 ? ringCol : (BRAND.text as string), opacity: show * Math.min(1, inP), fontVariantNumeric: "tabular-nums" }}>
                    {eur(v)}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, top: 1150, width: 1080, opacity: interpolate(rel, [10, 22], [0, 1], clamp) }}>
        <div style={{ position: "absolute", left: X0, width: X1 - X0, top: 0, height: 2, background: a(BRAND.muted as string, 0.5) }} />
        {ticks.map((t) => (
          <div key={t} style={{ position: "absolute", left: x(t) - 50, width: 100, top: 12, textAlign: "center", fontFamily: BRAND.mono, fontSize: 24, color: BRAND.muted }}>{t} €</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 80, width: 840, top: 1236, display: "flex", gap: 34, fontFamily: BRAND.heading, fontWeight: 700, fontSize: 30, opacity: extremes }}>
        <span style={{ color: G }}>● billigster</span>
        <span style={{ color: P }}>● teuerster</span>
        <span style={{ color: BRAND.muted, fontWeight: 500 }}>je Seite</span>
      </div>
    </div>
  );
};

const DoenerCount: React.FC<{ rel: number }> = ({ rel }) => {
  const { fps } = useVideoConfig();
  const G = BRAND.green as string;
  const Y = BRAND.yellow as string;
  const D = MAPDATA.doener;
  const rows = [
    { name: "INNEN", v: D.in, col: G, top: 700, d: 8, min: D.minIn },
    { name: "AUSSEN", v: D.out, col: Y, top: 960, d: 40, min: D.minOut },
  ];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {rows.map((r, k) => {
        const inP = spring({ frame: rel - r.d, fps, config: { damping: 12, stiffness: 200 } });
        const [hit, n] = r.v as unknown as [number, number];
        const lit = Math.floor(interpolate(rel, [r.d + 14, r.d + 34], [0, hit], clamp));
        return (
          <div key={k} style={{ position: "absolute", left: 80, top: r.top, width: 840, opacity: Math.min(1, inP * 1.5), transform: `translateY(${(1 - Math.min(1, inP)) * 40}px)` }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 34, letterSpacing: 4, color: r.col }}>{r.name}</span>
              <span style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 96, color: hit > 0 ? r.col : (BRAND.text as string), textShadow: hit > 0 ? `0 0 30px ${g(r.col, 0.5)}` : "none", fontVariantNumeric: "tabular-nums" }}>
                {lit}<span style={{ fontSize: 50, color: BRAND.muted }}> / {n}</span>
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {Array.from({ length: n }, (_, i) => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: 36, background: i < lit ? r.col : "transparent", border: `3px solid ${i < lit ? r.col : a(BRAND.muted as string, 0.5)}`, boxSizing: "border-box", boxShadow: i < lit ? `0 0 14px ${g(r.col, 0.5)}` : "none" }} />
              ))}
            </div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 28, color: BRAND.muted, marginTop: 12 }}>billigster Döner hier: {eur(r.min)}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 80, top: 1240, fontFamily: BRAND.heading, fontWeight: 700, fontSize: 32, color: BRAND.muted, opacity: interpolate(rel, [20, 30], [0, 1], clamp) }}>
        Döner unter {MAPDATA.doener.lim} € · Lokale mit Döner-Preis
      </div>
    </div>
  );
};

export type InnenProps = { theme?: Theme };
export const InnenAussen: React.FC<InnenProps> = ({ theme = "dark" }) => {
  applyTheme(theme);
  useFonts();
  const f = useCurrentFrame();
  const S = innenSchedule();
  const G = BRAND.green as string;
  const Y = BRAND.yellow as string;
  const idx = Math.max(0, S.start.filter((t) => f >= t).length - 1);
  const rel = f - S.start[idx];
  const at = (i: number) => f - S.start[i];
  const inEnd = f >= S.endAt;
  const cues: Cue[] = [...A_IDS.map((id, i) => ({ id, at: S.start[i] + 6 })), { id: "end", at: S.endAt + 16 }];
  const cmp = MAPDATA.compare;
  const chart = idx >= 2 && idx <= 5;
  const cams: Cam[] = [FULL, FULL, FULL, FULL, FULL, FULL, FULL];
  const cam = camAt(f, S.start, cams);
  const mapOp = chart ? interpolate(f, [S.start[2], S.start[2] + 14], [1, 0.16], clamp) : idx === 6 ? interpolate(at(6), [0, 14], [0.16, 1], clamp) : 1;

  const style = (nr: number): DStyle => {
    const isIn = INNER.includes(nr);
    const draw = interpolate(at(0), [2 + (nr - 1) * 1.4, 20 + (nr - 1) * 1.4], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    const pulse = idx === 6 && !isIn ? 0.12 + 0.1 * Math.sin((f / 22) * Math.PI * 2) : 0.08;
    return { fill: isIn ? a(BRAND.card as string, 0.95) : a(Y, pulse * Math.min(1, draw * 1.5)), stroke: a(isIn ? G : Y, isIn ? 0.25 : 0.45), sw: idx === 6 && !isIn ? 3.5 : 2, draw };
  };
  const unionOp = interpolate(at(0), [24, 40], [0, 1], clamp);
  const dotOn = (i: number, bez: number) => (bez >= 1 && bez <= 9 ? 6 + (i / DOTS.length) * 30 : 70 + (i / DOTS.length) * 30);
  const dot = (i: number, bez: number) => {
    if (at(1) < dotOn(i, bez)) return null;
    const pop = 1 + 1.1 * Math.max(0, 1 - (at(1) - dotOn(i, bez)) / 8);
    return { k: pop, col: bez >= 1 && bez <= 9 ? G : Y };
  };
  const labels: Label[] = [];
  if (idx <= 1) {
    const q = interpolate(at(0), [36, 48], [0, 1], clamp);
    labels.push({ x: 470, y: 470, text: "INNEN", col: G, size: 40, op: q * (idx === 1 ? interpolate(rel, [80, 96], [1, 0], clamp) : 1) });
    labels.push({ x: 230, y: 610, text: "AUSSEN", col: Y, size: 40, op: q * (idx === 1 ? interpolate(rel, [80, 96], [1, 0], clamp) : 1) });
    labels.push({ x: 800, y: 300, text: "AUSSEN", col: Y, size: 40, op: q * (idx === 1 ? interpolate(rel, [80, 96], [1, 0], clamp) : 1) });
  }
  if (idx === 1) {
    labels.push({ x: 470, y: 470, text: String(MAPDATA.inner), col: G, size: 64, op: interpolate(rel, [96, 106], [0, 1], clamp) });
    labels.push({ x: 230, y: 610, text: String(MAPDATA.outer), col: Y, size: 64, op: interpolate(rel, [120, 130], [0, 1], clamp) });
  }
  if (idx === 6) [12, 13, 14, 18, 23].forEach((nr) => labels.push({ x: CENTER[nr][0], y: CENTER[nr][1], text: "?", col: Y, size: 58, op: interpolate(at(6), [18, 28], [0, 1], clamp) }));

  const H: [string, number][] = [
    [`Ist Wien|^außen^ billiger|als *innen*?`, 112],
    [`*Innen*: *${MAPDATA.inner}* Lokale.|^Außen^: ^${MAPDATA.outer}^.`, 92],
    [`*Espresso*:|beide Extreme|liegen *innen*.`, 100],
    [`*Cappuccino*:|genauso.`, 108],
    [`*Schnitzel*:|innen die größten|Unterschiede.`, 96],
    [`Nur beim ^Döner^|dreht es sich.`, 104],
    [`Außen fehlen|noch viele ^Preise^.`, 104],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      <Backdrop />
      <VoiceOver set={A_SET} cues={cues} />
      <Sfx at={S.start[0] + 4} src="maximize_006" volume={0.2} />
      <Sfx at={S.start[1] + 6} src="powerUp2" volume={0.2} />
      {[2, 3, 4].map((i) => <Sfx key={i} at={S.start[i] + 14} src="switch_002" volume={0.24} />)}
      {[2, 3, 4].map((i) => <Sfx key={`p${i}`} at={S.start[i] + 62} src="pluck_001" volume={0.24} />)}
      <Sfx at={S.start[5] + 54} src="impactPlate_heavy_001" volume={0.26} />
      <Sfx at={S.start[6] + 18} src="tick_002" volume={0.24} />
      <Sfx at={S.endAt + 4} src="glitch_002" volume={0.28} />
      <Sfx at={S.endAt + 12} src="confirmation_002" volume={0.3} />

      {!inEnd && <DistrictMap cam={cam} style={style} dot={dot} labels={labels} opacity={mapOp} union={{ nrs: INNER, col: G, w: 5, tint: a(G, 0.13), op: unionOp }} />}
      {!inEnd && <Shade />}
      {!inEnd && <Headlines f={f} S={S} set={A_SET} ids={A_IDS} lines={H} />}
      {!inEnd && idx === 2 && <RangeChart rel={rel} item={cmp[0]} max={5} step={1} />}
      {!inEnd && idx === 3 && <RangeChart rel={rel} item={cmp[1]} max={8} step={2} />}
      {!inEnd && idx === 4 && <RangeChart rel={rel} item={cmp[2]} max={40} step={10} />}
      {!inEnd && idx === 5 && <DoenerCount rel={rel} />}
      {!inEnd && idx === 6 && <Chip text="Trag deine Preise ein · howmuch.live" col={Y} top={560} op={interpolate(at(6), [34, 46], [0, 1], clamp)} solid />}

      <EndCard f={f} endAt={S.endAt} line="Und wo wohnst du?" sub="Gratis · direkt im Browser" seed="ia" />
      <Chrome f={f} total={S.total} inEnd={inEnd} left="HOW MUCH?! · WIEN" footer={`Niedrigster und höchster Preis je Seite · letzter Preis pro Lokal · innen = 1.–9. Bezirk · Schnitzel mit Salat, Döner im Brot · Stand ${MAPDATA.date}`} />
    </AbsoluteFill>
  );
};

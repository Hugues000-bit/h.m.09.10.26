// HOW MUCH?! — full-screen Vienna map with a camera (used by MapDive and MapFill).
// Map space = places-data.ts projection (1000 units wide). cam = map point shown at the focus point, s = px per unit.
import React from "react";
import { BRAND, a, g } from "./brand";
import { BEZIRKE, DOTS } from "./places-data";

export type Cam = { x: number; y: number; s: number };
export const FOCUS: [number, number] = [540, 900];
export const toScreen = (cam: Cam, x: number, y: number, focus = FOCUS): [number, number] => [focus[0] + (x - cam.x) * cam.s, focus[1] + (y - cam.y) * cam.s];

export const ViennaMap: React.FC<{
  cam: Cam;
  focus?: [number, number];
  active?: number; // Bezirk to highlight
  dot?: (i: number) => number; // 0..1+ scale of dot i (default 1)
  dotColor?: string;
  trail?: [number, number][]; // map points joined by a dashed line
  trailLen?: number; // 0..1 of the last trail segment drawn
  numbers?: boolean;
}> = ({ cam, focus = FOCUS, active, dot, dotColor, trail, trailLen = 1, numbers = true }) => {
  const s = cam.s;
  const r = (4 + 1.15 * s) / s;
  const col = dotColor ?? (BRAND.cyan as string);
  const trailD =
    trail && trail.length > 1
      ? trail
          .map((p, i) => {
            if (i < trail.length - 1 || trailLen >= 1) return `${i ? "L" : "M"}${p[0]},${p[1]}`;
            const q = trail[i - 1];
            return `L${q[0] + (p[0] - q[0]) * trailLen},${q[1] + (p[1] - q[1]) * trailLen}`;
          })
          .join("")
      : null;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${focus[0]},${focus[1]}) scale(${s}) translate(${-cam.x},${-cam.y})`}>
        {BEZIRKE.map((b) => (
          <path key={b.nr} d={b.d} fill={b.nr === active ? a(BRAND.green as string, 0.1) : a(BRAND.card as string, 0.9)} stroke={BRAND.border as string} strokeWidth={2.2 / s} strokeLinejoin="round" />
        ))}
        {BEZIRKE.filter((b) => b.nr === active).map((b) => (
          <path key={b.nr} d={b.d} fill="none" stroke={BRAND.green as string} strokeWidth={5 / s} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 ${10 / s}px ${g(BRAND.green as string, 0.7)})` }} />
        ))}
        {numbers &&
          BEZIRKE.map((b) => (
            <text key={b.nr} x={b.cx} y={b.cy} textAnchor="middle" dominantBaseline="central" fontFamily={BRAND.mono as string} fontWeight={700} fontSize={(16 + 5 * s) / s} fill={a(BRAND.muted as string, b.nr === active ? 0.5 : 0.28)}>
              {b.nr}
            </text>
          ))}
        {trailD && <path d={trailD} fill="none" stroke={BRAND.yellow as string} strokeWidth={4 / s} strokeDasharray={`${12 / s} ${9 / s}`} strokeLinecap="round" opacity={0.9} />}
        {DOTS.map((d, i) => {
          const k = dot ? dot(i) : 1;
          if (k <= 0) return null;
          return <circle key={i} cx={d[0]} cy={d[1]} r={r * Math.min(k, 1.6)} fill={a(col, 0.85)} stroke={BRAND.bg as string} strokeWidth={1.2 / s} />;
        })}
      </g>
    </svg>
  );
};

// Top and bottom fades so text stays readable over the map.
export const MapShade: React.FC<{ top?: number; bottom?: number }> = ({ top = 700, bottom = 820 }) => (
  <>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: top, background: `linear-gradient(${BRAND.bg} 0%, ${a(BRAND.bg as string, 0.94)} 55%, ${a(BRAND.bg as string, 0)} 100%)` }} />
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: bottom, background: `linear-gradient(${a(BRAND.bg as string, 0)} 0%, ${a(BRAND.bg as string, 0.9)} 45%, ${BRAND.bg} 100%)` }} />
  </>
);

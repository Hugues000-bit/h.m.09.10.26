// HOW MUCH?! — "map dive": the camera flies over Vienna from the priciest price to the cheapest, 1080x1920, 30 fps, ~26 s.
// The price counter drops at every stop; the last stop is only an area with a "?" (the cheapest place is never pinpointed or named).
// Same engine for "one street, all prices": pass the street's places as waypoints, in walking order.
// Length follows the voice lines (scripts/voice.py); without a voice set it runs on fixed timings.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Easing, continueRender, delayRender, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, a, g, euro, applyTheme, loadBrandFonts, Theme } from "./brand";
import { Accented, Bloom, Sfx, Sub, entrance } from "./PriceVideo";
import { Captions, Cue, VoiceOver, voiceFrames } from "./Voice";
import { Cam, FOCUS, MapShade, ViennaMap, toScreen } from "./ViennaMap";
import { BEZIRKE, project } from "./places-data";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FLY = 36;
const CLOSE = 6.2;
const WIDE: Cam = { x: 440, y: 430, s: 1.9 };

export type Waypoint = { lat: number; lng: number; price: number; bezirk: number };
export type DiveProps = {
  theme?: Theme;
  label: string; // "WIEN · CAPPUCCINO"
  hook: string[];
  hookDe: string;
  waypoints: Waypoint[]; // priciest first, cheapest last
  hideLast?: boolean; // default true: last stop = "?" area
  end: string[]; // ["Where *exactly*?", "It's on the map."]
  endDe: string;
  voice?: string;
  footer: string;
};

export const diveSchedule = (n: number, voice?: string) => {
  const vf = (id: string) => (voice ? voiceFrames(voice, id) : 0);
  const first = Math.max(75, vf("intro") + 18); // arrival at stop 1
  const arrive: number[] = [first];
  const hold: number[] = [];
  for (let i = 1; i <= n; i++) {
    hold.push(Math.max(i === n ? 72 : 54, vf(`w${i}`) + (i === n ? 22 : 14)));
    if (i < n) arrive.push(arrive[i - 1] + hold[i - 1] + FLY);
  }
  const endAt = arrive[n - 1] + hold[n - 1];
  return { arrive, hold, endAt, total: endAt + Math.max(100, vf("end") + 52) };
};

export const MapDive: React.FC<DiveProps> = ({ theme = "dark", label, hook, hookDe, waypoints, hideLast = true, end, endDe, voice, footer }) => {
  applyTheme(theme);
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    loadBrandFonts().then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);

  const n = waypoints.length;
  const S = diveSchedule(n, voice);
  const pts = waypoints.map((w) => project(w.lat, w.lng));
  // the last stop is shown as an area: the camera stops a little off the real spot
  const target = pts.map((p, i) => (hideLast && i === n - 1 ? ([p[0] + 9, p[1] - 6] as [number, number]) : p));

  // which leg are we on? leg i = flight from stop i-1 (or the wide view) to stop i
  let leg = 0;
  while (leg < n - 1 && f >= S.arrive[leg] + S.hold[leg]) leg++;
  const depart = leg === 0 ? S.arrive[0] - 42 : S.arrive[leg - 1] + S.hold[leg - 1];
  const p = interpolate(f, [depart, S.arrive[leg]], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const from: Cam = leg === 0 ? { ...WIDE, s: WIDE.s * (1 + 0.06 * interpolate(f, [0, depart], [0, 1], clamp)) } : { x: target[leg - 1][0], y: target[leg - 1][1], s: CLOSE * 1.05 };
  const to = target[leg];
  const dist = Math.hypot(to[0] - from.x, to[1] - from.y);
  const out = leg === 0 ? 1 : Math.min(3, Math.max(1.2, (dist * CLOSE) / 430));
  const push = 1 + 0.05 * interpolate(f, [S.arrive[leg], S.arrive[leg] + S.hold[leg]], [0, 1], clamp);
  const cam: Cam = {
    x: from.x + (to[0] - from.x) * p,
    y: from.y + (to[1] - from.y) * p,
    s: Math.exp(Math.log(from.s) + (Math.log(CLOSE) - Math.log(from.s)) * p - Math.log(out) * Math.sin(Math.PI * p)) * push,
  };
  const arrived = f >= S.arrive[leg];
  const stop = arrived ? leg : leg - 1; // last stop reached (-1 during the intro)
  const inEnd = f >= S.endAt;
  const endP = interpolate(f, [S.endAt - 2, S.endAt + 10], [0, 1], clamp);
  const loop = interpolate(f, [S.total - 9, S.total - 1], [0, 1], clamp);

  // counter rolls to the next price during the flight
  const shown = leg === 0 ? waypoints[0].price : waypoints[leg - 1].price + (waypoints[leg].price - waypoints[leg - 1].price) * interpolate(p, [0.15, 0.95], [0, 1], clamp);
  const rank = leg === 0 ? 0 : leg - 1 + p;
  const priceCol = interpolateColors(rank, [0, (n - 1) / 2, n - 1], [BRAND.pink as string, BRAND.yellow as string, BRAND.green as string]);
  const bez = stop >= 0 ? BEZIRKE.find((b) => b.nr === waypoints[stop].bezirk) : undefined;
  const introOut = interpolate(f, [S.arrive[0] - 14, S.arrive[0] - 4], [1, 0], clamp);
  const counterIn = interpolate(f, [S.arrive[0] - 6, S.arrive[0] + 4], [0, 1], clamp);

  const cues: Cue[] = voice
    ? [{ id: "intro", at: 4 }, ...waypoints.map((_, i) => ({ id: `w${i + 1}`, at: S.arrive[i] + 2 })), { id: "end", at: S.endAt + 6 }]
    : [];
  const sfxVol = voice ? 0.26 : 0.5;

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      {voice && <VoiceOver set={voice} cues={cues} />}
      {S.arrive.map((t, i) => (
        <React.Fragment key={i}>
          <Sfx at={t - FLY + 2} src="maximize_006" volume={sfxVol * 0.8} />
          <Sfx at={t} src={i === n - 1 ? "impactPlate_heavy_001" : "pluck_002"} volume={sfxVol} />
        </React.Fragment>
      ))}
      <Sfx at={S.endAt} src="confirmation_002" volume={voice ? 0.35 : 0.55} />

      <ViennaMap cam={cam} active={arrived ? waypoints[leg].bezirk : undefined} trail={pts.slice(0, Math.max(1, leg + 1)).map((q, i) => (i === leg ? target[i] : q))} trailLen={leg === 0 ? 1 : p} dotColor={BRAND.cyan as string} />

      {/* price tags of the stops reached so far */}
      {waypoints.map((w, i) => {
        if (i > stop) return null;
        const last = hideLast && i === n - 1;
        const [sx, sy] = toScreen(cam, target[i][0], target[i][1]);
        if (sx < -200 || sx > 1280 || sy < 300 || sy > 1500) return null;
        const pop = spring({ frame: f - S.arrive[i], fps, config: { damping: 10, stiffness: 220, mass: 0.6 } });
        const col = interpolateColors(i, [0, (n - 1) / 2, n - 1], [BRAND.pink as string, BRAND.yellow as string, BRAND.green as string]);
        const cur = i === stop;
        const pulse = 1 + 0.12 * Math.sin(((f - S.arrive[i]) / 30) * Math.PI * 2);
        const R = last ? 150 : 30;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: sx - R, top: sy - R, width: R * 2, height: R * 2, borderRadius: R * 2, border: `${last ? 6 : 5}px ${last ? "dashed" : "solid"} ${col}`, background: a(col, last ? 0.16 : 0.25),
              transform: `scale(${Math.min(1, pop) * (cur ? pulse : 0.7)})`, boxShadow: `0 0 ${last ? 70 : 30}px ${g(col, 0.6)}`, display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: BRAND.heading, fontWeight: 700, fontSize: 150, color: col }}>
              {last ? "?" : ""}
            </div>
            <div style={{ position: "absolute", left: sx - 150, top: sy - R - (cur ? 104 : 70), width: 300, display: "flex", justifyContent: "center", transform: `scale(${Math.min(1, pop) * (cur ? 1 : 0.62)})`, transformOrigin: "center bottom", opacity: cur ? 1 : 0.85 }}>
              <div style={{ background: col, color: BRAND.bg as string, borderRadius: 16, padding: "6px 20px", fontFamily: BRAND.mono, fontWeight: 700, fontSize: 52, whiteSpace: "nowrap", boxShadow: "0 10px 30px rgba(0,0,0,0.45)" }}>{euro(w.price)}</div>
            </div>
          </React.Fragment>
        );
      })}

      <MapShade />

      {/* header */}
      <div style={{ position: "absolute", top: 170, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontFamily: BRAND.mono, fontSize: 28, letterSpacing: 2, opacity: 1 - endP }}>
        <span style={{ color: BRAND.green, fontWeight: 700 }}>HOW MUCH?!</span>
        <span style={{ color: BRAND.muted, fontWeight: 500 }}>howmuch.live</span>
      </div>
      <div style={{ position: "absolute", top: 240, left: 80, right: 180, opacity: 1 - endP }}>
        <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 32, letterSpacing: 5, color: BRAND.green, marginBottom: 12 }}>{label}</div>
        {/* hook (frame 0) */}
        <div style={{ opacity: introOut, position: "absolute", top: 54, left: 0, right: 0 }}>
          {hook.map((ln, i) => (
            <div key={i} style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: Math.min(104, Math.floor(820 / (ln.replace(/\*/g, "").length * 0.52))), lineHeight: 1.04, letterSpacing: -3, color: BRAND.text, whiteSpace: "nowrap" }}>
              <Accented text={ln} accent={BRAND.pink as string} glow />
            </div>
          ))}
          <Sub text={hookDe} style={{ marginTop: 10, fontSize: 38 }} />
        </div>
        {/* counter */}
        <div style={{ opacity: counterIn }}>
          <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 196, lineHeight: 1.02, letterSpacing: -6, color: priceCol, textShadow: `0 0 36px ${g(priceCol, 0.45)}`, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{euro(shown)}</div>
          <div style={{ marginTop: 4 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {waypoints.map((_, i) => (
                <div key={i} style={{ width: 64, height: 10, borderRadius: 10, background: i <= stop ? interpolateColors(i, [0, (n - 1) / 2, n - 1], [BRAND.pink as string, BRAND.yellow as string, BRAND.green as string]) : (BRAND.border as string) }} />
              ))}
            </div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 46, letterSpacing: -1, color: BRAND.text, whiteSpace: "nowrap" }}>
              {bez ? `${bez.nr}. Bezirk · ${bez.name}` : ""}
            </div>
          </div>
        </div>
      </div>

      {voice && !inEnd && <Captions set={voice} cues={cues.filter((c) => c.id !== "end")} top={1250} />}

      {/* end card */}
      {f >= S.endAt - 2 && (
        <AbsoluteFill>
          <AbsoluteFill style={{ backgroundColor: a(BRAND.bg as string, 0.9), opacity: endP }} />
          <Bloom color={a(BRAND.green as string, 0.85 * (BRAND.glow as number))} start={S.endAt} top={720} size={900} />
          <div style={{ position: "absolute", top: 470, left: 80, width: 820, textAlign: "center", ...entrance("slam", f - S.endAt, 0, fps, "center") }}>
            {end.map((ln, i) => (
              <div key={i} style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 92, lineHeight: 1.06, letterSpacing: -3, color: BRAND.text }}>
                <Accented text={ln} accent={BRAND.green as string} glow />
              </div>
            ))}
            <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 40, color: BRAND.muted, marginTop: 12 }}>{endDe}</div>
          </div>
          <div style={{ position: "absolute", top: 830, left: 80, width: 820, textAlign: "center", ...entrance("rise", f - S.endAt, 8, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 112, letterSpacing: -3, color: BRAND.green, textShadow: `0 0 26px ${g(BRAND.green as string, 0.5)}` }}>howmuch.live</div>
          </div>
        </AbsoluteFill>
      )}

      <div style={{ position: "absolute", top: 1404, left: 80, right: 180, fontFamily: BRAND.mono, fontSize: 20, lineHeight: 1.35, color: BRAND.muted }}>{footer}</div>
      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(f / (S.total - 1)) * 100}%`, background: BRAND.green }} />
      <AbsoluteFill style={{ backgroundColor: BRAND.bg, opacity: loop, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

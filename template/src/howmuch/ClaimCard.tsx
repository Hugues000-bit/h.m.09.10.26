// HOW MUCH?! — "claim your listing" Reel for owners (1080x1920, 30 fps, 10 s)
// Generic card (no real business named). Props let you switch bar/café so TikTok stays alcohol-free.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, a, g, applyTheme, loadBrandFonts, Theme } from "./brand";
import { Accented, Backdrop, Bloom, Sfx, Sub, entrance, typed } from "./PriceVideo";
import { DISTRICTS } from "./gapmap-data";

const BEAT = 15;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const CLAIM_FRAMES = 300;
const CARD_AT = 4 * BEAT; // 60
const CLAIM_AT = 10 * BEAT; // 150
const END_AT = 15 * BEAT; // 225

export type ClaimProps = {
  theme?: Theme;
  venue: { en: string; de: string }; // "bar" / "Lokal", "café" / "Café"
  item: string; // "Krügerl 0,5 l"
  price: string; // "4,90 €"
  bezirk: string; // "Neubau · 1070"
};

const Block: React.FC<{ from: number; to: number; label: string; lines: string[]; accent: string; de?: string; size?: number }> = ({ from, to, label, lines, accent, de, size = 116 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < from - 2 || f > to) return null;
  const out = interpolate(f, [to - 7, to], [1, 0], clamp);
  const lf = f - from;
  const kinds = ["slam", "snapLeft", "rise"] as const;
  return (
    <div style={{ position: "absolute", top: 300, left: 80, right: 80, opacity: out }}>
      <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 32, letterSpacing: 6, color: BRAND.green, marginBottom: 18 }}>{typed(label, lf, 0, 12)}</div>
      {lines.map((ln, i) => (
        <div key={i} style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: size, lineHeight: 1.04, letterSpacing: -3, color: BRAND.text, whiteSpace: "nowrap", ...entrance(kinds[i % 3], lf, i * 5, fps) }}>
          <Accented text={ln} accent={accent} glow />
        </div>
      ))}
      <Sub text={de} style={{ marginTop: 16, fontSize: 42, opacity: interpolate(lf, [12, 20], [0, 1], clamp) }} />
    </div>
  );
};

export const ClaimCard: React.FC<ClaimProps> = ({ theme = "dark", venue, item, price, bezirk }) => {
  applyTheme(theme);
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    loadBrandFonts().then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
  const total = DISTRICTS.reduce((s, d) => s + d.n, 0);

  const cardIn = spring({ frame: f - CARD_AT, fps, config: { damping: 14, stiffness: 140 } });
  const claimed = spring({ frame: f - CLAIM_AT - 30, fps, config: { damping: 10, stiffness: 200 } });
  const qPulse = 0.5 + 0.5 * Math.sin(((f - CARD_AT) / BEAT) * Math.PI);
  const endP = interpolate(f, [END_AT - 4, END_AT + 8], [0, 1], clamp);
  const checks = [
    ["Fix your info", "Infos korrigieren"],
    ["Confirm your prices", "Preise bestätigen"],
    ["See how many people view you", "Sieh, wie viele dich sehen"],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      <Backdrop />
      <Sfx at={CARD_AT} src="maximize_006" volume={0.4} />
      <Sfx at={CLAIM_AT} src="powerUp2" volume={0.4} />
      {checks.map((_, i) => <Sfx key={i} at={CLAIM_AT + 8 + i * 6} src="pluck_002" volume={0.3} />)}
      <Sfx at={CLAIM_AT + 30} src="impactPlate_heavy_001" volume={0.35} />
      <Sfx at={END_AT} src="confirmation_002" volume={0.55} />

      <Block from={0} to={CARD_AT} label={`${venue.en.toUpperCase()} OWNERS · WIEN`} lines={[`Your ${venue.en} is`, "*already* here."]} accent={BRAND.green} de={`Dein ${venue.de} ist schon auf der Karte.`} />
      <Block from={CARD_AT} to={CLAIM_AT} label={`${total} PLACES IN WIEN`} lines={["Prices added", "by your *guests*."]} accent={BRAND.yellow} de="Preise von deinen Gästen eingetragen." size={108} />
      <Block from={CLAIM_AT} to={END_AT} label="FREE · GRATIS" lines={["Claim it.", "Check it."]} accent={BRAND.green} de="Übernimm deinen Eintrag." />

      {/* the listing card */}
      <div style={{ position: "absolute", left: 120, right: 120, top: 860, opacity: cardIn * (1 - endP), transform: `translateY(${(1 - cardIn) * 120}px) scale(${0.96 + 0.04 * cardIn})` }}>
        <div style={{ background: BRAND.card, border: `2px solid ${claimed > 0.5 ? BRAND.green : BRAND.border}`, borderRadius: 28, padding: "40px 44px", boxShadow: claimed > 0.5 ? `0 0 40px ${g(BRAND.green, 0.35)}` : "0 20px 60px rgba(0,0,0,0.25)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 60, color: BRAND.text }}>Your {venue.en}</div>
              <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 28, color: BRAND.muted, marginTop: 4 }}>{bezirk}</div>
            </div>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 26, letterSpacing: 1, padding: "10px 16px", borderRadius: 12, color: claimed > 0.5 ? BRAND.bg : BRAND.muted, background: claimed > 0.5 ? BRAND.green : "transparent", border: `2px solid ${claimed > 0.5 ? BRAND.green : BRAND.border}`, transform: `scale(${claimed > 0.5 ? 0.9 + 0.1 * claimed : 1})` }}>
              {claimed > 0.5 ? "✓ OWNER" : "UNCLAIMED"}
            </div>
          </div>
          <div style={{ height: 2, background: BRAND.border, margin: "32px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 46, color: BRAND.text }}>{item}</div>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 58, color: BRAND.green }}>{price}</div>
          </div>
          <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 26, marginTop: 14, color: claimed > 0.5 ? BRAND.green : BRAND.yellow }}>
            {claimed > 0.5 ? "✓ confirmed by the owner · vom Lokal bestätigt" : "added by a guest · von einem Gast"}
          </div>
          {f < CLAIM_AT + 30 && f >= CARD_AT + 20 && (
            <div style={{ position: "absolute", right: -30, top: -40, fontFamily: BRAND.heading, fontWeight: 700, fontSize: 110, color: BRAND.yellow, textShadow: `0 0 ${10 + 14 * qPulse}px ${g(BRAND.yellow, 0.7)}`, transform: `rotate(12deg) scale(${spring({ frame: f - CARD_AT - 20, fps, config: { damping: 8 } })})` }}>?</div>
          )}
        </div>
        {/* checklist */}
        <div style={{ marginTop: 44 }}>
          {checks.map(([en, de], i) => {
            const p = interpolate(f - CLAIM_AT - 8 - i * 6, [0, 10], [0, 1], clamp);
            return (
              <div key={en} style={{ display: "flex", gap: 22, alignItems: "baseline", marginBottom: 22, opacity: p, transform: `translateX(${(1 - p) * -30}px)` }}>
                <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 44, color: BRAND.green }}>✓</div>
                <div>
                  <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 44, color: BRAND.text }}>{en}</div>
                  <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 30, color: BRAND.muted }}>{de}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {f >= END_AT - 4 && (
        <AbsoluteFill>
          <Bloom color={a(BRAND.green, 0.85 * (BRAND.glow as number))} start={END_AT} top={720} size={900} />
          <div style={{ position: "absolute", top: 480, width: "100%", textAlign: "center", ...entrance("slam", f - END_AT, 0, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 104, letterSpacing: -3, color: BRAND.text }}>Claim it. <Accented text="*Free.*" accent={BRAND.green} glow /></div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 44, color: BRAND.muted, marginTop: 6 }}>Gratis. Kostenlos. Für immer.</div>
          </div>
          <div style={{ position: "absolute", top: 720, width: "100%", textAlign: "center", ...entrance("rise", f - END_AT, 6, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 84, letterSpacing: -2, color: BRAND.green, textShadow: `0 0 26px ${g(BRAND.green, 0.5)}` }}>howmuch.live/business</div>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 32, color: BRAND.muted, marginTop: 10 }}>link in bio · Link in Bio</div>
          </div>
          <div style={{ position: "absolute", top: 960, width: "100%", textAlign: "center", ...entrance("rise", f - END_AT, 12, fps, "center") }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 60, color: BRAND.text }}>Tag a {venue.en} <Accented text="*owner*" accent={BRAND.yellow} /></div>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 500, fontSize: 30, color: BRAND.muted, marginTop: 8 }}>Markier einen Lokalbesitzer</div>
            <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 84, color: BRAND.yellow, marginTop: 8, transform: `translateY(${Math.sin((f / fps) * Math.PI * 4) * 12}px)` }}>↓</div>
          </div>
        </AbsoluteFill>
      )}

      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(f / (CLAIM_FRAMES - 1)) * 100}%`, background: BRAND.green }} />
      <div style={{ position: "absolute", top: 190, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontFamily: BRAND.mono, fontSize: 28, letterSpacing: 2, opacity: 1 - endP }}>
        <span style={{ color: BRAND.green, fontWeight: 700 }}>HOW MUCH?!</span>
        <span style={{ color: BRAND.muted, fontWeight: 500 }}>for business</span>
      </div>
    </AbsoluteFill>
  );
};

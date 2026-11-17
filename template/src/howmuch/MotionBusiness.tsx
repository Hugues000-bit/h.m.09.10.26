// HOW MUCH?! — motion-design film for venue owners, 1080x1920, 30 fps, about 28 s (length follows the voice).
// Goal: claim your page (free, forever) and request access to the Pro beta (invite-only, free during the beta).
// Features named here are the ones listed on howmuch.live/business (Nov 2026). No price, no view count, no venue named:
// everything shown is illustrative ("?,?? €", "Your café").
// lang="de" gives the all-German version (German text on screen + German voice set motion-business-de).
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Easing, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, a, g, applyTheme, loadBrandFonts, Theme } from "./brand";
import { Backdrop, Bloom, Glitch, Sfx } from "./PriceVideo";
import { Cue, VoiceOver, voiceFrames } from "./Voice";
import { VOICE } from "./voice-data";
import { Kinetic, Lang, Tag } from "./MotionIntro";
import { ViennaMap } from "./ViennaMap";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const setOf = (lang: Lang) => (lang === "de" ? "motion-business-de" : "motion-business");
const IDS = ["b1", "b2", "b3", "b4", "b5", "b6"];
const MIN = [84, 84, 120, 140, 66, 126];
const WIPE = 12;

export const businessSchedule = (lang: Lang = "en") => {
  const SET = setOf(lang);
  const start: number[] = [];
  let t = 0;
  IDS.forEach((id, i) => {
    start.push(t);
    t += Math.max(MIN[i], voiceFrames(SET, id) + 20);
  });
  return { start, endAt: t, total: t + Math.max(110, voiceFrames(SET, "end") + 66) };
};

export type BusinessProps = { theme?: Theme; places: string; lang?: Lang };

// Every word on screen, per language. English keeps a small German line under each headline ("sub");
// the German version is German only. k = [kinetic headline, size].
const TEXT = (lang: Lang, places: string) =>
  lang === "de"
    ? {
        k: [
          [`Dein *Café*|oder deine *Bar*|ist schon|auf der Karte.`, 96],
          [`Deine *Gäste*|haben Preise|eingetragen.|~Noch aktuell?~`, 96],
          [`Übernimm|deinen *Eintrag*.|*Gratis.* Für immer.`, 96],
          [`Bald: *Pro*.`, 120],
          [`Das Ranking?|*Nie käuflich.*`, 108],
          [`Pro-Beta:|nur mit|*Einladung*.`, 108],
        ] as [string, number][],
        sub: [null, null, null, null, null, null] as (string | null)[],
        venue: "Dein Café",
        claim: "Eintrag übernehmen",
        claimed: "✓ Übernommen",
        items: ["Name & Adresse korrigieren", "Preise bestätigen", "Abzeichen „Vom Lokal bestätigt“", "Deine Aufrufe sehen"],
        cards: [
          ["Deine Preise im Vergleich", "mit deinem Grätzl"],
          ["Was sich rundherum tut", "in deiner Nähe"],
          ["Deine Happy Hour auf der Karte", "für alle sichtbar"],
        ],
        pass: "Auf Einladung · Gratis in der Beta",
        request: "Zugang anfragen →",
        endTag: "FÜR LOKALE",
        endMain: "Eintrag übernehmen",
        endSub: "Pro-Beta-Zugang anfragen",
        header: "HOW MUCH?! · FÜR LOKALE",
        footer: `${places} Lokale in Wien mit Preisen von Gästen · Illustration, keine echten Preise · HOW MUCH?!`,
      }
    : {
        k: [
          [`Your *café* or *bar*|is already|on the map.`, 104],
          [`Your *guests*|added the prices.|~Still right?~`, 100],
          [`Claim your page.|*Free.* Forever.`, 108],
          [`Soon: *Pro*.`, 120],
          [`The ranking?|*Never for sale.*`, 108],
          [`Pro beta:|*invite only*.`, 108],
        ] as [string, number][],
        sub: [
          "Dein Lokal ist schon auf der Karte.",
          "Deine Gäste haben die Preise eingetragen.",
          "Eintrag übernehmen. Gratis, für immer.",
          "Bald: Pro.",
          "Das Ranking ist nie käuflich.",
          "Pro-Beta nur auf Einladung. Gratis in der Beta.",
        ] as (string | null)[],
        venue: "Your café",
        claim: "Claim this page",
        claimed: "✓ Claimed · Übernommen",
        items: ["Fix your name & address", "Confirm your prices", "“Confirmed by the venue” badge", "See your views"],
        cards: [
          ["Your prices vs your neighbourhood", "Deine Preise im Vergleich"],
          ["What's new around you", "Was sich rundherum tut"],
          ["Your happy hour on the map", "Deine Angebote auf der Karte"],
        ],
        pass: "Invite only · Free during the beta",
        request: "Request access →",
        endTag: "FOR VENUES · FÜR LOKALE",
        endMain: "Claim your page · Request Pro access",
        endSub: "Eintrag übernehmen · Pro-Zugang anfragen",
        header: "HOW MUCH?! · FOR VENUES",
        footer: `${places} places in Vienna with prices added by guests · illustrations, not real prices · HOW MUCH?!`,
      };

const Storefront: React.FC<{ draw: number; w?: number }> = ({ draw, w = 420 }) => {
  const L = 1600;
  const G = BRAND.green as string;
  const stripes = 7;
  return (
    <svg width={w} height={w} viewBox="0 0 300 300" style={{ overflow: "visible" }}>
      <g fill="none" stroke={BRAND.text as string} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - draw)}>
        <path d="M40 120 V280 H260 V120" />
        <path d="M120 280 V190 H180 V280" />
        <path d="M60 150 H100 V200 H60 Z M200 150 H240 V200 H200 Z" />
        <path d="M20 280 H280" />
      </g>
      {Array.from({ length: stripes }, (_, k) => {
        const p = interpolate(draw, [0.4 + k * 0.06, 0.6 + k * 0.06], [0, 1], clamp);
        const x = 30 + (k * 240) / stripes;
        return <path key={k} d={`M${x} 70 h${240 / stripes} v${50 * p} a${120 / stripes} 14 0 0 1 -${240 / stripes} 0 Z`} fill={k % 2 ? (BRAND.card as string) : G} stroke={G} strokeWidth={3} opacity={p} />;
      })}
      <path d="M24 70 H276" stroke={G} strokeWidth={6} strokeLinecap="round" opacity={interpolate(draw, [0.35, 0.45], [0, 1], clamp)} />
    </svg>
  );
};

const Pin: React.FC<{ col: string; size?: number }> = ({ col, size = 90 }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 90 108">
    <path d="M45 104 C18 70 8 54 8 38 a37 37 0 0 1 74 0 c0 16 -10 32 -37 66 Z" fill={col} style={{ filter: `drop-shadow(0 0 14px ${g(col, 0.6)})` }} />
    <circle cx={45} cy={38} r={14} fill={BRAND.bg as string} />
  </svg>
);

const Check: React.FC<{ p: number; col: string }> = ({ p, col }) => (
  <svg width={56} height={56} viewBox="0 0 56 56">
    <circle cx={28} cy={28} r={25} fill={a(col, 0.15 * p)} stroke={col} strokeWidth={4} opacity={Math.min(1, p * 2)} />
    <path d="M16 29 l8 8 l16 -18" fill="none" stroke={col} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={40} strokeDashoffset={40 * (1 - p)} />
  </svg>
);

export const MotionBusiness: React.FC<BusinessProps> = ({ theme = "dark", places, lang = "en" }) => {
  applyTheme(theme);
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    loadBrandFonts().then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);

  const SET = setOf(lang);
  const S = businessSchedule(lang);
  const T = TEXT(lang, places);
  const G = BRAND.green as string;
  const P = BRAND.pink as string;
  const Y = BRAND.yellow as string;
  const C = BRAND.cyan as string;
  const cues: Cue[] = [...IDS.map((id, i) => ({ id, at: S.start[i] + 6 })), { id: "end", at: S.endAt + 16 }];
  const vf = (id: string) => VOICE[SET]?.[id]?.frames ?? 60;
  const loop = interpolate(f, [S.total - 9, S.total - 1], [0, 1], clamp);
  const sp = (fr: number, cfg = { damping: 11, stiffness: 220, mass: 0.6 }) => spring({ frame: fr, fps, config: cfg });

  const DE: React.FC<{ text: string | null; rel: number; top: number }> = ({ text, rel, top }) => text === null ? null : (
    <div style={{ position: "absolute", top, left: 80, width: 820, fontFamily: BRAND.heading, fontWeight: 500, fontSize: 36, color: BRAND.muted, whiteSpace: "nowrap",
      opacity: interpolate(rel, [18, 30], [0, 1], clamp) }}>{text}</div>
  );

  const scene = (i: number, rel: number): React.ReactNode => {
    const v = vf(IDS[i]);
    const kin = (top = 290, accent = G) => <Kinetic text={T.k[i][0]} rel={rel - 6} frames={v} size={T.k[i][1]} accent={accent} top={top} />;
    if (i === 0) {
      const pinIn = sp(rel - 34, { damping: 8, stiffness: 180, mass: 0.8 });
      return (
        <>
          <AbsoluteFill style={{ opacity: 0.45 }}>
            <ViennaMap cam={{ x: 470, y: 440, s: 3.2 + 0.4 * interpolate(rel, [0, 90], [0, 1], clamp) }} focus={[540, 1060]} dotColor={G} numbers={false} />
          </AbsoluteFill>
          <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 60%, ${a(BRAND.bg as string, 0.2)} 0%, ${a(BRAND.bg as string, 0.92)} 62%)` }} />
          {kin()}
          <DE text={T.sub[0]} rel={rel} top={640} />
          <div style={{ position: "absolute", top: 880, left: 330 }}>
            <Storefront draw={interpolate(rel, [4, 44], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) })} />
          </div>
          <div style={{ position: "absolute", top: 862 + (1 - Math.min(1, pinIn)) * -600, left: 495, opacity: Math.min(1, pinIn * 2) }}>
            <Pin col={G} />
          </div>
        </>
      );
    }
    if (i === 1) {
      const tags = [
        { l: "MELANGE", x: 70, y: 720, d: 6 },
        { l: "SCHNITZEL", x: 620, y: 760, d: 14 },
        { l: "TOAST", x: 70, y: 1110, d: 22 },
        { l: "CAPPUCCINO", x: 620, y: 1150, d: 30 },
      ];
      const q = sp(rel - 48, { damping: 8, stiffness: 240, mass: 0.7 });
      return (
        <>
          {kin()}
          <DE text={T.sub[1]} rel={rel} top={630} />
          <div style={{ position: "absolute", top: 900, left: 390, opacity: 0.9 }}>
            <Storefront draw={1} w={300} />
          </div>
          {tags.map((t, k) => {
            const p = sp(rel - t.d);
            return (
              <div key={k} style={{ position: "absolute", left: t.x, top: t.y, opacity: Math.min(1, p * 1.5), transform: `scale(${0.6 + 0.4 * Math.min(1, p)}) rotate(${k % 2 ? 4 : -4}deg)` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <svg width={34} height={34} viewBox="0 0 34 34"><circle cx={17} cy={11} r={8} fill={[G, Y, P, C][k]} /><path d="M3 34 a14 14 0 0 1 28 0 Z" fill={a(BRAND.text as string, 0.8)} /></svg>
                  <span style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 22, color: BRAND.muted, letterSpacing: 2 }}>{t.l}</span>
                </div>
                <Tag label="?,?? €" col={Y} w={270} />
              </div>
            );
          })}
          {rel >= 48 && (
            <div style={{ position: "absolute", top: 930, left: 0, width: 1080, textAlign: "center", transform: `scale(${2.2 - 1.2 * Math.min(1, q)}) rotate(-8deg)`, opacity: Math.min(1, q * 1.6) }}>
              <span style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 260, color: P, textShadow: `0 0 50px ${g(P, 0.6)}` }}>?</span>
            </div>
          )}
        </>
      );
    }
    if (i === 2) {
      const items = T.items;
      const tap = 22;
      const claimed = rel >= tap + 6;
      const ripple = interpolate(rel, [tap, tap + 16], [0, 1], clamp);
      const cardIn = sp(rel - 2);
      return (
        <>
          {kin()}
          <DE text={T.sub[2]} rel={rel} top={560} />
          <div style={{ position: "absolute", top: 660, left: 80, width: 820, borderRadius: 30, background: a(BRAND.card as string, 0.95), border: `3px solid ${claimed ? G : BRAND.border}`,
            padding: 34, boxSizing: "border-box", opacity: Math.min(1, cardIn * 1.5), transform: `translateY(${(1 - Math.min(1, cardIn)) * 120}px)`, boxShadow: claimed ? `0 0 50px ${g(G, 0.3)}` : "0 30px 80px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <div style={{ width: 92, height: 92, borderRadius: 22, background: a(G, 0.15), display: "flex", alignItems: "center", justifyContent: "center" }}><Pin col={G} size={54} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 52, color: BRAND.text, letterSpacing: -1 }}>{T.venue}</div>
                <div style={{ height: 18, width: 300, borderRadius: 9, background: a(BRAND.muted as string, 0.35), marginTop: 10 }} />
              </div>
            </div>
            <div style={{ position: "relative", marginTop: 26, height: 96, borderRadius: 20, background: claimed ? G : "transparent", border: `4px solid ${G}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
              transform: `scale(${rel >= tap && rel < tap + 6 ? 0.95 : 1})` }}>
              <span style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 46, color: claimed ? (BRAND.bg as string) : G }}>{claimed ? T.claimed : T.claim}</span>
              {rel >= tap && <div style={{ position: "absolute", left: 410 - 400 * ripple, top: 48 - 400 * ripple, width: 800 * ripple, height: 800 * ripple, borderRadius: "50%", background: a("#FFFFFF", 0.35 * (1 - ripple)) }} />}
            </div>
            <div style={{ marginTop: 22 }}>
              {items.map((t, k) => {
                const p = interpolate(rel, [tap + 14 + k * 12, tap + 26 + k * 12], [0, 1], clamp);
                return (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 18, height: 74, opacity: 0.35 + 0.65 * p }}>
                    <Check p={p} col={G} />
                    <span style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 40, color: BRAND.text, whiteSpace: "nowrap" }}>{t}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      );
    }
    if (i === 3) {
      // Pro teaser: three cards (rank, around you, your offer on the map)
      const cards = [
        { t: T.cards[0][0], d: T.cards[0][1], col: Y },
        { t: T.cards[1][0], d: T.cards[1][1], col: C },
        { t: T.cards[2][0], d: T.cards[2][1], col: P },
      ];
      const cycle = Math.floor(rel / 4);
      return (
        <>
          {kin()}
          <DE text={T.sub[3]} rel={rel} top={430} />
          {cards.map((c, k) => {
            const p = sp(rel - 12 - k * 22);
            const top = 540 + k * 280;
            return (
              <div key={k} style={{ position: "absolute", top, left: 80, width: 820, height: 250, borderRadius: 28, background: a(BRAND.card as string, 0.95), border: `3px solid ${c.col}`, boxSizing: "border-box",
                padding: "26px 30px", display: "flex", gap: 28, alignItems: "center", opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - Math.min(1, p)) * (k % 2 ? -900 : 900)}px)`, boxShadow: `0 0 36px ${g(c.col, 0.22)}` }}>
                <div style={{ width: 200, height: 190, flexShrink: 0, position: "relative" }}>
                  {k === 0 && (
                    <svg width={200} height={190} viewBox="0 0 200 190">
                      {[70, 120, 95, 150, 110].map((hgt, b) => {
                        const gp = interpolate(rel, [20 + b * 4, 40 + b * 4], [0, 1], clamp);
                        return <rect key={b} x={10 + b * 38} y={180 - hgt * gp} width={28} height={hgt * gp} rx={6} fill={b === 2 ? c.col : a(BRAND.muted as string, 0.45)} />;
                      })}
                      <path d="M95 30 l-12 -14 h24 Z" fill={c.col} opacity={interpolate(rel, [44, 52], [0, 1], clamp)} transform="translate(0,40) rotate(180 95 22)" />
                    </svg>
                  )}
                  {k === 1 && (
                    <svg width={200} height={190} viewBox="0 0 200 190">
                      {[30, 60, 90].map((r) => <circle key={r} cx={100} cy={95} r={r} fill="none" stroke={a(c.col, 0.35)} strokeWidth={3} />)}
                      <path d={`M100 95 L${100 + 90 * Math.cos((rel / 30) * Math.PI * 2)} ${95 + 90 * Math.sin((rel / 30) * Math.PI * 2)}`} stroke={c.col} strokeWidth={4} />
                      <circle cx={100} cy={95} r={10} fill={G} />
                      {[[150, 60], [60, 140], [140, 150], [50, 60]].map(([x, y], d) => <circle key={d} cx={x} cy={y} r={8} fill={c.col} opacity={(cycle + d) % 4 === 0 ? 1 : 0.4} />)}
                    </svg>
                  )}
                  {k === 2 && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
                      <div style={{ background: c.col, color: BRAND.bg as string, borderRadius: 14, padding: "8px 14px", fontFamily: BRAND.mono, fontWeight: 700, fontSize: 22, whiteSpace: "nowrap", marginBottom: 6,
                        transform: `scale(${1 + 0.06 * Math.sin((rel / 30) * Math.PI * 2)})` }}>HAPPY HOUR</div>
                      <Pin col={c.col} size={70} />
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 44, lineHeight: 1.1, color: BRAND.text, letterSpacing: -1, ...({ textWrap: "balance" } as React.CSSProperties) }}>{c.t}</div>
                  <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 30, color: BRAND.muted, marginTop: 8 }}>{c.d}</div>
                </div>
              </div>
            );
          })}
        </>
      );
    }
    if (i === 4) {
      // trust: the ranking is never for sale (a padlock closes on the ranking)
      const lock = sp(rel - 20, { damping: 9, stiffness: 240, mass: 0.7 });
      const listIn = sp(rel - 2);
      return (
        <>
          {kin()}
          <DE text={T.sub[4]} rel={rel} top={560} />
          <div style={{ position: "absolute", top: 700, left: 180, width: 720, opacity: Math.min(1, listIn * 1.5) }}>
            {[1, 2, 3, 4].map((n, k) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 20, height: 100, marginBottom: 14, borderRadius: 20, background: a(BRAND.card as string, 0.95), border: `2px solid ${BRAND.border}`, padding: "0 24px" }}>
                <span style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 44, color: k === 0 ? G : (BRAND.muted as string), width: 60 }}>#{n}</span>
                <div style={{ height: 22, width: 360 - k * 50, borderRadius: 11, background: a(BRAND.muted as string, 0.35) }} />
                <span style={{ marginLeft: "auto", fontFamily: BRAND.mono, fontWeight: 700, fontSize: 34, color: BRAND.muted }}>?,?? €</span>
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", top: 760, left: 380, transform: `translateY(${(1 - Math.min(1, lock)) * -400}px) scale(${0.9 + 0.1 * Math.min(1, lock)})`, opacity: Math.min(1, lock * 2) }}>
            <svg width={320} height={360} viewBox="0 0 320 360" style={{ filter: `drop-shadow(0 0 30px ${g(G, 0.5)})` }}>
              <path d={`M90 160 V${110 - 30 * (1 - Math.min(1, lock))} a70 70 0 0 1 140 0 V160`} fill="none" stroke={G} strokeWidth={30} strokeLinecap="round" />
              <rect x={40} y={150} width={240} height={190} rx={34} fill={G} />
              <circle cx={160} cy={230} r={22} fill={BRAND.bg as string} />
              <rect x={150} y={240} width={20} height={50} rx={8} fill={BRAND.bg as string} />
            </svg>
          </div>
        </>
      );
    }
    // i === 5: the invite-only pass
    const flip = interpolate(sp(rel - 6, { damping: 12, stiffness: 120, mass: 0.9 }), [0, 1], [90, 0]);
    const btn = 1 + 0.05 * Math.sin(((rel - 40) / 22) * Math.PI * 2);
    return (
      <>
        {kin()}
        <DE text={T.sub[5]} rel={rel} top={560} />
        <div style={{ position: "absolute", top: 680, left: 110, width: 760, height: 430, perspective: 1600 }}>
          <div style={{ width: 760, height: 430, borderRadius: 34, transform: `rotateY(${flip}deg) rotateZ(-3deg)`, background: `linear-gradient(135deg, ${a(G, 0.95)} 0%, ${a(C, 0.9)} 100%)`,
            boxShadow: `0 0 70px ${g(G, 0.45)}`, padding: 40, boxSizing: "border-box", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -60, top: -60, width: 260, height: 260, borderRadius: "50%", border: `22px solid ${a("#FFFFFF", 0.18)}` }} />
            <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: a("#0A0A0A", 0.75) }}>HOW MUCH?! · PRO</div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 104, letterSpacing: -3, color: "#0A0A0A", marginTop: 34, lineHeight: 1 }}>BETA PASS</div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 38, color: a("#0A0A0A", 0.8), marginTop: 16 }}>{T.pass}</div>
            <div style={{ position: "absolute", left: 40, right: 40, bottom: 36, borderTop: `4px dashed ${a("#0A0A0A", 0.35)}`, paddingTop: 16, fontFamily: BRAND.mono, fontWeight: 700, fontSize: 26, color: a("#0A0A0A", 0.7), letterSpacing: 3 }}>
              WIEN · 2026 · NO. ___
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", top: 1170, left: 0, width: 1080, display: "flex", justifyContent: "center", opacity: interpolate(rel, [34, 44], [0, 1], clamp) }}>
          <div style={{ border: `4px solid ${G}`, borderRadius: 26, padding: "18px 44px", fontFamily: BRAND.heading, fontWeight: 700, fontSize: 52, color: G, transform: `scale(${rel > 40 ? btn : 1})`, boxShadow: `0 0 30px ${g(G, 0.35)}` }}>
            {T.request}
          </div>
        </div>
      </>
    );
  };

  const idx = Math.max(0, S.start.filter((t) => f >= t).length - 1);
  const inEnd = f >= S.endAt;
  const rel = f - S.start[idx];
  const wipeP = (start: number) => interpolate(f, [start, start + WIPE], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const layer = (node: React.ReactNode, clip: number | null, key: string) => (
    <AbsoluteFill key={key} style={{ backgroundColor: BRAND.bg, clipPath: clip === null ? undefined : `circle(${clip * 130}% at 50% 62%)` }}>
      <Backdrop />
      {node}
    </AbsoluteFill>
  );
  const endRel = f - S.endAt;
  const logo = spring({ frame: endRel - 4, fps, config: { damping: 9, stiffness: 160, mass: 0.8 } });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      <VoiceOver set={SET} cues={cues} />
      {S.start.slice(1).map((t, k) => <Sfx key={k} at={t} src="maximize_006" volume={0.22} />)}
      <Sfx at={S.start[0] + 34} src="pluck_001" volume={0.28} />
      <Sfx at={S.start[1] + 48} src="glitch_002" volume={0.26} />
      <Sfx at={S.start[2] + 22} src="switch_002" volume={0.3} />
      {[0, 1, 2, 3].map((k) => <Sfx key={k} at={S.start[2] + 36 + k * 12} src="tick_002" volume={0.22} />)}
      <Sfx at={S.start[4] + 20} src="impactPlate_heavy_001" volume={0.3} />
      <Sfx at={S.start[5] + 8} src="powerUp2" volume={0.25} />
      <Sfx at={S.endAt + 4} src="glitch_002" volume={0.28} />
      <Sfx at={S.endAt + 12} src="confirmation_002" volume={0.3} />

      {!inEnd && idx > 0 && f < S.start[idx] + WIPE && layer(scene(idx - 1, f - S.start[idx - 1]), null, `prev-${idx}`)}
      {!inEnd && layer(scene(idx, rel), idx === 0 ? null : wipeP(S.start[idx]), `cur-${idx}`)}

      {f >= S.endAt - 1 && (
        <AbsoluteFill style={{ clipPath: `circle(${wipeP(S.endAt) * 130}% at 50% 62%)`, backgroundColor: BRAND.bg }}>
          <Backdrop />
          <Bloom color={a(G, 0.85 * (BRAND.glow as number))} start={S.endAt} top={700} size={1000} />
          <div style={{ position: "absolute", top: 470, left: 0, width: 1080, textAlign: "center", transform: `scale(${0.6 + 0.4 * Math.min(1.1, logo)})`, opacity: Math.min(1, logo * 1.5) }}>
            <Glitch text="HOW MUCH?!" active={endRel >= 4 && endRel < 14} seed="mb" style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 120, letterSpacing: -4, color: G, textShadow: `0 0 40px ${g(G, 0.6)}` }} />
            <div style={{ fontFamily: BRAND.mono, fontWeight: 700, fontSize: 34, letterSpacing: 8, color: BRAND.text, marginTop: 6 }}>{T.endTag}</div>
          </div>
          <div style={{ position: "absolute", top: 760, left: 80, width: 920 - 80, textAlign: "center", opacity: interpolate(endRel, [14, 24], [0, 1], clamp), transform: `translateY(${interpolate(endRel, [14, 24], [30, 0], clamp)}px)` }}>
            <span style={{ display: "inline-block", border: `4px solid ${G}`, borderRadius: 24, padding: "14px 34px", fontFamily: BRAND.heading, fontWeight: 700, fontSize: 64, color: G, letterSpacing: -1.5 }}>howmuch.live/business</span>
          </div>
          <div style={{ position: "absolute", top: 930, left: 80, width: 920 - 80, textAlign: "center", opacity: interpolate(endRel, [22, 32], [0, 1], clamp) }}>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 700, fontSize: 46, color: BRAND.text }}>{T.endMain}</div>
            <div style={{ fontFamily: BRAND.heading, fontWeight: 500, fontSize: 34, color: BRAND.muted, marginTop: 10 }}>{T.endSub}</div>
          </div>
        </AbsoluteFill>
      )}

      <div style={{ position: "absolute", top: 170, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontFamily: BRAND.mono, fontSize: 28, letterSpacing: 2, opacity: inEnd ? 0 : 1 }}>
        <span style={{ color: BRAND.green, fontWeight: 700 }}>{T.header}</span>
        <span style={{ color: BRAND.muted, fontWeight: 500 }}>howmuch.live</span>
      </div>
      <div style={{ position: "absolute", top: 1404, left: 80, right: 180, fontFamily: BRAND.mono, fontSize: 20, lineHeight: 1.35, color: BRAND.muted, opacity: inEnd ? 0 : 1 }}>
        {T.footer}
      </div>
      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(f / (S.total - 1)) * 100}%`, background: BRAND.green }} />
      <AbsoluteFill style={{ backgroundColor: BRAND.bg, opacity: loop, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

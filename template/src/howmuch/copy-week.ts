// Week 12–25 Oct 2026 · bilingual EN (big) + DE (small) · "price hunt" hooks: show the cheapest price + Bezirk, never the venue → answer on howmuch.live
import { PriceVideoCopy } from "./PriceVideo";

const base = {
  rateLabel: "GUESS · RATE MAL",
  tickerFinal: "?,?? €",
  minLabel: "CHEAPEST",
  maxLabel: "PRICIEST",
  stamp: "ARE WE BEING RIPPED OFF?",
  stampDe: "Werden wir verarscht?",
  ctaSub: "Answer on howmuch.live · link in bio",
  ctaDe: "Antwort auf howmuch.live · Link in Bio",
  showMedian: false,
};

export const COPY_NEUBAU: PriceVideoCopy = {
  ...base,
  hookLabel: "NEUBAU · KRÜGERL 0,5 L",
  hookLines: ["The *cheapest*", "Krügerl in", "Neubau costs…"],
  hookDe: "Das billigste Krügerl in Neubau kostet…",
  dataLabel: "{n} PLACES · 1070 WIEN",
  dataLines: [{ t: "Same Bezirk." }, { t: "Same Krügerl.", c: "pink" }],
  dataDe: "Gleicher Bezirk. Gleiches Krügerl.",
  punchKicker: "FROM {min} TO {max}",
  punchLines: [],
  pctCaption: "for the same beer.",
  pctDe: "fürs gleiche Bier.",
  ctaQuestion: "Where's the *{min}* one?",
  footer: "Data: HOW MUCH?! community · Neubau · Krügerl 0.5 l draught · n = {n}",
};

export const COPY_FUENFHAUS: PriceVideoCopy = {
  ...base,
  hookLabel: "15. BEZIRK · KRÜGERL 0,5 L",
  hookLines: ["*2\u00a0€* difference.", "Same Krügerl.", "Same Bezirk."],
  hookDe: "2 € Unterschied im gleichen Bezirk.",
  dataLabel: "{n} PLACES · RUDOLFSHEIM-FÜNFHAUS",
  dataLines: [{ t: "One street over," }, { t: "different price.", c: "pink" }],
  dataDe: "Eine Straße weiter, anderer Preis.",
  punchKicker: "FROM {min} TO {max}",
  punchLines: [],
  pctCaption: "in the same Bezirk.",
  pctDe: "im gleichen Bezirk.",
  ctaQuestion: "Where's the *{min}* one?",
  footer: "Data: HOW MUCH?! community · 1150 Wien · Krügerl 0.5 l draught · n = {n}",
};

export const COPY_WEISSER: PriceVideoCopy = {
  ...base,
  theme: "light",
  hookLabel: "WIEN · WEISSER SPRITZER",
  hookLines: ["The *cheapest*", "G'spritzter in", "Vienna costs…"],
  hookDe: "Der billigste G'spritzte in Wien kostet…",
  dataLabel: "{n} PLACES · ALL OF VIENNA",
  dataLines: [{ t: "Wine + soda." }, { t: "Wild prices.", c: "pink" }],
  dataDe: "Wein + Soda. Wilde Preise.",
  punchKicker: "FROM {min} TO {max}",
  punchLines: [],
  pctCaption: "for wine and soda water.",
  pctDe: "für Wein und Soda.",
  ctaQuestion: "Where's the *{min}* one?",
  footer: "Data: HOW MUCH?! community · Wien · Weißer Spritzer · n = {n}",
};

export const COPY_DOENER: PriceVideoCopy = {
  ...base,
  theme: "light",
  hookLabel: "WIEN · DÖNER IM BROT",
  hookLines: ["The *cheapest*", "Döner in", "Vienna costs…"],
  hookDe: "Der billigste Döner in Wien kostet…",
  dataLabel: "{n} REAL PRICES · VIENNA",
  dataLines: [{ t: "Same Döner." }, { t: "Different price.", c: "pink" }],
  dataDe: "Gleicher Döner. Anderer Preis.",
  punchKicker: "FROM {min} TO {max}",
  punchLines: [],
  pctCaption: "for the same Döner.",
  pctDe: "für den gleichen Döner.",
  ctaQuestion: "Where's the *{min}* one?",
  footer: "Data: HOW MUCH?! community · Wien · Döner im Brot · n = {n}",
};

export const COPY_CAPPUCCINO: PriceVideoCopy = {
  ...base,
  hookLabel: "WIEN · CAPPUCCINO",
  hookLines: ["The *cheapest*", "cappuccino in", "Vienna costs…"],
  hookDe: "Der billigste Cappuccino in Wien kostet…",
  dataLabel: "{n} PLACES · ALL OF VIENNA",
  dataLines: [{ t: "Same coffee." }, { t: "Double the price.", c: "pink" }],
  dataDe: "Gleicher Kaffee. Doppelter Preis.",
  punchKicker: "FROM {min} TO {max}",
  punchLines: [],
  pctCaption: "for the same cappuccino.",
  pctDe: "für den gleichen Cappuccino.",
  ctaQuestion: "Where's the *{min}* one?",
  footer: "Data: HOW MUCH?! community · Wien · Cappuccino · n = {n}",
};

export const COPY_BURGER: PriceVideoCopy = {
  ...base,
  hookLabel: "WIEN · BURGER",
  hookLines: ["*11 €* difference.", "Same burger.", "Same city."],
  hookDe: "11 € Unterschied. Gleicher Burger.",
  dataLabel: "{n} PLACES · ALL OF VIENNA",
  dataLines: [{ t: "Bun, beef, cheese." }, { t: "Wild prices.", c: "pink" }],
  dataDe: "Brot, Fleisch, Käse. Wilde Preise.",
  punchKicker: "FROM {min} TO {max}",
  punchLines: [],
  pctCaption: "for a burger.",
  pctDe: "für einen Burger.",
  ctaQuestion: "Where's the *{min}* one?",
  footer: "Data: HOW MUCH?! community · Wien · Burger · n = {n}",
};

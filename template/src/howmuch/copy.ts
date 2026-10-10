// Copy for each video. Tokens {n} {min} {max} {median} {pct} {minPlz} {maxPlz} are filled from the data.
// In hookLines / ctaQuestion, *word* marks the accent word.
import { PriceVideoCopy } from "./PriceVideo";

export const COPY_BEER_WIEN: PriceVideoCopy = {
  hookLabel: "WIEN · KRÜGERL 0,5 L",
  hookLines: ["Was kostet", "ein *Krügerl*", "in Wien?"],
  rateLabel: "RATE MAL.",
  tickerFinal: "?,?? €",
  dataLabel: "{n} LOKALE · COMMUNITY-DATEN",
  dataLines: [{ t: "Gleiches Krügerl." }, { t: "Andere Preise.", c: "pink" }],
  minLabel: "BILLIGSTES",
  maxLabel: "TEUERSTES",
  punchKicker: "BILLIGSTES & TEUERSTES KRÜGERL",
  punchLines: [{ t: "Beide im" }, { t: "1. Bezirk.", c: "green", underline: true }],
  pctCaption: "PREISUNTERSCHIED",
  stamp: "WERDEN WIR VERARSCHT?",
  ctaQuestion: "Was zahlst *DU*?",
  ctaSub: "Schreib deinen Preis in die Kommentare",
  footer: "Daten: HOW MUCH?! Community · Wien · Krügerl 0,5 l · n = {n}",
};

export const COPY_DOENER_WIEN: PriceVideoCopy = {
  hookLabel: "WIEN · DÖNER IM BROT",
  hookLines: ["Was zahlst", "du für einen", "*Döner?*"],
  rateLabel: "RATE MAL.",
  tickerFinal: "?,?? €",
  dataLabel: "{n} ECHTE PREISE · COMMUNITY",
  dataLines: [{ t: "Gleicher Döner." }, { t: "Andere Preise.", c: "pink" }],
  minLabel: "BILLIGSTER",
  maxLabel: "TEUERSTER",
  punchKicker: "VON {min} BIS {max}",
  punchLines: [],
  pctCaption: "für den gleichen Döner.",
  stamp: "WERDEN WIR VERARSCHT?",
  ctaQuestion: "Was zahlst *DU*?",
  ctaSub: "Schreib deinen Preis in die Kommentare",
  footer: "Daten: HOW MUCH?! Community · Wien · Döner im Brot · n = {n}",
};

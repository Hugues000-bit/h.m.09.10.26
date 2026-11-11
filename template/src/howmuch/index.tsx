import React from "react";
import { Composition, registerRoot } from "remotion";
import { PriceVideo, PRICE_VIDEO_FRAMES } from "./PriceVideo";
import { WEEK } from "./data-week";
import { GapMap, GAP_FRAMES } from "./GapMap";
import { MonthlyMap, MONTHLY_FRAMES } from "./MonthlyMap";
import { ClaimCard, CLAIM_FRAMES } from "./ClaimCard";
import { CheapestMap, CHEAPEST_FRAMES } from "./CheapestMap";
import { PriceQuiz, QUIZ_FRAMES } from "./PriceQuiz";
import { ReceiptFact, RECEIPT_FRAMES } from "./ReceiptFact";
import { TierList, TIER_FRAMES } from "./TierList";
import { AppIntro, INTRO_FRAMES } from "./AppIntro";
import { Series } from "remotion";
import { HigherLower, hlSchedule } from "./HigherLower";
import { withVoice } from "./Voice";
import { AppExplainer, explainerSchedule } from "./AppExplainer";
import { MapDive, diveSchedule } from "./MapDive";
import { MapFill, FILL_FRAMES } from "./MapFill";
import { DinnerReceipts, DINNER_FRAMES } from "./DinnerReceipts";
import { UnderX, UNDER_FRAMES } from "./UnderX";
import { AustriaMonthly, AUSTRIA_FRAMES } from "./AustriaMonthly";
import { COPY_NEUBAU, COPY_FUENFHAUS, COPY_WEISSER, COPY_DOENER, COPY_CAPPUCCINO, COPY_BURGER, COPY_SCHNITZEL, COPY_LATTE } from "./copy-week";

const V: { id: string; points: typeof WEEK.NEUBAU; copy: typeof COPY_NEUBAU; voice?: string }[] = [
  { id: "Neubau", points: WEEK.NEUBAU, copy: COPY_NEUBAU },
  { id: "Fuenfhaus", points: WEEK.FUENFHAUS, copy: COPY_FUENFHAUS, voice: "price-fuenfhaus" },
  { id: "Weisser", points: WEEK.WEISSER, copy: COPY_WEISSER },
  { id: "Doener", points: WEEK.KEBAB, copy: COPY_DOENER },
  { id: "Cappuccino", points: WEEK.CAPPUCCINO, copy: COPY_CAPPUCCINO },
  { id: "Burger", points: WEEK.BURGER, copy: COPY_BURGER },
  { id: "Schnitzel", points: WEEK.SCHNITZEL, copy: COPY_SCHNITZEL, voice: "price-schnitzel" },
  { id: "Latte", points: WEEK.LATTE, copy: COPY_LATTE, voice: "price-latte" },
];

// Voiced versions (11 Nov 2026): same format + voice lines from data/voice/<set>.json (scripts/voice.py)
const PRICE_VOICED: Record<string, typeof PriceVideo> = {
  "price-fuenfhaus": withVoice(PriceVideo, "price-fuenfhaus") as typeof PriceVideo,
  "price-schnitzel": withVoice(PriceVideo, "price-schnitzel") as typeof PriceVideo,
  "price-latte": withVoice(PriceVideo, "price-latte") as typeof PriceVideo,
};
const ReceiptHotChocolateV = withVoice(ReceiptFact, "receipt-chocolat");
const ClaimBarV = withVoice(ClaimCard, "claim-bar");
const QuizCappuccinoV = withVoice(PriceQuiz, "quiz-cappuccino");
const UnderDoenerV = withVoice(UnderX, "under-doener");
const UnderEspressoV = withVoice(UnderX, "under-espresso");
const TierKruegerlV = withVoice(TierList, "tier-kruegerl");
const CheapestSchnitzelV = withVoice(CheapestMap, "cheapest-schnitzel");
const TierEspressoIntroV = withVoice(() => (
  <Series>
    <Series.Sequence durationInFrames={INTRO_FRAMES}>
      <AppIntro theme="dark" label="WIEN · ESPRESSO · TIER LIST" hook={["Every Bezirk,", "ranked by its", "cheapest *espresso*."]} hookDe="Jeder Bezirk, nach seinem billigsten Espresso." chip="☕ COFFEE · REAL PRICES" />
    </Series.Sequence>
    <Series.Sequence durationInFrames={TIER_FRAMES}>
      <TierList theme="dark" set="ESPRESSO" item="espresso" itemDe="Espresso" label="WIEN · ESPRESSO" cut={[2.0, 2.5, 3.0]} ctaSub="📩 Send this to someone from a C Bezirk" />
    </Series.Sequence>
  </Series>
), "tier-espresso-intro");

const Root: React.FC = () => (
  <>
    {V.map((v) => (
      <Composition key={v.id} id={v.id} component={v.voice ? PRICE_VOICED[v.voice] : PriceVideo} durationInFrames={PRICE_VIDEO_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ points: v.points, copy: v.copy }} />
    ))}
    <Composition id="GapMap" component={GapMap} durationInFrames={GAP_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ theme: "light" as const }} />
    <Composition id="Monthly" component={MonthlyMap} durationInFrames={MONTHLY_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ theme: "dark" as const }} />
    <Composition id="ClaimBar" component={ClaimBarV} durationInFrames={CLAIM_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "dark" as const, venue: { en: "bar", de: "Lokal" }, item: "Krügerl 0,5 l", price: "4,90 €", bezirk: "Neubau · 1070" }} />
    <Composition id="ClaimCafe" component={ClaimCard} durationInFrames={CLAIM_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "light" as const, venue: { en: "café", de: "Café" }, item: "Cappuccino", price: "4,20 €", bezirk: "Alsergrund · 1090" }} />
    <Composition id="CheapestKruegerl" component={CheapestMap} durationInFrames={CHEAPEST_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "dark" as const, set: "KRUEGERL" as const, item: "Krügerl", itemDe: "Krügerl", label: "WIEN · KRÜGERL 0,5 L" }} />
    <Composition id="CheapestCappuccino" component={CheapestMap} durationInFrames={CHEAPEST_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "light" as const, set: "CAPPUCCINO" as const, item: "cappuccino", itemDe: "Cappuccino", label: "WIEN · CAPPUCCINO" }} />
    {/* Monthly recap, all Austria (from Dec 2026) */}
    <Composition id="AustriaMonthly" component={AustriaMonthly} durationInFrames={AUSTRIA_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ theme: "dark" as const }} />
    {/* November 2026 maps (no alcohol, TikTok + Instagram) */}
    <Composition id="CheapestSchnitzel" component={CheapestSchnitzelV} durationInFrames={CHEAPEST_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "dark" as const, set: "SCHNITZEL" as const, item: "Schnitzel", itemDe: "Schnitzel", label: "WIEN · SCHNITZEL MIT SALAT" }} />
    <Composition id="CheapestPizza" component={CheapestMap} durationInFrames={CHEAPEST_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "light" as const, set: "PIZZA" as const, item: "pizza", itemDe: "Pizza", label: "WIEN · PIZZA" }} />
    <Composition id="CheapestEspresso" component={CheapestMap} durationInFrames={CHEAPEST_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "dark" as const, set: "ESPRESSO" as const, item: "espresso", itemDe: "Espresso", label: "WIEN · ESPRESSO" }} />
    <Composition id="CheapestBurger" component={CheapestMap} durationInFrames={CHEAPEST_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "light" as const, set: "BURGER" as const, item: "burger", itemDe: "Burger", label: "WIEN · BURGER" }} />
    <Composition id="QuizSchnitzel" component={PriceQuiz} durationInFrames={QUIZ_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "light" as const, label: "QUIZ · WIEN · SCHNITZEL", question: ["The *priciest*", "Schnitzel in Vienna?"], questionDe: "Das teuerste Schnitzel in Wien?",
        options: ["24,90 €", "32,90 €", "39,90 €"], answer: 2, answerLine: "39,90 € for one Schnitzel.", answerDe: "39,90 € für ein Schnitzel.", cheapest: "10,90 €", n: 50, item: "Schnitzel", itemDe: "Schnitzel" }} />
    {/* Surprising facts (receipt) + tier lists, 5 Nov 2026 data */}
    <Composition id="ReceiptCappuccino" component={ReceiptFact} durationInFrames={RECEIPT_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "dark" as const, label: "WIEN · CAPPUCCINO", hook: ["Cheapest *and* priciest", "cappuccino in Vienna:", "same Bezirk?"], hookDe: "Billigster und teuerster Cappuccino: selber Bezirk?",
        lines: [{ label: "CAPPUCCINO", sub: "cheapest in Vienna · billigster", price: "2,30 €", tone: "green" as const }, { label: "CAPPUCCINO", sub: "priciest in Vienna · teuerster", price: "7,50 €", tone: "pink" as const }],
        stampTop: "SAME BEZIRK", stampMain: "INNERE STADT", totalLabel: "DIFFERENCE", total: "+226 %", punch: ["Same Bezirk.", "*3×* the price."], punchDe: "Gleicher Bezirk. Dreifacher Preis.",
        cta: "Where's the *2,30\u00a0€* one?", ctaDe: "Wo gibt's den Cappuccino um 2,30 €?", ctaSub: "📩 Send this to your coffee buddy", footer: "latest price per place · 119 places · 5 Nov 2026" }} />
    <Composition id="ReceiptHotChocolate" component={ReceiptHotChocolateV} durationInFrames={RECEIPT_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "light" as const, label: "WIEN · HEISSE SCHOKOLADE", hook: ["Hot chocolate in Vienna:", "how much is *too* much?"], hookDe: "Heiße Schokolade: Wie viel ist zu viel?",
        lines: [{ label: "HOT CHOCOLATE", sub: "cheapest in Vienna · billigste", price: "1,90 €", tone: "green" as const }, { label: "HOT CHOCOLATE", sub: "priciest in Vienna · teuerste", price: "8,50 €", tone: "pink" as const }],
        stampTop: "SAME BEZIRK", stampMain: "INNERE STADT", totalLabel: "DIFFERENCE", total: "+347 %", punch: ["Same cup.", "*4,5×* the price."], punchDe: "Gleiche Tasse. 4,5-facher Preis.",
        cta: "Where's the *1,90\u00a0€* one?", ctaDe: "Wo gibt's die heiße Schokolade um 1,90 €?", ctaSub: "📩 Send this to whoever is always cold", footer: "latest price per place · 29 places · 5 Nov 2026" }} />
    <Composition id="ReceiptSchnitzel" component={ReceiptFact} durationInFrames={RECEIPT_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "dark" as const, label: "WIEN · SCHNITZEL MIT SALAT", hook: ["*1* Schnitzel or *3*?", "Same money."], hookDe: "1 Schnitzel oder 3? Gleiches Geld.",
        lines: [{ label: "1 × SCHNITZEL", sub: "priciest in Vienna · teuerstes", price: "39,90 €", tone: "pink" as const }, { label: "3 × SCHNITZEL", sub: "cheapest in Vienna · billigstes", price: "32,70 €", tone: "green" as const }],
        stampTop: "SAME MONEY", stampMain: "3 SCHNITZEL", totalLabel: "CHANGE · RÜCKGELD", total: "7,20 €", punch: ["Same money.", "*3* Schnitzel."], punchDe: "Gleiches Geld. 3 Schnitzel.",
        cta: "Where's the *10,90\u00a0€* one?", ctaDe: "Wo gibt's das Schnitzel um 10,90 €?", ctaSub: "📩 Send this to your Schnitzel crew", footer: "with salad · latest price per place · 53 places · 5 Nov 2026" }} />
    <Composition id="TierEspresso" component={TierList} durationInFrames={TIER_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "dark" as const, set: "ESPRESSO" as const, item: "espresso", itemDe: "Espresso", label: "WIEN · ESPRESSO", cut: [2.0, 2.5, 3.0] as [number, number, number], ctaSub: "📩 Send this to someone from a C Bezirk" }} />
    <Composition id="TierKruegerl" component={TierKruegerlV} durationInFrames={TIER_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "light" as const, set: "KRUEGERL" as const, item: "Krügerl", itemDe: "Krügerl", label: "WIEN · KRÜGERL 0,5 L", cut: [4.4, 4.5, 5.0] as [number, number, number], ctaSub: "📩 Send this to your Krügerl crew" }} />
    {/* German-first test for TikTok (17-21 Nov 2026): German big, English small */}
    <Composition id="ReceiptHotChocolateDe" component={ReceiptFact} durationInFrames={RECEIPT_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "light" as const, label: "WIEN · HEISSE SCHOKOLADE", hook: ["Heiße Schokolade in Wien:", "wie viel ist *zu* viel?"], hookDe: "Hot chocolate in Vienna: how much is too much?",
        lines: [{ label: "HEISSE SCHOKO", sub: "billigste in Wien · cheapest", price: "1,90 €", tone: "green" as const }, { label: "HEISSE SCHOKO", sub: "teuerste in Wien · priciest", price: "8,50 €", tone: "pink" as const }],
        stampTop: "GLEICHER BEZIRK", stampMain: "INNERE STADT", totalLabel: "UNTERSCHIED", total: "+347 %", punch: ["Gleiche Tasse.", "*4,5×* der Preis."], punchDe: "Same cup. 4,5× the price.",
        cta: "Wo gibt's die um *1,90\u00a0€*?", ctaDe: "Where's the 1,90 € one?", ctaSub: "📩 Schick das wem, dem immer kalt ist", footer: "letzter Preis pro Lokal · 29 Lokale · 10. Nov. 2026" }} />
    <Composition id="ReceiptSchnitzelDe" component={ReceiptFact} durationInFrames={RECEIPT_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "dark" as const, label: "WIEN · SCHNITZEL MIT SALAT", hook: ["*1* Schnitzel oder *3*?", "Gleiches Geld."], hookDe: "1 Schnitzel or 3? Same money.",
        lines: [{ label: "1 × SCHNITZEL", sub: "teuerstes in Wien · priciest", price: "39,90 €", tone: "pink" as const }, { label: "3 × SCHNITZEL", sub: "billigstes in Wien · cheapest", price: "32,70 €", tone: "green" as const }],
        stampTop: "GLEICHES GELD", stampMain: "3 SCHNITZEL", totalLabel: "RÜCKGELD · CHANGE", total: "7,20 €", punch: ["Gleiches Geld.", "*3* Schnitzel."], punchDe: "Same money. 3 Schnitzel.",
        cta: "Wo gibt's das um *10,90\u00a0€*?", ctaDe: "Where's the 10,90 € one?", ctaSub: "📩 Schick das deiner Schnitzel-Runde", footer: "mit Salat · letzter Preis pro Lokal · 53 Lokale · 10. Nov. 2026" }} />
    <Composition id="QuizSchnitzelDe" component={PriceQuiz} durationInFrames={QUIZ_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "light" as const, lang: "de" as const, label: "QUIZ · WIEN · SCHNITZEL", question: ["Das *teuerste*", "Schnitzel in Wien?"], questionDe: "The priciest Schnitzel in Vienna?",
        options: ["24,90 €", "32,90 €", "39,90 €"], answer: 2, answerLine: "39,90 € für ein Schnitzel.", answerDe: "39,90 € for one Schnitzel.", cheapest: "10,90 €", n: 53, item: "Schnitzel", itemDe: "Schnitzel" }} />
    {/* Real app map as a 2 s opener, then the tier list (test, 10 Nov 2026) */}
    <Composition id="TierEspressoIntro" durationInFrames={INTRO_FRAMES + TIER_FRAMES} fps={30} width={1080} height={1920}
      component={TierEspressoIntroV} />
    {/* November 2026 Krügerl challenge */}
    <Composition id="GapKruegerl" component={GapMap} durationInFrames={GAP_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "dark" as const, mode: "kruegerl" as const, date: "23 Oct 2026" }} />
    <Composition id="ChallengeKruegerl" component={CheapestMap} durationInFrames={CHEAPEST_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "dark" as const, set: "KRUEGERL" as const, item: "Krügerl", itemDe: "Krügerl", label: "WIEN · KRÜGERL 0,5 L", challenge: true }} />
    <Composition id="QuizCappuccino" component={QuizCappuccinoV} durationInFrames={QUIZ_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "light" as const, label: "QUIZ · WIEN · CAPPUCCINO", question: ["The *priciest*", "cappuccino in Vienna?"], questionDe: "Der teuerste Cappuccino in Wien?",
        options: ["4,50 €", "6,00 €", "7,50 €"], answer: 2, answerLine: "7,50 € for one cappuccino.", answerDe: "7,50 € für einen Cappuccino.", cheapest: "2,30 €", n: 120, item: "cappuccino", itemDe: "Cappuccino" }} />
    {/* Long formats (10 Nov 2026): game, map dive, two bills, map filling up */}
    <Composition id="HigherLower1" component={HigherLower} fps={30} width={1080} height={1920} durationInFrames={hlSchedule(5, "higherlower").total}
      calculateMetadata={({ props }) => ({ durationInFrames: hlSchedule(props.rounds.length, props.voice).total })}
      defaultProps={{ theme: "dark" as const, voice: "higherlower" as string | undefined, footer: "Lowest / highest price found on howmuch.live · latest price per place · Vienna · 10 Nov 2026",
        rounds: [
          { kind: "cheapest" as const, item: "espresso", itemDe: "Der billigste Espresso", note: "119 places", ref: 2, real: 1.8 },
          { kind: "priciest" as const, item: "hot chocolate", itemDe: "Die teuerste heiße Schokolade", note: "29 places", ref: 6, real: 8.5 },
          { kind: "cheapest" as const, item: "Schnitzel", itemDe: "Das billigste Schnitzel", note: "53 places", ref: 12, real: 10.9 },
          { kind: "priciest" as const, item: "cappuccino", itemDe: "Der teuerste Cappuccino", note: "120 places", ref: 7, real: 7.5 },
          { kind: "priciest" as const, item: "Schnitzel", itemDe: "Das teuerste Schnitzel", note: "53 places", ref: 35, real: 39.9 },
        ] }} />
    <Composition id="DiveCappuccino" component={MapDive} fps={30} width={1080} height={1920} durationInFrames={diveSchedule(6, "mapdive").total}
      calculateMetadata={({ props }) => ({ durationInFrames: diveSchedule(props.waypoints.length, props.voice).total })}
      defaultProps={{ theme: "dark" as const, voice: "mapdive" as string | undefined, label: "WIEN · CAPPUCCINO", hook: ["One city.", "One *cappuccino*.", "Watch the price drop."], hookDe: "Eine Stadt. Ein Cappuccino. Der Preis fällt.",
        waypoints: [
          { lat: 48.2039, lng: 16.3698, price: 7.5, bezirk: 1 }, { lat: 48.2234, lng: 16.3518, price: 5.8, bezirk: 9 }, { lat: 48.2241, lng: 16.3134, price: 4.9, bezirk: 17 },
          { lat: 48.1993, lng: 16.3189, price: 4.1, bezirk: 15 }, { lat: 48.19, lng: 16.3428, price: 3.4, bezirk: 6 }, { lat: 48.2136, lng: 16.362, price: 2.3, bezirk: 1 },
        ],
        end: ["Where *exactly*?", "It's on the map."], endDe: "Wo genau? Steht auf der Karte.", footer: "Real cappuccino prices · latest price per place · 120 places · 10 Nov 2026 · HOW MUCH?!" }} />
    <Composition id="DinnerSchnitzel" component={DinnerReceipts} durationInFrames={DINNER_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "dark" as const, label: "WIEN · SCHNITZEL + KRÜGERL", hook: ["Same dinner.", "*Two* bills."], hookDe: "Gleiches Abendessen. Zwei Rechnungen.",
        left: { tag: "6. BEZIRK", tagSub: "MARIAHILF", lines: [{ label: "1 × SCHNITZEL", sub: "mit Salat", price: "10,90" }, { label: "1 × KRÜGERL", sub: "0,5 l", price: "5,10" }], total: "16,00 €" },
        right: { tag: "1. BEZIRK", tagSub: "INNERE STADT", lines: [{ label: "1 × SCHNITZEL", sub: "mit Salat", price: "35,70" }, { label: "1 × KRÜGERL", sub: "0,5 l", price: "6,90" }], total: "42,60 €" },
        stampTop: "SAME ORDER · SELBE BESTELLUNG", stampMain: "+26,60 €", punch: ["Same dinner.", "*26,60 €* apart."], punchDe: "Gleiches Essen. 26,60 € Unterschied.",
        cta: "Where's the *16 €* dinner?", ctaDe: "Wo gibt's das Abendessen um 16 €?", ctaSub: "📩 Send this to whoever pays next time", footer: "Schnitzel with salad + Krügerl 0,5 l at the same place · 30 places · 10 Nov 2026" }} />
    <Composition id="MapFill" component={MapFill} durationInFrames={FILL_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "dark" as const, label: "WIEN · THE MAP SO FAR", hook: ["Every dot:", "a *real* price."], hookDe: "Jeder Punkt: ein echter Preis.", counterLabel: "places with a real price", counterDe: "Lokale mit echtem Preis",
        end: ["Is *your* street", "on the map?"], endDe: "Ist deine Straße schon dabei?", ctaSub: "Add the price you paid · Trag deinen Preis ein" }} />
    {/* "Still under X €?" — one dot per place, counted against a limit (11 Nov 2026) */}
    <Composition id="UnderDoener" component={UnderDoenerV} durationInFrames={UNDER_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "dark" as const, label: "WIEN · DÖNER", hook: ["A Döner for", "under *5 €*.", "Does it still exist?"], hookDe: "Döner unter 5 €. Gibt's den noch?", limit: 5,
        prices: [3.9, 4.3, 4.5, 4.5, 4.5, 4.5, 4.5, 5, 5, 5, 5, 5, 5.2, 5.5, 5.9, 5.9, 5.9, 5.9, 5.99, 6, 6.5, 6.5, 6.5, 6.5, 6.9, 7.5, 7.9, 8.5],
        where: ["All in 3 Bezirke:", "*15.* · *16.* · *20.*"], resultDe: "Nur 7 von 28 Lokalen. Alle im 15., 16. und 20. Bezirk.",
        twist: ["Last checked", "in *spring*.", "Still true?"], twistDe: "Zuletzt im Frühjahr geprüft. Stimmt's noch?",
        end: ["Which *7*?", "They're on the map."], endDe: "Welche 7? Steht auf der Karte.", ctaSub: "Price changed? Fix it · Preis geändert? Korrigier ihn",
        footer: "Döner sandwich · latest price per place · 28 places · prices added Mar–Nov 2026 · HOW MUCH?!" }} />
    <Composition id="UnderEspresso" component={UnderEspressoV} durationInFrames={UNDER_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "dark" as const, label: "WIEN · ESPRESSO", hook: ["An espresso for", "under *2,50\u00a0€*.", "Does it still exist?"], hookDe: "Espresso unter 2,50 €. Gibt's den noch?", limit: 2.5,
        prices: [1.8,1.9,1.9,2,2,2.3,2.3,2.3,2.4,2.5,2.5,2.5,2.6,2.6,2.6,2.7,2.8,2.8,2.8,2.8,2.8,2.8,2.8,2.8,2.8,2.8,2.8,2.8,2.8,2.9,2.9,2.9,2.9,2.9,2.9,2.9,2.9,2.9,2.9,2.9,2.9,2.9,2.9,2.9,2.9,3,3,3,3,3,3,3,3,3,3,3,3.1,3.1,3.1,3.1,3.1,3.1,3.1,3.1,3.15,3.2,3.2,3.2,3.2,3.2,3.2,3.2,3.2,3.2,3.2,3.2,3.2,3.2,3.2,3.2,3.2,3.3,3.3,3.3,3.3,3.3,3.3,3.4,3.4,3.4,3.4,3.5,3.5,3.5,3.5,3.5,3.5,3.5,3.5,3.5,3.5,3.5,3.6,3.6,3.7,3.7,3.8,3.8,3.8,3.9,3.9,3.9,4.2,4.2,4.3,4.4,4.5,4.5,4.7],
        where: ["In 5 Bezirke:", "*1.* · *6.* · *7.* · *8.* · *16.*"], resultDe: "Nur 9 von 119 Lokalen, in 5 Bezirken.",
        twist: ["Only *4* checked", "in the last 3 months.", "Still true?"], twistDe: "Nur 4 in den letzten 3 Monaten geprüft.",
        end: ["Which *9*?", "They're on the map."], endDe: "Welche 9? Steht auf der Karte.", ctaSub: "Price changed? Fix it · Preis geändert? Korrigier ihn",
        footer: "Espresso · latest price per place · 119 places · prices added Jul 2025–Nov 2026 · HOW MUCH?!" }} />
    {/* "What is HOW MUCH?!" explainer built on real crops of the app (11 Nov 2026) */}
    <Composition id="AppExplainer" component={AppExplainer} durationInFrames={explainerSchedule().total} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "dark" as const, prices: "1.600+", ctaSub: "No app to install · Kein Download nötig" }} />
  </>
);
registerRoot(Root);

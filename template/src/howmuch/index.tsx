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
import { AustriaMonthly, AUSTRIA_FRAMES } from "./AustriaMonthly";
import { COPY_NEUBAU, COPY_FUENFHAUS, COPY_WEISSER, COPY_DOENER, COPY_CAPPUCCINO, COPY_BURGER, COPY_SCHNITZEL, COPY_LATTE } from "./copy-week";

const V = [
  { id: "Neubau", points: WEEK.NEUBAU, copy: COPY_NEUBAU },
  { id: "Fuenfhaus", points: WEEK.FUENFHAUS, copy: COPY_FUENFHAUS },
  { id: "Weisser", points: WEEK.WEISSER, copy: COPY_WEISSER },
  { id: "Doener", points: WEEK.KEBAB, copy: COPY_DOENER },
  { id: "Cappuccino", points: WEEK.CAPPUCCINO, copy: COPY_CAPPUCCINO },
  { id: "Burger", points: WEEK.BURGER, copy: COPY_BURGER },
  { id: "Schnitzel", points: WEEK.SCHNITZEL, copy: COPY_SCHNITZEL },
  { id: "Latte", points: WEEK.LATTE, copy: COPY_LATTE },
];

const Root: React.FC = () => (
  <>
    {V.map((v) => (
      <Composition key={v.id} id={v.id} component={PriceVideo} durationInFrames={PRICE_VIDEO_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ points: v.points, copy: v.copy }} />
    ))}
    <Composition id="GapMap" component={GapMap} durationInFrames={GAP_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ theme: "light" as const }} />
    <Composition id="Monthly" component={MonthlyMap} durationInFrames={MONTHLY_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ theme: "dark" as const }} />
    <Composition id="ClaimBar" component={ClaimCard} durationInFrames={CLAIM_FRAMES} fps={30} width={1080} height={1920}
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
    <Composition id="CheapestSchnitzel" component={CheapestMap} durationInFrames={CHEAPEST_FRAMES} fps={30} width={1080} height={1920}
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
    <Composition id="ReceiptHotChocolate" component={ReceiptFact} durationInFrames={RECEIPT_FRAMES} fps={30} width={1080} height={1920}
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
    <Composition id="TierKruegerl" component={TierList} durationInFrames={TIER_FRAMES} fps={30} width={1080} height={1920}
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
      component={() => (
        <Series>
          <Series.Sequence durationInFrames={INTRO_FRAMES}>
            <AppIntro theme="dark" label="WIEN · ESPRESSO · TIER LIST" hook={["Every Bezirk,", "ranked by its", "cheapest *espresso*."]} hookDe="Jeder Bezirk, nach seinem billigsten Espresso." chip="REAL PRICES · WIEN" />
          </Series.Sequence>
          <Series.Sequence durationInFrames={TIER_FRAMES}>
            <TierList theme="dark" set="ESPRESSO" item="espresso" itemDe="Espresso" label="WIEN · ESPRESSO" cut={[2.0, 2.5, 3.0]} ctaSub="📩 Send this to someone from a C Bezirk" />
          </Series.Sequence>
        </Series>
      )} />
    {/* November 2026 Krügerl challenge */}
    <Composition id="GapKruegerl" component={GapMap} durationInFrames={GAP_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "dark" as const, mode: "kruegerl" as const, date: "23 Oct 2026" }} />
    <Composition id="ChallengeKruegerl" component={CheapestMap} durationInFrames={CHEAPEST_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "dark" as const, set: "KRUEGERL" as const, item: "Krügerl", itemDe: "Krügerl", label: "WIEN · KRÜGERL 0,5 L", challenge: true }} />
    <Composition id="QuizCappuccino" component={PriceQuiz} durationInFrames={QUIZ_FRAMES} fps={30} width={1080} height={1920}
      defaultProps={{ theme: "light" as const, label: "QUIZ · WIEN · CAPPUCCINO", question: ["The *priciest*", "cappuccino in Vienna?"], questionDe: "Der teuerste Cappuccino in Wien?",
        options: ["4,50 €", "6,00 €", "7,50 €"], answer: 2, answerLine: "7,50 € for one cappuccino.", answerDe: "7,50 € für einen Cappuccino.", cheapest: "3,40 €", n: 111, item: "cappuccino", itemDe: "Cappuccino" }} />
  </>
);
registerRoot(Root);

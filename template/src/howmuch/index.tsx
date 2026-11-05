import React from "react";
import { Composition, registerRoot } from "remotion";
import { PriceVideo, PRICE_VIDEO_FRAMES } from "./PriceVideo";
import { WEEK } from "./data-week";
import { GapMap, GAP_FRAMES } from "./GapMap";
import { MonthlyMap, MONTHLY_FRAMES } from "./MonthlyMap";
import { ClaimCard, CLAIM_FRAMES } from "./ClaimCard";
import { CheapestMap, CHEAPEST_FRAMES } from "./CheapestMap";
import { PriceQuiz, QUIZ_FRAMES } from "./PriceQuiz";
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

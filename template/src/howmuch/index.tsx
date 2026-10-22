import React from "react";
import { Composition, registerRoot } from "remotion";
import { PriceVideo, PRICE_VIDEO_FRAMES } from "./PriceVideo";
import { WEEK } from "./data-week";
import { GapMap, GAP_FRAMES } from "./GapMap";
import { MonthlyMap, MONTHLY_FRAMES } from "./MonthlyMap";
import { ClaimCard, CLAIM_FRAMES } from "./ClaimCard";
import { CheapestMap, CHEAPEST_FRAMES } from "./CheapestMap";
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
  </>
);
registerRoot(Root);

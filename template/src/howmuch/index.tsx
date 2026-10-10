import React from "react";
import { Composition, registerRoot } from "remotion";
import { PriceVideo, PRICE_VIDEO_FRAMES } from "./PriceVideo";
import { WEEK } from "./data-week";
import { GapMap, GAP_FRAMES } from "./GapMap";
import { COPY_NEUBAU, COPY_FUENFHAUS, COPY_WEISSER, COPY_DOENER, COPY_CAPPUCCINO, COPY_BURGER } from "./copy-week";

const V = [
  { id: "Neubau", points: WEEK.NEUBAU, copy: COPY_NEUBAU },
  { id: "Fuenfhaus", points: WEEK.FUENFHAUS, copy: COPY_FUENFHAUS },
  { id: "Weisser", points: WEEK.WEISSER, copy: COPY_WEISSER },
  { id: "Doener", points: WEEK.KEBAB, copy: COPY_DOENER },
  { id: "Cappuccino", points: WEEK.CAPPUCCINO, copy: COPY_CAPPUCCINO },
  { id: "Burger", points: WEEK.BURGER, copy: COPY_BURGER },
];

const Root: React.FC = () => (
  <>
    {V.map((v) => (
      <Composition key={v.id} id={v.id} component={PriceVideo} durationInFrames={PRICE_VIDEO_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ points: v.points, copy: v.copy }} />
    ))}
    <Composition id="GapMap" component={GapMap} durationInFrames={GAP_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ theme: "light" as const }} />
  </>
);
registerRoot(Root);

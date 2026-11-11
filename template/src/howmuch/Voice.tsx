// HOW MUCH?! — voice-over + word-by-word captions, shared by the long formats.
// The audio files and their lengths come from scripts/voice.py (voice-data.ts).
// A cue = one voice line placed on the timeline: { id, at }.
import React from "react";
import { Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, a } from "./brand";
import { VOICE } from "./voice-data";
import { SfxGain } from "./sfx-gain";

export type Cue = { id: string; at: number };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const voiceFrames = (set: string, id: string) => VOICE[set]?.[id]?.frames ?? 0;

export const VoiceOver: React.FC<{ set: string; cues: Cue[]; volume?: number }> = ({ set, cues, volume = 1 }) => (
  <>
    {cues.map((c) => (
      <Sequence key={c.id} from={Math.round(c.at)} durationInFrames={voiceFrames(set, c.id) + 6} layout="none">
        <Audio src={staticFile(`howmuch/voice/${set}/${c.id}.wav`)} volume={volume} />
      </Sequence>
    ))}
  </>
);

// Words are grouped in short chunks (one chunk on screen at a time); the word being spoken is accented.
// Timing is spread over the line by word length (a pause is added after . , ? !).
type Word = { w: string; from: number; to: number; chunk: number };
const layout = (text: string, frames: number, maxChars: number): Word[] => {
  const words = text.split(" ").filter(Boolean);
  const weight = (w: string) => w.replace(/ /g, " ").length + 2 + (/[.,?!:]$/.test(w) ? 5 : 0);
  const total = words.reduce((s, w) => s + weight(w), 0);
  let t = 0;
  let chunk = 0;
  let len = 0;
  return words.map((w, i) => {
    const from = (t / total) * frames;
    t += weight(w);
    if (len > 0 && len + w.length + 1 > maxChars) {
      chunk += 1;
      len = 0;
    }
    len += w.length + 1;
    const out = { w, from, to: (t / total) * frames, chunk };
    // a sentence end closes the chunk
    if (/[.?!]$/.test(w) && i < words.length - 1) {
      chunk += 1;
      len = 0;
    }
    return out;
  });
};

export const Captions: React.FC<{
  set: string;
  cues: Cue[];
  top?: number;
  accent?: string;
  size?: number;
  maxChars?: number;
  hold?: number; // frames the last chunk stays after the voice stops
}> = ({ set, cues, top = 1250, accent, size = 62, maxChars = 22, hold = 10 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = [...cues].reverse().find((c) => f >= c.at);
  if (!cue) return null;
  const line = VOICE[set]?.[cue.id];
  if (!line) return null;
  const rel = f - cue.at;
  if (rel > line.frames + hold) return null;
  const words = layout(line.show, line.frames, maxChars);
  const current = [...words].reverse().find((w) => rel >= w.from) ?? words[0];
  const shown = words.filter((w) => w.chunk === current.chunk);
  const chunkStart = shown[0].from;
  const pop = spring({ frame: rel - chunkStart, fps, config: { damping: 14, stiffness: 260, mass: 0.5 } });
  const col = accent ?? (BRAND.green as string);
  return (
    <div style={{ position: "absolute", top, left: 80, width: 820, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          background: a(BRAND.bg as string, 0.86),
          border: `2px solid ${BRAND.border}`,
          borderRadius: 22,
          padding: "14px 30px 18px",
          fontFamily: BRAND.heading,
          fontWeight: 700,
          fontSize: size,
          letterSpacing: -1.5,
          lineHeight: 1.1,
          whiteSpace: "nowrap",
          transform: `scale(${0.9 + 0.1 * Math.min(1, pop)})`,
          opacity: interpolate(pop, [0, 0.4], [0, 1], clamp),
        }}
      >
        {shown.map((w, i) => {
          const on = rel >= w.from;
          const active = w === current && rel <= line.frames + 2;
          return (
            <span key={i} style={{ color: active ? col : on ? (BRAND.text as string) : a(BRAND.muted as string, 0.55), marginRight: i < shown.length - 1 ? 16 : 0 }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// Voice lines that carry their own start frame ("at" in data/voice/<set>.json).
export const cuesOf = (set: string): Cue[] =>
  Object.entries(VOICE[set] ?? {})
    .filter(([, v]) => typeof v.at === "number")
    .map(([id, v]) => ({ id, at: v.at as number }));

// Adds a voice-over to any existing format without touching it: the lines are placed on the format's own beats
// and the sound effects are turned down. The text already on screen plays the role of the captions.
export const withVoice = <P extends object>(Component: React.ComponentType<P>, set: string, gain = 0.5): React.FC<P> => {
  const Voiced: React.FC<P> = (props) => (
    <SfxGain.Provider value={gain}>
      <Component {...props} />
      <VoiceOver set={set} cues={cuesOf(set)} />
    </SfxGain.Provider>
  );
  return Voiced;
};

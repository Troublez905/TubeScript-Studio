import type { Angle, ProductionPack } from "@/lib/types";
import { wordsAndMinutes } from "@/lib/studio-data";

export function exportMarkdown(angle: Angle | null, pack: ProductionPack | null) {
  if (!angle || !pack) {
    return "";
  }

  const script = pack.storyboard.map((block) => block.script).join("\n\n");
  const stats = wordsAndMinutes(script);

  return `# ${angle.title}

## Angle
- Type: ${angle.type}
- Hook: ${angle.hook}
- Value: ${angle.value}
- Estimated spoken length: ${stats.words} words, ${stats.minutesLow}-${stats.minutesHigh} minutes

## Core Knowledge
${pack.research.coreKnowledge.map((item) => `- ${item}`).join("\n")}

## References
${pack.research.references.map((item) => `- ${item.label}: ${item.query}`).join("\n")}

## Storyboard
| Timestamp | Visual Direction | Spoken Script | Voiceover Cue | Retention Note |
| --- | --- | --- | --- | --- |
${pack.storyboard
  .map((block) => `| ${block.timestamp} | ${block.visual} | ${block.script} | ${block.voiceoverCue} | ${block.retentionNote} |`)
  .join("\n")}

## B-Roll & SFX
${pack.brollAndSfx.map((item) => `- ${item}`).join("\n")}
`;
}

export function exportTeleprompter(pack: ProductionPack | null) {
  if (!pack) {
    return "";
  }

  return pack.storyboard.map((block) => block.script).join("\n\n");
}

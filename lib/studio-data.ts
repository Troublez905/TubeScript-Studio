import type { Angle, ProductionPack, ProjectInput, VideoMode } from "@/lib/types";

const angleTypes = [
  "Myth-Buster",
  "Beginner Quick-Start",
  "Stress Test",
  "Action Checklist",
  "Trend Forecast"
];

const formatLabel: Record<VideoMode, string> = {
  short: "Shorts 9:16",
  long: "Full Video 16:9"
};

export function effectiveNiche(input: ProjectInput) {
  return input.customNiche?.trim() || input.niche || "Tech & Reviews";
}

export function buildFallbackAngles(input: ProjectInput): Angle[] {
  const niche = effectiveNiche(input);
  const seed = input.topic?.trim() || `a fresh ${niche} creator topic`;
  const prefersShort = input.mode === "short";

  return angleTypes.map((type, index) => ({
    id: `${type.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index + 1}`,
    type,
    title: [
      `The ${type === "Myth-Buster" ? "Biggest Lie" : "Fastest Win"} About ${seed}`,
      `${seed}: The 60-Second Creator Breakdown`,
      `I Tested ${seed} So You Do Not Waste Time`,
      `Do These 5 Things Before You Try ${seed}`,
      `Why ${seed} Will Matter More This Year`
    ][index],
    hook: [
      `Most people explain ${seed} backwards. Start with this instead.`,
      `Here is the plain-English version of ${seed} without the filler.`,
      `I pushed ${seed} through the real-world test creators actually care about.`,
      `Pause before you copy the trend. These checks save the project.`,
      `The signal is quiet now, but ${niche} creators should watch this shift.`
    ][index],
    value: [
      "Debunks a common mistake and replaces it with a practical rule.",
      "Gives new viewers a confident path from confusion to action.",
      "Turns comparison drama into useful buying or workflow advice.",
      "Packages the topic as a repeatable checklist viewers can save.",
      "Frames the topic as a forward-looking opportunity."
    ][index],
    recommendedFormat: prefersShort || index === 1 ? "short" : "long"
  }));
}

export function buildFallbackProductionPack(angle: Angle, input: ProjectInput): ProductionPack {
  const mode = input.mode || angle.recommendedFormat;
  const niche = effectiveNiche(input);
  const title = angle.title;
  const shortBlocks = [
    ["00:00 - 00:03", "Open on the final visual result with a punch-in zoom and centered caption.", angle.hook, "Host on camera", "Frame-one payoff and conflict."],
    ["00:03 - 00:12", "Cut to screen recording or object close-up with one red callout box.", `The reason this matters is simple: ${angle.value.toLowerCase()}`, "Voiceover over clip", "Fast context without intro fluff."],
    ["00:12 - 00:28", "Show two rapid examples, each with a 2-word overlay in the safe center.", `First, look for the obvious signal. Then compare it against the thing most creators miss in ${niche}.`, "Voiceover over B-roll", "Visual refresh every few seconds."],
    ["00:28 - 00:42", "Return to host, then snap to checklist overlay with three ticks.", "Use this rule: if the idea cannot be shown on screen in five seconds, simplify the angle before recording.", "Host plus overlay", "Actionable retention payoff."],
    ["00:42 - 00:45", "End on the first-frame visual again, paused mid-motion.", "...and that is why the smartest version starts with", "Loop setup", "Ending flows into the opening line."]
  ];
  const longBlocks = [
    ["00:00 - 01:00", "Cold open with the strongest proof shot, then host frames the promise.", `Today we are breaking down ${title}. By the end, you will know what matters, what is hype, and what to do next.`, "Host on camera", "Clear promise before context."],
    ["01:00 - 02:30", "Timeline graphic and 3 key terms on screen.", `The background is important because ${angle.value.toLowerCase()} We will keep this practical and skip the theory that does not change your decision.`, "Voiceover over graphics", "Build trust with useful context."],
    ["02:30 - 05:00", "Screen recording, product shots, or example clips arranged as a comparison.", "Here is the real test: does this help the viewer make a better choice, faster? Watch how each option performs when the pressure is real.", "Voiceover over examples", "Demonstration carries the middle."],
    ["05:00 - 07:30", "Host reacts to the result, then shows a saveable checklist.", "The takeaway is not just what won. It is the decision rule you can reuse the next time this topic comes up.", "Host on camera", "Reframes details into repeatable value."],
    ["07:30 - 09:00", "End card with next-video teaser and pinned-comment prompt.", "If you want the deeper test, I will put the sources and the checklist in the description. The next video should compare the riskiest edge case.", "Host on camera", "Soft CTA tied to value."]
  ];
  const rows = (mode === "short" ? shortBlocks : longBlocks).map(
    ([timestamp, visual, script, voiceoverCue, retentionNote]) => ({
      timestamp,
      visual,
      script,
      voiceoverCue,
      retentionNote
    })
  );

  return {
    research: {
      coreKnowledge: [
        `Verify all claims about ${title} against current primary or trusted sources before recording.`,
        `Keep the creator promise narrow: one clear decision, workflow, or misconception per video.`,
        `Use 130-150 spoken words per minute for comfortable pacing.`,
        mode === "short"
          ? "Open with the result or conflict in the first second; avoid greetings and channel intros."
          : "Give the viewer a reason to stay before introducing background context."
      ],
      references: [
        { label: "Primary source search", query: `${title} official documentation latest` },
        { label: "Competitor video scan", query: `${title} YouTube comparison review tutorial` },
        { label: "Fact-check pass", query: `${title} best practices risks mistakes` }
      ],
      mediaIdeas: [
        "Host close-up with strong eye-line and quick push-in for the hook.",
        "Screen recording with zoom crops, cursor emphasis, and highlighted settings.",
        "B-roll of workspace setup, device hands, timeline graphics, and checklist overlays."
      ]
    },
    storyboard: rows,
    safeZoneGuide: [
      "Keep faces, primary text, and key props inside the middle 60% of vertical Shorts frames.",
      "Avoid right-side action-button space and the lower native caption/title zone.",
      "Use 2-4 words per caption beat for Shorts; use lower thirds sparingly for long-form."
    ],
    brollAndSfx: [
      "Soft whoosh on angle changes.",
      "Click or tap SFX on checklist reveals.",
      "Low glitch hit for myth-buster or threat-breakdown moments.",
      `Search footage prompts: ${niche} creator desk, screen recording workflow, close-up hands with device.`
    ]
  };
}

export function wordsAndMinutes(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return {
    words,
    minutesLow: Number((words / 150).toFixed(1)),
    minutesHigh: Number((words / 130).toFixed(1))
  };
}

export { formatLabel };

export type VideoMode = "short" | "long";

export type Angle = {
  id: string;
  type: string;
  title: string;
  hook: string;
  value: string;
  recommendedFormat: VideoMode;
};

export type ResearchPack = {
  coreKnowledge: string[];
  references: {
    label: string;
    query: string;
  }[];
  mediaIdeas: string[];
};

export type StoryboardBlock = {
  timestamp: string;
  visual: string;
  script: string;
  voiceoverCue: string;
  retentionNote: string;
};

export type ProductionPack = {
  research: ResearchPack;
  storyboard: StoryboardBlock[];
  safeZoneGuide: string[];
  brollAndSfx: string[];
};

export type ProjectInput = {
  mode: VideoMode;
  niche: string;
  customNiche?: string;
  topic?: string;
};

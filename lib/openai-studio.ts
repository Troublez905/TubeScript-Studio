import OpenAI from "openai";
import { buildFallbackAngles, buildFallbackProductionPack, effectiveNiche } from "@/lib/studio-data";
import type { Angle, ProductionPack, ProjectInput } from "@/lib/types";

const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

function parseJsonObject<T>(content: string): T {
  const trimmed = content.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("OpenAI response did not include a JSON object.");
  }

  return JSON.parse(trimmed.slice(start, end + 1)) as T;
}

function validateAngles(value: unknown): Angle[] {
  if (!value || typeof value !== "object" || !Array.isArray((value as { angles?: unknown }).angles)) {
    throw new Error("Angle response is missing angles.");
  }

  const angles = (value as { angles: Angle[] }).angles;
  if (angles.length !== 5) {
    throw new Error("Angle response must include exactly five angles.");
  }

  return angles.map((angle, index) => ({
    id: String(angle.id || `${angle.type}-${index + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    type: String(angle.type),
    title: String(angle.title),
    hook: String(angle.hook),
    value: String(angle.value),
    recommendedFormat: angle.recommendedFormat === "long" ? "long" : "short"
  }));
}

function validateProduction(value: unknown): ProductionPack {
  const pack = (value as { production?: ProductionPack })?.production;
  if (!pack?.research || !Array.isArray(pack.storyboard)) {
    throw new Error("Production response is missing required sections.");
  }

  return {
    research: {
      coreKnowledge: pack.research.coreKnowledge?.map(String).slice(0, 5) ?? [],
      references:
        pack.research.references?.map((reference) => ({
          label: String(reference.label),
          query: String(reference.query)
        })) ?? [],
      mediaIdeas: pack.research.mediaIdeas?.map(String) ?? []
    },
    storyboard: pack.storyboard.map((block) => ({
      timestamp: String(block.timestamp),
      visual: String(block.visual),
      script: String(block.script),
      voiceoverCue: String(block.voiceoverCue),
      retentionNote: String(block.retentionNote)
    })),
    safeZoneGuide: pack.safeZoneGuide?.map(String) ?? [],
    brollAndSfx: pack.brollAndSfx?.map(String) ?? []
  };
}

export async function generateAngles(input: ProjectInput): Promise<{ angles: Angle[]; source: "openai" | "fallback"; warning?: string }> {
  const client = getClient();
  if (!client) {
    return { angles: buildFallbackAngles(input), source: "fallback" };
  }

  try {
    const niche = effectiveNiche(input);
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.85,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You generate production-ready YouTube video angles. Return only valid JSON with an angles array of exactly 5 objects. Each object must have id, type, title, hook, value, recommendedFormat. recommendedFormat must be short or long."
        },
        {
          role: "user",
          content: JSON.stringify({
            app: "TubeScript Studio",
            mode: input.mode,
            niche,
            topic: input.topic || "Surprise me with a strong topic for this niche.",
            requiredAngleTypes: [
              "Myth-Buster / Threat Breakdown",
              "Beginner Quick-Start",
              "Deep-Dive / Comparison",
              "Actionable Checklist / Tutorial",
              "Unpopular Opinion / Trend Forecast"
            ],
            instructions: [
              "Write hooks that feel native to YouTube creators, not generic marketing copy.",
              "For Shorts, include a 3-second hook synopsis that avoids intro fluff.",
              "Use practical, accurate wording for tech, cybersecurity, software, and creator workflows."
            ]
          })
        }
      ]
    });

    const content = completion.choices[0]?.message.content;
    if (!content) {
      throw new Error("OpenAI returned an empty angle response.");
    }

    return { angles: validateAngles(parseJsonObject(content)), source: "openai" };
  } catch (error) {
    return {
      angles: buildFallbackAngles(input),
      source: "fallback",
      warning: error instanceof Error ? error.message : "OpenAI generation failed."
    };
  }
}

export async function generateProductionPack(
  angle: Angle,
  input: ProjectInput
): Promise<{ production: ProductionPack; source: "openai" | "fallback"; warning?: string }> {
  const client = getClient();
  if (!client) {
    return { production: buildFallbackProductionPack(angle, input), source: "fallback" };
  }

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.72,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are TubeScript Studio's YouTube production engine. Return only valid JSON with a production object. Include research.coreKnowledge, research.references, research.mediaIdeas, storyboard, safeZoneGuide, and brollAndSfx. Storyboard blocks require timestamp, visual, script, voiceoverCue, retentionNote."
        },
        {
          role: "user",
          content: JSON.stringify({
            selectedAngle: angle,
            input,
            skillBehaviors: [
              "Use the youtube-video-studio workflow: background facts, references, B-roll, and timestamped visual/audio storyboard.",
              "Use the youtube-shorts-retention-engineer workflow for Shorts: 1-second rule, visual refresh every 2.5-4 seconds, safe-zone captions, seamless loop ending.",
              "For long-form videos, create a minute-by-minute or section-by-section outline with word-for-word spoken script."
            ],
            constraints: [
              "Keep claims grounded and include reference search queries for verification.",
              "Keep spoken pacing around 130-150 words per minute.",
              "Use concrete visual direction: camera, B-roll, overlays, SFX, screen recordings, and voiceover cues."
            ]
          })
        }
      ]
    });

    const content = completion.choices[0]?.message.content;
    if (!content) {
      throw new Error("OpenAI returned an empty storyboard response.");
    }

    return { production: validateProduction(parseJsonObject(content)), source: "openai" };
  } catch (error) {
    return {
      production: buildFallbackProductionPack(angle, input),
      source: "fallback",
      warning: error instanceof Error ? error.message : "OpenAI generation failed."
    };
  }
}

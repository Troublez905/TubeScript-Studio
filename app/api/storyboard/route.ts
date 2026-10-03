import { NextResponse } from "next/server";
import { generateProductionPack } from "@/lib/openai-studio";
import type { Angle, ProjectInput } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as { angle: Angle; input: ProjectInput };

  if (!body.angle || !body.input) {
    return NextResponse.json({ error: "Missing selected angle or project input." }, { status: 400 });
  }

  return NextResponse.json(await generateProductionPack(body.angle, body.input));
}

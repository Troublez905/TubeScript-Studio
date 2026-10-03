import { NextResponse } from "next/server";
import { generateAngles } from "@/lib/openai-studio";
import type { ProjectInput } from "@/lib/types";

export async function POST(request: Request) {
  const input = (await request.json()) as ProjectInput;

  return NextResponse.json(await generateAngles(input));
}

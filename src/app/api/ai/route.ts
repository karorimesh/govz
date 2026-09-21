import { NextResponse } from "next/server";
import { generateFoundryAgentResponse } from "@/lib/foundry";

export async function POST(request: Request) {
  console.info(request)
  const body = (await request.json().catch(() => null)) as {
    prompt?: unknown;
  } | null;

  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";

  if (prompt.length < 3) {
    return NextResponse.json(
      { error: "Enter a longer request for the assistant." },
      { status: 400 },
    );
  }

  try {
    const answer = await generateFoundryAgentResponse(prompt.slice(0, 2000));

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("[api/ai] response error", error);

    return NextResponse.json(
      { error: "The AI assistant is unavailable right now." },
      { status: 500 },
    );
  }
}

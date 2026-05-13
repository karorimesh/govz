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

  if (
    !process.env.AZURE_FOUNDRY_PROJECT_ENDPOINT ||
    !process.env.AZURE_FOUNDRY_AGENT_NAME
  ) {
    return NextResponse.json(
      { error: "Azure Foundry agent is not configured." },
      { status: 503 },
    );
  }

  try {
    const answer = await generateFoundryAgentResponse(prompt.slice(0, 2000));

    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json(
      { error: "The Azure Foundry assistant is unavailable right now." },
      { status: 500 },
    );
  }
}

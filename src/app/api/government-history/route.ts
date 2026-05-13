import { NextResponse } from "next/server";
import { generateFoundryAgentResponse } from "@/lib/foundry";
import {
  buildPositionHistoryPrompt,
  parsePositionHistory,
  type PositionNode,
} from "@/lib/prompts/government-structure";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    selectedCountry?: unknown;
    selectedLanguage?: unknown;
    position?: unknown;
  } | null;

  const selectedCountry =
    typeof body?.selectedCountry === "string"
      ? body.selectedCountry.trim()
      : "";
  const selectedLanguage =
    typeof body?.selectedLanguage === "string"
      ? body.selectedLanguage.trim()
      : "";

  if (!selectedCountry || !selectedLanguage || !isPosition(body?.position)) {
    return NextResponse.json(
      { error: "Country, language, and position are required." },
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
    const prompt = buildPositionHistoryPrompt({
      selectedCountry,
      selectedLanguage,
      position: body.position,
    });
    const output = await generateFoundryAgentResponse(prompt);
    const history = parsePositionHistory(output);

    return NextResponse.json({ history });
  } catch (error) {
    console.error("[api/government-history] response error", error);

    return NextResponse.json(
      { error: "Unable to load position history right now." },
      { status: 500 },
    );
  }
}

function isPosition(value: unknown): value is PositionNode {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as Record<string, unknown>).id === "string" &&
    typeof (value as Record<string, unknown>).title === "string" &&
    typeof (value as Record<string, unknown>).description === "string"
  );
}

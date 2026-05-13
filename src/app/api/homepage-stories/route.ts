import { NextResponse } from "next/server";
import { generateFoundryAgentResponse } from "@/lib/foundry";
import {
  buildHomepageGovernanceNewsPrompt,
  parseHomepageStories,
} from "@/lib/prompts/homepage";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    selectedCountry?: unknown;
    selectedLanguage?: unknown;
  } | null;

  const selectedCountry =
    typeof body?.selectedCountry === "string"
      ? body.selectedCountry.trim()
      : "";
  const selectedLanguage =
    typeof body?.selectedLanguage === "string"
      ? body.selectedLanguage.trim()
      : "";

  if (!selectedCountry || !selectedLanguage) {
    return NextResponse.json(
      { error: "Country and language are required." },
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
    const prompt = buildHomepageGovernanceNewsPrompt({
      selectedCountry,
      selectedLanguage,
    });
    const output = await generateFoundryAgentResponse(prompt);
    const stories = parseHomepageStories(output);

    return NextResponse.json({ stories });
  } catch {
    return NextResponse.json(
      { error: "Unable to load governance stories right now." },
      { status: 500 },
    );
  }
}

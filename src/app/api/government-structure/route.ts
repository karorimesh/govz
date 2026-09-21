import { NextResponse } from "next/server";
import { generateFoundryAgentResponse } from "@/lib/foundry";
import {
  buildGovernmentHierarchyPrompt,
  parseGovernmentHierarchy,
} from "@/lib/prompts/government-structure";

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

  try {
    const prompt = buildGovernmentHierarchyPrompt({
      selectedCountry,
      selectedLanguage,
    });
    const output = await generateFoundryAgentResponse(prompt);
    const nodes = parseGovernmentHierarchy(output);

    return NextResponse.json({ nodes });
  } catch (error) {
    console.error("[api/government-structure] response error", error);

    return NextResponse.json(
      { error: "Unable to load government structure right now." },
      { status: 500 },
    );
  }
}

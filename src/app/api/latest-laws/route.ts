import { NextResponse } from "next/server";
import { generateFoundryAgentResponse } from "@/lib/foundry";
import { buildLatestLawsPrompt, parseLatestLaws } from "@/lib/prompts/law";

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

  console.log("[api/latest-laws] request", {
    selectedCountry,
    selectedLanguage,
  });

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
    const prompt = buildLatestLawsPrompt({ selectedCountry, selectedLanguage });
    console.log("[api/latest-laws] foundry request", {
      selectedCountry,
      selectedLanguage,
      promptLength: prompt.length,
    });

    const output = await generateFoundryAgentResponse(prompt);
    console.log("[api/latest-laws] foundry raw response", output);

    const laws = parseLatestLaws(output);
    console.log("[api/latest-laws] response", {
      status: 200,
      lawCount: laws.length,
      laws,
    });

    return NextResponse.json({ laws });
  } catch (error) {
    console.error("[api/latest-laws] response error", error);

    return NextResponse.json(
      { error: "Unable to load latest laws right now." },
      { status: 500 },
    );
  }
}

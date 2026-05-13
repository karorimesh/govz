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

  console.log("[api/homepage-stories] request made", {
    selectedCountry,
    selectedLanguage,
  });

  if (!selectedCountry || !selectedLanguage) {
    console.log("[api/homepage-stories] response", {
      status: 400,
      error: "Country and language are required.",
    });

    return NextResponse.json(
      { error: "Country and language are required." },
      { status: 400 },
    );
  }

  if (
    !process.env.AZURE_FOUNDRY_PROJECT_ENDPOINT ||
    !process.env.AZURE_FOUNDRY_AGENT_NAME
  ) {
    console.log("[api/homepage-stories] response", {
      status: 503,
      error: "Azure Foundry agent is not configured.",
    });

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
    console.log("[api/homepage-stories] foundry request made", {
      selectedCountry,
      selectedLanguage,
      promptLength: prompt.length,
    });

    const output = await generateFoundryAgentResponse(prompt);
    console.log("[api/homepage-stories] foundry raw response", output);

    const stories = parseHomepageStories(output);
    console.log("[api/homepage-stories] response", {
      status: 200,
      storyCount: stories.length,
      stories,
    });

    return NextResponse.json({ stories });
  } catch (error) {
    console.error("[api/homepage-stories] response error", error);

    return NextResponse.json(
      { error: "Unable to load governance stories right now." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { generateFoundryAgentResponse } from "@/lib/foundry";
import { buildLawChatPrompt } from "@/lib/prompts/law";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    selectedCountry?: unknown;
    selectedLanguage?: unknown;
    userQuestion?: unknown;
  } | null;

  const selectedCountry =
    typeof body?.selectedCountry === "string"
      ? body.selectedCountry.trim()
      : "";
  const selectedLanguage =
    typeof body?.selectedLanguage === "string"
      ? body.selectedLanguage.trim()
      : "";
  const userQuestion =
    typeof body?.userQuestion === "string" ? body.userQuestion.trim() : "";

  if (!selectedCountry || !selectedLanguage) {
    return NextResponse.json(
      { error: "Country and language are required." },
      { status: 400 },
    );
  }

  if (userQuestion.length < 3) {
    return NextResponse.json(
      { error: "Enter a longer legal question." },
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
    const prompt = buildLawChatPrompt({
      selectedCountry,
      selectedLanguage,
      userQuestion: userQuestion.slice(0, 2000),
    });
    const answer = await generateFoundryAgentResponse(prompt);

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("[api/law-chat] response error", error);

    return NextResponse.json(
      { error: "The GOVZ legal assistant is unavailable right now." },
      { status: 500 },
    );
  }
}

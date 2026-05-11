import { NextResponse } from "next/server";
import { createOpenAIClient } from "@/lib/openai";

export async function POST(request: Request) {
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

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 503 },
    );
  }

  try {
    const client = createOpenAIClient();
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are GOVZ, a concise civic services assistant. Provide practical, plain-language guidance for government service staff.",
        },
        {
          role: "user",
          content: prompt.slice(0, 2000),
        },
      ],
    });

    return NextResponse.json({ answer: response.output_text });
  } catch {
    return NextResponse.json(
      { error: "The assistant is unavailable right now." },
      { status: 500 },
    );
  }
}

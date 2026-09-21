import { getBackendUrl } from "@/lib/backend";

export async function generateFoundryAgentResponse(prompt: string) {
  const backendUrl = getBackendUrl("/api/ai/text");

  console.log("[foundry] sending prompt to backend", {
    backendUrl,
    promptLength: prompt.length,
  });

  const response = await fetch(backendUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    console.error("[foundry] backend request failed", {
      status: response.status,
    });
    throw new Error(`AI backend request failed with status ${response.status}`);
  }

  const data = (await response.json().catch(() => null)) as {
    response?: unknown;
  } | null;

  if (typeof data?.response !== "string") {
    console.error("[foundry] backend response missing 'response' field");
    throw new Error("AI backend returned an unexpected response shape.");
  }

  console.log("[foundry] response received", {
    outputLength: data.response.length,
  });

  return data.response;
}

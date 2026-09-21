import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend";
import {
  getMessageRecords,
  isHelpLineMessageInput,
  isMessageStatus,
  normalizeHelpLineMessage,
} from "@/lib/helpline-messages-server";

const upstreamUrl = getBackendUrl("/api/helpline-messages");

export async function GET(request: Request) {
  try {
    const response = await fetch(upstreamUrl, { cache: "no-store" });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return upstreamError(response.status);
    }

    const records = getMessageRecords(payload);
    if (!records) {
      return NextResponse.json({ error: "Help Line backend returned invalid data." }, { status: 502 });
    }

    const country = new URL(request.url).searchParams.get("country")?.trim() ?? "";
    const messages = records
      .map(normalizeHelpLineMessage)
      .filter((message): message is NonNullable<typeof message> => Boolean(message))
      .filter(
        (message) =>
          !country || message.country.localeCompare(country, undefined, { sensitivity: "accent" }) === 0,
      );

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("[api/helpline-messages] list failed", error);
    return NextResponse.json({ error: "Unable to load Help Line messages right now." }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const message = await request.json().catch(() => null);

  if (!isHelpLineMessageInput(message)) {
    return NextResponse.json({ error: "Enter all required Help Line message details." }, { status: 400 });
  }

  try {
    const response = await fetch(upstreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return upstreamError(response.status);
    }

    const savedMessage = normalizeHelpLineMessage(payload);
    if (!savedMessage) {
      return NextResponse.json({ error: "Help Line backend returned invalid data." }, { status: 502 });
    }

    return NextResponse.json({ message: savedMessage }, { status: 201 });
  } catch (error) {
    console.error("[api/helpline-messages] create failed", error);
    return NextResponse.json({ error: "Unable to submit Help Line message right now." }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as { id?: unknown; status?: unknown } | null;
  const id = typeof body?.id === "string" ? body.id.trim() : "";

  if (!id || !isMessageStatus(body?.status)) {
    return NextResponse.json({ error: "A message ID and valid status are required." }, { status: 400 });
  }

  try {
    const response = await fetch(upstreamUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: body.status }),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return upstreamError(response.status);
    }

    const updatedMessage = normalizeHelpLineMessage(payload);
    if (!updatedMessage) {
      return NextResponse.json({ error: "Help Line backend returned invalid data." }, { status: 502 });
    }

    return NextResponse.json({ message: updatedMessage });
  } catch (error) {
    console.error("[api/helpline-messages] status update failed", error);
    return NextResponse.json({ error: "Unable to update Help Line message right now." }, { status: 502 });
  }
}

function upstreamError(status: number) {
  return NextResponse.json(
    { error: "Help Line backend request failed." },
    { status: status >= 400 && status < 500 ? status : 502 },
  );
}
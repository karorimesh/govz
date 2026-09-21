import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const messageId = id.trim();

  if (!messageId) {
    return NextResponse.json({ error: "A message ID is required." }, { status: 400 });
  }

  try {
    const response = await fetch(
      getBackendUrl(`/api/helpline-messages/${encodeURIComponent(messageId)}`),
      { method: "DELETE" },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Help Line backend request failed." },
        { status: response.status >= 400 && response.status < 500 ? response.status : 502 },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[api/helpline-messages] delete failed", error);
    return NextResponse.json({ error: "Unable to delete Help Line message right now." }, { status: 502 });
  }
}
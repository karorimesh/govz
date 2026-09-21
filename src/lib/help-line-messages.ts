import type {
  HelpLineMessage,
  HelpLineMessageInput,
  MessageStatus,
} from "@/lib/firebase/help-line";

export async function listHelpLineMessages(country: string) {
  const response = await fetch(`/api/helpline-messages?${new URLSearchParams({ country })}`);
  const payload = await response.json().catch(() => null) as { messages?: unknown; error?: unknown } | null;

  if (!response.ok || !Array.isArray(payload?.messages)) {
    throw new Error(getErrorMessage(payload?.error, "Unable to load Help Line messages right now."));
  }

  return payload.messages as HelpLineMessage[];
}

export async function createHelpLineMessage(message: HelpLineMessageInput) {
  const response = await fetch("/api/helpline-messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
  const payload = await response.json().catch(() => null) as { message?: unknown; error?: unknown } | null;

  if (!response.ok || !payload?.message) {
    throw new Error(getErrorMessage(payload?.error, "Unable to submit Help Line message right now."));
  }

  return payload.message as HelpLineMessage;
}

export async function updateHelpLineMessageStatus(id: string, status: MessageStatus) {
  const response = await fetch("/api/helpline-messages", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
  const payload = await response.json().catch(() => null) as { message?: unknown; error?: unknown } | null;

  if (!response.ok || !payload?.message) {
    throw new Error(getErrorMessage(payload?.error, "Unable to update Help Line message right now."));
  }

  return payload.message as HelpLineMessage;
}

export async function deleteHelpLineMessage(id: string) {
  const response = await fetch(`/api/helpline-messages/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: unknown } | null;
    throw new Error(getErrorMessage(payload?.error, "Unable to delete Help Line message right now."));
  }
}

function getErrorMessage(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}
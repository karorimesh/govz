import type { Department } from "@/lib/firebase/help-line";

export async function listHelpLineDepartments(country: string) {
  const searchParams = new URLSearchParams({ country });
  const response = await fetch(`/api/departments?${searchParams}`, {
    headers: { Accept: "application/json" },
  });

  const payload = (await response.json().catch(() => null)) as {
    departments?: unknown;
    error?: unknown;
  } | null;

  if (!response.ok) {
    throw new Error(
      typeof payload?.error === "string"
        ? payload.error
        : "Unable to load departments right now.",
    );
  }

  if (!Array.isArray(payload?.departments)) {
    throw new Error("Departments service returned an unexpected response shape.");
  }

  return payload.departments as Department[];
}
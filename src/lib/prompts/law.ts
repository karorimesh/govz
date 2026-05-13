export type Law = {
  title: string;
  summary: string;
  dates: string;
};

export function buildLatestLawsPrompt({
  selectedCountry,
  selectedLanguage,
}: {
  selectedCountry: string;
  selectedLanguage: string;
}) {
  return `You are GOVZ, a civic legal information assistant.

Search for the 5 latest laws, bills, regulations, legal directives, constitutional amendments, or major legal implementation updates that the government of ${selectedCountry} has implemented or is currently implementing.

Return the response in ${selectedLanguage}.

Do not include commentary, markdown, citations outside the schema, or extra fields. Return only valid JSON.

The JSON response must be an array of exactly 5 objects using this schema:
[
  {
    "title": "string",
    "summary": "string",
    "dates": "string"
  }
]

Response constraints:
- Return exactly 5 latest legal items when reliable information is available.
- Results must be specific to ${selectedCountry}.
- Output text must be in ${selectedLanguage}.
- summary must be about 50 words.
- dates should include the implementation date, enactment date, parliamentary date, public consultation period, or relevant date range.
- Prefer official government, parliament, judiciary, regulator, or reputable public-interest sources.
- Do not invent laws, dates, or implementation status.
- If fewer than 5 reliable legal items are available, return as many reliable items as possible and do not fabricate entries.`;
}

export function buildLawChatPrompt({
  selectedCountry,
  selectedLanguage,
  userQuestion,
}: {
  selectedCountry: string;
  selectedLanguage: string;
  userQuestion: string;
}) {
  return `You are GOVZ, a plain-language civic legal information assistant for ${selectedCountry}.

The user asks:

${userQuestion}

Answer in ${selectedLanguage}.

The user may ask about any law, bill, right, obligation, public office power, government procedure, implementation timeline, or constitutional matter in ${selectedCountry}.

Response constraints:
- Provide practical, plain-language legal information, not legal representation.
- If the question relates to the constitution, explain the relevant constitutional principle or article if known.
- If the answer depends on jurisdiction, date, or official interpretation, say so clearly.
- Do not invent article numbers, case names, laws, dates, or procedures.
- If unsure, explain what official source the user should check.
- Keep the response concise but useful.
- Do not translate proper nouns or law names unless they have a common official translation.`;
}

export function parseLatestLaws(output: string): Law[] {
  const jsonText = extractJson(output);
  const parsed = JSON.parse(jsonText) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("Latest laws response must be an array.");
  }

  return parsed
    .map((item) => normalizeLaw(item))
    .filter((law): law is Law => Boolean(law));
}

function extractJson(output: string) {
  const trimmed = output.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const arrayStart = trimmed.indexOf("[");
  const arrayEnd = trimmed.lastIndexOf("]");

  if (arrayStart >= 0 && arrayEnd > arrayStart) {
    return trimmed.slice(arrayStart, arrayEnd + 1);
  }

  return trimmed;
}

function normalizeLaw(item: unknown) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const record = item as Record<string, unknown>;
  const title = toStringValue(record.title);
  const summary = toStringValue(record.summary);
  const dates = toStringValue(record.dates);

  if (!title || !summary || !dates) {
    return null;
  }

  return {
    title,
    summary,
    dates,
  };
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export type HomepageStory = {
  title: string;
  imgLink: string;
  summary: string;
  author: string;
  link: string;
};

export function buildHomepageGovernanceNewsPrompt({
  selectedCountry,
  selectedLanguage,
}: {
  selectedCountry: string;
  selectedLanguage: string;
}) {
  return `You are GOVZ, a civic governance news assistant.

Search for the 5 latest news stories about governance in ${selectedCountry}.

Governance news includes public administration, parliament, courts, elections, public finance, government services, policy implementation, public accountability, regulation, public appointments, corruption investigations, public participation, public safety, and national or local government decisions.

Return the response in ${selectedLanguage}.

Do not include commentary, markdown, citations outside the schema, or extra fields. Return only valid JSON.

The JSON response must be an array of exactly 5 objects using this schema:
[
  {
    "title": "string",
    "imgLink": "string",
    "summary": "string",
    "author": "string",
    "link": "string"
  }
]

Response constraints:
- Return exactly 5 latest governance-related stories.
- Results must be specific to ${selectedCountry}.
- Output text must be in ${selectedLanguage}.
- summary must be no more than 200 words.
- imgLink should be a direct image URL when available; otherwise use an empty string.
- author should be the journalist, agency, publication, or official source when available.
- link must be the source URL for the story.
- Do not translate proper nouns, publication names, or source names unless they have a common official translation.
- Do not invent source links.
- If fewer than 5 reliable stories are available, return as many reliable stories as possible and do not fabricate entries.`;
}

export function parseHomepageStories(output: string): HomepageStory[] {
  const jsonText = extractJson(output);
  const parsed = JSON.parse(jsonText) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("Homepage stories response must be an array.");
  }

  return parsed
    .map((item) => normalizeStory(item))
    .filter((story): story is HomepageStory => Boolean(story));
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

function normalizeStory(item: unknown) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const record = item as Record<string, unknown>;
  const title = toStringValue(record.title);
  const summary = toStringValue(record.summary);
  const author = toStringValue(record.author);
  const link = toStringValue(record.link);

  if (!title || !summary || !author || !link) {
    return null;
  }

  return {
    title,
    imgLink: toStringValue(record.imgLink),
    summary,
    author,
    link,
  };
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

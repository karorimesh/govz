export type OfficeType =
  | "executive"
  | "legislative"
  | "judiciary"
  | "independent_office"
  | "ministry"
  | "department"
  | "county"
  | "local_office";

export type AppointmentMethod =
  | "elected"
  | "appointed"
  | "nominated"
  | "career_service";

export type HolderStatus = "current" | "former";

export type PositionHolder = {
  id: string;
  name: string;
  title: string;
  imageUrl?: string;
  servedFrom: string;
  servedTo?: string;
  status: HolderStatus;
  personalSummary: string;
  details: {
    dateOfBirth?: string;
    education?: string;
    profession?: string;
    politicalAffiliation?: string;
    homeRegion?: string;
  };
  latestNews: Array<{
    title: string;
    source: string;
    date: string;
    link: string;
  }>;
  merits: string[];
  demerits: string[];
};

export type PositionNode = {
  id: string;
  title: string;
  description: string;
  icon: string;
  level: number;
  parentId?: string;
  officeType: OfficeType;
  currentHolderId?: string;
  currentHolderName?: string;
  location?: string;
  termLength?: string;
  appointmentMethod?: AppointmentMethod;
  responsibilities: string[];
  history: PositionHolder[];
  children?: PositionNode[];
};

const officeTypes = [
  "executive",
  "legislative",
  "judiciary",
  "independent_office",
  "ministry",
  "department",
  "county",
  "local_office",
];

const appointmentMethods = [
  "elected",
  "appointed",
  "nominated",
  "career_service",
];

const holderStatuses = ["current", "former"];

export function buildGovernmentHierarchyPrompt({
  selectedCountry,
  selectedLanguage,
}: {
  selectedCountry: string;
  selectedLanguage: string;
}) {
  return `You are GOVZ, a civic government structure assistant.

Search for the current government hierarchy in ${selectedCountry}, starting from the top-most national government position and expanding up to 5 levels deep.

Return the response in ${selectedLanguage}.

Do not include commentary, markdown, citations outside the schema, or extra fields. Return only valid JSON.

The JSON response must be an array of position nodes using this schema:
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "icon": "landmark | shield | gavel | scale | badge | briefcase | building",
    "level": 1,
    "parentId": "string",
    "officeType": "executive | legislative | judiciary | independent_office | ministry | department | county | local_office",
    "currentHolderId": "string",
    "currentHolderName": "string",
    "location": "string",
    "termLength": "string",
    "appointmentMethod": "elected | appointed | nominated | career_service",
    "responsibilities": [],
    "history": [],
    "children": []
  }
]

Response constraints:
- Start with the top-most government position in ${selectedCountry}.
- Return no more than 5 visible hierarchy levels.
- Results must be specific to ${selectedCountry}.
- Output text must be in ${selectedLanguage}.
- description must be about 10 words.
- Use stable lowercase ids with hyphens.
- Set responsibilities to an empty array because responsibilities are fetched separately.
- Set history to an empty array because holder history is fetched separately.
- currentHolderName may be omitted if it cannot be verified.
- Prefer official government, parliament, judiciary, constitutional, or public service sources.
- Do not invent offices, holders, reporting lines, term lengths, or appointment methods.`;
}

export function buildPositionResponsibilitiesPrompt({
  selectedCountry,
  selectedLanguage,
  position,
}: {
  selectedCountry: string;
  selectedLanguage: string;
  position: PositionPromptInput;
}) {
  return `You are GOVZ, a civic government structure assistant.

Search for the official responsibilities of this government position in ${selectedCountry}.

Position:
${JSON.stringify(position, null, 2)}

Return the response in ${selectedLanguage}.

Do not include commentary, markdown, citations outside the schema, or extra fields. Return only valid JSON.

The JSON response must use this schema:
{
  "responsibilities": ["string"]
}

Response constraints:
- Results must be specific to the position and ${selectedCountry}.
- Include practical responsibilities, powers, duties, and public service obligations.
- Prefer official constitutional, statutory, government, parliament, judiciary, ministry, regulator, or public service sources.
- Do not invent duties or powers.
- Return 3 to 8 concise responsibility items when reliable information is available.`;
}

export function buildPositionHistoryPrompt({
  selectedCountry,
  selectedLanguage,
  position,
}: {
  selectedCountry: string;
  selectedLanguage: string;
  position: PositionPromptInput;
}) {
  return `You are GOVZ, a civic government structure assistant.

Search for the current and recent historical office holders for this government position in ${selectedCountry}.

Position:
${JSON.stringify(position, null, 2)}

Return the response in ${selectedLanguage}.

Do not include commentary, markdown, citations outside the schema, or extra fields. Return only valid JSON.

The JSON response must be an array using this schema:
[
  {
    "id": "string",
    "name": "string",
    "title": "string",
    "imageUrl": "string",
    "servedFrom": "string",
    "servedTo": "string",
    "status": "current | former",
    "personalSummary": "string",
    "details": {
      "dateOfBirth": "string",
      "education": "string",
      "profession": "string",
      "politicalAffiliation": "string",
      "homeRegion": "string"
    },
    "latestNews": [
      {
        "title": "string",
        "source": "string",
        "date": "string",
        "link": "string"
      }
    ],
    "merits": ["string"],
    "demerits": ["string"]
  }
]

Response constraints:
- Results must be specific to the position and ${selectedCountry}.
- Include the current holder first when reliable information is available.
- Include recent former holders when reliable information is available.
- latestNews links must be real source URLs.
- merits and demerits must be factual, concise, and based on public record.
- If a claim is disputed or not well sourced, omit it.
- Do not invent people, dates, biography, news links, merits, or demerits.`;
}

type PositionPromptInput = {
  id: string;
  title: string;
  description: string;
  officeType: OfficeType;
  level: number;
  parentId?: string;
  location?: string;
  termLength?: string;
  appointmentMethod?: AppointmentMethod;
  currentHolderId?: string;
  currentHolderName?: string;
};

export function parseGovernmentHierarchy(output: string): PositionNode[] {
  const parsed = JSON.parse(extractJson(output)) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("Government hierarchy response must be an array.");
  }

  return parsed
    .map((item) => normalizePositionNode(item))
    .filter((node): node is PositionNode => Boolean(node));
}

export function parsePositionResponsibilities(output: string): string[] {
  const parsed = JSON.parse(extractJson(output)) as unknown;

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Responsibilities response must be an object.");
  }

  const responsibilities = (parsed as Record<string, unknown>).responsibilities;

  if (!Array.isArray(responsibilities)) {
    throw new Error("Responsibilities response must include an array.");
  }

  return responsibilities.map(toStringValue).filter(Boolean);
}

export function parsePositionHistory(output: string): PositionHolder[] {
  const parsed = JSON.parse(extractJson(output)) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("Position history response must be an array.");
  }

  return parsed
    .map((item) => normalizePositionHolder(item))
    .filter((holder): holder is PositionHolder => Boolean(holder));
}

function normalizePositionNode(item: unknown): PositionNode | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const record = item as Record<string, unknown>;
  const id = toStringValue(record.id);
  const title = toStringValue(record.title);
  const description = toStringValue(record.description);
  const officeType = toUnionValue(record.officeType, officeTypes);
  const level = typeof record.level === "number" ? record.level : 0;

  if (!id || !title || !description || !officeType || level < 1 || level > 5) {
    return null;
  }

  const children = Array.isArray(record.children)
    ? record.children
        .map((child) => normalizePositionNode(child))
        .filter((child): child is PositionNode => Boolean(child))
    : undefined;

  return {
    id,
    title,
    description,
    icon: toStringValue(record.icon) || "building",
    level,
    parentId: toStringValue(record.parentId) || undefined,
    officeType: officeType as OfficeType,
    currentHolderId: toStringValue(record.currentHolderId) || undefined,
    currentHolderName: toStringValue(record.currentHolderName) || undefined,
    location: toStringValue(record.location) || undefined,
    termLength: toStringValue(record.termLength) || undefined,
    appointmentMethod:
      (toUnionValue(record.appointmentMethod, appointmentMethods) as
        | AppointmentMethod
        | "") || undefined,
    responsibilities: [],
    history: [],
    children,
  };
}

function normalizePositionHolder(item: unknown): PositionHolder | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const record = item as Record<string, unknown>;
  const id = toStringValue(record.id);
  const name = toStringValue(record.name);
  const title = toStringValue(record.title);
  const servedFrom = toStringValue(record.servedFrom);
  const status = toUnionValue(record.status, holderStatuses);

  if (!id || !name || !title || !servedFrom || !status) {
    return null;
  }

  const details =
    record.details && typeof record.details === "object"
      ? (record.details as Record<string, unknown>)
      : {};

  return {
    id,
    name,
    title,
    imageUrl: toStringValue(record.imageUrl) || undefined,
    servedFrom,
    servedTo: toStringValue(record.servedTo) || undefined,
    status: status as HolderStatus,
    personalSummary: toStringValue(record.personalSummary),
    details: {
      dateOfBirth: toStringValue(details.dateOfBirth) || undefined,
      education: toStringValue(details.education) || undefined,
      profession: toStringValue(details.profession) || undefined,
      politicalAffiliation:
        toStringValue(details.politicalAffiliation) || undefined,
      homeRegion: toStringValue(details.homeRegion) || undefined,
    },
    latestNews: normalizeNews(record.latestNews),
    merits: normalizeStringList(record.merits),
    demerits: normalizeStringList(record.demerits),
  };
}

function normalizeNews(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const title = toStringValue(record.title);
      const source = toStringValue(record.source);
      const date = toStringValue(record.date);
      const link = toStringValue(record.link);

      if (!title || !source || !date || !link) {
        return null;
      }

      return { title, source, date, link };
    })
    .filter((item): item is PositionHolder["latestNews"][number] =>
      Boolean(item),
    );
}

function normalizeStringList(value: unknown) {
  return Array.isArray(value) ? value.map(toStringValue).filter(Boolean) : [];
}

function extractJson(output: string) {
  const trimmed = output.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const arrayStart = trimmed.indexOf("[");
  const arrayEnd = trimmed.lastIndexOf("]");
  const objectStart = trimmed.indexOf("{");
  const objectEnd = trimmed.lastIndexOf("}");

  if (arrayStart >= 0 && arrayEnd > arrayStart) {
    return trimmed.slice(arrayStart, arrayEnd + 1);
  }

  if (objectStart >= 0 && objectEnd > objectStart) {
    return trimmed.slice(objectStart, objectEnd + 1);
  }

  return trimmed;
}

function toUnionValue(value: unknown, allowedValues: string[]) {
  const stringValue = toStringValue(value);

  return allowedValues.includes(stringValue) ? stringValue : "";
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

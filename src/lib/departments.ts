import type {
  Department,
  DepartmentType,
  MessageCategory,
  Urgency,
} from "@/lib/firebase/help-line";
import { getBackendUrl } from "@/lib/backend";

const categories = [
  "complaint",
  "service_request",
  "corruption_report",
  "safety_concern",
  "emergency",
  "feedback",
  "general_support",
];
const categoryAliases: Record<string, MessageCategory> = {
  traffic: "safety_concern",
};
const departmentTypes = ["department", "office", "agency", "emergency_unit"];

export async function listBackendDepartments(country: string) {
  const backendUrl = getBackendUrl("/api/departments");
  const response = await fetch(backendUrl, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Departments backend request failed with status ${response.status}`);
  }

  const payload = (await response.json().catch(() => null)) as unknown;
  const records = getDepartmentRecords(payload);

  if (!records) {
    throw new Error("Departments backend returned an unexpected response shape.");
  }

  return records
    .map(normalizeDepartment)
    .filter((department): department is Department => Boolean(department))
    .filter(
      (department) =>
        !country || department.country.localeCompare(country, undefined, { sensitivity: "accent" }) === 0,
    );
}

function getDepartmentRecords(value: unknown) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object" && Array.isArray(value.departments)) {
    return value.departments;
  }

  return null;
}

function normalizeDepartment(value: unknown): Department | null {
  const data = value && typeof value === "object" ? value : {};
  const id = toStringValue(data.id);
  const country = toStringValue(data.country);
  const name = toStringValue(data.name);
  const type = toEnumValue(data.type, departmentTypes);
  const description = toStringValue(data.description);
  const handlesCategories = normalizeEnumList(data.handlesCategories, categories);
  const keywords = normalizeStringList(data.keywords);

  if (
    !id ||
    !country ||
    !name ||
    !type ||
    !description ||
    !handlesCategories.length ||
    !keywords.length
  ) {
    return null;
  }

  const serviceLevel = asRecord(data.serviceLevel);

  return {
    id,
    country,
    name,
    type: type as DepartmentType,
    description,
    handlesCategories: handlesCategories as MessageCategory[],
    keywords,
    contact: normalizeContact(data.contact),
    escalationOfficeId: toStringValue(data.escalationOfficeId) || undefined,
    serviceLevel: {
      low: toStringValue(serviceLevel.low) || "5 working days",
      medium: toStringValue(serviceLevel.medium) || "3 working days",
      high: toStringValue(serviceLevel.high) || "24 hours",
      critical: toStringValue(serviceLevel.critical) || "Immediate escalation",
    } satisfies Record<Urgency, string>,
  };
}

function normalizeContact(value: unknown) {
  const contact = asRecord(value);

  return {
    phone: toStringValue(contact.phone) || undefined,
    email: toStringValue(contact.email) || undefined,
    physicalOffice: toStringValue(contact.physicalOffice) || undefined,
  };
}

function normalizeEnumList(value: unknown, allowedValues: string[]) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const stringValue = toStringValue(item);
      return categoryAliases[stringValue] ?? toEnumValue(stringValue, allowedValues);
    })
    .filter(Boolean);
}

function normalizeStringList(value: unknown) {
  return Array.isArray(value) ? value.map(toStringValue).filter(Boolean) : [];
}

function toEnumValue(value: unknown, allowedValues: string[]) {
  const stringValue = toStringValue(value);
  return allowedValues.includes(stringValue) ? stringValue : "";
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}
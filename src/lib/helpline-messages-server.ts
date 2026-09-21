import type {
  HelpLineMessage,
  HelpLineMessageInput,
  MessageCategory,
  MessageStatus,
  Urgency,
} from "@/lib/firebase/help-line";

const categories = [
  "complaint",
  "service_request",
  "corruption_report",
  "safety_concern",
  "emergency",
  "feedback",
  "general_support",
];
const urgencies = ["low", "medium", "high", "critical"];
const statuses = ["new", "triaged", "assigned", "in_progress", "resolved", "closed"];

export function getMessageRecords(value: unknown) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object" && Array.isArray(value.messages)) {
    return value.messages;
  }

  return null;
}

export function normalizeHelpLineMessage(value: unknown): HelpLineMessage | null {
  const data = asRecord(value);
  const id = toStringValue(data.id);
  const country = toStringValue(data.country);
  const title = toStringValue(data.title);
  const message = toStringValue(data.message);
  const category = toEnumValue(data.category, categories);
  const urgency = toEnumValue(data.urgency, urgencies);
  const status = toEnumValue(data.status, statuses);
  const classification = asRecord(data.classification);
  const departmentId = toStringValue(classification.departmentId);

  if (!id || !country || !title || !message || !category || !urgency || !status || !departmentId) {
    return null;
  }

  return {
    id,
    country,
    title,
    message,
    category: category as MessageCategory,
    urgency: urgency as Urgency,
    status: status as MessageStatus,
    location: normalizeLocation(data.location),
    sender: normalizeSender(data.sender),
    maskedSender: normalizeMaskedSender(data.maskedSender),
    attachments: normalizeAttachments(data.attachments),
    classification: {
      departmentId,
      officeId: toStringValue(classification.officeId) || undefined,
      confidence: toNumberValue(classification.confidence, 0),
      reason: toStringValue(classification.reason),
    },
    submittedAt: toStringValue(data.submittedAt),
    updatedAt: toStringValue(data.updatedAt),
  };
}

export function isHelpLineMessageInput(value: unknown): value is HelpLineMessageInput {
  const data = asRecord(value);
  const classification = asRecord(data.classification);

  return Boolean(
    toStringValue(data.country) &&
      toStringValue(data.title) &&
      toStringValue(data.message) &&
      toEnumValue(data.category, categories) &&
      toEnumValue(data.urgency, urgencies) &&
      toEnumValue(data.status, statuses) &&
      toStringValue(classification.departmentId) &&
      typeof classification.confidence === "number" &&
      Number.isFinite(classification.confidence) &&
      classification.confidence >= 0 &&
      classification.confidence <= 1,
  );
}

export function isMessageStatus(value: unknown): value is MessageStatus {
  return Boolean(toEnumValue(value, statuses));
}

function normalizeLocation(value: unknown) {
  const location = asRecord(value);
  return {
    county: toStringValue(location.county) || undefined,
    constituency: toStringValue(location.constituency) || undefined,
    ward: toStringValue(location.ward) || undefined,
    addressText: toStringValue(location.addressText) || undefined,
  };
}

function normalizeSender(value: unknown) {
  const sender = asRecord(value);
  const preferredContact = toEnumValue(sender.preferredContact, ["phone", "email", "none"]);

  return {
    name: toStringValue(sender.name) || undefined,
    phone: toStringValue(sender.phone) || undefined,
    email: toStringValue(sender.email) || undefined,
    nationalId: toStringValue(sender.nationalId) || undefined,
    preferredContact: (preferredContact as "phone" | "email" | "none") || "none",
  };
}

function normalizeMaskedSender(value: unknown) {
  const sender = asRecord(value);
  return {
    name: toStringValue(sender.name) || undefined,
    phone: toStringValue(sender.phone) || undefined,
    email: toStringValue(sender.email) || undefined,
    nationalId: toStringValue(sender.nationalId) || undefined,
  };
}

function normalizeAttachments(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value
    .map((item) => {
      const attachment = asRecord(item);
      return {
        id: toStringValue(attachment.id),
        fileName: toStringValue(attachment.fileName),
        fileType: toStringValue(attachment.fileType),
        url: toStringValue(attachment.url),
      };
    })
    .filter((attachment) => attachment.id && attachment.fileName && attachment.url);
}

function toEnumValue(value: unknown, allowedValues: string[]) {
  const stringValue = toStringValue(value);
  return allowedValues.includes(stringValue) ? stringValue : "";
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toNumberValue(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}
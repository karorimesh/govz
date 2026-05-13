import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/client";

export type MessageCategory =
  | "complaint"
  | "service_request"
  | "corruption_report"
  | "safety_concern"
  | "emergency"
  | "feedback"
  | "general_support";

export type Urgency = "low" | "medium" | "high" | "critical";
export type MessageStatus =
  | "new"
  | "triaged"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "closed";

export type DepartmentType =
  | "department"
  | "office"
  | "agency"
  | "emergency_unit";

export type Department = {
  id: string;
  country: string;
  name: string;
  type: DepartmentType;
  description: string;
  handlesCategories: MessageCategory[];
  keywords: string[];
  contact: {
    phone?: string;
    email?: string;
    physicalOffice?: string;
  };
  escalationOfficeId?: string;
  serviceLevel: Record<Urgency, string>;
};

export type HelpLineMessage = {
  id: string;
  country: string;
  title: string;
  message: string;
  category: MessageCategory;
  urgency: Urgency;
  status: MessageStatus;
  location?: {
    county?: string;
    constituency?: string;
    ward?: string;
    addressText?: string;
  };
  sender?: {
    name?: string;
    phone?: string;
    email?: string;
    nationalId?: string;
    preferredContact?: "phone" | "email" | "none";
  };
  maskedSender: {
    name?: string;
    phone?: string;
    email?: string;
    nationalId?: string;
  };
  attachments?: Array<{
    id: string;
    fileName: string;
    fileType: string;
    url: string;
  }>;
  classification: {
    departmentId: string;
    officeId?: string;
    confidence: number;
    reason: string;
  };
  submittedAt: string;
  updatedAt: string;
};

export type DepartmentInput = Omit<Department, "id">;
export type HelpLineMessageInput = Omit<HelpLineMessage, "id">;

const messagesCollection = "helpLineMessages";
const departmentsCollection = "helpLineDepartments";
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
const departmentTypes = ["department", "office", "agency", "emergency_unit"];

export async function listHelpLineMessages(
  country: string,
): Promise<HelpLineMessage[]> {
  const db = requireFirestore();
  const snapshot = await getDocs(
    query(collection(db, messagesCollection), where("country", "==", country)),
  );

  return snapshot.docs
    .map((item) => normalizeMessage(item.id, item.data()))
    .filter((message): message is HelpLineMessage => Boolean(message));
}

export async function createHelpLineMessage(message: HelpLineMessageInput) {
  const db = requireFirestore();
  const reference = await addDoc(collection(db, messagesCollection), {
    ...message,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: reference.id,
    ...message,
  };
}

export async function updateHelpLineMessage(
  id: string,
  message: HelpLineMessageInput,
) {
  const db = requireFirestore();

  await updateDoc(doc(db, messagesCollection, id), {
    ...message,
    updatedAt: serverTimestamp(),
  });

  return {
    id,
    ...message,
  };
}

export async function updateHelpLineMessageStatus({
  country,
  id,
  status,
}: {
  country: string;
  id: string;
  status: MessageStatus;
}) {
  const db = requireFirestore();
  const updatedAt = new Date().toISOString();

  await updateDoc(doc(db, messagesCollection, id), {
    country,
    status,
    updatedAt,
    updatedAtServer: serverTimestamp(),
  });

  return { status, updatedAt };
}

export async function deleteHelpLineMessage({
  country,
  id,
}: {
  country: string;
  id: string;
}) {
  const db = requireFirestore();

  await updateDoc(doc(db, messagesCollection, id), {
    country,
    deletedAt: serverTimestamp(),
  });
  await deleteDoc(doc(db, messagesCollection, id));
}

export async function listHelpLineDepartments(
  country: string,
): Promise<Department[]> {
  const db = requireFirestore();
  const snapshot = await getDocs(
    query(collection(db, departmentsCollection), where("country", "==", country)),
  );

  return snapshot.docs
    .map((item) => normalizeDepartment(item.id, item.data()))
    .filter((department): department is Department => Boolean(department));
}

export async function createHelpLineDepartment(department: DepartmentInput) {
  const db = requireFirestore();
  const reference = await addDoc(collection(db, departmentsCollection), {
    ...department,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: reference.id,
    ...department,
  };
}

export async function updateHelpLineDepartment(
  id: string,
  department: DepartmentInput,
) {
  const db = requireFirestore();

  await updateDoc(doc(db, departmentsCollection, id), {
    ...department,
    updatedAt: serverTimestamp(),
  });

  return {
    id,
    ...department,
  };
}

export async function deleteHelpLineDepartment({
  country,
  id,
}: {
  country: string;
  id: string;
}) {
  const db = requireFirestore();

  await updateDoc(doc(db, departmentsCollection, id), {
    country,
    deletedAt: serverTimestamp(),
  });
  await deleteDoc(doc(db, departmentsCollection, id));
}

function requireFirestore() {
  if (!firestore) {
    throw new Error("Firebase is not configured.");
  }

  return firestore;
}

function normalizeMessage(
  id: string,
  data: DocumentData,
): HelpLineMessage | null {
  const country = toStringValue(data.country);
  const title = toStringValue(data.title);
  const message = toStringValue(data.message);
  const category = toEnumValue(data.category, categories);
  const urgency = toEnumValue(data.urgency, urgencies);
  const status = toEnumValue(data.status, statuses);
  const classification =
    data.classification && typeof data.classification === "object"
      ? (data.classification as Record<string, unknown>)
      : {};
  const departmentId = toStringValue(classification.departmentId);

  if (
    !country ||
    !title ||
    !message ||
    !category ||
    !urgency ||
    !status ||
    !departmentId
  ) {
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

function normalizeDepartment(id: string, data: DocumentData): Department | null {
  const country = toStringValue(data.country);
  const name = toStringValue(data.name);
  const type = toEnumValue(data.type, departmentTypes);
  const description = toStringValue(data.description);
  const handlesCategories = normalizeEnumList(data.handlesCategories, categories);
  const keywords = normalizeStringList(data.keywords);
  const serviceLevel =
    data.serviceLevel && typeof data.serviceLevel === "object"
      ? (data.serviceLevel as Record<string, unknown>)
      : {};

  if (
    !country ||
    !name ||
    !type ||
    !description ||
    !handlesCategories.length ||
    !keywords.length
  ) {
    return null;
  }

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
    },
  };
}

function normalizeLocation(value: unknown) {
  const location =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    county: toStringValue(location.county) || undefined,
    constituency: toStringValue(location.constituency) || undefined,
    ward: toStringValue(location.ward) || undefined,
    addressText: toStringValue(location.addressText) || undefined,
  };
}

function normalizeSender(value: unknown) {
  const sender =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const preferredContact = toEnumValue(sender.preferredContact, [
    "phone",
    "email",
    "none",
  ]);

  return {
    name: toStringValue(sender.name) || undefined,
    phone: toStringValue(sender.phone) || undefined,
    email: toStringValue(sender.email) || undefined,
    nationalId: toStringValue(sender.nationalId) || undefined,
    preferredContact:
      (preferredContact as "phone" | "email" | "none") || "none",
  };
}

function normalizeMaskedSender(value: unknown) {
  const sender =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};

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
    .map((attachment) => {
      const item =
        attachment && typeof attachment === "object"
          ? (attachment as Record<string, unknown>)
          : {};

      return {
        id: toStringValue(item.id),
        fileName: toStringValue(item.fileName),
        fileType: toStringValue(item.fileType),
        url: toStringValue(item.url),
      };
    })
    .filter((attachment) => attachment.id && attachment.fileName && attachment.url);
}

function normalizeContact(value: unknown) {
  const contact =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};

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
    .map((item) => toEnumValue(item, allowedValues))
    .filter(Boolean);
}

function normalizeStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(toStringValue).filter(Boolean);
}

function toEnumValue(value: unknown, allowedValues: string[]) {
  const stringValue = toStringValue(value);

  return allowedValues.includes(stringValue) ? stringValue : "";
}

function toNumberValue(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

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

export type PollCategory =
  | "policy"
  | "service"
  | "budget"
  | "law"
  | "community"
  | "other";
export type PollStatus = "open" | "upcoming" | "closed";
export type InputType = "vote" | "rating" | "reaction" | "comment";
export type SentimentReaction =
  | "support"
  | "oppose"
  | "neutral"
  | "concerned"
  | "excited";
export type OpinionReaction = "like" | "dislike" | "support" | "concern" | "flag";

export type Poll = {
  id: string;
  country: string;
  title: string;
  description: string;
  category: PollCategory;
  status: PollStatus;
  region: string;
  createdBy: string;
  dates: {
    opensAt: string;
    closesAt: string;
  };
  inputTypes: InputType[];
  voteOptions?: string[];
  ratingScale?: {
    min: number;
    max: number;
    labels?: {
      min: string;
      max: string;
    };
  };
  reactionOptions?: SentimentReaction[];
  allowAnonymous: boolean;
  allowMultipleResponses: boolean;
  tags: string[];
};

export type PublicInput = {
  id: string;
  country: string;
  pollId: string;
  participant: {
    publicId?: string;
    name?: string;
    region?: string;
    phone?: string;
    email?: string;
  };
  vote?: string;
  rating?: number;
  reaction?: SentimentReaction;
  comment?: string;
  submittedAt: string;
};

export type PublicReaction = {
  id: string;
  country: string;
  pollId: string;
  opinionId: string;
  reaction: OpinionReaction;
  participantId?: string;
  submittedAt: string;
};

export type PollInput = Omit<Poll, "id">;
export type PublicInputInput = Omit<PublicInput, "id">;
export type PublicReactionInput = Omit<PublicReaction, "id">;

const pollsCollection = "opinionPolls";
const inputsCollection = "opinionPollInputs";
const reactionsCollection = "opinionPollReactions";
const categories = ["policy", "service", "budget", "law", "community", "other"];
const statuses = ["open", "upcoming", "closed"];
const inputTypes = ["vote", "rating", "reaction", "comment"];
const sentimentReactions = [
  "support",
  "oppose",
  "neutral",
  "concerned",
  "excited",
];
const opinionReactions = ["like", "dislike", "support", "concern", "flag"];

export async function listOpinionPolls(country: string): Promise<Poll[]> {
  const db = requireFirestore();
  const snapshot = await getDocs(
    query(collection(db, pollsCollection), where("country", "==", country)),
  );

  return snapshot.docs
    .map((item) => normalizePoll(item.id, item.data()))
    .filter((poll): poll is Poll => Boolean(poll));
}

export async function createOpinionPoll(poll: PollInput) {
  const db = requireFirestore();
  const reference = await addDoc(collection(db, pollsCollection), {
    ...poll,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: reference.id,
    ...poll,
  };
}

export async function updateOpinionPoll(id: string, poll: PollInput) {
  const db = requireFirestore();

  await updateDoc(doc(db, pollsCollection, id), {
    ...poll,
    updatedAt: serverTimestamp(),
  });

  return {
    id,
    ...poll,
  };
}

export async function deleteOpinionPoll(id: string) {
  const db = requireFirestore();

  await deleteDoc(doc(db, pollsCollection, id));
}

export async function listPublicInputs({
  country,
  pollId,
}: {
  country: string;
  pollId: string;
}): Promise<PublicInput[]> {
  const db = requireFirestore();
  const snapshot = await getDocs(
    query(
      collection(db, inputsCollection),
      where("country", "==", country),
      where("pollId", "==", pollId),
    ),
  );

  return snapshot.docs
    .map((item) => normalizePublicInput(item.id, item.data()))
    .filter((input): input is PublicInput => Boolean(input));
}

export async function createPublicInput(input: PublicInputInput) {
  const db = requireFirestore();
  const reference = await addDoc(collection(db, inputsCollection), {
    ...input,
    createdAt: serverTimestamp(),
  });

  return {
    id: reference.id,
    ...input,
  };
}

export async function listPublicReactions({
  country,
  pollId,
}: {
  country: string;
  pollId: string;
}): Promise<PublicReaction[]> {
  const db = requireFirestore();
  const snapshot = await getDocs(
    query(
      collection(db, reactionsCollection),
      where("country", "==", country),
      where("pollId", "==", pollId),
    ),
  );

  return snapshot.docs
    .map((item) => normalizePublicReaction(item.id, item.data()))
    .filter((reaction): reaction is PublicReaction => Boolean(reaction));
}

export async function createPublicReaction(reaction: PublicReactionInput) {
  const db = requireFirestore();
  const reference = await addDoc(collection(db, reactionsCollection), {
    ...reaction,
    createdAt: serverTimestamp(),
  });

  return {
    id: reference.id,
    ...reaction,
  };
}

function requireFirestore() {
  if (!firestore) {
    throw new Error("Firebase is not configured.");
  }

  return firestore;
}

function normalizePoll(id: string, data: DocumentData): Poll | null {
  const country = toStringValue(data.country);
  const title = toStringValue(data.title);
  const description = toStringValue(data.description);
  const category = toEnumValue(data.category, categories);
  const status = toEnumValue(data.status, statuses);
  const region = toStringValue(data.region);
  const createdBy = toStringValue(data.createdBy);
  const dates = data.dates && typeof data.dates === "object"
    ? (data.dates as Record<string, unknown>)
    : {};
  const inputTypeValues = normalizeEnumList(data.inputTypes, inputTypes);
  const tags = normalizeStringList(data.tags);

  if (
    !country ||
    !title ||
    !description ||
    !category ||
    !status ||
    !region ||
    !createdBy ||
    !toStringValue(dates.opensAt) ||
    !toStringValue(dates.closesAt) ||
    !inputTypeValues.length
  ) {
    return null;
  }

  return {
    id,
    country,
    title,
    description,
    category: category as PollCategory,
    status: status as PollStatus,
    region,
    createdBy,
    dates: {
      opensAt: toStringValue(dates.opensAt),
      closesAt: toStringValue(dates.closesAt),
    },
    inputTypes: inputTypeValues as InputType[],
    voteOptions: normalizeStringList(data.voteOptions),
    ratingScale: normalizeRatingScale(data.ratingScale),
    reactionOptions: normalizeEnumList(
      data.reactionOptions,
      sentimentReactions,
    ) as SentimentReaction[],
    allowAnonymous: Boolean(data.allowAnonymous),
    allowMultipleResponses: Boolean(data.allowMultipleResponses),
    tags,
  };
}

function normalizePublicInput(
  id: string,
  data: DocumentData,
): PublicInput | null {
  const country = toStringValue(data.country);
  const pollId = toStringValue(data.pollId);
  const participant =
    data.participant && typeof data.participant === "object"
      ? (data.participant as Record<string, unknown>)
      : {};
  const reaction = toEnumValue(data.reaction, sentimentReactions);

  if (!country || !pollId) {
    return null;
  }

  return {
    id,
    country,
    pollId,
    participant: {
      publicId: toStringValue(participant.publicId) || undefined,
      name: toStringValue(participant.name) || undefined,
      region: toStringValue(participant.region) || undefined,
      phone: toStringValue(participant.phone) || undefined,
      email: toStringValue(participant.email) || undefined,
    },
    vote: toStringValue(data.vote) || undefined,
    rating: typeof data.rating === "number" ? data.rating : undefined,
    reaction: (reaction as SentimentReaction) || undefined,
    comment: toStringValue(data.comment) || undefined,
    submittedAt: toStringValue(data.submittedAt),
  };
}

function normalizePublicReaction(
  id: string,
  data: DocumentData,
): PublicReaction | null {
  const country = toStringValue(data.country);
  const pollId = toStringValue(data.pollId);
  const opinionId = toStringValue(data.opinionId);
  const reaction = toEnumValue(data.reaction, opinionReactions);

  if (!country || !pollId || !opinionId || !reaction) {
    return null;
  }

  return {
    id,
    country,
    pollId,
    opinionId,
    reaction: reaction as OpinionReaction,
    participantId: toStringValue(data.participantId) || undefined,
    submittedAt: toStringValue(data.submittedAt),
  };
}

function normalizeRatingScale(value: unknown): Poll["ratingScale"] {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const labels =
    record.labels && typeof record.labels === "object"
      ? (record.labels as Record<string, unknown>)
      : {};

  if (typeof record.min !== "number" || typeof record.max !== "number") {
    return undefined;
  }

  return {
    min: record.min,
    max: record.max,
    labels: {
      min: toStringValue(labels.min),
      max: toStringValue(labels.max),
    },
  };
}

function normalizeEnumList(value: unknown, allowedValues: string[]) {
  return Array.isArray(value)
    ? value
        .map((item) => toEnumValue(item, allowedValues))
        .filter(Boolean)
    : [];
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

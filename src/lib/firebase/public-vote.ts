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

export type PublicVoteItem = {
  id: string;
  country: string;
  type: "referendum" | "petition";
  title: string;
  description: string;
  dates: string;
  initiatorName: string;
  initiatorType: "person" | "party" | "organization" | "government";
  status: "open" | "upcoming" | "closed";
  region: string;
  voteOptions: string[];
  requiredThreshold?: string;
};

export type VoterDetails = {
  id: string;
  country: string;
  publicVoteItemId: string;
  address: string;
  phone: string;
  email: string;
  theirVote: string;
  comments: string;
};

export type PublicVoteItemInput = Omit<PublicVoteItem, "id">;
export type VoterDetailsInput = VoterDetails;
export type PublicVoteRecord = VoterDetails & {
  documentId: string;
};

const publicVoteCollection = "publicVoteItems";
const publicVoteVotesCollection = "publicVoteVotes";

export async function listPublicVoteItems(
  country: string,
): Promise<PublicVoteItem[]> {
  const db = requireFirestore();
  const snapshot = await getDocs(
    query(collection(db, publicVoteCollection), where("country", "==", country)),
  );

  return snapshot.docs
    .map((item) => normalizePublicVoteItem(item.id, item.data()))
    .filter((item): item is PublicVoteItem => Boolean(item));
}

export async function createPublicVoteItem(item: PublicVoteItemInput) {
  const db = requireFirestore();
  const reference = await addDoc(collection(db, publicVoteCollection), {
    ...item,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: reference.id,
    ...item,
  };
}

export async function updatePublicVoteItem(
  id: string,
  item: PublicVoteItemInput,
) {
  const db = requireFirestore();

  await updateDoc(doc(db, publicVoteCollection, id), {
    ...item,
    updatedAt: serverTimestamp(),
  });

  return {
    id,
    ...item,
  };
}

export async function deletePublicVoteItem(id: string) {
  const db = requireFirestore();

  await deleteDoc(doc(db, publicVoteCollection, id));
}

export async function listPublicVotes({
  country,
  publicVoteItemId,
}: {
  country: string;
  publicVoteItemId: string;
}): Promise<PublicVoteRecord[]> {
  const db = requireFirestore();
  const snapshot = await getDocs(
    query(
      collection(db, publicVoteVotesCollection),
      where("country", "==", country),
      where("publicVoteItemId", "==", publicVoteItemId),
    ),
  );

  return snapshot.docs
    .map((item) => normalizePublicVote(item.id, item.data()))
    .filter((vote): vote is PublicVoteRecord => Boolean(vote));
}

export async function createPublicVote(vote: VoterDetailsInput) {
  const db = requireFirestore();
  const reference = await addDoc(collection(db, publicVoteVotesCollection), {
    ...vote,
    createdAt: serverTimestamp(),
  });

  return {
    documentId: reference.id,
    ...vote,
  };
}

function requireFirestore() {
  if (!firestore) {
    throw new Error("Firebase is not configured.");
  }

  return firestore;
}

function normalizePublicVoteItem(
  id: string,
  data: DocumentData,
): PublicVoteItem | null {
  const country = toStringValue(data.country);
  const type = toEnumValue(data.type, ["referendum", "petition"]);
  const title = toStringValue(data.title);
  const description = toStringValue(data.description);
  const dates = toStringValue(data.dates);
  const initiatorName = toStringValue(data.initiatorName);
  const initiatorType = toEnumValue(data.initiatorType, [
    "person",
    "party",
    "organization",
    "government",
  ]);
  const status = toEnumValue(data.status, ["open", "upcoming", "closed"]);
  const region = toStringValue(data.region);
  const voteOptions = Array.isArray(data.voteOptions)
    ? data.voteOptions.map(toStringValue).filter(Boolean)
    : [];

  if (
    !country ||
    !type ||
    !title ||
    !description ||
    !dates ||
    !initiatorName ||
    !initiatorType ||
    !status ||
    !region ||
    !voteOptions.length
  ) {
    return null;
  }

  return {
    id,
    country,
    type: type as PublicVoteItem["type"],
    title,
    description,
    dates,
    initiatorName,
    initiatorType: initiatorType as PublicVoteItem["initiatorType"],
    status: status as PublicVoteItem["status"],
    region,
    voteOptions,
    requiredThreshold: toStringValue(data.requiredThreshold) || undefined,
  };
}

function normalizePublicVote(
  documentId: string,
  data: DocumentData,
): PublicVoteRecord | null {
  const id = toStringValue(data.id);
  const country = toStringValue(data.country);
  const publicVoteItemId = toStringValue(data.publicVoteItemId);
  const address = toStringValue(data.address);
  const phone = toStringValue(data.phone);
  const email = toStringValue(data.email);
  const theirVote = toStringValue(data.theirVote);
  const comments = toStringValue(data.comments);

  if (
    !id ||
    !country ||
    !publicVoteItemId ||
    !address ||
    !phone ||
    !email ||
    !theirVote
  ) {
    return null;
  }

  return {
    documentId,
    id,
    country,
    publicVoteItemId,
    address,
    phone,
    email,
    theirVote,
    comments,
  };
}

function toEnumValue(value: unknown, allowedValues: string[]) {
  const stringValue = toStringValue(value);

  return allowedValues.includes(stringValue) ? stringValue : "";
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

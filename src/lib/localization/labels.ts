import type { TranslationKey } from "@/lib/localization/dictionaries";

export const labelTranslationKeys: Record<string, TranslationKey> = {
  "Address": "form.address",
  "Address or landmark": "form.addressLandmark",
  "Allow anonymous responses": "form.allowAnonymous",
  "Allow multiple responses": "form.allowMultiple",
  "Attachment link": "form.attachmentLink",
  "Attachment name": "form.attachmentName",
  "Category": "form.category",
  "Closes at": "form.closesAt",
  "Comments": "form.comments",
  "Constituency": "form.constituency",
  "County": "form.county",
  "Created by": "form.createdBy",
  "Dates": "form.dates",
  "Department": "form.department",
  "Description": "form.description",
  "Email": "form.email",
  "Initiating person or party": "form.initiator",
  "Initiator type": "form.initiatorType",
  "Maximum label": "form.maximumLabel",
  "Message": "form.message",
  "Minimum label": "form.minimumLabel",
  "Name": "form.name",
  "National ID": "form.nationalId",
  "National ID or voter ID": "form.nationalId",
  "Opens at": "form.opensAt",
  "Phone": "form.phone",
  "Preferred contact": "form.preferredContact",
  "Public ID": "form.publicId",
  "Rating maximum": "form.ratingMaximum",
  "Rating minimum": "form.ratingMinimum",
  "Reaction": "form.reaction",
  "Region": "form.region",
  "Required threshold": "form.requiredThreshold",
  "Status": "form.status",
  "Tags, comma separated": "form.tags",
  "Title": "form.title",
  "Type": "form.type",
  "Urgency": "form.urgency",
  "Vote": "form.vote",
  "Vote options, comma separated": "form.voteOptions",
  "Ward": "form.ward",
};

export function translateLabel(
  t: (key: TranslationKey, fallback?: string) => string,
  label: string,
) {
  const key = labelTranslationKeys[label];

  return key ? t(key, label) : label;
}

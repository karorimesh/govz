"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Filter,
  MessageSquarePlus,
  Search,
} from "lucide-react";
import { useLocalization } from "@/components/localization/localization-provider";
import { translateLabel } from "@/lib/localization/labels";

type MessageCategory =
  | "complaint"
  | "service_request"
  | "corruption_report"
  | "safety_concern"
  | "emergency"
  | "feedback"
  | "general_support";

type Urgency = "low" | "medium" | "high" | "critical";
type MessageStatus =
  | "new"
  | "triaged"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "closed";

type Department = {
  id: string;
  name: string;
  type: "department" | "office" | "agency" | "emergency_unit";
  description: string;
  handlesCategories: readonly MessageCategory[];
  keywords: readonly string[];
  contact: {
    phone?: string;
    email?: string;
    physicalOffice?: string;
  };
  escalationOfficeId?: string;
  serviceLevel: Record<Urgency, string>;
};

type HelpLineMessage = {
  id: string;
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

type HelpLineBoardProps = {
  departments: Department[];
  initialMessages: HelpLineMessage[];
};

const categoryOptions: MessageCategory[] = [
  "complaint",
  "service_request",
  "corruption_report",
  "safety_concern",
  "emergency",
  "feedback",
  "general_support",
];
const urgencyOptions: Urgency[] = ["low", "medium", "high", "critical"];
const statusOptions: MessageStatus[] = [
  "new",
  "triaged",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
];

export function HelpLineBoard({
  departments,
  initialMessages,
}: HelpLineBoardProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const { t } = useLocalization();

  const departmentById = useMemo(
    () => new Map(departments.map((department) => [department.id, department])),
    [departments],
  );

  const filteredMessages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return messages.filter((message) => {
      const department = departmentById.get(message.classification.departmentId);
      const searchText = [
        message.title,
        message.message,
        message.category,
        message.urgency,
        message.status,
        message.location?.county,
        message.location?.constituency,
        message.location?.ward,
        message.location?.addressText,
        department?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!normalizedQuery || searchText.includes(normalizedQuery)) &&
        (categoryFilter === "all" || message.category === categoryFilter) &&
        (urgencyFilter === "all" || message.urgency === urgencyFilter) &&
        (statusFilter === "all" || message.status === statusFilter) &&
        (departmentFilter === "all" ||
          message.classification.departmentId === departmentFilter)
      );
    });
  }, [
    categoryFilter,
    departmentById,
    departmentFilter,
    messages,
    query,
    statusFilter,
    urgencyFilter,
  ]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const category = String(formData.get("category")) as MessageCategory;
    const urgency = String(formData.get("urgency")) as Urgency;
    const title = String(formData.get("title") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const sender = {
      name: getOptional(formData, "name"),
      phone: getOptional(formData, "phone"),
      email: getOptional(formData, "email"),
      nationalId: getOptional(formData, "nationalId"),
      preferredContact: String(formData.get("preferredContact")) as
        | "phone"
        | "email"
        | "none",
    };
    const attachmentUrl = getOptional(formData, "attachmentUrl");
    const attachmentName = getOptional(formData, "attachmentName");
    const classification = classifyMessage({
      category,
      departments,
      message,
      title,
      urgency,
    });

    const newMessage: HelpLineMessage = {
      id: crypto.randomUUID(),
      title,
      message,
      category,
      urgency,
      status: "new",
      location: {
        county: getOptional(formData, "county"),
        constituency: getOptional(formData, "constituency"),
        ward: getOptional(formData, "ward"),
        addressText: getOptional(formData, "addressText"),
      },
      sender,
      maskedSender: {
        name: maskName(sender.name),
        phone: maskPhone(sender.phone),
        email: maskEmail(sender.email),
        nationalId: maskNationalId(sender.nationalId),
      },
      attachments: attachmentUrl
        ? [
            {
              id: crypto.randomUUID(),
              fileName: attachmentName ?? "Submitted attachment",
              fileType: "link",
              url: attachmentUrl,
            },
          ]
        : undefined,
      classification,
      submittedAt: "Just now",
      updatedAt: "Just now",
    };

    setMessages((currentMessages) => [newMessage, ...currentMessages]);
    setNotice(
      `Message submitted anonymously and assigned to ${
        departmentById.get(classification.departmentId)?.name ?? "a public desk"
      }.`,
    );
    event.currentTarget.reset();
  }

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <div className="space-y-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#61705d]">
            Anonymous public support
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#17201a] sm:text-4xl">
            Help Line
          </h1>
        </div>

        <div className="rounded-lg border border-[#d9dfd2] bg-[#eef3e9] p-4 text-sm leading-6 text-[#34423a]">
          Sender details are optional and masked by default. Messages are routed
          to the department or office most likely to handle the matter.
        </div>

        <form
          className="grid gap-4 rounded-lg border border-[#d9dfd2] bg-white p-5 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center gap-2 border-b border-[#d9dfd2] pb-4">
            <MessageSquarePlus
              aria-hidden="true"
              className="text-[#2f6f5e]"
              size={21}
            />
            <h2 className="text-lg font-semibold text-[#17201a]">
              Send an anonymous message
            </h2>
          </div>

          <FormInput label="Title" name="title" required />
          <label className="grid gap-2 text-sm font-medium text-[#34423a]">
            {t("form.message")}
            <textarea
              className="min-h-32 rounded-md border border-[#cbd4c4] bg-white p-3 text-sm outline-none focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/20"
              name="message"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput label="Category" name="category" options={categoryOptions} />
            <SelectInput label="Urgency" name="urgency" options={urgencyOptions} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="County" name="county" />
            <FormInput label="Constituency" name="constituency" />
            <FormInput label="Ward" name="ward" />
            <FormInput label="Address or landmark" name="addressText" />
          </div>

          <fieldset className="grid gap-4 rounded-lg bg-[#f7f8f3] p-4">
            <legend className="text-sm font-semibold text-[#17201a]">
              Optional sender details
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput label="Name" name="name" />
              <FormInput label="Phone" name="phone" type="tel" />
              <FormInput label="Email" name="email" type="email" />
              <FormInput label="National ID" name="nationalId" />
            </div>
            <SelectInput
              label="Preferred contact"
              name="preferredContact"
              options={["none", "phone", "email"]}
            />
          </fieldset>

          <fieldset className="grid gap-4 rounded-lg bg-[#f7f8f3] p-4">
            <legend className="text-sm font-semibold text-[#17201a]">
              Optional attachment
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput label="Attachment name" name="attachmentName" />
              <FormInput label="Attachment link" name="attachmentUrl" type="url" />
            </div>
          </fieldset>

          <button
            className="h-11 rounded-md bg-[#173c32] px-4 text-sm font-semibold text-white transition hover:bg-[#245548]"
            type="submit"
          >
            {t("common.submit")}
          </button>
        </form>
      </div>

      <div className="space-y-5">
        {notice ? (
          <div className="rounded-md border border-[#cbd4c4] bg-[#eef3e9] px-4 py-3 text-sm text-[#2f6f5e]">
            {notice}
          </div>
        ) : null}

        <div className="rounded-lg border border-[#d9dfd2] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#d9dfd2] pb-4">
            <Filter aria-hidden="true" className="text-[#2f6f5e]" size={20} />
            <h2 className="text-lg font-semibold text-[#17201a]">
              Submitted messages
            </h2>
          </div>

          <div className="mt-4 grid gap-3">
            <label className="relative" htmlFor="help-search">
              <span className="sr-only">Search help line messages</span>
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#61705d]"
                size={18}
              />
              <input
                className="h-11 w-full rounded-md border border-[#cbd4c4] bg-white pl-10 pr-3 text-sm text-[#17201a] outline-none transition placeholder:text-[#74806e] focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/20"
                id="help-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("common.search")}
                type="search"
                value={query}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <FilterSelect
                label="Category"
                onChange={setCategoryFilter}
                options={categoryOptions}
                value={categoryFilter}
              />
              <FilterSelect
                label="Urgency"
                onChange={setUrgencyFilter}
                options={urgencyOptions}
                value={urgencyFilter}
              />
              <FilterSelect
                label="Status"
                onChange={setStatusFilter}
                options={statusOptions}
                value={statusFilter}
              />
              <FilterSelect
                label="Department"
                onChange={setDepartmentFilter}
                options={departments.map((department) => department.id)}
                optionLabels={new Map(
                  departments.map((department) => [
                    department.id,
                    department.name,
                  ]),
                )}
                value={departmentFilter}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredMessages.map((message) => (
            <MessageCard
              department={departmentById.get(message.classification.departmentId)}
              key={message.id}
              message={message}
            />
          ))}
          {filteredMessages.length === 0 ? (
            <div className="rounded-lg border border-[#d9dfd2] bg-white p-8 text-center text-[#4d5b4a]">
              No help line messages match your filters.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function MessageCard({
  department,
  message,
}: {
  department?: Department;
  message: HelpLineMessage;
}) {
  return (
    <article className="rounded-lg border border-[#d9dfd2] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#eef3e9] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#2f6f5e]">
              {formatLabel(message.category)}
            </span>
            <span className="rounded-full border border-[#d9dfd2] px-3 py-1 text-xs font-semibold capitalize text-[#61705d]">
              {message.status.replace("_", " ")}
            </span>
          </div>
          <h3 className="mt-3 text-xl font-semibold text-[#17201a]">
            {message.title}
          </h3>
        </div>
        <UrgencyBadge urgency={message.urgency} />
      </div>

      <p className="mt-3 text-sm leading-6 text-[#53604f]">{message.message}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <InfoBox
          label="Masked sender"
          value={maskedSenderLabel(message.maskedSender)}
        />
        <InfoBox
          label="Location"
          value={
            [
              message.location?.county,
              message.location?.constituency,
              message.location?.ward,
              message.location?.addressText,
            ]
              .filter(Boolean)
              .join(", ") || "Not provided"
          }
        />
        <InfoBox
          label="Assigned office"
          value={department?.name ?? "General Public Service Desk"}
        />
        <InfoBox
          label="Classification"
          value={`${Math.round(message.classification.confidence * 100)}% confidence`}
        />
      </div>

      {department ? (
        <div className="mt-4 rounded-lg bg-[#f7f8f3] p-4">
          <div className="flex items-start gap-3">
            <Building2
              aria-hidden="true"
              className="mt-1 shrink-0 text-[#2f6f5e]"
              size={20}
            />
            <div>
              <p className="text-sm font-semibold text-[#17201a]">
                {department.description}
              </p>
              <p className="mt-1 text-sm text-[#61705d]">
                Target response: {department.serviceLevel[message.urgency]}
              </p>
              <p className="mt-1 text-xs text-[#61705d]">
                {message.classification.reason}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {message.attachments?.length ? (
        <div className="mt-4 rounded-lg border border-[#d9dfd2] p-4">
          <p className="text-sm font-semibold text-[#17201a]">Attachments</p>
          <div className="mt-2 grid gap-2">
            {message.attachments.map((attachment) => (
              <a
                className="text-sm font-medium text-[#2f6f5e] hover:text-[#173c32]"
                href={attachment.url}
                key={attachment.id}
                rel="noreferrer"
                target="_blank"
              >
                {attachment.fileName}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function FormInput({
  label,
  name,
  required = false,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  const { t } = useLocalization();

  return (
    <label className="grid gap-2 text-sm font-medium text-[#34423a]">
      {translateLabel(t, label)}
      <input
        className="h-11 rounded-md border border-[#cbd4c4] bg-white px-3 text-sm outline-none focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/20"
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}

function SelectInput({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: readonly string[];
}) {
  const { t } = useLocalization();

  return (
    <label className="grid gap-2 text-sm font-medium text-[#34423a]">
      {translateLabel(t, label)}
      <select
        className="h-11 rounded-md border border-[#cbd4c4] bg-white px-3 text-sm capitalize outline-none focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/20"
        defaultValue={options[0]}
        name={name}
        required
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterSelect({
  label,
  onChange,
  optionLabels,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  optionLabels?: Map<string, string>;
  options: readonly string[];
  value: string;
}) {
  const { t } = useLocalization();

  return (
    <label className="grid gap-2 text-sm font-medium text-[#34423a]">
      {translateLabel(t, label)}
      <select
        className="h-11 rounded-md border border-[#cbd4c4] bg-white px-3 text-sm capitalize outline-none focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/20"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="all">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels?.get(option) ?? formatLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#f7f8f3] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#61705d]">
        {label}
      </p>
      <p className="mt-1 text-sm text-[#17201a]">{value}</p>
    </div>
  );
}

function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const urgent = urgency === "critical" || urgency === "high";

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
        urgent ? "bg-[#ffe7df] text-[#a63f2f]" : "bg-[#eef3e9] text-[#2f6f5e]"
      }`}
    >
      {urgent ? <AlertTriangle aria-hidden="true" size={14} /> : null}
      {urgency}
    </span>
  );
}

function classifyMessage({
  category,
  departments,
  message,
  title,
  urgency,
}: {
  category: MessageCategory;
  departments: Department[];
  message: string;
  title: string;
  urgency: Urgency;
}) {
  if (category === "emergency" || urgency === "critical") {
    return buildClassification(
      departments,
      "public-safety-emergency",
      0.96,
      "Emergency or critical urgency messages are routed to emergency response first.",
    );
  }

  if (category === "corruption_report") {
    return buildClassification(
      departments,
      "anti-corruption-ethics",
      0.94,
      "Corruption reports are routed to the Anti-Corruption And Ethics Office.",
    );
  }

  const content = `${title} ${message}`.toLowerCase();
  const scored = departments
    .filter((department) => department.handlesCategories.includes(category))
    .map((department) => ({
      department,
      score: department.keywords.filter((keyword) =>
        content.includes(keyword.toLowerCase()),
      ).length,
    }))
    .sort((left, right) => right.score - left.score);

  const match = scored[0]?.department;

  if (match && scored[0].score > 0) {
    return {
      departmentId: match.id,
      confidence: 0.82,
      reason: `Matched category and keywords for ${match.name}.`,
    };
  }

  return buildClassification(
    departments,
    "general-public-service",
    0.58,
    "No specific keyword match was found, so the message was assigned to the general desk.",
  );
}

function buildClassification(
  departments: Department[],
  departmentId: string,
  confidence: number,
  reason: string,
) {
  return {
    departmentId:
      departments.find((department) => department.id === departmentId)?.id ??
      "general-public-service",
    confidence,
    reason,
  };
}

function getOptional(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim() || undefined;
}

function maskName(value?: string) {
  if (!value) {
    return undefined;
  }

  return value
    .split(" ")
    .map((part) => `${part.slice(0, 1)}${"*".repeat(Math.max(2, part.length - 1))}`)
    .join(" ");
}

function maskPhone(value?: string) {
  if (!value) {
    return undefined;
  }

  const last = value.slice(-3);
  return `${value.slice(0, 6)}** *** ${last}`;
}

function maskEmail(value?: string) {
  if (!value || !value.includes("@")) {
    return undefined;
  }

  const [name, domain] = value.split("@");
  return `${name.slice(0, 2)}***@${domain}`;
}

function maskNationalId(value?: string) {
  if (!value) {
    return undefined;
  }

  return `${value.slice(0, 2)}****${value.slice(-2)}`;
}

function maskedSenderLabel(sender: HelpLineMessage["maskedSender"]) {
  const values = [sender.name, sender.phone, sender.email, sender.nationalId].filter(
    Boolean,
  );

  return values.length ? values.join(" / ") : "Anonymous";
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

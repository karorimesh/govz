"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Filter,
  MessageSquarePlus,
  Search,
  Trash2,
} from "lucide-react";
import { useLocalization } from "@/components/localization/localization-provider";
import {
  createHelpLineMessage,
  deleteHelpLineMessage,
  listHelpLineDepartments,
  listHelpLineMessages,
  updateHelpLineMessageStatus,
  type Department,
  type HelpLineMessage,
  type MessageCategory,
  type MessageStatus,
  type Urgency,
} from "@/lib/firebase/help-line";
import { translateLabel } from "@/lib/localization/labels";

type DepartmentTemplate = Omit<
  Department,
  "country" | "handlesCategories" | "keywords"
> & {
  handlesCategories: readonly MessageCategory[];
  keywords: readonly string[];
};
type LoadingStatus = "loading" | "ready" | "error";

type HelpLineBoardProps = {
  departmentTemplates: DepartmentTemplate[];
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

export function HelpLineBoard({ departmentTemplates }: HelpLineBoardProps) {
  const { country, t } = useLocalization();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [messages, setMessages] = useState<HelpLineMessage[]>([]);
  const [status, setStatus] = useState<LoadingStatus>("loading");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadHelpLine() {
      setStatus("loading");
      setError("");
      setNotice("");
      setMessages([]);
      setDepartmentFilter("all");

      try {
        const [loadedDepartments, loadedMessages] = await Promise.all([
          listHelpLineDepartments(country.name),
          listHelpLineMessages(country.name),
        ]);

        if (!isActive) {
          return;
        }

        setDepartments(
          loadedDepartments.length
            ? loadedDepartments
            : withCountry(departmentTemplates, country.name),
        );
        setMessages(sortMessages(loadedMessages));
        setStatus("ready");
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        console.error("[help-line] list failed", loadError);
        setDepartments(withCountry(departmentTemplates, country.name));
        setStatus("error");
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load help line messages right now.",
        );
      }
    }

    loadHelpLine();

    return () => {
      isActive = false;
    };
  }, [country.name, departmentTemplates]);

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
        message.country,
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const form = event.currentTarget;
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

    const now = new Date().toISOString();
    const newMessage: Omit<HelpLineMessage, "id"> = {
      country: country.name,
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
      submittedAt: now,
      updatedAt: now,
    };

    setIsSubmitting(true);
    setNotice("");

    try {
      const savedMessage = await createHelpLineMessage(newMessage);

      setMessages((currentMessages) =>
        sortMessages([savedMessage, ...currentMessages]),
      );
      setNotice(
        `Message submitted for ${country.name} and assigned to ${
          departmentById.get(classification.departmentId)?.name ?? "a public desk"
        }.`,
      );
      form.reset();
    } catch (submitError) {
      console.error("[help-line] create failed", submitError);
      setNotice(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit help line message right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function changeMessageStatus(
    message: HelpLineMessage,
    nextStatus: MessageStatus,
  ) {
    setNotice("");

    try {
      const result = await updateHelpLineMessageStatus({
        country: country.name,
        id: message.id,
        status: nextStatus,
      });

      setMessages((currentMessages) =>
        currentMessages.map((currentMessage) =>
          currentMessage.id === message.id
            ? {
                ...currentMessage,
                country: country.name,
                status: result.status,
                updatedAt: result.updatedAt,
              }
            : currentMessage,
        ),
      );
      setNotice(`Status updated for ${country.name}.`);
    } catch (updateError) {
      console.error("[help-line] status update failed", updateError);
      setNotice(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update help line message right now.",
      );
    }
  }

  async function removeMessage(message: HelpLineMessage) {
    const confirmed = window.confirm(`Delete "${message.title}"?`);

    if (!confirmed) {
      return;
    }

    setNotice("");

    try {
      await deleteHelpLineMessage({ country: country.name, id: message.id });
      setMessages((currentMessages) =>
        currentMessages.filter((currentMessage) => currentMessage.id !== message.id),
      );
      setNotice(`Message deleted for ${country.name}.`);
    } catch (deleteError) {
      console.error("[help-line] delete failed", deleteError);
      setNotice(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete help line message right now.",
      );
    }
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
          <p className="mt-3 text-sm text-[#61705d]">
            Showing help line messages for {country.name}
          </p>
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
            className="h-11 rounded-md bg-[#173c32] px-4 text-sm font-semibold text-white transition hover:bg-[#245548] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Submitting..." : t("common.submit")}
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

        {status === "loading" ? (
          <div className="rounded-lg border border-[#d9dfd2] bg-white p-8 text-center text-[#4d5b4a]">
            Loading help line messages for {country.name}...
          </div>
        ) : null}

        {status === "error" ? (
          <div className="rounded-lg border border-[#d9dfd2] bg-white p-8 text-center text-[#4d5b4a]">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4">
          {filteredMessages.map((message) => (
            <MessageCard
              department={departmentById.get(message.classification.departmentId)}
              key={message.id}
              message={message}
              onDelete={() => removeMessage(message)}
              onStatusChange={(nextStatus) =>
                changeMessageStatus(message, nextStatus)
              }
            />
          ))}
          {status === "ready" && filteredMessages.length === 0 ? (
            <div className="rounded-lg border border-[#d9dfd2] bg-white p-8 text-center text-[#4d5b4a]">
              No help line messages match your filters for {country.name}.
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
  onDelete,
  onStatusChange,
}: {
  department?: Department;
  message: HelpLineMessage;
  onDelete: () => void;
  onStatusChange: (status: MessageStatus) => void;
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
        <div className="flex flex-wrap items-center gap-2">
          <UrgencyBadge urgency={message.urgency} />
          <select
            aria-label="Update message status"
            className="h-9 rounded-md border border-[#cbd4c4] bg-white px-2 text-xs font-semibold capitalize text-[#34423a] outline-none focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/20"
            onChange={(event) =>
              onStatusChange(event.target.value as MessageStatus)
            }
            value={message.status}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
          <button
            aria-label="Delete message"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#cbd4c4] bg-white text-[#a63f2f] transition hover:bg-[#ffe7df]"
            onClick={onDelete}
            type="button"
          >
            <Trash2 aria-hidden="true" size={16} />
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-[#53604f]">{message.message}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <InfoBox label="Country" value={message.country} />
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

function sortMessages(messages: HelpLineMessage[]) {
  return [...messages].sort(
    (left, right) =>
      Date.parse(right.submittedAt) - Date.parse(left.submittedAt),
  );
}

function withCountry(
  departments: DepartmentTemplate[],
  country: string,
): Department[] {
  return departments.map((department) => ({
    ...department,
    country,
    handlesCategories: [...department.handlesCategories],
    keywords: [...department.keywords],
  }));
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

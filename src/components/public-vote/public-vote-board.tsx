"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FilePlus2,
  Search,
  Vote,
  X,
} from "lucide-react";
import { useLocalization } from "@/components/localization/localization-provider";
import { translateLabel } from "@/lib/localization/labels";

type PublicVoteItem = {
  id: string;
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

type PublicVoteBoardProps = {
  items: PublicVoteItem[];
};

const itemsPerPage = 6;
const blankForm = {
  title: "",
  type: "referendum",
  description: "",
  dates: "",
  initiatorName: "",
  initiatorType: "person",
  status: "upcoming",
  region: "",
  voteOptions: "Yes, No, Abstain",
  requiredThreshold: "",
};

export function PublicVoteBoard({ items }: PublicVoteBoardProps) {
  const [publicItems, setPublicItems] = useState(items);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<PublicVoteItem | null>(null);
  const [votingItem, setVotingItem] = useState<PublicVoteItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [createForm, setCreateForm] = useState(blankForm);
  const { t } = useLocalization();

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return publicItems;
    }

    return publicItems.filter((item) =>
      [
        item.title,
        item.description,
        item.initiatorName,
        item.initiatorType,
        item.type,
        item.status,
        item.region,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [publicItems, query]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * itemsPerPage;
  const visibleItems = filteredItems.slice(pageStart, pageStart + itemsPerPage);

  function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newItem: PublicVoteItem = {
      id: crypto.randomUUID(),
      type: createForm.type as PublicVoteItem["type"],
      title: createForm.title.trim(),
      description: createForm.description.trim(),
      dates: createForm.dates.trim(),
      initiatorName: createForm.initiatorName.trim(),
      initiatorType: createForm.initiatorType as PublicVoteItem["initiatorType"],
      status: createForm.status as PublicVoteItem["status"],
      region: createForm.region.trim(),
      voteOptions: createForm.voteOptions
        .split(",")
        .map((option) => option.trim())
        .filter(Boolean),
      requiredThreshold: createForm.requiredThreshold.trim() || undefined,
    };

    setPublicItems((currentItems) => [newItem, ...currentItems]);
    setCreateForm(blankForm);
    setIsCreateOpen(false);
    setPage(1);
    setNotice(`${newItem.title} was created locally.`);
  }

  function handleVoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const voterId = String(formData.get("id") ?? "").trim();

    setNotice(
      `Vote recorded locally${voterId ? ` for voter ${voterId}` : ""}.`,
    );
    setVotingItem(null);
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-8 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-[#d9dfd2] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#61705d]">
            Referendums and petitions
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#17201a] sm:text-4xl">
            Public Vote
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative w-full sm:w-80" htmlFor="vote-search">
            <span className="sr-only">Search public vote items</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#61705d]"
              size={19}
            />
            <input
              className="h-11 w-full rounded-md border border-[#cbd4c4] bg-white pl-10 pr-3 text-sm text-[#17201a] outline-none transition placeholder:text-[#74806e] focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/20"
              id="vote-search"
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder={t("common.search")}
              type="search"
              value={query}
            />
          </label>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#173c32] px-4 text-sm font-semibold text-white transition hover:bg-[#245548]"
            onClick={() => setIsCreateOpen(true)}
            type="button"
          >
            <FilePlus2 aria-hidden="true" size={18} />
            {t("common.create")}
          </button>
        </div>
      </div>

      {notice ? (
        <div className="rounded-md border border-[#cbd4c4] bg-[#eef3e9] px-4 py-3 text-sm text-[#2f6f5e]">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((item) => (
          <article
            className="flex min-h-[350px] flex-col rounded-lg border border-[#d9dfd2] bg-white p-5 shadow-sm"
            key={item.id}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-full bg-[#eef3e9] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#2f6f5e]">
                {item.type}
              </span>
              <span className="rounded-full border border-[#d9dfd2] px-3 py-1 text-xs font-semibold capitalize text-[#61705d]">
                {item.status}
              </span>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-[#17201a]">
              {item.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#53604f]">
              {truncateWords(item.description, 50)}
            </p>
            <div className="mt-4 space-y-2 text-sm text-[#61705d]">
              <p>{item.dates}</p>
              <p>
                Initiated by {item.initiatorName} ({item.initiatorType})
              </p>
              <p>{item.region}</p>
            </div>
            <div className="mt-auto flex gap-3 pt-5">
              <button
                className="h-10 flex-1 rounded-md border border-[#cbd4c4] px-4 text-sm font-semibold text-[#34423a] transition hover:bg-[#e7ebe2]"
                onClick={() => setSelectedItem(item)}
                type="button"
              >
                More
              </button>
              <button
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-[#173c32] px-4 text-sm font-semibold text-white transition hover:bg-[#245548] disabled:cursor-not-allowed disabled:opacity-45"
                disabled={item.status === "closed"}
                onClick={() => setVotingItem(item)}
                type="button"
              >
                <Vote aria-hidden="true" size={17} />
                Vote
              </button>
            </div>
          </article>
        ))}
      </div>

      {visibleItems.length === 0 ? (
        <div className="rounded-lg border border-[#d9dfd2] bg-white p-8 text-center text-[#4d5b4a]">
          No referendums or petitions match your search.
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-[#d9dfd2] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#61705d]">
          Showing {visibleItems.length} of {filteredItems.length} items
        </p>
        <div className="flex items-center gap-2">
          <button
            aria-label={t("common.previousPage")}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[#cbd4c4] bg-white text-[#34423a] transition hover:bg-[#e7ebe2] disabled:cursor-not-allowed disabled:opacity-45"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            type="button"
          >
            <ChevronLeft aria-hidden="true" size={20} />
          </button>
          <span className="min-w-24 text-center text-sm font-medium text-[#34423a]">
            Page {currentPage} of {pageCount}
          </span>
          <button
            aria-label={t("common.nextPage")}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[#cbd4c4] bg-white text-[#34423a] transition hover:bg-[#e7ebe2] disabled:cursor-not-allowed disabled:opacity-45"
            disabled={currentPage === pageCount}
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            type="button"
          >
            <ChevronRight aria-hidden="true" size={20} />
          </button>
        </div>
      </div>

      {selectedItem ? (
        <DetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      ) : null}
      {votingItem ? (
        <VoteModal
          item={votingItem}
          onClose={() => setVotingItem(null)}
          onSubmit={handleVoteSubmit}
        />
      ) : null}
      {isCreateOpen ? (
        <CreateModal
          form={createForm}
          onChange={setCreateForm}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      ) : null}
    </section>
  );
}

function DetailsModal({
  item,
  onClose,
}: {
  item: PublicVoteItem;
  onClose: () => void;
}) {
  return (
    <Modal title={item.title} onClose={onClose}>
      <div className="space-y-4 text-sm leading-6 text-[#53604f]">
        <p>{item.description}</p>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Detail label="Type" value={item.type} />
          <Detail label="Status" value={item.status} />
          <Detail label="Dates" value={item.dates} />
          <Detail label="Region" value={item.region} />
          <Detail
            label="Initiator"
            value={`${item.initiatorName} (${item.initiatorType})`}
          />
          <Detail
            label="Threshold"
            value={item.requiredThreshold ?? "Not specified"}
          />
        </dl>
        <div>
          <p className="font-semibold text-[#17201a]">Vote options</p>
          <p>{item.voteOptions.join(", ")}</p>
        </div>
      </div>
    </Modal>
  );
}

function VoteModal({
  item,
  onClose,
  onSubmit,
}: {
  item: PublicVoteItem;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const { t } = useLocalization();

  return (
    <Modal title={`Vote: ${item.title}`} onClose={onClose}>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <FormInput label="National ID or voter ID" name="id" required />
        <FormInput label="Address" name="address" required />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="Phone" name="phone" required type="tel" />
          <FormInput label="Email" name="email" required type="email" />
        </div>
        <label className="grid gap-2 text-sm font-medium text-[#34423a]">
          {t("form.vote")}
          <select
            className="h-11 rounded-md border border-[#cbd4c4] bg-white px-3 text-sm outline-none focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/20"
            name="theirVote"
            required
          >
            <option value="">Select your vote</option>
            {item.voteOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-[#34423a]">
          {t("form.comments")}
          <textarea
            className="min-h-28 rounded-md border border-[#cbd4c4] bg-white p-3 text-sm outline-none focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/20"
            name="comments"
          />
        </label>
        <button
          className="h-11 rounded-md bg-[#173c32] px-4 text-sm font-semibold text-white transition hover:bg-[#245548]"
          type="submit"
        >
          {t("common.submit")}
        </button>
      </form>
    </Modal>
  );
}

function CreateModal({
  form,
  onChange,
  onClose,
  onSubmit,
}: {
  form: typeof blankForm;
  onChange: (form: typeof blankForm) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const { t } = useLocalization();

  function updateForm(key: keyof typeof blankForm, value: string) {
    onChange({ ...form, [key]: value });
  }

  return (
    <Modal title="Create referendum or petition" onClose={onClose}>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <FormInput
          label="Title"
          name="title"
          onChange={(value) => updateForm("title", value)}
          required
          value={form.title}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput
            label="Type"
            name="type"
            onChange={(value) => updateForm("type", value)}
            options={["referendum", "petition"]}
            value={form.type}
          />
          <SelectInput
            label="Status"
            name="status"
            onChange={(value) => updateForm("status", value)}
            options={["open", "upcoming", "closed"]}
            value={form.status}
          />
        </div>
        <label className="grid gap-2 text-sm font-medium text-[#34423a]">
          {t("form.description")}
          <textarea
            className="min-h-32 rounded-md border border-[#cbd4c4] bg-white p-3 text-sm outline-none focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/20"
            onChange={(event) => updateForm("description", event.target.value)}
            required
            value={form.description}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="Dates"
            name="dates"
            onChange={(value) => updateForm("dates", value)}
            required
            value={form.dates}
          />
          <FormInput
            label="Region"
            name="region"
            onChange={(value) => updateForm("region", value)}
            required
            value={form.region}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="Initiating person or party"
            name="initiatorName"
            onChange={(value) => updateForm("initiatorName", value)}
            required
            value={form.initiatorName}
          />
          <SelectInput
            label="Initiator type"
            name="initiatorType"
            onChange={(value) => updateForm("initiatorType", value)}
            options={["person", "party", "organization", "government"]}
            value={form.initiatorType}
          />
        </div>
        <FormInput
          label="Vote options, comma separated"
          name="voteOptions"
          onChange={(value) => updateForm("voteOptions", value)}
          required
          value={form.voteOptions}
        />
        <FormInput
          label="Required threshold"
          name="requiredThreshold"
          onChange={(value) => updateForm("requiredThreshold", value)}
          value={form.requiredThreshold}
        />
        <button
          className="h-11 rounded-md bg-[#173c32] px-4 text-sm font-semibold text-white transition hover:bg-[#245548]"
          type="submit"
        >
          {t("common.create")}
        </button>
      </form>
    </Modal>
  );
}

function Modal({
  children,
  onClose,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
}) {
  const { t } = useLocalization();

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4 py-8"
      role="dialog"
    >
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#d9dfd2] pb-4">
          <h2 className="text-xl font-semibold text-[#17201a]">{title}</h2>
          <button
            aria-label={t("common.closeModal")}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#cbd4c4] text-[#34423a] transition hover:bg-[#e7ebe2]"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={19} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#f7f8f3] p-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#61705d]">
        {label}
      </dt>
      <dd className="mt-1 capitalize text-[#17201a]">{value}</dd>
    </div>
  );
}

function FormInput({
  label,
  name,
  onChange,
  required = false,
  type = "text",
  value,
}: {
  label: string;
  name: string;
  onChange?: (value: string) => void;
  required?: boolean;
  type?: string;
  value?: string;
}) {
  const { t } = useLocalization();

  return (
    <label className="grid gap-2 text-sm font-medium text-[#34423a]">
      {translateLabel(t, label)}
      <input
        className="h-11 rounded-md border border-[#cbd4c4] bg-white px-3 text-sm outline-none focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/20"
        name={name}
        onChange={
          onChange ? (event) => onChange(event.target.value) : undefined
        }
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function SelectInput({
  label,
  name,
  onChange,
  options,
  value,
}: {
  label: string;
  name: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  const { t } = useLocalization();

  return (
    <label className="grid gap-2 text-sm font-medium text-[#34423a]">
      {translateLabel(t, label)}
      <select
        className="h-11 rounded-md border border-[#cbd4c4] bg-white px-3 text-sm capitalize outline-none focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/20"
        name={name}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function truncateWords(text: string, limit: number) {
  const words = text.split(/\s+/);

  if (words.length <= limit) {
    return text;
  }

  return `${words.slice(0, limit).join(" ")}...`;
}

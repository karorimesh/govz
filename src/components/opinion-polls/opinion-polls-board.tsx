"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FilePlus2,
  Search,
  X,
} from "lucide-react";
import { useLocalization } from "@/components/localization/localization-provider";
import { translateLabel } from "@/lib/localization/labels";

type PollCategory = "policy" | "service" | "budget" | "law" | "community" | "other";
type PollStatus = "open" | "upcoming" | "closed";
type InputType = "vote" | "rating" | "reaction" | "comment";
type SentimentReaction = "support" | "oppose" | "neutral" | "concerned" | "excited";
type OpinionReaction = "like" | "dislike" | "support" | "concern" | "flag";

type Poll = {
  id: string;
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
  inputTypes: readonly InputType[];
  voteOptions?: readonly string[];
  ratingScale?: {
    min: number;
    max: number;
    labels?: {
      min: string;
      max: string;
    };
  };
  reactionOptions?: readonly SentimentReaction[];
  allowAnonymous: boolean;
  allowMultipleResponses: boolean;
  tags: readonly string[];
};

type PublicInput = {
  id: string;
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

type PublicReaction = {
  id: string;
  pollId: string;
  opinionId: string;
  reaction: OpinionReaction;
  participantId?: string;
  submittedAt: string;
};

type PollForm = {
  title: string;
  description: string;
  category: PollCategory;
  status: PollStatus;
  region: string;
  createdBy: string;
  opensAt: string;
  closesAt: string;
  inputTypes: Record<InputType, boolean>;
  voteOptions: string;
  ratingMin: string;
  ratingMax: string;
  ratingMinLabel: string;
  ratingMaxLabel: string;
  reactionOptions: Record<SentimentReaction, boolean>;
  allowAnonymous: boolean;
  allowMultipleResponses: boolean;
  tags: string;
};

type OpinionPollsBoardProps = {
  initialOpinions: PublicInput[];
  initialPolls: Poll[];
};

const pollsPerPage = 6;
const reactionChoices: SentimentReaction[] = [
  "support",
  "oppose",
  "neutral",
  "concerned",
  "excited",
];
const opinionReactionChoices: OpinionReaction[] = [
  "like",
  "dislike",
  "support",
  "concern",
  "flag",
];

const blankPollForm: PollForm = {
  title: "",
  description: "",
  category: "policy",
  status: "open",
  region: "",
  createdBy: "",
  opensAt: "",
  closesAt: "",
  inputTypes: {
    vote: true,
    rating: false,
    reaction: true,
    comment: true,
  },
  voteOptions: "Yes, No, Not sure",
  ratingMin: "1",
  ratingMax: "5",
  ratingMinLabel: "Poor",
  ratingMaxLabel: "Excellent",
  reactionOptions: {
    support: true,
    oppose: true,
    neutral: true,
    concerned: true,
    excited: true,
  },
  allowAnonymous: true,
  allowMultipleResponses: false,
  tags: "",
};

export function OpinionPollsBoard({
  initialOpinions,
  initialPolls,
}: OpinionPollsBoardProps) {
  const [polls, setPolls] = useState(initialPolls);
  const [opinions, setOpinions] = useState(initialOpinions);
  const [opinionReactions, setOpinionReactions] = useState<PublicReaction[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [pollForm, setPollForm] = useState<PollForm>(blankPollForm);
  const { t } = useLocalization();

  const filteredPolls = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return polls;
    }

    return polls.filter((poll) =>
      [
        poll.title,
        poll.description,
        poll.category,
        poll.region,
        poll.status,
        poll.createdBy,
        poll.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [polls, query]);

  const pageCount = Math.max(1, Math.ceil(filteredPolls.length / pollsPerPage));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * pollsPerPage;
  const visiblePolls = filteredPolls.slice(pageStart, pageStart + pollsPerPage);

  function createPoll(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const inputTypes = Object.entries(pollForm.inputTypes)
      .filter(([, enabled]) => enabled)
      .map(([type]) => type as InputType);

    if (inputTypes.length === 0) {
      setNotice("Select at least one public input type.");
      return;
    }

    const newPoll: Poll = {
      id: crypto.randomUUID(),
      title: pollForm.title.trim(),
      description: pollForm.description.trim(),
      category: pollForm.category,
      status: pollForm.status,
      region: pollForm.region.trim(),
      createdBy: pollForm.createdBy.trim(),
      dates: {
        opensAt: pollForm.opensAt,
        closesAt: pollForm.closesAt,
      },
      inputTypes,
      voteOptions: inputTypes.includes("vote")
        ? splitList(pollForm.voteOptions)
        : undefined,
      ratingScale: inputTypes.includes("rating")
        ? {
            min: Number(pollForm.ratingMin),
            max: Number(pollForm.ratingMax),
            labels: {
              min: pollForm.ratingMinLabel,
              max: pollForm.ratingMaxLabel,
            },
          }
        : undefined,
      reactionOptions: inputTypes.includes("reaction")
        ? Object.entries(pollForm.reactionOptions)
            .filter(([, enabled]) => enabled)
            .map(([reaction]) => reaction as SentimentReaction)
        : undefined,
      allowAnonymous: pollForm.allowAnonymous,
      allowMultipleResponses: pollForm.allowMultipleResponses,
      tags: splitList(pollForm.tags),
    };

    setPolls((currentPolls) => [newPoll, ...currentPolls]);
    setPollForm(blankPollForm);
    setIsCreateOpen(false);
    setPage(1);
    setNotice(`${newPoll.title} was created locally.`);
  }

  function submitOpinion(
    event: FormEvent<HTMLFormElement>,
    poll: Poll,
    onComplete: () => void,
  ) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const opinion: PublicInput = {
      id: crypto.randomUUID(),
      pollId: poll.id,
      participant: {
        publicId: String(formData.get("publicId") ?? "").trim() || undefined,
        name: String(formData.get("name") ?? "").trim() || undefined,
        region: String(formData.get("region") ?? "").trim() || undefined,
        phone: String(formData.get("phone") ?? "").trim() || undefined,
        email: String(formData.get("email") ?? "").trim() || undefined,
      },
      vote: String(formData.get("vote") ?? "").trim() || undefined,
      rating: formData.get("rating")
        ? Number(formData.get("rating"))
        : undefined,
      reaction:
        (String(formData.get("reaction") ?? "") as SentimentReaction) ||
        undefined,
      comment: String(formData.get("comment") ?? "").trim() || undefined,
      submittedAt: "Just now",
    };

    setOpinions((currentOpinions) => [opinion, ...currentOpinions]);
    setNotice("Your public input was recorded locally.");
    onComplete();
  }

  function reactToOpinion(opinion: PublicInput, reaction: OpinionReaction) {
    setOpinionReactions((currentReactions) => [
      {
        id: crypto.randomUUID(),
        pollId: opinion.pollId,
        opinionId: opinion.id,
        reaction,
        submittedAt: "Just now",
      },
      ...currentReactions,
    ]);
    setNotice(`Reaction recorded: ${reaction}.`);
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-8 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-[#d9dfd2] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#61705d]">
            Public sentiment
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#17201a] sm:text-4xl">
            Opinion Polls
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative w-full sm:w-80" htmlFor="poll-search">
            <span className="sr-only">Search opinion polls</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#61705d]"
              size={19}
            />
            <input
              className="h-11 w-full rounded-md border border-[#cbd4c4] bg-white pl-10 pr-3 text-sm text-[#17201a] outline-none transition placeholder:text-[#74806e] focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/20"
              id="poll-search"
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
        {visiblePolls.map((poll) => (
          <PollCard
            key={poll.id}
            opinionCount={opinions.filter((opinion) => opinion.pollId === poll.id).length}
            poll={poll}
            onOpen={() => setActivePoll(poll)}
          />
        ))}
      </div>

      {visiblePolls.length === 0 ? (
        <div className="rounded-lg border border-[#d9dfd2] bg-white p-8 text-center text-[#4d5b4a]">
          No opinion polls match your search.
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-[#d9dfd2] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#61705d]">
          Showing {visiblePolls.length} of {filteredPolls.length} polls
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

      {activePoll ? (
        <PollDetailsModal
          onClose={() => setActivePoll(null)}
          onReact={reactToOpinion}
          onSubmit={submitOpinion}
          opinionReactions={opinionReactions}
          opinions={opinions.filter((opinion) => opinion.pollId === activePoll.id)}
          poll={activePoll}
        />
      ) : null}

      {isCreateOpen ? (
        <CreatePollModal
          form={pollForm}
          onChange={setPollForm}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={createPoll}
        />
      ) : null}
    </section>
  );
}

function PollCard({
  onOpen,
  opinionCount,
  poll,
}: {
  onOpen: () => void;
  opinionCount: number;
  poll: Poll;
}) {
  return (
    <article className="flex min-h-[360px] flex-col rounded-lg border border-[#d9dfd2] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-[#eef3e9] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#2f6f5e]">
          {poll.category}
        </span>
        <span className="rounded-full border border-[#d9dfd2] px-3 py-1 text-xs font-semibold capitalize text-[#61705d]">
          {poll.status}
        </span>
      </div>
      <h2 className="mt-4 text-xl font-semibold text-[#17201a]">
        {poll.title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-[#53604f]">
        {poll.description}
      </p>
      <dl className="mt-4 space-y-2 text-sm text-[#61705d]">
        <div>
          <dt className="sr-only">Region</dt>
          <dd>{poll.region}</dd>
        </div>
        <div>
          <dt className="sr-only">Dates</dt>
          <dd>
            {poll.dates.opensAt} to {poll.dates.closesAt}
          </dd>
        </div>
        <div>
          <dt className="sr-only">Created by</dt>
          <dd>Created by {poll.createdBy}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        {poll.inputTypes.map((type) => (
          <span
            className="rounded-md bg-[#f7f8f3] px-2 py-1 text-xs font-medium capitalize text-[#34423a]"
            key={type}
          >
            {type}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className="text-sm text-[#61705d]">{opinionCount} opinions</span>
        <button
          className="h-10 rounded-md bg-[#173c32] px-4 text-sm font-semibold text-white transition hover:bg-[#245548]"
          onClick={onOpen}
          type="button"
        >
          Open Poll
        </button>
      </div>
    </article>
  );
}

function PollDetailsModal({
  onClose,
  onReact,
  onSubmit,
  opinionReactions,
  opinions,
  poll,
}: {
  onClose: () => void;
  onReact: (opinion: PublicInput, reaction: OpinionReaction) => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
    poll: Poll,
    onComplete: () => void,
  ) => void;
  opinionReactions: PublicReaction[];
  opinions: PublicInput[];
  poll: Poll;
}) {
  const [isResponding, setIsResponding] = useState(false);

  return (
    <Modal title={poll.title} onClose={onClose}>
      <div className="grid gap-6">
        <section className="space-y-4">
          <p className="text-sm leading-6 text-[#53604f]">{poll.description}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Detail label="Category" value={poll.category} />
            <Detail label="Status" value={poll.status} />
            <Detail label="Region" value={poll.region} />
            <Detail
              label="Dates"
              value={`${poll.dates.opensAt} to ${poll.dates.closesAt}`}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {poll.tags.map((tag) => (
              <span
                className="rounded-md bg-[#f7f8f3] px-2 py-1 text-xs font-medium text-[#34423a]"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
          <button
            className="h-11 rounded-md bg-[#173c32] px-4 text-sm font-semibold text-white transition hover:bg-[#245548] disabled:cursor-not-allowed disabled:opacity-45"
            disabled={poll.status === "closed"}
            onClick={() => setIsResponding((value) => !value)}
            type="button"
          >
            {isResponding ? "Hide input form" : "Submit public input"}
          </button>
        </section>

        {isResponding ? (
          <OpinionInputForm
            onSubmit={(event) =>
              onSubmit(event, poll, () => setIsResponding(false))
            }
            poll={poll}
          />
        ) : null}

        <section className="border-t border-[#d9dfd2] pt-5">
          <h3 className="text-lg font-semibold text-[#17201a]">
            Public opinions
          </h3>
          <div className="mt-4 grid gap-3">
            {opinions.length ? (
              opinions.map((opinion) => (
                <OpinionCard
                  key={opinion.id}
                  onReact={(reaction) => onReact(opinion, reaction)}
                  opinion={opinion}
                  reactions={opinionReactions.filter(
                    (reaction) => reaction.opinionId === opinion.id,
                  )}
                />
              ))
            ) : (
              <p className="rounded-md bg-[#f7f8f3] p-4 text-sm text-[#61705d]">
                No public opinions have been submitted for this poll yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </Modal>
  );
}

function OpinionInputForm({
  onSubmit,
  poll,
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  poll: Poll;
}) {
  const { t } = useLocalization();

  return (
    <form className="grid gap-4 rounded-lg bg-[#f7f8f3] p-4" onSubmit={onSubmit}>
      {!poll.allowAnonymous ? (
        <p className="text-sm font-medium text-[#53604f]">
          This poll requires participant details.
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput label="Public ID" name="publicId" required={!poll.allowAnonymous} />
        <FormInput label="Name" name="name" required={!poll.allowAnonymous} />
        <FormInput label="Region" name="region" />
        <FormInput label="Phone" name="phone" type="tel" />
        <FormInput label="Email" name="email" type="email" />
      </div>

      {poll.inputTypes.includes("vote") && poll.voteOptions ? (
        <SelectInput label="Vote" name="vote" options={poll.voteOptions} />
      ) : null}

      {poll.inputTypes.includes("rating") && poll.ratingScale ? (
        <label className="grid gap-2 text-sm font-medium text-[#34423a]">
          Rating
          <input
            className="accent-[#173c32]"
            max={poll.ratingScale.max}
            min={poll.ratingScale.min}
            name="rating"
            type="range"
          />
          <span className="flex justify-between text-xs text-[#61705d]">
            <span>{poll.ratingScale.labels?.min ?? poll.ratingScale.min}</span>
            <span>{poll.ratingScale.labels?.max ?? poll.ratingScale.max}</span>
          </span>
        </label>
      ) : null}

      {poll.inputTypes.includes("reaction") && poll.reactionOptions ? (
        <SelectInput
          label="Reaction"
          name="reaction"
          options={poll.reactionOptions}
        />
      ) : null}

      {poll.inputTypes.includes("comment") ? (
        <label className="grid gap-2 text-sm font-medium text-[#34423a]">
          {t("form.comments")}
          <textarea
            className="min-h-28 rounded-md border border-[#cbd4c4] bg-white p-3 text-sm outline-none focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/20"
            maxLength={500}
            name="comment"
            placeholder={t("form.comments")}
          />
        </label>
      ) : null}

      <button
        className="h-11 rounded-md bg-[#173c32] px-4 text-sm font-semibold text-white transition hover:bg-[#245548]"
        type="submit"
      >
        {t("common.submit")}
      </button>
    </form>
  );
}

function OpinionCard({
  onReact,
  opinion,
  reactions,
}: {
  onReact: (reaction: OpinionReaction) => void;
  opinion: PublicInput;
  reactions: PublicReaction[];
}) {
  return (
    <article className="rounded-lg border border-[#d9dfd2] bg-white p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#17201a]">
            {opinion.participant.name ?? "Anonymous participant"}
          </p>
          <p className="text-xs text-[#61705d]">{opinion.submittedAt}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-[#61705d]">
          {opinion.vote ? <span>Vote: {opinion.vote}</span> : null}
          {opinion.rating ? <span>Rating: {opinion.rating}</span> : null}
          {opinion.reaction ? <span>Reaction: {opinion.reaction}</span> : null}
        </div>
      </div>
      {opinion.comment ? (
        <p className="mt-3 text-sm leading-6 text-[#53604f]">{opinion.comment}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {opinionReactionChoices.map((reaction) => (
          <button
            className="rounded-md border border-[#cbd4c4] px-2 py-1 text-xs font-medium capitalize text-[#34423a] transition hover:bg-[#e7ebe2]"
            key={reaction}
            onClick={() => onReact(reaction)}
            type="button"
          >
            {reaction} {countReactions(reactions, reaction) || ""}
          </button>
        ))}
      </div>
    </article>
  );
}

function CreatePollModal({
  form,
  onChange,
  onClose,
  onSubmit,
}: {
  form: PollForm;
  onChange: (form: PollForm) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const { t } = useLocalization();

  function updateForm<K extends keyof PollForm>(key: K, value: PollForm[K]) {
    onChange({ ...form, [key]: value });
  }

  function updateInputType(type: InputType, enabled: boolean) {
    onChange({
      ...form,
      inputTypes: { ...form.inputTypes, [type]: enabled },
    });
  }

  function updateReactionOption(reaction: SentimentReaction, enabled: boolean) {
    onChange({
      ...form,
      reactionOptions: { ...form.reactionOptions, [reaction]: enabled },
    });
  }

  return (
    <Modal title="Create opinion poll" onClose={onClose}>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <FormInput
          label="Title"
          name="title"
          onChange={(value) => updateForm("title", value)}
          required
          value={form.title}
        />
        <label className="grid gap-2 text-sm font-medium text-[#34423a]">
          {t("form.description")}
          <textarea
            className="min-h-28 rounded-md border border-[#cbd4c4] bg-white p-3 text-sm outline-none focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/20"
            onChange={(event) => updateForm("description", event.target.value)}
            required
            value={form.description}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput
            label="Category"
            name="category"
            onChange={(value) => updateForm("category", value as PollCategory)}
            options={["policy", "service", "budget", "law", "community", "other"]}
            value={form.category}
          />
          <SelectInput
            label="Status"
            name="status"
            onChange={(value) => updateForm("status", value as PollStatus)}
            options={["open", "upcoming", "closed"]}
            value={form.status}
          />
          <FormInput
            label="Region"
            name="region"
            onChange={(value) => updateForm("region", value)}
            required
            value={form.region}
          />
          <FormInput
            label="Created by"
            name="createdBy"
            onChange={(value) => updateForm("createdBy", value)}
            required
            value={form.createdBy}
          />
          <FormInput
            label="Opens at"
            name="opensAt"
            onChange={(value) => updateForm("opensAt", value)}
            required
            type="date"
            value={form.opensAt}
          />
          <FormInput
            label="Closes at"
            name="closesAt"
            onChange={(value) => updateForm("closesAt", value)}
            required
            type="date"
            value={form.closesAt}
          />
        </div>

        <fieldset className="grid gap-3 rounded-lg bg-[#f7f8f3] p-4">
          <legend className="text-sm font-semibold text-[#17201a]">
            {t("form.type")}
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(["vote", "rating", "reaction", "comment"] as InputType[]).map(
              (type) => (
                <Checkbox
                  checked={form.inputTypes[type]}
                  key={type}
                  label={type}
                  onChange={(checked) => updateInputType(type, checked)}
                />
              ),
            )}
          </div>
        </fieldset>

        {form.inputTypes.vote ? (
          <FormInput
            label="Vote options, comma separated"
            name="voteOptions"
            onChange={(value) => updateForm("voteOptions", value)}
            required
            value={form.voteOptions}
          />
        ) : null}

        {form.inputTypes.rating ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="Rating minimum"
              name="ratingMin"
              onChange={(value) => updateForm("ratingMin", value)}
              required
              type="number"
              value={form.ratingMin}
            />
            <FormInput
              label="Rating maximum"
              name="ratingMax"
              onChange={(value) => updateForm("ratingMax", value)}
              required
              type="number"
              value={form.ratingMax}
            />
            <FormInput
              label="Minimum label"
              name="ratingMinLabel"
              onChange={(value) => updateForm("ratingMinLabel", value)}
              value={form.ratingMinLabel}
            />
            <FormInput
              label="Maximum label"
              name="ratingMaxLabel"
              onChange={(value) => updateForm("ratingMaxLabel", value)}
              value={form.ratingMaxLabel}
            />
          </div>
        ) : null}

        {form.inputTypes.reaction ? (
          <fieldset className="grid gap-3 rounded-lg bg-[#f7f8f3] p-4">
            <legend className="text-sm font-semibold text-[#17201a]">
              {t("form.reaction")}
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {reactionChoices.map((reaction) => (
                <Checkbox
                  checked={form.reactionOptions[reaction]}
                  key={reaction}
                  label={reaction}
                  onChange={(checked) => updateReactionOption(reaction, checked)}
                />
              ))}
            </div>
          </fieldset>
        ) : null}

        <div className="grid gap-2 rounded-lg bg-[#f7f8f3] p-4">
          <Checkbox
            checked={form.allowAnonymous}
            label="Allow anonymous responses"
            onChange={(checked) => updateForm("allowAnonymous", checked)}
          />
          <Checkbox
            checked={form.allowMultipleResponses}
            label="Allow multiple responses"
            onChange={(checked) => updateForm("allowMultipleResponses", checked)}
          />
        </div>

        <FormInput
          label="Tags, comma separated"
          name="tags"
          onChange={(value) => updateForm("tags", value)}
          value={form.tags}
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
      <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl">
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
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
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
  onChange?: (value: string) => void;
  options: readonly string[];
  value?: string;
}) {
  const { t } = useLocalization();

  return (
    <label className="grid gap-2 text-sm font-medium text-[#34423a]">
      {translateLabel(t, label)}
      <select
        className="h-11 rounded-md border border-[#cbd4c4] bg-white px-3 text-sm capitalize outline-none focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/20"
        name={name}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        required
        value={value}
      >
        <option value="">{translateLabel(t, label)}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  const { t } = useLocalization();

  return (
    <label className="flex items-center gap-2 text-sm font-medium capitalize text-[#34423a]">
      <input
        checked={checked}
        className="h-4 w-4 accent-[#173c32]"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      {translateLabel(t, label)}
    </label>
  );
}

function countReactions(reactions: PublicReaction[], reaction: OpinionReaction) {
  return reactions.filter((item) => item.reaction === reaction).length;
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

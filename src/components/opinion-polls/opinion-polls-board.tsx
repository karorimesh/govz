"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FilePlus2,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useLocalization } from "@/components/localization/localization-provider";
import {
  createOpinionPoll,
  createPublicInput,
  createPublicReaction,
  deleteOpinionPoll,
  listOpinionPolls,
  listPublicInputs,
  listPublicReactions,
  updateOpinionPoll,
  type InputType,
  type OpinionReaction,
  type Poll,
  type PollCategory,
  type PollInput,
  type PollStatus,
  type PublicInput,
  type PublicReaction,
  type SentimentReaction,
} from "@/lib/firebase/opinion-polls";
import { translateLabel } from "@/lib/localization/labels";

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

type LoadingStatus = "loading" | "ready" | "error";

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

export function OpinionPollsBoard() {
  const { country, t } = useLocalization();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [status, setStatus] = useState<LoadingStatus>("loading");
  const [error, setError] = useState("");
  const [opinions, setOpinions] = useState<PublicInput[]>([]);
  const [opinionsStatus, setOpinionsStatus] =
    useState<LoadingStatus>("loading");
  const [opinionsError, setOpinionsError] = useState("");
  const [opinionReactions, setOpinionReactions] = useState<PublicReaction[]>(
    [],
  );
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [pollForm, setPollForm] = useState<PollForm>(blankPollForm);
  const [editForm, setEditForm] = useState<PollForm>(blankPollForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadPolls() {
      setStatus("loading");
      setError("");
      setNotice("");
      setPolls([]);
      setPage(1);
      setActivePoll(null);

      try {
        const loadedPolls = await listOpinionPolls(country.name);

        if (!isActive) {
          return;
        }

        setPolls(sortPolls(loadedPolls));
        setStatus("ready");
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        console.error("[opinion-polls] list failed", loadError);
        setStatus("error");
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load opinion polls right now.",
        );
      }
    }

    loadPolls();

    return () => {
      isActive = false;
    };
  }, [country.name]);

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
        poll.country,
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

  async function openPoll(poll: Poll) {
    setActivePoll(poll);
    setOpinions([]);
    setOpinionReactions([]);
    setOpinionsStatus("loading");
    setOpinionsError("");

    try {
      const [loadedOpinions, loadedReactions] = await Promise.all([
        listPublicInputs({ country: country.name, pollId: poll.id }),
        listPublicReactions({ country: country.name, pollId: poll.id }),
      ]);

      setOpinions(sortOpinions(loadedOpinions));
      setOpinionReactions(loadedReactions);
      setOpinionsStatus("ready");
    } catch (loadError) {
      console.error("[opinion-polls] input list failed", loadError);
      setOpinionsStatus("error");
      setOpinionsError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load public opinions right now.",
      );
    }
  }

  async function createPoll(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await submitPoll({
      form: pollForm,
      onSuccess: (savedPoll) => {
        setPolls((currentPolls) => sortPolls([savedPoll, ...currentPolls]));
        setPollForm(blankPollForm);
        setIsCreateOpen(false);
        setPage(1);
        setNotice(`${savedPoll.title} was created for ${country.name}.`);
      },
    });
  }

  async function updatePoll(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingPoll) {
      return;
    }

    await submitPoll({
      existingId: editingPoll.id,
      form: editForm,
      onSuccess: (savedPoll) => {
        setPolls((currentPolls) =>
          sortPolls(
            currentPolls.map((poll) =>
              poll.id === savedPoll.id ? savedPoll : poll,
            ),
          ),
        );
        setEditingPoll(null);
        setNotice(`${savedPoll.title} was updated for ${country.name}.`);
      },
    });
  }

  async function submitPoll({
    existingId,
    form,
    onSuccess,
  }: {
    existingId?: string;
    form: PollForm;
    onSuccess: (poll: Poll) => void;
  }) {
    const pollInput = toPollInput(form, country.name);

    if (!pollInput.inputTypes.length) {
      setNotice("Select at least one public input type.");
      return;
    }

    if (pollInput.inputTypes.includes("vote") && !pollInput.voteOptions?.length) {
      setNotice("Add vote options for polls that support voting.");
      return;
    }

    if (
      pollInput.inputTypes.includes("reaction") &&
      !pollInput.reactionOptions?.length
    ) {
      setNotice("Add reaction options for polls that support reactions.");
      return;
    }

    setIsSubmitting(true);
    setNotice("");

    try {
      const savedPoll = existingId
        ? await updateOpinionPoll(existingId, pollInput)
        : await createOpinionPoll(pollInput);

      onSuccess(savedPoll);
    } catch (submitError) {
      console.error("[opinion-polls] save failed", submitError);
      setNotice(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save opinion poll right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deletePoll(poll: Poll) {
    const confirmed = window.confirm(`Delete "${poll.title}"?`);

    if (!confirmed) {
      return;
    }

    setNotice("");

    try {
      await deleteOpinionPoll(poll.id);
      setPolls((currentPolls) =>
        currentPolls.filter((currentPoll) => currentPoll.id !== poll.id),
      );
      setActivePoll((currentPoll) =>
        currentPoll?.id === poll.id ? null : currentPoll,
      );
      setNotice(`${poll.title} was deleted for ${country.name}.`);
    } catch (deleteError) {
      console.error("[opinion-polls] delete failed", deleteError);
      setNotice(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete opinion poll right now.",
      );
    }
  }

  async function submitOpinion(
    event: FormEvent<HTMLFormElement>,
    poll: Poll,
    onComplete: () => void,
  ) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setIsSubmitting(true);
    setNotice("");

    try {
      const savedOpinion = await createPublicInput({
        country: country.name,
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
        submittedAt: new Date().toISOString(),
      });

      setOpinions((currentOpinions) =>
        sortOpinions([savedOpinion, ...currentOpinions]),
      );
      setNotice(`Your public input was recorded for ${country.name}.`);
      onComplete();
    } catch (submitError) {
      console.error("[opinion-polls] input save failed", submitError);
      setNotice(
        submitError instanceof Error
          ? submitError.message
          : "Unable to record public input right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function reactToOpinion(opinion: PublicInput, reaction: OpinionReaction) {
    setNotice("");

    try {
      const savedReaction = await createPublicReaction({
        country: country.name,
        pollId: opinion.pollId,
        opinionId: opinion.id,
        reaction,
        participantId: opinion.participant.publicId,
        submittedAt: new Date().toISOString(),
      });

      setOpinionReactions((currentReactions) => [
        savedReaction,
        ...currentReactions,
      ]);
      setNotice(`Reaction recorded for ${country.name}: ${reaction}.`);
    } catch (submitError) {
      console.error("[opinion-polls] reaction save failed", submitError);
      setNotice(
        submitError instanceof Error
          ? submitError.message
          : "Unable to record reaction right now.",
      );
    }
  }

  function openEdit(poll: Poll) {
    setEditingPoll(poll);
    setEditForm(toForm(poll));
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
          <p className="mt-3 text-sm text-[#61705d]">
            Showing opinion polls for {country.name}
          </p>
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

      {status === "loading" ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {status === "error" ? (
        <div className="rounded-lg border border-[#d9dfd2] bg-white p-8 text-center text-[#4d5b4a]">
          {error}
        </div>
      ) : null}

      {status === "ready" ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visiblePolls.map((poll) => (
            <PollCard
              key={poll.id}
              onDelete={() => deletePoll(poll)}
              onEdit={() => openEdit(poll)}
              onOpen={() => openPoll(poll)}
              poll={poll}
            />
          ))}
        </div>
      ) : null}

      {status === "ready" && visiblePolls.length === 0 ? (
        <div className="rounded-lg border border-[#d9dfd2] bg-white p-8 text-center text-[#4d5b4a]">
          No opinion polls match your search for {country.name}.
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
          disabled={isSubmitting}
          onClose={() => setActivePoll(null)}
          onReact={reactToOpinion}
          onSubmit={submitOpinion}
          opinionReactions={opinionReactions}
          opinions={opinions}
          opinionsError={opinionsError}
          opinionsStatus={opinionsStatus}
          poll={activePoll}
        />
      ) : null}

      {isCreateOpen ? (
        <PollFormModal
          disabled={isSubmitting}
          form={pollForm}
          onChange={setPollForm}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={createPoll}
          submitLabel={t("common.create")}
          title={`Create opinion poll for ${country.name}`}
        />
      ) : null}

      {editingPoll ? (
        <PollFormModal
          disabled={isSubmitting}
          form={editForm}
          onChange={setEditForm}
          onClose={() => setEditingPoll(null)}
          onSubmit={updatePoll}
          submitLabel="Update"
          title={`Edit ${editingPoll.title}`}
        />
      ) : null}
    </section>
  );
}

function PollCard({
  onDelete,
  onEdit,
  onOpen,
  poll,
}: {
  onDelete: () => void;
  onEdit: () => void;
  onOpen: () => void;
  poll: Poll;
}) {
  return (
    <article className="flex min-h-[390px] flex-col rounded-lg border border-[#d9dfd2] bg-white p-5 shadow-sm">
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
      <div className="mt-auto grid grid-cols-2 gap-3 pt-5">
        <button
          className="h-10 rounded-md bg-[#173c32] px-4 text-sm font-semibold text-white transition hover:bg-[#245548]"
          onClick={onOpen}
          type="button"
        >
          Open Poll
        </button>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#cbd4c4] px-4 text-sm font-semibold text-[#34423a] transition hover:bg-[#e7ebe2]"
          onClick={onEdit}
          type="button"
        >
          <Pencil aria-hidden="true" size={16} />
          Edit
        </button>
        <button
          className="col-span-2 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#e3c6b8] px-4 text-sm font-semibold text-[#9a3412] transition hover:bg-[#fff7ed]"
          onClick={onDelete}
          type="button"
        >
          <Trash2 aria-hidden="true" size={16} />
          Delete
        </button>
      </div>
    </article>
  );
}

function PollDetailsModal({
  disabled,
  onClose,
  onReact,
  onSubmit,
  opinionReactions,
  opinions,
  opinionsError,
  opinionsStatus,
  poll,
}: {
  disabled: boolean;
  onClose: () => void;
  onReact: (opinion: PublicInput, reaction: OpinionReaction) => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
    poll: Poll,
    onComplete: () => void,
  ) => void;
  opinionReactions: PublicReaction[];
  opinions: PublicInput[];
  opinionsError: string;
  opinionsStatus: LoadingStatus;
  poll: Poll;
}) {
  const [isResponding, setIsResponding] = useState(false);

  return (
    <Modal title={poll.title} onClose={onClose}>
      <div className="grid gap-6">
        <section className="space-y-4">
          <p className="text-sm leading-6 text-[#53604f]">{poll.description}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Detail label="Country" value={poll.country} />
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
            disabled={disabled}
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
            {opinionsStatus === "loading" ? (
              <>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    className="h-24 animate-pulse rounded-md bg-[#e1e7dc]"
                    key={index}
                  />
                ))}
              </>
            ) : null}
            {opinionsStatus === "error" ? (
              <p className="rounded-md bg-[#f7f8f3] p-4 text-sm text-[#9a3412]">
                {opinionsError}
              </p>
            ) : null}
            {opinionsStatus === "ready" && opinions.length ? (
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
            ) : null}
            {opinionsStatus === "ready" && !opinions.length ? (
              <p className="rounded-md bg-[#f7f8f3] p-4 text-sm text-[#61705d]">
                No public opinions have been submitted for this poll yet.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </Modal>
  );
}

function OpinionInputForm({
  disabled,
  onSubmit,
  poll,
}: {
  disabled: boolean;
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
        className="h-11 rounded-md bg-[#173c32] px-4 text-sm font-semibold text-white transition hover:bg-[#245548] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
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
          <p className="text-xs text-[#61705d]">
            {formatSubmittedAt(opinion.submittedAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-[#61705d]">
          {opinion.vote ? <span>Vote: {opinion.vote}</span> : null}
          {opinion.rating ? <span>Rating: {opinion.rating}</span> : null}
          {opinion.reaction ? <span>Reaction: {opinion.reaction}</span> : null}
        </div>
      </div>
      {opinion.comment ? (
        <p className="mt-3 text-sm leading-6 text-[#53604f]">
          {opinion.comment}
        </p>
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

function PollFormModal({
  disabled,
  form,
  onChange,
  onClose,
  onSubmit,
  submitLabel,
  title,
}: {
  disabled: boolean;
  form: PollForm;
  onChange: (form: PollForm) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  title: string;
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
    <Modal title={title} onClose={onClose}>
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
          className="h-11 rounded-md bg-[#173c32] px-4 text-sm font-semibold text-white transition hover:bg-[#245548] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          type="submit"
        >
          {submitLabel}
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

function CardSkeleton() {
  return (
    <article className="min-h-[390px] rounded-lg border border-[#d9dfd2] bg-white p-5 shadow-sm">
      <div className="flex justify-between">
        <div className="h-6 w-28 animate-pulse rounded-full bg-[#e1e7dc]" />
        <div className="h-6 w-20 animate-pulse rounded-full bg-[#e1e7dc]" />
      </div>
      <div className="mt-5 h-7 w-4/5 animate-pulse rounded bg-[#e1e7dc]" />
      <div className="mt-4 space-y-2">
        <div className="h-4 animate-pulse rounded bg-[#e1e7dc]" />
        <div className="h-4 animate-pulse rounded bg-[#e1e7dc]" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-[#e1e7dc]" />
      </div>
    </article>
  );
}

function toPollInput(form: PollForm, country: string): PollInput {
  const inputTypes = Object.entries(form.inputTypes)
    .filter(([, enabled]) => enabled)
    .map(([type]) => type as InputType);

  return {
    country,
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    status: form.status,
    region: form.region.trim(),
    createdBy: form.createdBy.trim(),
    dates: {
      opensAt: form.opensAt,
      closesAt: form.closesAt,
    },
    inputTypes,
    voteOptions: inputTypes.includes("vote")
      ? splitList(form.voteOptions)
      : undefined,
    ratingScale: inputTypes.includes("rating")
      ? {
          min: Number(form.ratingMin),
          max: Number(form.ratingMax),
          labels: {
            min: form.ratingMinLabel,
            max: form.ratingMaxLabel,
          },
        }
      : undefined,
    reactionOptions: inputTypes.includes("reaction")
      ? (Object.entries(form.reactionOptions)
          .filter(([, enabled]) => enabled)
          .map(([reaction]) => reaction) as SentimentReaction[])
      : undefined,
    allowAnonymous: form.allowAnonymous,
    allowMultipleResponses: form.allowMultipleResponses,
    tags: splitList(form.tags),
  };
}

function toForm(poll: Poll): PollForm {
  return {
    title: poll.title,
    description: poll.description,
    category: poll.category,
    status: poll.status,
    region: poll.region,
    createdBy: poll.createdBy,
    opensAt: poll.dates.opensAt,
    closesAt: poll.dates.closesAt,
    inputTypes: {
      vote: poll.inputTypes.includes("vote"),
      rating: poll.inputTypes.includes("rating"),
      reaction: poll.inputTypes.includes("reaction"),
      comment: poll.inputTypes.includes("comment"),
    },
    voteOptions: poll.voteOptions?.join(", ") ?? "",
    ratingMin: String(poll.ratingScale?.min ?? 1),
    ratingMax: String(poll.ratingScale?.max ?? 5),
    ratingMinLabel: poll.ratingScale?.labels?.min ?? "",
    ratingMaxLabel: poll.ratingScale?.labels?.max ?? "",
    reactionOptions: {
      support: poll.reactionOptions?.includes("support") ?? false,
      oppose: poll.reactionOptions?.includes("oppose") ?? false,
      neutral: poll.reactionOptions?.includes("neutral") ?? false,
      concerned: poll.reactionOptions?.includes("concerned") ?? false,
      excited: poll.reactionOptions?.includes("excited") ?? false,
    },
    allowAnonymous: poll.allowAnonymous,
    allowMultipleResponses: poll.allowMultipleResponses,
    tags: poll.tags.join(", "),
  };
}

function countReactions(reactions: PublicReaction[], reaction: OpinionReaction) {
  return reactions.filter((item) => item.reaction === reaction).length;
}

function sortPolls(items: Poll[]) {
  return [...items].sort((firstItem, secondItem) =>
    firstItem.title.localeCompare(secondItem.title),
  );
}

function sortOpinions(items: PublicInput[]) {
  return [...items].sort((firstItem, secondItem) =>
    secondItem.submittedAt.localeCompare(firstItem.submittedAt),
  );
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatSubmittedAt(value: string) {
  if (!value) {
    return "Submitted";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

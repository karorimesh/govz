"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocalization } from "@/components/localization/localization-provider";

type Story = {
  title: string;
  imgLink: string;
  summary: string;
  author: string;
  link: string;
};

const storiesPerPage = 5;

export function TopStories() {
  const { country, language, t } = useLocalization();
  const [stories, setStories] = useState<Story[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadStories() {
      setStatus("loading");
      setError("");
      setStories([]);
      setPage(1);

      try {
        const requestPayload = {
          selectedCountry: country.name,
          selectedLanguage: language.name,
        };

        console.log("[homepage-stories] request", requestPayload);

        const response = await fetch("/api/homepage-stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestPayload),
          signal: controller.signal,
        });
        const data = (await response.json()) as {
          stories?: Story[];
          error?: string;
        };

        console.log("[homepage-stories] response", {
          ok: response.ok,
          status: response.status,
          data,
        });

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load stories.");
        }

        setStories(data.stories ?? []);
        setStatus("ready");
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("[homepage-stories] request failed", loadError);
        setStatus("error");
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load governance stories right now.",
        );
      }
    }

    loadStories();

    return () => controller.abort();
  }, [country.name, language.name]);

  const filteredStories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return stories;
    }

    return stories.filter((story) => {
      const searchableText = [
        story.title,
        story.summary,
        story.author,
      ].join(" ");

      return searchableText.toLowerCase().includes(normalizedQuery);
    });
  }, [query, stories]);

  const pageCount = Math.max(
    1,
    Math.ceil(filteredStories.length / storiesPerPage),
  );
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * storiesPerPage;
  const visibleStories = filteredStories.slice(
    pageStart,
    pageStart + storiesPerPage,
  );
  const [featuredStory, ...secondaryStories] = visibleStories;

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-8 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-[#d9dfd2] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#61705d]">
            Top stories
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#17201a] sm:text-4xl">
            Country briefings and public updates
          </h1>
        </div>

        <label className="relative w-full max-w-md" htmlFor="story-search">
          <span className="sr-only">{t("common.search")}</span>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#61705d]"
            size={19}
          />
          <input
            className="h-11 w-full rounded-md border border-[#cbd4c4] bg-white pl-10 pr-3 text-sm text-[#17201a] outline-none transition placeholder:text-[#74806e] focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/20"
            id="story-search"
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder={t("common.search")}
            type="search"
            value={query}
          />
        </label>
      </div>

      {status === "loading" ? (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <StorySkeleton featured />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {Array.from({ length: 4 }).map((_, index) => (
              <StorySkeleton key={index} />
            ))}
          </div>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="rounded-lg border border-[#d9dfd2] bg-white p-8 text-center text-[#4d5b4a]">
          {error}
        </div>
      ) : null}

      {status === "ready" && featuredStory ? (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <StoryCard featured story={featuredStory} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {secondaryStories.map((story) => (
              <StoryCard key={story.title} story={story} />
            ))}
          </div>
        </div>
      ) : null}

      {status === "ready" && !featuredStory ? (
        <div className="rounded-lg border border-[#d9dfd2] bg-white p-8 text-center text-[#4d5b4a]">
          No stories match your search.
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-[#d9dfd2] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#61705d]">
          Showing {visibleStories.length} of {filteredStories.length} stories
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
    </section>
  );
}

function StoryCard({
  featured = false,
  story,
}: {
  featured?: boolean;
  story: Story;
}) {
  return (
    <article
      className={`overflow-hidden rounded-lg border border-[#d9dfd2] bg-white shadow-sm ${
        featured
          ? "grid lg:min-h-[520px]"
          : "grid sm:grid-cols-[160px_1fr] lg:grid-cols-[190px_1fr]"
      }`}
    >
      <Link className="group relative min-h-56 overflow-hidden" href={story.link}>
        {story.imgLink ? (
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center transition duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${story.imgLink})` }}
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-[#dfe6d8]"
          />
        )}
      </Link>
      <div className={featured ? "p-6 sm:p-8" : "p-5"}>
        <p className="text-sm font-medium text-[#61705d]">By {story.author}</p>
        <h2
          className={`mt-2 font-semibold text-[#17201a] ${
            featured ? "text-3xl sm:text-4xl" : "text-xl"
          }`}
        >
          <Link className="hover:text-[#2f6f5e]" href={story.link}>
            {story.title}
          </Link>
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#53604f]">{story.summary}</p>
        <Link
          className="mt-5 inline-flex text-sm font-semibold text-[#2f6f5e] hover:text-[#173c32]"
          href={story.link}
        >
          Read story
        </Link>
      </div>
    </article>
  );
}

function StorySkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <article
      className={`overflow-hidden rounded-lg border border-[#d9dfd2] bg-white shadow-sm ${
        featured
          ? "grid lg:min-h-[520px]"
          : "grid sm:grid-cols-[160px_1fr] lg:grid-cols-[190px_1fr]"
      }`}
    >
      <div className="min-h-56 animate-pulse bg-[#e1e7dc]" />
      <div className={featured ? "space-y-4 p-6 sm:p-8" : "space-y-4 p-5"}>
        <div className="h-4 w-28 animate-pulse rounded bg-[#e1e7dc]" />
        <div className="h-8 w-4/5 animate-pulse rounded bg-[#e1e7dc]" />
        <div className="space-y-2">
          <div className="h-4 animate-pulse rounded bg-[#e1e7dc]" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-[#e1e7dc]" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-[#e1e7dc]" />
        </div>
      </div>
    </article>
  );
}

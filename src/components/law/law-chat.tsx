"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";
import { useLocalization } from "@/components/localization/localization-provider";
import type { Law } from "@/lib/prompts/law";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type LoadingStatus = "loading" | "ready" | "error";
type ChatStatus = "idle" | "submitting";

export function LawChat() {
  const { country, language, t } = useLocalization();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [laws, setLaws] = useState<Law[]>([]);
  const [lawsStatus, setLawsStatus] = useState<LoadingStatus>("loading");
  const [lawsError, setLawsError] = useState("");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatStatus, setChatStatus] = useState<ChatStatus>("idle");
  const [chatError, setChatError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadLatestLaws() {
      setLawsStatus("loading");
      setLawsError("");
      setLaws([]);
      setMessages([]);

      try {
        const response = await fetch("/api/latest-laws", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selectedCountry: country.name,
            selectedLanguage: language.name,
          }),
          signal: controller.signal,
        });
        const data = (await response.json()) as {
          laws?: Law[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load latest laws.");
        }

        setLaws(data.laws ?? []);
        setLawsStatus("ready");
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("[latest-laws] request failed", loadError);
        setLawsStatus("error");
        setLawsError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load latest laws right now.",
        );
      }
    }

    loadLatestLaws();

    return () => controller.abort();
  }, [country.name, language.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, lawsStatus]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const question = prompt.trim();

    if (!question || chatStatus === "submitting") {
      return;
    }

    setChatStatus("submitting");
    setChatError("");
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: question,
      },
    ]);
    setPrompt("");

    try {
      const response = await fetch("/api/law-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedCountry: country.name,
          selectedLanguage: language.name,
          userQuestion: question,
        }),
      });
      const data = (await response.json()) as {
        answer?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to answer that question.");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            data.answer?.trim() ||
            "I could not find enough reliable information to answer that.",
        },
      ]);
    } catch (submitError) {
      console.error("[law-chat] request failed", submitError);
      setChatError(
        submitError instanceof Error
          ? submitError.message
          : "The GOVZ legal assistant is unavailable right now.",
      );
    } finally {
      setChatStatus("idle");
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-5 py-8 lg:px-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#61705d]">
          Legal desk
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#17201a] sm:text-4xl">
          The Law
        </h1>
      </div>

      <div className="flex min-h-[680px] flex-1 flex-col overflow-hidden rounded-lg border border-[#d9dfd2] bg-white shadow-sm">
        <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
          <article className="max-w-3xl rounded-lg rounded-tl-sm bg-[#eef3e9] p-5 text-[#17201a]">
            <p className="text-sm font-semibold text-[#2f6f5e]">
              GOVZ legal assistant
            </p>
            <p className="mt-2 text-sm leading-6 text-[#4d5b4a]">
              Here are the 5 latest laws the government has implemented or is
              implementing. Ask a question below about rights, obligations,
              bills, or timelines.
            </p>

            {lawsStatus === "loading" ? (
              <div className="mt-5 space-y-3" aria-label="Loading latest laws">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    className="rounded-lg border border-[#d7dfcf] bg-white p-4"
                    key={index}
                  >
                    <div className="h-5 w-3/4 animate-pulse rounded bg-[#e1e7dc]" />
                    <div className="mt-3 space-y-2">
                      <div className="h-4 animate-pulse rounded bg-[#e1e7dc]" />
                      <div className="h-4 w-5/6 animate-pulse rounded bg-[#e1e7dc]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {lawsStatus === "error" ? (
              <div className="mt-5 rounded-lg border border-[#d7dfcf] bg-white p-4 text-sm text-[#53604f]">
                {lawsError}
              </div>
            ) : null}

            {lawsStatus === "ready" ? (
              <div className="mt-5 space-y-3">
                {laws.map((law, index) => (
                  <section
                    className="rounded-lg border border-[#d7dfcf] bg-white p-4"
                    key={law.title}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <h2 className="text-base font-semibold text-[#17201a]">
                        {index + 1}. {law.title}
                      </h2>
                      <p className="text-sm font-medium text-[#61705d]">
                        {law.dates}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#53604f]">
                      {law.summary}
                    </p>
                  </section>
                ))}
              </div>
            ) : null}
          </article>

          {messages.map((message) => (
            <article
              className={`max-w-3xl rounded-lg p-4 text-sm leading-6 ${
                message.role === "user"
                  ? "ml-auto rounded-tr-sm bg-[#173c32] text-white"
                  : "rounded-tl-sm bg-[#eef3e9] text-[#17201a]"
              }`}
              key={message.id}
            >
              {message.content}
            </article>
          ))}

          {chatStatus === "submitting" ? (
            <article className="max-w-3xl rounded-lg rounded-tl-sm bg-[#eef3e9] p-4 text-sm leading-6 text-[#17201a]">
              GOVZ legal assistant is checking the latest information...
            </article>
          ) : null}

          {chatError ? (
            <p className="text-sm text-[#9a3412]" role="alert">
              {chatError}
            </p>
          ) : null}

          <div ref={messagesEndRef} />
        </div>

        <form
          className="border-t border-[#d9dfd2] bg-[#f7f8f3] p-4"
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="law-prompt">
            {t("form.message")}
          </label>
          <div className="flex gap-3">
            <input
              className="h-12 min-w-0 flex-1 rounded-md border border-[#cbd4c4] bg-white px-4 text-sm text-[#17201a] outline-none transition placeholder:text-[#74806e] focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/20"
              id="law-prompt"
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={t("form.message")}
              type="text"
              value={prompt}
            />
            <button
              aria-label={t("common.submit")}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#173c32] text-white transition hover:bg-[#245548] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!prompt.trim() || chatStatus === "submitting"}
              type="submit"
            >
              <SendHorizonal aria-hidden="true" size={20} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

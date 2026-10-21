"use client";

import { useEffect, useRef, useState } from "react";
import { askQuestion } from "../lib/api";

const SUGGESTIONS = [
  "Summarize my data",
  "What are the key points?",
  "What topics do you know about?",
];

export default function Chat({ hasSources }) {
  const [messages, setMessages] = useState([]); // { role: "user" | "bot", text, sources, cached, error }
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // scroll to the newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text) {
    const q = text.trim();
    if (!q || loading) return;

    setQuestion("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", text: q }]);

    try {
      const data = await askQuestion(q);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.answer,
          sources: data.sources,
          cached: data.cached,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: err.message, error: true },
      ]);
    }

    setLoading(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    send(question);
  }

  return (
    <section className="flex h-[85vh] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white lg:h-auto lg:min-h-0">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <div>
            <h2 className="font-semibold">Assistant</h2>
            <p className="text-xs text-slate-500">
              Answers only from your sources
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="rounded-full border border-slate-200 px-4 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
          >
            + New chat
          </button>
        )}
      </header>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-6 sm:px-8">
        {messages.length === 0 && (
          <div className="m-auto max-w-md text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-emerald-50 text-3xl">
              💬
            </div>
            <h3 className="text-xl font-semibold">How can I help you?</h3>
            <p className="mt-1 text-sm text-slate-500">
              {hasSources
                ? "Ask anything about the knowledge you added."
                : "Add some knowledge on the left to get started."}
            </p>

            {hasSources && (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-emerald-400 hover:text-emerald-700"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[80%] whitespace-pre-wrap rounded-3xl rounded-br-md bg-emerald-600 px-4 py-2.5 text-white">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                AI
              </div>
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-3xl rounded-tl-md px-4 py-2.5 ${
                  m.error
                    ? "bg-red-50 text-red-700"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {m.text}

                {/* sources + cache badge */}
                {!m.error && (m.cached || m.sources?.length > 0) && (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-200 pt-2.5">
                    {m.cached && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        ⚡ Cached
                      </span>
                    )}
                    {m.sources?.map((s) => (
                      <span
                        key={s}
                        title={s}
                        className="max-w-[220px] truncate rounded-full bg-white px-2.5 py-0.5 text-xs text-slate-500 ring-1 ring-slate-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ),
        )}

        {/* typing dots */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-900 text-xs font-bold text-white">
              AI
            </div>
            <div className="flex gap-1.5 rounded-3xl rounded-tl-md bg-slate-100 px-4 py-4">
              <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 sm:px-8 sm:pb-6">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1.5 pl-5 transition focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100">
          <input
            className="flex-1 bg-transparent py-2 outline-none placeholder-slate-400 text-black"
            placeholder="Ask a question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            disabled={loading || !question.trim()}
            aria-label="Send"
            className="grid h-10 w-10 place-items-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className="h-5 w-5"
            >
              <path
                d="M5 12h14M13 6l6 6-6 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </form>
    </section>
  );
}

"use client";

import { useRef, useState } from "react";
import { addText, addUrl, addFile, deleteSource } from "../lib/api";

const TABS = [
  { key: "text", label: "Text", icon: "📝" },
  { key: "url", label: "Link", icon: "🌐" },
  { key: "file", label: "File", icon: "📄" },
];

const ICONS = { text: "📝", url: "🌐", file: "📄" };

export default function Sidebar({ sources, onChange, error }) {
  const [tab, setTab] = useState("text");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { ok: boolean, text: string }
  const fileInput = useRef(null);

  const canSubmit =
    !loading &&
    ((tab === "text" && text.trim()) ||
      (tab === "url" && url.trim()) ||
      (tab === "file" && file));

  const totalChunks = sources.reduce((sum, s) => sum + (s.chunkCount || 0), 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let source;
      if (tab === "text") source = await addText(title || "Untitled", text);
      if (tab === "url") source = await addUrl(url);
      if (tab === "file") source = await addFile(file);

      // clear the form
      setTitle("");
      setText("");
      setUrl("");
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";

      setMessage({
        ok: true,
        text: `Added "${source.name}" (${source.chunkCount} chunks)`,
      });
      onChange();
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    }

    setLoading(false);
  }

  async function handleDelete(source) {
    if (!confirm(`Delete "${source.name}"?`)) return;
    try {
      await deleteSource(source._id);
      onChange();
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20";

  return (
    <aside className="flex min-h-0 flex-col gap-5 rounded-3xl bg-slate-900 p-5 text-slate-100">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500 text-lg font-bold text-slate-900">
          AI
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight">My SiteGPT</h1>
          <p className="text-sm text-slate-400">Chat with your own data</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-800/60 px-4 py-3">
          <p className="text-2xl font-bold">{sources.length}</p>
          <p className="text-xs text-slate-400">Sources</p>
        </div>
        <div className="rounded-2xl bg-slate-800/60 px-4 py-3">
          <p className="text-2xl font-bold">{totalChunks}</p>
          <p className="text-xs text-slate-400">Chunks</p>
        </div>
      </div>

      {/* Add form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Add knowledge
        </h2>

        <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-800 p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                setMessage(null);
              }}
              className={`rounded-lg py-2 text-sm transition ${
                tab === t.key
                  ? "bg-slate-700 font-semibold text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="mr-1">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "text" && (
          <>
            <input
              className={inputClass}
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className={`${inputClass} resize-none`}
              rows={4}
              placeholder="Paste FAQs, notes, policies..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </>
        )}

        {tab === "url" && (
          <input
            className={inputClass}
            type="url"
            placeholder="https://example.com/about"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        )}

        {tab === "file" && (
          <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-slate-700 p-6 text-center transition hover:border-emerald-400 hover:bg-slate-800">
            <input
              ref={fileInput}
              type="file"
              accept=".pdf,.docx,.txt,.md,.csv"
              hidden
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
            <span className="text-2xl">⬆️</span>
            <span className="break-all text-sm font-medium">
              {file ? file.name : "Click to choose a file"}
            </span>
            <span className="text-xs text-slate-500">
              PDF, DOCX, TXT, MD, CSV
            </span>
          </label>
        )}

        <button
          disabled={!canSubmit}
          className="rounded-xl bg-emerald-500 py-2.5 font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Adding..." : "Add to knowledge"}
        </button>

        {message && (
          <p
            className={`rounded-xl px-3 py-2 text-sm ${
              message.ok
                ? "bg-emerald-500/10 text-emerald-300"
                : "bg-red-500/10 text-red-300"
            }`}
          >
            {message.text}
          </p>
        )}
      </form>

      {/* Source list */}
      <section className="flex max-h-72 min-h-0 flex-col gap-3 lg:max-h-none lg:flex-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Your sources
        </h2>

        {error && (
          <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        {!error && sources.length === 0 && (
          <p className="text-sm text-slate-500">Nothing added yet.</p>
        )}

        <ul className="flex flex-col gap-2 overflow-y-auto pr-1">
          {sources.map((s) => (
            <li
              key={s._id}
              className="group flex items-center gap-3 rounded-xl bg-slate-800/60 px-3 py-2.5 transition hover:bg-slate-800"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-700/60">
                {ICONS[s.type] || "📄"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" title={s.name}>
                  {s.name}
                </p>
                <p className="text-xs text-slate-500">{s.chunkCount} chunks</p>
              </div>
              <button
                onClick={() => handleDelete(s)}
                aria-label={`Delete ${s.name}`}
                className="rounded-lg px-2 py-1 text-lg leading-none text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

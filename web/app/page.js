"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";
import { getSources } from "../lib/api";

export default function Home() {
  const [sources, setSources] = useState([]);
  const [error, setError] = useState("");

  async function loadSources() {
    try {
      setSources(await getSources());
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadSources();
  }, []);

  return (
    <main className="grid gap-4 p-3 sm:p-4 lg:h-screen lg:grid-cols-[360px_1fr]">
      <Sidebar sources={sources} onChange={loadSources} error={error} />
      <Chat hasSources={sources.length > 0} />
    </main>
  );
}

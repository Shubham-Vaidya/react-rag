"use client";

import { useState } from "react";

type Source = {
  video_id: string;
  title: string;
  start_time: number;
  text: string;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ answer?: string; sources?: Source[]; error?: string } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      console.error(err);
      setResult({ error: err instanceof Error ? err.message : "Failed to fetch response" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-6 md:p-12">
      <div className="w-full max-w-4xl space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium">
            🍵 Chai aur React Dataset
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 via-amber-200 to-white bg-clip-text text-transparent">
            YouTube RAG Assistant
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Ask any question about React, Hooks, Virtual DOM, or Fiber architecture, and jump straight to the exact video timestamp.
          </p>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearch} className="relative w-full">
          <div className="flex flex-col sm:flex-row gap-3 p-2 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. How does useState work under the hood?"
              className="flex-1 px-5 py-4 bg-slate-950 text-slate-100 placeholder-slate-500 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-base"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Searching...
                </>
              ) : (
                "Search Video Knowledge"
              )}
            </button>
          </div>
        </form>

        {/* Display Error if exists */}
        {result?.error && (
          <div className="p-4 bg-red-900/40 border border-red-500/50 text-red-200 rounded-xl">
            <strong>Error:</strong> {result.error}
          </div>
        )}

        {/* Display Answer Card */}
        {result?.answer && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 md:p-8 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-orange-400 font-semibold text-lg border-b border-slate-800 pb-3">
                <span>🤖</span> AI Answer
              </div>
              <div className="text-slate-200 leading-relaxed whitespace-pre-wrap text-base">
                {result.answer}
              </div>
            </div>

            {/* Video Context Sources */}
            {result.sources && result.sources.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
                  <span>📌</span> Referenced Video Clip(s)
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {result.sources.map((src, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-slate-900/50 border border-slate-800/80 hover:border-orange-500/40 rounded-xl transition-all space-y-2 group"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <a
                          href={`https://www.youtube.com/watch?v=${src.video_id}&t=${src.start_time}s`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-orange-400 font-semibold group-hover:text-orange-300 transition-colors flex items-center gap-2 hover:underline"
                        >
                          ▶ {src.title}
                        </a>
                        <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-mono text-amber-300">
                          Jump to {src.start_time}s
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-slate-700 pl-3 py-1 italic">
                        &quot;{src.text}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
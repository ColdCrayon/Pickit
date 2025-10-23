import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const logo = "/logo.png";

type Article = {
  id: string;
  title: string;
  source: string;
  url: string;
  summary: string;
  date: string; // ISO string
  category: "NFL" | "NBA" | "MLB" | "NHL" | "Soccer" | "Odds" | "Analysis" | "Other";
  tags?: string[];
  image?: string;
};

// 🔧 Mock data for now (swap with live feed later)
const MOCK_NEWS: Article[] = [
  {
    id: "a1",
    title: "Line Movement Signals Value Ahead of Sunday Slate",
    source: "PickIt Insights",
    url: "#",
    summary:
      "Early sharp action pushed the spread two points, creating a potential value window before public money arrives.",
    date: new Date().toISOString(),
    category: "Odds",
    tags: ["line movement", "value", "pre-game"],
    image: "/news1.jpg",
  },
  {
    id: "a2",
    title: "Injury Watch: Key Player Upgraded to Probable",
    source: "League Wire",
    url: "#",
    summary:
      "A late status upgrade shifts projections across multiple markets. Here’s what changes in expected usage.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    category: "Analysis",
    tags: ["injury", "projection", "DFS"],
    image: "/news2.jpg",
  },
  {
    id: "a3",
    title: "Over/Under Market Tightens After Weather Update",
    source: "Sports Weather Desk",
    url: "#",
    summary:
      "Wind probability decreased in the latest forecast, nudging totals up half a point across major books.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    category: "Odds",
    tags: ["totals", "weather", "market"],
    image: "/news3.jpg",
  },
  {
    id: "a4",
    title: "Rookies on the Rise: Three Underpriced Breakouts",
    source: "PickIt Scouting",
    url: "#",
    summary:
      "Film + data spotlight three rookies trending ahead of the market. Why their roles may expand this week.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    category: "NFL",
    tags: ["rookies", "breakouts"],
  },
];

const CATEGORIES: Array<Article["category"] | "All"> = [
  "All",
  "NFL",
  "NBA",
  "MLB",
  "NHL",
  "Soccer",
  "Odds",
  "Analysis",
  "Other",
];

const News: React.FC = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  // 🔎 Client-side filter/sort (swap with server/Firebase later)
  const articles = useMemo(() => {
    let list = [...MOCK_NEWS];

    if (category !== "All") {
      list = list.filter((a) => a.category === category);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) =>
      sort === "newest"
        ? +new Date(b.date) - +new Date(a.date)
        : +new Date(a.date) - +new Date(b.date)
    );
    return list;
  }, [query, category, sort]);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url('Background.jpeg')",
        }}
      />

      {/* Header */}
      <main className="relative z-10 max-w-6xl mx-auto py-20 px-6">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-3">
            <img
              src={logo}
              alt="PickIt Logo"
              className="w-10 h-10 rounded-full border border-white/20"
            />
            <h1 className="text-3xl font-bold">News</h1>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-gray-300">
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            <span className="opacity-40">/</span>
            <Link to="/support" className="hover:text-white">
              Support
            </Link>
          </div>
        </div>

        {/* Bubble: controls + list */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-8">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-sm text-gray-300">Category</label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`px-4 py-2 rounded-full border text-sm transition ${
                      c === category
                        ? "border-white/30 bg-white/10"
                        : "border-white/10 hover:bg-white/5"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search news, tags, sources…"
                className="w-full md:w-72 bg-transparent border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-white/30"
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="bg-transparent border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-white/30"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          {/* Articles grid */}
          {articles.length === 0 ? (
            <div className="text-gray-400 text-sm">No articles match your filters.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a) => (
                <article
                  key={a.id}
                  className="rounded-2xl border border-white/10 bg-black/10 overflow-hidden flex flex-col"
                >
                  {a.image ? (
                    <div
                      className="h-36 bg-cover bg-center"
                      style={{ backgroundImage: `url('${a.image}')` }}
                      aria-hidden="true"
                    />
                  ) : (
                    <div className="h-2 bg-gradient-to-r from-yellow-400/70 to-yellow-400/0" />
                  )}

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <span className="uppercase tracking-wide">{a.source}</span>
                      <span>{fmtDate(a.date)}</span>
                    </div>
                    <h3 className="text-lg font-semibold">{a.title}</h3>
                    <p className="text-gray-300 mt-2 text-sm flex-1">{a.summary}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/10">
                        {a.category}
                      </span>
                      {a.tags?.map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5">
                      <a
                        href={a.url}
                        target={a.url.startsWith("http") ? "_blank" : undefined}
                        rel={a.url.startsWith("http") ? "noreferrer" : undefined}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-yellow-400 hover:underline"
                      >
                        Read more
                        <span aria-hidden>↗</span>
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Footer note */}
          <div className="mt-8 text-xs text-gray-400">
            Data is for informational purposes. Always verify lines before placing any bets.
          </div>
        </div>
      </main>

      {/* Shared Footer */}
      <footer className="relative z-10 py-12 px-10 border-t border-white/10 w-full text-center md:text-left">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <div className="flex items-center space-x-2">
              <img
                src={logo}
                alt="PickIt Logo"
                className="w-10 h-10 rounded-full border border-white/20"
              />
            </div>
            <span className="text-xl font-bold">PickIt</span>
          </div>
          <div className="flex space-x-8 mb-6 md:mb-0">
            <Link to="/privacy" className="text-gray-400 hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white">
              Terms of Service
            </Link>
            <Link to="/support" className="text-gray-400 hover:text-white">
              Support
            </Link>
          </div>
          <p className="text-gray-400 text-sm">© 2025 PickIt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default News;

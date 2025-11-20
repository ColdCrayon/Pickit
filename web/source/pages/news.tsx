import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useArticles } from "../hooks";
import { Footer } from "../components";

const News: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState<string | undefined>(
    undefined
  );
  const { articles, loading, error } = useArticles({
    sport: selectedSport as any,
    limitTo: 8,
    onlyPublished: true,
  });

  const fmt = (v: any) => {
    try {
      const d = v?.toDate
        ? v.toDate()
        : typeof v === "string"
          ? new Date(v)
          : v;
      return d instanceof Date && !isNaN(d.getTime())
        ? d.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        : "";
    } catch {
      return "";
    }
  };

  const sports = ["All", "MLB", "NFL", "NBA", "NHL"];

  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-hidden">
      <main className="relative z-10 max-w-6xl mx-auto py-28 px-6 pt-32">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white text-glow">Sports News</h1>
            <p className="text-sm text-gray-400">
              Latest articles and insights across all sports
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-10">
          {sports.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSport(s === "All" ? undefined : s)}
              className={`px-5 py-2 rounded-full border transition font-medium ${selectedSport === s || (s === "All" && !selectedSport)
                ? "bg-blue-500 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20"
                }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        {error && <p className="text-red-400 text-center">{error}</p>}

        {/* Article grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <Link
              key={a.id}
              to={`/news/${a.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 overflow-hidden hover:shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:border-white/20 flex flex-col h-full"
            >
              <div className="relative overflow-hidden h-48">
                {a.imageUrls?.[0] ? (
                  <img
                    src={a.imageUrls[0]}
                    alt={a.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <span className="text-gray-600 font-bold text-xl">PickIt News</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                <div className="absolute bottom-3 left-4">
                  <span className="px-2 py-1 rounded-md bg-blue-500/80 backdrop-blur-sm text-xs font-bold text-white border border-white/10">
                    {a.sport ?? "Sports"}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                  <span>{fmt(a.createdAt)}</span>
                </div>
                <h2 className="text-lg font-bold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                  {a.title}
                </h2>
                {a.summary && (
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                    {a.summary}
                  </p>
                )}
                <div className="mt-auto pt-4 border-t border-white/5 flex items-center text-sm text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                  Read Article
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!loading && !articles.length && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <p className="text-gray-400 text-lg">
              No articles found for {selectedSport ?? "all sports"}.
            </p>
            <button
              onClick={() => setSelectedSport(undefined)}
              className="mt-4 text-blue-400 hover:text-blue-300 font-medium"
            >
              View all news
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default News;
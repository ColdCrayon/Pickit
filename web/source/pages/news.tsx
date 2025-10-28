import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useArticles } from "../hooks/useArticles";
import Footer from "../components/footer";

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
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url('Background.jpeg')",
        }}
      />

      <main className="relative z-10 max-w-6xl mx-auto py-28 px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">News</h1>
          <p className="text-sm text-gray-400">
            Latest articles across all sports
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-10">
          {sports.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSport(s === "All" ? undefined : s)}
              className={`px-5 py-2 rounded-full border transition ${
                selectedSport === s || (s === "All" && !selectedSport)
                  ? "bg-yellow-500 text-black font-semibold border-yellow-500"
                  : "border-white/20 text-gray-300 hover:border-white/40"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Loading / Error */}
        {loading && <p className="text-gray-400">Loading…</p>}
        {error && <p className="text-red-400">{error}</p>}

        {/* Article grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <Link
              key={a.id}
              to={`/news/${a.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition overflow-hidden"
            >
              {a.imageUrls?.[0] ? (
                <img
                  src={a.imageUrls[0]}
                  alt={a.title}
                  className="w-full h-40 object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-40 bg-black/20" />
              )}

              <div className="p-5">
                <div className="text-xs text-gray-400 mb-1">
                  {a.sport ?? "Sports"} • {fmt(a.createdAt)}
                </div>
                <h2 className="text-lg font-semibold group-hover:underline">
                  {a.title}
                </h2>
                {a.summary && (
                  <p className="text-gray-300 text-sm mt-2 line-clamp-3">
                    {a.summary}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {!loading && !articles.length && (
          <p className="text-gray-400 text-center mt-12">
            No articles found for {selectedSport ?? "all sports"}.
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default News;

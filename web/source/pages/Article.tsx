import React from "react";
import { useParams } from "react-router-dom";
import { useArticleBySlug } from "../hooks";
import { ArticleBody, Footer } from "../components";

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { article, loading, error } = useArticleBySlug(slug);

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

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={article?.imageUrls?.[0] || "Background.jpeg"}
          alt="background"
          className="w-full h-full object-cover blur-xl scale-110 opacity-40"
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to bottom right, rgba(10,10,10,0.95), rgba(20,20,25,0.85), rgba(0,0,0,0.9))",
          }}
        />
      </div>

      <main className="relative z-10 max-w-3xl mx-auto py-16 px-6">
        {loading && <p className="text-gray-400">Loading…</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && !article && (
          <p className="text-gray-400">Article not found.</p>
        )}

        {article && (
          <>
            {/* Header */}
            <div className="mb-6 mt-6">
              <div className="text-sm text-gray-400">
                {article.sport ?? "Sports"} • {fmt(article.createdAt)}
              </div>
              <h1 className="text-3xl font-bold mt-1">{article.title}</h1>
              {article.summary && (
                <p className="text-gray-300 mt-2">{article.summary}</p>
              )}
            </div>

            {/* Hero */}
            {article.imageUrls?.[0] && (
              <img
                src={article.imageUrls[0]}
                alt={article.title}
                className="w-full max-h-[420px] object-cover rounded-xl mb-8"
                loading="lazy"
              />
            )}

            {/* Body */}
            <ArticleBody markdown={article.bodyMarkdown ?? ""} />

            {/* Sources */}
            {article.sources?.length ? (
              <section className="mt-10">
                <h2 className="text-xl font-semibold mb-2">Sources</h2>
                <ul className="list-disc pl-6 space-y-1">
                  {article.sources.map((u, i) => (
                    <li key={i}>
                      <a
                        className="text-yellow-400 underline"
                        href={u}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {u}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ArticlePage;

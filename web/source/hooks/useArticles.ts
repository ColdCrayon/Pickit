import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../lib";
import { Article } from "../types/articles";

type ListArgs = {
  sport?: "NFL" | "NBA" | "MLB" | "NHL";
  limitTo?: number;          // default 8
  onlyPublished?: boolean;   // default true
};

export function useArticles({ sport, limitTo = 8, onlyPublished = true }: ListArgs) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true); setError(null);

    const base = collection(db, "articles");
    const parts: any[] = [];

    if (onlyPublished) parts.push(where("status", "==", "published"));
    if (sport) parts.push(where("sport", "==", sport));

    // Sort newest first; if Firestore asks for an index, click the link once.
    parts.push(orderBy("createdAt", "desc"), limit(limitTo));

    const q = query(base, ...parts);
    const unsub = onSnapshot(
      q,
      (snap) => {
        setArticles(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
        setLoading(false);
      },
      (err) => { setError(err.message); setLoading(false); }
    );

    return () => unsub();
  }, [sport, limitTo, onlyPublished]);

  return { articles, loading, error };
}

export function useArticleBySlug(slug?: string) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(!!slug);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true); setError(null);

    // Simple live query by slug
    const base = collection(db, "articles");
    const q = query(base, where("slug", "==", slug), limit(1));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const doc = snap.docs[0];
        setArticle(doc ? ({ id: doc.id, ...(doc.data() as any) }) : null);
        setLoading(false);
      },
      (err) => { setError(err.message); setLoading(false); }
    );

    return () => unsub();
  }, [slug]);

  return { article, loading, error };
}

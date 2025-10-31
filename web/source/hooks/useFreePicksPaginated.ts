import { useEffect, useState, useRef } from "react";
import {
  collection, query, where, orderBy, limit, onSnapshot, startAfter,
  QueryDocumentSnapshot, DocumentData,
} from "firebase/firestore";
import { db, arbTicketConverter, gameTicketConverter } from "../lib";
import { ArbTicket, GameTicket } from "../types/picks";

type PageState<T> = {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
};

type Args = {
  league?: "NFL" | "NBA" | "MLB" | "NHL";
  isPremium: boolean;
  pageSize?: number;
};

export function useFreeArbPaginated({ league, isPremium, pageSize = 10 }: Args): PageState<ArbTicket> {
  const [data, setData] = useState<ArbTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  const buildQuery = (after?: QueryDocumentSnapshot) => {
    const base = collection(db, "arbTickets").withConverter(arbTicketConverter);
    const parts: any[] = [];
    if (!isPremium) parts.push(where("serverSettled", "==", true));
    if (league) parts.push(where("league", "==", league));
    // If createdAt is a string in your data, this still sorts lexicographically (OK for now)
    parts.push(orderBy("createdAt", "desc"), limit(pageSize));
    if (after) parts.push(startAfter(after));
    return query(base, ...parts);
  };

  useEffect(() => {
    // reset on param change
    setData([]); setError(null); setHasMore(true); cursorRef.current = null; setLoading(true);
    const q = buildQuery();
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => d.data());
        setData(rows);
        cursorRef.current = snap.docs.at(-1) ?? null;
        setHasMore(snap.size === pageSize);
        setLoading(false);
      },
      (err) => { setError(err.message); setLoading(false); }
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [league, isPremium, pageSize]);

  const loadMore = () => {
    if (!hasMore || loading) return;
    setLoading(true);
    const q = buildQuery(cursorRef.current!);
    onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => d.data());
        setData((prev) => [...prev, ...rows]);
        cursorRef.current = snap.docs.at(-1) ?? cursorRef.current;
        setHasMore(snap.size === pageSize);
        setLoading(false);
      },
      (err) => { setError(err.message); setLoading(false); }
    );
  };

  return { data, loading, error, hasMore, loadMore };
}

export function useFreeGamePaginated({ league, isPremium, pageSize = 10 }: Args): PageState<GameTicket> {
  const [data, setData] = useState<GameTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  const buildQuery = (after?: QueryDocumentSnapshot) => {
    const base = collection(db, "gameTickets").withConverter(gameTicketConverter);
    const parts: any[] = [];
    if (!isPremium) parts.push(where("serverSettled", "==", true));
    if (league) parts.push(where("league", "==", league));
    parts.push(orderBy("pickPublishDate", "desc"), limit(pageSize));
    if (after) parts.push(startAfter(after));
    return query(base, ...parts);
  };

  useEffect(() => {
    setData([]); setError(null); setHasMore(true); cursorRef.current = null; setLoading(true);
    const q = buildQuery();
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => d.data());
        setData(rows);
        cursorRef.current = snap.docs.at(-1) ?? null;
        setHasMore(snap.size === pageSize);
        setLoading(false);
      },
      (err) => { setError(err.message); setLoading(false); }
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [league, isPremium, pageSize]);

  const loadMore = () => {
    if (!hasMore || loading) return;
    setLoading(true);
    const q = buildQuery(cursorRef.current!);
    onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => d.data());
        setData((prev) => [...prev, ...rows]);
        cursorRef.current = snap.docs.at(-1) ?? cursorRef.current;
        setHasMore(snap.size === pageSize);
        setLoading(false);
      },
      (err) => { setError(err.message); setLoading(false); }
    );
  };

  return { data, loading, error, hasMore, loadMore };
}

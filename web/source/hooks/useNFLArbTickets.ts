import { useEffect, useState } from "react";
import {
  collection, query, where, orderBy, onSnapshot, limit
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { ArbTicket } from "../types/picks";
import { arbTicketConverter } from "../lib/converters";

type Args = {
  includeLive?: boolean; // true = show live and settled, false = settled only
  max?: number;
};

export function useNflArbTickets({ includeLive = true, max = 20 }: Args) {
  const [tickets, setTickets] = useState<ArbTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true); setError(null);

    const base = collection(db, "arbTickets").withConverter(arbTicketConverter);
    const parts: any[] = [];

    if (!includeLive) parts.push(where("serverSettled", "==", true));

    // If your docs already have league, uncomment the next line
    // parts.push(where("league", "==", "NFL"));

    // NOTE: createdAt can be a string in your data; Firestore will sort lexicographically.
    // If Firestore shows the "create index" link, click it once.
    parts.push(orderBy("createdAt", "desc"), limit(max));

    const q = query(base, ...parts);
    const unsub = onSnapshot(
      q,
      (snap) => {
        setTickets(snap.docs.map(d => d.data()));
        setLoading(false);
      },
      (err) => { setError(err.message); setLoading(false); }
    );
    return () => unsub();
  }, [includeLive, max]);

  return { tickets, loading, error };
}

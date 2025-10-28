import { useEffect, useState } from "react";
import {
  collection, query, where, orderBy, onSnapshot, limit
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { ArbTicket } from "../types/picks";
import { arbTicketConverter } from "../lib/converters";

type Args = {
  league?: "NFL" | "NBA" | "MLB" | "NHL";
  includeLive?: boolean; 
  max?: number;
};

export function useSportsArbTickets({ league, includeLive = true, max = 20 }: Args) {
  const [tickets, setTickets] = useState<ArbTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true); 
    setError(null);

    const base = collection(db, "arbTickets").withConverter(arbTicketConverter);
    const parts: any[] = [];

    if (!includeLive) parts.push(where("serverSettled", "==", true));
    
    // Only filter by league if provided and we want to enable league filtering later
    // For now, we'll skip league filtering to show all tickets
    // if (league) parts.push(where("league", "==", league));
    
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
  }, [league, includeLive, max]);

  return { tickets, loading, error };
}

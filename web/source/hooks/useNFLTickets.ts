// source/hooks/useNflTickets.ts (or useNFLTickets.ts)
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { GameTicket } from "../types/picks";
import { gameTicketConverter } from "../lib/converters";

type Args = { includeSettled?: boolean; max?: number };
type State = { tickets: GameTicket[]; loading: boolean; error: string | null };

export function useNflTickets({ includeSettled = false, max = 20 }: Args): State {
  const [tickets, setTickets] = useState<GameTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const base = collection(db, "gameTickets").withConverter(gameTicketConverter);
    const parts: any[] = [];
    if (!includeSettled) parts.push(where("serverSettled", "==", false));
    // If/when you add league: parts.push(where("league", "==", "NFL"));
    parts.push(orderBy("pickPublishDate", "desc"), limit(max));

    const q = query(base, ...parts);
    const unsub = onSnapshot(
      q,
      (snap) => {
        setTickets(snap.docs.map(d => d.data()));
        setLoading(false);
      },
      (err) => {
        setError(err.message ?? "Failed to load NFL tickets");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [includeSettled, max]);

  return { tickets, loading, error };
}


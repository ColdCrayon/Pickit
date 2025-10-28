import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { GameTicket } from "../types/picks";
import { gameTicketConverter } from "../lib/converters";

type Args = { 
  league?: "NFL" | "NBA" | "MLB" | "NHL";
  includeSettled?: boolean; 
  max?: number 
};
type State = { tickets: GameTicket[]; loading: boolean; error: string | null };

export function useSportsTickets({ league, includeSettled = false, max = 20 }: Args): State {
  const [tickets, setTickets] = useState<GameTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const base = collection(db, "gameTickets").withConverter(gameTicketConverter);
    const parts: any[] = [];
    if (!includeSettled) parts.push(where("serverSettled", "==", false));
    
    // Only filter by league if provided and we want to enable league filtering later
    // For now, we'll skip league filtering to show all tickets
    // if (league) parts.push(where("league", "==", league));
    
    parts.push(orderBy("pickPublishDate", "desc"), limit(max));

    const q = query(base, ...parts);
    const unsub = onSnapshot(
      q,
      (snap) => {
        setTickets(snap.docs.map(d => d.data()));
        setLoading(false);
      },
      (err) => {
        setError(err.message ?? "Failed to load tickets");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [league, includeSettled, max]);

  return { tickets, loading, error };
}

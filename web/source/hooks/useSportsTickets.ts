import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db, gameTicketConverter } from "../lib";
import { GameTicket } from "../types/picks";

type Args = { 
  league?: "NFL" | "NBA" | "MLB" | "NHL";
  showSettledOnly?: boolean;  // Changed from includeSettled for clarity
  max?: number 
};
type State = { tickets: GameTicket[]; loading: boolean; error: string | null };

/**
 * Hook to fetch game tickets from Firebase
 * 
 * Game tickets don't have serverSettled field - they use updatedAt to indicate completion
 * A ticket is "settled" if it has an updatedAt timestamp
 * 
 * @param showSettledOnly - When true, only shows settled tickets (tickets with updatedAt)
 *                          When false, shows all tickets
 */
export function useSportsTickets({ league, showSettledOnly = false, max = 20 }: Args): State {
  const [tickets, setTickets] = useState<GameTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const base = collection(db, "gameTickets").withConverter(gameTicketConverter);
    const parts: any[] = [];
    
    // If showSettledOnly is true, only show tickets with updatedAt (settled tickets)
    // For free users, they only see completed picks
    if (showSettledOnly) {
      // Query for tickets where updatedAt exists (not null)
      parts.push(where("updatedAt", "!=", null));
    }
    // If showSettledOnly is false, show all tickets (for premium users)
    
    // Only filter by league if provided and we want to enable league filtering later
    // For now, we'll skip league filtering to show all tickets
    // if (league) parts.push(where("league", "==", league));
    
    // Sort by createdAt descending (most recent first)
    // Note: If using where("updatedAt", "!=", null), we must order by updatedAt first
    if (showSettledOnly) {
      parts.push(orderBy("updatedAt", "desc"), limit(max));
    } else {
      parts.push(orderBy("createdAt", "desc"), limit(max));
    }

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
  }, [league, showSettledOnly, max]);

  return { tickets, loading, error };
}
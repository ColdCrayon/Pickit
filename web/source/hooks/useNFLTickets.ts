import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { gameTicketConverter } from "../lib/converters";
import { GameTicket } from "../types/picks";

export function useNflTickets(opts?: { includeSettled?: boolean; max?: number }) {
  const { includeSettled = false, max = 20 } = opts || {};
  const [tickets, setTickets] = useState<GameTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Base: /gameTickets
    let base = collection(db, "gameTickets").withConverter(gameTicketConverter);

    const qParts: any[] = [];
    // Add when league is present qParts.push(where("league", "==", "NFL"));

    if (!includeSettled) {
      qParts.push(where("serverSettled", "==", false));
    }

    // Sorting by publish date (works best when that field is a Timestamp)
    qParts.push(orderBy("pickPublishDate", "desc"));
    qParts.push(limit(max));

    const q = query(base, ...qParts);

    const unsub = onSnapshot(
      q,
      (snap) => {
        setTickets(snap.docs.map((d) => d.data()));
        setLoading(false);
      },
      (err) => {
        console.error("useNflTickets error:", err);
        setTickets([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [includeSettled, max]);

  return { tickets, loading };
}

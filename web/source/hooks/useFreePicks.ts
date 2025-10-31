import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db, arbTicketConverter, gameTicketConverter } from "../lib";
import { ArbTicket, GameTicket } from "../types/picks";

type State<T> = { data: T[]; loading: boolean; error: string | null };

export function useFreePicks(league?: "NFL" | "NBA" | "MLB" | "NHL", maxPerType = 4) {
  const [arb, setArb] = useState<State<ArbTicket>>({ data: [], loading: true, error: null });
  const [game, setGame] = useState<State<GameTicket>>({ data: [], loading: true, error: null });

  useEffect(() => {
    // --- Arbitrage: settled only ---
    const arbBase = collection(db, "arbTickets").withConverter(arbTicketConverter);
    const arbParts: any[] = [where("serverSettled", "==", true)];
    //if (league) arbParts.push(where("league", "==", league)); // only if you add `league` later

    try {
      arbParts.push(orderBy("createdAt", "desc"));
    } catch {}
    arbParts.push(limit(maxPerType));
    const arbQ = query(arbBase, ...arbParts);

    const unsubArb = onSnapshot(
      arbQ,
      (snap) => setArb({ data: snap.docs.map((d) => d.data()), loading: false, error: null }),
      (err) => setArb({ data: [], loading: false, error: err?.message ?? "Failed to load arb picks" })
    );

    // --- Game Tickets: settled only (you’ll flesh this out later) ---
    const gameBase = collection(db, "gameTickets").withConverter(gameTicketConverter);
    const gameParts: any[] = [where("serverSettled", "==", true)];
    if (league) gameParts.push(where("league", "==", league));
    try {
      gameParts.push(orderBy("pickPublishDate", "desc"));
    } catch {}
    gameParts.push(limit(maxPerType));
    const gameQ = query(gameBase, ...gameParts);

    const unsubGame = onSnapshot(
      gameQ,
      (snap) => setGame({ data: snap.docs.map((d) => d.data()), loading: false, error: null }),
      (err) => setGame({ data: [], loading: false, error: err?.message ?? "Failed to load game picks" })
    );

    return () => { unsubArb(); unsubGame(); };
  }, [league, maxPerType]);

  return { arb, game };
}

/**
 * web/source/hooks/useUserTickets.ts
 *
 * FIXED: TypeScript type issues with Firestore converter
 */

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { userTicketConverter, UserTicket } from "../lib/converters";
import { COLLECTIONS } from "../lib/constants";
import { useAuth } from "./useAuth";

interface UseUserTicketsReturn {
  tickets: UserTicket[];
  loading: boolean;
  error: string | null;
  saveTicket: (ticketId: string, ticketType: "arb" | "game") => Promise<void>;
  unsaveTicket: (ticketId: string) => Promise<void>;
  isSaved: (ticketId: string) => boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook for managing user's saved tickets
 *
 * Usage:
 * ```tsx
 * const { tickets, saveTicket, unsaveTicket, isSaved } = useUserTickets();
 *
 * // Check if ticket is saved
 * if (isSaved(ticketId)) {
 *   <button onClick={() => unsaveTicket(ticketId)}>Unsave</button>
 * } else {
 *   <button onClick={() => saveTicket(ticketId, 'arb')}>Save</button>
 * }
 * ```
 */
export const useUserTickets = (
  filterType?: "arb" | "game"
): UseUserTicketsReturn => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Save a ticket to user's collection
   */
  const saveTicket = useCallback(
    async (ticketId: string, ticketType: "arb" | "game") => {
      if (!user) {
        throw new Error("Must be logged in to save tickets");
      }

      try {
        const ticketRef = doc(
          collection(db, COLLECTIONS.USERS, user.uid, COLLECTIONS.USER_TICKETS),
          ticketId
        ).withConverter(userTicketConverter);

        // Create a complete UserTicket object
        const userTicket: UserTicket = {
          id: ticketId,
          ticketId,
          ticketType,
          savedAt: new Date(),
          notificationSent: false,
          userId: user.uid,
        };

        await setDoc(ticketRef, userTicket);

        console.log(`Saved ${ticketType} ticket: ${ticketId}`);
      } catch (err) {
        console.error("Error saving ticket:", err);
        throw err;
      }
    },
    [user]
  );

  /**
   * Remove a ticket from user's collection
   */
  const unsaveTicket = useCallback(
    async (ticketId: string) => {
      if (!user) {
        throw new Error("Must be logged in to unsave tickets");
      }

      try {
        const ticketRef = doc(
          db,
          COLLECTIONS.USERS,
          user.uid,
          COLLECTIONS.USER_TICKETS,
          ticketId
        );

        await deleteDoc(ticketRef);
        console.log(`Unsaved ticket: ${ticketId}`);
      } catch (err) {
        console.error("Error unsaving ticket:", err);
        throw err;
      }
    },
    [user]
  );

  /**
   * Check if a ticket is saved
   */
  const isSaved = useCallback(
    (ticketId: string): boolean => {
      return tickets.some((t) => t.ticketId === ticketId);
    },
    [tickets]
  );

  /**
   * Manually refresh tickets
   */
  const refresh = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let q = query(
        collection(db, COLLECTIONS.USERS, user.uid, COLLECTIONS.USER_TICKETS)
      ).withConverter(userTicketConverter);

      if (filterType) {
        q = query(q, where("ticketType", "==", filterType));
      }

      const snapshot = await getDocs(q);

      // Map explicitly to ensure UserTicket[] type
      const fetchedTickets: UserTicket[] = snapshot.docs.map((doc) =>
        doc.data()
      );

      setTickets(fetchedTickets);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [user, filterType]);

  /**
   * Set up real-time listener for user's saved tickets
   */
  useEffect(() => {
    if (!user) {
      setTickets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let q = query(
      collection(db, COLLECTIONS.USERS, user.uid, COLLECTIONS.USER_TICKETS)
    ).withConverter(userTicketConverter);

    if (filterType) {
      q = query(q, where("ticketType", "==", filterType));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Map explicitly to ensure UserTicket[] type
        const fetchedTickets: UserTicket[] = snapshot.docs.map((doc) =>
          doc.data()
        );

        setTickets(fetchedTickets);
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to tickets:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, filterType]);

  return {
    tickets,
    loading,
    error,
    saveTicket,
    unsaveTicket,
    isSaved,
    refresh,
  };
};

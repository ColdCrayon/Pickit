/**
 * useAvailableEvents Hook - COMPLETE VERSION WITH useMultiSportEvents
 *
 * Queries the /events collection to fetch upcoming games that users can add to their watchlist.
 * Supports filtering by sport, date range, and pagination.
 *
 * FIXES:
 * - Removed dependency on /leagues collection (which doesn't exist)
 * - Fixed "All Sports" infinite loading issue
 * - Now queries /events directly with sport filter
 * - Added useMultiSportEvents export
 */

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Event, EventFilters, SportKey } from "../types/events";

interface UseAvailableEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  hasMore: boolean;
}

/**
 * Hook to fetch available events from Firestore
 *
 * @param filters - Optional filters for sport, date range, limit
 * @returns Events array, loading state, error, and refresh function
 *
 * @example
 * ```tsx
 * const { events, loading, error } = useAvailableEvents({
 *   sport: 'basketball_nba',
 *   limit: 20
 * });
 *
 * // For "All Sports", pass undefined or null:
 * const { events, loading, error } = useAvailableEvents({
 *   limit: 50
 * });
 * ```
 */
export function useAvailableEvents(
  filters: EventFilters = {}
): UseAvailableEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const constraints: QueryConstraint[] = [];

      // Add sport filter ONLY if provided
      // For "All Sports", filters.sport will be undefined/null
      if (filters.sport) {
        console.log(
          `[useAvailableEvents] Filtering by sport: ${filters.sport}`
        );
        constraints.push(where("sport", "==", filters.sport));
      } else {
        console.log(`[useAvailableEvents] Fetching all sports`);
      }

      // Add date range filters
      const now = Timestamp.now();
      const startDate = filters.startDate
        ? Timestamp.fromDate(filters.startDate)
        : now;

      const endDate = filters.endDate
        ? Timestamp.fromDate(filters.endDate)
        : Timestamp.fromMillis(now.toMillis() + 7 * 24 * 60 * 60 * 1000); // 7 days ahead

      // CRITICAL: Order by startTime first before adding where clauses
      constraints.push(
        where("startTime", ">=", startDate),
        where("startTime", "<=", endDate)
      );

      // Add orderBy and limit
      constraints.push(orderBy("startTime", "asc"));
      constraints.push(limit(filters.limit || 100));

      console.log(`[useAvailableEvents] Query constraints:`, {
        sport: filters.sport || "ALL",
        startDate: startDate.toDate().toISOString(),
        endDate: endDate.toDate().toISOString(),
        limit: filters.limit || 100,
      });

      const eventsQuery = query(collection(db, "events"), ...constraints);
      const snapshot = await getDocs(eventsQuery);

      console.log(
        `[useAvailableEvents] Fetched ${snapshot.size} events (sport: ${
          filters.sport || "ALL"
        })`
      );

      const eventsList: Event[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Event)
      );

      setEvents(eventsList);
      setHasMore(snapshot.size === (filters.limit || 100));
      setLoading(false);
    } catch (err: any) {
      console.error("[useAvailableEvents] Error fetching events:", err);
      setError(err.message || "Failed to fetch events");
      setLoading(false);
      setEvents([]);
    }
  }, [filters.sport, filters.startDate, filters.endDate, filters.limit]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    refresh: fetchEvents,
    hasMore,
  };
}

/**
 * Hook to fetch events from multiple sports
 * Useful for "All Sports" view
 *
 * @param sports - Array of sport keys to fetch
 * @param filters - Optional filters for date range, limit
 * @returns Combined events from all sports, loading state, error, and refresh function
 *
 * @example
 * ```tsx
 * const { events, loading, error } = useMultiSportEvents(
 *   ['basketball_nba', 'americanfootball_nfl'],
 *   { limit: 50 }
 * );
 * ```
 */
export function useMultiSportEvents(
  sports: SportKey[],
  filters: Omit<EventFilters, "sport"> = {}
): UseAvailableEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // If no sports specified or array is empty, fetch all sports
      if (!sports || sports.length === 0) {
        console.log("[useMultiSportEvents] Fetching all sports (no filter)");

        const constraints: QueryConstraint[] = [];
        const now = Timestamp.now();
        const startDate = filters.startDate
          ? Timestamp.fromDate(filters.startDate)
          : now;

        const endDate = filters.endDate
          ? Timestamp.fromDate(filters.endDate)
          : Timestamp.fromMillis(now.toMillis() + 7 * 24 * 60 * 60 * 1000);

        constraints.push(
          where("startTime", ">=", startDate),
          where("startTime", "<=", endDate),
          orderBy("startTime", "asc"),
          limit(filters.limit || 100)
        );

        const eventsQuery = query(collection(db, "events"), ...constraints);
        const snapshot = await getDocs(eventsQuery);

        console.log(
          `[useMultiSportEvents] Fetched ${snapshot.size} events (all sports)`
        );

        const eventsList: Event[] = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Event)
        );

        setEvents(eventsList);
        setHasMore(snapshot.size === (filters.limit || 100));
        setLoading(false);
        return;
      }

      // Fetch events for each sport in PARALLEL using Promise.all
      const eventPromises = sports.map(async (sport) => {
        const constraints: QueryConstraint[] = [where("sport", "==", sport)];

        const now = Timestamp.now();
        const startDate = filters.startDate
          ? Timestamp.fromDate(filters.startDate)
          : now;

        const endDate = filters.endDate
          ? Timestamp.fromDate(filters.endDate)
          : Timestamp.fromMillis(now.toMillis() + 7 * 24 * 60 * 60 * 1000);

        constraints.push(
          where("startTime", ">=", startDate),
          where("startTime", "<=", endDate),
          orderBy("startTime", "asc"),
          limit(filters.limit || 50)
        );

        try {
          const eventsQuery = query(collection(db, "events"), ...constraints);
          const snapshot = await getDocs(eventsQuery);

          console.log(
            `[useMultiSportEvents] ${sport}: ${snapshot.size} events`
          );

          return snapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              } as Event)
          );
        } catch (err) {
          console.warn(`[useMultiSportEvents] Failed to fetch ${sport}:`, err);
          return []; // Return empty array if this sport fails
        }
      });

      // Wait for ALL queries to complete in parallel
      const results = await Promise.all(eventPromises);

      // Flatten and sort by start time
      const allEvents = results.flat().sort((a, b) => {
        const aTime =
          a.startTime instanceof Timestamp ? a.startTime.toMillis() : 0;
        const bTime =
          b.startTime instanceof Timestamp ? b.startTime.toMillis() : 0;
        return aTime - bTime;
      });

      console.log(
        `[useMultiSportEvents] Total events fetched: ${allEvents.length}`
      );

      setEvents(allEvents);
      setHasMore(false); // Can't easily determine hasMore for multi-sport
      setLoading(false);
    } catch (err: any) {
      console.error("[useMultiSportEvents] Error fetching events:", err);
      setError(err.message || "Failed to fetch events");
      setLoading(false);
      setEvents([]);
    }
  }, [sports, filters.startDate, filters.endDate, filters.limit]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    refresh: fetchEvents,
    hasMore,
  };
}

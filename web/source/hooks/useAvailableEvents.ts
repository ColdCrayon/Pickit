/**
 * useAvailableEvents Hook
 *
 * Queries the /events collection to fetch upcoming games that users can add to their watchlist.
 * Supports filtering by sport, date range, and pagination.
 *
 * FIXED: useMultiSportEvents now properly handles empty results
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
    setLoading(true);
    setError(null);

    try {
      const eventsRef = collection(db, "events");
      const constraints: QueryConstraint[] = [];

      // Filter by sport
      if (filters.sport) {
        if (Array.isArray(filters.sport)) {
          // Note: Firestore doesn't support 'in' with more than 10 values
          // For multiple sports, we'll need to make multiple queries
          // For now, just use the first sport
          constraints.push(where("sport", "==", filters.sport[0]));
        } else {
          constraints.push(where("sport", "==", filters.sport));
        }
      }

      // Filter by start time - only show future events
      const startAfter = filters.startAfter || new Date();
      constraints.push(
        where("startTime", ">=", Timestamp.fromDate(startAfter))
      );

      // Optional: filter by end date
      if (filters.startBefore) {
        constraints.push(
          where("startTime", "<=", Timestamp.fromDate(filters.startBefore))
        );
      }

      // Order by start time (ascending - soonest first)
      constraints.push(orderBy("startTime", "asc"));

      // Limit results
      const resultLimit = filters.limit || 50;
      constraints.push(limit(resultLimit + 1)); // Fetch one extra to check if there are more

      // Execute query
      const q = query(eventsRef, ...constraints);
      const snapshot = await getDocs(q);

      // Parse results
      const fetchedEvents: Event[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedEvents.push({
          id: doc.id,
          sport: data.sport,
          teams: data.teams,
          startTime: data.startTime,
          lastOddsUpdate: data.lastOddsUpdate,
          expiresAt: data.expiresAt,
        });
      });

      // Check if there are more results
      if (fetchedEvents.length > resultLimit) {
        setHasMore(true);
        fetchedEvents.pop(); // Remove the extra one
      } else {
        setHasMore(false);
      }

      setEvents(fetchedEvents);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching available events:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch available events"
      );
      setLoading(false);
    }
  }, [filters.sport, filters.startAfter, filters.startBefore, filters.limit]);

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
 * Hook to fetch events for multiple sports (makes multiple queries)
 *
 * @param sports - Array of sport keys
 * @param filters - Additional filters
 * @returns Combined events from all sports
 *
 * @example
 * ```tsx
 * const { events, loading } = useMultiSportEvents(['basketball_nba', 'americanfootball_nfl']);
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

  const fetchMultiSportEvents = useCallback(async () => {
    if (sports.length === 0) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const allEvents: Event[] = [];
      const perSportLimit = Math.ceil((filters.limit || 50) / sports.length);

      // Fetch events for each sport in parallel
      const promises = sports.map(async (sport) => {
        try {
          const eventsRef = collection(db, "events");
          const constraints: QueryConstraint[] = [];

          constraints.push(where("sport", "==", sport));

          const startAfter = filters.startAfter || new Date();
          constraints.push(
            where("startTime", ">=", Timestamp.fromDate(startAfter))
          );

          if (filters.startBefore) {
            constraints.push(
              where("startTime", "<=", Timestamp.fromDate(filters.startBefore))
            );
          }

          constraints.push(orderBy("startTime", "asc"));
          constraints.push(limit(perSportLimit));

          const q = query(eventsRef, ...constraints);
          const snapshot = await getDocs(q);

          const sportEvents: Event[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            sportEvents.push({
              id: doc.id,
              sport: data.sport,
              teams: data.teams,
              startTime: data.startTime,
              lastOddsUpdate: data.lastOddsUpdate,
              expiresAt: data.expiresAt,
            });
          });

          return sportEvents;
        } catch (err) {
          console.error(`Error fetching ${sport} events:`, err);
          return []; // Return empty array on error for this sport
        }
      });

      // Wait for all queries to complete
      const results = await Promise.all(promises);

      // Flatten results
      results.forEach((sportEvents) => {
        allEvents.push(...sportEvents);
      });

      // Sort all events by start time
      allEvents.sort((a, b) => {
        const aTime =
          a.startTime instanceof Timestamp
            ? a.startTime.toMillis()
            : a.startTime.getTime();
        const bTime =
          b.startTime instanceof Timestamp
            ? b.startTime.toMillis()
            : b.startTime.getTime();
        return aTime - bTime;
      });

      // Apply limit to combined results
      const resultLimit = filters.limit || 50;
      if (allEvents.length > resultLimit) {
        setHasMore(true);
        setEvents(allEvents.slice(0, resultLimit));
      } else {
        setHasMore(false);
        setEvents(allEvents);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching multi-sport events:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch available events"
      );
      setLoading(false);
    }
  }, [sports, filters.startAfter, filters.startBefore, filters.limit]);

  useEffect(() => {
    fetchMultiSportEvents();
  }, [fetchMultiSportEvents]);

  return {
    events,
    loading,
    error,
    refresh: fetchMultiSportEvents,
    hasMore,
  };
}

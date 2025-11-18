/**
 * useAvailableEvents Hook - EXTENDED DATE RANGE
 *
 * Queries the /events collection to fetch upcoming games.
 *
 * CHANGES:
 * - Extended default date range from 7 days to 30 days
 * - Added better logging for debugging
 * - Increased default limits
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

      // Add sport filter if provided
      if (filters.sport) {
        constraints.push(where("sport", "==", filters.sport));
      }

      // Add date range filters
      const now = Timestamp.now();
      const startDate = filters.startDate
        ? Timestamp.fromDate(filters.startDate)
        : now;

      // ✅ CHANGED: Extended from 7 days to 30 days
      const endDate = filters.endDate
        ? Timestamp.fromDate(filters.endDate)
        : Timestamp.fromMillis(now.toMillis() + 30 * 24 * 60 * 60 * 1000);

      constraints.push(
        where("startTime", ">=", startDate),
        where("startTime", "<=", endDate),
        orderBy("startTime", "asc"),
        limit(filters.limit || 200) // ✅ CHANGED: Increased from 50 to 200
      );

      const eventsQuery = query(collection(db, "events"), ...constraints);
      const snapshot = await getDocs(eventsQuery);

      console.log(`[useAvailableEvents] Fetched ${snapshot.size} events`, {
        sport: filters.sport || "all",
        dateRange: `${startDate.toDate().toLocaleDateString()} - ${endDate
          .toDate()
          .toLocaleDateString()}`,
        limit: filters.limit || 200,
      });

      const eventsList: Event[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Event)
      );

      setEvents(eventsList);
      setHasMore(snapshot.size === (filters.limit || 200));
    } catch (err: any) {
      console.error("[useAvailableEvents] Error:", err);
      setError(err.message || "Failed to fetch events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [
    filters.sport,
    filters.startDate?.getTime(),
    filters.endDate?.getTime(),
    filters.limit,
  ]);

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
 *
 * @param sports - Array of sport keys to fetch
 * @param filters - Optional filters
 * @returns Combined events from all sports
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
    try {
      setLoading(true);
      setError(null);

      console.log(`[useMultiSportEvents] Fetching events for sports:`, sports);

      // If no sports specified, fetch ALL events without sport filter
      if (!sports || sports.length === 0) {
        const constraints: QueryConstraint[] = [];

        const now = Timestamp.now();
        const startDate = filters.startDate
          ? Timestamp.fromDate(filters.startDate)
          : now;

        // ✅ CHANGED: Extended from 7 days to 30 days
        const endDate = filters.endDate
          ? Timestamp.fromDate(filters.endDate)
          : Timestamp.fromMillis(now.toMillis() + 30 * 24 * 60 * 60 * 1000);

        constraints.push(
          where("startTime", ">=", startDate),
          where("startTime", "<=", endDate),
          orderBy("startTime", "asc"),
          limit(filters.limit || 200) // ✅ CHANGED: Increased from 100 to 200
        );

        const eventsQuery = query(collection(db, "events"), ...constraints);
        const snapshot = await getDocs(eventsQuery);

        console.log(
          `[useMultiSportEvents] Fetched ${snapshot.size} events (all sports)`,
          {
            dateRange: `${startDate.toDate().toLocaleDateString()} - ${endDate
              .toDate()
              .toLocaleDateString()}`,
          }
        );

        const eventsList: Event[] = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Event)
        );

        setEvents(eventsList);
        setHasMore(snapshot.size === (filters.limit || 200));
        setLoading(false);
        return;
      }

      // Fetch events for each sport in PARALLEL
      const eventPromises = sports.map(async (sport) => {
        const constraints: QueryConstraint[] = [where("sport", "==", sport)];

        const now = Timestamp.now();
        const startDate = filters.startDate
          ? Timestamp.fromDate(filters.startDate)
          : now;

        // ✅ CHANGED: Extended from 7 days to 30 days
        const endDate = filters.endDate
          ? Timestamp.fromDate(filters.endDate)
          : Timestamp.fromMillis(now.toMillis() + 30 * 24 * 60 * 60 * 1000);

        constraints.push(
          where("startTime", ">=", startDate),
          where("startTime", "<=", endDate),
          orderBy("startTime", "asc"),
          limit(filters.limit || 200) // ✅ CHANGED: Increased from 50 to 200
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
          return [];
        }
      });

      // Wait for ALL queries to complete
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
        `[useMultiSportEvents] Total combined events: ${allEvents.length}`
      );

      setEvents(allEvents);
      setHasMore(allEvents.length >= (filters.limit || 200) * sports.length);
    } catch (err: any) {
      console.error("[useMultiSportEvents] Error:", err);
      setError(err.message || "Failed to fetch events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [
    JSON.stringify(sports),
    filters.startDate?.getTime(),
    filters.endDate?.getTime(),
    filters.limit,
  ]);

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

/**
 * useEventOdds Hook
 *
 * Subscribes to real-time odds updates for a specific event.
 * Listens to /events/{eventId}/markets/{marketId}/books/{bookId} subcollections.
 */

import { useState, useEffect } from "react";
import { collection, doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { EventWithOdds, BookOdds, Odds, MarketType } from "../types/events";

interface UseEventOddsReturn {
  event: EventWithOdds | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to subscribe to real-time odds for a specific event
 *
 * @param eventId - The event ID to fetch odds for
 * @returns Event with odds, loading state, and error
 *
 * @example
 * ```tsx
 * const { event, loading, error } = useEventOdds('some-event-id');
 *
 * if (event) {
 *   console.log(event.markets.h2h); // Moneyline odds from all books
 *   console.log(event.markets.spreads); // Spread odds from all books
 * }
 * ```
 */
export function useEventOdds(eventId: string | undefined): UseEventOddsReturn {
  const [event, setEvent] = useState<EventWithOdds | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const eventRef = doc(db, "events", eventId);

    // Subscribe to event document
    const unsubscribeEvent = onSnapshot(
      eventRef,
      (eventDoc) => {
        if (!eventDoc.exists()) {
          setError("Event not found");
          setLoading(false);
          return;
        }

        const eventData = eventDoc.data();
        const baseEvent: EventWithOdds = {
          id: eventDoc.id,
          sport: eventData.sport,
          teams: eventData.teams,
          startTime: eventData.startTime,
          lastOddsUpdate: eventData.lastOddsUpdate,
          expiresAt: eventData.expiresAt,
          markets: {
            h2h: {},
            spreads: {},
            totals: {},
          },
        };

        setEvent(baseEvent);

        // Now subscribe to markets
        subscribeToMarkets(eventId, baseEvent);
      },
      (err) => {
        console.error("Error fetching event:", err);
        setError(err.message || "Failed to fetch event");
        setLoading(false);
      }
    );

    // Function to subscribe to all markets
    const subscribeToMarkets = (evId: string, baseEv: EventWithOdds) => {
      const markets: MarketType[] = ["h2h", "spreads", "totals"];
      const unsubscribers: (() => void)[] = [];

      markets.forEach((marketId) => {
        const booksRef = collection(
          db,
          "events",
          evId,
          "markets",
          marketId,
          "books"
        );

        const unsubBooks = onSnapshot(
          booksRef,
          (booksSnapshot) => {
            const bookOddsMap: Record<string, BookOdds> = {};

            booksSnapshot.forEach((bookDoc) => {
              const bookData = bookDoc.data();

              if (bookData.latest) {
                bookOddsMap[bookDoc.id] = {
                  bookId: bookDoc.id,
                  updatedAt: bookData.latest.updatedAt,
                  odds: bookData.latest.odds as Odds,
                };
              }
            });

            // Update event with new odds for this market
            setEvent((prev) => {
              if (!prev) return prev;

              return {
                ...prev,
                markets: {
                  ...prev.markets,
                  [marketId]: bookOddsMap,
                },
              };
            });

            setLoading(false);
          },
          (err) => {
            console.error(`Error fetching ${marketId} odds:`, err);
            // Don't set error state here - partial data is okay
          }
        );

        unsubscribers.push(unsubBooks);
      });

      // Return cleanup function for market subscriptions
      return () => unsubscribers.forEach((unsub) => unsub());
    };

    // Cleanup
    return () => {
      unsubscribeEvent();
    };
  }, [eventId]);

  return { event, loading, error };
}

/**
 * Hook to get best odds for a specific market across all books
 *
 * @param eventId - The event ID
 * @param marketType - The market type (h2h, spreads, totals)
 * @returns Best odds for each outcome
 *
 * @example
 * ```tsx
 * const { bestOdds, loading } = useBestOdds('event-id', 'h2h');
 * console.log(bestOdds.home); // Best home odds
 * console.log(bestOdds.away); // Best away odds
 * ```
 */
export function useBestOdds(
  eventId: string | undefined,
  marketType: MarketType
) {
  const { event, loading, error } = useEventOdds(eventId);
  const [bestOdds, setBestOdds] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    if (!event || !event.markets) {
      setBestOdds(null);
      return;
    }

    const marketOdds = event.markets[marketType];
    if (!marketOdds || Object.keys(marketOdds).length === 0) {
      setBestOdds(null);
      return;
    }

    // Calculate best odds for each outcome
    const best: Record<string, number> = {};

    Object.values(marketOdds).forEach((bookOdds) => {
      const odds = bookOdds.odds;

      Object.entries(odds).forEach(([outcome, entry]) => {
        if (!entry) return;

        // Get the price (prefer decimal, fallback to american)
        const price = entry.priceDecimal || entry.priceAmerican;
        if (price === undefined) return;

        // For decimal odds, higher is better
        // For american odds, more positive is better for plus odds, less negative is better for minus odds
        if (!best[outcome] || price > best[outcome]) {
          best[outcome] = price;
        }
      });
    });

    setBestOdds(best);
  }, [event, marketType]);

  return { bestOdds, loading, error };
}

/**
 * Hook to compare odds from a specific book vs best available
 *
 * @param eventId - The event ID
 * @param marketType - The market type
 * @param bookId - The sportsbook to compare
 * @returns Comparison data showing if this book has the best odds
 *
 * @example
 * ```tsx
 * const { comparison } = useOddsComparison('event-id', 'h2h', 'fanduel');
 * if (comparison.home.isBest) {
 *   console.log('FanDuel has the best home odds!');
 * }
 * ```
 */
export function useOddsComparison(
  eventId: string | undefined,
  marketType: MarketType,
  bookId: string
) {
  const { event, loading, error } = useEventOdds(eventId);
  const { bestOdds } = useBestOdds(eventId, marketType);
  const [comparison, setComparison] = useState<Record<
    string,
    { value: number; best: number; isBest: boolean; difference: number }
  > | null>(null);

  useEffect(() => {
    if (!event || !bestOdds || !event.markets) {
      setComparison(null);
      return;
    }

    const marketOdds = event.markets[marketType];
    if (!marketOdds || !marketOdds[bookId]) {
      setComparison(null);
      return;
    }

    const bookOdds = marketOdds[bookId].odds;
    const comp: Record<
      string,
      { value: number; best: number; isBest: boolean; difference: number }
    > = {};

    Object.entries(bookOdds).forEach(([outcome, entry]) => {
      if (!entry) return;

      const value = entry.priceDecimal || entry.priceAmerican;
      if (value === undefined) return;

      const best = bestOdds[outcome];
      if (best === undefined) return;

      comp[outcome] = {
        value,
        best,
        isBest: value === best,
        difference: value - best,
      };
    });

    setComparison(comp);
  }, [event, bestOdds, marketType, bookId]);

  return { comparison, loading, error };
}

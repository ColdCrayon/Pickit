/**
 * useEventOdds Hook
 *
 * Subscribes to real-time odds updates for a specific event.
 * Listens to /events/{eventId}/markets/{marketId}/books/{bookId} subcollections.
 */

import { useState, useEffect } from "react";
import { collection, doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  EventWithOdds,
  BookOdds,
  OddsMap,
  EventMarketType,
  OddsEntry,
  OutcomeOdds,
} from "../types/events";
import { americanToDecimal, decimalToAmerican } from "../lib/utils";

interface NormalizedOutcomeOdds {
  entry: OddsEntry;
  decimal: number;
  hasAmerican: boolean;
}

function normalizeOutcomeOdds(
  raw: OutcomeOdds | null | undefined
): NormalizedOutcomeOdds | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  let priceAmerican =
    typeof raw.priceAmerican === "number" ? raw.priceAmerican : undefined;
  const hasAmerican = priceAmerican !== undefined;
  let priceDecimal =
    typeof raw.priceDecimal === "number" ? raw.priceDecimal : undefined;

  if (priceAmerican === undefined && priceDecimal !== undefined) {
    const americanValue = Number(decimalToAmerican(priceDecimal));
    if (!Number.isNaN(americanValue)) {
      priceAmerican = americanValue;
    }
  }

  if (priceDecimal === undefined && priceAmerican !== undefined) {
    priceDecimal = americanToDecimal(priceAmerican);
  }

  if (priceDecimal === undefined) {
    return null;
  }

  const point = typeof raw.point === "number" ? raw.point : undefined;

  return {
    entry: {
      priceAmerican,
      priceDecimal,
      point,
    },
    decimal: priceDecimal,
    hasAmerican,
  };
}

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
    let unsubscribeMarkets: (() => void) | null = null;

    // Function to subscribe to all markets
    const subscribeToMarkets = (evId: string, baseEv: EventWithOdds) => {
      const markets: EventMarketType[] = ["h2h", "spreads", "totals"];
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
                  odds: bookData.latest.odds as OddsMap,
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

    // Subscribe to event document
    const unsubscribeEvent = onSnapshot(
      eventRef,
      (eventDoc) => {
        if (!eventDoc.exists()) {
          unsubscribeMarkets?.();
          unsubscribeMarkets = null;
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
        unsubscribeMarkets?.();
        unsubscribeMarkets = subscribeToMarkets(eventId, baseEvent);
      },
      (err) => {
        console.error("Error fetching event:", err);
        setError(err.message || "Failed to fetch event");
        setLoading(false);
      }
    );
    // Cleanup
    return () => {
      unsubscribeEvent();
      unsubscribeMarkets?.();
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
  marketType: EventMarketType
) {
  const { event, loading, error } = useEventOdds(eventId);
  const [bestOdds, setBestOdds] = useState<Record<string, OddsEntry> | null>(
    null
  );

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
    const best: Record<string, OddsEntry> = {};
    const bestMeta: Record<string, { decimal: number; hasAmerican: boolean }> =
      {};

    Object.values(marketOdds).forEach((bookOdds) => {
      const odds = bookOdds.odds;

      Object.entries(odds).forEach(([outcome, entry]) => {
        const normalized = normalizeOutcomeOdds(entry as OutcomeOdds);
        if (!normalized) return;

        const current = bestMeta[outcome];
        if (
          !current ||
          normalized.decimal > current.decimal ||
          (normalized.decimal === current.decimal &&
            normalized.hasAmerican &&
            !current.hasAmerican)
        ) {
          best[outcome] = normalized.entry;
          bestMeta[outcome] = {
            decimal: normalized.decimal,
            hasAmerican: normalized.hasAmerican,
          };
        }
      });
    });

    setBestOdds(Object.keys(best).length ? best : null);
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
interface OddsComparisonEntry {
  value: OddsEntry;
  valueDecimal: number;
  best: OddsEntry;
  bestDecimal: number;
  isBest: boolean;
  difference: number;
}

export function useOddsComparison(
  eventId: string | undefined,
  marketType: EventMarketType,
  bookId: string
) {
  const { event, loading, error } = useEventOdds(eventId);
  const { bestOdds } = useBestOdds(eventId, marketType);
  const [comparison, setComparison] = useState<
    Record<string, OddsComparisonEntry> | null
  >(null);

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
    const comp: Record<string, OddsComparisonEntry> = {};

    Object.entries(bookOdds).forEach(([outcome, entry]) => {
      const normalized = normalizeOutcomeOdds(entry as OutcomeOdds);
      if (!normalized) return;

      const bestEntry = bestOdds[outcome];
      if (!bestEntry) return;

      const bestDecimal =
        bestEntry.priceDecimal !== undefined
          ? bestEntry.priceDecimal
          : bestEntry.priceAmerican !== undefined
          ? americanToDecimal(bestEntry.priceAmerican)
          : undefined;

      if (bestDecimal === undefined) return;

      comp[outcome] = {
        value: normalized.entry,
        valueDecimal: normalized.decimal,
        best: bestEntry,
        bestDecimal,
        isBest: Math.abs(normalized.decimal - bestDecimal) < 1e-6,
        difference: normalized.decimal - bestDecimal,
      };
    });

    setComparison(Object.keys(comp).length ? comp : null);
  }, [event, bestOdds, marketType, bookId]);

  return { comparison, loading, error };
}

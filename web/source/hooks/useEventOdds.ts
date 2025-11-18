/**
 * useEventOdds Hook - FIXED ODDS FORMAT
 *
 * Hooks for fetching and managing event odds data from Firestore
 *
 * FIX: Returns OddsEntry objects with both priceDecimal and priceAmerican
 * Converts between formats so display components work correctly
 */

import { useState, useEffect } from "react";
import { doc, collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Event, OddsEntry } from "../types/events";

export type MarketType = "h2h" | "spreads" | "totals";

/**
 * Convert decimal odds to American odds
 */
function decimalToAmerican(decimal: number): number {
  if (decimal >= 2.0) {
    return Math.round((decimal - 1) * 100);
  } else {
    return Math.round(-100 / (decimal - 1));
  }
}

/**
 * Convert American odds to decimal odds
 */
function americanToDecimal(american: number): number {
  if (american > 0) {
    return 1 + american / 100;
  } else {
    return 1 + 100 / Math.abs(american);
  }
}

/**
 * Hook to get a single event with real-time odds updates
 */
export function useEventOdds(eventId: string | undefined) {
  const [event, setEvent] = useState<Event | null>(null);
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
    let unsubscribeMarkets: (() => void) | undefined;

    const unsubscribeEvent = onSnapshot(
      eventRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setError("Event not found");
          setLoading(false);
          return;
        }

        const baseEvent: Event = {
          id: snapshot.id,
          ...snapshot.data(),
        } as Event;

        const subscribeToMarkets = (
          eventId: string,
          currentEvent: Event
        ): (() => void) => {
          const marketsToFetch = ["h2h", "spreads", "totals"];
          const markets: Event["markets"] = {};
          let loadedMarkets = 0;

          const unsubscribers: (() => void)[] = [];

          marketsToFetch.forEach((marketId) => {
            const booksQuery = query(
              collection(db, "events", eventId, "markets", marketId, "books")
            );

            const unsubscribe = onSnapshot(booksQuery, (booksSnap) => {
              const bookData: any = {};

              booksSnap.forEach((bookDoc) => {
                const data = bookDoc.data();
                if (data?.latest?.odds) {
                  bookData[bookDoc.id] = {
                    odds: data.latest.odds,
                    lastUpdate: data.latest.updatedAt,
                  };
                }
              });

              markets[marketId] = bookData;
              loadedMarkets++;

              // Update event with current markets
              setEvent({
                ...currentEvent,
                markets: { ...markets },
              });

              // Only set loading false after all markets are loaded
              if (loadedMarkets >= marketsToFetch.length) {
                setLoading(false);
              }
            });

            unsubscribers.push(unsubscribe);
          });

          // Return cleanup function that unsubscribes all market listeners
          return () => {
            unsubscribers.forEach((unsub) => unsub());
          };
        };

        setEvent(baseEvent);
        setLoading(false);
        unsubscribeMarkets = subscribeToMarkets(eventId, baseEvent);
      },
      (err) => {
        console.error("Error fetching event:", err);
        setError(err.message || "Failed to fetch event");
        setLoading(false);
      }
    );

    return () => {
      unsubscribeEvent();
      unsubscribeMarkets?.();
    };
  }, [eventId]);

  return { event, loading, error };
}

/**
 * Hook to get best odds for a specific market across all books
 * FIXED: Returns proper OddsEntry objects with both formats
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

    console.log("[useBestOdds] Event markets:", event.markets);
    console.log("[useBestOdds] Market type:", marketType);

    const marketOdds = event.markets[marketType];
    if (!marketOdds || Object.keys(marketOdds).length === 0) {
      console.log("[useBestOdds] No market odds found for", marketType);
      setBestOdds(null);
      return;
    }

    console.log("[useBestOdds] Market odds:", marketOdds);

    // Calculate best odds for each outcome
    const best: Record<string, { value: number; entry: OddsEntry }> = {};

    Object.values(marketOdds).forEach((bookOdds) => {
      const odds = bookOdds.odds;

      Object.entries(odds).forEach(([outcome, entry]) => {
        if (!entry) return;

        // Determine which format we have in Firebase
        const hasDecimal = entry.priceDecimal !== undefined;
        const hasAmerican = entry.priceAmerican !== undefined;

        let priceDecimal: number | undefined;
        let priceAmerican: number | undefined;

        if (hasDecimal) {
          priceDecimal = entry.priceDecimal;
          priceAmerican = decimalToAmerican(priceDecimal);
        } else if (hasAmerican) {
          priceAmerican = entry.priceAmerican;
          priceDecimal = americanToDecimal(priceAmerican);
        } else {
          return; // No valid price
        }

        // For comparison, always use decimal (higher is better)
        const compareValue = priceDecimal!;

        // Create full OddsEntry with both formats
        const oddsEntry: OddsEntry = {
          priceDecimal,
          priceAmerican,
          ...(entry.point !== undefined && { point: entry.point }),
        };

        // Store outcome-specific point (for spreads)
        const outcomeLower = outcome.toLowerCase();
        if (marketType === "spreads" && entry.point !== undefined) {
          // Store points separately for home/away
          if (outcomeLower === "home") {
            if (
              !best.homePoint ||
              Math.abs(entry.point) < Math.abs(best.homePoint.value)
            ) {
              best.homePoint = {
                value: entry.point,
                entry: { priceDecimal, priceAmerican, point: entry.point },
              };
            }
          } else if (outcomeLower === "away") {
            if (
              !best.awayPoint ||
              Math.abs(entry.point) < Math.abs(best.awayPoint.value)
            ) {
              best.awayPoint = {
                value: entry.point,
                entry: { priceDecimal, priceAmerican, point: entry.point },
              };
            }
          }
        }

        // Keep best odds (highest value for decimal)
        if (!best[outcome] || compareValue > best[outcome].value) {
          best[outcome] = { value: compareValue, entry: oddsEntry };
        }
      });
    });

    // Convert to final format
    const finalOdds: Record<string, OddsEntry> = {};
    Object.entries(best).forEach(([key, data]) => {
      finalOdds[key] = data.entry;
    });

    console.log("[useBestOdds] Final best odds:", finalOdds);
    setBestOdds(finalOdds);
  }, [event, marketType]);

  return { bestOdds, loading, error };
}

/**
 * Hook to compare odds from a specific book vs best available
 */
export function useOddsComparison(
  eventId: string | undefined,
  marketType: EventMarketType,
  bookId: string
) {
  const { event, loading, error } = useEventOdds(eventId);
  const { bestOdds } = useBestOdds(eventId, marketType);
  const [comparison, setComparison] = useState<any>(null);

  useEffect(() => {
    if (!event || !event.markets || !bestOdds) {
      setComparison(null);
      return;
    }

    const marketOdds = event.markets[marketType];
    if (!marketOdds || !marketOdds[bookId]) {
      setComparison(null);
      return;
    }

    const bookOdds = marketOdds[bookId].odds;
    const comp: any = {};

    Object.entries(bookOdds).forEach(([outcome, entry]) => {
      const normalized = normalizeOutcomeOdds(entry as OutcomeOdds);
      if (!normalized) return;

      const bestEntry = bestOdds[outcome];
      if (!bestEntry) return;

      const bookValue = entry.priceDecimal || entry.priceAmerican;
      const bestValue = bestEntry.priceDecimal || bestEntry.priceAmerican;

      comp[outcome] = {
        bookOdds: entry,
        bestOdds: bestEntry,
        isBest: bookValue === bestValue,
        difference: bestValue - bookValue,
      };
    });

    setComparison(comp);
  }, [event, marketType, bookId, bestOdds]);

  return { comparison, loading, error };
}

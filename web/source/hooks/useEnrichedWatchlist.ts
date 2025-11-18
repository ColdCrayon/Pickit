/**
 * useEnrichedWatchlist - FLEXIBLE VERSION
 *
 * Checks for markets in BOTH locations:
 * 1. As subcollection: /events/{id}/markets/{marketId}
 * 2. As field: event.markets
 */

import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { WatchlistGame, Watchlist } from "../types/watchlist";
import { Event } from "../types/events";
import { Timestamp } from "firebase/firestore";

export interface EnrichedWatchlistGame extends WatchlistGame {
  eventData?: Event;
  isUpcoming: boolean;
  hasStarted: boolean;
}

interface UseEnrichedWatchlistReturn {
  games: EnrichedWatchlistGame[];
  teams: Watchlist["teams"];
  markets: Watchlist["markets"];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  totalItems: number;
}

const normalizeWatchlistData = (data: any): Watchlist => {
  const toTimestamp = (val: any): Timestamp => {
    if (val instanceof Timestamp) return val;
    if (val?.toDate) return val;
    if (val?.seconds) return new Timestamp(val.seconds, val.nanoseconds || 0);
    return Timestamp.now();
  };

  return {
    games: (data?.games || []).map((g: any) => ({
      ...g,
      startTime: toTimestamp(g.startTime),
      addedAt: toTimestamp(g.addedAt),
    })),
    teams: (data?.teams || []).map((t: any) => ({
      ...t,
      addedAt: toTimestamp(t.addedAt),
    })),
    markets: (data?.markets || []).map((m: any) => ({
      ...m,
      addedAt: toTimestamp(m.addedAt),
    })),
  };
};

export function useEnrichedWatchlist(
  userId: string | undefined
): UseEnrichedWatchlistReturn {
  const [games, setGames] = useState<EnrichedWatchlistGame[]>([]);
  const [teams, setTeams] = useState<Watchlist["teams"]>([]);
  const [markets, setMarkets] = useState<Watchlist["markets"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventData = async (gameId: string): Promise<Event | null> => {
    try {
      console.log(`🔍 Fetching event: ${gameId}`);

      const eventRef = doc(db, "events", gameId);
      const eventSnap = await getDoc(eventRef);

      if (!eventSnap.exists()) {
        console.warn(`Event ${gameId} not found`);
        return null;
      }

      const eventData = eventSnap.data() as Event;
      console.log(`✅ Event found:`, eventData);

      // CHECK 1: Is markets already in the document as a field?
      if (eventData.markets && typeof eventData.markets === "object") {
        console.log(`✅ Markets found as FIELD in document`);
        console.log(`   Markets:`, Object.keys(eventData.markets));

        return {
          id: eventSnap.id,
          ...eventData,
        };
      }

      // CHECK 2: Try to fetch markets from subcollection
      console.log(`🔍 Checking markets subcollection...`);
      const marketsRef = collection(db, "events", gameId, "markets");
      const marketsSnap = await getDocs(marketsRef);

      console.log(`📊 Markets subcollection has ${marketsSnap.size} documents`);

      if (marketsSnap.size === 0) {
        console.warn(`⚠️ No markets found (neither field nor subcollection)`);

        // Return event without markets
        return {
          id: eventSnap.id,
          ...eventData,
          markets: {},
        };
      }

      // Markets exist as subcollection - fetch them
      const markets: Event["markets"] = {};

      for (const marketDoc of marketsSnap.docs) {
        console.log(`  📈 Found market: ${marketDoc.id}`);

        // Now fetch books subcollection for this market
        const booksRef = collection(
          db,
          "events",
          gameId,
          "markets",
          marketDoc.id,
          "books"
        );
        const booksSnap = await getDocs(booksRef);

        console.log(`    📚 Books in ${marketDoc.id}: ${booksSnap.size}`);

        if (booksSnap.size > 0) {
          const books: any = {};

          booksSnap.forEach((bookDoc) => {
            const bookData = bookDoc.data();
            console.log(`      📖 Book: ${bookDoc.id}`, bookData);

            // Transform to expected format
            if (bookData.latest?.odds) {
              books[bookDoc.id] = {
                outcomes: {},
                lastUpdate: bookData.latest.updatedAt || Timestamp.now(),
              };

              // Convert odds format
              Object.entries(bookData.latest.odds).forEach(
                ([outcome, data]: [string, any]) => {
                  books[bookDoc.id].outcomes[outcome] = {
                    price: data.priceDecimal || data.priceAmerican || 0,
                    point: data.point,
                  };
                }
              );
            }
          });

          markets[marketDoc.id] = {
            books,
          } as any;
        }
      }

      console.log(`✅ Final markets object:`, markets);

      return {
        id: eventSnap.id,
        ...eventData,
        markets,
      };
    } catch (err) {
      console.error(`❌ Error fetching event ${gameId}:`, err);
      return null;
    }
  };

  const enrichGames = async (
    watchlistGames: WatchlistGame[]
  ): Promise<EnrichedWatchlistGame[]> => {
    const now = Timestamp.now();

    const enrichedGames = await Promise.all(
      watchlistGames.map(async (game) => {
        const eventData = await fetchEventData(game.id);

        const startTime =
          game.startTime instanceof Timestamp
            ? game.startTime
            : Timestamp.now();

        const isUpcoming = startTime.toMillis() > now.toMillis();
        const hasStarted = startTime.toMillis() <= now.toMillis();

        return {
          ...game,
          eventData: eventData || undefined,
          isUpcoming,
          hasStarted,
        };
      })
    );

    return enrichedGames.sort((a, b) => {
      if (a.isUpcoming && !b.isUpcoming) return -1;
      if (!a.isUpcoming && b.isUpcoming) return 1;
      const aTime =
        a.startTime instanceof Timestamp ? a.startTime.toMillis() : 0;
      const bTime =
        b.startTime instanceof Timestamp ? b.startTime.toMillis() : 0;
      return aTime - bTime;
    });
  };

  const fetchEnrichedWatchlist = useCallback(async () => {
    if (!userId) {
      setGames([]);
      setTeams([]);
      setMarkets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setGames([]);
        setTeams([]);
        setMarkets([]);
        setLoading(false);
        return;
      }

      const userData = userSnap.data();
      const watchlist = normalizeWatchlistData(userData.watchlist || {});

      setTeams(watchlist.teams);
      setMarkets(watchlist.markets);

      if (watchlist.games.length > 0) {
        const enrichedGames = await enrichGames(watchlist.games);
        setGames(enrichedGames);
      } else {
        setGames([]);
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Failed to load watchlist");
      setGames([]);
      setTeams([]);
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchEnrichedWatchlist();
  }, [fetchEnrichedWatchlist]);

  const totalItems = games.length + teams.length + markets.length;

  return {
    games,
    teams,
    markets,
    loading,
    error,
    refresh: fetchEnrichedWatchlist,
    totalItems,
  };
}

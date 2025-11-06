import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../lib";
import {
  Watchlist,
  WatchlistTeam,
  WatchlistGame,
  WatchlistMarket,
  WatchlistSettings,
} from "../types/watchlist";

interface UseWatchlistReturn {
  watchlist: Watchlist | null;
  settings: WatchlistSettings | null;
  loading: boolean;
  error: string | null;
  addTeam: (team: Omit<WatchlistTeam, "addedAt">) => Promise<void>;
  removeTeam: (teamId: string) => Promise<void>;
  addGame: (game: Omit<WatchlistGame, "addedAt">) => Promise<void>;
  removeGame: (gameId: string) => Promise<void>;
  addMarket: (market: Omit<WatchlistMarket, "addedAt">) => Promise<void>;
  removeMarket: (marketId: string) => Promise<void>;
  updateSettings: (settings: Partial<WatchlistSettings>) => Promise<void>;
  totalItems: number;
}

/**
 * useWatchlist Hook
 * Manages user's watchlist with real-time updates
 *
 * @param userId - Firebase user ID
 * @returns Watchlist data and management functions
 */
export function useWatchlist(userId: string | undefined): UseWatchlistReturn {
  const [watchlist, setWatchlist] = useState<Watchlist | null>(null);
  const [settings, setSettings] = useState<WatchlistSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate total items across all watchlist categories
  const totalItems = watchlist
    ? watchlist.teams.length + watchlist.games.length + watchlist.markets.length
    : 0;

  // Fetch and listen to watchlist changes in real-time
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, "users", userId);

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          // Set watchlist with defaults if not present
          setWatchlist(
            data.watchlist || {
              teams: [],
              games: [],
              markets: [],
            }
          );

          // Set settings with defaults
          setSettings(
            data.watchlistSettings || {
              enableNotifications: true,
              alertThreshold: 5.0,
              maxWatchlistItems: 50,
            }
          );
        } else {
          // Initialize empty watchlist for new users
          setWatchlist({ teams: [], games: [], markets: [] });
          setSettings({
            enableNotifications: true,
            alertThreshold: 5.0,
            maxWatchlistItems: 50,
          });
        }
        setLoading(false);
      },
      (err) => {
        console.error("Watchlist fetch error:", err);
        setError("Failed to load watchlist");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Add team to watchlist
  const addTeam = useCallback(
    async (team: Omit<WatchlistTeam, "addedAt">) => {
      if (!userId || !watchlist) return;

      try {
        // Check if team already exists
        if (watchlist.teams.some((t) => t.id === team.id)) {
          throw new Error("Team already in watchlist");
        }

        const newTeam: WatchlistTeam = {
          ...team,
          addedAt: new Date(),
        };

        const updatedWatchlist = {
          ...watchlist,
          teams: [...watchlist.teams, newTeam],
        };

        await updateDoc(doc(db, "users", userId), {
          watchlist: updatedWatchlist,
        });
      } catch (err: any) {
        setError(err.message || "Failed to add team");
        throw err;
      }
    },
    [userId, watchlist]
  );

  // Remove team from watchlist
  const removeTeam = useCallback(
    async (teamId: string) => {
      if (!userId || !watchlist) return;

      try {
        const updatedWatchlist = {
          ...watchlist,
          teams: watchlist.teams.filter((t) => t.id !== teamId),
        };

        await updateDoc(doc(db, "users", userId), {
          watchlist: updatedWatchlist,
        });
      } catch (err: any) {
        setError(err.message || "Failed to remove team");
        throw err;
      }
    },
    [userId, watchlist]
  );

  // Add game to watchlist
  const addGame = useCallback(
    async (game: Omit<WatchlistGame, "addedAt">) => {
      if (!userId || !watchlist) return;

      try {
        // Check if game already exists
        if (watchlist.games.some((g) => g.id === game.id)) {
          throw new Error("Game already in watchlist");
        }

        const newGame: WatchlistGame = {
          ...game,
          addedAt: new Date(),
        };

        const updatedWatchlist = {
          ...watchlist,
          games: [...watchlist.games, newGame],
        };

        await updateDoc(doc(db, "users", userId), {
          watchlist: updatedWatchlist,
        });
      } catch (err: any) {
        setError(err.message || "Failed to add game");
        throw err;
      }
    },
    [userId, watchlist]
  );

  // Remove game from watchlist
  const removeGame = useCallback(
    async (gameId: string) => {
      if (!userId || !watchlist) return;

      try {
        const updatedWatchlist = {
          ...watchlist,
          games: watchlist.games.filter((g) => g.id !== gameId),
        };

        await updateDoc(doc(db, "users", userId), {
          watchlist: updatedWatchlist,
        });
      } catch (err: any) {
        setError(err.message || "Failed to remove game");
        throw err;
      }
    },
    [userId, watchlist]
  );

  // Add market to watchlist
  const addMarket = useCallback(
    async (market: Omit<WatchlistMarket, "addedAt">) => {
      if (!userId || !watchlist) return;

      try {
        // Check if market already exists
        if (watchlist.markets.some((m) => m.id === market.id)) {
          throw new Error("Market already in watchlist");
        }

        const newMarket: WatchlistMarket = {
          ...market,
          addedAt: new Date(),
        };

        const updatedWatchlist = {
          ...watchlist,
          markets: [...watchlist.markets, newMarket],
        };

        await updateDoc(doc(db, "users", userId), {
          watchlist: updatedWatchlist,
        });
      } catch (err: any) {
        setError(err.message || "Failed to add market");
        throw err;
      }
    },
    [userId, watchlist]
  );

  // Remove market from watchlist
  const removeMarket = useCallback(
    async (marketId: string) => {
      if (!userId || !watchlist) return;

      try {
        const updatedWatchlist = {
          ...watchlist,
          markets: watchlist.markets.filter((m) => m.id !== marketId),
        };

        await updateDoc(doc(db, "users", userId), {
          watchlist: updatedWatchlist,
        });
      } catch (err: any) {
        setError(err.message || "Failed to remove market");
        throw err;
      }
    },
    [userId, watchlist]
  );

  // Update watchlist settings
  const updateSettings = useCallback(
    async (newSettings: Partial<WatchlistSettings>) => {
      if (!userId || !settings) return;

      try {
        const updatedSettings = {
          ...settings,
          ...newSettings,
        };

        await updateDoc(doc(db, "users", userId), {
          watchlistSettings: updatedSettings,
        });
      } catch (err: any) {
        setError(err.message || "Failed to update settings");
        throw err;
      }
    },
    [userId, settings]
  );

  return {
    watchlist,
    settings,
    loading,
    error,
    addTeam,
    removeTeam,
    addGame,
    removeGame,
    addMarket,
    removeMarket,
    updateSettings,
    totalItems,
  };
}

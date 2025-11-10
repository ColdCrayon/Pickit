import { useState, useEffect, useCallback } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
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
 * Normalize watchlist data - handles both array and object formats
 */
function normalizeWatchlistData(watchlist: any): Watchlist {
  if (!watchlist) {
    return { teams: [], games: [], markets: [] };
  }

  // Helper to convert object-with-numeric-keys to array
  const toArray = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== "object") return [];

    // Check if it's an object with numeric keys (0, 1, 2, etc.)
    const keys = Object.keys(data);
    const isNumericKeys = keys.every((k) => !isNaN(parseInt(k)));

    if (isNumericKeys && keys.length > 0) {
      // Convert to array
      return keys
        .map((k) => parseInt(k))
        .sort((a, b) => a - b)
        .map((i) => data[i]);
    }

    return [];
  };

  return {
    teams: toArray(watchlist.teams),
    games: toArray(watchlist.games),
    markets: toArray(watchlist.markets),
  };
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

          // Normalize watchlist data (handles both array and object formats)
          const normalizedWatchlist = normalizeWatchlistData(data.watchlist);
          setWatchlist(normalizedWatchlist);

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
          throw new Error(
            "Team already in watchlist. Reload the page to see the changes."
          );
        }

        const newTeam: WatchlistTeam = {
          ...team,
          addedAt: Timestamp.now().toDate(),
        };

        const updatedWatchlist = {
          teams: [...watchlist.teams, newTeam],
          games: watchlist.games,
          markets: watchlist.markets,
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
          teams: watchlist.teams.filter((t) => t.id !== teamId),
          games: watchlist.games,
          markets: watchlist.markets,
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
          addedAt: Timestamp.now().toDate(),
        };

        const updatedWatchlist = {
          teams: watchlist.teams,
          games: [...watchlist.games, newGame],
          markets: watchlist.markets,
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
          teams: watchlist.teams,
          games: watchlist.games.filter((g) => g.id !== gameId),
          markets: watchlist.markets,
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
          addedAt: Timestamp.now().toDate(),
        };

        const updatedWatchlist = {
          teams: watchlist.teams,
          games: watchlist.games,
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
          teams: watchlist.teams,
          games: watchlist.games,
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

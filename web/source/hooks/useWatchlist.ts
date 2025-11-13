/**
 * useWatchlist Hook - ARRAY STORAGE FIX
 *
 * CRITICAL FIX: Use updateDoc with arrayUnion/arrayRemove to maintain proper array format
 * The previous version using setDoc with spread was converting arrays to objects in Firebase
 */

import { useState, useEffect, useCallback } from "react";
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  getDoc,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  WatchlistGame,
  WatchlistTeam,
  WatchlistMarket,
} from "../types/watchlist";

export interface Watchlist {
  games: WatchlistGame[];
  teams: WatchlistTeam[];
  markets: WatchlistMarket[];
}

export interface WatchlistSettings {
  enableNotifications: boolean;
  alertThreshold: number;
  maxWatchlistItems: number;
}

interface UseWatchlistReturn {
  watchlist: Watchlist;
  watchlistSettings: WatchlistSettings;
  loading: boolean;
  error: string | null;
  addGame: (gameId: string) => Promise<void>;
  removeGame: (gameId: string) => Promise<void>;
  addTeam: (team: Omit<WatchlistTeam, "addedAt">) => Promise<void>;
  removeTeam: (teamId: string) => Promise<void>;
  addMarket: (market: Omit<WatchlistMarket, "addedAt">) => Promise<void>;
  removeMarket: (marketId: string) => Promise<void>;
  updateSettings: (settings: Partial<WatchlistSettings>) => Promise<void>;
  totalItems: number;
  refresh: () => Promise<void>;
}

/**
 * Normalize watchlist data from Firestore
 * Handles both array and object formats
 */
function normalizeWatchlistData(data: any): Watchlist {
  const normalize = (value: any): any[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;

    // If it's an object with numeric keys, convert to array
    if (typeof value === "object") {
      const keys = Object.keys(value);
      const isNumericKeys = keys.every((k) => !isNaN(Number(k)));

      if (isNumericKeys && keys.length > 0) {
        return keys
          .map(Number)
          .sort((a, b) => a - b)
          .map((index) => value[index]);
      }
    }

    return [];
  };

  return {
    games: normalize(data.games),
    teams: normalize(data.teams),
    markets: normalize(data.markets),
  };
}

/**
 * Hook to manage user's watchlist
 */
export function useWatchlist(userId?: string): UseWatchlistReturn {
  const [watchlist, setWatchlist] = useState<Watchlist>({
    games: [],
    teams: [],
    markets: [],
  });
  const [watchlistSettings, setWatchlistSettings] = useState<WatchlistSettings>(
    {
      enableNotifications: true,
      alertThreshold: 5.0,
      maxWatchlistItems: 50,
    }
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to user document for real-time updates
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    console.log("[useWatchlist] Subscribing to user:", userId);

    const userRef = doc(db, "users", userId);

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          console.log("[useWatchlist] Raw data from Firestore:", data);

          const normalizedWatchlist = normalizeWatchlistData(
            data.watchlist || {}
          );
          console.log(
            "[useWatchlist] Normalized watchlist:",
            normalizedWatchlist
          );

          setWatchlist(normalizedWatchlist);
          setWatchlistSettings(
            data.watchlistSettings || {
              enableNotifications: true,
              alertThreshold: 5.0,
              maxWatchlistItems: 50,
            }
          );
        } else {
          console.log(
            "[useWatchlist] User document does not exist, will create on first add"
          );
          setWatchlist({ games: [], teams: [], markets: [] });
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("[useWatchlist] Error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Add a game to watchlist - SIMPLIFIED to just take gameId
  const addGame = useCallback(
    async (gameId: string) => {
      if (!userId) throw new Error("User not authenticated");

      const userRef = doc(db, "users", userId);

      console.log("[useWatchlist] Adding game:", gameId);

      // Check if already exists
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const currentWatchlist = normalizeWatchlistData(data?.watchlist || {});

        const exists = currentWatchlist.games.some((g) => g.id === gameId);
        if (exists) {
          console.log("[useWatchlist] Game already in watchlist:", gameId);
          return;
        }
      }

      // Create timestamp as regular Timestamp (not serverTimestamp)
      const now = Timestamp.now();

      // Use arrayUnion to properly add to array
      try {
        await updateDoc(userRef, {
          "watchlist.games": arrayUnion({
            id: gameId,
            addedAt: now,
          }),
        });
      } catch (err: any) {
        // If document doesn't exist, create it
        if (err.code === "not-found") {
          await setDoc(userRef, {
            watchlist: {
              games: [{ id: gameId, addedAt: now }],
              teams: [],
              markets: [],
            },
            watchlistSettings: {
              enableNotifications: true,
              alertThreshold: 5.0,
              maxWatchlistItems: 50,
            },
          });
        } else {
          throw err;
        }
      }
    },
    [userId]
  );

  // Remove a game from watchlist
  const removeGame = useCallback(
    async (gameId: string) => {
      if (!userId) throw new Error("User not authenticated");

      console.log("[useWatchlist] Removing game:", gameId);

      const userRef = doc(db, "users", userId);

      // Get current data to find exact object to remove
      const snapshot = await getDoc(userRef);
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      const currentWatchlist = normalizeWatchlistData(data?.watchlist || {});

      // Find the game object to remove
      const gameToRemove = currentWatchlist.games.find((g) => g.id === gameId);
      if (!gameToRemove) return;

      // Use arrayRemove with the exact object
      await updateDoc(userRef, {
        "watchlist.games": arrayRemove(gameToRemove),
      });
    },
    [userId]
  );

  // Add a team to watchlist
  const addTeam = useCallback(
    async (team: Omit<WatchlistTeam, "addedAt">) => {
      if (!userId) throw new Error("User not authenticated");

      console.log("[useWatchlist] Adding team:", team);

      const userRef = doc(db, "users", userId);

      // Check if already exists
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const currentWatchlist = normalizeWatchlistData(data?.watchlist || {});

        const exists = currentWatchlist.teams.some((t) => t.id === team.id);
        if (exists) return;
      }

      const now = Timestamp.now();
      const teamWithTimestamp = {
        ...team,
        addedAt: now,
      };

      try {
        await updateDoc(userRef, {
          "watchlist.teams": arrayUnion(teamWithTimestamp),
        });
      } catch (err: any) {
        if (err.code === "not-found") {
          await setDoc(userRef, {
            watchlist: {
              games: [],
              teams: [teamWithTimestamp],
              markets: [],
            },
          });
        } else {
          throw err;
        }
      }
    },
    [userId]
  );

  // Remove a team from watchlist
  const removeTeam = useCallback(
    async (teamId: string) => {
      if (!userId) throw new Error("User not authenticated");

      console.log("[useWatchlist] Removing team:", teamId);

      const userRef = doc(db, "users", userId);

      const snapshot = await getDoc(userRef);
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      const currentWatchlist = normalizeWatchlistData(data?.watchlist || {});

      const teamToRemove = currentWatchlist.teams.find((t) => t.id === teamId);
      if (!teamToRemove) return;

      await updateDoc(userRef, {
        "watchlist.teams": arrayRemove(teamToRemove),
      });
    },
    [userId]
  );

  // Add a market to watchlist
  const addMarket = useCallback(
    async (market: Omit<WatchlistMarket, "addedAt">) => {
      if (!userId) throw new Error("User not authenticated");

      console.log("[useWatchlist] Adding market:", market);

      const userRef = doc(db, "users", userId);

      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const currentWatchlist = normalizeWatchlistData(data?.watchlist || {});

        const exists = currentWatchlist.markets.some(
          (m) =>
            m.eventId === market.eventId && m.marketType === market.marketType
        );
        if (exists) return;
      }

      const now = Timestamp.now();
      const marketWithTimestamp = {
        ...market,
        addedAt: now,
      };

      try {
        await updateDoc(userRef, {
          "watchlist.markets": arrayUnion(marketWithTimestamp),
        });
      } catch (err: any) {
        if (err.code === "not-found") {
          await setDoc(userRef, {
            watchlist: {
              games: [],
              teams: [],
              markets: [marketWithTimestamp],
            },
          });
        } else {
          throw err;
        }
      }
    },
    [userId]
  );

  // Remove a market from watchlist
  const removeMarket = useCallback(
    async (marketId: string) => {
      if (!userId) throw new Error("User not authenticated");

      console.log("[useWatchlist] Removing market:", marketId);

      const userRef = doc(db, "users", userId);

      const snapshot = await getDoc(userRef);
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      const currentWatchlist = normalizeWatchlistData(data?.watchlist || {});

      const marketToRemove = currentWatchlist.markets.find(
        (m) => `${m.eventId}-${m.marketType}` === marketId
      );
      if (!marketToRemove) return;

      await updateDoc(userRef, {
        "watchlist.markets": arrayRemove(marketToRemove),
      });
    },
    [userId]
  );

  // Update watchlist settings
  const updateSettings = useCallback(
    async (settings: Partial<WatchlistSettings>) => {
      if (!userId) throw new Error("User not authenticated");

      console.log("[useWatchlist] Updating settings:", settings);

      const userRef = doc(db, "users", userId);

      await updateDoc(userRef, {
        watchlistSettings: {
          ...watchlistSettings,
          ...settings,
        },
      });
    },
    [userId, watchlistSettings]
  );

  // Refresh watchlist manually
  const refresh = useCallback(async () => {
    if (!userId) return;

    const userRef = doc(db, "users", userId);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      const normalizedWatchlist = normalizeWatchlistData(data.watchlist || {});
      setWatchlist(normalizedWatchlist);
    }
  }, [userId]);

  const totalItems =
    watchlist.games.length + watchlist.teams.length + watchlist.markets.length;

  return {
    watchlist,
    watchlistSettings,
    loading,
    error,
    addGame,
    removeGame,
    addTeam,
    removeTeam,
    addMarket,
    removeMarket,
    updateSettings,
    totalItems,
    refresh,
  };
}

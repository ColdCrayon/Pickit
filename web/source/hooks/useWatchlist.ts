/**
 * useWatchlist Hook - FIXED VERSION
 *
 * Manages user's watchlist with real-time updates from Firestore.
 * Handles adding/removing games, teams, and markets.
 *
 * FIXES:
 * - Added normalizeWatchlistData() to convert Firestore object format to array format
 * - Handles games stored as {0: {}, 1: {}} instead of [{}, {}]
 * - Safely handles missing or malformed watchlist data
 */

import { useState, useEffect, useCallback } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  setDoc,
  getDoc,
  serverTimestamp,
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
  addGame: (game: Omit<WatchlistGame, "addedAt">) => Promise<void>;
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
 * CRITICAL FIX: Normalize watchlist data from Firestore
 *
 * Firestore sometimes stores arrays as objects with numeric keys like:
 * { 0: {...}, 1: {...}, 2: {...} }
 *
 * This function converts them back to proper arrays: [{...}, {...}, {...}]
 */
function normalizeWatchlistData(data: any): Watchlist {
  const normalize = (value: any): any[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;

    // If it's an object with numeric keys, convert to array
    if (typeof value === "object") {
      const keys = Object.keys(value);
      // Check if keys are numeric (0, 1, 2, etc.)
      const isNumericKeys = keys.every((k) => !isNaN(Number(k)));

      if (isNumericKeys && keys.length > 0) {
        // Sort by numeric key and extract values
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
 *
 * @param userId - The user's Firebase Auth UID
 * @returns Watchlist data and methods to add/remove items
 *
 * @example
 * ```tsx
 * const { watchlist, addGame, removeGame } = useWatchlist(user?.uid);
 *
 * // Add a game
 * await addGame({
 *   id: 'event-123',
 *   league: 'NBA',
 *   teams: { home: 'Lakers', away: 'Celtics' },
 *   startTime: Timestamp.now()
 * });
 *
 * // Remove a game
 * await removeGame('event-123');
 * ```
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

          // Use normalizeWatchlistData to handle object-to-array conversion
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
            "[useWatchlist] User document does not exist, creating default"
          );
          // Initialize empty watchlist if document doesn't exist
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

  // Add a game to watchlist
  const addGame = useCallback(
    async (game: Omit<WatchlistGame, "addedAt">) => {
      if (!userId) throw new Error("User not authenticated");

      const userRef = doc(db, "users", userId);

      // First, get current data to check for duplicates
      const snapshot = await getDoc(userRef);
      const data = snapshot.data();
      const currentWatchlist = normalizeWatchlistData(data?.watchlist || {});

      // Check if game already exists
      const exists = currentWatchlist.games.some((g) => g.id === game.id);
      if (exists) {
        console.log("[useWatchlist] Game already in watchlist:", game.id);
        return;
      }

      console.log("[useWatchlist] Adding game:", game);

      const gameWithTimestamp: WatchlistGame = {
        ...game,
        addedAt: serverTimestamp() as any, // Cast to any to satisfy type checker
      };

      // Important: Use array format, not arrayUnion (which can cause object format)
      const newGames = [...currentWatchlist.games, gameWithTimestamp];

      await setDoc(
        userRef,
        {
          watchlist: {
            ...currentWatchlist,
            games: newGames,
          },
        },
        { merge: true }
      );
    },
    [userId]
  );

  // Remove a game from watchlist
  const removeGame = useCallback(
    async (gameId: string) => {
      if (!userId) throw new Error("User not authenticated");

      console.log("[useWatchlist] Removing game:", gameId);

      const userRef = doc(db, "users", userId);

      // Get current watchlist
      const snapshot = await getDoc(userRef);
      const data = snapshot.data();
      const currentWatchlist = normalizeWatchlistData(data?.watchlist || {});

      // Filter out the game
      const newGames = currentWatchlist.games.filter((g) => g.id !== gameId);

      await setDoc(
        userRef,
        {
          watchlist: {
            ...currentWatchlist,
            games: newGames,
          },
        },
        { merge: true }
      );
    },
    [userId]
  );

  // Add a team to watchlist
  const addTeam = useCallback(
    async (team: Omit<WatchlistTeam, "addedAt">) => {
      if (!userId) throw new Error("User not authenticated");

      console.log("[useWatchlist] Adding team:", team);

      const userRef = doc(db, "users", userId);
      const teamWithTimestamp: WatchlistTeam = {
        ...team,
        addedAt: serverTimestamp() as any,
      };

      // Get current watchlist
      const snapshot = await getDoc(userRef);
      const data = snapshot.data();
      const currentWatchlist = normalizeWatchlistData(data?.watchlist || {});

      // Check for duplicates
      const exists = currentWatchlist.teams.some((t) => t.id === team.id);
      if (exists) return;

      const newTeams = [...currentWatchlist.teams, teamWithTimestamp];

      await setDoc(
        userRef,
        {
          watchlist: {
            ...currentWatchlist,
            teams: newTeams,
          },
        },
        { merge: true }
      );
    },
    [userId]
  );

  // Remove a team from watchlist
  const removeTeam = useCallback(
    async (teamId: string) => {
      if (!userId) throw new Error("User not authenticated");

      console.log("[useWatchlist] Removing team:", teamId);

      const userRef = doc(db, "users", userId);

      // Get current watchlist
      const snapshot = await getDoc(userRef);
      const data = snapshot.data();
      const currentWatchlist = normalizeWatchlistData(data?.watchlist || {});

      const newTeams = currentWatchlist.teams.filter((t) => t.id !== teamId);

      await setDoc(
        userRef,
        {
          watchlist: {
            ...currentWatchlist,
            teams: newTeams,
          },
        },
        { merge: true }
      );
    },
    [userId]
  );

  // Add a market to watchlist
  const addMarket = useCallback(
    async (market: Omit<WatchlistMarket, "addedAt">) => {
      if (!userId) throw new Error("User not authenticated");

      console.log("[useWatchlist] Adding market:", market);

      const userRef = doc(db, "users", userId);
      const marketWithTimestamp: WatchlistMarket = {
        ...market,
        addedAt: serverTimestamp() as any,
      };

      // Get current watchlist
      const snapshot = await getDoc(userRef);
      const data = snapshot.data();
      const currentWatchlist = normalizeWatchlistData(data?.watchlist || {});

      // Check for duplicates
      const exists = currentWatchlist.markets.some(
        (m) =>
          m.eventId === market.eventId && m.marketType === market.marketType
      );
      if (exists) return;

      const newMarkets = [...currentWatchlist.markets, marketWithTimestamp];

      await setDoc(
        userRef,
        {
          watchlist: {
            ...currentWatchlist,
            markets: newMarkets,
          },
        },
        { merge: true }
      );
    },
    [userId]
  );

  // Remove a market from watchlist
  const removeMarket = useCallback(
    async (marketId: string) => {
      if (!userId) throw new Error("User not authenticated");

      console.log("[useWatchlist] Removing market:", marketId);

      const userRef = doc(db, "users", userId);

      // Get current watchlist
      const snapshot = await getDoc(userRef);
      const data = snapshot.data();
      const currentWatchlist = normalizeWatchlistData(data?.watchlist || {});

      const newMarkets = currentWatchlist.markets.filter((m) => {
        const id = `${m.eventId}-${m.marketType}`;
        return id !== marketId;
      });

      await setDoc(
        userRef,
        {
          watchlist: {
            ...currentWatchlist,
            markets: newMarkets,
          },
        },
        { merge: true }
      );
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

  // Refresh watchlist data
  const refresh = useCallback(async () => {
    if (!userId) return;

    const userRef = doc(db, "users", userId);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      const normalizedWatchlist = normalizeWatchlistData(data.watchlist || {});
      setWatchlist(normalizedWatchlist);
      setWatchlistSettings(
        data.watchlistSettings || {
          enableNotifications: true,
          alertThreshold: 5.0,
          maxWatchlistItems: 50,
        }
      );
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

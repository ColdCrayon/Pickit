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
 * - Proper Timestamp handling with serverTimestamp()
 */

import { useState, useEffect, useCallback } from "react";
import {
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
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
  removeMarket: (eventId: string, marketType: string) => Promise<void>;
  updateSettings: (settings: Partial<WatchlistSettings>) => Promise<void>;
  totalItems: number;
  refresh: () => Promise<void>;
}

const DEFAULT_WATCHLIST: Watchlist = {
  games: [],
  teams: [],
  markets: [],
};

const DEFAULT_SETTINGS: WatchlistSettings = {
  enableNotifications: true,
  alertThreshold: 5,
  maxWatchlistItems: 50,
};

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
      const isNumericKeys = keys.every((k) => /^\d+$/.test(k));

      if (isNumericKeys && keys.length > 0) {
        // Convert to array, sorted by numeric key
        return keys
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map((k) => value[k])
          .filter((v) => v !== null && v !== undefined);
      }
    }

    return [];
  };

  return {
    games: normalize(data?.games),
    teams: normalize(data?.teams),
    markets: normalize(data?.markets),
  };
}

/**
 * Hook to manage user's watchlist
 *
 * @param userId - User ID to fetch watchlist for
 * @returns Watchlist data and mutation functions
 *
 * @example
 * ```tsx
 * const { watchlist, addGame, removeGame } = useWatchlist(user?.uid);
 * ```
 */
export function useWatchlist(userId: string | undefined): UseWatchlistReturn {
  const [watchlist, setWatchlist] = useState<Watchlist>(DEFAULT_WATCHLIST);
  const [watchlistSettings, setWatchlistSettings] =
    useState<WatchlistSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate total items
  const totalItems =
    watchlist.games.length + watchlist.teams.length + watchlist.markets.length;

  // Refresh function to manually reload watchlist
  const refresh = useCallback(async () => {
    if (!userId) return;

    try {
      const userRef = doc(db, "users", userId);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setWatchlist(normalizeWatchlistData(data.watchlist || {}));
        setWatchlistSettings(data.watchlistSettings || DEFAULT_SETTINGS);
      } else {
        setWatchlist(DEFAULT_WATCHLIST);
        setWatchlistSettings(DEFAULT_SETTINGS);
      }
    } catch (err: any) {
      console.error("[useWatchlist] Error refreshing:", err);
      setError(err.message);
    }
  }, [userId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId) {
      setWatchlist(DEFAULT_WATCHLIST);
      setWatchlistSettings(DEFAULT_SETTINGS);
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

          console.log("[useWatchlist] Received data:", {
            games: data.watchlist?.games?.length || 0,
            teams: data.watchlist?.teams?.length || 0,
            markets: data.watchlist?.markets?.length || 0,
          });

          const normalized = normalizeWatchlistData(data.watchlist || {});
          setWatchlist(normalized);
          setWatchlistSettings(data.watchlistSettings || DEFAULT_SETTINGS);
        } else {
          console.log("[useWatchlist] User document does not exist");
          setWatchlist(DEFAULT_WATCHLIST);
          setWatchlistSettings(DEFAULT_SETTINGS);
        }

        setLoading(false);
        setError(null);
      },
      (err: any) => {
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

      // FIXED: Ensure startTime is Timestamp and create complete game object
      let startTimeTimestamp: Timestamp;
      if (game.startTime instanceof Timestamp) {
        startTimeTimestamp = game.startTime;
      } else if (game.startTime instanceof Date) {
        startTimeTimestamp = Timestamp.fromDate(game.startTime);
      } else if (typeof game.startTime === "object" && game.startTime.toDate) {
        startTimeTimestamp = game.startTime as Timestamp;
      } else {
        console.error("[useWatchlist] Invalid startTime:", game.startTime);
        throw new Error("Invalid game start time");
      }

      const gameWithTimestamp: WatchlistGame = {
        ...game,
        startTime: startTimeTimestamp,
        addedAt: Timestamp.now(), // Use Timestamp.now() instead of serverTimestamp() for client-side
      };

      // Important: Use array format, not arrayUnion (which can cause object format)
      const newGames = [...currentWatchlist.games, gameWithTimestamp];

      await setDoc(
        userRef,
        {
          watchlist: {
            games: newGames,
            teams: currentWatchlist.teams,
            markets: currentWatchlist.markets,
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

      const newGames = currentWatchlist.games.filter((g) => g.id !== gameId);

      await setDoc(
        userRef,
        {
          watchlist: {
            games: newGames,
            teams: currentWatchlist.teams,
            markets: currentWatchlist.markets,
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
      const snapshot = await getDoc(userRef);
      const data = snapshot.data();
      const currentWatchlist = normalizeWatchlistData(data?.watchlist || {});

      // Check for duplicates
      const exists = currentWatchlist.teams.some((t) => t.id === team.id);
      if (exists) return;

      const teamWithTimestamp: WatchlistTeam = {
        ...team,
        addedAt: Timestamp.now(),
      };

      const newTeams = [...currentWatchlist.teams, teamWithTimestamp];

      await setDoc(
        userRef,
        {
          watchlist: {
            games: currentWatchlist.games,
            teams: newTeams,
            markets: currentWatchlist.markets,
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
      const snapshot = await getDoc(userRef);
      const data = snapshot.data();
      const currentWatchlist = normalizeWatchlistData(data?.watchlist || {});

      const newTeams = currentWatchlist.teams.filter((t) => t.id !== teamId);

      await setDoc(
        userRef,
        {
          watchlist: {
            games: currentWatchlist.games,
            teams: newTeams,
            markets: currentWatchlist.markets,
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
      const snapshot = await getDoc(userRef);
      const data = snapshot.data();
      const currentWatchlist = normalizeWatchlistData(data?.watchlist || {});

      // Check for duplicates
      const exists = currentWatchlist.markets.some(
        (m) =>
          m.eventId === market.eventId && m.marketType === market.marketType
      );
      if (exists) return;

      const marketWithTimestamp: WatchlistMarket = {
        ...market,
        addedAt: Timestamp.now(),
      };

      const newMarkets = [...currentWatchlist.markets, marketWithTimestamp];

      await setDoc(
        userRef,
        {
          watchlist: {
            games: currentWatchlist.games,
            teams: currentWatchlist.teams,
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
    async (eventId: string, marketType: string) => {
      if (!userId) throw new Error("User not authenticated");

      console.log("[useWatchlist] Removing market:", eventId, marketType);

      const userRef = doc(db, "users", userId);
      const snapshot = await getDoc(userRef);
      const data = snapshot.data();
      const currentWatchlist = normalizeWatchlistData(data?.watchlist || {});

      const newMarkets = currentWatchlist.markets.filter(
        (m) => !(m.eventId === eventId && m.marketType === marketType)
      );

      await setDoc(
        userRef,
        {
          watchlist: {
            games: currentWatchlist.games,
            teams: currentWatchlist.teams,
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

      await setDoc(
        userRef,
        {
          watchlistSettings: {
            ...watchlistSettings,
            ...settings,
          },
        },
        { merge: true }
      );
    },
    [userId, watchlistSettings]
  );

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

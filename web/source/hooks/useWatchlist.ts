/**
 * useWatchlist Hook - FIXED serverTimestamp() ERROR
 *
 * Manages user's watchlist with real-time updates from Firestore.
 * Handles adding/removing games, teams, and markets.
 *
 * FIX: Replaced serverTimestamp() with new Date() for array items
 * Firestore does not support serverTimestamp() inside arrays
 */

import { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot, setDoc, getDoc, Timestamp } from "firebase/firestore";
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
 * Normalize watchlist data from Firestore
 * Converts object format to array format if needed
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
            "[useWatchlist] User document does not exist, creating default"
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

  // Add a game to watchlist
  const addGame = useCallback(
    async (game: Omit<WatchlistGame, "addedAt">) => {
      if (!userId) throw new Error("User not authenticated");

      const userRef = doc(db, "users", userId);

      const snapshot = await getDoc(userRef);
      const data = snapshot.data();
      const currentWatchlist = normalizeWatchlistData(data?.watchlist || {});

      const exists = currentWatchlist.games.some((g) => g.id === game.id);
      if (exists) {
        console.log("[useWatchlist] Game already in watchlist:", game.id);
        return;
      }

      console.log("[useWatchlist] Adding game:", game);

      // ✅ FIX: Use Timestamp.now() instead of serverTimestamp()
      const gameWithTimestamp: WatchlistGame = {
        ...game,
        addedAt: Timestamp.now(),
      };

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

      const snapshot = await getDoc(userRef);
      const data = snapshot.data();
      const currentWatchlist = normalizeWatchlistData(data?.watchlist || {});

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

      // ✅ FIX: Use Timestamp.now() instead of serverTimestamp()
      const teamWithTimestamp: WatchlistTeam = {
        ...team,
        addedAt: Timestamp.now(),
      };

      const snapshot = await getDoc(userRef);
      const data = snapshot.data();
      const currentWatchlist = normalizeWatchlistData(data?.watchlist || {});

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

      // ✅ FIX: Use Timestamp.now() instead of serverTimestamp()
      const marketWithTimestamp: WatchlistMarket = {
        ...market,
        addedAt: Timestamp.now(),
      };

      const snapshot = await getDoc(userRef);
      const data = snapshot.data();
      const currentWatchlist = normalizeWatchlistData(data?.watchlist || {});

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

      const snapshot = await getDoc(userRef);
      const data = snapshot.data();
      const currentWatchlist = normalizeWatchlistData(data?.watchlist || {});

      const newMarkets = currentWatchlist.markets.filter(
        (m) => `${m.eventId}-${m.marketType}` !== marketId
      );

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

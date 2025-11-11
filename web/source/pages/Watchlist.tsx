/**
 * Watchlist Types - Complete Type Definitions
 *
 * Defines types for watchlist items: games, teams, markets
 */

import { Timestamp } from "firebase/firestore";
import { League, MarketKey, Teams } from "../types/events";

/**
 * Watchlist Game (event added to watchlist)
 */
export interface WatchlistGame {
  id: string; // Event ID from /events collection
  league: League; // e.g., "NBA", "NFL"
  teams: Teams; // { home: "Lakers", away: "Celtics" }
  startTime: Timestamp; // ✅ FIXED: Changed from Date to Timestamp
  addedAt: Timestamp; // ✅ FIXED: Changed from Date to Timestamp
}

/**
 * Watchlist Team (team added to watchlist)
 */
export interface WatchlistTeam {
  id: string; // Unique identifier for the team
  name: string; // Team name (e.g., "Los Angeles Lakers")
  league: League; // e.g., "NBA", "NFL"
  addedAt: Timestamp; // When added to watchlist
}

/**
 * Watchlist Market (specific market to watch for an event)
 */
export interface WatchlistMarket {
  eventId: string; // Event ID
  marketType: MarketKey; // ✅ FIXED: Changed to MarketKey type (was string)
  alertThreshold?: number; // Trigger alert if odds change by this %
  addedAt: Timestamp; // When added to watchlist
}

/**
 * Complete Watchlist structure (stored in user document)
 */
export interface Watchlist {
  games: WatchlistGame[];
  teams: WatchlistTeam[];
  markets: WatchlistMarket[];
}

/**
 * Watchlist Settings (user preferences)
 */
export interface WatchlistSettings {
  enableNotifications: boolean; // Master switch for notifications
  alertThreshold: number; // Default threshold for odds changes (%)
  maxWatchlistItems: number; // Maximum items allowed
}

/**
 * Helper type for adding items to watchlist (omits addedAt)
 */
export type WatchlistGameInput = Omit<WatchlistGame, "addedAt">;
export type WatchlistTeamInput = Omit<WatchlistTeam, "addedAt">;
export type WatchlistMarketInput = Omit<WatchlistMarket, "addedAt">;

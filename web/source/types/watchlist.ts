/**
 * Watchlist Types
 * Defines the structure for watchlist items stored in user documents
 */

export interface WatchlistTeam {
  id: string;
  league: "NFL" | "NBA" | "MLB" | "NHL";
  name: string;
  addedAt: Date;
}

export interface WatchlistGame {
  id: string;
  league: "NFL" | "NBA" | "MLB" | "NHL";
  teams: {
    home: string;
    away: string;
  };
  startTime: Date;
  addedAt: Date;
}

export interface WatchlistMarket {
  id: string;
  type: "spread" | "totals" | "moneyline" | "prop";
  eventId: string;
  league: "NFL" | "NBA" | "MLB" | "NHL";
  description: string;
  addedAt: Date;
}

export interface Watchlist {
  teams: WatchlistTeam[];
  games: WatchlistGame[];
  markets: WatchlistMarket[];
}

export interface WatchlistSettings {
  enableNotifications: boolean;
  alertThreshold: number;
  maxWatchlistItems: number;
}

export type WatchlistItemType = "team" | "game" | "market";

export interface AddWatchlistItemParams {
  type: WatchlistItemType;
  item:
    | Omit<WatchlistTeam, "addedAt">
    | Omit<WatchlistGame, "addedAt">
    | Omit<WatchlistMarket, "addedAt">;
}

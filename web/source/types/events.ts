/**
 * Event & Odds Types
 * Matches the Firestore schema created by odds-ingestor service
 */

import { Timestamp } from "firebase/firestore";

// ============================================================================
// CORE EVENT TYPES
// ============================================================================

/**
 * Event document from /events collection
 */
export interface Event {
  id: string;
  sport: string; // e.g., "basketball_nba", "americanfootball_nfl"
  teams: {
    home: string;
    away: string;
  };
  startTime: Timestamp | Date;
  lastOddsUpdate?: Timestamp | Date;
  expiresAt?: Timestamp | Date;
}

// ============================================================================
// ODDS TYPES
// ============================================================================

/**
 * Odds entry for a single outcome (American or Decimal format)
 */
export interface OddsEntry {
  priceAmerican?: number; // e.g., -110, +150
  priceDecimal?: number; // e.g., 1.91, 2.50
  point?: number; // For spreads/totals (e.g., -3.5, 227.5)
}

/**
 * Moneyline odds (h2h market)
 */
export interface MoneylineOdds {
  home?: OddsEntry;
  away?: OddsEntry;
  draw?: OddsEntry; // For soccer, etc.
}

/**
 * Spread odds
 */
export interface SpreadOdds {
  home?: OddsEntry; // Includes point and price
  away?: OddsEntry; // Includes point and price
}

/**
 * Totals (over/under) odds
 */
export interface TotalsOdds {
  over?: OddsEntry; // Includes point (line) and price
  under?: OddsEntry; // Includes point (line) and price
}

/**
 * Generic odds type (can be any market type)
 */
export type Odds = MoneylineOdds | SpreadOdds | TotalsOdds;

// ============================================================================
// MARKET & BOOK TYPES
// ============================================================================

/**
 * Market types supported by The Odds API
 */
export type MarketType = "h2h" | "spreads" | "totals";

/**
 * Book (sportsbook) odds data
 */
export interface BookOdds {
  bookId: string; // e.g., "fanduel", "draftkings"
  updatedAt: Timestamp | Date;
  odds: Odds;
}

/**
 * Market document from /events/{eventId}/markets/{marketId}
 */
export interface Market {
  id: MarketType;
  eventId: string;
  books: Record<string, BookOdds>; // bookId -> BookOdds
}

/**
 * Latest odds snapshot from /events/{eventId}/markets/{marketId}/books/{bookId}
 */
export interface BookSnapshot {
  latest: {
    updatedAt: Timestamp | Date;
    odds: Odds;
  };
}

// ============================================================================
// AGGREGATED VIEWS (FOR UI DISPLAY)
// ============================================================================

/**
 * Complete event data with all markets and books
 * Used for displaying full event details
 */
export interface EventWithOdds extends Event {
  markets?: {
    h2h?: Record<string, BookOdds>; // bookId -> odds
    spreads?: Record<string, BookOdds>;
    totals?: Record<string, BookOdds>;
  };
}

/**
 * Simplified event for browsing/listing
 * Only includes best odds from each market
 */
export interface EventSummary extends Event {
  bestOdds?: {
    moneyline?: {
      home: number;
      away: number;
    };
    spread?: {
      line: number;
      home: number;
      away: number;
    };
    total?: {
      line: number;
      over: number;
      under: number;
    };
  };
}

// ============================================================================
// ODDS CHANGE TRACKING
// ============================================================================

/**
 * Tracks how odds have changed over time
 */
export interface OddsChange {
  eventId: string;
  marketType: MarketType;
  bookId: string;
  outcome: "home" | "away" | "over" | "under" | "draw";
  oldValue: number;
  newValue: number;
  changePercent: number;
  timestamp: Timestamp | Date;
}

/**
 * Odds snapshot stored in user doc for comparison
 */
export interface UserOddsSnapshot {
  [eventId: string]: {
    moneyline?: { home: number; away: number };
    spread?: { home: number; away: number; line: number };
    totals?: { over: number; under: number; line: number };
    lastChecked: Timestamp | Date;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Sport types from The Odds API
 */
export type SportKey =
  | "americanfootball_nfl"
  | "basketball_nba"
  | "icehockey_nhl"
  | "baseball_mlb";

/**
 * League mapping (user-friendly names)
 */
export type League = "NFL" | "NBA" | "NHL" | "MLB";

/**
 * Sport key to league mapping
 */
export const sportToLeague: Record<string, League> = {
  americanfootball_nfl: "NFL",
  basketball_nba: "NBA",
  icehockey_nhl: "NHL",
  baseball_mlb: "MLB",
};

/**
 * League to sport key mapping
 */
export const leagueToSport: Record<League, SportKey> = {
  NFL: "americanfootball_nfl",
  NBA: "basketball_nba",
  NHL: "icehockey_nhl",
  MLB: "baseball_mlb",
};

// ============================================================================
// QUERY TYPES
// ============================================================================

/**
 * Filters for querying events
 */
export interface EventFilters {
  sport?: SportKey | SportKey[];
  startAfter?: Date;
  startBefore?: Date;
  limit?: number;
}

/**
 * Options for odds display
 */
export interface OddsDisplayOptions {
  format: "american" | "decimal";
  showAllBooks?: boolean;
  highlightChanges?: boolean;
}

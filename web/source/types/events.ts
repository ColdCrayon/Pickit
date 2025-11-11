/**
 * Event Types - Complete Type Definitions
 *
 * Defines all types for events, odds, and related data structures
 * used throughout the watchlist and event browsing features.
 */

import { Timestamp } from "firebase/firestore";

// Sport keys matching The Odds API format
export type SportKey =
  | "americanfootball_nfl"
  | "basketball_nba"
  | "icehockey_nhl"
  | "baseball_mlb"
  | "basketball_ncaab"
  | "americanfootball_ncaaf";

// User-friendly league names
export type League = "NFL" | "NBA" | "NHL" | "MLB" | "NCAAB" | "NCAAF";

// Market types for betting
export type MarketKey = "h2h" | "spreads" | "totals" | "player_props";

// Outcome types
export type OutcomeType = "home" | "away" | "over" | "under";

/**
 * Event Filters for querying events
 */
export interface EventFilters {
  sport?: SportKey;
  league?: League;
  startDate?: Date; // ✅ FIXED: Added startDate
  endDate?: Date; // ✅ FIXED: Added endDate
  limit?: number;
}

/**
 * Teams in an event
 */
export interface Teams {
  home: string;
  away: string;
}

/**
 * Odds for a specific outcome from a bookmaker
 */
export interface Odds {
  bookmaker: string;
  home?: number; // ✅ FIXED: Added home odds
  away?: number; // ✅ FIXED: Added away odds
  over?: number; // ✅ FIXED: Added over odds
  under?: number; // ✅ FIXED: Added under odds
  point?: number; // Point spread or total line
  price: number; // Odds value (decimal format)
  lastUpdate: Timestamp;
}

/**
 * Market data for an event
 */
export interface Market {
  marketType: MarketKey;
  books: {
    [bookId: string]: {
      outcomes: {
        [outcome: string]: {
          price: number;
          point?: number;
        };
      };
      lastUpdate: Timestamp;
    };
  };
}

/**
 * Main Event interface matching Firestore structure
 */
export interface Event {
  id: string;
  sport: SportKey;
  teams: Teams;
  startTime: Timestamp;
  lastOddsUpdate?: Timestamp;
  expiresAt?: Timestamp;

  // Markets subcollection (populated when queried)
  markets?: {
    [marketKey: string]: Market;
  };
}

/**
 * Event with odds data (used in components)
 */
export interface EventWithOdds extends Event {
  odds?: {
    moneyline?: Odds[];
    spread?: Odds[];
    total?: Odds[];
  };
}

/**
 * Best odds across all bookmakers for a market
 */
export interface BestOdds {
  home?: {
    bookmaker: string;
    price: number;
    point?: number;
  };
  away?: {
    bookmaker: string;
    price: number;
    point?: number;
  };
  over?: {
    bookmaker: string;
    price: number;
    point?: number;
  };
  under?: {
    bookmaker: string;
    price: number;
    point?: number;
  };
}

/**
 * Helper function to convert SportKey to League
 */
export function sportKeyToLeague(sportKey: SportKey): League {
  const mapping: Record<SportKey, League> = {
    americanfootball_nfl: "NFL",
    basketball_nba: "NBA",
    icehockey_nhl: "NHL",
    baseball_mlb: "MLB",
    basketball_ncaab: "NCAAB",
    americanfootball_ncaaf: "NCAAF",
  };
  return mapping[sportKey] || "NFL";
}

/**
 * Helper function to convert League to SportKey
 */
export function leagueToSportKey(league: League): SportKey {
  const mapping: Record<League, SportKey> = {
    NFL: "americanfootball_nfl",
    NBA: "basketball_nba",
    NHL: "icehockey_nhl",
    MLB: "baseball_mlb",
    NCAAB: "basketball_ncaab",
    NCAAF: "americanfootball_ncaaf",
  };
  return mapping[league] || "americanfootball_nfl";
}

/**
 * Helper to get display name for sport
 */
export function getSportDisplayName(sportKey: SportKey): string {
  return sportKeyToLeague(sportKey);
}

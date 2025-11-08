/**
 * web/source/lib/constants.ts
 */

export const SPORTS = ["NFL", "NBA", "MLB", "NHL"] as const;
export type Sport = (typeof SPORTS)[number];

export const DEFAULT_MAX_TICKETS = 20;

export const ROUTES = {
  HOME: "/",
  ACCOUNT: "/Account",
  ADMIN: "/admin",
  ABOUT: "/about",
  NEWS: "/news",
  PRIVACY: "/privacy",
  TERMS: "/termsofservice",
  SUPPORT: "/support",
  UPGRADE: "/upgrade",
  FREE_PICKS: "/FreePicks",
  FREE_PICKS_ALL: "/free-picks/all",
  FREE_PICKS_LEAGUE: "/free-picks/:league",
  ARTICLE: "/news/:slug",
  MY_TICKETS: "/my-tickets", // NEW: User's saved tickets page
} as const;

export const SPORT_ROUTES = {
  NFL: "/nfl",
  NBA: "/nba",
  MLB: "/mlb",
  NHL: "/nhl",
} as const;

// Collection names
export const COLLECTIONS = {
  USERS: "users",
  ARB_TICKETS: "arbTickets",
  GAME_TICKETS: "gameTickets",
  ARTICLES: "articles",
  USER_TICKETS: "tickets", // NEW: Subcollection under users/{uid}/tickets
} as const;

// User roles
export const USER_ROLES = {
  PREMIUM: "isPremium",
  ADMIN: "isAdmin",
} as const;

// NEW: Ticket types
export const TICKET_TYPES = {
  ARB: "arb",
  GAME: "game",
} as const;

export type TicketType = (typeof TICKET_TYPES)[keyof typeof TICKET_TYPES];

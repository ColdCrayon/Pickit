

export const SPORTS = ["NFL", "NBA", "MLB", "NHL"] as const;
export type Sport = typeof SPORTS[number];

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
  BILLING: "/billing",
  FREE_PICKS: "/FreePicks",
  FREE_PICKS_ALL: "/free-picks/all",
  FREE_PICKS_LEAGUE: "/free-picks/:league",
  ARTICLE: "/news/:slug",
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
} as const;

// User roles
export const USER_ROLES = {
  PREMIUM: "isPremium",
  ADMIN: "isAdmin",
} as const;


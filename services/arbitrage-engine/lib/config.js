export const CONFIG = {
  REGION: process.env.REGION || "us-central1",

  // staleness: ignore book odds older than this many seconds
  ARB_ODDS_STALENESS_SEC: Number(process.env.ARB_ODDS_STALENESS_SEC || 90),

  // minimal edge (1 - sum(1/odds)) to consider an arb
  ARB_MIN_EDGE: Number(process.env.ARB_MIN_EDGE || 0.004), // 0.4%

  // bankroll used to compute stakePct
  ARB_BANK: Number(process.env.ARB_BANK || 100),

  // how many events to scan per run
  EVENT_LIMIT: Number(process.env.EVENT_LIMIT || 150),

  // how far out to look (ms). e.g., 48h
  FUTURE_WINDOW_MS: Number(process.env.FUTURE_WINDOW_MS || 48 * 3600 * 1000),
};

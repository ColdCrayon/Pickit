export const CONFIG = {
  REGION: process.env.REGION || "us-central1",

  // scan tuning
  ARB_ODDS_STALENESS_SEC: Number(process.env.ARB_ODDS_STALENESS_SEC || 180),
  ARB_MIN_EDGE:           Number(process.env.ARB_MIN_EDGE || 0.005),
  ARB_BANK:               Number(process.env.ARB_BANK || 100),
  EVENT_LIMIT:            Number(process.env.EVENT_LIMIT || 150),
  FUTURE_WINDOW_MS:       Number(process.env.FUTURE_WINDOW_MS || 2 * 24 * 3600 * 1000),

  // ** IMPORTANT: pick up explicit PROJECT_ID if GOOGLE_CLOUD_PROJECT isn’t set **
  PROJECT_ID:
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    process.env.PROJECT_ID,

  QUEUE_ID:        process.env.QUEUE_ID        || "arb-scan-queue",
  QUEUE_LOCATION:  process.env.QUEUE_LOCATION  || "us-central1",

  SERVICE_URL:     process.env.SERVICE_URL,

  // default audience to SERVICE_URL (needed for Cloud Tasks OIDC)
  SERVICE_AUDIENCE: process.env.SERVICE_AUDIENCE || process.env.SERVICE_URL,

  KICKER_SA_EMAIL: process.env.KICKER_SA_EMAIL,
  KICKER_BASE_URL: process.env.KICKER_BASE_URL,
  KICKER_PATH: process.env.KICKER_PATH,
  KICKER_AUDIENCE: process.env.KICKER_AUDIENCE,
};


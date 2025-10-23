import crypto from "crypto";

export const validDecimal = (o) => typeof o === "number" && isFinite(o) && o > 1.0;

export const twoWayEdge = (a, b) => 1 - (1 / a + 1 / b);
export const threeWayEdge = (o1, o2, o3) => 1 - ((1 / o1) + (1 / o2) + (1 / o3));

export function twoWayStakes(a, b, bank = 100) {
  const denom = 1 / a + 1 / b;
  const s1 = bank * (1 / a) / denom;
  const s2 = bank * (1 / b) / denom;
  return { pct1: s1 / bank, pct2: s2 / bank };
}

export function threeWayStakes(o1, o2, o3, bank) {
  const denom = (1 / o1) + (1 / o2) + (1 / o3);
  const s1 = bank * (1 / o1) / denom;
  const s2 = bank * (1 / o2) / denom;
  const s3 = bank * (1 / o3) / denom;
  return { pct1: s1 / bank, pct2: s2 / bank, pct3: s3 / bank };
}

export function idemArbId(eventId, marketId, legs) {
  const norm = legs
    .map((l) => `${l.outcome}:${l.bookId}:${Math.round(l.priceDecimal * 1000)}`)
    .sort()
    .join("|");
  return `${eventId}_${marketId}_` + crypto.createHash("sha1").update(norm).digest("hex").slice(0, 24);
}

// shared helpers
export const tsToMs = (ts) =>
  (ts?.seconds ?? 0) * 1000 + Math.floor((ts?.nanoseconds ?? 0) / 1e6);

export const isFresh = (updatedAt, stalenessSec) => {
  if (!updatedAt?.seconds) return false;
  const age = (Date.now() - tsToMs(updatedAt)) / 1000;
  return age <= stalenessSec;
};

// normalize lines like -1.5 / +1.5 to 2 decimals to avoid float noise
export const normLine = (x) =>
  typeof x === "number" ? Math.round(x * 100) / 100 : null;

// pretty outcome labels
export const fmt = {
  spreadHome: (pt) => `home(${pt >= 0 ? `+${pt}` : pt})`,
  spreadAway: (pt) => `away(${pt >= 0 ? `+${pt}` : pt})`,
  totalOver:  (pt) => `over(${pt})`,
  totalUnder: (pt) => `under(${pt})`,
};


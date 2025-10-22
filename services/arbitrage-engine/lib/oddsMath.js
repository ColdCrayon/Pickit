import crypto from "crypto";

export const validDecimal = (o) => typeof o === "number" && isFinite(o) && o > 1.0;

export const twoWayEdge = (a, b) => 1 - (1 / a + 1 / b);
export const threeWayEdge = (a, b, c) => 1 - (1 / a + 1 / b + 1 / c);

export function twoWayStakes(a, b, bank = 100) {
  const denom = (1 / a) + (1 / b);
  const s1 = bank * (1 / a) / denom;
  const s2 = bank * (1 / b) / denom;
  return { pct1: s1 / bank, pct2: s2 / bank };
}

export function threeWayStakes(a, b, c, bank = 100) {
  const denom = (1 / a) + (1 / b) + (1 / c);
  const s1 = bank * (1 / a) / denom;
  const s2 = bank * (1 / b) / denom;
  const s3 = bank * (1 / c) / denom;
  return { pct1: s1 / bank, pct2: s2 / bank, pct3: s3 / bank };
}

export function idemArbId(eventId, marketId, legs) {
  // stable hash of legs (bookId/outcome/priceDecimal rounded)
  const norm = legs
    .map(l => `${l.outcome}:${l.bookId}:${Math.round(l.priceDecimal * 1000)}`)
    .sort()
    .join("|");
  const h = crypto.createHash("sha1")
    .update(`${eventId}:${marketId}:${norm}`)
    .digest("hex")
    .slice(0, 24);
  return `${eventId}_${marketId}_${h}`;
}

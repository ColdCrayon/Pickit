import { firestore, getBooksLatest, newBatch, commitBatch, upsertArbTicket } from "./firestore.js";
import { validDecimal, twoWayEdge, twoWayStakes, idemArbId } from "./oddsMath.js";

function tsToMs(ts) {
  if (!ts?.seconds) return 0;
  return ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1e6);
}
function isFresh(updatedAt, stalenessSec) {
  if (!updatedAt?.seconds) return false;
  const ageSec = (Date.now() - tsToMs(updatedAt)) / 1000;
  return ageSec <= stalenessSec;
}
// Normalize lines to 2 decimals (e.g., -3.5, +3.5); adjust if your feeds differ
const norm = (line) => (typeof line === "number" ? Math.round(line * 100) / 100 : null);

export async function scanSpreadForEvent(evDoc, cfg) {
  const ev = evDoc.data();
  const eventRef = evDoc.ref;
  const booksLatest = await getBooksLatest(eventRef, "spread");

  // collect fresh spread offers
  const books = [];
  for (const b of booksLatest) {
    const latest = b.latest;
    if (!isFresh(latest?.updatedAt, cfg.ARB_ODDS_STALENESS_SEC)) continue;
    const sp = latest?.odds?.spread;
    if (!sp) continue;

    const homeLine = norm(sp?.home?.line);
    const awayLine = norm(sp?.away?.line);
    const homePrice = sp?.home?.priceDecimal ?? null;
    const awayPrice = sp?.away?.priceDecimal ?? null;

    // Require both lines exist and are opposite (e.g., -3.5 vs +3.5)
    if (homeLine == null || awayLine == null) continue;
    if (!validDecimal(homePrice) || !validDecimal(awayPrice)) continue;

    books.push({
      bookId: b.bookId,
      updatedAt: latest.updatedAt,
      home: { line: homeLine, priceDecimal: homePrice },
      away: { line: awayLine, priceDecimal: awayPrice }
    });
  }

  // group by the line (we’ll use the absolute home line; away should be -home)
  const byLine = new Map();
  for (const b of books) {
    const key = String(b.home.line); // e.g., "-3.5"
    if (!byLine.has(key)) byLine.set(key, []);
    byLine.get(key).push(b);
  }

  let created = 0;
  const batch = newBatch();

  for (const [lineKey, group] of byLine.entries()) {
    // For this line, find best home and best away prices across different books
    let bestHome = { price: 0, bookId: null };
    let bestAway = { price: 0, bookId: null };

    for (const g of group) {
      if (validDecimal(g.home.priceDecimal) && g.home.priceDecimal > bestHome.price) {
        bestHome = { price: g.home.priceDecimal, bookId: g.bookId };
      }
      if (validDecimal(g.away.priceDecimal) && g.away.priceDecimal > bestAway.price) {
        bestAway = { price: g.away.priceDecimal, bookId: g.bookId };
      }
    }

    if (bestHome.price && bestAway.price) {
      // optional: ensure different books for the legs
      if (bestHome.bookId !== bestAway.bookId) {
        const edge = twoWayEdge(bestHome.price, bestAway.price);
        if (edge >= cfg.ARB_MIN_EDGE) {
          const { pct1, pct2 } = twoWayStakes(bestHome.price, bestAway.price, cfg.ARB_BANK);
          const legs = [
            { outcome: `home(${lineKey})`, bookId: bestHome.bookId, priceDecimal: bestHome.price, stakePct: pct1 },
            { outcome: `away(${lineKey})`, bookId: bestAway.bookId, priceDecimal: bestAway.price, stakePct: pct2 },
          ];
          const arbId = idemArbId(evDoc.id, `spread_${lineKey}`, legs);
          upsertArbTicket(batch, arbId, {
            eventId: evDoc.id,
            marketId: `spread_${lineKey}`,
            legs,
            margin: edge,
            createdAt: firestore.tsNow(),
            settleDate: ev.startTime || firestore.tsNow(),
            serverSettled: false
          });
          created++;
        }
      }
    }
  }

  if (created) await commitBatch(batch);
  return created;
}

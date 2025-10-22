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
const norm = (line) => (typeof line === "number" ? Math.round(line * 100) / 100 : null);

export async function scanTotalForEvent(evDoc, cfg) {
  const ev = evDoc.data();
  const eventRef = evDoc.ref;
  const booksLatest = await getBooksLatest(eventRef, "total");

  const books = [];
  for (const b of booksLatest) {
    const latest = b.latest;
    if (!isFresh(latest?.updatedAt, cfg.ARB_ODDS_STALENESS_SEC)) continue;
    const tot = latest?.odds?.total;
    if (!tot) continue;

    const overLine = norm(tot?.over?.line);
    const underLine = norm(tot?.under?.line);
    const overPrice = tot?.over?.priceDecimal ?? null;
    const underPrice = tot?.under?.priceDecimal ?? null;

    // Require same line for over/under
    if (overLine == null || underLine == null || overLine !== underLine) continue;
    if (!validDecimal(overPrice) || !validDecimal(underPrice)) continue;

    books.push({
      bookId: b.bookId,
      updatedAt: latest.updatedAt,
      over: { line: overLine, priceDecimal: overPrice },
      under: { line: underLine, priceDecimal: underPrice }
    });
  }

  const byLine = new Map();
  for (const b of books) {
    const key = String(b.over.line); // e.g., "47.5"
    if (!byLine.has(key)) byLine.set(key, []);
    byLine.get(key).push(b);
  }

  let created = 0;
  const batch = newBatch();

  for (const [lineKey, group] of byLine.entries()) {
    let bestOver = { price: 0, bookId: null };
    let bestUnder = { price: 0, bookId: null };

    for (const g of group) {
      if (validDecimal(g.over.priceDecimal) && g.over.priceDecimal > bestOver.price) {
        bestOver = { price: g.over.priceDecimal, bookId: g.bookId };
      }
      if (validDecimal(g.under.priceDecimal) && g.under.priceDecimal > bestUnder.price) {
        bestUnder = { price: g.under.priceDecimal, bookId: g.bookId };
      }
    }

    if (bestOver.price && bestUnder.price) {
      if (bestOver.bookId !== bestUnder.bookId) {
        const edge = twoWayEdge(bestOver.price, bestUnder.price);
        if (edge >= cfg.ARB_MIN_EDGE) {
          const { pct1, pct2 } = twoWayStakes(bestOver.price, bestUnder.price, cfg.ARB_BANK);
          const legs = [
            { outcome: `over(${lineKey})`, bookId: bestOver.bookId, priceDecimal: bestOver.price, stakePct: pct1 },
            { outcome: `under(${lineKey})`, bookId: bestUnder.bookId, priceDecimal: bestUnder.price, stakePct: pct2 },
          ];
          const arbId = idemArbId(evDoc.id, `total_${lineKey}`, legs);
          upsertArbTicket(batch, arbId, {
            eventId: evDoc.id,
            marketId: `total_${lineKey}`,
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

import { CONFIG } from "./config.js";
import { firestore, newBatch, commitBatch, upsertArbTicket } from "./firestore.js";
import { validDecimal, twoWayEdge, twoWayStakes, idemArbId, isFresh, normLine, fmt } from "./oddsMath.js";

export async function scanEventTotals(evDoc) {
  const ev = evDoc.data();
  const mktRef = evDoc.ref.collection("markets").doc("totals"); // <-- plural (mirror your “spreads”)
  const booksSnap = await mktRef.collection("books").get();

  const quotes = [];
  booksSnap.forEach((d) => {
    const latest = d.data()?.latest;
    if (!latest || !isFresh(latest.updatedAt, CONFIG.ARB_ODDS_STALENESS_SEC)) return;

    const overPt = normLine(latest?.odds?.over?.point);
    const underPt = normLine(latest?.odds?.under?.point);
    const overPx = latest?.odds?.over?.priceDecimal;
    const underPx = latest?.odds?.under?.priceDecimal;

    if (overPt == null || underPt == null || overPt !== underPt) return;
    if (!validDecimal(overPx) || !validDecimal(underPx)) return;

    quotes.push({
      bookId: d.id,
      updatedAt: latest.updatedAt,
      over:  { point: overPt,  priceDecimal: overPx  },
      under: { point: underPt, priceDecimal: underPx },
    });
  });

  if (!quotes.length) return 0;

  // group by total point (e.g., "47.5")
  const byPoint = new Map();
  for (const q of quotes) {
    const key = String(q.over.point);
    if (!byPoint.has(key)) byPoint.set(key, []);
    byPoint.get(key).push(q);
  }

  let created = 0;
  const batch = newBatch();

  for (const [lineKey, group] of byPoint.entries()) {
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

    if (!bestOver.price || !bestUnder.price) continue;
    if (bestOver.bookId === bestUnder.bookId) continue;

    const edge = twoWayEdge(bestOver.price, bestUnder.price);
    if (edge >= CONFIG.ARB_MIN_EDGE) {
      const { pct1, pct2 } = twoWayStakes(bestOver.price, bestUnder.price, CONFIG.ARB_BANK);
      const legs = [
        { outcome: fmt.totalOver(Number(lineKey)),  bookId: bestOver.bookId,  priceDecimal: bestOver.price,  stakePct: pct1 },
        { outcome: fmt.totalUnder(Number(lineKey)), bookId: bestUnder.bookId, priceDecimal: bestUnder.price, stakePct: pct2 },
      ];

      const arbId = idemArbId(evDoc.id, `total_${lineKey}`, legs);
      upsertArbTicket(batch, arbId, {
        eventId: evDoc.id,
        marketId: `total_${lineKey}`,
        legs,
        margin: edge,
        createdAt: firestore.tsNow(),
        settleDate: ev.startTime || firestore.tsNow(),
        serverSettled: false,
      });
      created++;
    }
  }

  if (created) await commitBatch(batch);
  return created;
}


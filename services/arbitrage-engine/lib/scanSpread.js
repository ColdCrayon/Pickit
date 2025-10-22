import { CONFIG } from "./config.js";
import { firestore, newBatch, commitBatch, upsertArbTicket } from "./firestore.js";
import { validDecimal, twoWayEdge, twoWayStakes, idemArbId, isFresh, normLine, fmt } from "./oddsMath.js";

export async function scanEventSpreads(evDoc) {
  const ev = evDoc.data();
  const mktRef = evDoc.ref.collection("markets").doc("spreads"); // <-- plural (as in your screenshot)
  const booksSnap = await mktRef.collection("books").get();

  const quotes = [];
  booksSnap.forEach((d) => {
    const latest = d.data()?.latest;
    if (!latest || !isFresh(latest.updatedAt, CONFIG.ARB_ODDS_STALENESS_SEC)) return;

    const homePt = normLine(latest?.odds?.home?.point);
    const awayPt = normLine(latest?.odds?.away?.point);
    const homePx = latest?.odds?.home?.priceDecimal;
    const awayPx = latest?.odds?.away?.priceDecimal;

    if (homePt == null || awayPt == null) return;
    if (!validDecimal(homePx) || !validDecimal(awayPx)) return;

    quotes.push({
      bookId: d.id,
      updatedAt: latest.updatedAt,
      home: { point: homePt, priceDecimal: homePx },
      away: { point: awayPt, priceDecimal: awayPx },
    });
  });

  if (!quotes.length) return 0;

  // group by the **home** point (e.g., "-1.5")
  const byHomePoint = new Map();
  for (const q of quotes) {
    const key = String(q.home.point);
    if (!byHomePoint.has(key)) byHomePoint.set(key, []);
    byHomePoint.get(key).push(q);
  }

  let created = 0;
  const batch = newBatch();

  for (const [lineKey, group] of byHomePoint.entries()) {
    // best home price and best away price for THIS spread line
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

    if (!bestHome.price || !bestAway.price) continue;
    if (bestHome.bookId === bestAway.bookId) continue; // optional: ensure cross-book arb

    const edge = twoWayEdge(bestHome.price, bestAway.price);
    if (edge >= CONFIG.ARB_MIN_EDGE) {
      const { pct1, pct2 } = twoWayStakes(bestHome.price, bestAway.price, CONFIG.ARB_BANK);
      const legs = [
        { outcome: fmt.spreadHome(Number(lineKey)), bookId: bestHome.bookId, priceDecimal: bestHome.price, stakePct: pct1 },
        { outcome: fmt.spreadAway(-Number(lineKey)), bookId: bestAway.bookId, priceDecimal: bestAway.price, stakePct: pct2 }, // away is opposite sign
      ];

      const arbId = idemArbId(evDoc.id, `spread_${lineKey}`, legs);
      upsertArbTicket(batch, arbId, {
        eventId: evDoc.id,
        marketId: `spread_${lineKey}`,     // include line in id for clarity
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


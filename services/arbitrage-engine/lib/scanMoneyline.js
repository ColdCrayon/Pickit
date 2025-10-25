import { CONFIG } from "./config.js";
import { firestore, newBatch, commitBatch, upsertArbTicket } from "./firestore.js";
import { validDecimal, twoWayEdge, threeWayEdge, twoWayStakes, threeWayStakes, idemArbId } from "./oddsMath.js";

function tsToMs(ts) {
  if (!ts?.seconds) return 0;
  return ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1e6);
}

function isFresh(updatedAt, stalenessSec) {
  if (!updatedAt?.seconds) return false;
  const ageSec = (Date.now() - tsToMs(updatedAt)) / 1000;
  return ageSec <= stalenessSec;
}

const validDec = (x) => typeof x === "number" && isFinite(x) && x > 1.0;

// ---- config defaults (can be overridden by caller)
const DEFAULTS = {
  STALENESS_SEC: Number(CONFIG.ARB_ODDS_STALENESS_SEC || 900), // 15m
  MIN_EDGE:      Number(CONFIG.ARB_MIN_EDGE || 0.002),         // 0.2%
  BANK:          Number(CONFIG.ARB_BANK || 100),               // bankroll for stakePct
};

/**
 * Scan one event's moneyline (markets/h2h) for arbitrage.
 * @param {FirebaseFirestore.DocumentSnapshot} evDoc
 * @param {object} cfg { STALENESS_SEC, MIN_EDGE, BANK }
 * @returns {number} count of tickets created/updated
 */
export async function scanEventMoneyline(evDoc, cfg = {}) {
  const { STALENESS_SEC, MIN_EDGE, BANK } = { ...DEFAULTS, ...cfg };
  const ev = evDoc.data() || {};
  const mktRef = evDoc.ref.collection("markets").doc("h2h");

  const booksSnap = await mktRef.collection("books").get();
  const books = [];

  booksSnap.forEach(d => {
    const latest = d.get("latest");
    if (!latest) return;
    if (!isFresh(latest.updatedAt, STALENESS_SEC)) return;

    const o = latest.odds || {};
    const home = o.home?.priceDecimal;
    const away = o.away?.priceDecimal;
    const draw = o.draw?.priceDecimal;

    // keep book only if at least one valid price exists
    if (validDec(home) || validDec(away) || validDec(draw)) {
      books.push({
        bookId: d.id,
        home: validDec(home) ? home : null,
        away: validDec(away) ? away : null,
        draw: validDec(draw) ? draw : null,
        updatedAt: latest.updatedAt,
      });
    }
  });

  if (!books.length) return 0;

  // const batch = db.batch();
  const batch = newBatch();
  let created = 0;
  const nowTs = firestore.tsNow();

  // ---- Two-way (home vs away) across different books
  for (let i = 0; i < books.length; i++) {
    for (let j = 0; j < books.length; j++) {
      if (i === j) continue;
      const A = books[i], B = books[j];
      if (!A.home || !B.away) continue;

      const edge = twoWayEdge(A.home, B.away);
      if (edge >= MIN_EDGE) {
        const { pct1, pct2 } = twoWayStakes(A.home, B.away, BANK);
        const legs = [
          { outcome: "home", bookId: A.bookId, priceDecimal: A.home, stakePct: pct1 },
          { outcome: "away", bookId: B.bookId, priceDecimal: B.away, stakePct: pct2 },
        ];
        const arbId = idemArbId(evDoc.id, "h2h", legs);
        upsertArbTicket(batch, arbId, {
          eventId: evDoc.id,
          marketId: "moneyline",
          legs,
          margin: edge,
          createdAt: nowTs,
          settleDate: ev.startTime || nowTs,
          serverSettled: false,
        });
        created++;
      }
    }
  }

  // ---- Optional: 3-way (home/draw/away) using best prices across books
  const bestHome = books.reduce((acc, b) => (b.home && b.home > acc.price ? { price: b.home, bookId: b.bookId } : acc), { price: 0, bookId: null });
  const bestDraw = books.reduce((acc, b) => (b.draw && b.draw > acc.price ? { price: b.draw, bookId: b.bookId } : acc), { price: 0, bookId: null });
  const bestAway = books.reduce((acc, b) => (b.away && b.away > acc.price ? { price: b.away, bookId: b.bookId } : acc), { price: 0, bookId: null });

  if (bestHome.price && bestDraw.price && bestAway.price) {
    const distinct = new Set([bestHome.bookId, bestDraw.bookId, bestAway.bookId]).size >= 2;
    if (distinct) {
      const edge3 = threeWayEdge(bestHome.price, bestDraw.price, bestAway.price);
      if (edge3 >= MIN_EDGE) {
        const { pct1, pct2, pct3 } = threeWayStakes(bestHome.price, bestDraw.price, bestAway.price, BANK);
        const legs = [
          { outcome: "home", bookId: bestHome.bookId, priceDecimal: bestHome.price, stakePct: pct1 },
          { outcome: "draw", bookId: bestDraw.bookId, priceDecimal: bestDraw.price, stakePct: pct2 },
          { outcome: "away", bookId: bestAway.bookId, priceDecimal: bestAway.price, stakePct: pct3 },
        ];
        const arbId = idemArbId(evDoc.id, "moneyline_3way", legs);
        upsertArbTicket(batch, arbId, {
          eventId: evDoc.id,
          marketId: "moneyline_3way",
          legs,
          margin: edge3,
          createdAt: nowTs,
          settleDate: ev.startTime || nowTs,
          serverSettled: false,
        });
        created++;
      }
    }
  }

  if (created) await batch.commit();
  return created;
}

import { firestore, getBooksLatest, newBatch, commitBatch, upsertArbTicket } from "./firestore.js";
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

export async function scanMoneylineForEvent(evDoc, cfg) {
  const ev = evDoc.data();
  const eventRef = evDoc.ref;
  const booksLatest = await getBooksLatest(eventRef, "moneyline");

  // filter to fresh odds
  const books = booksLatest.map(b => {
    const o = b.latest?.odds || {};
    return {
      bookId: b.bookId,
      updatedAt: b.latest?.updatedAt,
      home: o?.home?.priceDecimal ?? null,
      away: o?.away?.priceDecimal ?? null,
      draw: o?.draw?.priceDecimal ?? null
    };
  }).filter(b =>
    isFresh(b.updatedAt, cfg.ARB_ODDS_STALENESS_SEC) &&
    (validDecimal(b.home) || validDecimal(b.away) || validDecimal(b.draw))
  );

  let created = 0;
  const batch = newBatch();

  // 2-way: test all pairs across different books
  for (let i = 0; i < books.length; i++) {
    for (let j = 0; j < books.length; j++) {
      if (i === j) continue;
      const A = books[i], B = books[j];

      // case 1: home(A) vs away(B)
      if (validDecimal(A.home) && validDecimal(B.away)) {
        const edge = twoWayEdge(A.home, B.away);
        if (edge >= cfg.ARB_MIN_EDGE) {
          const { pct1, pct2 } = twoWayStakes(A.home, B.away, cfg.ARB_BANK);
          const legs = [
            { outcome: "home", bookId: A.bookId, priceDecimal: A.home, stakePct: pct1 },
            { outcome: "away", bookId: B.bookId, priceDecimal: B.away, stakePct: pct2 },
          ];
          const arbId = idemArbId(evDoc.id, "moneyline", legs);
          upsertArbTicket(batch, arbId, {
            eventId: evDoc.id,
            marketId: "moneyline",
            legs,
            margin: edge,
            createdAt: firestore.tsNow(),
            settleDate: ev.startTime || firestore.tsNow(),
            serverSettled: false
          });
          created++;
        }
      }

      // case 2: away(A) vs home(B)
      if (validDecimal(A.away) && validDecimal(B.home)) {
        const edge = twoWayEdge(A.away, B.home);
        if (edge >= cfg.ARB_MIN_EDGE) {
          const { pct1, pct2 } = twoWayStakes(A.away, B.home, cfg.ARB_BANK);
          const legs = [
            { outcome: "away", bookId: A.bookId, priceDecimal: A.away, stakePct: pct1 },
            { outcome: "home", bookId: B.bookId, priceDecimal: B.home, stakePct: pct2 },
          ];
          const arbId = idemArbId(evDoc.id, "moneyline", legs);
          upsertArbTicket(batch, arbId, {
            eventId: evDoc.id,
            marketId: "moneyline",
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

  // simple 3-way: best-of across all books (fast path)
  const best = {
    home: books.reduce((acc, b) => (validDecimal(b.home) && b.home > acc.price ? { price: b.home, bookId: b.bookId } : acc), { price: 0, bookId: null }),
    draw: books.reduce((acc, b) => (validDecimal(b.draw) && b.draw > acc.price ? { price: b.draw, bookId: b.bookId } : acc), { price: 0, bookId: null }),
    away: books.reduce((acc, b) => (validDecimal(b.away) && b.away > acc.price ? { price: b.away, bookId: b.bookId } : acc), { price: 0, bookId: null }),
  };

  if (best.home.price && best.away.price && best.draw.price) {
    // optional: enforce at least 2 distinct books involved
    const distinct = new Set([best.home.bookId, best.draw.bookId, best.away.bookId]).size >= 2;
    if (distinct) {
      const edge3 = threeWayEdge(best.home.price, best.draw.price, best.away.price);
      if (edge3 >= cfg.ARB_MIN_EDGE) {
        const { pct1, pct2, pct3 } = threeWayStakes(best.home.price, best.draw.price, best.away.price, cfg.ARB_BANK);
        const legs = [
          { outcome: "home", bookId: best.home.bookId, priceDecimal: best.home.price, stakePct: pct1 },
          { outcome: "draw", bookId: best.draw.bookId, priceDecimal: best.draw.price, stakePct: pct2 },
          { outcome: "away", bookId: best.away.bookId, priceDecimal: best.away.price, stakePct: pct3 },
        ];
        const arbId = idemArbId(evDoc.id, "moneyline_3way", legs);
        upsertArbTicket(batch, arbId, {
          eventId: evDoc.id,
          marketId: "moneyline_3way",
          legs,
          margin: edge3,
          createdAt: firestore.tsNow(),
          settleDate: ev.startTime || firestore.tsNow(),
          serverSettled: false
        });
        created++;
      }
    }
  }

  if (created) await commitBatch(batch);
  return created;
}

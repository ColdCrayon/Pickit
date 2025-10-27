import crypto from "crypto";
import admin from "firebase-admin";
import { twoWayEdge, twoWayStakes } from "../oddsMath.js";

const db = admin.firestore();
const now = () => admin.firestore.Timestamp.now();

const STALENESS_SEC = Number(process.env.ARB_ODDS_STALENESS_SEC || 90);
const MIN_EDGE = Number(process.env.ARB_MIN_EDGE || 0.004);
const BANK = Number(process.env.ARB_BANK || 100);

function fresh(ts) {
  if (!ts?.seconds) return false;
  const age = (Date.now() - (ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0)/1e6))) / 1000;
  return age <= STALENESS_SEC;
}
function idFor(eventId, propKey, playerId, legs) {
  const norm = legs.map(l => `${l.outcome}:${l.bookId}:${Math.round(l.priceDecimal*1000)}`).sort().join("|");
  const h = crypto.createHash("sha1").update(`${eventId}:${propKey}:${playerId}:${norm}`).digest("hex").slice(0,24);
  return `${eventId}_${propKey}_${playerId}_${h}`;
}

export async function scanPropYesNo(evDoc, propDoc) {
  const ev = evDoc.data();
  const prop = propDoc.data(); // { key, player, selections:["yes","no"] }
  const booksSnap = await propDoc.ref.collection("books").get();

  const books = [];
  booksSnap.forEach(d => {
    const latest = d.data()?.latest;
    if (!latest || !fresh(latest.updatedAt)) return;
    const yes = latest.yes?.priceDecimal;
    const no  = latest.no?.priceDecimal;
    if (yes > 1 || no > 1) books.push({ bookId: d.id, yes, no });
  });

  let created = 0;
  for (let i = 0; i < books.length; i++) {
    for (let j = 0; j < books.length; j++) {
      if (i === j) continue;
      const A = books[i], B = books[j];
      if (!(A.yes > 1 && B.no > 1)) continue;

      const edge = twoWayEdge(A.yes, B.no);
      if (edge >= MIN_EDGE) {
        const { pct1, pct2 } = twoWayStakes(A.yes, B.no, BANK);
        const legs = [
          { outcome: "yes", bookId: A.bookId, priceDecimal: A.yes, stakePct: pct1 },
          { outcome: "no",  bookId: B.bookId, priceDecimal: B.no,  stakePct: pct2 }
        ];
        const arbId = idFor(evDoc.id, prop.key, prop.player?.id || "unknown", legs);
        await db.collection("arbTickets").doc(arbId).set({
          eventId: evDoc.id,
          marketId: `${prop.key}_yes_no`,
          player: prop.player || null,
          legs,
          margin: edge,
          createdAt: now(),
          settleDate: ev.startTime || now(),
          serverSettled: false
        }, { merge: true });
        created++;
      }
    }
  }
  return created;
}


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
function idFor(eventId, propKey, playerId, line, legs) {
  const norm = legs.map(l => `${l.outcome}:${l.bookId}:${Math.round(l.priceDecimal*1000)}`).sort().join("|");
  const h = crypto.createHash("sha1").update(`${eventId}:${propKey}:${playerId}:${line}:${norm}`).digest("hex").slice(0,24);
  return `${eventId}_${propKey}_${playerId}_${String(line).replace(".","_")}_${h}`;
}

export async function scanPropOverUnder(evDoc, propDoc) {
  const ev = evDoc.data();
  const prop = propDoc.data();           // { key, player, selections }
  const booksSnap = await propDoc.ref.collection("books").get();

  // group by identical line (e.g., 27.5)
  const byLine = new Map();
  booksSnap.forEach(d => {
    const latest = d.data()?.latest;
    if (!latest || !fresh(latest.updatedAt)) return;
    const { over, under } = latest;
    if (!over?.line || !under?.line) return;
    if (over.line !== under.line) return;
    const line = String(over.line);
    const arr = byLine.get(line) || [];
    arr.push({ bookId: d.id, over, under });
    byLine.set(line, arr);
  });

  let created = 0;

  for (const [line, quotes] of byLine.entries()) {
    for (let i = 0; i < quotes.length; i++) {
      for (let j = 0; j < quotes.length; j++) {
        if (i === j) continue;
        const A = quotes[i], B = quotes[j];
        const oOver = A.over?.priceDecimal;
        const oUnder = B.under?.priceDecimal;
        if (!(oOver > 1 && oUnder > 1)) continue;

        const edge = twoWayEdge(oOver, oUnder);
        if (edge >= MIN_EDGE) {
          const { pct1, pct2 } = twoWayStakes(oOver, oUnder, BANK);
          const legs = [
            { outcome: "over",  bookId: A.bookId, priceDecimal: oOver,  stakePct: pct1, line: Number(line) },
            { outcome: "under", bookId: B.bookId, priceDecimal: oUnder, stakePct: pct2, line: Number(line) }
          ];
          const arbId = idFor(evDoc.id, prop.key, prop.player?.id || "unknown", line, legs);
          await db.collection("arbTickets").doc(arbId).set({
            eventId: evDoc.id,
            marketId: `${prop.key}_over_under`,
            player: prop.player || null,
            line: Number(line),
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
  }
  return created;
}


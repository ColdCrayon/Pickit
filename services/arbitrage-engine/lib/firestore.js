import admin from "firebase-admin";
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const ts = admin.firestore.Timestamp;

export const firestore = {
  db,
  tsNow: () => admin.firestore.Timestamp.now(),
  tsFromDate: (d) => admin.firestore.Timestamp.fromDate(d),
};

/**
 * Fetch events with optional sport filter and optional future window.
 * If futureWindowMs > 0, returns events with startTime in [now-5m, now+futureWindowMs].
 * Otherwise returns latest `limit` events ordered by startTime.
 */
export async function fetchEvents({ sport, limit = 200, futureWindowMs = 0 }) {
  const now = new Date();
  const startPadMs = 5 * 60 * 1000; // include just-published events

  let q = db.collection("events");

  if (sport) {
    q = q.where("sport", "==", sport);
  }

  if (futureWindowMs > 0) {
    const startTs = ts.fromDate(new Date(now.getTime() - startPadMs));
    const endTs = ts.fromDate(new Date(now.getTime() + futureWindowMs));
    // Range on the SAME field we order by = no composite index needed
    q = q
      .where("startTime", ">=", startTs)
      .where("startTime", "<=", endTs)
      .orderBy("startTime", "asc");
  } else {
    q = q.orderBy("startTime", "asc");
  }

  if (limit) q = q.limit(limit);

  const snap = await q.get();

  console.log(
    `[fetchEvents] sport=${sport || "ANY"} windowMs=${futureWindowMs} ` +
      `returned=${snap.size}`
  );

  // Fallback: if windowed query returned 0, try a simple latest-N fetch to prove data exists
  if (snap.size === 0 && futureWindowMs > 0) {
    const fallback = await db
      .collection("events")
      .orderBy("startTime", "desc")
      .limit(5)
      .get();
    console.log(`[fetchEvents] fallback(last5) size=${fallback.size}`);
  }

  return snap;
}

export async function writeArb(id, doc) {
  const ref = db.collection("arbTickets").doc(id);
  await ref.set({
    ...doc,
    createdAt: doc.createdAt || now()
  }, { merge: true });
}

export async function listPropDocsForEvent(evDoc, { limit = 300 } = {}) {
  const snap = await evDoc.ref.collection("props").limit(limit).get();
  return snap.docs;
}

export function newBatch() {
  return db.batch();
}
export async function commitBatch(batch) {
  await batch.commit();
}
export function upsertArbTicket(batch, arbId, data) {
  batch.set(db.collection("arbTickets").doc(arbId), data, { merge: true });
}

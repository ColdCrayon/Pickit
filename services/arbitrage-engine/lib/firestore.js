import admin from "firebase-admin";
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const firestore = {
  db,
  tsNow: () => admin.firestore.Timestamp.now(),
  tsFromDate: (d) => admin.firestore.Timestamp.fromDate(d),
};

export async function fetchEvents({ sport, limit, futureWindowMs }) {
  const now = admin.firestore.Timestamp.now();
  const future = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() + futureWindowMs)
  );

  let q = db.collection("events")
    .where("startTime", ">=", now)
    .where("startTime", "<=", future)
    .orderBy("startTime", "asc")
    .limit(limit);

  if (sport) {
    q = db.collection("events")
      .where("sport", "==", sport)
      .where("startTime", ">=", now)
      .where("startTime", "<=", future)
      .orderBy("startTime", "asc")
      .limit(limit);
  }

  return await q.get();
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


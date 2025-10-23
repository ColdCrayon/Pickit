import express from "express";
import admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(express.json());

// Helper: recursively delete a document and all of its subcollections
async function recursiveDeleteDoc(docRef) {
  const subcols = await docRef.listCollections();
  for (const col of subcols) {
    // delete all docs in this subcollection (and their subcollections) first
    const docs = await col.listDocuments();
    for (const d of docs) {
      await recursiveDeleteDoc(d);
    }
  }
  await docRef.delete(); // finally delete the doc itself
}

// Page through old events and delete each tree
async function cleanupOldEvents(days = 7, pageSize = 50) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  let deletedCount = 0;
  let last = null;

  while (true) {
    let q = db.collection("events")
      .where("startTime", "<", admin.firestore.Timestamp.fromDate(cutoff))
      .orderBy("startTime", "asc")
      .limit(pageSize);

    if (last) q = q.startAfter(last);

    const snap = await q.get();
    if (snap.empty) break;

    for (const doc of snap.docs) {
      await recursiveDeleteDoc(doc.ref);
      deletedCount++;
    }

    last = snap.docs[snap.docs.length - 1];
  }

  return deletedCount;
}

// POST /cleanup?days=7 (default)
app.post("/cleanup", async (req, res) => {
  try {
    const days = Number(req.query.days || 7);
    const pageSize = Number(req.query.pageSize || 50);
    const n = await cleanupOldEvents(days, pageSize);
    res.json({ ok: true, deletedEvents: n, days });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get("/healthz", (_, res) => res.send("ok"));
app.listen(process.env.PORT || 8080, () => console.log("cleanup up"));

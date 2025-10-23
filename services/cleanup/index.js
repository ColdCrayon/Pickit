import express from "express";
import admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(express.json());

/**
 * Recursively delete a document tree using BulkWriter.
 * We still need to traverse subcollections to list docRefs,
 * but each delete is queued on the writer (fast + retried).
 */
async function deleteDocRecursiveWithWriter(docRef, writer) {
  const subcols = await docRef.listCollections();
  for (const col of subcols) {
    const docs = await col.listDocuments();
    // process sub-docs depth-first
    for (const d of docs) {
      await deleteDocRecursiveWithWriter(d, writer);
    }
  }
  // queue the doc delete (non-blocking)
  writer.delete(docRef);
}

/*
 * pageSize of 50–200 is a good daily cleanup range.
 *   Increase if your trees are shallow; decrease if trees are large
 * Retries: The onWriteError hook above retries up to 3 times for transient
 *   errors—tweak as needed
 * Concurrency: We traverse depth-first and enqueue deletes; BulkWriter
 *   parallelizes RPCs internally. If you want to limit pressure, keep pageSize
 *   modest.
 */
async function cleanupOldEvents(days = 7, pageSize = 50) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Configure BulkWriter with simple retries
  const writer = db.bulkWriter();
  writer.onWriteError((err) => {
    // retry up to 3 times on retryable errors
    if (err.failedAttempts < 3 && err.isRetryable) return true;
    console.error("BulkWriter permanent error:", err);
    return false;
  });
  writer.onWriteResult((_, res) => {
    // Optional: add lightweight metrics/logging here
    // console.log("Deleted", res.writeTime.toDate());
  });

  let deletedEvents = 0;
  let last = null;

  while (true) {
    let q = db
      .collection("events")
      .where("startTime", "<", admin.firestore.Timestamp.fromDate(cutoff))
      .orderBy("startTime", "asc")
      .limit(pageSize);
    if (last) q = q.startAfter(last);

    const snap = await q.get();
    if (snap.empty) break;

    for (const doc of snap.docs) {
      await deleteDocRecursiveWithWriter(doc.ref, writer);
      deletedEvents++;
    }

    // move the cursor
    last = snap.docs[snap.docs.length - 1];
  }

  // Flush all queued deletes and wait for completion
  await writer.close();
  return deletedEvents;
}

// POST /cleanup?days=7&pageSize=50
app.post("/cleanup", async (req, res) => {
  try {
    const days = Number(req.query.days || 7);
    const pageSize = Number(req.query.pageSize || 50);
    const n = await cleanupOldEvents(days, pageSize);
    res.json({ ok: true, deletedEvents: n, days, pageSize });
    console.log(
      `Cleanup complete: deleted ${n} events older than ${days} days`
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get("/healthz", (_, res) => res.send("ok"));
app.listen(process.env.PORT || 8080, () => console.log("cleanup up"));

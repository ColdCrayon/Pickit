import fs from "fs";
import express from "express";
import admin from "firebase-admin";

const app = express();
app.use(express.json());

// --- Early diagnostics: verify files are present in the container
try {
  console.log("CWD:", process.cwd());
  console.log("Dir . :", fs.readdirSync("."));
  if (fs.existsSync("./lib")) console.log("Dir ./lib:", fs.readdirSync("./lib"));
  // If your files live at project root (not ./lib), list them too:
  if (fs.existsSync("./scanSpread.js")) console.log("Found scanSpread.js");
  if (fs.existsSync("./scanTotal.js")) console.log("Found scanTotal.js");
  if (fs.existsSync("./scanMoneyline.js")) console.log("Found scanMoneyline.js");
  if (fs.existsSync("./firestore.js")) console.log("Found firestore.js");
  if (fs.existsSync("./oddsMath.js")) console.log("Found oddsMath.js");
  if (fs.existsSync("./services/arbitrage-engine/lib/config.js")) console.log("Found config.js");
} catch (e) {
  console.error("Startup fs check failed:", e);
}

// --- Initialize Admin defensively (don’t crash on error)
try {
  if (!admin.apps.length) admin.initializeApp();
  console.log("Firebase Admin initialized");
} catch (e) {
  console.error("Admin init failed:", e);
}

// --- Lightweight health routes so Cloud Run sees a listener quickly
app.get("/healthz", (_req, res) => res.status(200).send("ok"));
app.get("/", (_req, res) => res.status(200).json({ ok: true, service: "arb-engine" }));

// --- Real work happens here; import lazily so boot can’t fail before listen
app.post("/scan", async (req, res) => {
  try {
    // Lazy imports: use the file names you actually have
    const { CONFIG } = await import("./lib/config.js");
    const { fetchEvents } = await import("./lib/firestore.js");
    const { scanEventSpreads } = await import("./lib/scanSpread.js"); // singular
    const { scanEventTotals } = await import("./lib/scanTotal.js");   // singular
    // const { scanMoneylineForEvent } = await import("./scanMoneyline.js"); // optional

    const sport = req.query.sport || undefined;
    const market = (req.query.market || "all").toLowerCase();
    const windowHours = Number(req.query.windowHours || 0) || (CONFIG.FUTURE_WINDOW_MS / 3600000);
    const limit = Number(req.query.limit || CONFIG.EVENT_LIMIT);

    const snap = await fetchEvents({
      sport,
      limit,
      futureWindowMs: windowHours * 3600 * 1000,
    });

    let created = 0;
    let scanned = 0;

    for (const ev of snap.docs) {
      scanned++;

      // if (market === "all" || market === "moneyline") {
      //   created += await scanMoneylineForEvent(ev, CONFIG);
      // }

      if (market === "all" || market === "spread" || market === "spreads") {
        created += await scanEventSpreads(ev);
      }
      if (market === "all" || market === "total" || market === "totals") {
        created += await scanEventTotals(ev);
      }
    }

    res.json({ ok: true, created, scanned, market });
  } catch (err) {
    console.error("/scan error:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// --- Start server (Cloud Run requires 0.0.0.0 and PORT)
const PORT = Number(process.env.PORT) || 8080;
app
  .listen(PORT, "0.0.0.0", () => {
    console.log(`Arbitrage engine listening on ${PORT} (env PORT=${process.env.PORT || "unset"})`);
  })
  .on("error", (e) => console.error("Express listen error:", e));

// --- Keep container alive on unexpected errors (so logs are visible)
process.on("unhandledRejection", (r) => console.error("unhandledRejection:", r));
process.on("uncaughtException", (e) => console.error("uncaughtException:", e));


// import express from "express";
// import admin from "firebase-admin";
// import crypto from "crypto";
//
// if (!admin.apps.length) admin.initializeApp();
// const db = admin.firestore();
// const app = express();
// app.use(express.json());
//
// // ---- config
// const STALENESS_SEC = Number(process.env.ARB_ODDS_STALENESS_SEC || 90);   // ignore odds older than N sec
// const MIN_EDGE = Number(process.env.ARB_MIN_EDGE || 0.0005);               // 0.5% default
// const BANK = Number(process.env.ARB_BANK || 100);                          // bankroll used to compute stakePct
//
// // ---- helpers
// const tsNow = () => admin.firestore.Timestamp.now();
// const tsToMs = ts => (ts?.seconds ?? 0) * 1000 + Math.floor((ts?.nanoseconds ?? 0)/1e6);
//
// function validDecimal(o) { return typeof o === "number" && isFinite(o) && o > 1.0; }
//
// function idemArbId(eventId, marketId, legs) {
//   // deterministic id: hash of legs (bookId/outcome/priceDecimal rounded) + event/market
//   const normLegs = legs
//     .map(l => `${l.outcome}:${l.bookId}:${Math.round(l.priceDecimal*1000)}`)
//     .sort()
//     .join("|");
//   const h = crypto.createHash("sha1").update(`${eventId}:${marketId}:${normLegs}`).digest("hex").slice(0,24);
//   return `${eventId}_${marketId}_${h}`;
// }
//
// function twoWayEdge(o1, o2) { return 1 - ((1/o1) + (1/o2)); }
// function threeWayEdge(o1, o2, o3) { return 1 - ((1/o1) + (1/o2) + (1/o3)); }
//
// function twoWayStakes(o1, o2, bank=BANK) {
//   const denom = (1/o1) + (1/o2);
//   const s1 = bank * (1/o1) / denom;
//   const s2 = bank * (1/o2) / denom;
//   return { s1, s2, pct1: s1/bank, pct2: s2/bank };
// }
//
// function threeWayStakes(o1, o2, o3, bank=BANK) {
//   const denom = (1/o1) + (1/o2) + (1/o3);
//   const s1 = bank * (1/o1) / denom;
//   const s2 = bank * (1/o2) / denom;
//   const s3 = bank * (1/o3) / denom;
//   return { s1, s2, s3, pct1: s1/bank, pct2: s2/bank, pct3: s3/bank };
// }
//
// function isFresh(updatedAt) {
//   if (!updatedAt?.seconds) return false;
//   const ageSec = (Date.now() - tsToMs(updatedAt)) / 1000;
//   return ageSec <= STALENESS_SEC;
// }
//
// // ---- core scan
// async function scanEventMoneyline(evDoc) {
//   const ev = evDoc.data();
//   const mktRef = evDoc.ref.collection("markets").doc("h2h");
//   const booksSnap = await mktRef.collection("books").get();
//
//   // collect fresh latest odds per book
//   const books = [];
//   booksSnap.forEach(d => {
//     const latest = d.data()?.latest;
//     if (!latest) return;
//     if (!isFresh(latest.updatedAt)) return;                       // ignore stale
//     const o = latest.odds || {};
//     const home = o.home?.priceDecimal;
//     const away = o.away?.priceDecimal;
//     const draw = o.draw?.priceDecimal;
//
//     // keep only books that have at least home/away with valid decimal > 1
//     const okHome = validDecimal(home);
//     const okAway = validDecimal(away);
//     const okDraw = draw == null ? null : validDecimal(draw);
//
//     if (okHome || okAway || okDraw) {
//       books.push({
//         bookId: d.id,
//         home: okHome ? home : null,
//         away: okAway ? away : null,
//         draw: okDraw ? draw : null,
//         updatedAt: latest.updatedAt
//       });
//     }
//   });
//
//   const batch = db.batch();
//   let created = 0;
//
//   // ---- Two-way arbs across different books (home vs away)
//   for (let i = 0; i < books.length; i++) {
//     for (let j = 0; j < books.length; j++) {
//       if (i === j) continue;
//       const A = books[i], B = books[j];
//       if (!A.home || !B.away) continue;
//
//       const edge = twoWayEdge(A.home, B.away);
//       if (edge >= MIN_EDGE) {
//         const { pct1, pct2 } = twoWayStakes(A.home, B.away);
//         const legs = [
//           { outcome: "home", bookId: A.bookId, priceDecimal: A.home, stakePct: pct1 },
//           { outcome: "away", bookId: B.bookId, priceDecimal: B.away, stakePct: pct2 }
//         ];
//         const arbId = idemArbId(evDoc.id, "moneyline", legs);
//         const arbRef = db.collection("arbTickets").doc(arbId);
//         batch.set(arbRef, {
//           eventId: evDoc.id,
//           marketId: "moneyline",
//           legs,
//           margin: edge,
//           createdAt: tsNow(),
//           settleDate: ev.startTime || tsNow(),
//           serverSettled: false
//         }, { merge: true });
//         created++;
//       }
//     }
//   }
//
//   // also the inverse pairing (away on A, home on B) is covered by i/j loop
//
//   // ---- Three-way (soccer: home/draw/away)
//   // pick best price per outcome across all books (or try combos)
//   const bestHome = books.reduce((acc, b) => (b.home && b.home > acc.price ? { price: b.home, bookId: b.bookId } : acc), {price: 0, bookId: null});
//   const bestDraw = books.reduce((acc, b) => (b.draw && b.draw > acc.price ? { price: b.draw, bookId: b.bookId } : acc), {price: 0, bookId: null});
//   const bestAway = books.reduce((acc, b) => (b.away && b.away > acc.price ? { price: b.away, bookId: b.bookId } : acc), {price: 0, bookId: null});
//
//   if (bestHome.price && bestAway.price && bestDraw.price) {
//     // ensure distinct books (not strictly necessary but reduces operator risk)
//     const distinct = new Set([bestHome.bookId, bestDraw.bookId, bestAway.bookId]).size >= 2;
//     if (distinct) {
//       const edge3 = threeWayEdge(bestHome.price, bestDraw.price, bestAway.price);
//       if (edge3 >= MIN_EDGE) {
//         const { pct1, pct2, pct3 } = threeWayStakes(bestHome.price, bestDraw.price, bestAway.price);
//         const legs = [
//           { outcome: "home", bookId: bestHome.bookId, priceDecimal: bestHome.price, stakePct: pct1 },
//           { outcome: "draw", bookId: bestDraw.bookId, priceDecimal: bestDraw.price, stakePct: pct2 },
//           { outcome: "away", bookId: bestAway.bookId, priceDecimal: bestAway.price, stakePct: pct3 }
//         ];
//         const arbId = idemArbId(evDoc.id, "moneyline_3way", legs);
//         const arbRef = db.collection("arbTickets").doc(arbId);
//         batch.set(arbRef, {
//           eventId: evDoc.id,
//           marketId: "moneyline_3way",
//           legs,
//           margin: edge3,
//           createdAt: tsNow(),
//           settleDate: ev.startTime || tsNow(),
//           serverSettled: false
//         }, { merge: true });
//         created++;
//       }
//     }
//   }
//
//   if (created) await batch.commit();
//   return created;
// }
//
// async function scanAll() {
//   // Limit for one run; schedule frequently
//   const eventsSnap = await db.collection("events")
//     .orderBy("startTime", "asc")
//     .limit(150)
//     .get();
//
//   let total = 0;
//   for (const ev of eventsSnap.docs) {
//     total += await scanEventMoneyline(ev);
//   }
//   return total;
// }
//
// // ---- endpoints
// app.post("/scan", async (req, res) => {
//   try {
//     const created = await scanAll();
//     res.json({ ok: true, created });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ ok: false, error: String(e) });
//   }
// });
// //
// // // Kicker: run /scan now, then schedule another /scan in ~30s via Cloud Tasks.
// // app.post("/kick", async (req, res) => {
// //   try {
// //     // 1) run one scan immediately (optional — or just enqueue both)
// //     // await scanAll();
// //
// //     // 2) enqueue a task for /scan in 30 seconds
// //     const parent = tasksClient.queuePath(PROJECT_ID, REGION, QUEUE);
// //     const url = `${SERVICE_URL}/scan`;
// //     const in30 = Math.floor(Date.now() / 1000) + 30;
// //
// //     const [task] = await tasksClient.createTask({
// //       parent,
// //       task: {
// //         httpRequest: {
// //           httpMethod: "POST",
// //           url,
// //           headers: { "Content-Type": "application/json" },
// //           oidcToken: {
// //             serviceAccountEmail: `tasks-invoker@${PROJECT_ID}.iam.gserviceaccount.com`,
// //             audience: url,
// //           },
// //         },
// //         scheduleTime: { seconds: in30 },
// //       },
// //     });
// //
// //     res.json({ ok: true, scheduled: task.name, etaSeconds: 30 });
// //   } catch (e) {
// //     console.error(e);
// //     res.status(500).json({ ok: false, error: String(e) });
// //   }
// // });
// //
// app.get("/healthz", (_, res) => res.send("ok"));
// app.listen(process.env.PORT || 8080, () => console.log("arb-engine up"));

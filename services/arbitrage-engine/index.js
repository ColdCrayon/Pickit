import fs from "fs";
import express from "express";
import admin from "firebase-admin";
import { CONFIG } from "./lib/config.js";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(express.json());

// --- Early diagnostics: verify files are present in the container
try {
  console.log("CWD:", process.cwd());
  console.log("Dir . :", fs.readdirSync("."));
  if (fs.existsSync("./lib"))
    console.log("Dir ./lib:", fs.readdirSync("./lib"));
  // If your files live at project root (not ./lib), list them too:
  if (fs.existsSync("./lib/scanSpread.js")) console.log("Found scanSpread.js");
  if (fs.existsSync("./lib/scanTotal.js")) console.log("Found scanTotal.js");
  if (fs.existsSync("./lib/scanMoneyline.js"))
    console.log("Found scanMoneyline.js");
  if (fs.existsSync("./lib/firestore.js")) console.log("Found firestore.js");
  if (fs.existsSync("./lib/oddsMath.js")) console.log("Found oddsMath.js");
  if (fs.existsSync("./lib/config.js")) console.log("Found config.js");
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

app.post("/seedTest", async (_req, res) => {
  try {
    const eventId = "TEST_EVENT_ARBITRAGE_001";
    const now = admin.firestore.Timestamp.now();

    // Basic event shell
    await db
      .collection("events")
      .doc(eventId)
      .set(
        {
          sport: "test_sport",
          teams: { home: "Home FC", away: "Away FC" },
          startTime: now, // within window
        },
        { merge: true }
      );

    // --- MONEYLINE (h2h) market with guaranteed two-way arb:
    // Book A has great HOME price; Book B has great AWAY price.
    await db
      .collection("events")
      .doc(eventId)
      .collection("markets")
      .doc("h2h")
      .collection("books")
      .doc("bookA")
      .set(
        {
          latest: {
            updatedAt: now,
            odds: {
              home: { priceDecimal: 2.1 },
              away: { priceDecimal: 1.8 },
            },
          },
        },
        { merge: true }
      );

    await db
      .collection("events")
      .doc(eventId)
      .collection("markets")
      .doc("h2h")
      .collection("books")
      .doc("bookB")
      .set(
        {
          latest: {
            updatedAt: now,
            odds: {
              home: { priceDecimal: 1.8 },
              away: { priceDecimal: 2.1 },
            },
          },
        },
        { merge: true }
      );

    // --- SPREADS market with aligned points and arb:
    // bookA: home -1.5 @ 2.05, away +1.5 @ 1.85
    // bookB: home -1.5 @ 1.85, away +1.5 @ 2.05
    await db
      .collection("events")
      .doc(eventId)
      .collection("markets")
      .doc("spreads")
      .collection("books")
      .doc("bookA")
      .set(
        {
          latest: {
            updatedAt: now,
            odds: {
              home: { point: -1.5, priceDecimal: 2.05 },
              away: { point: 1.5, priceDecimal: 1.85 },
            },
          },
        },
        { merge: true }
      );

    await db
      .collection("events")
      .doc(eventId)
      .collection("markets")
      .doc("spreads")
      .collection("books")
      .doc("bookB")
      .set(
        {
          latest: {
            updatedAt: now,
            odds: {
              home: { point: -1.5, priceDecimal: 1.85 },
              away: { point: 1.5, priceDecimal: 2.05 },
            },
          },
        },
        { merge: true }
      );

    // --- TOTALS market with aligned total and arb:
    // bookA: Over 5.5 @ 2.05, Under 5.5 @ 1.85
    // bookB: Over 5.5 @ 1.85, Under 5.5 @ 2.05
    await db
      .collection("events")
      .doc(eventId)
      .collection("markets")
      .doc("totals")
      .collection("books")
      .doc("bookA")
      .set(
        {
          latest: {
            updatedAt: now,
            odds: {
              over: { point: 5.5, priceDecimal: 2.05 },
              under: { point: 5.5, priceDecimal: 1.85 },
            },
          },
        },
        { merge: true }
      );

    await db
      .collection("events")
      .doc(eventId)
      .collection("markets")
      .doc("totals")
      .collection("books")
      .doc("bookB")
      .set(
        {
          latest: {
            updatedAt: now,
            odds: {
              over: { point: 5.5, priceDecimal: 1.85 },
              under: { point: 5.5, priceDecimal: 2.05 },
            },
          },
        },
        { merge: true }
      );

    res.json({ ok: true, eventId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// --- Lightweight health routes so Cloud Run sees a listener quickly
app.get("/healthz", (_req, res) => res.status(200).send("ok"));
app.get("/", (_req, res) =>
  res.status(200).json({ ok: true, service: "arb-engine" })
);

// --- Real work happens here; import lazily so boot can’t fail before listen
app.post("/scan", async (req, res) => {
  try {
    console.log("Received /scan request with query:", req.query);
    // Lazy imports: use the file names you actually have
    const { CONFIG } = await import("./lib/config.js");
    const { fetchEvents } = await import("./lib/firestore.js");
    const { scanEventMoneyline } = await import("./lib/scanMoneyline.js");
    const { scanEventSpreads } = await import("./lib/scanSpread.js"); // singular
    const { scanEventTotals } = await import("./lib/scanTotal.js"); // singular

    const sport = req.query.sport || undefined;
    const market = (req.query.market || "all").toLowerCase();
    const windowHours =
      Number(req.query.windowHours || 0) || CONFIG.FUTURE_WINDOW_MS / 3600000;
    const limit = Number(req.query.limit || CONFIG.EVENT_LIMIT);

    const snap = await fetchEvents({
      sport,
      limit,
      futureWindowMs: windowHours * 3600 * 1000,
    });

    console.log(
      `Fetched ${snap.size} events for scanning (sport=${sport}, limit=${limit}, windowHours=${windowHours})`
    );

    let created = 0;
    let scanned = 0;

    for (const ev of snap.docs) {
      scanned++;

      console.log(`Scanning event ${ev.id}...`);
      if (market === "all" || market === "moneyline" || market === "h2h") {
        console.log(`Scanning event ${ev.id} for moneyline/arbs...`);
        created += await scanEventMoneyline(ev, CONFIG);
      }

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
    console.log(
      `Arbitrage engine listening on ${PORT} (env PORT=${
        process.env.PORT || "unset"
      })`
    );
  })
  .on("error", (e) => console.error("Express listen error:", e));

// --- Keep container alive on unexpected errors (so logs are visible)
process.on("unhandledRejection", (r) =>
  console.error("unhandledRejection:", r)
);
process.on("uncaughtException", (e) => console.error("uncaughtException:", e));

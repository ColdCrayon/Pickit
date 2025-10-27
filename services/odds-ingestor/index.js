import express from "express";
import fetch from "node-fetch";
import admin from "firebase-admin";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true }); // safety net

const app = express();
app.use(express.json());

const API_HOST = "https://api.the-odds-api.com/v4";
const API_KEY = process.env.ODDS_API_KEY;
const SPORTS_CSV =
  process.env.ODDS_SPORTS || "icehockey_nhl, americanfootball_nfl";
const REGIONS = process.env.ODDS_REGIONS || "us";
const MARKETS = process.env.ODDS_MARKETS || "h2h,spreads,totals";
const ODDS_FORMAT = (process.env.ODDS_FORMAT || "decimal").toLowerCase();
const ARB_ENGINE_URL = process.env.ARB_ENGINE_URL;
console.log(`[boot] ODDS_FORMAT=${ODDS_FORMAT}`);

function pruneUndefinedDeep(v) {
  if (v === undefined) return undefined;
  if (Array.isArray(v))
    return v.map(pruneUndefinedDeep).filter((x) => x !== undefined);
  if (v && typeof v === "object") {
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      const pv = pruneUndefinedDeep(val);
      if (pv !== undefined) out[k] = pv;
    }
    return out;
  }
  return v;
}

async function fetchOddsForSport(sportKey) {
  const url = `${API_HOST}/sports/${sportKey}/odds?regions=${encodeURIComponent(
    REGIONS
  )}&markets=${encodeURIComponent(MARKETS)}&oddsFormat=${encodeURIComponent(
    ODDS_FORMAT
  )}&apiKey=${API_KEY}`;
  const res = await fetch(url, { timeout: 20000 });

  if (!res.ok)
    throw new Error(`Odds API ${sportKey} ${res.status}: ${await res.text()}`);

  console.log(
    `[odds] sport=${sportKey} used=${res.headers.get(
      "x-requests-used"
    )} remaining=${res.headers.get("x-requests-remaining")}`
  );

  return res.json();
}

// Normalize an event payload to your Firestore schema
function normalizeEvent(sportKey, ev) {
  const eventId = ev.id;
  const start = new Date(ev.commence_time);

  // 7 days from now; adjust if you prefer "event start + 7d"
  const expiresAt = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  const base = {
    sport: sportKey,
    teams: { home: ev.home_team, away: ev.away_team },
    startTime: admin.firestore.Timestamp.fromDate(start),
    expiresAt, // TTL field
  };

  console.log(
    `[normalize] ${eventId} expiresAt=${expiresAt.toDate().toISOString()}`
  );

  const updates = [];
  for (const bk of ev.bookmakers || []) {
    const bookId = bk.key;
    const last = bk.last_update ? new Date(bk.last_update) : new Date();

    for (const m of bk.markets || []) {
      const marketId = m.key; // "h2h" | "spreads" | "totals"
      const odds = {};

      for (const o of m.outcomes || []) {
        if (o.price == null) continue;

        let key = o.name;
        if (o.name === ev.home_team) key = "home";
        else if (o.name === ev.away_team) key = "away";
        else if (o.name?.toLowerCase() === "draw") key = "draw";
        else if (o.name?.toLowerCase() === "over") key = "over";
        else if (o.name?.toLowerCase() === "under") key = "under";

        let entry;
        if (ODDS_FORMAT === "american") entry = { priceAmerican: o.price };
        else entry = { priceDecimal: o.price };

        if (o.point != null) entry.point = o.point;

        odds[key] = entry;
      }

      updates.push({ eventId, marketId, bookId, updatedAt: last, odds });
    }
  }

  return { eventId, base, updates };
}

async function writeEventBundle(eventBundle) {
  const { eventId, base, updates } = eventBundle;

  const eventRef = db.collection("events").doc(eventId);
  const batch = db.batch();

  // Fallback in case base.expiresAt was missing or you are backfilling older docs:
  const fallbackExpiresAt = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  // Always upsert top-level event doc, ensuring expiresAt is present
  batch.set(
    eventRef,
    {
      ...base,
      expiresAt: base?.expiresAt ?? fallbackExpiresAt,
    },
    { merge: true }
  );

  // Record lastOddsUpdate for prioritization during scanning
  await db.doc(`events/${eventId}`).set({
    sport: base.sport,
    startTime: base.startTime,
    lastOddsUpdate: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });


  // Write markets/books
  for (const u of updates) {
    const marketRef = eventRef.collection("markets").doc(u.marketId);
    const bookRef = marketRef.collection("books").doc(u.bookId);

    const cleanedOdds = pruneUndefinedDeep(u.odds);
    const updatedAt = admin.firestore.Timestamp.fromDate(u.updatedAt);

    // latest
    batch.set(
      bookRef,
      {
        latest: {
          updatedAt,
          odds: cleanedOdds,
        },
      },
      { merge: true }
    );

    // history (snapshots)
    const tsId = String(u.updatedAt.getTime());
    batch.set(
      bookRef.collection("snapshots").doc(tsId),
      {
        updatedAt,
        odds: cleanedOdds,
        // If you plan TTL on snapshots too, set their own expiresAt here:
        // expiresAt: admin.firestore.Timestamp.fromDate(new Date(u.updatedAt.getTime() + 3 * 24 * 60 * 60 * 1000)),
      },
      { merge: true }
    );
  }

  await batch.commit();

  // Optional: sanity log to confirm the write
  console.log(
    `[writeEventBundle] upserted event ${eventId} (expiresAt ensured) with ${updates.length} book updates`
  );
}

app.post("/ingest", async (req, res) => {
  try {
    const sports =
      Array.isArray(req.body?.sports) && req.body.sports.length
        ? req.body.sports
        : SPORTS_CSV.split(",")
            .map((s) => s.trim())
            .filter(Boolean);

    let ingested = 0;
    for (const sportKey of sports) {
      const events = await fetchOddsForSport(sportKey);
      for (const ev of events) {
        const bundle = normalizeEvent(sportKey, ev);
        await writeEventBundle(bundle);
        ingested += bundle.updates.length;
      }
    }
    res.json({ ok: true, ingested });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.post("/ingestscan", async (req, res) => {
  try {
    const { sports } = req.body;

    console.log(`Starting odds ingestion for sports: ${sports.join(", ")}`);
    // Run ingestion logic here
    const ingested = await ingestOddsForSports(sports);

    // WAIT (3 seconds)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Trigger arbitrage scan
    const response = await fetch(`${ARB_ENGINE_URL}/scan?market=all&windowHours=12&limit=50`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trigger: "post-ingest" }),
    });

    const scanResult = await response.json();
    console.log("Triggered arbitrage scan:", scanResult);

    res.status(200).json({
      ok: true,
      ingested,
      scan: scanResult,
    });
  } catch (err) {
    console.error("Error during ingest:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/", (_, res) => res.type("text/plain").send("ok\n"));
app.get("/healthz", (_, res) => res.type("text/plain").send("ok\n"));
// optional: a catch-all so you can *see* you hit Express rather than Google 404
app.all("*", (req, res) => {
  res
    .status(404)
    .type("text/plain")
    .send(`not found: ${req.method} ${req.path}`);
});

async function ingestOddsForSports(sports) {
  let ingested = 0;
  for (const sportKey of sports) {
    const events = await fetchOddsForSport(sportKey);
    for (const ev of events) {
      const bundle = normalizeEvent(sportKey, ev);
      await writeEventBundle(bundle);
      ingested += bundle.updates.length;
    }
  }
  return ingested;
}

app.listen(process.env.PORT || 8080, () => console.log("odds-ingestor up"));

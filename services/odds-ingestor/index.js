import express from "express";
import fetch from "node-fetch";
import admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const app = express();
app.use(express.json());

const API_HOST = "https://api.the-odds-api.com/v4";

const API_KEY     = process.env.ODDS_API_KEY;
const SPORTS_CSV  = process.env.ODDS_SPORTS || "icehockey_nhl";
const REGIONS     = process.env.ODDS_REGIONS || "us";
const MARKETS     = process.env.ODDS_MARKETS || "h2h,spreads,totals";
const ODDS_FORMAT = process.env.ODDS_FORMAT || "decimal";

// Odds API returns event objects with bookmakers -> markets -> outcomes
// https://the-odds-api.com/liveapi/guides/v4/
async function fetchOddsForSport(sportKey) {
  const url = `${API_HOST}/sports/${sportKey}/odds?regions=${encodeURIComponent(REGIONS)}&markets=${encodeURIComponent(MARKETS)}&oddsFormat=${encodeURIComponent(ODDS_FORMAT)}&apiKey=${API_KEY}`;
  const res = await fetch(url, { timeout: 20000 });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Odds API ${sportKey} ${res.status}: ${text}`);
  }
  // headers include quota info; useful to log
  const remaining = res.headers.get("x-requests-remaining");
  const used      = res.headers.get("x-requests-used");
  console.log(`[odds] sport=${sportKey} used=${used} remaining=${remaining}`);

  const data = await res.json();
  return data; // array of events
}

// Normalize an event payload to your Firestore schema
function normalizeEvent(sportKey, ev) {
  // ev schema per docs: id, commence_time, home_team, away_team, bookmakers[]
  // bookmakers[].key, last_update, markets[].key in {h2h,spreads,totals}, outcomes[]
  const eventId = ev.id; // stable event id from API
  const start   = new Date(ev.commence_time);

  const base = {
    sport: sportKey,
    teams: { home: ev.home_team, away: ev.away_team },
    startTime: admin.firestore.Timestamp.fromDate(start)
  };

  // flatten each bookmaker*market into an update record
  const updates = [];

  for (const bk of (ev.bookmakers || [])) {
    const bookId = bk.key;               // e.g., "draftkings", "fanduel"
    const last   = bk.last_update ? new Date(bk.last_update) : new Date();

    for (const m of (bk.markets || [])) {
      const marketId = m.key;            // "h2h" | "spreads" | "totals" | etc.
      const odds = {};

      for (const o of (m.outcomes || [])) {
        // outcomes: { name: "Team A" | "Over" | "Under" | "Draw", price, point? }
        // Canonicalize "home","away","draw","over","under"
        let key = o.name;
        if (o.name === ev.home_team) key = "home";
        else if (o.name === ev.away_team) key = "away";
        else if (o.name?.toLowerCase() === "draw") key = "draw";
        else if (o.name?.toLowerCase() === "over") key = "over";
        else if (o.name?.toLowerCase() === "under") key = "under";

        odds[key] = {
          priceDecimal: ODDS_FORMAT === "decimal" ? o.price : undefined,
          priceAmerican: ODDS_FORMAT === "american" ? o.price : undefined,
          ...(o.point != null ? { point: o.point } : {})
        };
      }

      updates.push({
        eventId,
        marketId,
        bookId,
        updatedAt: last,
        odds
      });
    }
  }

  return { eventId, base, updates };
}

async function writeEventBundle(eventBundle) {
  const { eventId, base, updates } = eventBundle;

  const eventRef = db.collection("events").doc(eventId);
  const batch = db.batch();

  // ensure event doc exists/updated
  batch.set(eventRef, base, { merge: true });

  for (const u of updates) {
    const marketRef = eventRef.collection("markets").doc(u.marketId);
    const bookRef   = marketRef.collection("books").doc(u.bookId);

    // latest
    batch.set(bookRef, {
      latest: {
        updatedAt: admin.firestore.Timestamp.fromDate(u.updatedAt),
        odds: u.odds
      }
    }, { merge: true });

    // snapshots
    const tsId = String(u.updatedAt.getTime());
    batch.set(bookRef.collection("snapshots").doc(tsId), {
      updatedAt: admin.firestore.Timestamp.fromDate(u.updatedAt),
      odds: u.odds
    }, { merge: true });
  }

  await batch.commit();
}

app.post("/ingest", async (req, res) => {
  try {
    const sports = (req.body?.sports && Array.isArray(req.body.sports))
      ? req.body.sports
      : SPORTS_CSV.split(",").map(s => s.trim()).filter(Boolean);

    let ingested = 0;

    for (const sportKey of sports) {
      const events = await fetchOddsForSport(sportKey); // array
      for (const ev of events) {
        const bundle = normalizeEvent(sportKey, ev);
        await writeEventBundle(bundle);
        ingested += bundle.updates.length;
      }
    }

    // (optional) recompute your /publicOdds best-price views here or leave it to the arb engine
    res.json({ ok: true, ingested });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get("/healthz", (_, res) => res.send("ok"));
app.listen(process.env.PORT || 8080, () => console.log("odds-ingestor up"));

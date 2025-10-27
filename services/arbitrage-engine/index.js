import fs from "fs";
import express from "express";
import admin from "firebase-admin";
import { v2 as CloudTasks } from "@google-cloud/tasks";
import { CONFIG } from "./lib/config.js";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(express.json());

const tasksClient = new CloudTasks.CloudTasksClient();

async function enqueueScanTask({ delaySeconds = 0, payload = {} } = {}) {
  if (!CONFIG.PROJECT_ID || !CONFIG.SERVICE_URL || !CONFIG.KICKER_SA_EMAIL) {
    console.log(`Current CONFIG:`, CONFIG);
    throw new Error("Missing PROJECT_ID, SERVICE_URL or KICKER_SA_EMAIL env");
  }

  const { CloudTasksClient } = await import("@google-cloud/tasks");
  const client = new CloudTasksClient();

  const parent = tasksClient.queuePath(CONFIG.PROJECT_ID, CONFIG.QUEUE_LOCATION, CONFIG.QUEUE_ID);

  const task = {
    httpRequest: {
      httpMethod: "POST",
      url: `${CONFIG.KICKER_BASE_URL}${CONFIG.KICKER_PATH}`,
      headers: { "Content-Type": "application/json" },
      oidcToken: {
        serviceAccountEmail: CONFIG.KICKER_SA_EMAIL,
        audience: CONFIG.KICKER_AUDIENCE,
      },
      body: Buffer.from(JSON.stringify(payload)).toString("base64"),
    },
  };

  const [resp] = await client.createTask({ parent, task });
  return resp.name;
}

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
    const { listPropDocsForEvent } = await import("./lib/firestore.js");
    const { scanPropsForEvent }   = await import("./lib/scanProps/index.js");

    const p = { ...(req.body || {}), ...(req.query || {}) };

    const sport = req.query.sport || undefined;
    const market = String(p.market || "all").toLowerCase();
    const windowHours =
      Number(p.windowHours || 0) || CONFIG.FUTURE_WINDOW_MS / 3600000;
    const limit = Number(p.limit || CONFIG.EVENT_LIMIT);

    let scanned = 0, created = 0, pages = 0;
    let cursor = null;
    
    while (pages < CONFIG.MAX_PAGES) {
      let q = db.collection("events")
        .where("startTime", "<=", admin.firestore.Timestamp.fromMillis(Date.now() + windowHours * 3600000))
        .orderBy("lastOddsUpdate", "desc")
        .limit(CONFIG.PAGE_SIZE);
      if (cursor) 
        q = q.startAfter(cursor);

      const snap = await q.get();
      if (snap.empty) 
        break;

      for (const ev of snap.docs) {
        // your existing scanning logic:
        created += await scanEventMoneyline(ev, CONFIG);
        created += await scanEventSpreads(ev);
        created += await scanEventTotals(ev);

        await ev.ref.set({ lastScannedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
        scanned++;
      }

      cursor = snap.docs[snap.docs.length - 1];
      pages++;
    }

    res.json({ ok: true, created, scanned, market });
  } catch (err) {
    console.error("/scan error:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.post("/kick", async (req, res) => {
  try {
    const sports = (req.query.sport ? req.query.sport.split(",").map(s=>s.trim()) : undefined)
                  || req.body?.sports
                  || ["icehockey_nhl","americanfootball_nfl"];
    const market = (req.query.market || "all").toLowerCase();
    const windowHours = Number(req.query.windowHours || req.body?.windowHours || 48);
    const limit = Number(req.query.limit || req.body?.limit || 150);
    const pauseMs = Number(req.query.pauseMs || req.body?.pauseMs || 2000);

    const taskName = await enqueueScanTask({
      payload: { sports, market, windowHours, limit, pauseMs }
    });

    res.json({ ok: true, enqueued: taskName, target: `${CONFIG.KICKER_BASE_URL}${CONFIG.KICKER_PATH}` });
  } catch (e) {
    console.error("/kick error:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get("/envz", (_req, res) => {
  res.json({
    PROJECT_ID: process.env.PROJECT_ID || null,
    SERVICE_URL: process.env.SERVICE_URL || null,
    SERVICE_AUDIENCE: process.env.SERVICE_AUDIENCE || null,
    KICKER_SA_EMAIL: process.env.KICKER_SA_EMAIL || null,
    QUEUE_ID: process.env.QUEUE_ID || null,
    QUEUE_LOCATION: process.env.QUEUE_LOCATION || null,
  });
});

app.get("/envzcfg", (_req, res) => {
  res.json(CONFIG);
});

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

// --- Seed an event with team markets + sample player props (creates arb-friendly prices)
app.post("/seedProps", async (req, res) => {
  try {
    const {
      eventId = "TEST_EVENT_PROPS_001",
      sport = "basketball_nba",
      home = "Home Team",
      away = "Away Team",
      // props config
      playerId = "p_123",
      playerName = "Sample Player",
      playerTeam = "HOME",
      // lines & prices for props (over/under)
      propKey = "player_points",
      propLine = 27.5,
      overA = 2.02,      // bookA over price
      underA = 1.85,     // bookA under price
      overB = 1.85,      // bookB over price
      underB = 2.04,     // bookB under price

      // team markets (moneyline)
      h2h_home_A = 2.10, h2h_away_A = 1.80,
      h2h_home_B = 1.80, h2h_away_B = 2.10,

      // team markets (spreads)
      spread =  -3.5,
      homeSpreadA = 2.05, awaySpreadA = 1.85,
      homeSpreadB = 1.85, awaySpreadB = 2.05,

      // team markets (totals)
      total =  227.5,
      overTotA = 2.05, underTotA = 1.85,
      overTotB = 1.85, underTotB = 2.05,

      startOffsetMin = 30  // start time now + 30m
    } = req.body || {};

    const now = admin.firestore.Timestamp.now();
    const startTime = admin.firestore.Timestamp.fromMillis(
      Date.now() + startOffsetMin * 60 * 1000
    );

    const evRef = db.collection("events").doc(eventId);

    // 1) event shell
    await evRef.set({
      sport,
      teams: { home, away },
      startTime,
    }, { merge: true });

    // 2) team markets --------------------------

    // moneyline (h2h)
    await evRef.collection("markets").doc("h2h").collection("books").doc("bookA").set({
      latest: {
        updatedAt: now,
        odds: {
          home: { priceDecimal: h2h_home_A },
          away: { priceDecimal: h2h_away_A },
        },
      },
    }, { merge: true });

    await evRef.collection("markets").doc("h2h").collection("books").doc("bookB").set({
      latest: {
        updatedAt: now,
        odds: {
          home: { priceDecimal: h2h_home_B },
          away: { priceDecimal: h2h_away_B },
        },
      },
    }, { merge: true });

    // spreads (aligned point)
    await evRef.collection("markets").doc("spreads").collection("books").doc("bookA").set({
      latest: {
        updatedAt: now,
        odds: {
          home: { point: spread,  priceDecimal: homeSpreadA },
          away: { point: -spread, priceDecimal: awaySpreadA }, // note: away gets opposite sign
        },
      },
    }, { merge: true });

    await evRef.collection("markets").doc("spreads").collection("books").doc("bookB").set({
      latest: {
        updatedAt: now,
        odds: {
          home: { point: spread,  priceDecimal: homeSpreadB },
          away: { point: -spread, priceDecimal: awaySpreadB },
        },
      },
    }, { merge: true });

    // totals (aligned total)
    await evRef.collection("markets").doc("totals").collection("books").doc("bookA").set({
      latest: {
        updatedAt: now,
        odds: {
          over:  { point: total, priceDecimal: overTotA  },
          under: { point: total, priceDecimal: underTotA },
        },
      },
    }, { merge: true });

    await evRef.collection("markets").doc("totals").collection("books").doc("bookB").set({
      latest: {
        updatedAt: now,
        odds: {
          over:  { point: total, priceDecimal: overTotB  },
          under: { point: total, priceDecimal: underTotB },
        },
      },
    }, { merge: true });

    // 3) player props --------------------------
    // root prop doc for (player,propKey)
    const propDocId = `${propKey}:${playerId}`;
    const propRef = evRef.collection("props").doc(propDocId);
    await propRef.set({
      key: propKey,
      player: { id: playerId, name: playerName, team: playerTeam },
      selections: ["over","under"],
    }, { merge: true });

    // two books with same line but inverted prices to guarantee arb
    await propRef.collection("books").doc("bookA").set({
      latest: {
        updatedAt: now,
        over:  { line: propLine, priceDecimal: overA  },
        under: { line: propLine, priceDecimal: underA },
      },
    }, { merge: true });

    await propRef.collection("books").doc("bookB").set({
      latest: {
        updatedAt: now,
        over:  { line: propLine, priceDecimal: overB  },
        under: { line: propLine, priceDecimal: underB },
      },
    }, { merge: true });

    res.json({
      ok: true,
      eventId,
      created: {
        markets: ["h2h","spreads","totals"],
        props: [{ key: propKey, playerId, line: propLine }],
      },
    });
  } catch (e) {
    console.error("seedProps error:", e);
    res.status(500).json({ ok: false, error: String(e) });
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

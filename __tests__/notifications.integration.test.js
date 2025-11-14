/**
 * __tests__/notifications.integration.test.js
 *
 * Integration tests for notification system using Firebase emulator
 * Run with: npm run test:emulated
 */

const admin = require("firebase-admin");
const { initializeTestEnvironment } = require("@firebase/rules-unit-testing");
const fs = require("fs");
const path = require("path");

let testEnv;
let db;

beforeAll(async () => {
  // Initialize test environment
  const projectId = "pickit-b12e5";

  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      host: "127.0.0.1",
      port: 8080,
    },
  });

  // Initialize admin SDK for emulator
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId,
    });
  }

  // Set emulator host
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
  db = admin.firestore();
});

afterAll(async () => {
  await testEnv.cleanup();
  if (admin.apps.length) {
    await admin.app().delete();
  }
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe("Watchlist Notification Integration Tests", () => {
  test("user document stores watchlist correctly", async () => {
    const userId = "test-user-1";

    // Create user with watchlist
    await db
      .collection("users")
      .doc(userId)
      .set({
        email: "test@example.com",
        watchlist: {
          games: [
            {
              id: "game_123",
              league: "NBA",
              teams: { home: "Lakers", away: "Celtics" },
              addedAt: admin.firestore.Timestamp.now(),
            },
          ],
        },
        watchlistSettings: {
          enableNotifications: true,
          alertThreshold: 5.0,
        },
        fcmToken: "test-token-123",
        notificationsEnabled: true,
      });

    // Verify data
    const userDoc = await db.collection("users").doc(userId).get();
    const data = userDoc.data();

    expect(data.watchlist.games).toHaveLength(1);
    expect(data.watchlist.games[0].id).toBe("game_123");
    expect(data.watchlistSettings.enableNotifications).toBe(true);
    expect(data.fcmToken).toBe("test-token-123");
  });

  test("event document structure supports odds tracking", async () => {
    const eventId = "nba_lakers_celtics_20251113";

    await db
      .collection("events")
      .doc(eventId)
      .set({
        sport: "basketball_nba",
        teams: {
          home: "Lakers",
          away: "Celtics",
        },
        startTime: admin.firestore.Timestamp.fromDate(
          new Date("2025-11-13T19:00:00Z")
        ),
        markets: {
          fanduel: {
            spread: {
              home: -110,
              away: -110,
              point: -3.5,
            },
            moneyline: {
              home: -150,
              away: 130,
            },
            totals: {
              over: -110,
              under: -110,
              point: 220.5,
            },
          },
          draftkings: {
            spread: {
              home: -115,
              away: -105,
              point: -3.5,
            },
            moneyline: {
              home: -155,
              away: 135,
            },
          },
        },
      });

    const eventDoc = await db.collection("events").doc(eventId).get();
    const data = eventDoc.data();

    expect(data.markets.fanduel.spread.home).toBe(-110);
    expect(data.markets.fanduel.moneyline.home).toBe(-150);
  });

  test("saved ticket structure supports notifications", async () => {
    const userId = "test-user-1";
    const ticketId = "arb_123";

    // Create user
    await db.collection("users").doc(userId).set({
      email: "test@example.com",
      fcmToken: "test-token",
      notificationsEnabled: true,
    });

    // Create saved ticket
    await db
      .collection("users")
      .doc(userId)
      .collection("savedTickets")
      .doc(ticketId)
      .set({
        ticketId,
        ticketType: "arb",
        savedAt: admin.firestore.Timestamp.now(),
        notificationSent: false,
      });

    // Verify
    const savedTicket = await db
      .collection("users")
      .doc(userId)
      .collection("savedTickets")
      .doc(ticketId)
      .get();

    expect(savedTicket.exists).toBe(true);
    expect(savedTicket.data().ticketType).toBe("arb");
    expect(savedTicket.data().notificationSent).toBe(false);
  });

  test("rate limiting data structure", async () => {
    const userId = "test-user-1";
    const eventId = "game_123";

    await db
      .collection("users")
      .doc(userId)
      .set({
        email: "test@example.com",
        lastNotifications: {
          [eventId]: admin.firestore.Timestamp.now(),
          game_456: admin.firestore.Timestamp.fromDate(
            new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
          ),
        },
      });

    const userDoc = await db.collection("users").doc(userId).get();
    const data = userDoc.data();

    expect(data.lastNotifications[eventId]).toBeDefined();
    expect(data.lastNotifications["game_456"]).toBeDefined();

    // Verify timestamp is recent
    const lastNotified = data.lastNotifications[eventId].toMillis();
    const now = Date.now();
    const minutesSince = (now - lastNotified) / (1000 * 60);

    expect(minutesSince).toBeLessThan(1); // Should be very recent
  });

  test("notification preferences structure", async () => {
    const userId = "test-user-1";

    await db
      .collection("users")
      .doc(userId)
      .set({
        email: "test@example.com",
        notificationPreferences: {
          oddsChanges: true,
          gameStarts: true,
          arbAlerts: true,
          savedTicketUpdates: true,
          quietHoursEnabled: false,
          quietHoursStart: "22:00",
          quietHoursEnd: "08:00",
          minOddsChangePercent: 10,
        },
      });

    const userDoc = await db.collection("users").doc(userId).get();
    const prefs = userDoc.data().notificationPreferences;

    expect(prefs.oddsChanges).toBe(true);
    expect(prefs.minOddsChangePercent).toBe(10);
    expect(prefs.quietHoursStart).toBe("22:00");
  });
});

describe("Event Update Scenarios", () => {
  test("simulates odds change that should trigger notification", async () => {
    const eventId = "game_123";

    // Initial odds
    await db
      .collection("events")
      .doc(eventId)
      .set({
        sport: "basketball_nba",
        teams: { home: "Lakers", away: "Celtics" },
        markets: {
          fanduel: {
            spread: { home: -110, away: -110, point: -3.5 },
          },
        },
      });

    // Get initial state
    const beforeDoc = await db.collection("events").doc(eventId).get();
    const beforeData = beforeDoc.data();

    // Simulate odds update (significant change)
    await db.collection("events").doc(eventId).update({
      "markets.fanduel.spread.home": -150, // Changed from -110 to -150
    });

    // Get updated state
    const afterDoc = await db.collection("events").doc(eventId).get();
    const afterData = afterDoc.data();

    // Verify change
    expect(beforeData.markets.fanduel.spread.home).toBe(-110);
    expect(afterData.markets.fanduel.spread.home).toBe(-150);

    // Calculate change percentage
    const oldOdds = beforeData.markets.fanduel.spread.home;
    const newOdds = afterData.markets.fanduel.spread.home;
    const changePercent = Math.abs(
      ((newOdds - oldOdds) / Math.abs(oldOdds)) * 100
    );

    expect(changePercent).toBeGreaterThan(10); // Should trigger notification
  });

  test("simulates game start time approaching", async () => {
    const eventId = "game_123";

    // Create game starting in 55 minutes
    const startTime = new Date(Date.now() + 55 * 60 * 1000);

    await db
      .collection("events")
      .doc(eventId)
      .set({
        sport: "basketball_nba",
        teams: { home: "Lakers", away: "Celtics" },
        startTime: admin.firestore.Timestamp.fromDate(startTime),
      });

    // Query events starting soon
    const now = admin.firestore.Timestamp.now();
    const oneHourFromNow = admin.firestore.Timestamp.fromMillis(
      now.toMillis() + 60 * 60 * 1000
    );

    const gamesStartingSoon = await db
      .collection("events")
      .where("startTime", ">", now)
      .where("startTime", "<=", oneHourFromNow)
      .get();

    expect(gamesStartingSoon.size).toBe(1);
    expect(gamesStartingSoon.docs[0].id).toBe(eventId);
  });
});

describe("Saved Ticket Notifications", () => {
  test("finds users who saved a specific ticket", async () => {
    const ticketId = "arb_123";

    // Create multiple users with saved tickets
    await db.collection("users").doc("user1").set({
      email: "user1@test.com",
      fcmToken: "token1",
      notificationsEnabled: true,
    });

    await db.collection("users").doc("user2").set({
      email: "user2@test.com",
      fcmToken: "token2",
      notificationsEnabled: true,
    });

    // Save ticket for both users
    await db
      .collection("users")
      .doc("user1")
      .collection("savedTickets")
      .doc(ticketId)
      .set({
        ticketId,
        ticketType: "arb",
        savedAt: admin.firestore.Timestamp.now(),
      });

    await db
      .collection("users")
      .doc("user2")
      .collection("savedTickets")
      .doc(ticketId)
      .set({
        ticketId,
        ticketType: "arb",
        savedAt: admin.firestore.Timestamp.now(),
      });

    // Query using collection group
    const usersWithTicket = await db
      .collectionGroup("savedTickets")
      .where("ticketId", "==", ticketId)
      .get();

    expect(usersWithTicket.size).toBe(2);

    // Extract user IDs
    const userIds = usersWithTicket.docs.map((doc) => {
      const pathParts = doc.ref.path.split("/");
      return pathParts[pathParts.length - 3]; // users/{userId}/savedTickets/{ticketId}
    });

    expect(userIds).toContain("user1");
    expect(userIds).toContain("user2");
  });

  test("creates arb ticket that should trigger notifications", async () => {
    const ticketId = "arb_new_123";

    // Create arb ticket
    await db
      .collection("arbTickets")
      .doc(ticketId)
      .set({
        margin: 0.052, // 5.2% margin
        gameInfo: "Lakers vs Celtics",
        settleDate: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 24 * 60 * 60 * 1000)
        ),
        serverSettled: false,
        createdAt: admin.firestore.Timestamp.now(),
      });

    const ticketDoc = await db.collection("arbTickets").doc(ticketId).get();
    expect(ticketDoc.exists).toBe(true);
    expect(ticketDoc.data().margin).toBe(0.052);
  });
});

describe("Query Performance", () => {
  test("efficiently queries users watching a specific event", async () => {
    // Create 10 users
    const promises = [];
    for (let i = 0; i < 10; i++) {
      const userId = `user_${i}`;
      promises.push(
        db
          .collection("users")
          .doc(userId)
          .set({
            email: `user${i}@test.com`,
            watchlist: {
              games:
                i < 5
                  ? [
                      {
                        id: "game_123",
                        league: "NBA",
                        teams: { home: "Lakers", away: "Celtics" },
                        addedAt: admin.firestore.Timestamp.now(),
                      },
                    ]
                  : [],
            },
            watchlistSettings: {
              enableNotifications: true,
            },
          })
      );
    }
    await Promise.all(promises);

    // Note: Firestore does not support array-contains-any with complex objects
    // In production, we'd need to denormalize or use a different query strategy
    // For now, we'd fetch all users and filter in memory
    const allUsers = await db.collection("users").get();
    const usersWatchingGame = allUsers.docs.filter((doc) => {
      const games = doc.data().watchlist?.games || [];
      return games.some((game) => game.id === "game_123");
    });

    expect(usersWatchingGame.length).toBe(5);
  });
});

const admin = require("firebase-admin");
admin.initializeApp();

async function testTrigger() {
  const db = admin.firestore();

  // Find an event
  const eventsSnap = await db.collection("events").limit(1).get();

  if (eventsSnap.empty) {
    console.log("❌ No events found in Firestore");
    return;
  }

  const eventId = eventsSnap.docs[0].id;
  console.log("Testing with event:", eventId);

  // Update odds
  await db.collection("events").doc(eventId).update({
    "markets.test.spread.home": -200,
    testUpdateTimestamp: admin.firestore.Timestamp.now(),
  });

  console.log("✅ Updated event odds");
  console.log("Watch logs: firebase functions:log --follow");
}

testTrigger().catch(console.error);

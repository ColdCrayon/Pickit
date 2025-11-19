// ========================================
// functions/lib/alert-rules.js
// ========================================
const admin = require('firebase-admin');
const logger = require('firebase-functions/logger');

async function evaluateAlertRules(eventId, beforeData, afterData) {
  const db = admin.firestore();
  const rulesSnapshot = await db.collectionGroup('alertRules')
    .where('enabled', '==', true)
    .where('muted', '==', false)
    .get();

  for (const ruleDoc of rulesSnapshot.docs) {
    const rule = ruleDoc.data();
    const userId = ruleDoc.ref.parent.parent.id;

    // Check if snoozed
    if (rule.snoozedUntil && rule.snoozedUntil.toMillis() > Date.now()) continue;

    // Check throttle
    if (rule.lastTriggered) {
      const minutesSince = (Date.now() - rule.lastTriggered.toMillis()) / 60000;
      if (minutesSince < 60) continue;
    }

    let triggered = false;
    const details = {};

    switch (rule.condition) {
      case 'line_movement':
        triggered = checkLineMovement(beforeData, afterData, rule.thresholdValue || 10);
        break;
      case 'price_threshold':
        triggered = checkPriceThreshold(afterData, rule.thresholdValue);
        break;
    }

    if (triggered) {
      await sendAlertNotification(userId, rule, eventId, details);
      await ruleDoc.ref.update({ lastTriggered: admin.firestore.Timestamp.now() });
    }
  }
}

function checkLineMovement(before, after, threshold) {
  // Compare odds changes
  return false; // Implementation needed
}

function checkPriceThreshold(data, threshold) {
  // Check if odds meet threshold
  return false; // Implementation needed
}

async function sendAlertNotification(userId, rule, eventId, details) {
  // Use existing notification system
  logger.info(`Alert triggered for user ${userId}, rule: ${rule.name}`);
}

module.exports = { evaluateAlertRules };

// ========================================
// functions/lib/alert-history.js
// ========================================
async function createHistoryEntry(userId, ruleId, ruleName, alertType, details) {
  const db = admin.firestore();
  await db.collection('users').doc(userId).collection('alertHistory').add({
    userId,
    ruleId,
    ruleName,
    alertType,
    message: details.message || 'Alert triggered',
    details,
    read: false,
    notificationSent: true,
    createdAt: admin.firestore.Timestamp.now(),
  });
}

module.exports = { createHistoryEntry };

// ========================================
// functions/lib/game-reminders.js
// ========================================
async function sendGameStartReminders() {
  const db = admin.firestore();
  const now = new Date();
  const reminderStart = new Date(now.getTime() + 45 * 60000);
  const reminderEnd = new Date(now.getTime() + 60 * 60000);

  const eventsSnapshot = await db.collection('events')
    .where('startTime', '>=', admin.firestore.Timestamp.fromDate(reminderStart))
    .where('startTime', '<=', admin.firestore.Timestamp.fromDate(reminderEnd))
    .get();

  for (const eventDoc of eventsSnapshot.docs) {
    const eventData = eventDoc.data();
    // Find users watching this event
    const usersSnapshot = await db.collection('users')
      .where('watchlist.games', 'array-contains-any', [{ id: eventDoc.id }])
      .get();

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      if (userData.notificationPreferences?.gameStarts && userData.fcmToken) {
        await admin.messaging().send({
          token: userData.fcmToken,
          notification: {
            title: 'Game Starting Soon! 🏀',
            body: `${eventData.teams?.home} vs ${eventData.teams?.away} starts in 1 hour`,
          },
          data: { eventId: eventDoc.id, type: 'game_start' },
        });
      }
    }
  }
}

module.exports = { sendGameStartReminders };

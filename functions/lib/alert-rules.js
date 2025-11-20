/**
 * functions/lib/alert-rules.js
 *
 * Alert rule evaluation logic
 * Evaluates custom alert rules against event changes
 */
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

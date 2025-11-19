/**
 * functions/lib/alert-history.js
 *
 * Alert history tracking helpers
 * Logs all alert notifications for user reference
 */

const admin = require('firebase-admin');
const logger = require('firebase-functions/logger');

/**
 * Create an alert history entry
 * @param {string} userId - The user ID
 * @param {string} ruleId - The rule ID
 * @param {string} ruleName - The rule name
 * @param {string} alertType - The alert type
 * @param {Object} details - The alert details
 * @return {Promise<void>}
 */
async function createHistoryEntry(userId, ruleId, ruleName, alertType, details) {
  const db = admin.firestore();

  try {
    const historyRef = db
      .collection('users')
      .doc(userId)
      .collection('alertHistory');

    await historyRef.add({
      userId,
      ruleId: ruleId || null,
      ruleName,
      alertType,
      eventId: details.eventId || null,
      league: details.league || null,
      teams: details.teams || null,
      message: details.message || 'Alert triggered',
      details: {
        oldValue: details.oldValue,
        newValue: details.newValue,
        threshold: details.threshold,
        arbMargin: details.arbMargin,
        market: details.market,
        side: details.side,
        changePercent: details.changePercent,
      },
      read: false,
      notificationSent: true,
      createdAt: admin.firestore.Timestamp.now(),
    });

    logger.info(`Alert history entry created for user ${userId}`);
  } catch (error) {
    logger.error(`Failed to create alert history entry for user ${userId}:`, error);
  }
}

/**
 * Mark alert history entry as read
 * @param {string} userId - The user ID
 * @param {string} historyId - The history ID
 * @return {Promise<void>}
 */
async function markHistoryAsRead(userId, historyId) {
  const db = admin.firestore();

  try {
    const historyRef = db
      .collection('users')
      .doc(userId)
      .collection('alertHistory')
      .doc(historyId);

    await historyRef.update({
      read: true,
    });
  } catch (error) {
    logger.error(`Failed to mark history as read for user ${userId}:`, error);
  }
}

/**
 * Clean up old alert history entries
 * @param {string} userId - The user ID
 * @param {number} daysToKeep - The number of days to keep history
 * @return {Promise<void>}
 * Keeps last 90 days of history
 */
async function cleanupOldHistory(userId, daysToKeep = 90) {
  const db = admin.firestore();

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const oldEntriesSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('alertHistory')
      .where('createdAt', '<', admin.firestore.Timestamp.fromDate(cutoffDate))
      .get();

    if (oldEntriesSnapshot.empty) {
      return;
    }

    const batch = db.batch();
    oldEntriesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    logger.info(`Cleaned up ${oldEntriesSnapshot.size} old alert history entries for ${userId}`);
  } catch (error) {
    logger.error(`Failed to cleanup old history for ${userId}:`, error);
  }
}

/**
 * Get unread alert count for a user
 * @param {string} userId - The user ID
 * @return {Promise<number>} The number of unread alerts
 */
async function getUnreadCount(userId) {
  const db = admin.firestore();

  try {
    const unreadSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('alertHistory')
      .where('read', '==', false)
      .get();

    return unreadSnapshot.size;
  } catch (error) {
    logger.error(`Failed to get unread count for ${userId}:`, error);
    return 0;
  }
}

module.exports = {
  createHistoryEntry,
  markHistoryAsRead,
  cleanupOldHistory,
  getUnreadCount,
};

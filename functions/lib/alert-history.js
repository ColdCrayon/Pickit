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
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId provided to createHistoryEntry');
  }

  const db = admin.firestore();
  const detailsObj = details || {};

  try {
    const historyRef = db
      .collection('users')
      .doc(userId)
      .collection('alertHistory');

    const docRef = await historyRef.add({
      userId,
      ruleId: ruleId || null,
      ruleName,
      alertType,
      eventId: detailsObj.eventId || null,
      league: detailsObj.league || null,
      teams: detailsObj.teams || null,
      message: detailsObj.message || 'Alert triggered',
      details: {
        oldValue: detailsObj.oldValue,
        newValue: detailsObj.newValue,
        threshold: detailsObj.threshold,
        arbMargin: detailsObj.arbMargin,
        market: detailsObj.market,
        side: detailsObj.side,
        changePercent: detailsObj.changePercent,
      },
      read: false,
      notificationSent: true,
      createdAt: admin.firestore.Timestamp.now(),
    });

    logger.info(`Alert history entry created for user ${userId}`);
    return docRef.id;
  } catch (error) {
    logger.error(`Failed to create alert history entry for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Mark alert history entry as read
 * @param {string} userId - The user ID
 * @param {string} historyId - The history ID
 * @return {Promise<void>}
 */
async function markHistoryAsRead(userId, historyId) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId provided to markHistoryAsRead');
  }
  if (!historyId || typeof historyId !== 'string') {
    throw new Error('Invalid historyId provided to markHistoryAsRead');
  }

  const db = admin.firestore();

  try {
    const historyRef = db
      .collection('users')
      .doc(userId)
      .collection('alertHistory')
      .doc(historyId);

    const doc = await historyRef.get();
    if (!doc.exists) {
      throw new Error(`History entry ${historyId} not found`);
    }

    await historyRef.update({
      read: true,
    });
    logger.info(`Marked history ${historyId} as read for user ${userId}`);
  } catch (error) {
    logger.error(`Failed to mark history as read for user ${userId}:`, error);
    throw error;
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
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId provided to cleanupOldHistory');
  }

  const db = admin.firestore();

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const oldEntriesSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('alertHistory')
      .where('createdAt', '<', admin.firestore.Timestamp.fromDate(cutoffDate))
      .limit(500) // Firestore batch limit
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

    // Recursively clean up if we hit the limit
    if (oldEntriesSnapshot.size === 500) {
      await cleanupOldHistory(userId, daysToKeep);
    }
  } catch (error) {
    logger.error(`Failed to cleanup old history for ${userId}:`, error);
    throw error;
  }
}

/**
 * Get unread alert count for a user
 * @param {string} userId - The user ID
 * @return {Promise<number>} The number of unread alerts
 */
async function getUnreadCount(userId) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId provided to getUnreadCount');
  }

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
    throw error;
  }
}

module.exports = {
  createHistoryEntry,
  markHistoryAsRead,
  cleanupOldHistory,
  getUnreadCount,
};

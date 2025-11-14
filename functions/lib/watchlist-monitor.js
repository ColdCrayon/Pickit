/**
 * functions/lib/watchlist-monitor.js
 *
 * Monitors watchlist items for odds changes and sends notifications
 */

const admin = require('firebase-admin');
const logger = require('firebase-functions/logger');
const { sendBatchNotifications } = require('./notifications');

/**
 * Check if odds have changed significantly
 * @param {number} oldOdds - Previous odds value
 * @param {number} newOdds - New odds value
 * @param {number} threshold - Percentage threshold (default 5%)
 * @return {boolean} True if change exceeds threshold
 */
function hasSignificantOddsChange(oldOdds, newOdds, threshold = 5) {
  if (!oldOdds || !newOdds) return false;

  const changePercent = Math.abs(
    ((newOdds - oldOdds) / Math.abs(oldOdds)) * 100
  );
  return changePercent >= threshold;
}

/**
 * Format odds change for notification
 * @param {number} oldOdds - Previous odds
 * @param {number} newOdds - New odds
 * @return {string} Formatted odds change string
 */
function formatOddsChange(oldOdds, newOdds) {
  const direction = newOdds > oldOdds ? '↑' : '↓';
  return `${oldOdds > 0 ? '+' : ''}${oldOdds} ${direction} ${
    newOdds > 0 ? '+' : ''
  }${newOdds}`;
}

/**
 * Find all users watching a specific event
 * @param {string} eventId - Event ID to search for
 * @return {Promise<string[]>} Array of user IDs
 */
async function getUsersWatchingEvent(eventId) {
  const db = admin.firestore();

  // Query users who have this game in their watchlist
  const usersSnapshot = await db
    .collection('users')
    .where('watchlist.games', 'array-contains-any', [{ id: eventId }])
    .get();

  const userIds = [];
  usersSnapshot.forEach((doc) => {
    const data = doc.data();

    // Check if notifications are enabled
    if (data.watchlistSettings?.enableNotifications !== false) {
      userIds.push(doc.id);
    }
  });

  return userIds;
}

/**
 * Check if enough time has passed since last notification
 * @param {FirebaseFirestore.Timestamp} lastNotified - Last notification time
 * @param {number} minIntervalMinutes - Minimum interval in minutes
 * @return {boolean} True if enough time has passed
 */
function canSendNotification(lastNotified, minIntervalMinutes = 60) {
  if (!lastNotified) return true;

  const now = Date.now();
  const lastNotifiedTime = lastNotified.toMillis();
  const minutesSince = (now - lastNotifiedTime) / (1000 * 60);

  return minutesSince >= minIntervalMinutes;
}

/**
 * Monitor odds changes for watchlist items
 * @param {object} beforeData - Event data before update
 * @param {object} afterData - Event data after update
 * @param {string} eventId - Event ID
 * @return {Promise<void>}
 */
async function monitorWatchlistOddsChanges(beforeData, afterData, eventId) {
  try {
    logger.info(`Checking odds changes for event: ${eventId}`);

    // Get markets from before/after
    const beforeMarkets = beforeData.markets || {};
    const afterMarkets = afterData.markets || {};

    // Track significant changes
    const changes = [];

    // Check each market type
    for (const marketKey of Object.keys(afterMarkets)) {
      const beforeMarket = beforeMarkets[marketKey];
      const afterMarket = afterMarkets[marketKey];

      if (!beforeMarket || !afterMarket) continue;

      // Check spread changes
      if (beforeMarket.spread && afterMarket.spread) {
        const beforeSpread = beforeMarket.spread;
        const afterSpread = afterMarket.spread;

        // Check home spread odds
        if (hasSignificantOddsChange(beforeSpread.home, afterSpread.home, 10)) {
          changes.push({
            market: 'spread',
            team: 'home',
            oldOdds: beforeSpread.home,
            newOdds: afterSpread.home,
          });
        }

        // Check away spread odds
        if (hasSignificantOddsChange(beforeSpread.away, afterSpread.away, 10)) {
          changes.push({
            market: 'spread',
            team: 'away',
            oldOdds: beforeSpread.away,
            newOdds: afterSpread.away,
          });
        }
      }

      // Check moneyline changes
      if (beforeMarket.moneyline && afterMarket.moneyline) {
        const beforeML = beforeMarket.moneyline;
        const afterML = afterMarket.moneyline;

        if (hasSignificantOddsChange(beforeML.home, afterML.home, 10)) {
          changes.push({
            market: 'moneyline',
            team: 'home',
            oldOdds: beforeML.home,
            newOdds: afterML.home,
          });
        }

        if (hasSignificantOddsChange(beforeML.away, afterML.away, 10)) {
          changes.push({
            market: 'moneyline',
            team: 'away',
            oldOdds: beforeML.away,
            newOdds: afterML.away,
          });
        }
      }

      // Check totals changes
      if (beforeMarket.totals && afterMarket.totals) {
        const beforeTotals = beforeMarket.totals;
        const afterTotals = afterMarket.totals;

        if (hasSignificantOddsChange(beforeTotals.over, afterTotals.over, 10)) {
          changes.push({
            market: 'totals',
            bet: 'over',
            oldOdds: beforeTotals.over,
            newOdds: afterTotals.over,
          });
        }

        if (
          hasSignificantOddsChange(beforeTotals.under, afterTotals.under, 10)
        ) {
          changes.push({
            market: 'totals',
            bet: 'under',
            oldOdds: beforeTotals.under,
            newOdds: afterTotals.under,
          });
        }
      }
    }

    // If no significant changes, exit
    if (changes.length === 0) {
      logger.info(`No significant odds changes for event: ${eventId}`);
      return;
    }

    logger.info(
      `Found ${changes.length} significant odds changes for ` +
        `event: ${eventId}`
    );

    // Find users watching this event
    const userIds = await getUsersWatchingEvent(eventId);

    if (userIds.length === 0) {
      logger.info(`No users watching event: ${eventId}`);
      return;
    }

    // Get event details for notification
    const teams = afterData.teams || {};
    const matchup = `${teams.away} @ ${teams.home}`;

    // Check rate limiting for each user
    const db = admin.firestore();
    const eligibleUsers = [];

    for (const userId of userIds) {
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();

      const lastNotifications = userData?.lastNotifications || {};
      const lastNotified = lastNotifications[eventId];

      if (canSendNotification(lastNotified, 60)) {
        eligibleUsers.push(userId);
      } else {
        logger.info(`Skipping notification for user ${userId} (rate limited)`);
      }
    }

    if (eligibleUsers.length === 0) {
      logger.info(`All users rate limited for event: ${eventId}`);
      return;
    }

    // Send notifications to eligible users
    const title = 'Odds Alert! 📊';
    const body = `${matchup} odds moved: ${formatOddsChange(
      changes[0].oldOdds,
      changes[0].newOdds
    )}`;
    const data = {
      type: 'odds_change',
      eventId,
      link: '/watchlist',
    };

    const result = await sendBatchNotifications(
      eligibleUsers,
      title,
      body,
      data
    );

    logger.info(
      `Sent ${result.success}/${eligibleUsers.length} notifications ` +
        `for event: ${eventId}`
    );

    // Update lastNotifications timestamp for each user
    const batch = db.batch();
    const now = admin.firestore.Timestamp.now();

    for (const userId of eligibleUsers) {
      const userRef = db.collection('users').doc(userId);
      batch.update(userRef, {
        [`lastNotifications.${eventId}`]: now,
      });
    }

    await batch.commit();
  } catch (error) {
    logger.error('Error monitoring watchlist odds changes:', error);
  }
}

/**
 * Send game start notifications
 * Checks for games starting in the next hour and notifies users
 * @return {Promise<void>}
 */
async function sendGameStartNotifications() {
  try {
    logger.info('Checking for games starting soon...');

    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    const oneHourFromNow = admin.firestore.Timestamp.fromMillis(
      now.toMillis() + 60 * 60 * 1000
    );

    // Find events starting in the next hour
    const eventsSnapshot = await db
      .collection('events')
      .where('startTime', '>', now)
      .where('startTime', '<=', oneHourFromNow)
      .get();

    if (eventsSnapshot.empty) {
      logger.info('No games starting in the next hour');
      return;
    }

    logger.info(`Found ${eventsSnapshot.size} games starting in the next hour`);

    // For each event, find users watching it and send notifications
    for (const eventDoc of eventsSnapshot.docs) {
      const eventId = eventDoc.id;
      const eventData = eventDoc.data();
      const teams = eventData.teams || {};
      const matchup = `${teams.away} @ ${teams.home}`;
      const startTime = eventData.startTime;

      // Find users watching this game
      const userIds = await getUsersWatchingEvent(eventId);

      if (userIds.length === 0) continue;

      // Check if we already sent this notification
      const eligibleUsers = [];

      for (const userId of userIds) {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        const lastNotifications = userData?.lastNotifications || {};
        const lastNotified = lastNotifications[`game_start_${eventId}`];

        // Only send once per game
        if (!lastNotified) {
          eligibleUsers.push(userId);
        }
      }

      if (eligibleUsers.length === 0) continue;

      // Calculate minutes until game starts
      const minutesUntil = Math.round(
        (startTime.toMillis() - now.toMillis()) / (1000 * 60)
      );

      // Send notifications
      const title = 'Game Starting Soon! ⏰';
      const body = `${matchup} starts in ${minutesUntil} minutes`;
      const data = {
        type: 'game_start',
        eventId,
        link: '/browse-events',
      };

      const result = await sendBatchNotifications(
        eligibleUsers,
        title,
        body,
        data
      );

      logger.info(
        `Sent ${result.success}/${eligibleUsers.length} game start ` +
          `notifications for: ${matchup}`
      );

      // Update notification sent flag
      const batch = db.batch();
      const notifTime = admin.firestore.Timestamp.now();

      for (const userId of eligibleUsers) {
        const userRef = db.collection('users').doc(userId);
        batch.update(userRef, {
          [`lastNotifications.game_start_${eventId}`]: notifTime,
        });
      }

      await batch.commit();
    }
  } catch (error) {
    logger.error('Error sending game start notifications:', error);
  }
}

module.exports = {
  monitorWatchlistOddsChanges,
  sendGameStartNotifications,
  hasSignificantOddsChange,
  formatOddsChange,
};

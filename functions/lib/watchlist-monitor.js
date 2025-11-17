/**
 * functions/lib/watchlist-monitor.js
 *
 * FIXED VERSION - Handles both priceAmerican and priceDecimal
 */

const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

/**
 * Extract odds value from market data
 * Handles both priceAmerican and priceDecimal formats
 * @param {Object|number} marketData - Market data object or number
 * @return {number|null} Extracted odds value in American format
 */
function extractOddsValue(marketData) {
  if (!marketData) return null;

  // Handle object format: { priceAmerican: -110 } or { priceDecimal: 1.91 }
  if (typeof marketData === "object") {
    if (marketData.priceAmerican != null) {
      return marketData.priceAmerican;
    }
    if (marketData.priceDecimal != null) {
      // Convert decimal to american for consistency in comparison
      return decimalToAmerican(marketData.priceDecimal);
    }
  }

  // Handle direct number format: -110
  if (typeof marketData === "number") {
    return marketData;
  }

  return null;
}

/**
 * Convert decimal odds to American odds
 * @param {number} decimal - Decimal odds (e.g., 1.91, 2.50)
 * @return {number} American odds (e.g., -110, +150)
 */
function decimalToAmerican(decimal) {
  if (decimal >= 2.0) {
    return Math.round((decimal - 1) * 100);
  } else {
    return Math.round(-100 / (decimal - 1));
  }
}

/**
 * Check if odds change is significant enough to notify
 * @param {number} oldOdds - Previous odds value
 * @param {number} newOdds - New odds value
 * @param {number} thresholdPercent - Threshold percentage (e.g., 10 for 10%)
 * @return {boolean} True if change exceeds threshold
 */
function hasSignificantOddsChange(oldOdds, newOdds, thresholdPercent = 10) {
  if (!oldOdds || !newOdds) return false;
  if (oldOdds === newOdds) return false;

  const changePercent = Math.abs(
    ((newOdds - oldOdds) / Math.abs(oldOdds)) * 100
  );

  return changePercent >= thresholdPercent;
}

/**
 * Format odds change for display
 * @param {number} oldOdds - Previous odds
 * @param {number} newOdds - New odds
 * @return {string} Formatted string like "-110 ↑ -150"
 */
function formatOddsChange(oldOdds, newOdds) {
  const oldStr = oldOdds > 0 ? `+${oldOdds}` : `${oldOdds}`;
  const newStr = newOdds > 0 ? `+${newOdds}` : `${newOdds}`;
  const direction = newOdds > oldOdds ? "↑" : "↓";

  return `${oldStr} ${direction} ${newStr}`;
}

/**
 * Notify users watching an event when odds change significantly
 *
 * @param {string} eventId - The ID of the event that was updated
 * @param {Object} beforeData - The event data before the update
 * @param {Object} afterData - The event data after the update
 * @return {Promise<void>}
 */
async function notifyWatchingUsers(eventId, beforeData, afterData) {
  const db = admin.firestore();
  const changes = [];

  logger.info(`Checking odds changes for event: ${eventId}`);

  // Detect ALL odds changes across sportsbooks
  for (const [sportsbook, beforeMarkets] of Object.entries(
    beforeData.markets || {}
  )) {
    const afterMarkets = afterData.markets?.[sportsbook];
    if (!afterMarkets) continue;

    // Check spread
    const beforeSpread = beforeMarkets.spread || {};
    const afterSpread = afterMarkets.spread || {};

    const beforeSpreadHome = extractOddsValue(beforeSpread.home);
    const afterSpreadHome = extractOddsValue(afterSpread.home);
    const beforeSpreadAway = extractOddsValue(beforeSpread.away);
    const afterSpreadAway = extractOddsValue(afterSpread.away);

    if (
      beforeSpreadHome !== afterSpreadHome &&
      beforeSpreadHome &&
      afterSpreadHome
    ) {
      changes.push({
        market: "spread",
        side: "home",
        before: beforeSpreadHome,
        after: afterSpreadHome,
        sportsbook,
      });
    }
    if (
      beforeSpreadAway !== afterSpreadAway &&
      beforeSpreadAway &&
      afterSpreadAway
    ) {
      changes.push({
        market: "spread",
        side: "away",
        before: beforeSpreadAway,
        after: afterSpreadAway,
        sportsbook,
      });
    }

    // Check moneyline
    const beforeML = beforeMarkets.moneyline || {};
    const afterML = afterMarkets.moneyline || {};

    const beforeMLHome = extractOddsValue(beforeML.home);
    const afterMLHome = extractOddsValue(afterML.home);
    const beforeMLAway = extractOddsValue(beforeML.away);
    const afterMLAway = extractOddsValue(afterML.away);

    if (beforeMLHome !== afterMLHome && beforeMLHome && afterMLHome) {
      changes.push({
        market: "moneyline",
        side: "home",
        before: beforeMLHome,
        after: afterMLHome,
        sportsbook,
      });
    }
    if (beforeMLAway !== afterMLAway && beforeMLAway && afterMLAway) {
      changes.push({
        market: "moneyline",
        side: "away",
        before: beforeMLAway,
        after: afterMLAway,
        sportsbook,
      });
    }

    // Check totals
    const beforeTotals = beforeMarkets.totals || {};
    const afterTotals = afterMarkets.totals || {};

    const beforeOver = extractOddsValue(beforeTotals.over);
    const afterOver = extractOddsValue(afterTotals.over);
    const beforeUnder = extractOddsValue(beforeTotals.under);
    const afterUnder = extractOddsValue(afterTotals.under);

    if (beforeOver !== afterOver && beforeOver && afterOver) {
      changes.push({
        market: "totals",
        side: "over",
        before: beforeOver,
        after: afterOver,
        sportsbook,
      });
    }
    if (beforeUnder !== afterUnder && beforeUnder && afterUnder) {
      changes.push({
        market: "totals",
        side: "under",
        before: beforeUnder,
        after: afterUnder,
        sportsbook,
      });
    }
  }

  if (changes.length === 0) {
    logger.info(`No odds changes detected for event: ${eventId}`);
    return;
  }

  logger.info(
    `Detected ${changes.length} total odds changes for event: ${eventId}`
  );

  // Find users watching this event
  const usersSnapshot = await db.collection("users").get();
  const watchingUsers = [];

  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    const games = userData.watchlist?.games || [];

    const isWatching = games.some((game) => game.id === eventId);

    if (isWatching && userData.fcmToken && userData.notificationsEnabled) {
      const userThreshold = userData.watchlistSettings?.alertThreshold || 10;

      // Filter changes by user's personal threshold
      const significantChanges = changes.filter((change) => {
        return hasSignificantOddsChange(
          change.before,
          change.after,
          userThreshold
        );
      });

      if (significantChanges.length > 0) {
        watchingUsers.push({
          userId: userDoc.id,
          fcmToken: userData.fcmToken,
          changes: significantChanges,
          threshold: userThreshold,
        });

        logger.info(
          `User ${userDoc.id} has ${significantChanges.length} changes above ${userThreshold}% threshold`
        );
      } else {
        logger.info(
          `User ${userDoc.id} watching but no changes meet their ${userThreshold}% threshold`
        );
      }
    }
  }

  if (watchingUsers.length === 0) {
    logger.info(`No users with significant changes for event: ${eventId}`);
    return;
  }

  logger.info(
    `Sending notifications to ${watchingUsers.length} users for event: ${eventId}`
  );

  // Send notifications with rate limiting
  let sentCount = 0;

  for (const user of watchingUsers) {
    try {
      // Check rate limit (1 notification per hour per event)
      const userDoc = await db.collection("users").doc(user.userId).get();
      const userData = userDoc.data();
      const lastNotified = userData.lastNotifications?.[eventId];

      if (lastNotified) {
        const minutesSince =
          (Date.now() - lastNotified.toMillis()) / (1000 * 60);
        if (minutesSince < 60) {
          logger.info(
            `Skipping notification for user ${
              user.userId
            } (rate limited - ${minutesSince.toFixed(1)} min ago)`
          );
          continue;
        }
      }

      // Format notification message
      const changeDescriptions = user.changes
        .slice(0, 2)
        .map(
          (c) => `${c.market} ${c.side}: ${formatOddsChange(c.before, c.after)}`
        )
        .join(", ");

      const moreChanges =
        user.changes.length > 2 ? ` +${user.changes.length - 2} more` : "";

      // Send FCM notification
      await admin.messaging().send({
        token: user.fcmToken,
        notification: {
          title: `Odds Alert: ${afterData.teams?.home} vs ${afterData.teams?.away}`,
          body: `${changeDescriptions}${moreChanges}`,
        },
        data: {
          eventId,
          type: "odds_change",
          changesCount: user.changes.length.toString(),
        },
      });

      // Update last notification time
      await db
        .collection("users")
        .doc(user.userId)
        .update({
          [`lastNotifications.${eventId}`]: admin.firestore.Timestamp.now(),
        });

      sentCount++;
      logger.info(
        `✅ Sent notification to user ${user.userId} (threshold: ${user.threshold}%)`
      );
    } catch (error) {
      logger.error(
        `Failed to send notification to user ${user.userId}:`,
        error
      );
    }
  }

  logger.info(
    `Sent ${sentCount}/${watchingUsers.length} notifications for event: ${eventId}`
  );
}

module.exports = {
  hasSignificantOddsChange,
  formatOddsChange,
  notifyWatchingUsers,
  extractOddsValue,
  decimalToAmerican,
};

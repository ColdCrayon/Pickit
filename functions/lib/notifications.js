/**
 * functions/lib/notifications.js
 *
 * Firebase Cloud Messaging (FCM) notification helpers
 * Handles sending push notifications to users
 */

const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

/**
 * Send a notification to a single user
 * @param {string} userId - User document ID
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data payload
 * @return {Promise<boolean>} Success status
 */
async function sendNotificationToUser(userId, title, body, data = {}) {
  try {
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      logger.warn(`User ${userId} not found`);
      return false;
    }

    const userData = userDoc.data();
    const fcmToken = userData?.fcmToken;
    const notificationsEnabled = userData?.notificationsEnabled !== false;

    if (!fcmToken) {
      logger.info(`User ${userId} has no FCM token`);
      return false;
    }

    if (!notificationsEnabled) {
      logger.info(`User ${userId} has notifications disabled`);
      return false;
    }

    const message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        timestamp: Date.now().toString(),
      },
      webpush: {
        fcmOptions: {
          link: data.link || "https://yourdomain.com",
        },
      },
    };

    await admin.messaging().send(message);
    logger.info(`Notification sent to user ${userId}`);
    return true;
  } catch (error) {
    // Handle invalid token errors
    if (
      error.code === "messaging/invalid-registration-token" ||
      error.code === "messaging/registration-token-not-registered"
    ) {
      logger.warn(`Invalid FCM token for user ${userId}, removing...`);
      await admin
        .firestore()
        .collection("users")
        .doc(userId)
        .update({ fcmToken: null });
    } else {
      logger.error(`Failed to send notification to ${userId}:`, error);
    }
    return false;
  }
}

/**
 * Send notifications to multiple users
 * @param {string[]} userIds - Array of user IDs
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data payload
 * @return {Promise<{success: number, failed: number}>}
 */
async function sendBatchNotifications(userIds, title, body, data = {}) {
  const results = await Promise.allSettled(
    userIds.map((userId) => sendNotificationToUser(userId, title, body, data))
  );

  const success = results.filter(
    (r) => r.status === "fulfilled" && r.value
  ).length;
  const failed = results.length - success;

  logger.info(`Batch notifications: ${success} sent, ${failed} failed`);
  return { success, failed };
}

/**
 * Get all users who saved a specific ticket
 * @param {string} ticketId - Ticket document ID
 * @param {"arb" | "game"} ticketType - Type of ticket
 * @return {Promise<string[]>} Array of user IDs
 */
async function getUsersWithSavedTicket(ticketId, ticketType) {
  const snapshot = await admin
    .firestore()
    .collectionGroup("tickets")
    .where("ticketId", "==", ticketId)
    .where("ticketType", "==", ticketType)
    .get();

  return snapshot.docs.map((doc) => {
    // Extract userId from document path: users/{userId}/tickets/{ticketId}
    const pathParts = doc.ref.path.split("/");
    return pathParts[1]; // users/{userId}/tickets/{ticketId}
  });
}

module.exports = {
  sendNotificationToUser,
  sendBatchNotifications,
  getUsersWithSavedTicket,
};

/**
 * functions/index.js
 *
 * UPDATED for Week 1: User Tickets Notification System
 *
 * NEW FUNCTIONS ADDED:
 * - onArbTicketCreate: Notify users when new arb ticket created
 * - onGameTicketSettle: Notify users when their saved game ticket settles
 * - updateFcmToken: Callable function to update user's FCM token
 */

const { setGlobalOptions } = require('firebase-functions/v2/options');
const { onCall } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const {
  onDocumentCreated,
  onDocumentUpdated,
} = require('firebase-functions/v2/firestore');
const logger = require('firebase-functions/logger');
const {
  createCheckoutSession,
  createPortalSession,
  stripeWebhook,
  cancelSubscription,
} = require('./lib/stripe');

const admin = require('firebase-admin');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

const {
  sendBatchNotifications,
  getUsersWithSavedTicket,
  // sendNotificationToUser,
} = require('./lib/notifications');

setGlobalOptions({ maxInstances: 10 });

if (!admin.apps.length) {
  admin.initializeApp();
}

// ============================================================================
// EXISTING FUNCTIONS (unchanged)
// ============================================================================

/**
 * Callable: set custom claims (admins only).
 */
exports.setUserRoles = onCall({ cors: true }, async (request) => {
  const caller = request.auth;
  if (!caller || caller.token.isAdmin !== true) {
    throw new Error('PERMISSION_DENIED: Admins only.');
  }

  const { uid, isAdmin = false, isPremium = false } = request.data || {};
  if (!uid || typeof uid !== 'string') {
    throw new Error('INVALID_ARGUMENT: \'uid\' is required.');
  }

  await admin.auth().setCustomUserClaims(uid, {
    isAdmin: !!isAdmin,
    isPremium: !!isPremium,
  });

  await getFirestore()
    .collection('users')
    .doc(uid)
    .set({ isAdmin: !!isAdmin, isPremium: !!isPremium }, { merge: true });

  try {
    await admin.auth().revokeRefreshTokens(uid);
  } catch (e) {
    logger.warn(
      'Revoke refresh tokens failed; user may need manual refresh.',
      e
    );
  }

  logger.info(`Updated claims for ${uid}`, { isAdmin, isPremium });
  return { ok: true, uid, isAdmin: !!isAdmin, isPremium: !!isPremium };
});

/**
 * Scheduled job: mark tickets as settled when settleDate <= now
 */
exports.settleTickets = onSchedule(
  { schedule: 'every 5 minutes', timeZone: 'America/Chicago' },
  async () => {
    const db = getFirestore();
    const now = Timestamp.now();

    const batch = db.batch();

    // ---- Game Tickets ----
    const gameSnapshot = await db
      .collection('gameTickets')
      .where('settleDate', '<=', now)
      .where('serverSettled', '==', false)
      .get();

    gameSnapshot.forEach((doc) => {
      batch.update(doc.ref, { serverSettled: true });
    });

    // ---- Arbitrage Tickets ----
    const arbSnapshot = await db
      .collection('arbTickets')
      .where('settleDate', '<=', now)
      .where('serverSettled', '==', false)
      .get();

    arbSnapshot.forEach((doc) => {
      batch.update(doc.ref, { serverSettled: true });
    });

    if (!gameSnapshot.empty || !arbSnapshot.empty) {
      await batch.commit();
    }

    logger.info(
      `Settled ${gameSnapshot.size} gameTs and ${arbSnapshot.size} arbTs`
    );
    return null;
  }
);

// ============================================================================
// NEW FUNCTIONS FOR WEEK 1: USER TICKETS NOTIFICATION SYSTEM
// ============================================================================

/**
 * NEW: Triggered when a new arbitrage ticket is created
 * Notifies all users who have this event saved
 */
exports.onArbTicketCreate = onDocumentCreated(
  { document: 'arbTickets/{ticketId}' },
  async (event) => {
    const ticketId = event.params.ticketId;
    const ticketData = event.data.data();

    logger.info(`New arb ticket created: ${ticketId}`);

    try {
      // Find all users who saved this ticket
      const userIds = await getUsersWithSavedTicket(ticketId, 'arb');

      if (userIds.length === 0) {
        logger.info(`No users have saved arb ticket ${ticketId}`);
        return null;
      }

      // Construct notification
      const marginValue = ticketData.margin;
      const rawMargin = Number(marginValue);
      const marginBody =
        marginValue !== undefined &&
        marginValue !== null &&
        Number.isFinite(rawMargin)?
          `${(rawMargin * 100).toFixed(2)}% edge found! Check your saved tickets.`:
          'New arbitrage opportunity! Check your saved tickets.';
      const title = 'New Arbitrage Opportunity';
      const body = marginBody;
      const data = {
        type: 'arb_ticket_created',
        ticketId,
        ticketType: 'arb',
        link: `/arbitrage/${ticketId}`,
      };

      // Send notifications
      const result = await sendBatchNotifications(userIds, title, body, data);
      logger.info(
        `Arb ticket ${ticketId}: Notified ${result.success}/${userIds.length} users`
      );

      return null;
    } catch (error) {
      logger.error(`Error processing arb ticket ${ticketId}:`, error);
      return null;
    }
  }
);

/**
 * NEW: Triggered when a game ticket is updated (specifically when it settles)
 * Notifies users who saved the ticket
 */
exports.onGameTicketSettle = onDocumentUpdated(
  { document: 'gameTickets/{ticketId}' },
  async (event) => {
    const ticketId = event.params.ticketId;
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();

    // Only proceed if ticket just settled
    const wasUnsettled = beforeData.serverSettled === false;
    const nowSettled = afterData.serverSettled === true;

    if (!wasUnsettled || !nowSettled) {
      return null; // Not a settlement event
    }

    logger.info(`Game ticket ${ticketId} settled`);

    try {
      // Find all users who saved this ticket
      const userIds = await getUsersWithSavedTicket(ticketId, 'game');

      if (userIds.length === 0) {
        logger.info(`No users have saved game ticket ${ticketId}`);
        return null;
      }

      // Construct notification
      const title = '✅ Pick Settled';
      const body = `Your saved pick has been settled. Check the result!`;
      const data = {
        type: 'game_ticket_settled',
        ticketId,
        ticketType: 'game',
        link: `/picks/${ticketId}`,
      };

      // Send notifications
      const result = await sendBatchNotifications(userIds, title, body, data);
      logger.info(
        `Game ticket ${ticketId}: Notified ${result.success}/${userIds.length} users`
      );

      return null;
    } catch (error) {
      logger.error(
        `Error processing game ticket settlement ${ticketId}:`,
        error
      );
      return null;
    }
  }
);

/**
 * NEW: Callable function to update user's FCM token
 * Called from client when user grants notification permission
 */
exports.updateFcmToken = onCall({ cors: true }, async (request) => {
  const caller = request.auth;
  if (!caller) {
    throw new Error('PERMISSION_DENIED: Must be authenticated');
  }

  const { fcmToken } = request.data || {};
  if (!fcmToken || typeof fcmToken !== 'string') {
    throw new Error('INVALID_ARGUMENT: \'fcmToken\' is required');
  }

  const userId = caller.uid;

  try {
    await getFirestore().collection('users').doc(userId).set(
      {
        fcmToken,
        notificationsEnabled: true,
        fcmTokenUpdatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    logger.info(`FCM token updated for user ${userId}`);
    return { ok: true, message: 'FCM token updated successfully' };
  } catch (error) {
    logger.error(`Failed to update FCM token for ${userId}:`, error);
    throw new Error('Failed to update FCM token');
  }
});

/**
 * NEW: Callable function to disable notifications
 */
exports.disableNotifications = onCall({ cors: true }, async (request) => {
  const caller = request.auth;
  if (!caller) {
    throw new Error('PERMISSION_DENIED: Must be authenticated');
  }

  const userId = caller.uid;

  try {
    await getFirestore().collection('users').doc(userId).update({
      notificationsEnabled: false,
      fcmToken: null,
    });

    logger.info(`Notifications disabled for user ${userId}`);
    return { ok: true, message: 'Notifications disabled' };
  } catch (error) {
    logger.error(`Failed to disable notifications for ${userId}:`, error);
    throw new Error('Failed to disable notifications');
  }
});

/**
 * Stripe-related callable and HTTP functions exported from `lib/stripe`.
 */
exports.createCheckoutSession = createCheckoutSession;
exports.createPortalSession = createPortalSession;
exports.stripeWebhook = stripeWebhook;
exports.cancelSubscription = cancelSubscription;

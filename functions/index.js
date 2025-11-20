/**
 * functions/index.js
 *
 * UPDATED WITH WATCHLIST NOTIFICATIONS - FIXED VERSION
 */

const { setGlobalOptions } = require('firebase-functions/v2/options');
const { onCall } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const {
  onDocumentCreated,
  onDocumentUpdated,
} = require('firebase-functions/v2/firestore');
const logger = require('firebase-functions/logger');

const admin = require('firebase-admin');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

const {
  sendBatchNotifications,
  getUsersWithSavedTicket,
} = require('./lib/notifications');

// FIXED: Import the correct function name
const { notifyWatchingUsers } = require('./lib/watchlist-monitor');

// Import Stripe functions
const {
  createCheckoutSession,
  createPortalSession,
  stripeWebhook,
  cancelSubscription,
} = require('./lib/stripe');

const { evaluateAlertRules } = require('./lib/alert-rules');
const { sendGameStartReminders } = require('./lib/game-reminders');

setGlobalOptions({ maxInstances: 10 });

if (!admin.apps.length) {
  admin.initializeApp();
}

// ============================================================================
// USER ROLES & ADMIN FUNCTIONS
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

// ============================================================================
// TICKET SETTLEMENT
// ============================================================================

/**
 * Scheduled job: mark tickets as settled when settleDate <= now
 */
exports.settleTickets = onSchedule(
  { schedule: 'every 5 minutes', timeZone: 'America/Chicago' },
  async () => {
    const db = getFirestore();
    const now = Timestamp.now();

    const gameRefs = [];
    const arbRefs = [];

    // Game Tickets
    const gameSnapshot = await db
      .collection('gameTickets')
      .where('settleDate', '<=', now)
      .where('serverSettled', '==', false)
      .get();

    gameSnapshot.forEach((doc) => {
      gameRefs.push(doc.ref);
    });

    // Arbitrage Tickets
    const arbSnapshot = await db
      .collection('arbTickets')
      .where('settleDate', '<=', now)
      .where('serverSettled', '==', false)
      .get();

    arbSnapshot.forEach((doc) => {
      arbRefs.push(doc.ref);
    });

    const refsToSettle = [...gameRefs, ...arbRefs];

    for (let i = 0; i < refsToSettle.length; i += 500) {
      const batch = db.batch();
      const slice = refsToSettle.slice(i, i + 500);

      slice.forEach((ref) => {
        batch.update(ref, { serverSettled: true });
      });

      await batch.commit();
      logger.info(
        `Settled batch ${Math.floor(i / 500) + 1}: ${i + slice.length}/${
          refsToSettle.length
        } tickets`
      );
    }

    logger.info(
      `Settled ${gameSnapshot.size} gameTs and ${arbSnapshot.size} arbTs`
    );
    return null;
  }
);

// ============================================================================
// SAVED TICKET NOTIFICATIONS
// ============================================================================

/**
 * Triggered when a new arbitrage ticket is created
 * Notifies all users who have this event saved
 */
exports.onArbTicketCreate = onDocumentCreated(
  { document: 'arbTickets/{ticketId}' },
  async (event) => {
    const ticketId = event.params.ticketId;
    const ticketData = event.data.data();

    logger.info(`New arb ticket created: ${ticketId}`);

    try {
      const userIds = await getUsersWithSavedTicket(ticketId, 'arb');

      if (userIds.length === 0) {
        logger.info(`No users have saved arb ticket ${ticketId}`);
        return null;
      }

      const marginValue = ticketData.margin;
      const rawMargin = Number(marginValue);
      const marginBody =
        marginValue !== undefined &&
        marginValue !== null &&
        Number.isFinite(rawMargin) ?
          `${(rawMargin * 100).toFixed(2)}% edge found! ` +
            'Check your saved tickets.' :
          'New arbitrage opportunity! Check your saved tickets.';

      const title = 'New Arbitrage! 💰';
      const body = marginBody;
      const data = {
        type: 'arb_ticket_created',
        ticketId,
        ticketType: 'arb',
        link: `/picks/${ticketId}`,
      };

      const result = await sendBatchNotifications(userIds, title, body, data);
      logger.info(
        `Arb ticket ${ticketId}: Notified ` +
          `${result.success}/${userIds.length} users`
      );

      return null;
    } catch (error) {
      logger.error(`Error processing arb ticket creation ${ticketId}:`, error);
      return null;
    }
  }
);

/**
 * Triggered when a game ticket is marked as settled
 * Notifies users who saved this ticket
 */
exports.onGameTicketSettle = onDocumentUpdated(
  { document: 'gameTickets/{ticketId}' },
  async (event) => {
    const ticketId = event.params.ticketId;
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();

    // Only trigger if serverSettled changed from false to true
    if (beforeData.serverSettled === afterData.serverSettled) {
      return null;
    }

    if (afterData.serverSettled !== true) {
      return null;
    }

    logger.info(`Game ticket settled: ${ticketId}`);

    try {
      const userIds = await getUsersWithSavedTicket(ticketId, 'game');

      if (userIds.length === 0) {
        logger.info(`No users have saved game ticket ${ticketId}`);
        return null;
      }

      const title = 'Game Settled! 🎯';
      const body = 'Your saved game pick has settled. Check the result!';
      const data = {
        type: 'game_ticket_settled',
        ticketId,
        ticketType: 'game',
        link: `/picks/${ticketId}`,
      };

      const result = await sendBatchNotifications(userIds, title, body, data);
      logger.info(
        `Game ticket ${ticketId}: Notified ` +
          `${result.success}/${userIds.length} users`
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

// ============================================================================
// WATCHLIST NOTIFICATIONS
// ============================================================================

/**
 * Triggered when an event is updated
 * Monitors odds changes for users watching this event
 * Uses user's custom threshold from watchlistSettings.alertThreshold
 */
exports.onEventUpdate = onDocumentUpdated(
  { document: 'events/{eventId}' },
  async (event) => {
    const eventId = event.params.eventId;
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();

    logger.info(`Event updated: ${eventId}`);

    try {
      // FIXED: Correctly call notifyWatchingUsers
      await notifyWatchingUsers(eventId, beforeData, afterData);
      // NEW: Custom alert rules evaluation
      await evaluateAlertRules(eventId, beforeData, afterData);
      return null;
    } catch (error) {
      logger.error(`Error monitoring event ${eventId}:`, error);
      return null;
    }
  }
);

/**
 * Scheduled job to send game start notifications
 * Runs every 15 minutes to check for games starting in the next hour
 *
 * NOTE: This function is currently not implemented in watchlist-monitor.js
 * You can add it later if needed
 */
exports.sendGameStartNotifications = onSchedule(
  { schedule: 'every 15 minutes', timeZone: 'America/Chicago' },
  async () => {
    logger.info('Checking for games starting soon...');

    try {
      const db = getFirestore();
      const now = Timestamp.now();
      const oneHourFromNow = Timestamp.fromMillis(
        now.toMillis() + 60 * 60 * 1000
      );

      // Find events starting in the next hour
      const eventsSnapshot = await db
        .collection('events')
        .where('startTime', '>', now)
        .where('startTime', '<=', oneHourFromNow)
        .get();

      logger.info(
        `Found ${eventsSnapshot.size} games starting in the next hour`
      );

      // TODO: Implement game start notifications
      // This would involve:
      // 1. Finding users watching each event
      // 2. Checking their gameStarts notification preference
      // 3. Sending notifications to eligible users
      // 4. Tracking which games we've already notified about

      return null;
    } catch (error) {
      logger.error('Error in game start notifications scheduler:', error);
      return null;
    }
  }
);

// ============================================================================
// FCM TOKEN MANAGEMENT
// ============================================================================

/**
 * Callable function to update user's FCM token
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
 * Callable function to disable notifications
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

// ============================================================================
// ALERT SYSTEM SCHEDULERS
// ============================================================================

/**
 * Scheduled function: Send game start reminders
 * Runs every 15 minutes to check for games starting in 45-60 minutes
 */
exports.gameStartReminders = onSchedule(
  { schedule: 'every 15 minutes', timeZone: 'America/Chicago' },
  async () => {
    logger.info('Running game start reminders scheduler');
    await sendGameStartReminders();
    return null;
  }
);

// ============================================================================
// ALERT SYSTEM TRIGGERS
// ============================================================================

/**
 * Triggered when an event document is updated
 * Evaluates custom alert rules against the changes
 */
exports.onEventUpdate = onDocumentUpdated(
  { document: 'events/{eventId}' },
  async (event) => {
    const eventId = event.params.eventId;
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();

    logger.info(`Event updated: ${eventId}, evaluating alert rules`);

    try {
      await evaluateAlertRules(eventId, beforeData, afterData);
      return null;
    } catch (error) {
      logger.error(`Error evaluating alert rules for event ${eventId}:`, error);
      return null;
    }
  }
);

/**
 * OPTIONAL: Triggered when an arbitrage ticket is created
 * Can trigger arb opportunity alerts for custom rules
 */
exports.onArbTicketCreateAlerts = onDocumentCreated(
  { document: 'arbTickets/{ticketId}' },
  async (event) => {
    const ticketId = event.params.ticketId;
    const ticketData = event.data.data();
    const db = getFirestore();
    const { sendEmail } = require('./lib/resend'); // Import here to avoid top-level init issues if config missing

    logger.info(`New arb ticket created: ${ticketId}, checking custom alerts`);

    try {
      // Find users with arb_opportunity alert rules
      const rulesSnapshot = await db.collectionGroup('alertRules')
        .where('condition', '==', 'arb_opportunity')
        .where('enabled', '==', true)
        .where('muted', '==', false)
        .get();

      for (const ruleDoc of rulesSnapshot.docs) {
        const rule = ruleDoc.data();
        const userId = ruleDoc.ref.parent.parent.id;
        const minMargin = rule.arbMinMargin || 5;
        const arbMargin = (ticketData.margin || 0) * 100;

        // Check if arb meets user's threshold
        if (arbMargin >= minMargin) {
          // Send notification
          const userDoc = await db.collection('users').doc(userId).get();
          const userData = userDoc.data();

          const message = `${arbMargin.toFixed(2)}% arbitrage opportunity found!`;

          // 1. FCM
          if (userData?.fcmToken && userData?.notificationsEnabled) {
            await admin.messaging().send({
              token: userData.fcmToken,
              notification: {
                title: `High Value Arbitrage! 💰`,
                body: message,
              },
              data: {
                type: 'custom_alert_arb',
                ruleId: rule.id || '',
                ticketId,
              },
            });
          }

          // 2. Email (Resend)
          if (userData?.email && userData?.emailNotificationsEnabled) {
             const emailHtml = `
              <div style="font-family: sans-serif; color: #333;">
                <h2>High Value Arbitrage Found! 💰</h2>
                <p>${message}</p>
                <p><strong>Margin:</strong> ${arbMargin.toFixed(2)}%</p>
                <p><strong>Event:</strong> ${ticketData.eventId || 'Unknown Event'}</p>
                <a href="https://pickit.app/picks/${ticketId}" style="display: inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 5px;">View Opportunity</a>
              </div>
            `;
            
            await sendEmail({
              to: userData.email,
              subject: `Arbitrage Alert: ${arbMargin.toFixed(2)}% Opportunity`,
              html: emailHtml,
              text: `${message}\n\nView here: https://pickit.app/picks/${ticketId}`
            });
          }

          // Log to alert history
          const { createHistoryEntry } = require('./lib/alert-history');
          await createHistoryEntry(
            userId,
            rule.id,
            rule.name,
            'arb_opportunity',
            {
              eventId: ticketData.eventId,
              message: `${arbMargin.toFixed(2)}% arbitrage opportunity`,
              arbMargin,
            }
          );
        }
      }

      return null;
    } catch (error) {
      logger.error(`Error checking arb alerts for ticket ${ticketId}:`, error);
      return null;
    }
  }
);

// ============================================================================
// STRIPE FUNCTIONS
// ============================================================================

// -------------------------
// Export Stripe Functions
// -------------------------

exports.createCheckoutSession = createCheckoutSession;
exports.createPortalSession = createPortalSession;
exports.stripeWebhook = stripeWebhook;
exports.cancelSubscription = cancelSubscription;

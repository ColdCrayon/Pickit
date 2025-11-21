/**
 * functions/lib/game-reminders.js
 *
 * Game start reminder functionality
 * Sends notifications to users when their watchlisted games are about to start
 */
const admin = require('firebase-admin');
const logger = require('firebase-functions/logger');

async function sendGameStartReminders() {
  const db = admin.firestore();
  const now = new Date();
  const reminderStart = new Date(now.getTime() + 45 * 60000); // 45 minutes from now
  const reminderEnd = new Date(now.getTime() + 60 * 60000); // 60 minutes from now

  logger.info('Checking for games starting in 45-60 minutes...');

  try {
    const eventsSnapshot = await db.collection('events')
      .where('startTime', '>=', admin.firestore.Timestamp.fromDate(reminderStart))
      .where('startTime', '<=', admin.firestore.Timestamp.fromDate(reminderEnd))
      .get();

    logger.info(`Found ${eventsSnapshot.size} events starting soon`);

    for (const eventDoc of eventsSnapshot.docs) {
      const eventData = eventDoc.data();

      // Find users watching this event
      const usersSnapshot = await db.collection('users')
        .where('watchlist.games', 'array-contains-any', [{ id: eventDoc.id }])
        .get();

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();

        if (userData.notificationPreferences?.gameStarts && userData.fcmToken) {
          try {
            await admin.messaging().send({
              token: userData.fcmToken,
              notification: {
                title: 'Game Starting Soon! 🏀',
                body: `${eventData.teams?.home || 'Team'} vs ${eventData.teams?.away || 'Team'} starts in 1 hour`,
              },
              data: { eventId: eventDoc.id, type: 'game_start' },
            });
            logger.info(`Sent game start reminder to user ${userDoc.id} for event ${eventDoc.id}`);
          } catch (error) {
            logger.error(`Failed to send reminder to user ${userDoc.id}:`, error);
          }
        }
      }
    }
  } catch (error) {
    logger.error('Error in sendGameStartReminders:', error);
    throw error;
  }
}

module.exports = { sendGameStartReminders };

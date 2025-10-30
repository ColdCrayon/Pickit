const {setGlobalOptions} = require('firebase-functions/v2/options');
const {onCall} = require('firebase-functions/v2/https');
const {onSchedule} = require('firebase-functions/v2/scheduler');
const logger = require('firebase-functions/logger');

const admin = require('firebase-admin');
const {getFirestore, Timestamp} = require('firebase-admin/firestore');

setGlobalOptions({maxInstances: 10});

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Callable: set custom claims (admins only).
 * Usage (client):
 *   const setUserRoles = httpsCallable(functions, "setUserRoles");
 *   await setUserRoles({ uid, isAdmin: true/false, isPremium: true/false });
 */
exports.setUserRoles = onCall({cors: true}, async (request) => {
  const caller = request.auth;
  if (!caller || caller.token.isAdmin !== true) {
    throw new Error('PERMISSION_DENIED: Admins only.');
  }

  const {uid, isAdmin = false, isPremium = false} = request.data || {};
  if (!uid || typeof uid !== 'string') {
    throw new Error('INVALID_ARGUMENT: \'uid\' is required.');
  }

  // 1) Set custom claims
  await admin.auth().setCustomUserClaims(uid, {
    isAdmin: !!isAdmin,
    isPremium: !!isPremium,
  });

  // 2) Mirror to Firestore for UI (optional)
  await getFirestore()
    .collection('users')
    .doc(uid)
    .set({isAdmin: !!isAdmin, isPremium: !!isPremium}, {merge: true});

  // 3) Force clients to refresh tokens eventually
  try {
    await admin.auth().revokeRefreshTokens(uid);
  } catch (e) {
    logger.warn(
      'Revoke refresh tokens failed; user may need manual refresh.',
      e,
    );
  }

  logger.info(`Updated claims for ${uid}`, {isAdmin, isPremium});
  return {ok: true, uid, isAdmin: !!isAdmin, isPremium: !!isPremium};
});

/**
 * Scheduled job: mark tickets as settled when settleDate <= now
 */
exports.settleTickets = onSchedule(
  {schedule: 'every 5 minutes', timeZone: 'America/Chicago'},
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
      batch.update(doc.ref, {serverSettled: true});
    });

    // ---- Arbitrage Tickets ----
    const arbSnapshot = await db
      .collection('arbTickets')
      .where('settleDate', '<=', now)
      .where('serverSettled', '==', false)
      .get();

    arbSnapshot.forEach((doc) => {
      batch.update(doc.ref, {serverSettled: true});
    });

    if (!gameSnapshot.empty || !arbSnapshot.empty) {
      await batch.commit();
    }

    logger.info(
      `Settled ${gameSnapshot.size} gameTs and ${arbSnapshot.size} arbTs`,
    );
    return null;
  },
);

/**
 * Stripe Cloud Functions (Firebase v2)
 * CORS FIXED - Allows localhost for development
 */

const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret, defineString } = require('firebase-functions/params');
const admin = require('firebase-admin');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = getFirestore();
const STRIPE_PREMIUM_PRICE_ID = defineString('STRIPE_PREMIUM_PRICE_ID');

// -------------------------
// CORS Configuration
// -------------------------

// eslint-disable-next-line no-unused-vars
const allowedOrigins = [
  'https://pickit-b12e5.web.app',
  'https://pickit-b12e5.firebaseapp.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

// -------------------------
// Stripe Setup
// -------------------------

const STRIPE_SECRET = defineSecret('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');

// Initialize Stripe client lazily (secrets are only available at runtime)
function getStripe() {
  return require('stripe')(STRIPE_SECRET.value());
}

// -------------------------
// Helpers
// -------------------------

async function getOrCreateStripeCustomer(userId, email, displayName) {
  if (!userId) {
    throw new Error('User ID is required to create or fetch a Stripe customer');
  }

  const userRef = db.collection('users').doc(userId);
  const userSnap = await userRef.get();
  const userData = userSnap.data() || {};

  if (userData.stripeCustomerId) {
    try {
      await getStripe().customers.update(userData.stripeCustomerId, {
        email: email || userData.email || undefined,
        name: displayName || userData.displayName || undefined,
        metadata: {
          firebaseUID: userId,
        },
      });
    } catch (error) {
      console.warn(`Failed to update Stripe customer ${userData.stripeCustomerId}:`, error);
    }
    return userData.stripeCustomerId;
  }

  const customer = await getStripe().customers.create({
    email,
    name: displayName,
    metadata: {
      firebaseUID: userId,
    },
  });

  await userRef.set(
    {
      stripeCustomerId: customer.id,
      email: email || userData.email || null,
      displayName: displayName || userData.displayName || null,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return customer.id;
}

async function updateUserPremiumStatus(userId, isPremium, subscription) {
  if (!userId) {
    throw new Error('User ID is required to update premium status');
  }

  const userRef = db.collection('users').doc(userId);

  const updates = {
    isPremium: !!isPremium,
    premiumUpdatedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (subscription) {
    const firstItem = subscription.items?.data?.[0];
    updates.subscriptionId = subscription.id;
    updates.subscriptionStatus = subscription.status;
    updates.subscriptionCurrentPeriodEnd = subscription.current_period_end
      ? Timestamp.fromMillis(subscription.current_period_end * 1000)
      : null;
    updates.stripeCustomerId = subscription.customer;
    updates.priceId = firstItem?.price?.id || null;
    updates.priceNickname = firstItem?.price?.nickname || null;
  } else {
    updates.subscriptionId = null;
    updates.subscriptionStatus = 'canceled';
    updates.subscriptionCurrentPeriodEnd = null;
  }

  await userRef.set(updates, { merge: true });

  let userRecord = null;
  try {
    userRecord = await admin.auth().getUser(userId);
  } catch (error) {
    console.warn(`Unable to fetch user ${userId} while updating custom claims:`, error);
  }

  const existingClaims = userRecord?.customClaims || {};
  const nextClaims = {
    ...existingClaims,
    isPremium: !!isPremium,
  };

  try {
    await admin.auth().setCustomUserClaims(userId, nextClaims);
    await admin.auth().revokeRefreshTokens(userId);
  } catch (error) {
    console.error(`Failed to update custom claims for user ${userId}:`, error);
  }
}

async function getUserIdFromStripeCustomer(customerId) {
  if (!customerId) {
    return null;
  }

  const snapshot = await db
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }

  try {
    const customer = await getStripe().customers.retrieve(customerId);
    const firebaseUID = customer?.metadata?.firebaseUID || null;

    if (firebaseUID) {
      await db.collection('users').doc(firebaseUID).set(
        {
          stripeCustomerId: customerId,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    return firebaseUID;
  } catch (error) {
    if (error?.statusCode === 404) {
      console.warn(`Stripe customer ${customerId} not found while resolving Firebase UID.`);
      return null;
    }

    console.error(`Unexpected error retrieving Stripe customer ${customerId}:`, error);
    throw error;
  }
}

// -------------------------
// Create Checkout Session - FIXED WITH EXPLICIT CORS
// -------------------------

exports.createCheckoutSession = onCall(
  {
    cors: true,
    secrets: [STRIPE_SECRET]
  },
  async (request) => {
    const user = request.auth;

    if (!user) {
      throw new HttpsError(
        'unauthenticated',
        'User must be logged in to create checkout session'
      );
    }

    const { email, displayName, returnUrl } = request.data || {};
    const priceId = STRIPE_PREMIUM_PRICE_ID.value();

    if (!priceId) {
      throw new HttpsError('failed-precondition', 'Stripe price ID not configured. Set the STRIPE_PREMIUM_PRICE_ID parameter.');
    }

    try {
      const customerId = await getOrCreateStripeCustomer(
        user.uid,
        email || user.token.email,
        displayName || user.token.name
      );

      const baseUrl = returnUrl || 'https://yourapp.com';

      const session = await getStripe().checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/account?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${baseUrl}/upgrade?canceled=true`,
        metadata: {
          firebaseUID: user.uid,
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new HttpsError('internal', `Failed to create checkout session: ${error.message}`);
    }
  }
);

// -------------------------
// Create Billing Portal Session - FIXED WITH EXPLICIT CORS
// -------------------------

exports.createPortalSession = onCall(
  {
    cors: true,
    secrets: [STRIPE_SECRET]
  },
  async (request) => {
    const user = request.auth;

    if (!user) {
      throw new HttpsError('unauthenticated', 'User must be logged in to access portal');
    }

    try {
      const { returnUrl } = request.data || {};
      const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
      const userData = userDoc.data();
    
      if (!userData?.stripeCustomerId) {
        throw new HttpsError('failed-precondition', 'No Stripe customer found. User must have an active subscription.');
      }

      const session = await getStripe().billingPortal.sessions.create({
        customer: userData.stripeCustomerId,
        return_url: returnUrl || 'https://pickit.app/account',
      });

      return { url: session.url };
    } catch (error) {
      console.error('Error creating portal session:', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', `Failed to create portal session: ${error.message}`);
    }
  }
);

// -------------------------
// Stripe Webhook (RAW body) - NO CORS FOR WEBHOOKS
// -------------------------

exports.stripeWebhook = onRequest(
  {
    secrets: [STRIPE_SECRET, STRIPE_WEBHOOK_SECRET],
    cors: false, // Webhooks DO NOT use CORS
    maxInstances: 1,
  },
  async (req, res) => {
    const signature = req.headers['stripe-signature'];

    let event;
    try {
      event = getStripe().webhooks.constructEvent(
        req.rawBody,
        signature,
        STRIPE_WEBHOOK_SECRET.value()
      );
    } catch (err) {
      console.error('❌ Webhook signature failed:', err.message);
      return res.status(400).send('Webhook Error: ' + err.message);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.firebaseUID;

        if (!userId) {
          console.error('No Firebase UID in checkout session metadata');
          break;
        }

        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await getStripe().subscriptions.retrieve(session.subscription);
          await updateUserPremiumStatus(userId, true, subscription);
          console.log(`User ${userId} upgraded to premium via checkout`);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = await getUserIdFromStripeCustomer(subscription.customer);

        if (!userId) {
          console.error(`No Firebase UID found for customer ${subscription.customer}`);
          break;
        }

        const isPremium = subscription.status === 'active' ||
          subscription.status === 'trialing';
        await updateUserPremiumStatus(userId, isPremium, subscription);
        console.log(
          `Subscription ${subscription.id} ${event.type} for user ${userId} - Premium: ${isPremium}`
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = await getUserIdFromStripeCustomer(subscription.customer);

        if (!userId) {
          console.error(`No Firebase UID found for customer ${subscription.customer}`);
          break;
        }

        await updateUserPremiumStatus(userId, false);
        console.log(`Subscription cancelled for user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

// -------------------------
// Cancel Subscription (Callable Function) - FIXED WITH EXPLICIT CORS
// -------------------------

exports.cancelSubscription = onCall(
  {
    cors: true,
    secrets: [STRIPE_SECRET]
  },
  async (request) => {
    const user = request.auth;

    if (!user) {
      throw new Error('UNAUTHENTICATED: User must be logged in');
    }

    try {
      const userDoc = await db.collection('users').doc(user.uid).get();
      const userData = userDoc.data();

      if (!userData?.subscriptionId) {
        throw new Error('No active subscription found');
      }

      await getStripe().subscriptions.cancel(userData.subscriptionId);
      await updateUserPremiumStatus(user.uid, false);

      console.log(`Subscription ${userData.subscriptionId} cancelled for user ${user.uid}`);

      return {
        success: true,
        message: 'Subscription cancelled successfully',
      };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }
);

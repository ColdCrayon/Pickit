const { onCall, onRequest } = require('firebase-functions/v2/https');
const { defineSecret, defineString } = require('firebase-functions/params');
const admin = require('firebase-admin');
const {
  getFirestore,
  FieldValue,
  Timestamp,
} = require('firebase-admin/firestore');
const Stripe = require('stripe');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = getFirestore();

const stripeSecretParam = defineSecret('STRIPE_SECRET_KEY');
const premiumPriceIdParam = defineString('STRIPE_PREMIUM_PRICE_ID');
const webhookSecretParam = defineSecret('STRIPE_WEBHOOK_SECRET');

let stripeClient = null;
let stripeClientKey = null;

function requireStripeClient() {
  const secretKey = stripeSecretParam.value();

  if (!secretKey) {
    throw new Error(
      'Stripe secret key not configured. Store it as the STRIPE_SECRET_KEY secret.'
    );
  }

  if (!stripeClient || stripeClientKey !== secretKey) {
    try {
      stripeClient = new Stripe(secretKey, {
        apiVersion: '2024-06-20',
      });
      stripeClientKey = secretKey;
    } catch (error) {
      console.error('Failed to initialize Stripe client:', error);
      stripeClient = null;
      stripeClientKey = null;
      throw error;
    }
  }

  return stripeClient;
}

async function getOrCreateStripeCustomer(userId, email, displayName) {
  if (!userId) {
    throw new Error('User ID is required to create or fetch a Stripe customer');
  }

  const userRef = db.collection('users').doc(userId);
  const userSnap = await userRef.get();
  const userData = userSnap.data() || {};

  if (userData.stripeCustomerId) {
    try {
      await requireStripeClient().customers.update(userData.stripeCustomerId, {
        email: email || userData.email || undefined,
        name: displayName || userData.displayName || undefined,
        metadata: {
          firebaseUID: userId,
        },
      });
    } catch (error) {
      console.warn(
        `Failed to update Stripe customer ${userData.stripeCustomerId}:`,
        error
      );
    }

    return userData.stripeCustomerId;
  }

  const customer = await requireStripeClient().customers.create({
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
    const customer = await requireStripeClient().customers.retrieve(
      customerId
    );
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
      console.warn(
        `Stripe customer ${customerId} not found while resolving Firebase UID.`
      );
      return null;
    }

    console.error(
      `Unexpected error retrieving Stripe customer ${customerId}:`,
      error
    );
    throw error;
  }
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
    console.warn(
      `Unable to fetch user ${userId} while updating custom claims:`,
      error
    );
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
    console.error(
      `Failed to update custom claims for user ${userId}:`,
      error
    );
  }
}

const createCheckoutSession = onCall(
  { cors: true, secrets: [stripeSecretParam] },
  async (request) => {
    const user = request.auth;

    if (!user) {
      throw new Error(
        'UNAUTHENTICATED: User must be logged in to create checkout session'
      );
    }

    const { email, displayName, returnUrl } = request.data || {};
    const priceId = premiumPriceIdParam.value();

    if (!priceId) {
      throw new Error(
        'Stripe price ID not configured. Set the STRIPE_PREMIUM_PRICE_ID parameter.'
      );
    }

    try {
      const customerId = await getOrCreateStripeCustomer(
        user.uid,
        email || user.token.email,
        displayName || user.token.name
      );

      const baseUrl = returnUrl || 'https://yourapp.com';

      const session = await requireStripeClient().checkout.sessions.create({
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
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }
  }
);

const createPortalSession = onCall(
  { cors: true, secrets: [stripeSecretParam] },
  async (request) => {
    const user = request.auth;

    if (!user) {
      throw new Error('UNAUTHENTICATED: User must be logged in to access portal');
    }

    try {
      const { returnUrl } = request.data || {};
      const userDoc = await db.collection('users').doc(user.uid).get();
      const userData = userDoc.data();

      if (!userData?.stripeCustomerId) {
        throw new Error(
          'No Stripe customer found. User must have an active subscription.'
        );
      }

      const session =
        await requireStripeClient().billingPortal.sessions.create({
          customer: userData.stripeCustomerId,
          return_url: returnUrl || 'https://yourapp.com/account',
        });

      return {
        url: session.url,
      };
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw new Error(`Failed to create portal session: ${error.message}`);
    }
  }
);

const stripeWebhook = onRequest(
  {
    cors: false,
    memory: '256MiB',
    secrets: [stripeSecretParam, webhookSecretParam],
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = webhookSecretParam.value();

    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured');
      return res.status(500).send('Webhook secret not configured');
    }

    let event;

    try {
      event = requireStripeClient().webhooks.constructEvent(
        req.rawBody,
        sig,
        webhookSecret
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    console.log(`Stripe webhook received: ${event.type} [${event.id}]`);

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const userId = session.metadata?.firebaseUID;

          if (!userId) {
            console.error('No Firebase UID on checkout session metadata');
            break;
          }

          if (session.mode === 'subscription' && session.subscription) {
            const subscription = await requireStripeClient().subscriptions.retrieve(
              session.subscription
            );
            await updateUserPremiumStatus(userId, true, subscription);
            console.log(
              `User ${userId} upgraded to premium via checkout session ${session.id}`
            );
          }

          break;
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          const userId = await getUserIdFromStripeCustomer(
            subscription.customer
          );

          if (!userId) {
            console.error(
              `Could not resolve Firebase UID for Stripe customer ${subscription.customer}`
            );
            break;
          }

          const isPremium =
            subscription.status === 'active' ||
            subscription.status === 'trialing';

          await updateUserPremiumStatus(userId, isPremium, subscription);
          console.log(
            `Subscription ${subscription.id} ${event.type} for user ${userId}`
          );
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          const userId = await getUserIdFromStripeCustomer(
            subscription.customer
          );

          if (!userId) {
            console.error(
              `Could not resolve Firebase UID for Stripe customer ${subscription.customer}`
            );
            break;
          }

          await updateUserPremiumStatus(userId, false);
          console.log(
            `Subscription ${subscription.id} cancelled for user ${userId}`
          );
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object;
          console.log(
            `Payment succeeded for invoice ${invoice.id} (amount ${
              invoice.amount_paid / 100
            })`
          );
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object;
          console.error(`Payment failed for invoice ${invoice.id}`);
          break;
        }

        default:
          console.log(`Unhandled Stripe event type: ${event.type}`);
      }

      return res.json({ received: true, event: event.type });
    } catch (error) {
      console.error(`Error processing webhook ${event.type}:`, error);
      return res.status(500).send(`Webhook handler failed: ${error.message}`);
    }
  }
);

const cancelSubscription = onCall(
  { cors: true, secrets: [stripeSecretParam] },
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

      const subscription = await requireStripeClient().subscriptions.update(
        userData.subscriptionId,
        {
          cancel_at_period_end: true,
        }
      );

      const cancelAt =
        subscription.current_period_end != null
          ? Timestamp.fromMillis(subscription.current_period_end * 1000)
          : null;

      await db
        .collection('users')
        .doc(user.uid)
        .set(
          {
            cancelAt,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

      return {
        success: true,
        message: 'Subscription will cancel at the end of the billing period',
        cancelAt: subscription.current_period_end,
      };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }
);

module.exports = {
  stripe: stripeClient,
  getOrCreateStripeCustomer,
  updateUserPremiumStatus,
  getUserIdFromStripeCustomer,
  createCheckoutSession,
  createPortalSession,
  stripeWebhook,
  cancelSubscription,
};

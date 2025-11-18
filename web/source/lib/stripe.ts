/**
 * web/source/lib/stripe.ts
 * Frontend Stripe integration - CORS FIXED VERSION
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';

let stripePromise: Promise<Stripe | null>;
let functionsInstance: ReturnType<typeof getFunctions> | null = null;

/**
 * Get Firebase Functions instance with correct region
 * IMPORTANT: Must match the region where functions are deployed
 */
const getFunctionsInstance = () => {
  if (!functionsInstance) {
    // Initialize with us-central1 region (default for Functions V2)
    functionsInstance = getFunctions(undefined, 'us-central1');
    
    // Uncomment this if you're testing with emulators
    // if (window.location.hostname === 'localhost') {
    //   connectFunctionsEmulator(functionsInstance, 'localhost', 5001);
    // }
  }
  return functionsInstance;
};

/**
 * Get Stripe instance (lazy loaded)
 * @returns Promise<Stripe | null>
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.error('⚠️ VITE_STRIPE_PUBLISHABLE_KEY not found in environment variables');
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }
  
  return stripePromise;
};

/**
 * Redirect user to Stripe Checkout for premium subscription
 * @param email - User's email address
 * @param displayName - User's display name (optional)
 * @throws Error if checkout session creation fails
 */
export const redirectToCheckout = async (
  email: string,
  displayName?: string
): Promise<void> => {
  try {
    console.log('🚀 Creating Stripe checkout session...');
    
    const functions = getFunctionsInstance();
    
    // Call Firebase Function to create checkout session
    const createCheckoutSession = httpsCallable<
      { email: string; displayName?: string; returnUrl: string },
      { sessionId: string; url: string }
    >(functions, 'createCheckoutSession');
    
    const response = await createCheckoutSession({
      email,
      displayName,
      returnUrl: window.location.origin,
    });

    const { url } = response.data;

    if (!url) {
      throw new Error('No checkout URL returned from server');
    }

    console.log('✅ Checkout session created, redirecting...');

    // Redirect to Stripe Checkout
    window.location.href = url;
  } catch (error: any) {
    console.error('❌ Error creating checkout session:', error);
    
    // Throw user-friendly error
    if (error.code === 'unauthenticated') {
      throw new Error('You must be logged in to upgrade');
    } else if (error.code === 'failed-precondition') {
      throw new Error('Subscription configuration error. Please contact support.');
    } else if (error.message?.includes('price_')) {
      throw new Error('Subscription configuration error. Please contact support.');
    } else {
      throw new Error(error.message || 'Failed to start checkout process');
    }
  }
};

/**
 * Redirect user to Stripe Customer Portal
 * Allows users to manage subscription, payment methods, view invoices, etc.
 * @param returnPath - Path to return to after portal (default: "/account")
 * @throws Error if portal session creation fails
 */
export const redirectToCustomerPortal = async (
  returnPath: string = '/account'
): Promise<void> => {
  try {
    console.log('🚀 Creating Stripe customer portal session...');
    
    const functions = getFunctionsInstance();
    
    // Call Firebase Function to create portal session
    const createPortalSession = httpsCallable<
      { returnUrl: string },
      { url: string }
    >(functions, 'createPortalSession');
    
    const response = await createPortalSession({
      returnUrl: window.location.origin + returnPath,
    });

    const { url } = response.data;

    if (!url) {
      throw new Error('No portal URL returned from server');
    }

    console.log('✅ Portal session created, redirecting...');

    // Redirect to Stripe Customer Portal
    window.location.href = url;
  } catch (error: any) {
    console.error('❌ Error creating portal session:', error);
    
    // Throw user-friendly error
    if (error.code === 'unauthenticated') {
      throw new Error('You must be logged in to access billing portal');
    } else if (error.code === 'failed-precondition') {
      throw new Error('You must have an active subscription to access the portal');
    } else if (error.message?.includes('No Stripe customer')) {
      throw new Error('You must have an active subscription to access the portal');
    } else {
      throw new Error(error.message || 'Failed to open billing portal');
    }
  }
};

/**
 * Cancel subscription directly (alternative to portal)
 * @throws Error if cancellation fails
 */
export const cancelSubscription = async (): Promise<{
  success: boolean;
  message: string;
  cancelAt: number;
}> => {
  try {
    console.log('🚀 Cancelling subscription...');
    
    const functions = getFunctionsInstance();
    
    const cancel = httpsCallable<
      void,
      { success: boolean; message: string; cancelAt: number }
    >(functions, 'cancelSubscription');
    
    const response = await cancel();
    
    console.log('✅ Subscription cancelled');
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error cancelling subscription:', error);
    
    if (error.code === 'unauthenticated') {
      throw new Error('You must be logged in to cancel subscription');
    } else if (error.code === 'failed-precondition') {
      throw new Error('No active subscription found');
    } else if (error.message?.includes('No active subscription')) {
      throw new Error('No active subscription found');
    } else {
      throw new Error(error.message || 'Failed to cancel subscription');
    }
  }
};

/**
 * Check if checkout was successful (called on redirect back from Stripe)
 * @returns boolean indicating if the URL contains success parameter
 */
export const wasCheckoutSuccessful = (): boolean => {
  const params = new URLSearchParams(window.location.search);
  return params.get('success') === 'true' && params.has('session_id');
};

/**
 * Check if checkout was cancelled (called on redirect back from Stripe)
 * @returns boolean indicating if the URL contains canceled parameter
 */
export const wasCheckoutCancelled = (): boolean => {
  const params = new URLSearchParams(window.location.search);
  return params.get('canceled') === 'true';
};

/**
 * Get checkout session ID from URL (if present)
 * @returns session ID or null
 */
export const getCheckoutSessionId = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('session_id');
};

/**
 * Clean up checkout parameters from URL
 * Removes success, canceled, and session_id query parameters
 */
export const cleanupCheckoutUrl = (): void => {
  const url = new URL(window.location.href);
  url.searchParams.delete('success');
  url.searchParams.delete('canceled');
  url.searchParams.delete('session_id');
  window.history.replaceState({}, document.title, url.toString());
};
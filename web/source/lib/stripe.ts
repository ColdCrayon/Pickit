/**
 * web/source/lib/stripe.ts
 *
 * Helper utilities for loading the Stripe.js SDK in the browser.
 */

import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Lazily load the Stripe.js SDK using the publishable key from the
 * Vite environment. Returns `null` if the key is missing so the caller can
 * surface a helpful error to the user instead of crashing the app.
 */
export const getStripe = async (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error("VITE_STRIPE_PUBLISHABLE_KEY is not configured");
      return null;
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};

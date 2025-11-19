import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

/**
 * Redirect user to Stripe Checkout to start subscription
 * @param email - User's email address
 * @param displayName - User's display name (optional)
 * @param returnUrl - URL to return to after checkout (optional)
 */
export async function redirectToCheckout(
  email: string,
  displayName?: string,
  returnUrl?: string
): Promise<void> {
  try {
    const createCheckoutSession = httpsCallable(
      functions,
      "createCheckoutSession"
    );

    const result = await createCheckoutSession({
      email,
      displayName,
      returnUrl: returnUrl || window.location.origin,
    });

    const data = result.data as { sessionId: string; url: string };

    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error("No checkout URL returned from server");
    }
  } catch (error: any) {
    console.error("❌ Error creating checkout session:", error);
    throw new Error(
      error.message || "Failed to create checkout session. Please try again."
    );
  }
}

/**
 * Redirect user to Stripe Customer Portal to manage subscription
 * @param returnUrl - URL to return to after portal (optional)
 */
export async function redirectToCustomerPortal(
  returnUrl?: string
): Promise<void> {
  try {
    const createPortalSession = httpsCallable(functions, "createPortalSession");

    const result = await createPortalSession({
      returnUrl: returnUrl || `${window.location.origin}/account`,
    });

    const data = result.data as { url: string };

    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error("No portal URL returned from server");
    }
  } catch (error: any) {
    console.error("❌ Error creating portal session:", error);
    throw new Error(
      error.message || "Failed to open billing portal. Please try again."
    );
  }
}

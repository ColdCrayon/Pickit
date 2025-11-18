/**
 * web/source/lib/firebase.ts
 */

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
} from "firebase/messaging";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
// Explicitly set region to match deployed functions
export const functions = getFunctions(app, 'us-central1');

let messagingInstance: Messaging | null = null;

/**
 * Get Firebase Messaging instance (lazy initialization)
 * Returns null if FCM is not supported (e.g., in development without HTTPS)
 */
export const getMessagingInstance = (): Messaging | null => {
  if (messagingInstance) return messagingInstance;

  try {
    // FCM requires HTTPS in production, but works in localhost
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator
    ) {
      messagingInstance = getMessaging(app);
      return messagingInstance;
    }
  } catch (error) {
    console.warn("Firebase Messaging not available:", error);
  }

  return null;
};

/**
 * Request notification permission and get FCM token
 * Returns the token if successful, null otherwise
 */
export const requestNotificationPermission = async (): Promise<
  string | null
> => {
  try {
    const messaging = getMessagingInstance();
    if (!messaging) {
      console.warn("Messaging not supported in this environment");
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    // Get FCM token
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error("VITE_FIREBASE_VAPID_KEY not configured");
      return null;
    }

    const token = await getToken(messaging, { vapidKey });
    console.log("FCM token obtained:", token);
    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};

/**
 * Save FCM token to Firestore and Cloud Functions
 */
export const saveFcmToken = async (
  token: string,
  userId: string
): Promise<void> => {
  try {
    // Save to Firestore (client-side)
    await setDoc(
      doc(db, "users", userId),
      {
        fcmToken: token,
        notificationsEnabled: true,
        fcmTokenUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Also call Cloud Function to ensure backend has the token
    const updateFcmToken = httpsCallable(functions, "updateFcmToken");
    await updateFcmToken({ fcmToken: token });

    console.log("FCM token saved successfully");
  } catch (error) {
    console.error("Error saving FCM token:", error);
    throw error;
  }
};

/**
 * Set up foreground message handler
 * This handles notifications when the app is open and in focus
 */
export const setupForegroundMessageHandler = (
  callback: (payload: any) => void
): (() => void) => {
  const messaging = getMessagingInstance();
  if (!messaging) return () => {};

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);
    callback(payload);
  });

  return unsubscribe;
};

/**
 * Disable notifications for the current user
 */
export const disableNotifications = async (): Promise<void> => {
  try {
    const disableNotifs = httpsCallable(functions, "disableNotifications");
    await disableNotifs();
    console.log("Notifications disabled");
  } catch (error) {
    console.error("Error disabling notifications:", error);
    throw error;
  }
};

export const upsertUserDoc = async (uid: string, data: any) => {
  const userRef = doc(db, "users", uid);
  await setDoc(
    userRef,
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
};

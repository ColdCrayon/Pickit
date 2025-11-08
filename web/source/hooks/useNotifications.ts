/**
 * web/source/hooks/useNotifications.ts
 *
 * FIXED: Check if notifications are already enabled on mount
 */

import { useState, useEffect, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "./useAuth";
import { db } from "../lib/firebase";
import {
  requestNotificationPermission,
  saveFcmToken,
  setupForegroundMessageHandler,
  disableNotifications as disableNotificationsApi,
} from "../lib/firebase";

interface NotificationState {
  permission: NotificationPermission;
  loading: boolean;
  error: string | null;
  token: string | null;
  enabled: boolean;
}

interface NotificationActions {
  requestPermission: () => Promise<void>;
  disableNotifications: () => Promise<void>;
  showNotification: (title: string, body: string) => void;
}

/**
 * Hook for managing push notifications
 *
 * Usage:
 * ```tsx
 * const { permission, enabled, requestPermission } = useNotifications();
 *
 * if (permission === 'default') {
 *   <button onClick={requestPermission}>Enable Notifications</button>
 * }
 * ```
 */
export const useNotifications = (): NotificationState & NotificationActions => {
  const { user } = useAuth();
  const [state, setState] = useState<NotificationState>({
    permission:
      typeof Notification !== "undefined" ? Notification.permission : "denied",
    loading: false,
    error: null,
    token: null,
    enabled: false,
  });

  /**
   * Check if user already has notifications enabled
   */
  useEffect(() => {
    if (!user) {
      setState((prev) => ({ ...prev, enabled: false, token: null }));
      return;
    }

    const checkExistingToken = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();

        if (userData?.fcmToken && userData?.notificationsEnabled !== false) {
          setState((prev) => ({
            ...prev,
            enabled: true,
            token: userData.fcmToken,
            permission: Notification.permission,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            enabled: false,
            token: null,
          }));
        }
      } catch (error) {
        console.error("Error checking notification status:", error);
      }
    };

    checkExistingToken();
  }, [user]);

  /**
   * Request notification permission and save FCM token
   */
  const requestPermission = useCallback(async () => {
    if (!user) {
      setState((prev) => ({ ...prev, error: "Must be logged in" }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const token = await requestNotificationPermission();

      if (!token) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to get notification token",
          permission: Notification.permission,
        }));
        return;
      }

      // Save token to Firestore
      await saveFcmToken(token, user.uid);

      setState((prev) => ({
        ...prev,
        loading: false,
        token,
        enabled: true,
        permission: "granted",
      }));
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  }, [user]);

  /**
   * Disable notifications
   */
  const disableNotifications = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await disableNotificationsApi();
      setState((prev) => ({
        ...prev,
        loading: false,
        enabled: false,
        token: null,
      }));
    } catch (error) {
      console.error("Error disabling notifications:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  }, []);

  /**
   * Show a browser notification (for testing)
   */
  const showNotification = useCallback(
    (title: string, body: string) => {
      if (state.permission === "granted") {
        new Notification(title, { body });
      }
    },
    [state.permission]
  );

  /**
   * Set up foreground message handler when component mounts
   */
  useEffect(() => {
    if (!user) return;

    const unsubscribe = setupForegroundMessageHandler((payload) => {
      console.log("Foreground notification received:", payload);

      // Show browser notification
      if (state.permission === "granted") {
        const title = payload.notification?.title || "New Notification";
        const body = payload.notification?.body || "";
        new Notification(title, {
          body,
          icon: "/logo192.png",
          badge: "/logo192.png",
        });
      }

      // You can also trigger a toast notification or update UI here
    });

    return () => unsubscribe();
  }, [user, state.permission]);

  /**
   * Update permission state when it changes
   */
  useEffect(() => {
    const handlePermissionChange = () => {
      setState((prev) => ({
        ...prev,
        permission: Notification.permission,
      }));
    };

    // Listen for permission changes (not all browsers support this)
    if (typeof Notification !== "undefined" && "permissions" in navigator) {
      navigator.permissions
        .query({ name: "notifications" as PermissionName })
        .then((permissionStatus) => {
          permissionStatus.addEventListener("change", handlePermissionChange);
        })
        .catch(console.error);
    }

    return () => {
      // Cleanup not possible for all browsers
    };
  }, []);

  return {
    ...state,
    requestPermission,
    disableNotifications,
    showNotification,
  };
};

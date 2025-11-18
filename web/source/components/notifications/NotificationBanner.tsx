/**
 * web/source/components/notifications/NotificationBanner.tsx
 *
 * In-app notification banner that appears when notifications are received
 */

import React, { useState, useEffect } from "react";
import { X, Bell, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  body: string;
  data?: {
    type?: string;
    link?: string;
    [key: string]: any;
  };
  timestamp: number;
}

interface NotificationBannerProps {
  notification: Notification | null;
  onDismiss: () => void;
  autoHideDuration?: number; // milliseconds
}

/**
 * Notification Banner Component
 * Displays in-app notifications at the top of the screen
 *
 * Usage:
 * ```tsx
 * const [notification, setNotification] = useState(null);
 *
 * // When notification received:
 * setNotification({
 *   id: 'notif-123',
 *   title: 'Odds Alert',
 *   body: 'Lakers odds moved',
 *   data: { link: '/watchlist' },
 *   timestamp: Date.now()
 * });
 *
 * <NotificationBanner
 *   notification={notification}
 *   onDismiss={() => setNotification(null)}
 * />
 * ```
 */
export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onDismiss,
  autoHideDuration = 5000,
}) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);

      // Auto-hide after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Wait for fade-out animation
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss, autoHideDuration]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleAction = () => {
    if (notification?.data?.link) {
      navigate(notification.data.link);
      handleDismiss();
    }
  };

  if (!notification) return null;

  return (
    <div
      className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
      style={{ maxWidth: "calc(100vw - 2rem)" }}
    >
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-2xl border border-white/20 backdrop-blur-xl">
        <div className="p-4 flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
            <p className="text-sm text-white/90 line-clamp-2">
              {notification.body}
            </p>

            {/* Action Button */}
            {notification.data?.link && (
              <button
                onClick={handleAction}
                className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition"
              >
                <span>View</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-white/10 overflow-hidden rounded-b-xl">
          <div
            className="h-full bg-white/40 transition-all"
            style={{
              animation: `shrink ${autoHideDuration}ms linear`,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Hook to manage notification banner state
 *
 * Usage:
 * ```tsx
 * const { notification, showNotification, dismissNotification } = useNotificationBanner();
 *
 * // Show a notification
 * showNotification({
 *   title: 'Odds Alert',
 *   body: 'Lakers spread moved',
 *   data: { link: '/watchlist' }
 * });
 *
 * <NotificationBanner
 *   notification={notification}
 *   onDismiss={dismissNotification}
 * />
 * ```
 */
export const useNotificationBanner = () => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (notif: Omit<Notification, "id" | "timestamp">) => {
    setNotification({
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: Date.now(),
    });
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  return {
    notification,
    showNotification,
    dismissNotification,
  };
};

export default NotificationBanner;
/**
 * web/source/pages/MyTickets.tsx
 *
 * NEW FOR WEEK 1: Page for viewing user's saved tickets
 * Requires authentication
 */

import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Star, Bell, Settings } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import { UserTicketList } from "../components/tickets/UserTicketList";

/**
 * My Tickets page
 * Shows all tickets saved by the user with notification controls
 */
export const MyTickets: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    permission,
    enabled,
    requestPermission,
    disableNotifications,
    loading: notifLoading,
  } = useNotifications();

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            <h1 className="text-4xl font-bold">My Saved Tickets</h1>
          </div>
          <p className="text-gray-400">
            Track your favorite arbitrage opportunities and game picks
          </p>
        </div>

        {/* Notification Settings Card */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Bell className="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Push Notifications
                </h2>
                <p className="text-gray-400 mb-4">
                  Get notified when your saved tickets update or settle
                </p>

                {/* Permission status */}
                <div className="flex items-center gap-2 text-sm">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      enabled
                        ? "bg-green-400"
                        : permission === "denied"
                        ? "bg-red-400"
                        : "bg-gray-400"
                    }`}
                  />
                  <span className="text-gray-300">
                    {enabled
                      ? "Notifications enabled"
                      : permission === "denied"
                      ? "Notifications blocked"
                      : "Notifications not enabled"}
                  </span>
                </div>
              </div>
            </div>

            {/* Enable/Disable button */}
            <div>
              {!enabled && permission !== "denied" && (
                <button
                  onClick={requestPermission}
                  disabled={notifLoading}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {notifLoading ? "Enabling..." : "Enable Notifications"}
                </button>
              )}
              {enabled && (
                <button
                  onClick={disableNotifications}
                  disabled={notifLoading}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {notifLoading ? "Disabling..." : "Disable"}
                </button>
              )}
              {permission === "denied" && (
                <div className="text-sm text-gray-400 max-w-xs">
                  <p className="mb-2">Notifications are blocked.</p>
                  <p>
                    To enable, go to your browser settings and allow
                    notifications for this site.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Saved Tickets List */}
        <UserTicketList />

        {/* Info Card */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Settings className="w-6 h-6 text-gray-400 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">How it works</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>
                  • Click the "Save" button on any arbitrage or game ticket to
                  track it
                </li>
                <li>
                  • Enable notifications to get alerts when tickets update or
                  settle
                </li>
                <li>• All your saved tickets appear here for easy access</li>
                <li>• Click any ticket to view full details</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTickets;

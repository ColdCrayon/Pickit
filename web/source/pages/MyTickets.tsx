/**
 * web/source/pages/MyTickets.tsx
 *
 * Page for viewing user's saved tickets
 * Requires authentication
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { Star, Settings } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { UserTicketList } from "../components/tickets/UserTicketList";

/**
 * My Tickets page
 * Shows all tickets saved by the user
 */
export const MyTickets: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

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
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
              <Star className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white text-glow">My Saved Tickets</h1>
          </div>
          <p className="text-gray-400 font-medium ml-1">
            Track your favorite arbitrage opportunities and game picks
          </p>
        </div>

        {/* Saved Tickets List */}
        <UserTicketList />

        {/* Info Card */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <Settings className="w-6 h-6 text-gray-400 mt-1" />
            <div>
              <h3 className="font-semibold mb-2 text-white">How it works</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>
                  • Click the "Save" button on any arbitrage or game ticket to
                  track it
                </li>
                <li>
                  • Enable notifications in your Account settings to get alerts
                  when tickets update or settle
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

/**
 * ProDashboard - UPDATED with Odds Comparison Preview
 *
 * Added OddsComparisonPreview widget to dashboard
 */

import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Star,
  TrendingUp,
  Zap,
  BarChart3,
  Bell,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Footer } from "../components";
import { useAuth } from "../hooks/useAuth";
import { useWatchlist } from "../hooks/useWatchlist";
import { WatchlistGameItem } from "../components/watchlist/WatchlistGameItem";
import { OddsComparisonPreview } from "../components/odds/OddsComparisonPreview"; // NEW

interface ProDashboardProps {
  isSidebarOpen: boolean;
}

const ProDashboard: React.FC<ProDashboardProps> = ({ isSidebarOpen }) => {
  const { user } = useAuth();
  const {
    watchlist,
    removeGame,
    loading: watchlistLoading,
    totalItems,
  } = useWatchlist(user?.uid);

  // Just show first game from watchlist - WatchlistGameItem handles data fetching
  const firstGameId = watchlist?.games?.[0]?.id;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main
        className={`relative z-10 transition-all duration-300 ${
          isSidebarOpen ? "ml-64 lg:ml-64" : ""
        } pt-16`}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <LayoutDashboard className="w-8 h-8 text-yellow-400" />
              <h1 className="text-3xl font-bold">Pro Dashboard</h1>
            </div>
            <p className="text-gray-400">
              Welcome back! Here's your personalized betting insights.
            </p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Quick Stats */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Quick Stats</h3>
                  <p className="text-sm text-gray-400">Your betting overview</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">Watchlist Items</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {totalItems || 0}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">Active Alerts</p>
                  <p className="text-2xl font-bold text-green-400">0</p>
                </div>
              </div>

              <Link
                to="/watchlist"
                className="block mt-4 w-full py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-medium rounded-xl text-center transition"
              >
                Manage Watchlist
              </Link>
            </div>

            {/* NEW: Odds Comparison Preview */}
            <OddsComparisonPreview />
          </div>

          {/* Watchlist Preview */}
          {watchlistLoading ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-white/10 rounded w-1/3"></div>
                <div className="h-32 bg-white/10 rounded"></div>
              </div>
            </div>
          ) : firstGameId ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Your Watchlist</h3>
                    <p className="text-sm text-gray-400">
                      {totalItems} game{totalItems !== 1 ? "s" : ""} tracked
                    </p>
                  </div>
                </div>
                <Link
                  to="/watchlist"
                  className="flex items-center gap-1 text-sm text-yellow-400 hover:text-yellow-300 transition"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <WatchlistGameItem
                gameId={firstGameId}
                onRemove={(id) => removeGame(id)}
              />
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Games in Watchlist
                </h3>
                <p className="text-gray-400 mb-6">
                  Start tracking games to get real-time odds updates and alerts
                </p>
                <Link
                  to="/browse-events"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-medium rounded-xl transition"
                >
                  <Plus className="w-5 h-5" />
                  Browse Games
                </Link>
              </div>
            </div>
          )}

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Link
              to="/browse-events"
              className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-2xl p-6 hover:scale-105 transition-transform"
            >
              <TrendingUp className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Live Events</h3>
              <p className="text-sm text-gray-400">
                Browse and track upcoming games across all leagues
              </p>
            </Link>

            <Link
              to="/odds-comparison"
              className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6 hover:scale-105 transition-transform"
            >
              <BarChart3 className="w-8 h-8 text-yellow-400 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Odds Comparison</h3>
              <p className="text-sm text-gray-400">
                Compare odds across all major sportsbooks in real-time
              </p>
            </Link>

            <Link
              to="/Account"
              className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-2xl p-6 hover:scale-105 transition-transform"
            >
              <Bell className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Notifications</h3>
              <p className="text-sm text-gray-400">
                Set up alerts for odds changes and game updates
              </p>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProDashboard;

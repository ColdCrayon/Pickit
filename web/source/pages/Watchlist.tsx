/**
 * Watchlist Page - UPDATED FOR ID-ONLY STORAGE
 *
 * Updated to work with new watchlist storage that only keeps game IDs
 */

import React from "react";
import { Link } from "react-router-dom";
import { Star, Plus, TrendingUp } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useWatchlist } from "../hooks/useWatchlist";
import { WatchlistGameItem } from "../components/watchlist/WatchlistGameItem";
import { Footer } from "../components";

const Watchlist: React.FC = () => {
  const { user } = useAuth();
  const { watchlist, removeGame, loading, error, totalItems } = useWatchlist(
    user?.uid
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl mt-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-400" />
              <h1 className="text-4xl font-bold">My Watchlist</h1>
            </div>

            <Link
              to="/browse-events"
              className="flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-xl transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Browse Events
            </Link>
          </div>

          <p className="text-gray-400">
            Track odds changes and get notifications for your saved games
          </p>

          {totalItems > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              {totalItems} item{totalItems !== 1 ? "s" : ""} tracked
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Loading your watchlist...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400 mb-4">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading &&
          !error &&
          (!watchlist?.games || watchlist.games.length === 0) && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center max-w-md">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full mx-auto flex items-center justify-center">
                    <Star className="w-12 h-12 text-yellow-400" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-3">
                  Your Watchlist is Empty
                </h2>

                <p className="text-gray-400 mb-8 leading-relaxed">
                  Start tracking your favorite upcoming games. Get notified when
                  odds change and stay ahead of the game.
                </p>

                <Link
                  to="/browse-events"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-xl transition-all hover:scale-105"
                >
                  <TrendingUp className="w-5 h-5" />
                  Browse Events
                </Link>

                <div className="mt-10 pt-8 border-t border-white/10">
                  <h3 className="text-sm font-semibold mb-4 text-gray-300">
                    What you can track:
                  </h3>
                  <div className="grid grid-cols-1 gap-3 text-sm text-gray-400 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span>Upcoming games across NFL, NBA, MLB, NHL</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Live odds updates from multiple sportsbooks</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Notifications when betting lines move</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Games List */}
        {!loading &&
          !error &&
          watchlist?.games &&
          watchlist.games.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-300">
                  Games ({watchlist.games.length})
                </h2>
                <p className="text-sm text-gray-500">
                  Showing all tracked games
                </p>
              </div>

              {watchlist.games.map((game) => (
                <WatchlistGameItem
                  key={game.id}
                  gameId={game.id}
                  onRemove={removeGame}
                  showOdds={true}
                />
              ))}
            </div>
          )}
      </div>

      <Footer />
    </div>
  );
};

export default Watchlist;

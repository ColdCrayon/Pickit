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
    <div className="min-h-screen bg-transparent text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl mt-12 pt-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
                <Star className="w-6 h-6 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold text-white text-glow">My Watchlist</h1>
            </div>

            <Link
              to="/browse-events"
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
            >
              <Plus className="w-5 h-5" />
              Browse Events
            </Link>
          </div>

          <p className="text-gray-400 font-medium ml-1">
            Track odds changes and get notifications for your saved games
          </p>

          {totalItems > 0 && (
            <p className="text-sm text-gray-500 mt-2 ml-1">
              {totalItems} item{totalItems !== 1 ? "s" : ""} tracked
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
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
                  <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                    <Star className="w-12 h-12 text-gray-600" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-3 text-white">
                  Your Watchlist is Empty
                </h2>

                <p className="text-gray-400 mb-8 leading-relaxed">
                  Start tracking your favorite upcoming games. Get notified when
                  odds change and stay ahead of the game.
                </p>

                <Link
                  to="/browse-events"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
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
                      <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                      <span>Upcoming games across NFL, NBA, MLB, NHL</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
                      <span>Live odds updates from multiple sportsbooks</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_rgba(192,132,252,0.5)]"></div>
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

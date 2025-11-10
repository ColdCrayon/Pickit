/**
 * Watchlist Page
 *
 * View and manage all watchlisted games with live odds
 * Shows teams, games, and markets being tracked
 */

import React, { useState } from "react";
import { Star, Plus, Settings, TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useWatchlist } from "../hooks/useWatchlist";
import { WatchlistGameItem } from "../components/watchlist/WatchlistGameItem";

type FilterType = "all" | "upcoming" | "today";

export default function Watchlist() {
  const { user } = useAuth();
  const { watchlist, removeGame, loading, error, totalItems } = useWatchlist(
    user?.uid
  );
  const [filter, setFilter] = useState<FilterType>("all");

  // Filter games
  const filteredGames =
    watchlist?.games.filter((game) => {
      const now = new Date();
      const gameTime = new Date(game.startTime);

      if (filter === "upcoming") {
        return gameTime > now;
      }

      if (filter === "today") {
        const todayStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);
        return gameTime >= todayStart && gameTime < todayEnd;
      }

      return true; // "all"
    }) || [];

  // Sort by start time (soonest first)
  const sortedGames = [...filteredGames].sort((a, b) => {
    const aTime = new Date(a.startTime).getTime();
    const bTime = new Date(b.startTime).getTime();
    return aTime - bTime;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-gray-400 mb-6">
            Please sign in to view your watchlist
          </p>
          <Link
            to="/Account"
            className="inline-block px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 mt-12">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                My Watchlist
              </h1>
              <p className="text-gray-400">
                Track live odds and receive notifications for your favorite
                games
              </p>
            </div>

            <Link
              to="/browse-events"
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Events
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {totalItems}
              </div>
              <div className="text-sm text-gray-400">Total Items</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-400">
                {watchlist?.games.length || 0}
              </div>
              <div className="text-sm text-gray-400">Games</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-400">
                {
                  sortedGames.filter((g) => new Date(g.startTime) > new Date())
                    .length
                }
              </div>
              <div className="text-sm text-gray-400">Upcoming</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
              filter === "all"
                ? "bg-yellow-400 text-black font-semibold"
                : "bg-white/5 hover:bg-white/10 text-gray-300"
            }`}
          >
            All Games
          </button>
          <button
            onClick={() => setFilter("today")}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
              filter === "today"
                ? "bg-yellow-400 text-black font-semibold"
                : "bg-white/5 hover:bg-white/10 text-gray-300"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
              filter === "upcoming"
                ? "bg-yellow-400 text-black font-semibold"
                : "bg-white/5 hover:bg-white/10 text-gray-300"
            }`}
          >
            Upcoming
          </button>
        </div>

        {/* Content */}
        <div>
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-400">Loading watchlist...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && sortedGames.length === 0 && (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {filter === "all"
                  ? "Your watchlist is empty"
                  : `No ${filter} games`}
              </h3>
              <p className="text-gray-400 mb-6">
                {filter === "all"
                  ? "Start tracking games by adding them to your watchlist"
                  : "Try selecting a different filter"}
              </p>
              {filter === "all" && (
                <Link
                  to="/browse-events"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition"
                >
                  <Plus className="w-5 h-5" />
                  Browse Events
                </Link>
              )}
            </div>
          )}

          {/* Watchlist Items */}
          {!loading && !error && sortedGames.length > 0 && (
            <>
              <div className="mb-4 text-sm text-gray-400">
                Showing {sortedGames.length} game
                {sortedGames.length !== 1 ? "s" : ""}
              </div>

              <div className="space-y-4">
                {sortedGames.map((game) => (
                  <WatchlistGameItem
                    key={game.id}
                    game={game}
                    onRemove={removeGame}
                    showOdds={true}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info Footer */}
        {!loading && !error && sortedGames.length > 0 && (
          <div className="mt-12 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Live Updates
            </h3>
            <p className="text-sm text-gray-400">
              Odds update automatically in real-time. You'll receive
              notifications when lines move significantly or when games are
              about to start.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

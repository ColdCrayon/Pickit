/**
 * Watchlist Page - COMPLETE VERSION
 *
 * Main watchlist page showing user's tracked games, teams, and markets
 * Includes add/remove functionality and live odds updates
 */

import React, { useState } from "react";
import { Star, Plus, Trash2, Filter, Search } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useWatchlist } from "../hooks/useWatchlist";
import {
  WatchlistGame,
  WatchlistTeam,
  WatchlistMarket,
} from "../types/watchlist";
import { WatchlistGameItem } from "../components/watchlist/WatchlistGameItem";

interface WatchlistProps {
  isSidebarOpen?: boolean;
}

/**
 * Watchlist Page Component
 */
const Watchlist: React.FC<WatchlistProps> = ({ isSidebarOpen = false }) => {
  const { user } = useAuth();
  const {
    watchlist,
    loading,
    error,
    removeGame,
    removeTeam,
    removeMarket,
    totalItems,
  } = useWatchlist(user?.uid);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "games" | "teams" | "markets"
  >("all");

  // Filter watchlist items
  const filteredGames =
    watchlist?.games.filter((game) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          game.teams.home.toLowerCase().includes(query) ||
          game.teams.away.toLowerCase().includes(query) ||
          game.league.toLowerCase().includes(query)
        );
      }
      return true;
    }) || [];

  const filteredTeams =
    watchlist?.teams.filter((team) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          team.name.toLowerCase().includes(query) ||
          team.league.toLowerCase().includes(query)
        );
      }
      return true;
    }) || [];

  const filteredMarkets = watchlist?.markets || [];

  const showGames = filterType === "all" || filterType === "games";
  const showTeams = filterType === "all" || filterType === "teams";
  const showMarkets = filterType === "all" || filterType === "markets";

  return (
    <main
      className={`relative z-10 min-h-screen transition-all duration-300 ${
        isSidebarOpen ? "md:ml-64" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">My Watchlist</h1>
                <p className="text-gray-400 mt-1">
                  Tracking {totalItems} item{totalItems !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search games, teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  filterType === "all"
                    ? "bg-yellow-400 text-black font-semibold"
                    : "bg-white/5 hover:bg-white/10 text-gray-300"
                }`}
              >
                All ({totalItems})
              </button>
              <button
                onClick={() => setFilterType("games")}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  filterType === "games"
                    ? "bg-yellow-400 text-black font-semibold"
                    : "bg-white/5 hover:bg-white/10 text-gray-300"
                }`}
              >
                Games ({watchlist?.games.length || 0})
              </button>
              <button
                onClick={() => setFilterType("teams")}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  filterType === "teams"
                    ? "bg-yellow-400 text-black font-semibold"
                    : "bg-white/5 hover:bg-white/10 text-gray-300"
                }`}
              >
                Teams ({watchlist?.teams.length || 0})
              </button>
              <button
                onClick={() => setFilterType("markets")}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  filterType === "markets"
                    ? "bg-yellow-400 text-black font-semibold"
                    : "bg-white/5 hover:bg-white/10 text-gray-300"
                }`}
              >
                Markets ({watchlist?.markets.length || 0})
              </button>
            </div>
          </div>
        </div>

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
            <p className="text-red-400 mb-4">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && totalItems === 0 && (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No items in your watchlist
            </h3>
            <p className="text-gray-400 mb-6">
              Start tracking games, teams, and markets to stay updated
            </p>
            <a
              href="/event-browser"
              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black rounded-xl font-semibold hover:bg-yellow-300 transition"
            >
              <Plus className="w-5 h-5" />
              Browse Events
            </a>
          </div>
        )}

        {/* Content */}
        {!loading && !error && totalItems > 0 && (
          <div className="space-y-6">
            {/* Games Section */}
            {showGames && filteredGames.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span>Games</span>
                  <span className="text-sm text-gray-400">
                    ({filteredGames.length})
                  </span>
                </h2>
                <div className="grid gap-4">
                  {filteredGames.map((game) => (
                    <WatchlistGameItem
                      key={game.id}
                      game={game}
                      onRemove={removeGame}
                      showOdds={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Teams Section */}
            {showTeams && filteredTeams.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span>Teams</span>
                  <span className="text-sm text-gray-400">
                    ({filteredTeams.length})
                  </span>
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredTeams.map((team) => (
                    <div
                      key={team.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">
                            {team.name}
                          </h3>
                          <p className="text-sm text-gray-400">{team.league}</p>
                        </div>
                        <button
                          onClick={() => removeTeam(team.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition"
                          title="Remove team"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Markets Section */}
            {showMarkets && filteredMarkets.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span>Markets</span>
                  <span className="text-sm text-gray-400">
                    ({filteredMarkets.length})
                  </span>
                </h2>
                <div className="grid gap-4">
                  {filteredMarkets.map((market) => (
                    <div
                      key={`${market.eventId}-${market.marketType}`}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">
                            {market.marketType}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Event ID: {market.eventId}
                          </p>
                          {market.alertThreshold && (
                            <p className="text-xs text-yellow-400 mt-1">
                              Alert threshold: {market.alertThreshold}%
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            removeMarket(market.eventId, market.marketType)
                          }
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition"
                          title="Remove market"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {((showGames && filteredGames.length === 0) ||
              (showTeams && filteredTeams.length === 0) ||
              (showMarkets && filteredMarkets.length === 0)) &&
              searchQuery && (
                <div className="text-center py-12">
                  <p className="text-gray-400">
                    No results found for "{searchQuery}"
                  </p>
                </div>
              )}
          </div>
        )}
      </div>
    </main>
  );
};

// ✅ CRITICAL: Export as default for App.tsx routing
export default Watchlist;

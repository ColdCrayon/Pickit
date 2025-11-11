import React, { useState, useEffect } from "react";
import { X, Search, Star, Clock, TrendingUp } from "lucide-react";
import {
  WatchlistTeam,
  WatchlistGame,
  WatchlistMarket,
} from "../../types/watchlist";

interface AddToWatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTeam: (team: Omit<WatchlistTeam, "addedAt">) => Promise<void>;
  onAddGame: (game: Omit<WatchlistGame, "addedAt">) => Promise<void>;
  onAddMarket: (market: Omit<WatchlistMarket, "addedAt">) => Promise<void>;
}

type TabType = "teams" | "games" | "markets";

/**
 * AddToWatchlistModal Component
 * Modal for searching and adding items to watchlist
 */
export const AddToWatchlistModal: React.FC<AddToWatchlistModalProps> = ({
  isOpen,
  onClose,
  onAddTeam,
  onAddGame,
  onAddMarket,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("teams");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Clear error when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSearchQuery("");
    }
  }, [isOpen]);

  // Sample teams data (in production, this would come from an API or database)
  const sampleTeams = [
    {
      id: "nfl_kansas_city_chiefs",
      name: "Kansas City Chiefs",
      league: "NFL" as const,
    },
    {
      id: "nfl_san_francisco_49ers",
      name: "San Francisco 49ers",
      league: "NFL" as const,
    },
    {
      id: "nba_los_angeles_lakers",
      name: "Los Angeles Lakers",
      league: "NBA" as const,
    },
    {
      id: "nba_boston_celtics",
      name: "Boston Celtics",
      league: "NBA" as const,
    },
    {
      id: "mlb_new_york_yankees",
      name: "New York Yankees",
      league: "MLB" as const,
    },
    {
      id: "nhl_vegas_golden_knights",
      name: "Vegas Golden Knights",
      league: "NHL" as const,
    },
  ];

  // Sample games data
  const sampleGames = [
    {
      id: "game_001",
      league: "NFL" as const,
      teams: { home: "Kansas City Chiefs", away: "Buffalo Bills" },
      startTime: new Date(Date.now() + 86400000), // Tomorrow
    },
    {
      id: "game_002",
      league: "NBA" as const,
      teams: { home: "Los Angeles Lakers", away: "Boston Celtics" },
      startTime: new Date(Date.now() + 172800000), // 2 days
    },
  ];

  // Sample markets data
  const sampleMarkets = [
    {
      id: "market_001",
      type: "spread" as const,
      eventId: "game_001",
      league: "NFL" as const,
      description: "Chiefs -3.5",
    },
    {
      id: "market_002",
      type: "totals" as const,
      eventId: "game_002",
      league: "NBA" as const,
      description: "Over 215.5",
    },
  ];

  const filteredTeams = sampleTeams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.league.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGames = sampleGames.filter(
    (game) =>
      game.teams.home.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.teams.away.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.league.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMarkets = sampleMarkets.filter(
    (market) =>
      market.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.league.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTeam = async (team: (typeof sampleTeams)[0]) => {
    setLoading(true);
    setError(null);
    try {
      await onAddTeam(team);
      setSearchQuery("");
      onClose(); // Close modal after successful add
    } catch (err: any) {
      setError(err.message || "Failed to add team");
    } finally {
      setLoading(false);
    }
  };

  const handleAddGame = async (game: (typeof sampleGames)[0]) => {
    setLoading(true);
    setError(null);
    try {
      await onAddGame(game);
      setSearchQuery("");
      onClose(); // Close modal after successful add
    } catch (err: any) {
      setError(err.message || "Failed to add game");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMarket = async (market: (typeof sampleMarkets)[0]) => {
    setLoading(true);
    setError(null);
    try {
      await onAddMarket(market);
      setSearchQuery("");
      onClose(); // Close modal after successful add
    } catch (err: any) {
      setError(err.message || "Failed to add market");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-800 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold">Add to Watchlist</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab("teams")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === "teams"
                ? "bg-yellow-400 text-gray-900 font-semibold"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            <Star className="w-4 h-4" />
            Teams
          </button>
          <button
            onClick={() => setActiveTab("games")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === "games"
                ? "bg-yellow-400 text-gray-900 font-semibold"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            <Clock className="w-4 h-4" />
            Games
          </button>
          <button
            onClick={() => setActiveTab("markets")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === "markets"
                ? "bg-yellow-400 text-gray-900 font-semibold"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Markets
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-yellow-400 transition"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "teams" && (
            <div className="space-y-2">
              {filteredTeams.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No teams found</p>
              ) : (
                filteredTeams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => handleAddTeam(team)}
                    disabled={loading}
                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-gray-900">
                        {team.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">{team.name}</div>
                        <div className="text-sm text-gray-400">
                          {team.league}
                        </div>
                      </div>
                    </div>
                    <Star className="w-5 h-5 text-gray-400" />
                  </button>
                ))
              )}
            </div>
          )}

          {activeTab === "games" && (
            <div className="space-y-2">
              {filteredGames.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No games found</p>
              ) : (
                filteredGames.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => handleAddGame(game)}
                    disabled={loading}
                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <div className="text-left">
                        <div className="font-semibold">
                          {game.teams.away} @ {game.teams.home}
                        </div>
                        <div className="text-sm text-gray-400">
                          {game.league} • {game.startTime.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Star className="w-5 h-5 text-gray-400" />
                  </button>
                ))
              )}
            </div>
          )}

          {activeTab === "markets" && (
            <div className="space-y-2">
              {filteredMarkets.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  No markets found
                </p>
              ) : (
                filteredMarkets.map((market) => (
                  <button
                    key={market.id}
                    onClick={() => handleAddMarket(market)}
                    disabled={loading}
                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <div className="text-left">
                        <div className="font-semibold">
                          {market.description}
                        </div>
                        <div className="text-sm text-gray-400">
                          {market.league} • {market.type}
                        </div>
                      </div>
                    </div>
                    <Star className="w-5 h-5 text-gray-400" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-gray-800/50">
          <p className="text-sm text-gray-400 text-center">
            Add items to track odds changes and receive notifications
          </p>
        </div>
      </div>
    </div>
  );
};

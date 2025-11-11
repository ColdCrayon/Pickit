import React, { useState } from "react";
import { Star, Plus } from "lucide-react";
import { WatchlistItem } from "./WatchlistItem";
import { WatchlistEmptyState } from "./WatchlistEmptyState";
import { AddToWatchlistModal } from "./AddToWatchlistModal";
import { useWatchlist } from "../../hooks/useWatchlist";
import { useUserPlan } from "../../hooks";

interface WatchlistCardProps {
  userId: string | undefined;
}

/**
 * WatchlistCard Component
 * Main watchlist display with add/remove functionality
 */
export const WatchlistCard: React.FC<WatchlistCardProps> = ({ userId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    watchlist,
    loading,
    error,
    addTeam,
    removeTeam,
    addGame,
    removeGame,
    addMarket,
    removeMarket,
    totalItems,
  } = useWatchlist(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading watchlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 mb-2">Error loading watchlist</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const hasItems = totalItems > 0;

  return (
    <>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-400" />
            <div>
              <h2 className="text-xl font-semibold">Watchlist</h2>
              <p className="text-sm text-gray-400">
                {totalItems} items tracked
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-xl font-semibold hover:bg-yellow-300 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!hasItems ? (
            <WatchlistEmptyState onAddClick={() => setIsModalOpen(true)} />
          ) : (
            <div className="space-y-6">
              {/* Teams Section */}
              {watchlist?.teams && watchlist.teams.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                    Teams ({watchlist.teams.length})
                  </h3>
                  <div className="space-y-2">
                    {watchlist.teams.map((team) => (
                      <WatchlistItem
                        key={team.id}
                        item={team}
                        type="team"
                        onRemove={() => removeTeam(team.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Games Section */}
              {watchlist?.games && watchlist.games.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                    Games ({watchlist.games.length})
                  </h3>
                  <div className="space-y-2">
                    {watchlist.games.map((game) => (
                      <WatchlistItem
                        key={game.id}
                        item={game}
                        type="game"
                        onRemove={() => removeGame(game.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Markets Section */}
              {watchlist?.markets && watchlist.markets.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                    Markets ({watchlist.markets.length})
                  </h3>
                  <div className="space-y-2">
                    {watchlist.markets.map((market) => (
                      <WatchlistItem
                        key={market.id}
                        item={market}
                        type="market"
                        onRemove={() => removeMarket(market.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        {hasItems && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-500 text-center">
              Remove items with the X button
            </p>
          </div>
        )}
      </div>

      {/* Add to Watchlist Modal */}
      <AddToWatchlistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTeam={addTeam}
        onAddGame={addGame}
        onAddMarket={addMarket}
      />
    </>
  );
};

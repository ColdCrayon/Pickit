import React from "react";
import { Star } from "lucide-react";

interface WatchlistEmptyStateProps {
  onAddClick?: () => void;
}

/**
 * WatchlistEmptyState Component
 * Displayed when user has no items in their watchlist
 */
export const WatchlistEmptyState: React.FC<WatchlistEmptyStateProps> = ({
  onAddClick,
}) => {
  return (
    <div className="flex items-center justify-center h-full text-center py-12">
      <div className="max-w-md">
        <div className="mb-6 relative">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full mx-auto flex items-center justify-center">
            <Star className="w-12 h-12 text-yellow-400" />
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-3">Your Watchlist is Empty</h3>

        <p className="text-gray-400 mb-6 leading-relaxed">
          Start tracking your favorite teams, upcoming games, and betting
          markets. Get notified when odds change and stay ahead of the game.
        </p>

        {onAddClick && (
          <button
            onClick={onAddClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-gray-900 rounded-xl font-semibold hover:bg-yellow-300 transition-all hover:scale-105"
          >
            <Star className="w-5 h-5" />
            Add Your First Item
          </button>
        )}

        <div className="mt-8 pt-8 border-t border-white/10">
          <h4 className="text-sm font-semibold mb-3 text-gray-300">
            What you can track:
          </h4>
          <div className="grid grid-cols-1 gap-2 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Teams across NFL, NBA, MLB, NHL</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Upcoming games and matchups</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Specific betting markets</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

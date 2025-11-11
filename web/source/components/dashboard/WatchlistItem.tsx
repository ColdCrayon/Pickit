import React from "react";
import { X, Clock, TrendingUp } from "lucide-react";
import {
  WatchlistTeam,
  WatchlistGame,
  WatchlistMarket,
} from "../../types/watchlist";

interface WatchlistItemProps {
  item: WatchlistTeam | WatchlistGame | WatchlistMarket;
  type: "team" | "game" | "market";
  onRemove: () => void;
}

/**
 * WatchlistItem Component
 * Displays a single watchlist item with remove functionality
 */
export const WatchlistItem: React.FC<WatchlistItemProps> = ({
  item,
  type,
  onRemove,
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const renderContent = () => {
    switch (type) {
      case "team":
        const team = item as WatchlistTeam;
        return (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-gray-900">
                {team.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold">{team.name}</h3>
                <p className="text-sm text-gray-400">{team.league}</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              Added {formatDate(team.addedAt)}
            </span>
          </div>
        );

      case "game":
        const game = item as WatchlistGame;
        return (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-400" />
              <div>
                <h3 className="font-semibold">
                  {game.teams.away} @ {game.teams.home}
                </h3>
                <p className="text-sm text-gray-400">
                  {game.league} • {formatDate(game.startTime)}
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              Added {formatDate(game.addedAt)}
            </span>
          </div>
        );

      case "market":
        const market = item as WatchlistMarket;
        return (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <div>
                <h3 className="font-semibold">{market.description}</h3>
                <p className="text-sm text-gray-400">
                  {market.league} • {market.type}
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              Added {formatDate(market.addedAt)}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="group bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200">
      <div className="flex items-center justify-between gap-4">
        {renderContent()}
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded-lg"
          aria-label="Remove from watchlist"
        >
          <X className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </div>
  );
};

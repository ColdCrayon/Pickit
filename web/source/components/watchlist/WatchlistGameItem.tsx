/**
 * WatchlistGameItem Component - PROPERLY DISPLAYS AMERICAN ODDS
 *
 * Individual watchlist game card with odds display
 * Used in the Watchlist page
 *
 * FIX: Works with updated useBestOdds that returns OddsEntry objects
 */

import React, { useState } from "react";
import { X, Calendar, TrendingUp } from "lucide-react";
import { Event, sportKeyToLeague } from "../../types/events";
import { useBestOdds } from "../../hooks/useEventOdds";
import { MoneylineDisplay, SpreadDisplay, TotalsDisplay } from "./OddsDisplay";
import { Timestamp } from "firebase/firestore";

interface WatchlistGameItemProps {
  game: Event;
  onRemove: (gameId: string) => Promise<void>;
  showOdds?: boolean;
}

/**
 * Format event time relative to now
 */
function formatEventTime(startTime: Timestamp | Date): string {
  try {
    const date =
      startTime instanceof Timestamp ? startTime.toDate() : startTime;
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 0) {
      return "Started";
    }

    if (diffHours < 24) {
      return `in ${diffHours}h`;
    }

    if (diffDays < 7) {
      return `in ${diffDays}d`;
    }

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch (err) {
    console.error(
      "[WatchlistGameItem] Error formatting event time:",
      err,
      startTime
    );
    return "Unknown";
  }
}

export const WatchlistGameItem: React.FC<WatchlistGameItemProps> = ({
  game,
  onRemove,
  showOdds = true,
}) => {
  const [removing, setRemoving] = useState(false);

  // Get best odds - returns Record<string, OddsEntry>
  const { bestOdds: bestMoneyline, loading: moneylineLoading } = useBestOdds(
    game.id,
    "h2h"
  );
  const { bestOdds: bestSpread, loading: spreadLoading } = useBestOdds(
    game.id,
    "spreads"
  );
  const { bestOdds: bestTotals, loading: totalsLoading } = useBestOdds(
    game.id,
    "totals"
  );

  const oddsLoading = moneylineLoading || spreadLoading || totalsLoading;
  const hasOdds = bestMoneyline || bestSpread || bestTotals;

  const handleRemove = async () => {
    if (removing) return;

    setRemoving(true);
    try {
      await onRemove(game.id);
    } catch (error) {
      console.error("[WatchlistGameItem] Error removing game:", error);
      alert("Failed to remove game from watchlist");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-yellow-400 px-2 py-0.5 bg-yellow-400/10 rounded">
              {sportKeyToLeague(game.sport)}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatEventTime(game.startTime)}
            </span>
          </div>

          {/* Teams */}
          <div className="space-y-1">
            <div className="text-white font-semibold">
              {game.teams.away} @ {game.teams.home}
            </div>
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          disabled={removing}
          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition"
          title="Remove from watchlist"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Odds Display */}
      {showOdds && (
        <div className="pt-3 border-t border-white/10">
          {oddsLoading && (
            <div className="text-center text-gray-400 text-sm py-2">
              Loading odds...
            </div>
          )}

          {!oddsLoading && !hasOdds && (
            <div className="text-center text-gray-500 text-sm py-2">
              No odds available
            </div>
          )}

          {!oddsLoading && hasOdds && (
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                <TrendingUp className="w-3 h-3" />
                <span>Best Available Odds</span>
              </div>

              {/* Moneyline - Using OddsEntry objects directly */}
              {bestMoneyline && (bestMoneyline.home || bestMoneyline.away) && (
                <div>
                  <div className="text-xs text-gray-500 mb-1 font-semibold">
                    Moneyline
                  </div>
                  <MoneylineDisplay
                    homeOdds={bestMoneyline.home}
                    awayOdds={bestMoneyline.away}
                    homeTeam={game.teams.home}
                    awayTeam={game.teams.away}
                  />
                </div>
              )}

              {/* Spread - Using OddsEntry objects directly */}
              {bestSpread && (bestSpread.home || bestSpread.away) && (
                <div>
                  <div className="text-xs text-gray-500 mb-1 font-semibold">
                    Spread
                  </div>
                  <SpreadDisplay
                    homeOdds={bestSpread.home}
                    awayOdds={bestSpread.away}
                    homeTeam={game.teams.home}
                    awayTeam={game.teams.away}
                  />
                </div>
              )}

              {/* Totals - Using OddsEntry objects directly */}
              {bestTotals && (bestTotals.over || bestTotals.under) && (
                <div>
                  <div className="text-xs text-gray-500 mb-1 font-semibold">
                    Total
                  </div>
                  <TotalsDisplay
                    overOdds={bestTotals.over}
                    underOdds={bestTotals.under}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

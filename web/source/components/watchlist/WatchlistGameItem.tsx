/**
 * WatchlistGameItem Component - FIXED ODDS DISPLAY
 *
 * Displays a watchlisted game with live odds updates
 * Includes remove button
 *
 * FIXES:
 * - Properly handles bestOdds as Record<string, OddsEntry>
 * - Fixed "[object Object]" display issue
 * - Robust Timestamp handling
 */

import React, { useState } from "react";
import { Trash2, Calendar, TrendingUp } from "lucide-react";
import { WatchlistGame } from "../../types/watchlist";
import { useBestOdds } from "../../hooks/useEventOdds";
import { MoneylineDisplay, SpreadDisplay, TotalsDisplay } from "./OddsDisplay";
import { Timestamp } from "firebase/firestore";

interface WatchlistGameItemProps {
  game: WatchlistGame;
  onRemove: (gameId: string) => Promise<void>;
  showOdds?: boolean;
}

/**
 * Format date/time for display
 * Handles both Date objects and Firestore Timestamps robustly
 */
function formatEventTime(startTime: Date | Timestamp | any): string {
  try {
    if (!startTime) {
      console.warn("[WatchlistGameItem] startTime is null/undefined");
      return "Unknown";
    }

    let date: Date;

    if (startTime instanceof Timestamp) {
      date = startTime.toDate();
    } else if (startTime instanceof Date) {
      date = startTime;
    } else if (
      typeof startTime === "object" &&
      typeof startTime.toDate === "function"
    ) {
      date = startTime.toDate();
    } else if (typeof startTime === "string" || typeof startTime === "number") {
      date = new Date(startTime);
    } else if (typeof startTime === "object" && startTime.seconds) {
      date = new Date(startTime.seconds * 1000);
    } else {
      console.error("[WatchlistGameItem] Invalid startTime format:", startTime);
      return "Unknown";
    }

    if (isNaN(date.getTime())) {
      console.error("[WatchlistGameItem] Invalid date:", date);
      return "Invalid Date";
    }

    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    // If game already started or passed
    if (diffMs < 0) {
      const absDiffHours = Math.abs(diffHours);
      if (absDiffHours < 24) {
        return "Final";
      } else {
        return date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
      }
    }

    // If within 24 hours, show relative time
    if (diffHours < 24) {
      if (diffHours < 1) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `in ${diffMins}m`;
      }
      return `in ${diffHours}h`;
    }

    // If within 7 days, show days
    if (diffDays < 7) {
      return `in ${diffDays}d`;
    }

    // Otherwise show full date
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
              {game.league}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatEventTime(game.startTime)}
            </span>
          </div>

          {/* Teams */}
          <div className="space-y-1">
            <div className="text-white font-semibold">{game.teams.away}</div>
            <div className="text-gray-400 text-sm">@</div>
            <div className="text-white font-semibold">{game.teams.home}</div>
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          disabled={removing}
          className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition disabled:opacity-50"
          title="Remove from watchlist"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>

      {/* Odds Display */}
      {showOdds && hasOdds && (
        <div className="pt-3 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
            <TrendingUp className="w-3 h-3" />
            <span>Live Odds</span>
            {oddsLoading && (
              <span className="ml-2 text-yellow-400 animate-pulse">●</span>
            )}
          </div>

          {/* Moneyline */}
          {bestMoneyline &&
            (bestMoneyline.home || bestMoneyline.away) && (
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

          {/* Spread */}
          {bestSpread &&
            (bestSpread.home || bestSpread.away) && (
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

          {/* Totals */}
          {bestTotals &&
            (bestTotals.over || bestTotals.under) && (
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

      {/* No Odds Available */}
      {showOdds && !hasOdds && !oddsLoading && (
        <div className="pt-3 border-t border-white/10 text-center text-sm text-gray-500">
          No odds available
        </div>
      )}
    </div>
  );
};

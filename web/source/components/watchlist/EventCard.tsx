/**
 * EventCard Component - FIXED ODDS DISPLAY
 *
 * Displays an event with teams, start time, and best odds
 * Includes "Add to Watchlist" button
 *
 * FIXES:
 * - Properly handles bestOdds as Record<string, number> (not objects)
 * - Fixed "[object Object]" display issue
 */

import React, { useState } from "react";
import { Star, Calendar, TrendingUp } from "lucide-react";
import { Event, sportKeyToLeague } from "../../types/events";
import { useBestOdds } from "../../hooks/useEventOdds";
import { useAuth } from "../../hooks/useAuth";
import { useWatchlist } from "../../hooks/useWatchlist";
import { MoneylineDisplay, SpreadDisplay, TotalsDisplay } from "./OddsDisplay";
import { Timestamp } from "firebase/firestore";

interface EventCardProps {
  event: Event;
  showOdds?: boolean;
  onAddSuccess?: () => void;
}

/**
 * Format date/time for display
 * Handles both Timestamp and Date objects
 */
function formatEventTime(startTime: Timestamp | Date): string {
  try {
    const date =
      startTime instanceof Timestamp ? startTime.toDate() : startTime;
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    // If within 24 hours, show relative time
    if (diffHours < 24 && diffHours > 0) {
      return `in ${diffHours}h`;
    }

    // If within 7 days, show days
    if (diffDays < 7 && diffDays > 0) {
      return `in ${diffDays}d`;
    }

    // Otherwise show date
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch (err) {
    console.error("[EventCard] Error formatting time:", err);
    return "TBD";
  }
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  showOdds = true,
  onAddSuccess,
}) => {
  const { user } = useAuth();
  const {
    watchlist,
    addGame,
    loading: watchlistLoading,
  } = useWatchlist(user?.uid);
  const [adding, setAdding] = useState(false);

  // Get best odds for display - returns Record<string, number>
  const { bestOdds: bestMoneyline } = useBestOdds(event.id, "h2h");
  const { bestOdds: bestSpread } = useBestOdds(event.id, "spreads");
  const { bestOdds: bestTotals } = useBestOdds(event.id, "totals");

  // Check if already in watchlist
  const isInWatchlist = watchlist?.games.some((g) => g.id === event.id);

  const league = sportKeyToLeague(event.sport);

  const handleAddToWatchlist = async () => {
    if (!user) {
      alert("Please sign in to add games to your watchlist");
      return;
    }

    if (isInWatchlist) {
      return; // Already added
    }

    setAdding(true);
    try {
      // FIXED: Ensure startTime is always a Timestamp
      let startTimeTimestamp: Timestamp;

      if (event.startTime instanceof Timestamp) {
        startTimeTimestamp = event.startTime;
      } else if (event.startTime instanceof Date) {
        startTimeTimestamp = Timestamp.fromDate(event.startTime);
      } else if (
        typeof event.startTime === "object" &&
        event.startTime.toDate
      ) {
        startTimeTimestamp = event.startTime as Timestamp;
      } else {
        console.error("[EventCard] Invalid startTime format:", event.startTime);
        throw new Error("Invalid event start time");
      }

      await addGame({
        id: event.id,
        league: league as "NFL" | "NBA" | "MLB" | "NHL",
        teams: event.teams,
        startTime: startTimeTimestamp,
      });

      if (onAddSuccess) {
        onAddSuccess();
      }
    } catch (error: any) {
      console.error("[EventCard] Error adding to watchlist:", error);
      if (!error.message.includes("already in watchlist")) {
        alert(error.message || "Failed to add to watchlist");
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-yellow-400 px-2 py-0.5 bg-yellow-400/10 rounded">
              {league}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatEventTime(event.startTime)}
            </span>
          </div>

          {/* Teams */}
          <div className="space-y-1">
            <div className="text-white font-semibold">{event.teams.away}</div>
            <div className="text-gray-400 text-sm">@</div>
            <div className="text-white font-semibold">{event.teams.home}</div>
          </div>
        </div>

        {/* Add to Watchlist Button */}
        <button
          onClick={handleAddToWatchlist}
          disabled={isInWatchlist || adding || watchlistLoading}
          className={`p-2 rounded-lg transition ${
            isInWatchlist
              ? "bg-yellow-400/20 text-yellow-400 cursor-default"
              : "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-yellow-400"
          }`}
          title={isInWatchlist ? "Already in watchlist" : "Add to watchlist"}
        >
          <Star
            className={`w-5 h-5 ${isInWatchlist ? "fill-yellow-400" : ""}`}
          />
        </button>
      </div>

      {/* Odds Display */}
      {showOdds && (bestMoneyline || bestSpread || bestTotals) && (
        <div className="pt-3 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
            <TrendingUp className="w-3 h-3" />
            <span>Best Available Odds</span>
          </div>

          {/* Moneyline - FIXED: bestMoneyline is Record<string, number> */}
          {bestMoneyline && (
            <div>
              <div className="text-xs text-gray-500 mb-1 font-semibold">
                Moneyline
              </div>
              <MoneylineDisplay
                homeOdds={
                  bestMoneyline.home !== undefined
                    ? { priceAmerican: bestMoneyline.home }
                    : undefined
                }
                awayOdds={
                  bestMoneyline.away !== undefined
                    ? { priceAmerican: bestMoneyline.away }
                    : undefined
                }
                homeTeam={event.teams.home}
                awayTeam={event.teams.away}
              />
            </div>
          )}

          {/* Spread - FIXED: bestSpread is Record<string, number> */}
          {bestSpread && (
            <div>
              <div className="text-xs text-gray-500 mb-1 font-semibold">
                Spread
              </div>
              <SpreadDisplay
                homeOdds={
                  bestSpread.home !== undefined
                    ? {
                        priceAmerican: bestSpread.home,
                        point: bestSpread.homePoint,
                      }
                    : undefined
                }
                awayOdds={
                  bestSpread.away !== undefined
                    ? {
                        priceAmerican: bestSpread.away,
                        point: bestSpread.awayPoint,
                      }
                    : undefined
                }
                homeTeam={event.teams.home}
                awayTeam={event.teams.away}
              />
            </div>
          )}

          {/* Totals - FIXED: bestTotals is Record<string, number> */}
          {bestTotals && (
            <div>
              <div className="text-xs text-gray-500 mb-1 font-semibold">
                Total
              </div>
              <TotalsDisplay
                overOdds={
                  bestTotals.over !== undefined
                    ? {
                        priceAmerican: bestTotals.over,
                        point: bestTotals.point,
                      }
                    : undefined
                }
                underOdds={
                  bestTotals.under !== undefined
                    ? {
                        priceAmerican: bestTotals.under,
                        point: bestTotals.point,
                      }
                    : undefined
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

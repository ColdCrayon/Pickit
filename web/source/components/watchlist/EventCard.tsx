/**
 * EventCard Component - PROPERLY DISPLAYS AMERICAN ODDS
 *
 * Displays an event with teams, start time, and best odds in American format
 * Includes "Add to Watchlist" button
 *
 * FIX: Works with updated useBestOdds that returns OddsEntry objects
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
 */
function formatEventTime(startTime: Timestamp | Date): string {
  try {
    const date =
      startTime instanceof Timestamp ? startTime.toDate() : startTime;
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24 && diffHours > 0) {
      return `in ${diffHours}h`;
    }

    if (diffDays < 7 && diffDays > 0) {
      return `in ${diffDays}d`;
    }

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

  // Get best odds - now returns Record<string, OddsEntry>
  const { bestOdds: bestMoneyline } = useBestOdds(event.id, "h2h");
  const { bestOdds: bestSpread } = useBestOdds(event.id, "spreads");
  const { bestOdds: bestTotals } = useBestOdds(event.id, "totals");

  // Check if already in watchlist
  const isInWatchlist = watchlist.games.some((game) => game.id === event.id);

  const handleAdd = async () => {
    if (!user || adding || isInWatchlist) return;

    setAdding(true);
    try {
      // addGame now just takes the event ID
      await addGame(event.id);
      onAddSuccess?.();
    } catch (error) {
      console.error("[EventCard] Error adding to watchlist:", error);
      alert("Failed to add event to watchlist");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-yellow-400 px-2 py-0.5 bg-yellow-400/10 rounded">
              {sportKeyToLeague(event.sport)}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatEventTime(event.startTime)}
            </span>
          </div>

          {/* Teams */}
          <div className="space-y-1">
            <div className="text-white font-semibold">
              {event.teams.away} @ {event.teams.home}
            </div>
          </div>
        </div>

        {/* Add to Watchlist Button */}
        <button
          onClick={handleAdd}
          disabled={adding || isInWatchlist}
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

          {/* Moneyline - Using OddsEntry objects directly */}
          {bestMoneyline && (bestMoneyline.home || bestMoneyline.away) && (
            <div>
              <div className="text-xs text-gray-500 mb-1 font-semibold">
                Moneyline
              </div>
              <MoneylineDisplay
                homeOdds={bestMoneyline.home}
                awayOdds={bestMoneyline.away}
                homeTeam={event.teams.home}
                awayTeam={event.teams.away}
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
                homeTeam={event.teams.home}
                awayTeam={event.teams.away}
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
  );
};

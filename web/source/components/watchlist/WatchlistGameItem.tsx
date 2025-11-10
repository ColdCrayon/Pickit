/**
 * WatchlistGameItem Component
 *
 * Displays a watchlisted game with live odds updates
 * Includes remove button and notification settings
 */

import React, { useState } from "react";
import { Trash2, Calendar, Bell, BellOff, ExternalLink } from "lucide-react";
import { WatchlistGame } from "../../types/watchlist";
import { useEventOdds } from "../../hooks/useEventOdds";
import { MoneylineDisplay, SpreadDisplay, TotalsDisplay } from "./OddsDisplay";
import { Timestamp } from "firebase/firestore";

interface WatchlistGameItemProps {
  game: WatchlistGame;
  onRemove: (gameId: string) => Promise<void>;
  showOdds?: boolean;
}

/**
 * Format date/time for display
 * Handles both Date objects and Firestore Timestamps
 */
function formatEventTime(startTime: Date | Timestamp | any): string {
  try {
    // Convert to Date if it's a Timestamp
    let date: Date;
    if (startTime instanceof Timestamp) {
      date = startTime.toDate();
    } else if (startTime instanceof Date) {
      date = startTime;
    } else if (typeof startTime === "object" && startTime.toDate) {
      // Handle Timestamp-like objects
      date = startTime.toDate();
    } else if (typeof startTime === "string" || typeof startTime === "number") {
      // Handle string/number timestamps
      date = new Date(startTime);
    } else {
      console.error("Invalid startTime format:", startTime);
      return "Unknown";
    }

    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    // If game already started or passed
    if (diffMs < 0) {
      return "Final";
    }

    // If within 24 hours, show relative time
    if (diffHours < 24) {
      if (diffHours < 1) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `Starts in ${diffMins}m`;
      }
      return `Starts in ${diffHours}h`;
    }

    // If within 7 days, show days
    if (diffDays < 7) {
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
    console.error("Error formatting event time:", err, startTime);
    return "Unknown";
  }
}

/**
 * Get best odds from a market
 */
function getBestOdds(
  marketOdds: Record<string, any> | undefined,
  outcome: string
): number | undefined {
  if (!marketOdds) return undefined;

  let best: number | undefined;
  Object.values(marketOdds).forEach((bookOdds: any) => {
    const odds = bookOdds.odds?.[outcome];
    if (odds) {
      const price = odds.priceAmerican || odds.priceDecimal;
      if (price !== undefined) {
        if (best === undefined || price > best) {
          best = price;
        }
      }
    }
  });

  return best;
}

export const WatchlistGameItem: React.FC<WatchlistGameItemProps> = ({
  game,
  onRemove,
  showOdds = true,
}) => {
  const [removing, setRemoving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Get live odds for this event
  const { event, loading: oddsLoading } = useEventOdds(game.id);

  const handleRemove = async () => {
    if (removing) return;

    if (
      !confirm(`Remove ${game.teams.away} @ ${game.teams.home} from watchlist?`)
    ) {
      return;
    }

    setRemoving(true);
    try {
      await onRemove(game.id);
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      alert("Failed to remove from watchlist");
    } finally {
      setRemoving(false);
    }
  };

  // Extract best odds
  const bestMoneylineHome = getBestOdds(event?.markets?.h2h, "home");
  const bestMoneylineAway = getBestOdds(event?.markets?.h2h, "away");
  const bestSpreadHome = getBestOdds(event?.markets?.spreads, "home");
  const bestSpreadAway = getBestOdds(event?.markets?.spreads, "away");
  const bestTotalsOver = getBestOdds(event?.markets?.totals, "over");
  const bestTotalsUnder = getBestOdds(event?.markets?.totals, "under");

  const hasOdds = bestMoneylineHome || bestSpreadHome || bestTotalsOver;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/8 transition">
      {/* Main Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 mt-12">
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
              <div className="text-white font-semibold text-lg">
                {game.teams.away}
              </div>
              <div className="text-gray-400 text-sm">@</div>
              <div className="text-white font-semibold text-lg">
                {game.teams.home}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-start gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
              title="View details"
            >
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={handleRemove}
              disabled={removing}
              className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition text-gray-400"
              title="Remove from watchlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Odds Preview */}
        {showOdds && !expanded && hasOdds && (
          <div className="pt-3 border-t border-white/10">
            <div className="grid grid-cols-3 gap-3 text-xs">
              {/* Moneyline */}
              {bestMoneylineHome && bestMoneylineAway && (
                <div>
                  <div className="text-gray-500 mb-1">ML</div>
                  <div className="space-y-0.5">
                    <div className="text-gray-300">
                      {bestMoneylineAway > 0 ? "+" : ""}
                      {bestMoneylineAway}
                    </div>
                    <div className="text-gray-300">
                      {bestMoneylineHome > 0 ? "+" : ""}
                      {bestMoneylineHome}
                    </div>
                  </div>
                </div>
              )}

              {/* Spread */}
              {bestSpreadHome && bestSpreadAway && (
                <div>
                  <div className="text-gray-500 mb-1">Spread</div>
                  <div className="text-yellow-400">
                    {/* Show spread line if available */}
                    {event?.markets?.spreads &&
                      Object.values(event.markets.spreads)[0]?.odds?.home
                        ?.point}
                  </div>
                </div>
              )}

              {/* Total */}
              {bestTotalsOver && bestTotalsUnder && (
                <div>
                  <div className="text-gray-500 mb-1">Total</div>
                  <div className="text-yellow-400">
                    {/* Show total line if available */}
                    {event?.markets?.totals &&
                      Object.values(event.markets.totals)[0]?.odds?.over?.point}
                  </div>
                </div>
              )}
            </div>

            {oddsLoading && (
              <div className="text-xs text-gray-500 mt-2">
                Loading live odds...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded Odds View */}
      {expanded && showOdds && hasOdds && (
        <div className="px-4 pb-4 pt-2 border-t border-white/10 space-y-4">
          <div className="text-sm font-semibold text-gray-400">
            Live Odds from All Books
          </div>

          {/* Moneyline */}
          {bestMoneylineHome && bestMoneylineAway && (
            <div>
              <div className="text-xs text-gray-500 mb-2 font-semibold">
                Moneyline
              </div>
              <MoneylineDisplay
                homeOdds={
                  bestMoneylineHome
                    ? { priceAmerican: bestMoneylineHome }
                    : undefined
                }
                awayOdds={
                  bestMoneylineAway
                    ? { priceAmerican: bestMoneylineAway }
                    : undefined
                }
                homeTeam={game.teams.home}
                awayTeam={game.teams.away}
              />
            </div>
          )}

          {/* Spread */}
          {bestSpreadHome && bestSpreadAway && (
            <div>
              <div className="text-xs text-gray-500 mb-2 font-semibold">
                Spread
              </div>
              <SpreadDisplay
                homeOdds={
                  bestSpreadHome ? { priceAmerican: bestSpreadHome } : undefined
                }
                awayOdds={
                  bestSpreadAway ? { priceAmerican: bestSpreadAway } : undefined
                }
                homeTeam={game.teams.home}
                awayTeam={game.teams.away}
              />
            </div>
          )}

          {/* Totals */}
          {bestTotalsOver && bestTotalsUnder && (
            <div>
              <div className="text-xs text-gray-500 mb-2 font-semibold">
                Total
              </div>
              <TotalsDisplay
                overOdds={
                  bestTotalsOver ? { priceAmerican: bestTotalsOver } : undefined
                }
                underOdds={
                  bestTotalsUnder
                    ? { priceAmerican: bestTotalsUnder }
                    : undefined
                }
              />
            </div>
          )}

          <div className="text-xs text-gray-500 italic">
            Updates automatically • Best odds across all books
          </div>
        </div>
      )}
    </div>
  );
};

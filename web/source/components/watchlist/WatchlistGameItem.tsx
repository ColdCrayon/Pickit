/**
 * WatchlistGameItem Component - FIXED VERSION
 *
 * Displays a watchlisted game with live odds updates
 * Includes remove button and notification settings
 *
 * FIXES:
 * - Robust Timestamp/Date handling in formatEventTime
 * - Better error handling for malformed date objects
 * - Proper null/undefined checks
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
 * Handles both Date objects and Firestore Timestamps robustly
 */
function formatEventTime(startTime: Date | Timestamp | any): string {
  try {
    // Handle null/undefined
    if (!startTime) {
      console.warn("[WatchlistGameItem] startTime is null/undefined");
      return "Unknown";
    }

    // Convert to Date if it's a Timestamp
    let date: Date;

    if (startTime instanceof Timestamp) {
      date = startTime.toDate();
    } else if (startTime instanceof Date) {
      date = startTime;
    } else if (
      typeof startTime === "object" &&
      typeof startTime.toDate === "function"
    ) {
      // Handle Timestamp-like objects (Firestore Timestamp proxies)
      date = startTime.toDate();
    } else if (typeof startTime === "string" || typeof startTime === "number") {
      // Handle string/number timestamps as fallback
      date = new Date(startTime);
    } else if (typeof startTime === "object" && startTime.seconds) {
      // Handle raw Firestore Timestamp format {seconds, nanoseconds}
      date = new Date(startTime.seconds * 1000);
    } else {
      console.error("[WatchlistGameItem] Invalid startTime format:", startTime);
      return "Unknown";
    }

    // Validate the date
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
        return `Starts in ${diffMins}m`;
      }
      return `Starts in ${diffHours}h`;
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
    if (odds && (best === undefined || odds > best)) {
      best = odds;
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Fetch live odds for this event
  const { event, loading: oddsLoading } = useEventOdds(game.id);

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

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // TODO: Implement notification toggle in Firestore
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Notifications Toggle */}
          <button
            onClick={toggleNotifications}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition"
            title={
              notificationsEnabled
                ? "Disable notifications"
                : "Enable notifications"
            }
          >
            {notificationsEnabled ? (
              <Bell className="w-4 h-4 text-yellow-400" />
            ) : (
              <BellOff className="w-4 h-4 text-gray-400" />
            )}
          </button>

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
      </div>

      {/* Odds Display */}
      {showOdds && event?.markets && (
        <div className="pt-3 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
            <span>Live Odds</span>
            {oddsLoading && (
              <span className="ml-2 text-yellow-400 animate-pulse">●</span>
            )}
          </div>

          {/* Moneyline */}
          {event.markets.h2h && (
            <div>
              <div className="text-xs text-gray-500 mb-1 font-semibold">
                Moneyline
              </div>
              <MoneylineDisplay
                homeOdds={
                  getBestOdds(event.markets.h2h, "home")
                    ? { priceAmerican: getBestOdds(event.markets.h2h, "home")! }
                    : undefined
                }
                awayOdds={
                  getBestOdds(event.markets.h2h, "away")
                    ? { priceAmerican: getBestOdds(event.markets.h2h, "away")! }
                    : undefined
                }
                homeTeam={game.teams.home}
                awayTeam={game.teams.away}
              />
            </div>
          )}

          {/* Spread */}
          {event.markets.spreads && (
            <div>
              <div className="text-xs text-gray-500 mb-1 font-semibold">
                Spread
              </div>
              <SpreadDisplay
                homeOdds={
                  getBestOdds(event.markets.spreads, "home")
                    ? {
                        priceAmerican: getBestOdds(
                          event.markets.spreads,
                          "home"
                        )!,
                        point: 0, // TODO: Get actual point from market data
                      }
                    : undefined
                }
                awayOdds={
                  getBestOdds(event.markets.spreads, "away")
                    ? {
                        priceAmerican: getBestOdds(
                          event.markets.spreads,
                          "away"
                        )!,
                        point: 0, // TODO: Get actual point from market data
                      }
                    : undefined
                }
                homeTeam={game.teams.home}
                awayTeam={game.teams.away}
              />
            </div>
          )}

          {/* Totals */}
          {event.markets.totals && (
            <div>
              <div className="text-xs text-gray-500 mb-1 font-semibold">
                Total
              </div>
              <TotalsDisplay
                overOdds={
                  getBestOdds(event.markets.totals, "over")
                    ? {
                        priceAmerican: getBestOdds(
                          event.markets.totals,
                          "over"
                        )!,
                        point: 0, // TODO: Get actual point from market data
                      }
                    : undefined
                }
                underOdds={
                  getBestOdds(event.markets.totals, "under")
                    ? {
                        priceAmerican: getBestOdds(
                          event.markets.totals,
                          "under"
                        )!,
                        point: 0, // TODO: Get actual point from market data
                      }
                    : undefined
                }
              />
            </div>
          )}
        </div>
      )}

      {/* No Odds Available */}
      {showOdds && !event?.markets && !oddsLoading && (
        <div className="pt-3 border-t border-white/10 text-center text-sm text-gray-500">
          No odds available
        </div>
      )}
    </div>
  );
};

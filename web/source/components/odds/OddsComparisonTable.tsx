/**
 * OddsComparisonTable Component
 *
 * Displays a comprehensive comparison of odds across multiple sportsbooks
 * for a given event and market type.
 */

import React, { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useEventOdds, useBestOdds } from "../../hooks/useEventOdds";
import { EventMarketType, OddsEntry } from "../../types/events";

interface OddsComparisonTableProps {
  eventId: string;
  marketType?: EventMarketType;
  className?: string;
}

// Sportsbook display names
const BOOK_NAMES: Record<string, string> = {
  draftkings: "DraftKings",
  fanduel: "FanDuel",
  betmgm: "BetMGM",
  caesars: "Caesars",
  pointsbet: "PointsBet",
  barstool: "Barstool",
  wynnbet: "WynnBet",
  unibet: "Unibet",
};

const formatOdds = (
  odds?: OddsEntry,
  format: "american" | "decimal" = "american"
): string => {
  if (!odds) return "-";

  if (format === "american") {
    const value = odds.priceAmerican;
    if (value === undefined) return "-";
    return value > 0 ? `+${value}` : `${value}`;
  } else {
    const value = odds.priceDecimal;
    if (value === undefined) return "-";
    return value.toFixed(2);
  }
};

const calculateValueDiff = (
  odds?: OddsEntry,
  bestOdds?: OddsEntry
): number | null => {
  if (!odds?.priceDecimal || !bestOdds?.priceDecimal) return null;
  return (
    ((odds.priceDecimal - bestOdds.priceDecimal) / bestOdds.priceDecimal) * 100
  );
};

export const OddsComparisonTable: React.FC<OddsComparisonTableProps> = ({
  eventId,
  marketType = "h2h",
  className = "",
}) => {
  const [oddsFormat, setOddsFormat] = useState<"american" | "decimal">(
    "american"
  );
  const { event, loading, error } = useEventOdds(eventId);
  const { bestOdds } = useBestOdds(eventId, marketType);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Unable to load odds comparison</p>
      </div>
    );
  }

  const marketOdds = event.markets?.[marketType];
  if (!marketOdds || Object.keys(marketOdds).length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No odds available for this market</p>
      </div>
    );
  }

  // Get all outcomes (home, away, over, under, etc.)
  const firstBook = Object.values(marketOdds)[0];
  const outcomes = firstBook ? Object.keys(firstBook.odds) : [];

  return (
    <div
      className={`bg-white/5 border border-white/10 rounded-2xl overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Odds Comparison</h3>
          <p className="text-sm text-gray-400">
            {event.teams.away} @ {event.teams.home}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setOddsFormat(oddsFormat === "american" ? "decimal" : "american")
            }
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition"
          >
            {oddsFormat === "american" ? "American" : "Decimal"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Sportsbook
              </th>
              {outcomes.map((outcome) => (
                <th
                  key={outcome}
                  className="px-4 py-3 text-center text-sm font-semibold capitalize"
                >
                  {outcome}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(marketOdds).map(([bookId, bookData]) => {
              const bookName = BOOK_NAMES[bookId] || bookId;

              return (
                <tr
                  key={bookId}
                  className="border-t border-white/5 hover:bg-white/5 transition"
                >
                  <td className="px-4 py-3 font-medium">{bookName}</td>
                  {outcomes.map((outcome) => {
                    const odds = bookData.odds[outcome];
                    const best = bestOdds?.[outcome];
                    const isBest =
                      best &&
                      odds &&
                      (odds.priceDecimal === best.priceDecimal ||
                        odds.priceAmerican === best.priceAmerican);
                    const valueDiff = calculateValueDiff(odds, best);

                    return (
                      <td key={outcome} className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className={`font-mono ${
                              isBest ? "text-yellow-400 font-bold" : ""
                            }`}
                          >
                            {formatOdds(odds, oddsFormat)}
                            {odds?.point !== undefined && (
                              <span className="text-xs ml-1">
                                ({odds.point > 0 ? "+" : ""}
                                {odds.point})
                              </span>
                            )}
                          </div>
                          {valueDiff !== null && Math.abs(valueDiff) > 0.5 && (
                            <div
                              className={`flex items-center gap-1 text-xs ${
                                valueDiff > 0
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {valueDiff > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              <span>{Math.abs(valueDiff).toFixed(1)}%</span>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <DollarSign className="w-4 h-4 text-yellow-400" />
          <span>Yellow highlights indicate best available odds</span>
        </div>
      </div>
    </div>
  );
};

export default OddsComparisonTable;

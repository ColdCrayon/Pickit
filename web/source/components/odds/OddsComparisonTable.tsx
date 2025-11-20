/**
 * OddsComparisonTable Component
 *
 * Displays a comprehensive comparison of odds across multiple sportsbooks
 * for a given event and market type.
 */

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useEventOdds, useBestOdds } from "../../hooks/useEventOdds";
import { EventMarketType, OddsEntry } from "../../types/events";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/Card";
import { Button } from "../ui/Button";

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
  betonlineag: "betonlineag",
  betrivers: "betrivers",
  betus: "betus",
  bovada: "bovada",
  lowvig: "lowvig",
  mybookieag: "mybookieag",
};

const formatOdds = (
  odds?: OddsEntry,
  format: "american" | "decimal" = "american"
): string => {
  if (!odds) return "-";

  if (format === "american") {
    // Try to get american odds, or convert from decimal
    let americanValue = odds.priceAmerican;

    if (americanValue === undefined && odds.priceDecimal !== undefined) {
      // Convert decimal to american
      const decimal = odds.priceDecimal;
      if (decimal >= 2.0) {
        americanValue = Math.round((decimal - 1) * 100);
      } else {
        americanValue = Math.round(-100 / (decimal - 1));
      }
    }

    if (americanValue === undefined) return "-";
    return americanValue > 0 ? `+${americanValue}` : `${americanValue}`;
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

  // Debug logging
  useEffect(() => {
    if (event?.markets) {
      console.log("[OddsComparisonTable] Event markets:", event.markets);
      console.log("[OddsComparisonTable] Market type requested:", marketType);
    }
  }, [event, marketType]);

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

  // Also check alternate market key names (moneyline vs h2h, spread vs spreads)
  const alternateMarketType =
    marketType === "h2h"
      ? "moneyline"
      : marketType === "spreads"
        ? "spread"
        : marketType;

  const actualMarketOdds = marketOdds || (event.markets as any)?.[alternateMarketType];

  if (!actualMarketOdds || Object.keys(actualMarketOdds).length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No odds available for this market</p>
      </div>
    );
  }

  // Get all outcomes (home, away, over, under, etc.)
  const firstBook = Object.values(actualMarketOdds)[0] as any;
  const outcomes = firstBook ? Object.keys(firstBook.odds) : [];

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
        <div>
          <CardTitle className="text-lg">Odds Comparison</CardTitle>
          <CardDescription>
            {event.teams.away} @ {event.teams.home}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setOddsFormat(oddsFormat === "american" ? "decimal" : "american")
            }
          >
            {oddsFormat === "american" ? "American" : "Decimal"}
          </Button>
        </div>
      </CardHeader>

      {/* Table */}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Sportsbook
                </th>
                {outcomes.map((outcome: string) => (
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
              {Object.entries(actualMarketOdds).map(([bookId, bookData]: [string, any]) => {
                const bookName = BOOK_NAMES[bookId] || bookId;

                return (
                  <tr
                    key={bookId}
                    className="border-t border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="px-4 py-3 font-medium">{bookName}</td>
                    {outcomes.map((outcome: string) => {
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
                              className={`font-mono ${isBest ? "text-yellow-400 font-bold" : ""
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
                                className={`flex items-center gap-1 text-xs ${valueDiff > 0
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
      </CardContent>

      {/* Footer */}
      <CardFooter className="border-t border-white/10 bg-white/5 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <DollarSign className="w-4 h-4 text-yellow-400" />
          <span>Yellow highlights indicate best available odds</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default OddsComparisonTable;

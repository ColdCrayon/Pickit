/**
 * OddsDisplay Component
 *
 * Reusable component to display odds in American or Decimal format
 * Supports moneyline, spread, and totals display
 */

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { OddsEntry } from "../../types/events";

interface OddsDisplayProps {
  odds?: OddsEntry;
  label?: string;
  format?: "american" | "decimal";
  showPoint?: boolean;
  highlight?: boolean;
  isBest?: boolean;
  className?: string;
}

/**
 * Format American odds with + or - sign
 */
function formatAmericanOdds(odds: number): string {
  if (odds > 0) return `+${odds}`;
  return odds.toString();
}

/**
 * Format Decimal odds to 2 decimal places
 */
function formatDecimalOdds(odds: number): string {
  return odds.toFixed(2);
}

/**
 * Display a single odds entry with optional label and formatting
 */
export const OddsDisplay: React.FC<OddsDisplayProps> = ({
  odds,
  label,
  format = "american",
  showPoint = false,
  highlight = false,
  isBest = false,
  className = "",
}) => {
  if (!odds) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        {label && <span className="mr-1">{label}:</span>}
        <span>N/A</span>
      </div>
    );
  }

  const price =
    format === "american"
      ? odds.priceAmerican
      : odds.priceDecimal || odds.priceAmerican;

  if (price === undefined) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        {label && <span className="mr-1">{label}:</span>}
        <span>N/A</span>
      </div>
    );
  }

  const formattedPrice =
    format === "american"
      ? formatAmericanOdds(price)
      : formatDecimalOdds(price);

  const pointDisplay =
    showPoint && odds.point !== undefined ? odds.point : null;

  return (
    <div
      className={`flex items-center gap-1 text-sm ${
        highlight ? "font-semibold" : ""
      } ${isBest ? "text-green-400" : "text-white"} ${className}`}
    >
      {label && <span className="text-gray-400">{label}:</span>}

      {pointDisplay !== null && (
        <span className="text-yellow-400 font-semibold">
          {pointDisplay > 0 ? `+${pointDisplay}` : pointDisplay}
        </span>
      )}

      <span>{formattedPrice}</span>

      {isBest && <TrendingUp className="w-3 h-3 text-green-400" />}
    </div>
  );
};

interface MoneylineDisplayProps {
  homeOdds?: OddsEntry;
  awayOdds?: OddsEntry;
  homeTeam: string;
  awayTeam: string;
  format?: "american" | "decimal";
  bestHome?: boolean;
  bestAway?: boolean;
}

/**
 * Display moneyline odds for both teams
 */
export const MoneylineDisplay: React.FC<MoneylineDisplayProps> = ({
  homeOdds,
  awayOdds,
  homeTeam,
  awayTeam,
  format = "american",
  bestHome = false,
  bestAway = false,
}) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">{homeTeam}</span>
        <OddsDisplay odds={homeOdds} format={format} isBest={bestHome} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">{awayTeam}</span>
        <OddsDisplay odds={awayOdds} format={format} isBest={bestAway} />
      </div>
    </div>
  );
};

interface SpreadDisplayProps {
  homeOdds?: OddsEntry;
  awayOdds?: OddsEntry;
  homeTeam: string;
  awayTeam: string;
  format?: "american" | "decimal";
  bestHome?: boolean;
  bestAway?: boolean;
}

/**
 * Display spread odds for both teams with point spreads
 */
export const SpreadDisplay: React.FC<SpreadDisplayProps> = ({
  homeOdds,
  awayOdds,
  homeTeam,
  awayTeam,
  format = "american",
  bestHome = false,
  bestAway = false,
}) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">{homeTeam}</span>
        <OddsDisplay
          odds={homeOdds}
          format={format}
          showPoint
          isBest={bestHome}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">{awayTeam}</span>
        <OddsDisplay
          odds={awayOdds}
          format={format}
          showPoint
          isBest={bestAway}
        />
      </div>
    </div>
  );
};

interface TotalsDisplayProps {
  overOdds?: OddsEntry;
  underOdds?: OddsEntry;
  format?: "american" | "decimal";
  bestOver?: boolean;
  bestUnder?: boolean;
}

/**
 * Display totals (over/under) odds with line
 */
export const TotalsDisplay: React.FC<TotalsDisplayProps> = ({
  overOdds,
  underOdds,
  format = "american",
  bestOver = false,
  bestUnder = false,
}) => {
  const line = overOdds?.point || underOdds?.point;

  return (
    <div className="space-y-1">
      {line !== undefined && (
        <div className="text-center text-xs text-gray-400 mb-1">
          Line: {line}
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">Over</span>
        <OddsDisplay odds={overOdds} format={format} isBest={bestOver} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">Under</span>
        <OddsDisplay odds={underOdds} format={format} isBest={bestUnder} />
      </div>
    </div>
  );
};

interface OddsChangeIndicatorProps {
  change: number; // Percentage change
  className?: string;
}

/**
 * Display odds change indicator (up/down arrow with percentage)
 */
export const OddsChangeIndicator: React.FC<OddsChangeIndicatorProps> = ({
  change,
  className = "",
}) => {
  if (change === 0) return null;

  const isPositive = change > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const color = isPositive ? "text-green-400" : "text-red-400";

  return (
    <div className={`flex items-center gap-1 ${color} ${className}`}>
      <Icon className="w-3 h-3" />
      <span className="text-xs">
        {isPositive ? "+" : ""}
        {change.toFixed(1)}%
      </span>
    </div>
  );
};

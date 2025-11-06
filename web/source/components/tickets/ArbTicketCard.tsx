import React from "react";
import { Percent, Calendar, TrendingUp } from "lucide-react";
import { ArbTicket } from "../../types/picks";
import { Timestamp } from "firebase/firestore";

const fmtDate = (v: any) => {
  if (!v) return "";

  // Normalize value to a JS Date
  let d: Date | null = null;
  if (v instanceof Date) d = v;
  else if (v instanceof Timestamp) d = v.toDate();
  else if (typeof v === "object" && typeof v.seconds === "number") {
    d = new Date(v.seconds * 1000 + Math.floor((v.nanoseconds ?? 0) / 1e6));
  } else if (typeof v === "string") {
    const guess = new Date(v);
    if (!isNaN(guess.getTime())) d = guess;
    else return v;
  }
  if (!d) return "";

  const datePart = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${datePart} at ${timePart}`;
};

const ArbTicketCard: React.FC<{ t: ArbTicket }> = ({ t }) => {
  // Determine the title - prefer eventId, fall back to marketId or a default
  const ticketTitle = t.eventId || t.marketId || "Arbitrage Opportunity";
  
  // Format the margin percentage
  const marginDisplay = typeof t.margin === "number" 
    ? `${(t.margin * 100).toFixed(2)}%` 
    : "N/A";
  
  const isPositiveMargin = typeof t.margin === "number" && t.margin >= 0;

  return (
    <div className="relative rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-white/20 transition-all">
      {/* Header Section */}
      <div className="p-4 bg-black/20 border-b border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white leading-tight mb-1">
              {ticketTitle}
            </h3>
            {t.league && (
              <div className="inline-block px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wide">
                {t.league}
              </div>
            )}
          </div>
          
          {/* Margin Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
            isPositiveMargin 
              ? "bg-green-500/10 border border-green-400/30" 
              : "bg-red-500/10 border border-red-400/30"
          }`}>
            <TrendingUp className={`w-4 h-4 ${isPositiveMargin ? "text-green-300" : "text-red-300"}`} />
            <span className={`text-sm font-bold ${isPositiveMargin ? "text-green-300" : "text-red-300"}`}>
              {marginDisplay}
            </span>
          </div>
        </div>
      </div>

      {/* Legs Section */}
      <div className="p-4">
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          {t.legs?.map((leg, i) => (
            <div 
              key={i} 
              className="rounded-xl border border-white/10 bg-gradient-to-br from-black/40 to-black/20 p-3 hover:border-white/20 transition-colors"
            >
              {/* Sportsbook Name */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-yellow-400">
                  {leg.bookId}
                </span>
                {typeof leg.stakePct === "number" && (
                  <span className="text-xs text-gray-400 font-medium">
                    {(leg.stakePct * 100).toFixed(0)}% stake
                  </span>
                )}
              </div>
              
              {/* Outcome and Odds */}
              <div className="space-y-1">
                <div className="text-sm text-gray-200 font-medium capitalize">
                  {leg.outcome}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Odds:</span>
                  <span className="text-base font-bold text-white">
                    {leg.priceDecimal}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show message if there are more than 4 legs */}
        {t.legs && t.legs.length > 4 && (
          <div className="text-xs text-gray-400 text-center mb-3">
            + {t.legs.length - 4} more leg{t.legs.length - 4 > 1 ? 's' : ''}
          </div>
        )}

        {/* Footer with timestamp and status */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{fmtDate(t.createdAt || t.pickPublishDate)}</span>
          </div>
          
          {t.serverSettled && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 border border-green-400/30">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              <span className="text-xs font-semibold text-green-300">Settled</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArbTicketCard;

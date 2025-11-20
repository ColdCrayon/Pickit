import React from "react";
import { Percent, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { ArbTicket } from "../../types/picks";
import { Timestamp } from "firebase/firestore";
import { SaveTicketButton } from "./SaveTicketButton";
import { useEventOdds } from "../../hooks/useEventOdds";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";

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
  // Fetch event details to get team names
  const { event, loading } = useEventOdds(t.eventId);

  // Determine the title
  const ticketTitle = loading
    ? "Loading Event..."
    : event && event.teams?.away && event.teams?.home
      ? `${event.teams.away} @ ${event.teams.home}`
      : t.eventId || t.marketId || "Arbitrage Opportunity";

  return (
    <Card className="glass-card overflow-hidden group">
      {/* Header Section */}
      <div className="p-5 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-lg text-white group-hover:text-glow transition-all leading-tight">
            {ticketTitle}
          </h3>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            {t.marketId || "Moneyline"}
          </span>
        </div>

        {/* Right side: Margin + Save Button */}
        <div className="flex items-center gap-3 shrink-0">
          {typeof t.margin === "number" && (
            <Badge
              variant={t.margin >= 0 ? "success" : "destructive"}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-bold shadow-[0_0_10px_rgba(74,222,128,0.2)]"
            >
              <Percent className="w-3.5 h-3.5" />
              {(t.margin * 100).toFixed(2)}%
            </Badge>
          )}

          <SaveTicketButton ticketId={t.id} ticketType="arb" />
        </div>
      </div>

      {/* Legs Section */}
      <CardContent className="p-4 pt-2">
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          {t.legs?.map((leg, i) => (
            <div
              key={i}
              className="relative rounded-xl border border-white/5 bg-black/40 p-3 hover:border-white/20 transition-all group/leg overflow-hidden"
            >
              {/* Liquid hover effect background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/leg:opacity-100 transition-opacity duration-500" />

              {/* Sportsbook Name */}
              <div className="relative flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-yellow-400 group-hover/leg:text-yellow-300 transition-colors">
                  {leg.bookId}
                </span>
                {typeof leg.stakePct === "number" && (
                  <span className="text-xs text-gray-400 font-medium">
                    {(leg.stakePct * 100).toFixed(0)}% stake
                  </span>
                )}
              </div>

              {/* Outcome and Odds */}
              <div className="relative space-y-1">
                <div className="text-sm text-gray-200 font-medium capitalize">
                  {leg.outcome}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Odds:</span>
                  <span className="text-base font-bold text-white font-mono">
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
            + {t.legs.length - 4} more leg{t.legs.length - 4 > 1 ? "s" : ""}
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
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs font-semibold text-green-300">
                Settled
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ArbTicketCard;

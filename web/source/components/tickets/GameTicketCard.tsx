import React from "react";
import { GameTicket } from "../../types/picks";
import { Calendar, TrendingUp, ExternalLink, DollarSign } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { SaveTicketButton } from "./SaveTicketButton";
import { formatPickDate } from "../../lib/utils";

const fmtDate = (v: any) => {
  if (!v) return "";

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

// Convert American odds to decimal for display
const americanToDecimal = (odds: number): string => {
  if (odds > 0) {
    return (odds / 100 + 1).toFixed(2);
  } else {
    return (100 / Math.abs(odds) + 1).toFixed(2);
  }
};

interface GameTicketCardProps {
  ticket: GameTicket;
}

const GameTicketCard: React.FC<GameTicketCardProps> = ({ ticket }) => {
  // Determine which fields to use (support both old and new field names)
  const team = ticket.selectionTeam || ticket.pickTeam || "Team TBD";
  const description = ticket.description || ticket.pickDescription || "";
  const sportsbook = ticket.sportsbook || ticket.pickSportsbook || "Sportsbook";
  //const league = ticket.league || "League";
  const pickType = ticket.pickType || ticket.market || "Pick";
  const side = ticket.selectionSide || "";
  const odds = ticket.oddsAmerican || 0;
  const externalUrl = ticket.externalUrl;
  const publishDate = ticket.createdAt;

  // A ticket is "settled" if it has an updatedAt timestamp
  const isSettled = !!ticket.updatedAt;

  return (
    <div className="relative rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-white/20 transition-all">
      {/* Header Section */}
      <div className="p-4 bg-black/20 border-b border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div className="font-semibold">{ticket.pickGameInfo}</div>

          {/* Right side: Date + Save Button */}
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-400">
              {formatPickDate(ticket.pickPublishDate)}
            </div>

            {/* NEW: Save Button */}
            <SaveTicketButton ticketId={ticket.id} ticketType="game" />
          </div>

          {/* Odds Display */}
          {odds !== 0 && (
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-0.5">Odds</div>
              <div className="text-lg font-bold text-yellow-400">
                {odds > 0 ? "+" : ""}
                {odds}
              </div>
              <div className="text-xs text-gray-500">
                ({americanToDecimal(odds)})
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Description */}
        {description && (
          <div className="mb-4">
            <p className="text-sm text-gray-300 leading-relaxed">
              {description}
            </p>
          </div>
        )}

        {/* Sportsbook and Link */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/10">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-white">
              {sportsbook}
            </span>
          </div>

          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-400/30 text-yellow-300 hover:bg-yellow-500/20 transition-colors text-xs font-semibold"
            >
              <span>View Bet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Footer with timestamp and status */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{fmtDate(publishDate)}</span>
          </div>

          {isSettled && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 border border-green-400/30">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              <span className="text-xs font-semibold text-green-300">
                Settled
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameTicketCard;

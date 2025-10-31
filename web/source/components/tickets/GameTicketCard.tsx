import React from "react";
import { GameTicket } from "../../types/picks";
import { formatPickDate } from "../../lib";

interface GameTicketCardProps {
  ticket: GameTicket;
}

const GameTicketCard: React.FC<GameTicketCardProps> = ({ ticket }) => {
  return (
    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{ticket.pickGameInfo}</div>
        <div className="text-xs text-gray-400">{formatPickDate(ticket.pickPublishDate)}</div>
      </div>
      <p className="text-yellow-400 text-sm mt-1">{ticket.pickTeam} ({ticket.pickType})</p>
      <p className="text-gray-300 text-sm mt-1">{ticket.pickDescription}</p>
      <div className="text-xs text-gray-400 mt-2">{ticket.pickSportsbook}</div>
    </div>
  );
};

export default GameTicketCard;

/**
 * web/source/components/tickets/UserTicketCard.tsx
 *
 * NEW FOR WEEK 1: Display a saved ticket with notification status
 */

import React from "react";
import { Link } from "react-router-dom";
import { Star, Bell, TrendingUp, Calendar, ExternalLink } from "lucide-react";
import { UserTicket } from "../../lib/converters";
import { formatRelativeDate } from "../../lib/utils";

interface UserTicketCardProps {
  userTicket: UserTicket;
  onUnsave?: (ticketId: string) => void;
}

/**
 * Card component for displaying a saved ticket
 * Shows ticket type, saved date, and notification status
 */
export const UserTicketCard: React.FC<UserTicketCardProps> = ({
  userTicket,
  onUnsave,
}) => {
  const ticketLink =
    userTicket.ticketType === "arb"
      ? `/arbitrage/${userTicket.ticketId}`
      : `/picks/${userTicket.ticketId}`;

  const handleUnsave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onUnsave) {
      onUnsave(userTicket.ticketId);
    }
  };

  return (
    <Link
      to={ticketLink}
      className="block bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {userTicket.ticketType === "arb" ? (
            <TrendingUp className="w-5 h-5 text-green-400" />
          ) : (
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          )}
          <h3 className="font-semibold text-white">
            {userTicket.ticketType === "arb"
              ? "Arbitrage Opportunity"
              : "Game Pick"}
          </h3>
        </div>

        {/* Notification badge */}
        {userTicket.notificationSent && (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-full">
            <Bell className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-blue-400">Notified</span>
          </div>
        )}
      </div>

      {/* Ticket ID */}
      <div className="mb-3">
        <p className="text-sm text-gray-400 font-mono">
          ID: {userTicket.ticketId.slice(0, 12)}...
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        {/* Saved date */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Saved {formatRelativeDate(userTicket.savedAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUnsave}
            className="px-3 py-1 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
          >
            Unsave
          </button>
          <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-yellow-400 transition" />
        </div>
      </div>
    </Link>
  );
};

export default UserTicketCard;

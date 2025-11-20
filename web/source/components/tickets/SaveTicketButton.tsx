/**
 * web/source/components/tickets/SaveTicketButton.tsx
 *
 * NEW FOR WEEK 1: Button to save/unsave tickets
 * Can be added to ArbTicketCard and GameTicketCard components
 */

import React, { useState } from "react";
import { Star } from "lucide-react";
import { useUserTickets } from "../../hooks/useUserTickets";
import { useAuth } from "../../hooks/useAuth";

interface SaveTicketButtonProps {
  ticketId: string;
  ticketType: "arb" | "game";
  className?: string;
}

/**
 * Button to save/unsave a ticket
 *
 * Usage:
 * ```tsx
 * <SaveTicketButton ticketId={ticket.id} ticketType="arb" />
 * ```
 */
export const SaveTicketButton: React.FC<SaveTicketButtonProps> = ({
  ticketId,
  ticketType,
  className = "",
}) => {
  const { user } = useAuth();
  const { saveTicket, unsaveTicket, isSaved } = useUserTickets();
  const [loading, setLoading] = useState(false);
  const saved = isSaved(ticketId);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click if button is inside a clickable card

    if (!user) {
      alert("Please sign in to save tickets");
      return;
    }

    setLoading(true);

    try {
      if (saved) {
        await unsaveTicket(ticketId);
      } else {
        await saveTicket(ticketId, ticketType);
      }
    } catch (error) {
      console.error("Error toggling save state:", error);
      alert("Failed to save ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || !user}
      className={`
        flex items-center justify-center gap-2 px-4 py-2 rounded-lg
        transition-all duration-300 font-medium
        ${saved
          ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.1)]"
          : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5 hover:border-white/10"
        }
        ${loading ? "opacity-50 cursor-not-allowed" : ""}
        ${!user ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      title={saved ? "Unsave ticket" : "Save ticket"}
    >
      <Star className={`w-4 h-4 ${saved ? "fill-yellow-400" : ""}`} />
      <span className="text-sm">
        {loading ? "..." : saved ? "Saved" : "Save"}
      </span>
    </button>
  );
};

export default SaveTicketButton;

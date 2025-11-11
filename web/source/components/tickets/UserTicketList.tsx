/**
 * web/source/components/tickets/UserTicketList.tsx
 *
 * NEW FOR WEEK 1: List component for displaying all saved tickets
 */

import React, { useState } from "react";
import { Star, TrendingUp, Filter } from "lucide-react";
import { useUserTickets } from "../../hooks/useUserTickets";
import { UserTicketCard } from "./UserTicketCard";

type FilterType = "all" | "arb" | "game";

/**
 * List component for displaying user's saved tickets
 * Includes filtering by ticket type
 */
export const UserTicketList: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>("all");
  const { tickets, loading, error, unsaveTicket } = useUserTickets(
    filter === "all" ? undefined : filter
  );

  const handleUnsave = async (ticketId: string) => {
    if (confirm("Are you sure you want to unsave this ticket?")) {
      try {
        await unsaveTicket(ticketId);
      } catch (error) {
        console.error("Error unsaving ticket:", error);
        alert("Failed to unsave ticket");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
        <p className="text-red-400">Error loading tickets: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-5 h-5 text-gray-400" />
        <button
          onClick={() => setFilter("all")}
          className={`
            px-4 py-2 rounded-lg font-medium transition
            ${
              filter === "all"
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }
          `}
        >
          All Tickets ({tickets.length})
        </button>
        <button
          onClick={() => setFilter("arb")}
          className={`
            px-4 py-2 rounded-lg font-medium transition flex items-center gap-2
            ${
              filter === "arb"
                ? "bg-green-500/20 text-green-400"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }
          `}
        >
          <TrendingUp className="w-4 h-4" />
          Arbitrage
        </button>
        <button
          onClick={() => setFilter("game")}
          className={`
            px-4 py-2 rounded-lg font-medium transition flex items-center gap-2
            ${
              filter === "game"
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }
          `}
        >
          <Star className="w-4 h-4" />
          Game Picks
        </button>
      </div>

      {/* Tickets list */}
      {tickets.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No saved tickets</h3>
          <p className="text-gray-400">
            {filter === "all"
              ? "Start saving tickets to track them here"
              : `No ${filter} tickets saved yet`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <UserTicketCard
              key={ticket.id}
              userTicket={ticket}
              onUnsave={handleUnsave}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserTicketList;

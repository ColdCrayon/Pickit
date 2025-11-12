/**
 * ViewAllTicketsButton.tsx
 *
 * Button that links to My Tickets page
 * Only shows when user has more than 1 saved ticket
 */

import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { useUserTickets } from "../../hooks/useUserTickets";

export const ViewAllTicketsButton: React.FC = () => {
  const { tickets, loading } = useUserTickets();

  // Don't show if loading or if user has 1 or fewer tickets
  if (loading || tickets.length <= 1) {
    return null;
  }

  return (
    <Link
      to="/my-tickets"
      className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-yellow-400/50 transition group"
    >
      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
      <span className="text-yellow-400 font-semibold group-hover:text-yellow-300 transition">
        View All {tickets.length} Saved Tickets
      </span>
      <ArrowRight className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300 group-hover:translate-x-1 transition-all" />
    </Link>
  );
};

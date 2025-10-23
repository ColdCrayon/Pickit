import React from "react";
import { Award } from "lucide-react";
import { useNflTickets } from "../../hooks/useNFLtickets";
import TicketCard from "./Ticketcard";

const NflTicketsSection: React.FC = () => {
  const { tickets, loading } = useNflTickets({ includeSettled: true, max: 20 });

  return (
    <section className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 mt-12">
      <div className="flex items-center gap-3 mb-6">
        <Award className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-semibold">NFL Tickets (Live Picks)</h2>
      </div>

      {loading ? (
        <div className="text-gray-400">Loading tickets…</div>
      ) : tickets.length === 0 ? (
        // <div className="text-gray-400">No tickets yet. Check back soon.</div>
        null
      ) : (
        <div className="grid gap-6">
          {tickets.map((t) => (
            <TicketCard key={t.id} t={t} />
          ))}
        </div>
      )}
    </section>
  );
};

export default NflTicketsSection;

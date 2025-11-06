import React from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { GameTicket } from "../../types/picks";

const TicketCard: React.FC<{ t: GameTicket }> = ({ t }) => {
  const dt = t.pickPublishDate ? new Date(t.pickPublishDate) : null;

  return (
    <div className="relative rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
      {/* Perforation */}
      <div className="absolute inset-y-0 left-28 hidden sm:block">
        <div className="h-full w-px border-l border-dashed border-white/20" />
      </div>

      {/* Stub */}
      <div className="sm:w-28 w-full sm:h-full sm:absolute sm:inset-y-0 sm:left-0 bg-black/20 border-r border-white/10 flex sm:flex-col flex-row items-center justify-center gap-2 p-4">
        <div className="text-xs text-gray-300 text-center leading-tight">
          {/*<div className="uppercase tracking-wider">{t.league ?? "NFL"}</div>*/}
          <div className="opacity-70">Pick</div>
          {t.updatedAt && (
            <div className="mt-1 inline-block px-2 py-0.5 rounded-full bg-green-500/10 border border-green-400/40 text-[10px] text-green-300">
              Settled
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="sm:ml-28 p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {/*{t.pickGameInfo}*/}
          </h3>
          <div className="text-right">
            <div className="text-sm text-gray-400">Sportsbook</div>
            <div className="text-base font-semibold">{t.pickSportsbook}</div>
          </div>
        </div>

        <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="w-4 h-4 text-yellow-400" />
            <span>
              {dt
                ? dt.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span>{dt ? dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</span>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4 flex flex-wrap items-center gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-gray-400">Team</div>
            <div className="text-base font-semibold">{t.pickTeam}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-gray-400">Type</div>
            <div className="text-base font-semibold">{t.pickType}</div>
          </div>
          <div className="ml-auto text-sm text-gray-300 max-w-full">
            <div className="text-[11px] uppercase tracking-wider text-gray-400">Description</div>
            <div className="text-sm">{t.pickDescription}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
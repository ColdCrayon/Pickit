import React from "react";
import { Percent } from "lucide-react";
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
    else return v; // leave already formatted strings unchanged
  }
  if (!d) return "";

  // Use words like “Sep 23, 2025 at 10:10 PM”
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
  return (
    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
      <div className="flex items-center justify-between">
        <div className="font-semibold">
          {t.eventId ?? t.marketId ?? "Event"}
        </div>
        {typeof t.margin === "number" && (
          <div className={`text-xs ${t.margin >= 0 ? "text-green-300" : "text-red-300"} flex items-center gap-1`}>
            <Percent className="w-3 h-3" />
            {(t.margin * 100).toFixed(2)}%
          </div>
        )}
      </div>

      <div className="mt-3 grid sm:grid-cols-2 gap-2">
        {t.legs?.slice(0, 4).map((leg, i) => (
          <div key={i} className="rounded-lg border border-white/10 bg-black/30 p-3">
            <div className="text-sm text-gray-200">{leg.bookId}</div>
            <div className="text-xs text-gray-400">
              {leg.outcome} @ {leg.priceDecimal}
              {typeof leg.stakePct === "number" && (
                <span className="ml-2 text-gray-500">
                  stake {(leg.stakePct * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-[11px] text-gray-400 mt-2">
        {fmtDate(t.createdAt ?? t.pickPublishDate)}
        {t.serverSettled && <span className="ml-2 text-green-300">• Settled</span>}
      </div>
    </div>
  );
};

export default ArbTicketCard;

import React from "react";
import { Link } from "react-router-dom";
import { Zap, TrendingUp, Percent } from "lucide-react";
import { ArbTicket, GameTicket } from "../../types/picks";
import { formatPickDate } from "../../lib";

type Props = {
  league: "NFL" | "NBA" | "MLB" | "NHL";
  arb: { data: ArbTicket[]; loading: boolean; error: string | null };
  game: { data: GameTicket[]; loading: boolean; error: string | null };
  seeAllTo: string;
};

const FreePicksSection: React.FC<Props> = ({ league, arb, game, seeAllTo }) => {
  return (
    <section className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold">{league} — Free Picks</h2>
        <Link to={seeAllTo} className="text-yellow-400 hover:underline text-sm">
          See all free picks
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Arbitrage */}
        <div className="p-6 rounded-2xl border border-white/10 bg-black/10">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold">Arbitrage </h3>
          </div>

          {arb.loading ? (
            <p className="text-gray-400 text-sm">Loading…</p>
          ) : arb.error ? (
            <p className="text-red-400 text-sm">{arb.error}</p>
          ) : arb.data.length === 0 ? (
            <p className="text-gray-400 text-sm">No free arbitrage picks yet.</p>
          ) : (
            <div className="space-y-4">
              {arb.data.map((a) => (
                <div key={a.id} className="p-4 rounded-xl border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{a.eventId ?? a.marketId ?? "Event"}</div>
                    {typeof a.margin === "number" && (
                      <div className="flex items-center gap-1 text-xs text-green-300">
                        <Percent className="w-3 h-3" />
                        {(a.margin * 100).toFixed(2)}% edge
                      </div>
                    )}
                  </div>

                  {/* Legs */}
                  <div className="mt-3 grid sm:grid-cols-2 gap-2">
                    {a.legs?.slice(0, 4).map((leg, idx) => (
                      <div key={idx} className="text-sm rounded-lg border border-white/10 bg-black/30 p-3">
                        <div className="text-gray-300 font-medium">{leg.bookId}</div>
                        <div className="text-xs text-gray-400">
                          {leg.outcome} @ {leg.priceDecimal}
                          {typeof leg.stakePct === "number" && (
                            <span className="ml-2 text-gray-500">stake {(leg.stakePct * 100).toFixed(0)}%</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dates */}
                  <div className="text-xs text-gray-400 mt-2">
                    <span>Created: {formatPickDate(a.createdAt ?? a.pickPublishDate)}</span>
                    {a.settleDate && <span className="ml-2">• Settled: {formatPickDate(a.settleDate)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Game picks (settled) */}
        <div className="p-6 rounded-2xl border border-white/10 bg-black/10">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold">Game Picks </h3>
          </div>

          {game.loading ? (
            <p className="text-gray-400 text-sm">Loading…</p>
          ) : game.error ? (
            <p className="text-red-400 text-sm">{game.error}</p>
          ) : game.data.length === 0 ? (
            <p className="text-gray-400 text-sm">No free game picks yet.</p>
          ) : (
            <div className="space-y-4">
              {game.data.map((g) => (
                <div key={g.id} className="p-4 rounded-xl border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{g.description}</div>
                    <div className="text-xs text-gray-400">{formatPickDate(g.pickPublishDate)}</div>
                  </div>
                  <p className="text-yellow-400 text-sm mt-1">
                    {g.pickTeam} ({g.pickType})
                  </p>
                  <p className="text-gray-300 text-sm mt-1">{g.pickDescription}</p>
                  <div className="text-xs text-gray-400 mt-2">{g.pickSportsbook}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FreePicksSection;

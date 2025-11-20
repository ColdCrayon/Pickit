import React from "react";
import { Link } from "react-router-dom";
import { useUserPlan } from "../../hooks";
import { useFreeArbPaginated, useFreeGamePaginated } from "../../hooks";
import { Footer } from "..";
import { formatPickDate } from "../../lib";
import ArbTicketCard from "../tickets/ArbTicketCard";

const logo = "/logo.png";

const FreePicksAll: React.FC = () => {
  const { isPremium, loading: loadingUser } = useUserPlan();

  const arb = useFreeArbPaginated({ isPremium, pageSize: 10 });
  const game = useFreeGamePaginated({ isPremium, pageSize: 10 });

  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-hidden">
      <main className="relative z-10 max-w-6xl mx-auto py-28 px-6 pt-32">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-4">
            <div className="p-1 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
              <img src={logo} alt="PickIt Logo" className="w-12 h-12 rounded-full border-2 border-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white text-glow">All Free Picks</h1>
              <p className="text-gray-400 text-sm">Daily free arbitrage opportunities and game picks</p>
            </div>
          </div>
          {!isPremium && !loadingUser && (
            <Link to="/upgrade" className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all transform hover:scale-105">
              Get Premium
            </Link>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Arbitrage column */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                Arbitrage Picks <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">{isPremium ? "All Access" : "Settled Only"}</span>
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>

            {arb.loading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : arb.error ? (
              <p className="text-red-400 text-sm text-center bg-red-500/10 p-4 rounded-xl border border-red-500/20">{arb.error}</p>
            ) : (
              <>
                <div className="space-y-4">
                  {arb.data.map((a) => {
                    // Map free pick data to ArbTicket structure for the card
                    // Note: Free picks might have slightly different fields, ensuring compatibility
                    const ticketData: any = {
                      ...a,
                      // Ensure required fields for ArbTicketCard exist
                      eventId: a.eventId || a.marketId || "Unknown Event",
                      marketId: a.marketId || "Moneyline",
                      legs: a.legs || [],
                      createdAt: a.createdAt || a.pickPublishDate
                    };

                    return (
                      <div key={a.id} className="transform transition-all hover:scale-[1.01]">
                        <ArbTicketCard t={ticketData} />
                      </div>
                    );
                  })}
                </div>
                {arb.hasMore && (
                  <button onClick={arb.loadMore}
                    className="w-full mt-4 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-all">
                    Load more arbitrage picks
                  </button>
                )}
              </>
            )}
          </section>

          {/* Game picks column */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                Game Picks <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">{isPremium ? "All Access" : "Settled Only"}</span>
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>

            {game.loading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            ) : game.error ? (
              <p className="text-red-400 text-sm text-center bg-red-500/10 p-4 rounded-xl border border-red-500/20">{game.error}</p>
            ) : (
              <>
                <div className="space-y-4">
                  {game.data.map((g) => (
                    <div key={g.id} className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-bold text-lg text-white group-hover:text-glow">{g.description}</div>
                        <div className="text-xs text-gray-400 bg-black/30 px-2 py-1 rounded-md border border-white/5">{formatPickDate(g.pickPublishDate)}</div>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-sm font-bold border border-purple-500/30">
                          {g.pickTeam}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {g.pickType}
                        </span>
                      </div>

                      <p className="text-gray-300 text-sm leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5 mb-3">
                        "{g.pickDescription}"
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          {g.pickSportsbook}
                        </span>
                        {isPremium && <span className="text-purple-400 font-medium">Premium Insight</span>}
                      </div>
                    </div>
                  ))}
                </div>
                {game.hasMore && (
                  <button onClick={game.loadMore}
                    className="w-full mt-4 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-all">
                    Load more game picks
                  </button>
                )}
              </>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FreePicksAll;

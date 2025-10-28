import React from "react";
import { Link, useParams } from "react-router-dom";
import { useUserPlan } from "../hooks/useUserPlan";
import { useFreeArbPaginated, useFreeGamePaginated } from "../hooks/useFreePicksPaginated";
import Footer from "../components/footer";
import { formatPickDate } from "../lib/dateUtils";

const logo = "/logo.png";

function toLeagueParam(value?: string): "NFL" | "NBA" | "MLB" | "NHL" | undefined {
  if (!value) return undefined;
  const v = value.toUpperCase();
  return (["NFL","NBA","MLB","NHL"] as const).includes(v as any) ? (v as any) : undefined;
}

const FreePicksLeague: React.FC = () => {
  const { league: leagueParam } = useParams<{ league: string }>();
  const league = toLeagueParam(leagueParam);
  const { isPremium, loading: loadingUser } = useUserPlan();

  const arb = useFreeArbPaginated({ league, isPremium, pageSize: 10 });
  const game = useFreeGamePaginated({ league, isPremium, pageSize: 10 });

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url('/Background.jpeg')" }}
      />
      <main className="relative z-10 max-w-6xl mx-auto py-28 px-6">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="PickIt Logo" className="w-10 h-10 rounded-full border border-white/20" />
            <h1 className="text-3xl font-bold">{league ?? "All"} — Free Picks</h1>
          </div>
          {!isPremium && !loadingUser && (
            <Link to="/upgrade" className="text-yellow-400 hover:underline text-sm">Get Premium</Link>
          )}
        </div>

        {!league && (
          <p className="text-red-400 mb-6">
            Invalid league. Try <Link className="underline" to="/free-picks/nfl">/free-picks/nfl</Link>, etc.
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <section className="p-6 rounded-2xl border border-white/10 bg-black/10">
            <h2 className="text-lg font-semibold mb-4">Arbitrage {isPremium ? "(All)" : "(Settled)"} — {league}</h2>
            {arb.loading ? <p className="text-gray-400 text-sm">Loading…</p>
              : arb.error ? <p className="text-red-400 text-sm">{arb.error}</p>
              : (
                <>
                  <div className="space-y-4">
                    {arb.data.map((a) => (
                      <div key={a.id} className="p-4 rounded-xl border border-white/10 bg-white/5">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{a.eventId ?? a.marketId ?? "Event"}</div>
                          {typeof a.margin === "number" && (
                            <div className="text-xs text-green-300">{(a.margin * 100).toFixed(2)}% edge</div>
                          )}
                        </div>
                        <div className="mt-2 grid sm:grid-cols-2 gap-2">
                          {a.legs?.slice(0, 4).map((leg, i) => (
                            <div key={i} className="text-sm rounded-lg border border-white/10 bg-black/30 p-3">
                              <div className="text-gray-300 font-medium">{leg.bookId}</div>
                              <div className="text-xs text-gray-400">{leg.outcome} @ {leg.priceDecimal}</div>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">{formatPickDate(a.createdAt ?? a.pickPublishDate)}</div>
                      </div>
                    ))}
                  </div>
                  {arb.hasMore && (
                    <button onClick={arb.loadMore}
                      className="mt-4 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10">
                      Load more
                    </button>
                  )}
                </>
              )}
          </section>

          <section className="p-6 rounded-2xl border border-white/10 bg-black/10">
            <h2 className="text-lg font-semibold mb-4">Game Picks {isPremium ? "(All)" : "(Settled)"} — {league}</h2>
            {game.loading ? <p className="text-gray-400 text-sm">Loading…</p>
              : game.error ? <p className="text-red-400 text-sm">{game.error}</p>
              : (
                <>
                  <div className="space-y-4">
                    {game.data.map((g) => (
                      <div key={g.id} className="p-4 rounded-xl border border-white/10 bg-white/5">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{g.pickGameInfo}</div>
                          <div className="text-xs text-gray-400">{formatPickDate(g.pickPublishDate)}</div>
                        </div>
                        <p className="text-yellow-400 text-sm mt-1">{g.pickTeam} ({g.pickType})</p>
                        <p className="text-gray-300 text-sm mt-1">{g.pickDescription}</p>
                        <div className="text-xs text-gray-400 mt-2">{g.pickSportsbook}</div>
                      </div>
                    ))}
                  </div>
                  {game.hasMore && (
                    <button onClick={game.loadMore}
                      className="mt-4 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10">
                      Load more
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

export default FreePicksLeague;

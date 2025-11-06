import React, { useState } from "react";
import { Zap, TrendingUp, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { ArbTicket, GameTicket } from "../../types/picks";
import ArbTicketCard from "../tickets/ArbTicketCard";
import GameTicketCard from "../tickets/GameTicketCard";
import Footer from "../footer";

interface SportsPageLayoutProps {
  sportName: string;
  sportAbbreviation: "NFL" | "NBA" | "MLB" | "NHL";
  arbTickets: ArbTicket[];
  gameTickets: GameTicket[];
  arbLoading: boolean;
  gameLoading: boolean;
  arbError: string | null;
  gameError: string | null;
  isPremium: boolean;
}

const SportsPageLayout: React.FC<SportsPageLayoutProps> = ({
  sportName,
  sportAbbreviation,
  arbTickets,
  gameTickets,
  arbLoading,
  gameLoading,
  arbError,
  gameError,
  isPremium,
}) => {
  const [activeTab, setActiveTab] = useState<"arb" | "game">("arb");

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url('Background.jpeg')",
          }}
        />

        <main className="relative z-10 max-w-6xl mx-auto py-28 px-6 space-y-8">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{sportName} Picks</h1>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
                <span className="px-2 py-1 rounded-lg border border-white/10 bg-black/20">
                  {isPremium ? "All Picks" : "Settled Only"}
                </span>
              </div>
              {!isPremium && (
                <Link
                  to="/upgrade"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/90 text-gray-900 font-semibold hover:bg-yellow-400 transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  <span className="hidden sm:inline">Upgrade for Live Picks</span>
                  <span className="sm:hidden">Upgrade</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="md:hidden flex gap-2">
            <button
              onClick={() => setActiveTab("arb")}
              className={`flex-1 px-4 py-2 rounded-xl border ${
                activeTab === "arb" ? "bg-white/10 border-white/20" : "bg-black/20 border-white/10"
              }`}
            >
              <div className="flex items-center gap-2 justify-center">
                <Zap className="w-4 h-4 text-yellow-400" />
                Arbitrage
              </div>
            </button>
            <button
              onClick={() => setActiveTab("game")}
              className={`flex-1 px-4 py-2 rounded-xl border ${
                activeTab === "game" ? "bg-white/10 border-white/20" : "bg-black/20 border-white/10"
              }`}
            >
              <div className="flex items-center gap-2 justify-center">
                <TrendingUp className="w-4 h-4 text-yellow-400" />
                Game Picks
              </div>
            </button>
          </div>

          {/* Desktop two-column layout */}
          <div className="hidden md:grid md:grid-cols-2 gap-6">
            {/* Arbitrage */}
            <section className="p-6 rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-lg font-semibold">Arbitrage Opportunities</h2>
                </div>
                {!isPremium && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Lock className="w-3 h-3" />
                    <span>Settled</span>
                  </div>
                )}
              </div>
              {arbLoading ? (
                <p className="text-gray-400 text-sm">Loading…</p>
              ) : arbError ? (
                <p className="text-red-400 text-sm">{arbError}</p>
              ) : arbTickets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm mb-3">No arbitrage opportunities available.</p>
                  {!isPremium && (
                    <Link 
                      to="/upgrade" 
                      className="text-yellow-400 hover:text-yellow-300 text-sm underline"
                    >
                      Upgrade to see live opportunities
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {arbTickets.map((t) => <ArbTicketCard key={t.id} t={t} />)}
                </div>
              )}
            </section>

            {/* Game picks */}
            <section className="p-6 rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-semibold">Game Picks</h2>
              </div>
              {gameLoading ? (
                <p className="text-gray-400 text-sm">Loading…</p>
              ) : gameError ? (
                <p className="text-red-400 text-sm">{gameError}</p>
              ) : gameTickets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No game picks available yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gameTickets.map((g) => <GameTicketCard key={g.id} ticket={g} />)}
                </div>
              )}
            </section>
          </div>

          {/* Mobile content panes */}
          <div className="md:hidden">
            {activeTab === "arb" ? (
              <section className="p-6 rounded-2xl border border-white/10 bg-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-lg font-semibold">Arbitrage</h2>
                  </div>
                  {!isPremium && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Lock className="w-3 h-3" />
                      <span>Settled</span>
                    </div>
                  )}
                </div>
                {arbLoading ? (
                  <p className="text-gray-400 text-sm">Loading…</p>
                ) : arbError ? (
                  <p className="text-red-400 text-sm">{arbError}</p>
                ) : arbTickets.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm mb-3">No arbitrage opportunities available.</p>
                    {!isPremium && (
                      <Link 
                        to="/upgrade" 
                        className="text-yellow-400 hover:text-yellow-300 text-sm underline"
                      >
                        Upgrade to see live opportunities
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">{arbTickets.map((t) => <ArbTicketCard key={t.id} t={t} />)}</div>
                )}
              </section>
            ) : (
              <section className="p-6 rounded-2xl border border-white/10 bg-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-lg font-semibold">Game Picks</h2>
                </div>
                {gameLoading ? (
                  <p className="text-gray-400 text-sm">Loading…</p>
                ) : gameError ? (
                  <p className="text-red-400 text-sm">{gameError}</p>
                ) : gameTickets.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">No game picks available yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {gameTickets.map((g) => <GameTicketCard key={g.id} ticket={g} />)}
                  </div>
                )}
              </section>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default SportsPageLayout;

import React from "react";
import { Link } from "react-router-dom";
import { FreePicksSection, Footer } from "..";
import { useFreePicks } from "../../hooks";

const logo = "/logo.png";

const LeagueBlock: React.FC<{ league: "NFL" | "NBA" | "MLB" | "NHL" }> = ({
  league,
}) => {
  const { arb, game } = useFreePicks(league, 4);
  return (
    <FreePicksSection
      league={league}
      arb={arb}
      game={game}
      seeAllTo={`/free-picks/${league.toLowerCase()}`}
    />
  );
};

const FreePicks: React.FC = () => {
  const [isPremium, setIsPremium] = React.useState<boolean | null>(null);

  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-hidden">
      <main className="relative z-10 max-w-6xl mx-auto py-12 px-6 pt-24">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white to-gray-400 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <span className="text-black font-bold text-lg">P</span>
            </div>
            <h1 className="text-3xl font-bold text-white text-glow">Free Picks</h1>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-gray-300">
            {isPremium === false && (
              <Link to="/upgrade" className="hover:text-white transition-colors">
                Get Premium
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-10">
          <LeagueBlock league="NFL" />
          <LeagueBlock league="NBA" />
          <LeagueBlock league="MLB" />
          <LeagueBlock league="NHL" />
        </div>

        <div className="text-center mt-12">
          <Link
            to="/free-picks/all"
            className="inline-block px-8 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all hover:scale-105 backdrop-blur-sm"
          >
            See all free picks
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FreePicks;

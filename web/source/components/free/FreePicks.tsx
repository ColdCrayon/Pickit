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
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url('/Background.jpeg')",
        }}
      />

      <main className="relative z-10 max-w-6xl mx-auto py-28 px-6">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-3">
            <img
              src={logo}
              alt="PickIt Logo"
              className="w-10 h-10 rounded-full border border-white/20"
            />
            <h1 className="text-3xl font-bold">Free Picks</h1>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-gray-300">
            {isPremium === false && (
              <Link to="/upgrade" className="hover:text-white">
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
            className="inline-block px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
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

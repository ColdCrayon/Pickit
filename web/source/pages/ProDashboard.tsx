/**
 * ProDashboard - Restored Original Layout + Odds Comparison
 * UPDATED: Added alerts counting based on saved tickets and watchlist with notifications
 */

import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Star,
  TrendingUp,
  Zap,
  BarChart3,
  Bell,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Footer } from "../components";
import { useAuth } from "../hooks/useAuth";
import { useWatchlist } from "../hooks/useWatchlist";
import { useUserTickets } from "../hooks/useUserTickets";
import { WatchlistGameItem } from "../components/watchlist/WatchlistGameItem";
import { OddsComparisonPreview } from "../components/odds/OddsComparisonPreview";

interface ProDashboardProps {
  isSidebarOpen: boolean;
}

// Quick Stat Card Component
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
}> = ({ icon, label, value, subtext }) => (
  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] hover:bg-white/10 transition-all duration-300 group">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 bg-white/5 rounded-xl text-blue-400 border border-white/10 group-hover:border-blue-500/30 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </div>
    <p className="text-xs text-gray-500 font-medium">{subtext}</p>
  </div>
);

// Quick Access Link Component
const QuickLink: React.FC<{
  to: string;
  label: string;
  description: string;
}> = ({ to, label, description }) => (
  <Link
    to={to}
    className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 hover:shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] transition-all duration-300 group"
  >
    <h4 className="font-medium text-white mb-1 group-hover:text-glow transition-all">
      {label}
    </h4>
    <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">{description}</p>
  </Link>
);

const ProDashboard: React.FC<ProDashboardProps> = ({ isSidebarOpen }) => {
  const { user } = useAuth();
  const {
    watchlist,
    removeGame,
    loading: watchlistLoading,
    totalItems,
  } = useWatchlist(user?.uid);
  const { tickets, loading: ticketsLoading } = useUserTickets();

  const firstGameId = watchlist?.games?.[0]?.id;

  // Calculate total alerts: saved tickets + watchlist games with notifications enabled
  const totalAlerts = useMemo(() => {
    if (ticketsLoading || watchlistLoading) return 0;

    // Count saved tickets (each saved ticket can trigger notifications)
    const savedTicketsCount = tickets.length;

    // Count watchlist games (each game can trigger notifications for odds changes, game starts, etc.)
    const watchlistGamesCount = watchlist?.games?.length || 0;

    return savedTicketsCount + watchlistGamesCount;
  }, [
    tickets.length,
    watchlist?.games?.length,
    ticketsLoading,
    watchlistLoading,
  ]);

  // Create subtext for alerts card
  const alertsSubtext = useMemo(() => {
    if (ticketsLoading || watchlistLoading) return "Loading...";

    const ticketCount = tickets.length;
    const gameCount = watchlist?.games?.length || 0;

    if (totalAlerts === 0) return "Configure alerts";

    const parts = [];
    if (ticketCount > 0)
      parts.push(`${ticketCount} ticket${ticketCount !== 1 ? "s" : ""}`);
    if (gameCount > 0)
      parts.push(`${gameCount} game${gameCount !== 1 ? "s" : ""}`);

    return parts.join(", ");
  }, [
    tickets.length,
    watchlist?.games?.length,
    totalAlerts,
    ticketsLoading,
    watchlistLoading,
  ]);

  return (
    <div className="min-h-screen bg-transparent text-white">
      <main
        className="relative z-10 transition-all duration-300 pt-16"
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
                <LayoutDashboard className="w-6 h-6 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold text-white text-glow">Pro Dashboard</h1>
            </div>
            <p className="text-gray-400 font-medium ml-1">
              Your command center for smart betting decisions
            </p>
          </div>

          {/* Quick Stats - 4 Cards Across */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Star className="w-5 h-5" />}
              label="Watchlist Items"
              value={totalItems.toString()}
              subtext={`${watchlist?.games.length || 0} games tracked`}
            />
            <StatCard
              icon={<Zap className="w-5 h-5" />}
              label="Active Arbs"
              value="-"
              subtext="Coming soon"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Today's Picks"
              value="-"
              subtext="Coming soon"
            />
            <StatCard
              icon={<Bell className="w-5 h-5" />}
              label="Alerts Set"
              value={totalAlerts.toString()}
              subtext={alertsSubtext}
            />
          </div>

          {/* Quick Access - Full Width */}
          <div className="mb-8">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">Quick Access</h3>
                  <p className="text-sm text-gray-400 font-medium">
                    Navigate to key features
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickLink
                  to="/my-tickets"
                  label="My Tickets"
                  description="View your saved tickets"
                />
                <QuickLink
                  to="/browse-events"
                  label="Browse Events"
                  description="Add games to watchlist"
                />
                <QuickLink
                  to="/watchlist"
                  label="Full Watchlist"
                  description="View all tracked games"
                />
                <QuickLink
                  to="/odds-comparison"
                  label="Odds Comparison"
                  description="Compare all sportsbooks"
                />
                <QuickLink
                  to="/nfl"
                  label="NFL Games"
                  description="View current NFL odds"
                />
                <QuickLink
                  to="/nba"
                  label="NBA Games"
                  description="View current NBA odds"
                />
                <QuickLink
                  to="/mlb"
                  label="MLB Games"
                  description="View current MLB odds"
                />
                <QuickLink
                  to="/nhl"
                  label="NHL Games"
                  description="View current NHL odds"
                />
              </div>
            </div>
          </div>

          {/* Watchlist Preview */}
          <div className="mb-8">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
              {!watchlistLoading &&
                watchlist?.games &&
                watchlist.games.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                        <Star className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-white">
                          Watchlist Preview
                        </h3>
                        <p className="text-sm text-gray-400 font-medium">
                          {watchlist.games.length} game
                          {watchlist.games.length !== 1 ? "s" : ""} tracked
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/watchlist"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium text-yellow-400"
                    >
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
                    <WatchlistGameItem
                      gameId={firstGameId}
                      onRemove={(id) => removeGame(id)}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Star className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    No Games in Watchlist
                  </h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Start tracking games to get real-time odds updates and arbitrage alerts directly on your dashboard.
                  </p>
                  <Link
                    to="/browse-events"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)]"
                  >
                    <Plus className="w-5 h-5" />
                    Browse Games
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Odds Comparison Preview - Full Width */}
          <div className="mb-8">
            <OddsComparisonPreview />
          </div>

          {/* Feature Cards - 3 Across */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/browse-events"
              className="relative overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300 group"
            >
              <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-bold text-xl text-white mb-2">Live Events</h3>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">
                  Browse and track upcoming games across all leagues with real-time updates.
                </p>
              </div>
            </Link>

            <Link
              to="/odds-comparison"
              className="relative overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] transition-all duration-300 group"
            >
              <div className="absolute top-0 right-0 p-32 bg-yellow-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-xl text-white mb-2">Odds Comparison</h3>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">
                  Compare odds across all major sportsbooks to find the best value for your bets.
                </p>
              </div>
            </Link>

            <Link
              to="/Account"
              className="relative overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300 group"
            >
              <div className="absolute top-0 right-0 p-32 bg-purple-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-xl text-white mb-2">Notifications</h3>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">
                  Set up custom alerts for odds changes, game updates, and arbitrage opportunities.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProDashboard;

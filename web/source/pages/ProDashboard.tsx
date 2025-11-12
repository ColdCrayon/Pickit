/**
 * ProDashboard - Updated with Real Watchlist Integration
 * Command center for premium users with live watchlist data
 */

import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Star,
  TrendingUp,
  Zap,
  BarChart3,
  Bell,
  Plus,
} from "lucide-react";
import { Footer } from "../components";
import { useAuth } from "../hooks/useAuth";
import { useWatchlist } from "../hooks/useWatchlist";
import { WatchlistGameItem } from "../components/watchlist/WatchlistGameItem";

interface ProDashboardProps {
  isSidebarOpen: boolean;
}

const ProDashboard: React.FC<ProDashboardProps> = ({ isSidebarOpen }) => {
  const { user } = useAuth();
  const {
    watchlist,
    removeGame,
    loading: watchlistLoading,
    totalItems,
  } = useWatchlist(user?.uid);

  // Get upcoming games (sorted by start time)
  const upcomingGames =
    watchlist?.games
      .filter((game) => new Date(game.startTime) > new Date())
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )
      .slice(0, 3) || []; // Show top 3

  return (
    <main
      className={`relative z-10 transition-all duration-300 ${
        isSidebarOpen ? "ml-64" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-8 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold">Pro Dashboard</h1>
          </div>
          <p className="text-gray-400">
            Your command center for smart betting decisions
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Star className="w-6 h-6" />}
            label="Watchlist Items"
            value={totalItems.toString()}
            subtext={`${watchlist?.games.length || 0} games tracked`}
          />
          <StatCard
            icon={<Zap className="w-6 h-6" />}
            label="Active Arbs"
            value="-"
            subtext="Coming soon"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Today's Picks"
            value="-"
            subtext="Coming soon"
          />
          <StatCard
            icon={<Bell className="w-6 h-6" />}
            label="Alerts Set"
            value="0"
            subtext="Configure alerts"
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Watchlist Section - Takes 2 columns */}
          <div className="lg:col-span-2 flex">
            <DashboardCard
              title="My Watchlist"
              icon={<Star className="w-5 h-5 text-yellow-400" />}
              action={
                <Link
                  to="/browse-events"
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-xl hover:bg-yellow-500/30 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Games
                </Link>
              }
            >
              {watchlistLoading ? (
                <div className="flex items-center justify-center h-full py-12">
                  <div className="text-center">
                    <div className="inline-block w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-400">Loading watchlist...</p>
                  </div>
                </div>
              ) : upcomingGames.length === 0 ? (
                <WatchlistEmptyState />
              ) : (
                <div className="space-y-4">
                  {upcomingGames.map((game) => (
                    <WatchlistGameItem
                      key={game.id}
                      game={game}
                      onRemove={removeGame}
                      showOdds={true}
                    />
                  ))}

                  {watchlist && watchlist.games.length > 3 && (
                    <Link
                      to="/watchlist"
                      className="block text-center py-3 text-yellow-400 hover:text-yellow-300 transition font-semibold"
                    >
                      View All {watchlist.games.length} Games →
                    </Link>
                  )}
                </div>
              )}
            </DashboardCard>
          </div>

          {/* Quick Links - Takes 1 column */}
          <div className="flex">
            <DashboardCard
              title="Quick Access"
              icon={<Zap className="w-5 h-5 text-yellow-400" />}
            >
              <div className="space-y-3">
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
                <QuickLink
                  to="/Account"
                  label="Account Settings"
                  description="Manage your profile"
                />
              </div>
            </DashboardCard>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DashboardCard
            title="Odds Comparison"
            icon={<BarChart3 className="w-5 h-5 text-gray-400" />}
          >
            <OddsComparisonPlaceholder />
          </DashboardCard>
          <DashboardCard
            title="Line Movement"
            icon={<TrendingUp className="w-5 h-5 text-gray-400" />}
          >
            <LineMovementPlaceholder />
          </DashboardCard>
        </div>

        <Footer />
      </div>
    </main>
  );
};

// StatCard Component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtext }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
    <div className="flex items-center gap-3 mb-2">
      <div className="text-yellow-400">{icon}</div>
      <h3 className="text-sm text-gray-400 font-medium">{label}</h3>
    </div>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <p className="text-xs text-gray-500">{subtext}</p>
  </div>
);

// DashboardCard Component
interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  action,
  children,
}) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full h-full flex flex-col">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {action}
    </div>
    <div className="flex-1">{children}</div>
  </div>
);

interface QuickLinkProps {
  to: string;
  label: string;
  description: string;
}

const QuickLink: React.FC<QuickLinkProps> = ({ to, label, description }) => (
  <Link
    to={to}
    className="block p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition group"
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold group-hover:text-yellow-400 transition">
          {label}
        </h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <TrendingUp className="w-5 h-5 text-gray-600 group-hover:text-yellow-400 transition" />
    </div>
  </Link>
);

// Watchlist Empty State
const WatchlistEmptyState: React.FC = () => (
  <div className="flex items-center justify-center h-full text-center py-12">
    <div>
      <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">No items in watchlist</h3>
      <p className="text-gray-400 mb-6">
        Start tracking games to see live odds and get notifications
      </p>
      <Link
        to="/browse-events"
        className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition"
      >
        <Plus className="w-5 h-5" />
        Browse Events
      </Link>
    </div>
  </div>
);

// Placeholder Components (to be replaced in future phases)

const OddsComparisonPlaceholder: React.FC = () => (
  <div className="text-center py-8">
    <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
    <h3 className="font-semibold mb-2">Odds Comparison</h3>
    <p className="text-gray-400 text-sm mb-4">
      Compare odds across multiple sportsbooks side-by-side
    </p>
    <p className="text-xs text-gray-500">
      <strong>Phase 2:</strong> Real-time odds from multiple books
    </p>
  </div>
);

const LineMovementPlaceholder: React.FC = () => (
  <div className="text-center py-8">
    <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
    <h3 className="font-semibold mb-2">Line Movement Charts</h3>
    <p className="text-gray-400 text-sm mb-4">
      Track how betting lines move over time
    </p>
    <p className="text-xs text-gray-500">
      <strong>Phase 2:</strong> Sparkline graphs showing 24h line movement
    </p>
  </div>
);

export default ProDashboard;

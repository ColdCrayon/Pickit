import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Star,
  TrendingUp,
  Zap,
  BarChart3,
  Bell,
} from "lucide-react";
import { Footer } from "../components";
import { WatchlistCard } from "../components/dashboard/WatchlistCard";
import { useUserPlan } from "../hooks";

interface ProDashboardProps {
  isSidebarOpen: boolean;
}

/**
 * ProDashboard - Phase 1 MVP
 * Command center for premium users
 *
 * Features (Phase 1):
 * - Watchlist section (teams/players/games to track) ✅ IMPLEMENTED
 * - Odds comparison table (placeholder - not yet implemented)
 * - Line movement charts (placeholder - not yet implemented)
 * - Quick access to arbitrage & picks
 * - Stats overview
 */
const ProDashboard: React.FC<ProDashboardProps> = ({ isSidebarOpen }) => {
  const { user } = useUserPlan();

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
            value="-"
            subtext="Track your favorites"
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

        {/* Quick Links */}
        <div className="mb-8">
          <DashboardCard
            title="Quick Access"
            icon={<Zap className="w-5 h-5 text-yellow-400" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuickLink
                to="/nfl"
                label="NFL Arbitrage"
                description="View current NFL betting opportunities"
              />
              <QuickLink
                to="/nba"
                label="NBA Arbitrage"
                description="Check NBA market inefficiencies"
              />
              <QuickLink
                to="/free-picks/all"
                label="Today's Picks"
                description="Expert predictions across all leagues"
              />
              <QuickLink
                to="/news"
                label="Latest News"
                description="Stay updated with sports betting insights"
              />
            </div>
          </DashboardCard>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Watchlist Section - NOW FULLY FUNCTIONAL */}
          <div className="lg:col-span-2">
            <WatchlistCard userId={user?.uid} />
          </div>

          {/* Odds Comparison Placeholder */}
          <DashboardCard
            title="Odds Comparison"
            icon={<BarChart3 className="w-5 h-5 text-blue-400" />}
          >
            <OddsComparisonPlaceholder />
          </DashboardCard>

          {/* Line Movement Placeholder */}
          <DashboardCard
            title="Line Movement"
            icon={<TrendingUp className="w-5 h-5 text-green-400" />}
          >
            <LineMovementPlaceholder />
          </DashboardCard>
        </div>

        {/* Coming Soon Section */}
        <DashboardCard
          title="Advanced Analytics"
          icon={<BarChart3 className="w-5 h-5 text-purple-400" />}
        >
          <div className="text-center py-8">
            <p className="text-gray-400 mb-2">
              Advanced data visualizations and predictive models coming soon
            </p>
            <p className="text-sm text-gray-500">
              We're building advanced analytics to help you make smarter betting
              decisions.
            </p>
          </div>
        </DashboardCard>
      </div>

      <Footer />
    </main>
  );
};

// Helper Components

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtext }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-3">
      <div className="text-yellow-400">{icon}</div>
      <h3 className="text-sm font-medium text-gray-400">{label}</h3>
    </div>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <p className="text-xs text-gray-500">{subtext}</p>
  </div>
);

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

/**
 * OddsComparisonPreview Component
 *
 * Dashboard widget showing a preview of odds comparison for featured games
 */

import React from "react";
import { Link } from "react-router-dom";
import { BarChart3, ArrowRight, TrendingUp } from "lucide-react";
import { useAvailableEvents } from "../../hooks/useAvailableEvents";

// Simple time formatting function
const formatTimeUntil = (date: Date): string => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();

  if (diff < 0) return "Started";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `in ${days} day${days > 1 ? "s" : ""}`;
  if (hours > 0) return `in ${hours} hour${hours > 1 ? "s" : ""}`;
  return "Starting soon";
};

export const OddsComparisonPreview: React.FC = () => {
  const { events, loading } = useAvailableEvents({ limit: 3 });

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/3"></div>
          <div className="h-20 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <BarChart3 className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Odds Comparison</h3>
            <p className="text-sm text-gray-400">
              Compare odds across sportsbooks
            </p>
          </div>
        </div>
        <Link
          to="/odds-comparison"
          className="flex items-center gap-1 text-sm text-yellow-400 hover:text-yellow-300 transition"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Featured Games */}
      <div className="space-y-3">
        {events && events.length > 0 ? (
          events.slice(0, 3).map((event) => {
            const startTime = event.startTime?.toDate();
            const timeUntil = startTime ? formatTimeUntil(startTime) : "";

            return (
              <Link
                key={event.id}
                to={`/odds-comparison?event=${event.id}`}
                className="block p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {event.teams.away} @ {event.teams.home}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{timeUntil}</p>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-medium">Compare</span>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No upcoming games available</p>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <Link
        to="/odds-comparison"
        className="block mt-4 w-full py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-medium rounded-xl text-center transition"
      >
        Explore All Games
      </Link>
    </div>
  );
};

export default OddsComparisonPreview;

/**
 * EventBrowser Page - DYNAMIC SPORTS VERSION
 *
 * Browse upcoming events from Firebase and add them to watchlist
 * Dynamically fetches ALL available sports from database
 *
 * CHANGES:
 * - Removed hardcoded SPORTS array
 * - Now fetches ALL events regardless of sport
 * - Dynamically builds sport filter buttons from actual data
 * - Extended date range to 30 days
 * - Increased limits to 200 per sport
 */

import React, { useState, useMemo } from "react";
import { Search, Filter, Calendar, TrendingUp } from "lucide-react";
import { useAvailableEvents } from "../hooks/useAvailableEvents";
import { EventCard } from "../components/watchlist/EventCard";
import { SportKey, League } from "../types/events";

// Sport key to display name mapping
const SPORT_LABELS: Record<SportKey, League> = {
  americanfootball_nfl: "NFL",
  basketball_nba: "NBA",
  icehockey_nhl: "NHL",
  baseball_mlb: "MLB",
  basketball_ncaab: "NCAAB",
  americanfootball_ncaaf: "NCAAF",
};

export default function EventBrowser() {
  const [selectedSport, setSelectedSport] = useState<SportKey | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ CHANGED: Fetch ALL events without sport filter
  const { events, loading, error, refresh } = useAvailableEvents({
    sport: selectedSport !== "all" ? selectedSport : undefined,
    limit: 500, // Increased limit to get all events
  });

  // ✅ NEW: Dynamically determine available sports from fetched events
  const availableSports = useMemo(() => {
    const sportsSet = new Set<SportKey>();
    events.forEach((event) => {
      if (event.sport) {
        sportsSet.add(event.sport);
      }
    });
    return Array.from(sportsSet).sort();
  }, [events]);

  // Filter events by search query and selected sport
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Filter by selected sport
      if (selectedSport !== "all" && event.sport !== selectedSport) {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          event.teams.home.toLowerCase().includes(query) ||
          event.teams.away.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [events, selectedSport, searchQuery]);

  // Count events per sport
  const eventCountPerSport = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((event) => {
      counts[event.sport] = (counts[event.sport] || 0) + 1;
    });
    return counts;
  }, [events]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl mt-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-yellow-400" />
            Browse Events
          </h1>
          <p className="text-gray-400">
            Add upcoming games to your watchlist to track odds and receive
            notifications
          </p>
          {/* Show total events available */}
          {!loading && !error && (
            <p className="text-sm text-gray-500 mt-2">
              📊 Total events available: {events.length} across{" "}
              {availableSports.length} sport
              {availableSports.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400/50 transition"
            />
          </div>

          {/* Sport Filter Tabs - Dynamically Generated */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedSport("all")}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                selectedSport === "all"
                  ? "bg-yellow-400 text-black font-semibold"
                  : "bg-white/5 hover:bg-white/10 text-gray-300"
              }`}
            >
              All Sports ({events.length})
            </button>
            {availableSports.map((sportKey) => (
              <button
                key={sportKey}
                onClick={() => setSelectedSport(sportKey)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  selectedSport === sportKey
                    ? "bg-yellow-400 text-black font-semibold"
                    : "bg-white/5 hover:bg-white/10 text-gray-300"
                }`}
              >
                {SPORT_LABELS[sportKey] || sportKey.toUpperCase()} (
                {eventCountPerSport[sportKey] || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div>
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-400">
                Loading events from Firebase...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={refresh}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition"
              >
                Try Again
              </button>
            </div>
          )}

          {/* No Results */}
          {!loading && !error && filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No upcoming events found</p>
              {searchQuery && (
                <p className="text-sm text-gray-500">
                  Try adjusting your search or filters
                </p>
              )}
              {!searchQuery && events.length === 0 && (
                <p className="text-sm text-gray-500 mt-4">
                  💡 Tip: Run your odds ingestion service to populate events
                </p>
              )}
            </div>
          )}

          {/* Event Grid */}
          {!loading && !error && filteredEvents.length > 0 && (
            <>
              <div className="mb-4 text-sm text-gray-400">
                Showing {filteredEvents.length} event
                {filteredEvents.length !== 1 ? "s" : ""}
                {searchQuery && ` matching "${searchQuery}"`}
                {selectedSport !== "all" &&
                  ` in ${SPORT_LABELS[selectedSport] || selectedSport}`}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} showOdds={true} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

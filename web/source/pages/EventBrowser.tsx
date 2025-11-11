/**
 * EventBrowser Page
 *
 * Browse upcoming events from The Odds API and add them to watchlist
 * Supports filtering by sport and date range
 */

import React, { useState } from "react";
import { Search, Filter, Calendar, TrendingUp } from "lucide-react";
import {
  useAvailableEvents,
  useMultiSportEvents,
} from "../hooks/useAvailableEvents";
import { EventCard } from "../components/watchlist/EventCard";
import { SportKey, leagueToSportKey, League } from "../types/events";

const SPORTS: { key: SportKey; label: League }[] = [
  { key: "americanfootball_nfl", label: "NFL" },
  { key: "basketball_nba", label: "NBA" },
  { key: "icehockey_nhl", label: "NHL" },
  { key: "baseball_mlb", label: "MLB" },
];

export default function EventBrowser() {
  const [selectedSport, setSelectedSport] = useState<SportKey | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch events based on selected sport
  const singleSportResult = useAvailableEvents({
    sport: selectedSport !== "all" ? selectedSport : undefined,
    limit: 50,
  });

  const multiSportResult = useMultiSportEvents(
    SPORTS.map((s) => s.key),
    { limit: 50 }
  );

  const { events, loading, error, refresh } =
    selectedSport === "all" ? multiSportResult : singleSportResult;

  // Filter events by search query
  const filteredEvents = events.filter((event) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.teams.home.toLowerCase().includes(query) ||
      event.teams.away.toLowerCase().includes(query)
    );
  });

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

          {/* Sport Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedSport("all")}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                selectedSport === "all"
                  ? "bg-yellow-400 text-black font-semibold"
                  : "bg-white/5 hover:bg-white/10 text-gray-300"
              }`}
            >
              All Sports
            </button>
            {SPORTS.map((sport) => (
              <button
                key={sport.key}
                onClick={() => setSelectedSport(sport.key)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  selectedSport === sport.key
                    ? "bg-yellow-400 text-black font-semibold"
                    : "bg-white/5 hover:bg-white/10 text-gray-300"
                }`}
              >
                {sport.label}
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
              <p className="mt-4 text-gray-400">Loading events...</p>
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
            </div>
          )}

          {/* Event Grid */}
          {!loading && !error && filteredEvents.length > 0 && (
            <>
              <div className="mb-4 text-sm text-gray-400">
                Showing {filteredEvents.length} event
                {filteredEvents.length !== 1 ? "s" : ""}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    showOdds={true}
                    onAddSuccess={() => {
                      // Optional: Show success toast
                      console.log("Added to watchlist:", event.id);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-12 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Live Odds & Notifications
          </h3>
          <p className="text-sm text-gray-400">
            Add games to your watchlist to receive real-time odds updates and
            notifications when lines move. Click the star icon on any event to
            start tracking.
          </p>
        </div>
      </div>
    </div>
  );
}

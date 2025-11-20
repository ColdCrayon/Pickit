/**
 * EventBrowser Page
 * Allows users to browse and search for events across different sports
 */

import React, { useState, useMemo } from "react";
import { Search, TrendingUp, Calendar, Filter } from "lucide-react";
import {
  useAvailableEvents,
  useMultiSportEvents,
} from "../hooks/useAvailableEvents";
import { EventCard } from "../components/watchlist/EventCard";
import { SportKey, League } from "../types/events";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Footer } from "../components";

const SPORTS: { key: SportKey; label: League }[] = [
  { key: "americanfootball_nfl", label: "NFL" },
  { key: "basketball_nba", label: "NBA" },
  { key: "icehockey_nhl", label: "NHL" },
  { key: "baseball_mlb", label: "MLB" },
];

import { useSearchParams } from "react-router-dom";

export default function EventBrowser() {
  const [searchParams] = useSearchParams();
  const [selectedSport, setSelectedSport] = useState<SportKey | "all">("all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  const sportKeys = useMemo(() => SPORTS.map((s) => s.key), []);

  // Sync search query with URL parameters
  React.useEffect(() => {
    const query = searchParams.get("search");
    if (query !== null) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  // Fetch events based on selected sport
  const singleSportResult = useAvailableEvents({
    sport: selectedSport !== "all" ? selectedSport : undefined,
    limit: 50,
  });

  const multiSportResult = useMultiSportEvents(sportKeys, { limit: 50 });

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
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white text-glow">Browse Events</h1>
          </div>
          <p className="text-gray-400 font-medium ml-1">
            Find upcoming games and track odds movements
          </p>
        </div>

        {/* Filters & Search */}
        <Card className="glass-card mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              {/* Sport Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                <Button
                  variant={selectedSport === "all" ? "liquid" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedSport("all")}
                  className={selectedSport !== "all" ? "text-gray-400 hover:text-white" : ""}
                >
                  All Sports
                  <Badge variant="secondary" className="ml-2 bg-white/10 text-xs">
                    {selectedSport === "all" ? events.length : ""}
                  </Badge>
                </Button>
                {SPORTS.map((sport) => (
                  <Button
                    key={sport.key}
                    variant={selectedSport === sport.key ? "liquid" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedSport(sport.key)}
                    className={selectedSport !== sport.key ? "text-gray-400 hover:text-white" : ""}
                  >
                    {sport.label}
                  </Button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black/20 border-white/10 focus:border-blue-500/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div>
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 animate-pulse">Loading events...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center max-w-lg mx-auto">
              <p className="text-red-400 mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={refresh}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* No Results */}
          {!loading && !error && filteredEvents.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
              <p className="text-gray-400">
                {searchQuery
                  ? `No matches for "${searchQuery}"`
                  : "No upcoming events available for this category"}
              </p>
            </div>
          )}

          {/* Event Grid */}
          {!loading && !error && filteredEvents.length > 0 && (
            <>
              <div className="mb-4 flex items-center justify-between text-sm text-gray-400 px-1">
                <span>
                  Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  Sorted by start time
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} showOdds={true} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

/**
 * OddsComparison Page
 *
 * Full-page odds comparison tool for pro users
 * Route: /odds-comparison (protected by ProGuard)
 */

import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  BarChart3,
  Filter,
  ArrowLeft,
  Calendar,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { Footer } from "../components";
import { useAvailableEvents } from "../hooks/useAvailableEvents";
import { OddsComparisonTable } from "../components/odds/OddsComparisonTable";
import LineMovementChart from "../components/charts/LineMovementChart";
import { EventMarketType, SportKey } from "../types/events";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";

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

// Mock data generator for the chart
const generateMockChartData = (marketType: string) => {
  const data = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const baseValue = marketType === 'h2h' ? -110 : marketType === 'spreads' ? -110 : 220;
    const randomFluctuation = Math.floor(Math.random() * 20) - 10;

    data.push({
      timestamp: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: baseValue + randomFluctuation,
      bookmaker: 'DraftKings'
    });
  }
  return data;
};

const OddsComparison: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSport, setSelectedSport] = useState<SportKey | "all">("all");
  const [selectedMarket, setSelectedMarket] = useState<EventMarketType>("h2h");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    searchParams.get("event")
  );
  const [chartData, setChartData] = useState<any[]>([]);

  const { events, loading, refresh } = useAvailableEvents({
    sport: selectedSport === "all" ? undefined : selectedSport,
    limit: 20,
  });

  // Update selected event when URL param changes
  useEffect(() => {
    const eventParam = searchParams.get("event");
    if (eventParam) {
      setSelectedEventId(eventParam);
    }
  }, [searchParams]);

  // Auto-select first event if none selected
  useEffect(() => {
    if (!selectedEventId && events && events.length > 0) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  // Update chart data when event or market changes
  useEffect(() => {
    if (selectedEventId) {
      setChartData(generateMockChartData(selectedMarket));
    }
  }, [selectedEventId, selectedMarket]);

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    setSearchParams({ event: eventId });
  };

  const selectedEvent = events?.find((e) => e.id === selectedEventId);

  return (
    <div className="min-h-screen bg-background text-foreground pt-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />

      {/* Header */}
      <header className="border-b border-white/10 bg-background/95 backdrop-blur-lg sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Odds Comparison</h1>
                  <p className="text-sm text-muted-foreground">
                    Compare odds across all major sportsbooks
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => refresh()}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Event List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold">Filters</h3>
                </div>

                {/* Sport Filter */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Sport</label>
                  <select
                    value={selectedSport}
                    onChange={(e) =>
                      setSelectedSport(e.target.value as SportKey | "all")
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="all">All Sports</option>
                    <option value="americanfootball_nfl">NFL</option>
                    <option value="basketball_nba">NBA</option>
                    <option value="icehockey_nhl">NHL</option>
                    <option value="baseball_mlb">MLB</option>
                  </select>
                </div>

                {/* Market Type Filter */}
                <div className="space-y-2 mt-4">
                  <label className="text-sm text-muted-foreground">Market Type</label>
                  <select
                    value={selectedMarket}
                    onChange={(e) =>
                      setSelectedMarket(e.target.value as EventMarketType)
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="h2h">Moneyline</option>
                    <option value="spreads">Spread</option>
                    <option value="totals">Totals (O/U)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Event List */}
            <Card className="min-h-[550px] flex flex-col">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold">Upcoming Games</h3>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[500px]">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-white/5 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : events && events.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {events.map((event) => {
                      const isSelected = event.id === selectedEventId;
                      const startTime = event.startTime?.toDate();
                      const timeUntil = startTime
                        ? formatTimeUntil(startTime)
                        : "";

                      return (
                        <button
                          key={event.id}
                          onClick={() => handleEventSelect(event.id)}
                          className={`w-full p-4 text-left transition-all ${isSelected
                              ? "bg-primary/10 border-l-4 border-primary"
                              : "hover:bg-white/5 border-l-4 border-transparent"
                            }`}
                        >
                          <p className="font-medium text-sm">
                            {event.teams.away} @ {event.teams.home}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {timeUntil}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>No games available</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Main Content - Odds Table & Chart */}
          <div className="lg:col-span-2 space-y-6">
            {selectedEventId && selectedEvent ? (
              <>
                <OddsComparisonTable
                  eventId={selectedEventId}
                  marketType={selectedMarket}
                />

                <LineMovementChart
                  data={chartData}
                  title={`${selectedMarket === 'h2h' ? 'Moneyline' : selectedMarket === 'spreads' ? 'Spread' : 'Total'} Movement History`}
                />
              </>
            ) : (
              <Card className="p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-secondary/20">
                    <BarChart3 className="w-12 h-12 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Select a Game</h3>
                <p className="text-muted-foreground">
                  Choose a game from the list to compare odds across sportsbooks
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OddsComparison;

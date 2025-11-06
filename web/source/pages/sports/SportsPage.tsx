import React from "react";
import { useLocation } from "react-router-dom";
import { useSportsArbTickets, useSportsTickets, useUserPlan } from "../../hooks";
import { SportsPageLayout } from "../../components";
import { SPORTS, type Sport } from "../../lib";

const SportsPage: React.FC = () => {
  const location = useLocation();
  const { isPremium, loading: userLoading } = useUserPlan();

  const sportFromPath = location.pathname.slice(1).toUpperCase(); // Remove leading "/"
  
  // Validate and normalize the sport
  const validSport: Sport = (SPORTS as readonly string[]).includes(sportFromPath)
    ? (sportFromPath as Sport)
    : "NFL"; // Default fallback

  // For arb tickets:
  // - Premium users: includeLive = true (shows all tickets)
  // - Free users: includeLive = false (only shows settled tickets via the serverSettled filter)
  const { tickets: arbTickets, loading: arbLoading, error: arbError } = useSportsArbTickets({ 
    league: validSport, 
    includeLive: isPremium, // Only premium users get live tickets
    max: 20 
  });
  
  // For game tickets:
  // - Premium users: includeSettled = true (shows all tickets)
  // - Free users: includeSettled = false (only shows unsettled/live tickets)
  // Note: You might want to adjust this logic based on your business rules
  const { tickets: gameTickets, loading: gameLoading, error: gameError } = useSportsTickets({ 
    league: validSport, 
    includeSettled: true, // Show all game tickets for now
    max: 20 
  });

  // Show loading state while checking user authentication
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SportsPageLayout
      sportName={validSport}
      sportAbbreviation={validSport}
      arbTickets={arbTickets}
      gameTickets={gameTickets}
      arbLoading={arbLoading}
      gameLoading={gameLoading}
      arbError={arbError}
      gameError={gameError}
      isPremium={isPremium}
    />
  );
};

export default SportsPage;

import React from "react";
import { useLocation } from "react-router-dom";
import { useSportsArbTickets, useSportsTickets } from "../../hooks";
import { SportsPageLayout } from "../../components";
import { SPORTS, type Sport } from "../../lib";

const SportsPage: React.FC = () => {
  const location = useLocation();

  const sportFromPath = location.pathname.slice(1).toUpperCase(); // Remove leading "/"
  
  // Validate and normalize the sport
  const validSport: Sport = (SPORTS as readonly string[]).includes(sportFromPath)
    ? (sportFromPath as Sport)
    : "NFL"; // Default fallback

  const { tickets: arbTickets, loading: arbLoading, error: arbError } = useSportsArbTickets({ 
    league: validSport, 
    includeLive: true, 
    max: 20 
  });
  
  const { tickets: gameTickets, loading: gameLoading, error: gameError } = useSportsTickets({ 
    league: validSport, 
    includeSettled: true, 
    max: 20 
  });

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
    />
  );
};

export default SportsPage;


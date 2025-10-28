import React from "react";
import { useSportsArbTickets } from "../hooks/useSportsArbTickets";
import { useSportsTickets } from "../hooks/useSportsTickets";
import SportsPageLayout from "../components/layouts/SportsPageLayout";

const NFL: React.FC = () => {
  const { tickets: arbTickets, loading: arbLoading, error: arbError } = useSportsArbTickets({ 
    league: "NFL", 
    includeLive: true, 
    max: 20 
  });
  
  const { tickets: gameTickets, loading: gameLoading, error: gameError } = useSportsTickets({ 
    league: "NFL", 
    includeSettled: true, 
    max: 20 
  });

  return (
    <SportsPageLayout
      sportName="NFL"
      sportAbbreviation="NFL"
      arbTickets={arbTickets}
      gameTickets={gameTickets}
      arbLoading={arbLoading}
      gameLoading={gameLoading}
      arbError={arbError}
      gameError={gameError}
    />
  );
};


export default NFL;


import React from "react";
import { useSportsArbTickets } from "../hooks/useSportsArbTickets";
import { useSportsTickets } from "../hooks/useSportsTickets";
import SportsPageLayout from "../components/layouts/SportsPageLayout";

const MLB: React.FC = () => {
  const { tickets: arbTickets, loading: arbLoading, error: arbError } = useSportsArbTickets({ 
    league: "MLB", 
    includeLive: true, 
    max: 20 
  });
  
  const { tickets: gameTickets, loading: gameLoading, error: gameError } = useSportsTickets({ 
    league: "MLB", 
    includeSettled: true, 
    max: 20 
  });

  return (
    <SportsPageLayout
      sportName="MLB"
      sportAbbreviation="MLB"
      arbTickets={arbTickets}
      gameTickets={gameTickets}
      arbLoading={arbLoading}
      gameLoading={gameLoading}
      arbError={arbError}
      gameError={gameError}
    />
  );
};

export default MLB;

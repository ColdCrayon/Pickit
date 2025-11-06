// Updated types based on actual Firebase structure

export interface GameTicket {
  id: string;
  
  // New format (matches Firebase screenshot)
  league?: string;                    // e.g., "NBA"
  market?: string;                    // e.g., "spread"
  pickType?: string;                  // e.g., "Game Spread"
  description?: string;               // Description of the pick
  selectionTeam?: string;            // e.g., "Boston Celtics"
  selectionSide?: string;            // e.g., "-6.5"
  oddsAmerican?: number;             // e.g., -110
  externalUrl?: string;              // Link to sportsbook
  sportsbook?: string;               // e.g., "DraftKings"
  
  // Legacy/alternative field names (keeping for compatibility)
  pickGameInfo?: string;             
  pickDescription?: string;
  pickSportsbook?: string;    
  pickTeam?: string;          
  
  // Timestamps
  createdAt?: any;                   // Date | Timestamp | string
  updatedAt?: any;                   // Date | Timestamp | string (presence indicates "settled")
  pickPublishDate?: any;             // Date | Timestamp | string
  settleDate?: any;                  // Date | Timestamp | string | null
  
  // NOTE: GameTickets do NOT have serverSettled field
  // Instead, presence of updatedAt indicates the ticket is settled/completed
}

export interface ArbLeg {
  bookId: string;
  outcome: string;        // "home" | "away" | "over" | "under" | etc.
  priceDecimal: number;   // 2.1, 1.85, etc.
  stakePct?: number;      // e.g., 0.5 for 50%
}

export interface ArbTicket {
  id: string;
  league?: string;            // optional; add later if you want
  eventId?: string;
  marketId?: string;          // "moneyline", "spread", ...
  margin?: number;            // positive = edge
  legs: ArbLeg[];
  serverSettled: boolean;     // ArbTickets DO have serverSettled
  createdAt?: any;            // string | Timestamp | Date
  settleDate?: any;           
  pickPublishDate?: any;      
  // optional book shortcuts; some older docs may have these:
  sportsBook1?: string;
  sportsBook2?: string;
  pickOddsSB1?: string | number;
  pickOddsSB2?: string | number;
}
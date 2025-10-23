// “Tickets” DB == game picks from gameTickets collection
export interface GameTicket {
  id: string;
  league?: string;           
  pickDescription: string;   
  pickGameInfo: string;      
  pickPublishDate: Date;     
  pickSportsbook: string;    
  pickTeam: string;          
  pickType: string;          
  serverSettled: boolean;
  settleDate?: Date | null;
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
  serverSettled: boolean;
  createdAt?: any;            // string | Timestamp | Date  (we'll just show whatever)
  settleDate?: any;           // same
  pickPublishDate?: any;      // some data may have this instead of createdAt
  // optional book shortcuts; some older docs may have these:
  sportsBook1?: string;
  sportsBook2?: string;
  pickOddsSB1?: string | number;
  pickOddsSB2?: string | number;
}
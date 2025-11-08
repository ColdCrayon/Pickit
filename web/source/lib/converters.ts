/**
 * web/source/lib/converters.ts
 */

import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from "firebase/firestore";

export interface ArbTicket {
  id: string;
  eventId: string;
  marketId: string;
  legs: Array<{
    bookId: string;
    side: string;
    priceDecimal: number;
    stake: number;
  }>;
  margin: number;
  createdAt: Date;
  settleDate: Date;
  serverSettled: boolean;
}

export const arbTicketConverter = {
  toFirestore(ticket: Partial<ArbTicket>): DocumentData {
    const data: DocumentData = {};
    if (ticket.eventId) data.eventId = ticket.eventId;
    if (ticket.marketId) data.marketId = ticket.marketId;
    if (ticket.legs) data.legs = ticket.legs;
    if (ticket.margin !== undefined) data.margin = ticket.margin;
    if (ticket.createdAt) data.createdAt = Timestamp.fromDate(ticket.createdAt);
    if (ticket.settleDate)
      data.settleDate = Timestamp.fromDate(ticket.settleDate);
    if (ticket.serverSettled !== undefined)
      data.serverSettled = ticket.serverSettled;
    return data;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions
  ): ArbTicket {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      eventId: data.eventId || "",
      marketId: data.marketId || "",
      legs: data.legs || [],
      margin: data.margin || 0,
      createdAt: data.createdAt?.toDate() || new Date(),
      settleDate: data.settleDate?.toDate() || new Date(),
      serverSettled: data.serverSettled || false,
    };
  },
};

export interface GameTicket {
  id: string;
  sportsbook: string;
  league: string;
  market: "moneyline" | "spread" | "total" | "prop";
  selectionTeam?: string;
  selectionSide?: string;
  oddsAmerican: number;
  externalUrl?: string;
  description?: string;
  pickType?: string;
  settleDate?: Date | null;
  serverSettled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const gameTicketConverter = {
  toFirestore(ticket: Partial<GameTicket>): DocumentData {
    const data: DocumentData = {};
    if (ticket.sportsbook) data.sportsbook = ticket.sportsbook;
    if (ticket.league) data.league = ticket.league;
    if (ticket.market) data.market = ticket.market;
    if (ticket.selectionTeam !== undefined)
      data.selectionTeam = ticket.selectionTeam;
    if (ticket.selectionSide !== undefined)
      data.selectionSide = ticket.selectionSide;
    if (ticket.oddsAmerican !== undefined)
      data.oddsAmerican = ticket.oddsAmerican;
    if (ticket.externalUrl !== undefined) data.externalUrl = ticket.externalUrl;
    if (ticket.description !== undefined) data.description = ticket.description;
    if (ticket.pickType !== undefined) data.pickType = ticket.pickType;
    if (ticket.settleDate)
      data.settleDate = Timestamp.fromDate(ticket.settleDate);
    if (ticket.serverSettled !== undefined)
      data.serverSettled = ticket.serverSettled;
    if (ticket.createdAt) data.createdAt = Timestamp.fromDate(ticket.createdAt);
    if (ticket.updatedAt) data.updatedAt = Timestamp.fromDate(ticket.updatedAt);
    return data;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions
  ): GameTicket {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      sportsbook: data.sportsbook || "",
      league: data.league || "",
      market: data.market || "moneyline",
      selectionTeam: data.selectionTeam,
      selectionSide: data.selectionSide,
      oddsAmerican: data.oddsAmerican || 0,
      externalUrl: data.externalUrl,
      description: data.description,
      pickType: data.pickType,
      settleDate: data.settleDate?.toDate() || null,
      serverSettled: data.serverSettled || false,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  },
};

export interface UserTicket {
  id: string; // Document ID
  ticketId: string; // Reference to arbTickets or gameTickets
  ticketType: "arb" | "game";
  savedAt: Date;
  notificationSent: boolean;
  userId: string;
}

export const userTicketConverter = {
  toFirestore(userTicket: Partial<UserTicket>): DocumentData {
    const data: DocumentData = {};
    if (userTicket.ticketId) data.ticketId = userTicket.ticketId;
    if (userTicket.ticketType) data.ticketType = userTicket.ticketType;
    if (userTicket.savedAt)
      data.savedAt = Timestamp.fromDate(userTicket.savedAt);
    if (userTicket.notificationSent !== undefined) {
      data.notificationSent = userTicket.notificationSent;
    }
    if (userTicket.userId) data.userId = userTicket.userId;
    return data;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions
  ): UserTicket {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ticketId: data.ticketId || "",
      ticketType: data.ticketType || "game",
      savedAt: data.savedAt?.toDate() || new Date(),
      notificationSent: data.notificationSent || false,
      userId: data.userId || "",
    };
  },
};

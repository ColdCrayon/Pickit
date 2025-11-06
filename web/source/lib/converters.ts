import { Timestamp, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import { ArbTicket, GameTicket } from "../types/picks";

const passthroughDate = (v: any) => v ?? null; // we won't parse/convert now

export const arbTicketConverter = {
  toFirestore(t: ArbTicket) {
    return { ...t };
  },
  fromFirestore(snap: QueryDocumentSnapshot, options: SnapshotOptions): ArbTicket {
    const d = snap.data(options) as any;
    return {
      id: d.id ?? snap.id,
      league: d.league,
      eventId: d.eventId,
      marketId: d.marketId,
      margin: typeof d.margin === "number" ? d.margin : undefined,
      legs: Array.isArray(d.legs) ? d.legs : [],
      serverSettled: !!d.serverSettled,
      createdAt: passthroughDate(d.createdAt),
      settleDate: passthroughDate(d.settleDate),
      pickPublishDate: passthroughDate(d.pickPublishDate),
      sportsBook1: d.sportsBook1 ?? d.pickSportsbook ?? "",
      sportsBook2: d.sportsBook2 ?? "",
      pickOddsSB1: d.pickOddsSB1 ?? "",
      pickOddsSB2: d.pickOddsSB2 ?? "",
    };
  },
};

export const gameTicketConverter = {
  toFirestore(t: GameTicket) {
    return { ...t };
  },
  fromFirestore(snap: QueryDocumentSnapshot, options: SnapshotOptions): GameTicket {
    const d = snap.data(options) as any;
    return {
      id: d.id ?? snap.id,
      
      // New format fields (from Firebase screenshot)
      //league: d.league,
      market: d.market,
      pickType: d.pickType,
      description: d.description,
      selectionTeam: d.selectionTeam,
      selectionSide: d.selectionSide,
      oddsAmerican: d.oddsAmerican,
      sportsbook: d.sportsbook,
      externalUrl: d.externalUrl,
      
      // Legacy format fields (for backward compatibility)
      pickDescription: d.pickDescription,
      //description: d.description,
      pickSportsbook: d.pickSportsbook,
      pickTeam: d.pickTeam,
      
      // Timestamps
      createdAt: passthroughDate(d.createdAt),
      updatedAt: passthroughDate(d.updatedAt),
      settleDate: passthroughDate(d.settleDate),
      pickPublishDate: passthroughDate(d.pickPublishDate),
    };
  },
};



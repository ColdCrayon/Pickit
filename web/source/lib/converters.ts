import { Timestamp, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import {ArbTicket, GameTicket } from "../types/picks";

const toDate = (v: any): Date | null => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (v instanceof Timestamp) return v.toDate();
  // string like "Sep 22, 2025 at 9:54PM" or ISO
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

const passthroughDate = (v: any) => v ?? null; // we won’t parse/convert now

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
      league: d.league,
      pickDescription: d.pickDescription ?? "",
      pickGameInfo: d.pickGameInfo ?? "",
      pickPublishDate: passthroughDate(d.pickPublishDate),
      pickSportsbook: d.pickSportsbook ?? "",
      pickTeam: d.pickTeam ?? "",
      pickType: d.pickType ?? "",
      serverSettled: !!d.serverSettled,
      settleDate: passthroughDate(d.settleDate),
    };
  },
};



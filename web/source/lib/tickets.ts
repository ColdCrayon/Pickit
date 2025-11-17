import { db } from "./firebase";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";

export type TicketInput = {
  sportsbook: string;
  league: string;
  market: "moneyline" | "spread" | "total" | "prop";
  selectionTeam?: string;
  selectionSide?: string;
  oddsAmerican: number;
  externalUrl?: string;
  description?: string;
  pickType?: string;
  settleDate?: string | null; // <-- include this
};

export async function createTicket(input: TicketInput) {
  const col = collection(db, "gameTickets");
  const ref = doc(col);
  const id = ref.id;

  // explicit normalization (no undefined)
  const record: any = {
    id,
    sportsbook: input.sportsbook,
    league: input.league,
    market: input.market,
    selectionTeam: input.selectionTeam ?? null,
    selectionSide: input.selectionSide ?? null,
    oddsAmerican: input.oddsAmerican,
    externalUrl: input.externalUrl ?? null,
    description: input.description ?? null,
    pickType: input.pickType ?? null,
    settleDate: input.settleDate ?? null, // <-- use the UI value
    serverSettled: false, // always false on creation
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, record);
  return id;
}

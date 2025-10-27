import { db } from "./firebase";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";

export type TicketInput = {
  sportsbook: string; // e.g., "DraftKings"
  league: string; // e.g., "NHL"
  market: "moneyline" | "spread" | "total" | "prop";
  selectionTeam?: string; // e.g., "NYR"
  selectionSide?: string; // e.g., "Over", "+1.5", "Home"
  oddsAmerican: number; // e.g., -110, +145
  externalUrl?: string; // deep link to the book (optional)
  description?: string; // free text (optional)
  pickType?: string; // optional (kept for parity if your UI uses it)
};

export async function createTicket(input: TicketInput) {
  const col = collection(db, "gameTickets");
  const id = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14); // yyyymmddHHMMSS
  const ref = doc(col, id);

  const record = {
    id,
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, record, { merge: true });
  return id;
}

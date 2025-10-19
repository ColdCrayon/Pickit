// Defines how an arb ticket document should look
export const ArbTicketSchema = {
  eventId: "string",
  marketId: "string",
  legs: "array",
  margin: "number",
  createdAt: "timestamp",
  settleDate: "timestamp",
  serverSettled: "boolean"
};

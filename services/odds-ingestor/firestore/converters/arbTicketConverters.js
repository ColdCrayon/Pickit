import { Timestamp } from "firebase-admin/firestore";

export const arbTicketConverter = {
  toFirestore(ticket) {
    return {
      ...ticket,
      createdAt: ticket.createdAt || Timestamp.now(),
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ...data
    };
  }
};

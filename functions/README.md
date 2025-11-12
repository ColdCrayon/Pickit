# Firebase Functions

## Notifications
- Saved ticket notifications now read from the `users/{userId}/savedTickets/{ticketId}` subcollection via a collection group query. Ensure any migrations or seed scripts create saved ticket documents under the `savedTickets` subcollection so notifications resolve the correct user IDs.

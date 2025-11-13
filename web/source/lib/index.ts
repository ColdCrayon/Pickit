/**
 * web/source/lib/index.ts
 *
 * UPDATED for Week 1: Added new exports for user tickets and notifications
 */

// Firebase
export {
  auth,
  googleProvider,
  db,
  functions,
  upsertUserDoc,
  // NEW: FCM exports
  requestNotificationPermission,
  saveFcmToken,
  setupForegroundMessageHandler,
  disableNotifications,
} from "./firebase";

// Converters
export {
  arbTicketConverter,
  gameTicketConverter,
  userTicketConverter, // NEW
} from "./converters";

// NEW: Export UserTicket type
export type { UserTicket } from "./converters";

// Constants
export {
  SPORTS,
  ROUTES,
  SPORT_ROUTES,
  COLLECTIONS,
  USER_ROLES,
  DEFAULT_MAX_TICKETS,
  TICKET_TYPES, // NEW
} from "./constants";
export type { Sport, TicketType } from "./constants"; // NEW: TicketType

// Utilities
export {
  formatDate,
  formatPickDate,
  formatDateTime,
  formatRelativeDate,
} from "./utils";
export {
  americanToDecimal,
  decimalToAmerican,
  impliedProbability,
} from "./utils";
export { debounce, capitalize, formatPercent, truncate } from "./utils";

// Common Types
export type {
  LoadingState,
  ApiError,
  Nullable,
  Optional,
  AsyncState,
  PaginatedData,
  FilterOptions,
  UserRole,
  SportLeague,
  MarketType,
} from "./common-types";

// Error Handling
export {
  AppError,
  getErrorMessage,
  handleFirebaseError,
  logError,
  withErrorHandling,
  getSafeErrorMessage,
} from "./error-handler";

// Date Utils (for backward compatibility)
export { formatDate as formatDateAlt } from "./dateUtils";

// Tickets
export { createTicket } from "./tickets";
export type { TicketInput } from "./tickets";

// User Roles
export { setUserRoles } from "./setRoles";

// Payments
export { getStripe } from "./stripe";

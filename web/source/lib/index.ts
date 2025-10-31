// Centralized exports for all library utilities

// Firebase
export { auth, googleProvider, db, upsertUserDoc } from "./firebase";

// Converters
export { arbTicketConverter, gameTicketConverter } from "./converters";

// Constants
export { SPORTS, ROUTES, SPORT_ROUTES, COLLECTIONS, USER_ROLES, DEFAULT_MAX_TICKETS } from "./constants";
export type { Sport } from "./constants";

// Utilities
export { formatDate, formatPickDate, formatDateTime, formatRelativeDate } from "./utils";
export { americanToDecimal, decimalToAmerican, impliedProbability } from "./utils";
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
  MarketType
} from "./common-types";

// Error Handling
export { AppError, getErrorMessage, handleFirebaseError, logError, withErrorHandling, getSafeErrorMessage } from "./error-handler";

// Date Utils (for backward compatibility)
export { formatDate as formatDateAlt } from "./dateUtils";

// Tickets
export { createTicket } from "./tickets";
export type { TicketInput } from "./tickets";

// User Roles
export { setUserRoles } from "./setRoles";


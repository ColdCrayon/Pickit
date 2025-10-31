// Common types used across the application

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface ApiError {
  message: string;
  code?: string;
}

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

// Utility type for async state
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Base interface for paginated data
export interface PaginatedData<T> {
  items: T[];
  hasMore: boolean;
  lastDoc?: any;
}

// Base interface for filter options
export interface FilterOptions {
  league?: string;
  status?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// User role type
export interface UserRole {
  isPremium: boolean;
  isAdmin: boolean;
}

// Sports league type
export type SportLeague = "NFL" | "NBA" | "MLB" | "NHL";

// Market type for betting
export type MarketType = "moneyline" | "spread" | "total" | "prop";



/**
 * Formats a Firestore timestamp or date value to a readable string
 * Handles Date, Timestamp, string, or number formats
 */
export function formatDate(
  value: any,
  options: {
    includeTime?: boolean;
    relative?: boolean;
  } = {}
): string {
  if (!value) return "";

  let date: Date | null = null;

  try {
    // Handle different date formats
    if (value instanceof Date) date = value;
    else if (value && typeof value === "object" && "toDate" in value) {
      // Firestore Timestamp
      date = value.toDate();
    } else if (value && typeof value === "object" && typeof value.seconds === "number") {
      // Firestore Timestamp object
      date = new Date(value.seconds * 1000 + Math.floor((value.nanoseconds ?? 0) / 1e6));
    } else if (typeof value === "string") {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) date = parsed;
      else return value; // return unchanged if can't parse
    }

    if (!date || isNaN(date.getTime())) return "";

    // Handle relative dates
    if (options.relative) {
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

      if (diffInDays > 0) {
        return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
      } else if (diffInHours > 0) {
        return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
      } else if (diffInMinutes > 0) {
        return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
      } else {
        return "Just now";
      }
    }

    // Format the date
    const datePart = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (!options.includeTime) return datePart;

    const timePart = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${datePart} at ${timePart}`;
  } catch (error) {
    console.warn("Error formatting date:", error);
    return "";
  }
}

/**
 * Formats a date for pick cards (compact format)
 */
export function formatPickDate(dateValue: any): string {
  return formatDate(dateValue, { includeTime: false });
}

/**
 * Formats a date with time for detailed views
 */
export function formatDateTime(dateValue: any): string {
  return formatDate(dateValue, { includeTime: true });
}

/**
 * Formats a date as relative time (e.g., "2 days ago")
 */
export function formatRelativeDate(dateValue: any): string {
  return formatDate(dateValue, { relative: true });
}

/**
 * Converts American odds to decimal odds
 */
export function americanToDecimal(americanOdds: number): number {
  if (americanOdds > 0) {
    return (americanOdds / 100) + 1;
  } else {
    return (100 / Math.abs(americanOdds)) + 1;
  }
}

/**
 * Converts decimal odds to American odds
 */
export function decimalToAmerican(decimalOdds: number): string {
  if (decimalOdds >= 2) {
    return `+${((decimalOdds - 1) * 100).toFixed(0)}`;
  } else {
    return `-${(100 / (decimalOdds - 1)).toFixed(0)}`;
  }
}

/**
 * Calculates implied probability from decimal odds
 */
export function impliedProbability(decimalOdds: number): number {
  return 1 / decimalOdds;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Capitalizes first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats a percentage value
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Truncates a string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}


import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

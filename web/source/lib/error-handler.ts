// Centralized error handling utilities

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Safely extracts error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }
  return "An unknown error occurred";
}

/**
 * Handles Firebase errors and converts them to user-friendly messages
 */
export function handleFirebaseError(error: unknown): string {
  const message = getErrorMessage(error);

  // Firebase Auth errors
  if (message.includes("auth/")) {
    if (message.includes("auth/user-not-found")) {
      return "User not found.";
    }
    if (message.includes("auth/wrong-password")) {
      return "Incorrect password.";
    }
    if (message.includes("auth/email-already-in-use")) {
      return "Email is already registered.";
    }
    if (message.includes("auth/weak-password")) {
      return "Password is too weak.";
    }
    if (message.includes("auth/invalid-email")) {
      return "Invalid email address.";
    }
  }

  // Firestore errors
  if (message.includes("firestore/")) {
    if (message.includes("permission-denied")) {
      return "You don't have permission to perform this action.";
    }
    if (message.includes("not-found")) {
      return "Resource not found.";
    }
    if (message.includes("unavailable")) {
      return "Service temporarily unavailable. Please try again.";
    }
  }

  return message;
}

/**
 * Logs error to console (and potentially to monitoring service in production)
 */
export function logError(error: unknown, context?: string): void {
  const message = getErrorMessage(error);
  const logMessage = context ? `[${context}] ${message}` : message;

  if (import.meta.env.DEV) {
    console.error(logMessage, error);
  } else {
    // In production, you might want to send to error tracking service
    // e.g., Sentry, LogRocket, etc.
    console.error(logMessage);
  }
}

/**
 * Wraps async functions with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logError(error, context);
    throw error;
  }
}

/**
 * Returns a safe error message for UI display
 */
export function getSafeErrorMessage(error: unknown, defaultMessage: string = "An error occurred"): string {
  try {
    const message = getErrorMessage(error);
    return message || defaultMessage;
  } catch {
    return defaultMessage;
  }
}


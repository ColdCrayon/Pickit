/**
 * web/source/hooks/useAuth.ts
 *
 * Simple auth hook that wraps useUserPlan
 * This provides compatibility with the Week 1 notification hooks
 */

import { useUserPlan } from "./useUserPlan";

/**
 * Alias for useUserPlan to provide standard auth hook interface
 *
 * Usage:
 * ```tsx
 * const { user, loading, isPremium, isAdmin } = useAuth();
 * ```
 */
export function useAuth() {
  return useUserPlan();
}

/**
 * web/source/types/alerts.ts
 * Type definitions for custom alert rules and history
 */

import { Timestamp } from "firebase/firestore";
import { League, MarketKey } from "./events";

export type AlertCondition = 
  | "price_threshold" | "line_movement" | "arb_opportunity" 
  | "market_suspension" | "game_start";

export interface AlertRule {
  id: string;
  userId: string;
  name: string;
  description?: string;
  enabled: boolean;
  condition: AlertCondition;
  league?: League;
  eventId?: string;
  marketType?: MarketKey;
  teamName?: string;
  thresholdValue?: number;
  arbMinMargin?: number;
  snoozedUntil?: Timestamp | null;
  muted: boolean;
  lastTriggered?: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateAlertRuleInput = Omit<AlertRule, "id" | "userId" | "createdAt" | "updatedAt" | "lastTriggered" | "snoozedUntil">;

export interface AlertHistoryEntry {
  id: string;
  userId: string;
  ruleId?: string;
  ruleName: string;
  alertType: AlertCondition;
  eventId?: string;
  league?: League;
  teams?: { home: string; away: string };
  message: string;
  details: { oldValue?: number; newValue?: number; threshold?: number; arbMargin?: number; [key: string]: any };
  read: boolean;
  notificationSent: boolean;
  createdAt: Timestamp;
}

export const SNOOZE_DURATIONS = { ONE_HOUR: 1, SIX_HOURS: 6, TWENTY_FOUR_HOURS: 24, ONE_WEEK: 168 } as const;
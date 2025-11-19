/**
 * web/source/hooks/useAlertRules.ts
 * Hook for managing custom alert rules
 */

import { useState, useEffect } from "react";
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { AlertRule, CreateAlertRuleInput } from "../types/alerts";

export function useAlertRules(userId?: string) {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const rulesRef = collection(db, "users", userId, "alertRules");
    const q = query(rulesRef, where("userId", "==", userId));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const loadedRules = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as AlertRule));
        setRules(loadedRules);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const createRule = async (input: CreateAlertRuleInput): Promise<string> => {
    if (!userId) throw new Error("User not authenticated");
    
    const rulesRef = collection(db, "users", userId, "alertRules");
    const docRef = await addDoc(rulesRef, {
      ...input,
      userId,
      muted: false,
      lastTriggered: null,
      snoozedUntil: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return docRef.id;
  };

  const updateRule = async (ruleId: string, updates: Partial<AlertRule>): Promise<void> => {
    if (!userId) throw new Error("User not authenticated");
    
    const ruleRef = doc(db, "users", userId, "alertRules", ruleId);
    await updateDoc(ruleRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteRule = async (ruleId: string): Promise<void> => {
    if (!userId) throw new Error("User not authenticated");
    
    const ruleRef = doc(db, "users", userId, "alertRules", ruleId);
    await deleteDoc(ruleRef);
  };

  const toggleRule = async (ruleId: string, enabled: boolean): Promise<void> => {
    await updateRule(ruleId, { enabled });
  };

  const snoozeRule = async (ruleId: string, hours: number): Promise<void> => {
    const snoozedUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
    await updateRule(ruleId, { snoozedUntil: snoozedUntil as any });
  };

  const muteRule = async (ruleId: string): Promise<void> => {
    await updateRule(ruleId, { muted: true, enabled: false });
  };

  const unmuteRule = async (ruleId: string): Promise<void> => {
    await updateRule(ruleId, { muted: false, enabled: true });
  };

  return {
    rules,
    loading,
    error,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    snoozeRule,
    muteRule,
    unmuteRule,
  };
}
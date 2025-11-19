/**
 * web/source/hooks/useAlertHistory.ts
 * Hook for viewing alert notification history
 */

import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { AlertHistoryEntry } from "../types/alerts";

export function useAlertHistory(userId?: string, limitCount: number = 50) {
  const [history, setHistory] = useState<AlertHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const historyRef = collection(db, "users", userId, "alertHistory");
    const q = query(
      historyRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const entries = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as AlertHistoryEntry));
        setHistory(entries);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, limitCount]);

  const markAsRead = async (entryId: string): Promise<void> => {
    if (!userId) return;
    const entryRef = doc(db, "users", userId, "alertHistory", entryId);
    await updateDoc(entryRef, { read: true });
  };

  const markAllAsRead = async (): Promise<void> => {
    if (!userId) return;
    const updates = history
      .filter(entry => !entry.read)
      .map(entry => {
        const entryRef = doc(db, "users", userId, "alertHistory", entry.id);
        return updateDoc(entryRef, { read: true });
      });
    await Promise.all(updates);
  };

  const unreadCount = history.filter(entry => !entry.read).length;

  return {
    history,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
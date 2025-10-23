import { useEffect, useState } from "react";
import { onAuthStateChanged, getAuth, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

type PlanState = {
  user: User | null;
  loading: boolean;
  isPremium: boolean;
  isAdmin: boolean;
};

export function useUserPlan(): PlanState {
  const [state, setState] = useState<PlanState>({
    user: null,
    loading: true,
    isPremium: false,
    isAdmin: false,
  });

  useEffect(() => {
    const auth = getAuth();
    const off = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setState({ user: null, loading: false, isPremium: false, isAdmin: false });
        return;
      }
      // listen to /users/{uid}
      const ref = doc(db, "users", u.uid);
      const unsub = onSnapshot(
        ref,
        (snap) => {
          const d = snap.data() as any || {};
          setState({
            user: u,
            loading: false,
            isPremium: !!d.isPremium,
            isAdmin: !!d.isAdmin,
          });
        },
        () => {
          setState({ user: u, loading: false, isPremium: false, isAdmin: false });
        }
      );
      return () => unsub();
    });
    return () => off();
  }, []);

  return state;
}

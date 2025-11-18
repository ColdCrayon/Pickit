import { useEffect, useState } from "react";
import { onAuthStateChanged, getAuth, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib";

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
    let unsubscribeUserDoc: () => void = () => {};

    const off = onAuthStateChanged(auth, (u) => {
      unsubscribeUserDoc();
      unsubscribeUserDoc = () => {};

      if (!u) {
        setState({ user: null, loading: false, isPremium: false, isAdmin: false });
        return;
      }
      // listen to /users/{uid}
      const ref = doc(db, "users", u.uid);
      unsubscribeUserDoc = onSnapshot(
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
          const currentUser = auth.currentUser;
          if (!currentUser || currentUser.uid !== u.uid) {
            setState({ user: null, loading: false, isPremium: false, isAdmin: false });
            return;
          }

          setState({ user: u, loading: false, isPremium: false, isAdmin: false });
        }
      );
    });

    return () => {
      unsubscribeUserDoc();
      off();
    };
  }, []);

  return state;
}

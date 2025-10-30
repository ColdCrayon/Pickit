import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";

export type RolePayload = { uid: string; isAdmin: boolean; isPremium: boolean };

export async function setUserRoles(payload: RolePayload) {
  const fn = httpsCallable(getFunctions(), "setUserRoles");
  const res = await fn(payload);
  // If you changed your own roles, refresh your token to see it immediately.
  const auth = getAuth();
  if (auth.currentUser?.uid === payload.uid) {
    await auth.currentUser.getIdToken(true);
  }
  return res.data;
}

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Auth & DB
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Upsert user doc in Firestore
export async function upsertUserDoc(
  uid: string,
  data: {
    email: string;
    name?: string;
    username?: string;
    isAdmin?: boolean;
    isPremium?: boolean;
  }
) {
  await setDoc(
    doc(db, "users", uid),
    {
      id: uid,
      email: data.email,
      name: data.name ?? null,
      username: data.username ?? null,
      isAdmin: data.isAdmin ?? false,
      isPremium: data.isPremium ?? false,
      joined: serverTimestamp(),
      // Initialize empty watchlist
      watchlist: {
        teams: [],
        games: [],
        markets: [],
      },
      // Initialize default watchlist settings
      watchlistSettings: {
        enableNotifications: true,
        alertThreshold: 5.0,
        maxWatchlistItems: 50,
      },
    },
    { merge: true }
  );
}

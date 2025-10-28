import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/footer";
import { auth, googleProvider, upsertUserDoc, db } from "../lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail, // NEW
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useUserPlan } from "../hooks/useUserPlan";

type View = "signin" | "signup" | "forgot" | "profile";
const logo = "/logo.png";

type TabsProps = {
  view: View;
  setView: (v: View) => void;
  setMessage: (m: string | null) => void;
  setError: (e: string | null) => void;
};

// Wider, centered, glassy card
const Card: React.FC<{
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  wide?: boolean;
}> = ({ children, title, subtitle, wide }) => (
  <div
    className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-10 w-full ${
      wide ? "max-w-2xl" : "max-w-xl"
    } mx-auto shadow-2xl`}
  >
    <div className="flex flex-col items-center mb-6">
      <img
        src={logo}
        alt="PickIt"
        className="w-14 h-14 rounded-full border border-white/20 mb-3"
      />
      <h1 className="text-3xl font-bold">{title}</h1>
      {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const Tabs: React.FC<TabsProps> = ({ view, setView, setMessage, setError }) => (
  <div className="flex justify-center gap-3 mb-6">
    <button
      type="button"
      className={`px-4 py-2 rounded-xl border ${
        view === "signin"
          ? "bg-white/10 border-white/30"
          : "border-white/10 hover:bg-white/5"
      }`}
      onClick={() => {
        setView("signin");
        setMessage(null);
        setError(null);
      }}
    >
      Sign In
    </button>
    <button
      type="button"
      className={`px-4 py-2 rounded-xl border ${
        view === "signup"
          ? "bg-white/10 border-white/30"
          : "border-white/10 hover:bg-white/5"
      }`}
      onClick={() => {
        setView("signup");
        setMessage(null);
        setError(null);
      }}
    >
      Create Account
    </button>
    <button
      type="button"
      className={`px-4 py-2 rounded-xl border ${
        view === "forgot"
          ? "bg-white/10 border-white/30"
          : "border-white/10 hover:bg-white/5"
      }`}
      onClick={() => {
        setView("forgot");
        setMessage(null);
        setError(null);
      }}
    >
      Forgot Password
    </button>
  </div>
);

const Account: React.FC = () => {
  const [view, setView] = useState<View>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [busy, setBusy] = useState(false);
  const { isPremium, isAdmin, loading: userPlanLoading } = useUserPlan();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      // Don't call upsertUserDoc here - it would overwrite existing premium status
      // The user document should already exist from sign-up
      setMessage("Signed in!");
      // onAuthStateChanged will show profile
    } catch (err: any) {
      setError(err.message || "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }
      await upsertUserDoc(cred.user.uid, {
        email: cred.user.email || "",
        name: name || cred.user.displayName || "",
        username: username || email.split("@")[0],
        isAdmin: false,
        isPremium: false,
      });
      setMessage("Account created! You are signed in.");
      setView("profile");
    } catch (err: any) {
      setError(err.message || "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      // Only create user doc if it doesn't exist (for new Google users)
      // Don't overwrite existing premium status for returning users
      const userDocRef = doc(db, "users", cred.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // New user - create document
        await upsertUserDoc(cred.user.uid, {
          email: cred.user.email || "",
          name: cred.user.displayName || "",
          username: (cred.user.email || "").split("@")[0],
        });
      }
      setMessage("Signed in with Google!");
      setView("profile");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    setMessage("Signed out.");
    setView("signin");
  }

  // NEW: real forgot password
  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email.trim(), {
        url: `${window.location.origin}/account`,
        handleCodeInApp: false,
      });
      setMessage("Password reset email sent. Check your inbox.");
      setView("signin");
    } catch (err: any) {
      setError(err?.message || "Failed to send reset email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url('Background.jpeg')",
        }}
      />

      {/* Center everything under the fixed navbar height */}
      <main className="relative z-10 max-w-5xl mx-auto flex-1 py-28 px-6">
        <div className={`w-full ${user ? "max-w-3xl" : "max-w-2xl"} mx-auto`}>
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold">
              {user
                ? "Your Account"
                : view === "signup"
                ? "Create your account"
                : view === "forgot"
                ? "Reset your password"
                : "Sign in to PickIt"}
            </h1>
            <p className="text-gray-400 mt-2">
              Manage your PickIt profile and access
            </p>
          </div>

          {/* Signed-in profile view */}
          {user ? (
            <Card
              wide
              title="Your Profile"
              subtitle="Manage your membership and details"
            >
              <div className="space-y-4 text-gray-300">
                <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-between">
                  <span>Name</span>
                  <span className="font-semibold">
                    {user.displayName || "—"}
                  </span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-between">
                  <span>Email</span>
                  <span className="font-semibold break-all">{user.email}</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-between">
                  <span>Plan</span>
                  <span className="font-semibold">
                    {userPlanLoading
                      ? "Loading..."
                      : isPremium
                      ? "Premium"
                      : "Standard"}
                  </span>
                </div>
                <div className="flex gap-3 pt-2">
                  {!userPlanLoading && !isPremium && (
                    <Link
                      to="/upgrade"
                      className="px-5 py-2 rounded-xl bg-yellow-500/90 text-gray-900 font-semibold hover:bg-yellow-400"
                    >
                      Upgrade
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20"
                  >
                    Sign Out
                  </button>
                </div>
                {error && (
                  <p className="text-sm text-red-400 text-center">{error}</p>
                )}
                {message && (
                  <p className="text-sm text-yellow-400 text-center">
                    {message}
                  </p>
                )}
              </div>
            </Card>
          ) : (
            <>
              <Tabs
                view={view}
                setView={setView}
                setMessage={setMessage}
                setError={setError}
              />

              {/* SIGN IN */}
              {view === "signin" && (
                <Card title="Welcome back" subtitle="Use your email to sign in">
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                      required
                    />
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full px-4 py-3 rounded-xl bg-yellow-500/90 text-gray-900 font-semibold hover:bg-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {busy ? "Signing in..." : "Sign In"}
                    </button>
                    <button
                      type="button"
                      onClick={handleGoogle}
                      disabled={busy}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Sign in with Google
                    </button>
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setView("forgot");
                          setMessage(null);
                          setError(null);
                        }}
                        className="text-sm text-gray-400 hover:text-white"
                      >
                        Forgot password?
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setView("signup");
                          setMessage(null);
                          setError(null);
                        }}
                        className="text-sm text-gray-400 hover:text-white"
                      >
                        Create account
                      </button>
                    </div>
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    {message && (
                      <p className="text-sm text-yellow-400">{message}</p>
                    )}
                  </form>
                </Card>
              )}

              {/* SIGN UP */}
              {view === "signup" && (
                <Card title="Create your account" subtitle="Join PickIt">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                      required
                    />
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full px-4 py-3 rounded-xl bg-yellow-500/90 text-gray-900 font-semibold hover:bg-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {busy ? "Creating..." : "Create Account"}
                    </button>
                    <button
                      type="button"
                      onClick={handleGoogle}
                      disabled={busy}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Sign up with Google
                    </button>
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setView("signin");
                          setMessage(null);
                          setError(null);
                        }}
                        className="text-sm text-gray-400 hover:text-white"
                      >
                        Already have an account?
                      </button>
                    </div>
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    {message && (
                      <p className="text-sm text-yellow-400">{message}</p>
                    )}
                  </form>
                </Card>
              )}

              {/* FORGOT PASSWORD (REAL) */}
              {view === "forgot" && (
                <Card
                  title="Reset your password"
                  subtitle="We'll email you a reset link"
                >
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                      required
                    />
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full px-4 py-3 rounded-xl bg-yellow-500/90 text-gray-900 font-semibold hover:bg-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {busy ? "Sending..." : "Send reset link"}
                    </button>
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setView("signin");
                          setMessage(null);
                          setError(null);
                        }}
                        className="text-sm text-gray-400 hover:text-white"
                      >
                        Back to sign in
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setView("signup");
                          setMessage(null);
                          setError(null);
                        }}
                        className="text-sm text-gray-400 hover:text-white"
                      >
                        Create account
                      </button>
                    </div>
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    {message && (
                      <p className="text-sm text-yellow-400">{message}</p>
                    )}
                  </form>
                </Card>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;

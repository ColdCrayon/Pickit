import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase";
import { upsertUserDoc } from "../lib/firebase";
import { useUserPlan } from "../hooks";
import {
  BarChart3,
  TrendingUp,
  Zap,
  Shield,
  Users,
  Award,
  Bell,
  Star,
  ArrowRight,
  CheckCircle,
  Crown,
  Lock,
  Settings,
  CreditCard,
  Calendar,
  X,
} from "lucide-react";

/**
 * Account Page Component
 * Handles authentication and displays account information for signed-in users
 */
const Account: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [view, setView] = useState<"signin" | "signup" | "profile" | "forgot">(
    "signin"
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const { isPremium, isAdmin, loading: userPlanLoading } = useUserPlan();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        setView("profile");
      }
    });
    return () => unsubscribe();
  }, []);

  // Authentication handlers
  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setMessage("Signed in successfully!");
      setView("profile");
    } catch (err: any) {
      setError(err.message || "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      await upsertUserDoc(cred.user.uid, {
        email: cred.user.email || "",
        name: name.trim() || "",
        username: (cred.user.email || "").split("@")[0],
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
      const userDocRef = doc(db, "users", cred.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
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

      {/* Subscription Management Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal
          isPremium={isPremium}
          onClose={() => setShowSubscriptionModal(false)}
        />
      )}

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto flex-1 py-28 px-6">
        <div className={`w-full ${user ? "max-w-5xl" : "max-w-2xl"} mx-auto`}>
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
              {user
                ? "Manage your PickIt profile and access"
                : "Access data-driven sports betting insights"}
            </p>
          </div>

          {/* Signed-in Profile View */}
          {user ? (
            <div className="space-y-6">
              {/* Account Overview Card */}
              <Card>
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        {user.displayName || user.email?.split("@")[0]}
                      </h2>
                      <p className="text-gray-400">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isPremium ? (
                        <span className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-xl border border-yellow-500/30">
                          <Crown className="w-4 h-4" />
                          Premium Member
                        </span>
                      ) : (
                        <span className="px-4 py-2 bg-white/5 text-gray-400 rounded-xl border border-white/10">
                          Standard Plan
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {!userPlanLoading && !isPremium && (
                      <Link
                        to="/upgrade"
                        className="px-5 py-2 rounded-xl bg-yellow-500/90 text-gray-900 font-semibold hover:bg-yellow-400 transition"
                      >
                        Upgrade to Premium
                      </Link>
                    )}
                    {!userPlanLoading && isPremium && (
                      <button
                        type="button"
                        onClick={() => setShowSubscriptionModal(true)}
                        className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Manage Subscription
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
                    >
                      Sign Out
                    </button>
                  </div>

                  {error && (
                    <p className="text-sm text-red-400 bg-red-500/10 px-4 py-2 rounded-lg">
                      {error}
                    </p>
                  )}
                  {message && (
                    <p className="text-sm text-yellow-400 bg-yellow-500/10 px-4 py-2 rounded-lg">
                      {message}
                    </p>
                  )}
                </div>
              </Card>

              {/* Quick Access Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Quick Access
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Pro Dashboard - Always visible but locked for standard users */}
                  {isPremium ? (
                    <QuickAccessCard
                      to="/dashboard"
                      icon={<BarChart3 className="w-6 h-6" />}
                      title="Pro Dashboard"
                      description="Your command center"
                    />
                  ) : (
                    <LockedQuickAccessCard
                      icon={<BarChart3 className="w-6 h-6" />}
                      title="Pro Dashboard"
                      description="Upgrade to unlock"
                      onUpgradeClick={() => {}}
                    />
                  )}
                  <QuickAccessCard
                    to="/news"
                    icon={<Award className="w-6 h-6" />}
                    title="Sports News"
                    description="Latest updates"
                  />
                  <QuickAccessCard
                    to="/picks"
                    icon={<TrendingUp className="w-6 h-6" />}
                    title="Free Picks"
                    description="Daily predictions"
                  />
                </div>
              </div>

              {/* Subscription Info Card (for Premium users) */}
              {isPremium && (
   <div className="mt-10">
    <Card>
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-yellow-400" />
            Subscription Details
          </h3>
          <div className="space-y-3 text-gray-300 pl-7">
            <p className="flex items-center gap-2 text-base">
              <Calendar className="w-4 h-4" />
              <span>Premium Plan - Monthly</span>
            </p>
            <p className="text-sm text-gray-400 pl-6">
              Next billing date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSubscriptionModal(true)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition text-sm flex items-center gap-2 shrink-0"
        >
          <Settings className="w-4 h-4" />
          Manage
        </button>
      </div>
    </Card>
  </div>
)}

              {/* Plan Features */}
              <Card>
                <h3 className="text-xl font-semibold mb-4">
                  {isPremium ? "Your Premium Features" : "Available Features"}
                </h3>
                <div className="space-y-3">
                  <FeatureItem
                    icon={<BarChart3 className="w-5 h-5" />}
                    text="Real-time odds aggregation from 10+ sportsbooks"
                    available={isPremium}
                  />
                  <FeatureItem
                    icon={<TrendingUp className="w-5 h-5" />}
                    text="AI-powered predictions and analytics"
                    available={isPremium}
                  />
                  <FeatureItem
                    icon={<Zap className="w-5 h-5" />}
                    text="Arbitrage opportunity detection"
                    available={isPremium}
                  />
                  <FeatureItem
                    icon={<Bell className="w-5 h-5" />}
                    text="Custom alerts and notifications"
                    available={isPremium}
                  />
                  <FeatureItem
                    icon={<Shield className="w-5 h-5" />}
                    text="Risk management and bankroll tools"
                    available={isPremium}
                  />
                  <FeatureItem
                    icon={<Users className="w-5 h-5" />}
                    text="Expert community access"
                    available={isPremium}
                  />
                  <FeatureItem
                    icon={<Award className="w-5 h-5" />}
                    text="Multi-sport coverage (MLB, NFL, NBA, NHL)"
                    available={true}
                  />
                  <FeatureItem
                    icon={<Star className="w-5 h-5" />}
                    text="Daily free picks and insights"
                    available={true}
                  />
                </div>

                {!isPremium && (
                  <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <p className="text-sm text-yellow-400 mb-3">
                      <strong>Unlock Premium Features:</strong> Get access to
                      advanced analytics, arbitrage detection, and personalized
                      insights to maximize your betting strategy.
                    </p>
                    <Link
                      to="/upgrade"
                      className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-semibold"
                    >
                      View Premium Plans
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </Card>

              {/* About PickIt */}
              <Card>
                <h3 className="text-xl font-semibold mb-4">About PickIt</h3>
                <div className="space-y-4 text-gray-300">
                  <p>
                    <strong className="text-white">PickIt</strong> is your
                    data-driven sports betting companion. We combine historical
                    data, real-time odds, and machine learning to help you make
                    smarter, more informed betting decisions.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InfoBox
                      title="Our Mission"
                      text="Transform sports betting from guesswork into strategy through data-driven insights and responsible betting practices."
                    />
                    <InfoBox
                      title="The Technology"
                      text="Powered by advanced algorithms that analyze thousands of games and line movements to uncover hidden probabilities."
                    />
                  </div>
                  <p className="text-sm italic border-l-4 border-yellow-500/50 pl-4 py-2">
                    <strong>Important:</strong> PickIt provides betting insights
                    and analytics for informational and entertainment purposes
                    only. We do not facilitate real-money gambling. Always bet
                    responsibly.
                  </p>
                  <div className="flex gap-4">
                    <Link
                      to="/about"
                      className="text-yellow-400 hover:text-yellow-300 font-semibold flex items-center gap-2"
                    >
                      Learn More About Us
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/support"
                      className="text-gray-400 hover:text-white font-semibold flex items-center gap-2"
                    >
                      Contact Support
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </Card>

              {/* Resources */}
              <Card>
                <h3 className="text-xl font-semibold mb-4">Resources</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <ResourceLink
                    to="/terms"
                    title="Terms of Service"
                    description="Our usage terms and policies"
                  />
                  <ResourceLink
                    to="/privacy"
                    title="Privacy Policy"
                    description="How we protect your data"
                  />
                  <ResourceLink
                    to="/support"
                    title="Support Center"
                    description="Get help and answers"
                  />
                </div>
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <p className="text-sm text-blue-300">
                    <strong>Need Help?</strong> If you or someone you know has a
                    gambling problem, please contact the National Council on
                    Problem Gambling at <strong>1-800-522-4700</strong>
                  </p>
                </div>
              </Card>
            </div>
          ) : (
            <>
              {/* Auth Tabs */}
              <Tabs
                view={view}
                setView={setView}
                setMessage={setMessage}
                setError={setError}
              />

              {/* Sign In Form */}
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
                      className="w-full px-4 py-3 rounded-xl bg-yellow-500/90 text-gray-900 font-semibold hover:bg-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                      {busy ? "Signing in..." : "Sign In"}
                    </button>
                    <button
                      type="button"
                      onClick={handleGoogle}
                      disabled={busy}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                      Sign in with Google
                    </button>
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
                  </form>
                  {error && (
                    <p className="text-sm text-red-400 mt-4">{error}</p>
                  )}
                  {message && (
                    <p className="text-sm text-yellow-400 mt-4">{message}</p>
                  )}
                </Card>
              )}

              {/* Sign Up Form */}
              {view === "signup" && (
                <Card
                  title="Create your account"
                  subtitle="Join PickIt and start making smarter bets"
                >
                  <form onSubmit={handleEmailSignUp} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                      className="w-full px-4 py-3 rounded-xl bg-yellow-500/90 text-gray-900 font-semibold hover:bg-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                      {busy ? "Creating account..." : "Create Account"}
                    </button>
                    <button
                      type="button"
                      onClick={handleGoogle}
                      disabled={busy}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                      Sign up with Google
                    </button>
                  </form>
                  {error && (
                    <p className="text-sm text-red-400 mt-4">{error}</p>
                  )}
                  {message && (
                    <p className="text-sm text-yellow-400 mt-4">{message}</p>
                  )}
                </Card>
              )}

              {/* Forgot Password Form */}
              {view === "forgot" && (
                <Card
                  title="Reset your password"
                  subtitle="Enter your email to receive a reset link"
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
                      className="w-full px-4 py-3 rounded-xl bg-yellow-500/90 text-gray-900 font-semibold hover:bg-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                      {busy ? "Sending..." : "Send Reset Link"}
                    </button>
                  </form>
                  {error && (
                    <p className="text-sm text-red-400 mt-4">{error}</p>
                  )}
                  {message && (
                    <p className="text-sm text-yellow-400 mt-4">{message}</p>
                  )}
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

// Subscription Management Modal Component
const SubscriptionModal: React.FC<{
  isPremium: boolean;
  onClose: () => void;
}> = ({ isPremium, onClose }) => {
  const [cancelConfirm, setCancelConfirm] = useState(false);


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-800 bordeßr border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-yellow-400" />
            Manage Subscription
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Plan */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Premium Plan
              </h3>
              <p className="text-gray-400">Monthly subscription</p>
            </div>
            <span className="text-2xl font-bold text-yellow-400">$19.99/mo</span>
          </div>
          <div className="space-y-2 text-sm text-gray-300">
            <p className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Started: {new Date().toLocaleDateString()}
            </p>
            <p className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Next billing: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-yellow-400" />
            Payment Method
          </h3>
          <div className="flex items-center justify-between bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded flex items-center justify-center text-xs font-bold text-white">
                VISA
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-400">Expires 12/25</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition">
              Update
            </button>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-4">Billing History</h3>
          <div className="space-y-3">
            <BillingHistoryItem
              date="Nov 1, 2024"
              amount="$19.99"
              status="Paid"
            />
            <BillingHistoryItem
              date="Oct 1, 2024"
              amount="$19.99"
              status="Paid"
            />
            <BillingHistoryItem
              date="Sep 1, 2024"
              amount="$19.99"
              status="Paid"
            />
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition">
            View All Transactions
          </button>
        </div>

        {/* Cancel Subscription */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <h3 className="font-semibold mb-2 text-red-400">Cancel Subscription</h3>
          <p className="text-sm text-gray-300 mb-4">
            You'll lose access to all premium features at the end of your current
            billing period.
          </p>
          {!cancelConfirm ? (
            <button
              onClick={() => setCancelConfirm(true)}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm transition"
            >
              Cancel Subscription
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-yellow-400">
                Are you sure? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm transition">
                  Yes, Cancel
                </button>
                <button
                  onClick={() => setCancelConfirm(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition"
                >
                  Keep Subscription
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const Card: React.FC<{
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
    {title && (
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);

const Tabs: React.FC<{
  view: string;
  setView: (view: "signin" | "signup" | "profile" | "forgot") => void;
  setMessage: (msg: string | null) => void;
  setError: (err: string | null) => void;
}> = ({ view, setView, setMessage, setError }) => (
  <div className="flex gap-2 mb-6 bg-white/5 p-2 rounded-2xl">
    <button
      onClick={() => {
        setView("signin");
        setMessage(null);
        setError(null);
      }}
      className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${
        view === "signin"
          ? "bg-white text-gray-900"
          : "bg-transparent text-gray-400 hover:text-white"
      }`}
    >
      Sign In
    </button>
    <button
      onClick={() => {
        setView("signup");
        setMessage(null);
        setError(null);
      }}
      className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${
        view === "signup"
          ? "bg-white text-gray-900"
          : "bg-transparent text-gray-400 hover:text-white"
      }`}
    >
      Sign Up
    </button>
  </div>
);

const QuickAccessCard: React.FC<{
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ to, icon, title, description }) => (
  <Link
    to={to}
    className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition group"
  >
    <div className="text-yellow-400 mb-3">{icon}</div>
    <h4 className="font-semibold mb-1 group-hover:text-yellow-400 transition">
      {title}
    </h4>
    <p className="text-sm text-gray-400">{description}</p>
  </Link>
);

const LockedQuickAccessCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onUpgradeClick: () => void;
}> = ({ icon, title, description }) => (
  <Link
    to="/upgrade"
    className="bg-white/5 border border-yellow-500/30 rounded-2xl p-5 relative overflow-hidden hover:bg-white/10 transition group"
  >
    <div className="absolute top-3 right-3">
      <Lock className="w-5 h-5 text-yellow-400" />
    </div>
    <div className="text-gray-500 group-hover:text-yellow-400 mb-3 transition">
      {icon}
    </div>
    <h4 className="font-semibold mb-1 text-gray-300 group-hover:text-yellow-400 transition">
      {title}
    </h4>
    <p className="text-sm text-gray-500 group-hover:text-gray-400 transition">
      {description}
    </p>
  </Link>
);

const FeatureItem: React.FC<{
  icon: React.ReactNode;
  text: string;
  available: boolean;
}> = ({ icon, text, available }) => (
  <div className="flex items-start gap-3">
    <div
      className={`mt-1 ${available ? "text-yellow-400" : "text-gray-600"}`}
    >
      {available ? <CheckCircle className="w-5 h-5" /> : icon}
    </div>
    <span className={available ? "text-white" : "text-gray-500"}>{text}</span>
  </div>
);

const InfoBox: React.FC<{ title: string; text: string }> = ({
  title,
  text,
}) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
    <h4 className="font-semibold text-white mb-2">{title}</h4>
    <p className="text-sm text-gray-400">{text}</p>
  </div>
);

const ResourceLink: React.FC<{
  to: string;
  title: string;
  description: string;
}> = ({ to, title, description }) => (
  <Link
    to={to}
    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition group"
  >
    <h4 className="font-semibold mb-1 group-hover:text-yellow-400 transition">
      {title}
    </h4>
    <p className="text-sm text-gray-400">{description}</p>
  </Link>
);

const BillingHistoryItem: React.FC<{
  date: string;
  amount: string;
  status: string;
}> = ({ date, amount, status }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
    <div>
      <p className="font-medium">{date}</p>
      <p className="text-sm text-gray-400">Premium Plan</p>
    </div>
    <div className="text-right">
      <p className="font-medium">{amount}</p>
      <p className="text-sm text-green-400">{status}</p>
    </div>
  </div>
);

export default Account;
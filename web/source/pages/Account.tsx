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
import { useNotifications } from "../hooks/useNotifications";
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

  // ADD THIS: Use the notifications hook
  const {
    permission,
    enabled,
    requestPermission,
    disableNotifications,
    loading: notifLoading,
  } = useNotifications();

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
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Subscription Management Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal
          isPremium={isPremium}
          onClose={() => setShowSubscriptionModal(false)}
        />
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto flex-1 py-28 px-6 w-full">
        <div className={`w-full ${user ? "" : "max-w-2xl mx-auto"}`}>
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
                </div>
              </Card>

              {/* Quick Access Cards */}
              <div className="mt-10">
                <h3 className="text-xl font-semibold mb-4">Quick Access</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    to="/FreePicks"
                    icon={<TrendingUp className="w-6 h-6" />}
                    title="Free Picks"
                    description="Daily predictions"
                  />
                </div>
              </div>

              {/* NOTIFICATION SETTINGS CARD - ADD THIS */}
              <div className="mt-10">
                <Card
                  title="Push Notifications"
                  subtitle="Get alerts for your saved tickets"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Bell className="w-6 h-6 text-blue-400 mt-1" />
                      <div>
                        <p className="text-gray-400 mb-4">
                          Get notified when your saved tickets update or settle
                        </p>

                        {/* Permission status */}
                        <div className="flex items-center gap-2 text-sm">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              enabled
                                ? "bg-green-400"
                                : permission === "denied"
                                ? "bg-red-400"
                                : "bg-gray-400"
                            }`}
                          />
                          <span className="text-gray-300">
                            {enabled
                              ? "Notifications enabled"
                              : permission === "denied"
                              ? "Notifications blocked"
                              : "Notifications not enabled"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Enable/Disable button */}
                    <div>
                      {!enabled && permission !== "denied" && (
                        <button
                          onClick={requestPermission}
                          disabled={notifLoading}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {notifLoading
                            ? "Enabling..."
                            : "Enable Notifications"}
                        </button>
                      )}
                      {enabled && (
                        <button
                          onClick={disableNotifications}
                          disabled={notifLoading}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {notifLoading ? "Disabling..." : "Disable"}
                        </button>
                      )}
                      {permission === "denied" && (
                        <div className="text-sm text-gray-400 max-w-xs">
                          <p className="mb-2">Notifications are blocked.</p>
                          <p>
                            To enable, go to your browser settings and allow
                            notifications for this site.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
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
                            Next billing date:{" "}
                            {new Date(
                              Date.now() + 30 * 24 * 60 * 60 * 1000
                            ).toLocaleDateString()}
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
                  {isPremium ? "Premium Features" : "Available with Premium"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FeatureItem
                    icon={<BarChart3 className="w-5 h-5" />}
                    text="Pro Dashboard with real-time data"
                    available={isPremium}
                  />
                  <FeatureItem
                    icon={<TrendingUp className="w-5 h-5" />}
                    text="Advanced betting analytics"
                    available={isPremium}
                  />
                  <FeatureItem
                    icon={<Zap className="w-5 h-5" />}
                    text="Priority support"
                    available={isPremium}
                  />
                  <FeatureItem
                    icon={<Bell className="w-5 h-5" />}
                    text="Instant notifications"
                    available={isPremium}
                  />
                  <FeatureItem
                    icon={<Star className="w-5 h-5" />}
                    text="Custom watchlists"
                    available={isPremium}
                  />
                  <FeatureItem
                    icon={<Shield className="w-5 h-5" />}
                    text="Early access to new features"
                    available={isPremium}
                  />
                </div>

                {!isPremium && (
                  <div className="mt-6">
                    <Link
                      to="/upgrade"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500/90 hover:bg-yellow-400 text-gray-900 font-bold rounded-xl transition"
                    >
                      Upgrade Now
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                )}
              </Card>

              {/* Help & Resources */}
              <Card title="Help & Resources">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ResourceLink
                    to="/support"
                    title="Support Center"
                    description="Get help with your account"
                  />
                  <ResourceLink
                    to="/privacy"
                    title="Privacy Policy"
                    description="How we protect your data"
                  />
                  <ResourceLink
                    to="/termsofservice"
                    title="Terms of Service"
                    description="User agreement and guidelines"
                  />
                  <ResourceLink
                    to="/about"
                    title="About PickIt"
                    description="Learn more about our platform"
                  />
                </div>
              </Card>
            </div>
          ) : (
            <Card>
              {/* Auth forms - Not showing the full code, it's unchanged */}
              {view !== "forgot" && (
                <Tabs
                  view={view}
                  setView={setView}
                  setMessage={setMessage}
                  setError={setError}
                />
              )}

              {/* Messages */}
              {message && (
                <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-300">
                  {message}
                </div>
              )}
              {error && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
                  {error}
                </div>
              )}

              {/* Sign In Form */}
              {view === "signin" && (
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full px-6 py-3 bg-yellow-500/90 hover:bg-yellow-400 text-gray-900 font-bold rounded-xl transition disabled:opacity-50"
                  >
                    {busy ? "Signing in..." : "Sign In"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("forgot")}
                    className="w-full text-sm text-gray-400 hover:text-white transition"
                  >
                    Forgot password?
                  </button>
                </form>
              )}

              {/* Sign Up Form */}
              {view === "signup" && (
                <form onSubmit={handleEmailSignUp} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full px-6 py-3 bg-yellow-500/90 hover:bg-yellow-400 text-gray-900 font-bold rounded-xl transition disabled:opacity-50"
                  >
                    {busy ? "Creating account..." : "Sign Up"}
                  </button>
                </form>
              )}

              {/* Forgot Password Form */}
              {view === "forgot" && (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <p className="text-gray-400 mb-4">
                    Enter your email address and we'll send you a link to reset
                    your password.
                  </p>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full px-6 py-3 bg-yellow-500/90 hover:bg-yellow-400 text-gray-900 font-bold rounded-xl transition disabled:opacity-50"
                  >
                    {busy ? "Sending..." : "Send Reset Link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("signin")}
                    className="w-full text-sm text-gray-400 hover:text-white transition"
                  >
                    Back to Sign In
                  </button>
                </form>
              )}

              {/* Google Sign In */}
              {view !== "forgot" && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gray-900 text-gray-400">Or</span>
                    </div>
                  </div>

                  <button
                    onClick={handleGoogle}
                    disabled={busy}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl transition disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </>
              )}

              {/* Additional Info */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoBox
                  title="Premium Access"
                  text="Unlock advanced analytics and real-time betting insights"
                />
                <InfoBox
                  title="Secure & Private"
                  text="Your data is encrypted and protected at all times"
                />
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

// Subscription Modal Component
const SubscriptionModal: React.FC<{
  isPremium: boolean;
  onClose: () => void;
}> = ({ isPremium, onClose }) => {
  const [cancelConfirm, setCancelConfirm] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-800 border border-white/20 rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Manage Subscription</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Plan */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            Current Plan
          </h3>
          <div className="space-y-3">
            <p className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Premium Plan - $19.99/month
            </p>
            <p className="text-sm text-gray-400 flex items-center gap-2 pl-7">
              <Calendar className="w-4 h-4" />
              Next billing:{" "}
              {new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toLocaleDateString()}
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
          <h3 className="font-semibold mb-2 text-red-400">
            Cancel Subscription
          </h3>
          <p className="text-sm text-gray-300 mb-4">
            You'll lose access to all premium features at the end of your
            current billing period.
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
    <div className={`mt-1 ${available ? "text-yellow-400" : "text-gray-600"}`}>
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

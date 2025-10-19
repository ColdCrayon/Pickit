import React, { useEffect, useState } from "react";

type View = "signin" | "signup" | "forgot" | "profile";

const logo = "/logo.png";


const STORAGE_KEY = "pickit_mock_user";

interface MockUser {
  name: string;
  email: string;
}

const Account: React.FC = () => {
  const [view, setView] = useState<View>("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed: MockUser = JSON.parse(raw);
        setUser(parsed);
        setView("profile");
      } catch {
        // ignore
      }
    }
  }, []);

  const resetForm = () => {
    setEmail("");
    setName("");
    setPassword("");
    setMessage(null);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setMessage("No account found. Create one first.");
      return;
    }
    const u: MockUser = JSON.parse(raw);
    if (email.toLowerCase() === u.email.toLowerCase() && password.length >= 6) {
      setUser(u);
      setView("profile");
      setMessage(null);
      resetForm();
    } else {
      setMessage("Invalid credentials. (Mock check: email match + password length ≥ 6)");
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 6) {
      setMessage("Please provide name, email and a password with at least 6 characters.");
      return;
    }
    const newUser: MockUser = { name: name.trim(), email: email.trim() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
    setView("profile");
    setMessage(null);
    resetForm();
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    // purely mock: show a toast-like message
    if (!email.trim()) {
      setMessage("Enter your email to receive a reset link (mock).");
      return;
    }
    setMessage(`If an account exists for ${email}, a reset link has been sent (mock).`);
  };

  const handleSignOut = () => {
    setUser(null);
    setView("signin");
    setMessage("Signed out.");
  };

  // shared card container
  const Card: React.FC<{ children: React.ReactNode; title: string; subtitle?: string }> = ({ children, title, subtitle }) => (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 w-full max-w-xl">
      <div className="flex flex-col items-center mb-6">
        <img src={logo} alt="PickIt" className="w-14 h-14 rounded-full border border-white/20 mb-3" />
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );

  // tab buttons
  const Tabs = () => (
    <div className="flex justify-center gap-3 mb-6">
      <button
        className={`px-4 py-2 rounded-xl border ${view === "signin" ? "bg-white/10 border-white/30" : "border-white/10 hover:bg-white/5"}`}
        onClick={() => { setView("signin"); setMessage(null); }}
      >
        Sign In
      </button>
      <button
        className={`px-4 py-2 rounded-xl border ${view === "signup" ? "bg-white/10 border-white/30" : "border-white/10 hover:bg-white/5"}`}
        onClick={() => { setView("signup"); setMessage(null); }}
      >
        Create Account
      </button>
      <button
        className={`px-4 py-2 rounded-xl border ${view === "forgot" ? "bg-white/10 border-white/30" : "border-white/10 hover:bg-white/5"}`}
        onClick={() => { setView("forgot"); setMessage(null); }}
      >
        Forgot Password
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url('Background.jpeg')",
        }}
      />

      <main className="relative z-10 max-w-5xl mx-auto py-20 px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-5xl font-bold">Account</h2>
          <p className="text-gray-400 mt-2">Manage your PickIt profile and access</p>
        </div>

        {/* Signed-in profile view */}
        {view === "profile" && user ? (
          <Card title="Your Profile" subtitle="This is a mocked profile view">
            <div className="space-y-4 text-gray-300">
              <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-between">
                <span>Name</span>
                <span className="font-semibold">{user.name}</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-between">
                <span>Email</span>
                <span className="font-semibold">{user.email}</span>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setMessage("This is a mock system — no real password to change.")}
                  className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20"
                >
                  Change Password
                </button>
                <button
                  onClick={handleSignOut}
                  className="px-5 py-2 rounded-xl bg-yellow-500/90 text-gray-900 font-semibold hover:bg-yellow-400"
                >
                  Sign Out
                </button>
              </div>
              {message && <p className="text-sm text-yellow-400">{message}</p>}
            </div>
          </Card>
        ) : (
          // Auth tabs (Sign in / Sign up / Forgot)
          <div className="flex flex-col items-center">
            <Tabs />
            {view === "signin" && (
              <Card title="Welcome back" subtitle="Sign in to continue">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email"
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
                    className="w-full px-4 py-3 rounded-xl bg-yellow-500/90 text-gray-900 font-semibold hover:bg-yellow-400"
                  >
                    Sign In
                  </button>
                  {message && <p className="text-sm text-yellow-400">{message}</p>}
                </form>
              </Card>
            )}

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
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-3 rounded-xl bg-yellow-500/90 text-gray-900 font-semibold hover:bg-yellow-400"
                  >
                    Create Account
                  </button>
                  {message && <p className="text-sm text-yellow-400">{message}</p>}
                </form>
              </Card>
            )}

            {view === "forgot" && (
              <Card title="Reset your password" subtitle="We’ll send a reset link (mock)">
                <form onSubmit={handleForgot} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20"
                  >
                    Send Reset Link
                  </button>
                  {message && <p className="text-sm text-yellow-400">{message}</p>}
                </form>
              </Card>
            )}
          </div>
        )}
      </main>

      <footer className="relative z-10 py-12 px-6 border-t border-white/10 text-center">
        <p className="text-gray-400 text-sm">© 2025 PickIt. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Account;

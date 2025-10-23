import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const logo = "/logo.png";

const tiers = [
  {
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    tagline: "Get started with core insights",
    features: [
      "Basic insights & trends",
      "Limited picks per week",
      "Single-sportsbook view",
      "Email support (48–72h)",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    priceMonthly: 14.99,
    priceYearly: 119.99, // ~33% off
    tagline: "Advanced analytics for serious fans",
    features: [
      "Algorithmic picks (daily)",
      "Multi-sportsbook odds comparison",
      "Arbitrage alerts (basic)",
      "Priority support (24–48h)",
      "Personalized dashboard",
    ],
    cta: "Upgrade to Pro",
    highlight: true,
  },
  {
    name: "Elite",
    priceMonthly: 29.99,
    priceYearly: 239.99, // ~33% off
    tagline: "Full power: arbitrage + pro tooling",
    features: [
      "All Pro features",
      "Advanced arbitrage tools",
      "Custom watchlists & notifications",
      "Export & API (limited)",
      "Priority support (<24h)",
    ],
    cta: "Go Elite",
    highlight: false,
  },
];

const Upgrade: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const navigate = useNavigate();

  const formatPrice = (t: (typeof tiers)[number]) => {
    const val = billingCycle === "monthly" ? t.priceMonthly : t.priceYearly;
    if (val === 0) return "Free";
    return billingCycle === "monthly" ? `$${val.toFixed(2)}/mo` : `$${val.toFixed(2)}/yr`;
  };

  const handleUpgrade = (plan: string) => {
    // 👇 Placeholder flow (keeps UX smooth now)
    // Later: replace with Stripe Checkout → on success write plan to Firestore
    if (plan === "Free") {
      // Send users to account to manage plan or sign in
      navigate("/account");
      return;
    }
    // Example future: navigate(`/checkout?plan=${plan.toLowerCase()}&cycle=${billingCycle}`)
    navigate("/account"); // for now
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url('Background.jpeg')",
        }}
      />

      {/* Main */}
      <main className="relative z-10 max-w-5xl mx-auto py-20 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-3">
            <img
              src={logo}
              alt="PickIt Logo"
              className="w-10 h-10 rounded-full border border-white/20"
            />
            <h1 className="text-3xl font-bold">Upgrade</h1>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-gray-300">
            <Link to="/" className="hover:text-white">Home</Link>
            <span className="opacity-40">/</span>
            <Link to="/support" className="hover:text-white">Support</Link>
          </div>
        </div>

        {/* Bubble */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10">
          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full border transition ${
                billingCycle === "monthly"
                  ? "border-white/30 bg-white/10"
                  : "border-white/10 hover:bg-white/5"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`px-5 py-2 rounded-full border transition ${
                billingCycle === "yearly"
                  ? "border-white/30 bg-white/10"
                  : "border-white/10 hover:bg-white/5"
              }`}
            >
              Yearly <span className="ml-1 text-yellow-400">Save ~33%</span>
            </button>
          </div>

          {/* Tiers */}
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`rounded-2xl border p-6 flex flex-col justify-between ${
                  t.highlight ? "border-yellow-400/50 bg-yellow-400/5" : "border-white/10 bg-black/10"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold">{t.name}</h3>
                    {t.highlight && (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-500 text-gray-900 font-semibold">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 mb-4">{t.tagline}</p>
                  <div className="mb-6">
                    <div className="text-3xl font-extrabold">{formatPrice(t)}</div>
                    {t.priceMonthly > 0 && billingCycle === "yearly" && (
                      <p className="text-xs text-gray-400 mt-1">
                        Billed annually. Monthly equivalent ${(t.priceYearly / 12).toFixed(2)}/mo.
                      </p>
                    )}
                  </div>
                  <ul className="space-y-2 text-sm text-gray-200">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleUpgrade(t.name)}
                  className={`mt-8 w-full px-5 py-3 rounded-xl font-semibold transition ${
                    t.highlight
                      ? "bg-yellow-500 text-gray-900 hover:bg-yellow-400"
                      : "border border-white/20 hover:bg-white/10"
                  }`}
                >
                  {t.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="mt-10 text-sm text-gray-400 leading-relaxed">
            <p>
              Prices are in USD. You can change or cancel your plan anytime in{" "}
              <button
                type="button"
                onClick={() => navigate("/account")}
                className="underline hover:text-white"
              >
                Account
              </button>
              . Responsible betting only — see{" "}
              <Link to="/terms" className="underline hover:text-white">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline hover:text-white">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </main>

      {/* Shared Footer */}
      <footer className="relative z-10 py-12 px-10 border-t border-white/10 w-full text-center md:text-left">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <div className="flex items-center space-x-2">
              <img
                src={logo}
                alt="PickIt Logo"
                className="w-10 h-10 rounded-full border border-white/20"
              />
            </div>
            <span className="text-xl font-bold">PickIt</span>
          </div>
          <div className="flex space-x-8 mb-6 md:mb-0">
            <Link to="/privacy" className="text-gray-400 hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white">
              Terms of Service
            </Link>
            <Link to="/support" className="text-gray-400 hover:text-white">
              Support
            </Link>
          </div>
          <p className="text-gray-400 text-sm">© 2025 PickIt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Upgrade;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Footer } from "../components";
import { useAuth } from "../hooks";
import { redirectToCheckout } from "../lib/stripe";
import { Loader2 } from "lucide-react";


const logo = "/logo.png";

const tiers = [
  {
    name: "Standard",
    price: "$0/month",
    benefits: [
      "Basic insights & trends",
      "Access to settled tickets",
      "Arbitrage calculator",
      "Email support (48–72h)",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$4.99/month",
    benefits: [
      "Arbitrage opportunities",
      "Algorithmic picks",
      "AI-Powered Game Predictions",
      "Ad-Free Experience",
      "Priority support (24–48h)",
    ],
    highlighted: true,
  },
];

const Upgrade: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    if (!user) {
      setError("You must be logged in to upgrade");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await redirectToCheckout(
        user.email || "",
        user.displayName || undefined
      );
    } catch (err: any) {
      console.error("Upgrade error:", err);
      setError(err.message || "Failed to start checkout process");
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
      />

      <main className="relative z-10 max-w-5xl mx-auto py-40 px-6">
        <h1 className="text-4xl font-bold text-center mb-12">
          Upgrade Your PickIt Experience
        </h1>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`p-8 rounded-3xl border transition flex flex-col h-full ${tier.highlighted
                  ? "bg-yellow-500/90 text-black border-yellow-400/80 shadow-lg shadow-yellow-500/40"
                  : "bg-white/5 border-white/10"
                }`}
            >
              <h2 className="text-2xl font-semibold mb-2">{tier.name}</h2>
              <p className="text-lg mb-6">{tier.price}</p>

              {/* Make the content flex-1 so the button can be pushed to the bottom */}
              <ul className="space-y-3 text-gray-300 mb-8 flex-1">
                {tier.benefits.map((b, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-white-400 mr-2">•</span> {b}
                  </li>
                ))}
              </ul>

              {/* Button wrapper sits at the bottom */}
              <div className="mt-auto">
                {tier.highlighted ? (
                  <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="w-full py-3 bg-black text-yellow-500/90 font-semibold rounded-xl hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Upgrade to Pro"
                    )}
                  </button>
                ) : (
                  <button className="w-full py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700">
                    Current Plan
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-6 text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

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
            <Link to="/termsofservice" className="underline hover:text-white">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline hover:text-white">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Upgrade;
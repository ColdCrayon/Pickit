import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { httpsCallable } from "firebase/functions";

import { Footer } from "../components";
import { getStripe, functions } from "../lib";
import { useAuth } from "../hooks/useAuth";

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
    setError(null);

    if (!user) {
      setError("Please sign in to upgrade your plan.");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const createCheckoutSession = httpsCallable(functions, "createCheckoutSession");
      const result = await createCheckoutSession({
        uid: user.uid,
        email: user.email ?? undefined,
        returnUrl: `${window.location.origin}/account`,
      });

      const data = (result.data || {}) as {
        sessionId?: string;
        billingPortalUrl?: string;
      };

      if (data.billingPortalUrl) {
        window.location.assign(data.billingPortalUrl);
        return;
      }

      if (!data.sessionId) {
        throw new Error("Unable to start checkout. Please try again later.");
      }

      const stripe = await getStripe();
      if (!stripe) {
        throw new Error("Stripe is not configured.");
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while starting checkout.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url('Background.jpeg')",
        }}
      />

      <main className="relative z-10 max-w-5xl mx-auto py-40 px-6">
        <h1 className="text-4xl font-bold text-center mb-12">
          Upgrade Your PickIt Experience
        </h1>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`p-8 rounded-3xl border transition flex flex-col h-full ${
                tier.highlighted
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
                    className="w-full py-3 bg-black text-yellow-500/90 font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleUpgrade}
                    disabled={loading}
                  >
                    {loading ? "Redirecting..." : "Upgrade to Pro"}
                  </button>
                ) : (
                  <button className="w-full py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700">
                    Current Plan
                  </button>
                )}
              </div>
              {tier.highlighted && error && (
                <p className="mt-4 text-sm text-red-400" role="alert">
                  {error}
                </p>
              )}
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
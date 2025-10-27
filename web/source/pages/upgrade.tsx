import React from "react";
import { Link, useNavigate } from "react-router-dom";
const logo = "/logo.png";
import Footer from "../components/footer";

const tiers = [
  {
    name: "Standard (Free)",
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
      "Ad-Free Experience",  
      "Algorithmic picks (daily)",
      "Arbitrage opportunities",
      "Priority support (24–48h)",
      "AI-Powered Game Predictions",
    ],
    highlighted: true,
  },
];
const Upgrade: React.FC = () => {
  const navigate = useNavigate();

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
        <h1 className="text-4xl font-bold text-center mb-12">Upgrade Your PickIt Experience</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`p-8 rounded-3xl border transition ${
                tier.highlighted
                  ? "bg-yellow-500/90 text-black border-yellow-400/80 shadow-lg shadow-yellow-500/40"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <h2 className="text-2xl font-semibold mb-2">{tier.name}</h2>
              <p className="text-lg mb-6">{tier.price}</p>
              <ul className="space-y-3 text-gray-300">
                {tier.benefits.map((b, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-yellow-400 mr-2">✔</span> {b}
                  </li>
                ))}
              </ul>
              {tier.highlighted ? (
                <button className="mt-8 w-full py-3 bg-black text-yellow-500/90 font-semibold rounded-xl hover:bg-gray-800">
                  Upgrade to Pro
                </button>
              ) : (
                <button className="mt-8 w-full py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700">
                  Current Plan
                </button>
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
      </main>
      <Footer />
    </div>
  );
};

export default Upgrade;

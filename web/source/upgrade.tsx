import React from "react";
import { Link, useNavigate } from "react-router-dom";
const logo = "/logo.png";

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

      <main className="relative z-10 max-w-5xl mx-auto py-20 px-6">
        <h1 className="text-4xl font-bold text-center mb-12">Upgrade Your PickIt Experience</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`p-8 rounded-3xl border transition ${
                tier.highlighted
                  ? "bg-yellow-500 text-black border-yellow-400 shadow-lg shadow-yellow-400/30"
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
                <button className="mt-8 w-full py-3 bg-black text-yellow-400 font-semibold rounded-xl hover:bg-gray-800">
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

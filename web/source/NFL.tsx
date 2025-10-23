// web/source/NFL.tsx
import React from "react";
import { Link } from "react-router-dom";
import NflTicketsSection from "./Components/tickets/NFLTicketsSection";

const logo = "/logo.png";

const NFL: React.FC = () => {
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

      <main className="relative z-10 max-w-6xl mx-auto py-20 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-3">
            <img
              src={logo}
              alt="PickIt Logo"
              className="w-10 h-10 rounded-full border border-white/20"
            />
            <h1 className="text-3xl font-bold">NFL</h1>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-gray-300">
            <Link to="/news" className="hover:text-white">News</Link>
            <span className="opacity-40">/</span>
            <Link to="/upgrade" className="hover:text-white">Upgrade</Link>
          </div>
        </div>

        {/* Tickets only (we can add Picks/Arb sections below later) */}
        <NflTicketsSection />
      </main>

    {/* Footer */}
      <footer className="relative z-10 py-12 px-10 border-t border-white/10 w-full text-center md:text-left">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <img
              src={logo}
              alt="PickIt Logo"
              className="w-10 h-10 rounded-full border border-white/20"
            />
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

export default NFL;

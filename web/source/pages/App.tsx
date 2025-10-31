import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import {
  BarChart3,
  Users,
  Zap,
  Award,
  TrendingUp,
  Shield,
} from "lucide-react";

  // Removed unused auth, db imports - using useUserPlan hook instead
import { useUserPlan } from "../hooks";
import { Navbar, SidebarNav, Footer } from "../components";

import PrivacyPolicy from "../pages/PrivacyPolicy";
import Account from "./Account";
import TermsOfService from "./TermsOfService";
import Support from "./Support";
import About from "./About";
import Upgrade from "./Upgrade";

import SportsPage from "./sports/SportsPage";

import { FreePicks, FreePicksAll, FreePicksLeague } from "../components";
import ArticlePage from "./Article";
import News from "./News";

import AdminDashboard from "./AdminDashboard";
import "../styles/admin.css";

const logo = "/logo.png";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isPremium, isAdmin } = useUserPlan();

  return (
    <div className="main-scroll min-h-screen bg-gray-900 text-white relative overflow-hidden overscroll-none">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url('Background.jpeg')`,
        }}
      />

      {/* Navbar */}
      <Navbar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        userRole={{ isPremium, isAdmin }}
      />

      {/* Sidebar */}
      <SidebarNav
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <main
        className={`relative z-10 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : ""
        }`}
      >
        <Routes>
          <Route path="/" element={<Home isSidebarOpen={isSidebarOpen} />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/Account" element={<Account />} />
          <Route path="/termsofservice" element={<TermsOfService />} />
          <Route path="/support" element={<Support />} />
          <Route path="/about" element={<About />} />
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/news" element={<News />} />
          <Route path="/nfl" element={<SportsPage />} />
          <Route path="/nba" element={<SportsPage />} />
          <Route path="/mlb" element={<SportsPage />} />
          <Route path="/nhl" element={<SportsPage />} />
          <Route path="/FreePicks" element={<FreePicks />} />
          <Route path="/free-picks/all" element={<FreePicksAll />} />
          <Route path="/free-picks/:league" element={<FreePicksLeague />} />
          <Route path="/news/:slug" element={<ArticlePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  );
}


function Home({ isSidebarOpen }: { isSidebarOpen: boolean }) {
  const [isPremium, setIsPremium] = React.useState<boolean | null>(null);

  return (
    <main
      className={`relative z-10 transition-all duration-300 ${
        isSidebarOpen ? "ml-64" : ""
      }`}
    >
      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 text-center">
        <div className="w-full">
          <h1 className="text-6xl font-bold mb-8">
            PickIt
            <br />
            <span className="text-gray-200">Betting Solutions</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Advanced analytics and expert insights to elevate your sports
            betting strategy
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {isPremium === false && (
              <Link
                to="/upgrade"
                className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white hover:text-gray-900"
              >
                Get Started
              </Link>
            )}
            <Link
              to="/about"
              className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white hover:text-gray-900"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
      {/* Features */}
      <section className="pt-10 pb-10 w-full">
        <div className="text-center mb-20 mx-auto max-w-3xl px-6">
          <h2 className="text-5xl font-bold mb-6">Why Choose PickIt?</h2>
          <p className="text-xl text-gray-300">
            Professional-grade tools designed for serious sports bettors
          </p>
        </div>
        <section className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Real-time Analytics",
                desc: "Live data streams and instant performance metrics.",
                icon: <BarChart3 className="w-8 h-8" />,
              },
              {
                title: "AI Predictions",
                desc: "Machine learning algorithms trained on years of data.",
                icon: <TrendingUp className="w-8 h-8" />,
              },
              {
                title: "Multi-Sport Coverage",
                desc: "News and Analytics across the MLB, NFL, NBA, NHL.",
                icon: <Award className="w-8 h-8" />,
              },
              {
                title: "Risk Management",
                desc: "Smart bankroll tools and risk assessment.",
                icon: <Shield className="w-8 h-8" />,
              },
              {
                title: "Live Notifications",
                desc: "Instant alerts on betting opportunities.",
                icon: <Zap className="w-8 h-8" />,
              },
              {
                title: "Expert Community",
                desc: "Connect with professional bettors.",
                icon: <Users className="w-8 h-8" />,
              },
            ].map((feature, index) => {
              const card = (
                <div
                  key={index}
                  className="bg-white/5 p-8 rounded-3xl hover:bg-white/10 transition"
                >
                  <div className="mb-6">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.desc}</p>
                </div>
              );
              return feature.title == "Multi-Sport Coverage" ? (
                <Link key={index} to="/news">
                  {card}
                </Link>
              ) : (
                <div key={index}>{card}</div>
              );
            })}
          </div>
        </section>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 w-full text-center">
        <div className="bg-white/5 p-12 rounded-3xl max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6">Ready to Win Smarter?</h2>
          <p className="text-xl text-gray-300 mb-12">
            Join our team of successful bettors who trust Pickit.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {isPremium === false && (
              <Link
                to="/upgrade"
                className="px-10 py-4 bg-yellow-500/90 text-gray-900 font-semibold rounded-2xl hover:bg-yellow-400"
              >
                Upgrade Now
              </Link>
            )}
            <p className="text-sm text-gray-400">
              {isPremium
                ? "No credit card required"
                : "Thanks for being a Pro member!"}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}


export default App;

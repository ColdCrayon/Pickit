import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import {
  User,
  FileText,
  Info,
  Shield,
  TrendingUp,
  BarChart3,
  Users,
  Zap,
  Award,
  X as CloseIcon,
  Home as HomeIcon,
  Book,
  Scroll,
} from "lucide-react";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import Account from "./Account";
import TermsOfService from "../pages/termsofservice";
import Support from "../pages/support";
import About from "./About";
import Upgrade from "../pages/upgrade";
import News from "./news";
import NFL from "./NFL";
import FreePicks from "./FreePicks";
import FreePicksAll from "../pages/FreePicksAll";
import FreePicksLeague from "../pages/FreePicksLeague";
import ArticlePage from "./Article";
import Footer from "../components/footer";

import AdminDashboard from "./AdminDashboard";
import NavAdminLink from "../components/admin/NavAdminLink";
import "../styles/admin.css";

const logo = "/logo.png";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      <nav className="fixed top-0 left-0 w-full z-50 bg-gray-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="w-full px-6 flex items-center h-16 justify-between">
          {/* Left Group: Brand + Links */}
          <div className="flex items-center space-x-6">
            {/* Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2"
            >
              {isSidebarOpen ? (
                <CloseIcon className="w-6 h-6 text-white" />
              ) : (
                <div className="flex flex-col space-y-1.5">
                  <span className="block w-6 h-0.5 bg-white"></span>
                  <span className="block w-6 h-0.5 bg-white"></span>
                  <span className="block w-6 h-0.5 bg-white"></span>
                </div>
              )}
            </button>
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2">
                <img
                  src="/logo.png"
                  alt="PickIt Logo"
                  className="w-8 h-8 rounded-full border border-white/20"
                />
              </Link>
              <Link to="/" className="text-2xl font-bold">
                PickIt
              </Link>
            </div>
            {/* Sports Links */}
            <div className="hidden md:flex space-x-6 ml-6">
              {["MLB", "NFL", "NBA", "NHL"].map((sport, index) => (
                <Link
                  key={index}
                  to={`/${sport.toLowerCase()}`}
                  className="text-gray-300 hover:text-white transition"
                >
                  {sport}
                </Link>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center space-x-3">
            <Link
              to="/upgrade"
              className="hidden sm:inline-flex px-6 py-2.5 bg-yellow-500/90 text-gray-900 font-bold rounded-xl hover:bg-yellow-400"
            >
              UPGRADE
            </Link>
            <NavAdminLink />
            <Link
              to="/Account"
              className="hidden sm:inline-flex px-6 py-2.5 bg-gray-700/80 text-white font-bold rounded-xl hover:bg-gray-600/80"
            >
              ACCOUNT
            </Link>
            <Link
              to="/Account"
              className="p-2.5 bg-gray-700/80 rounded-xl hover:bg-gray-600/80"
            >
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-full bg-blue-800/95 backdrop-blur-xl transform transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pt-20 px-6">
          <nav className="space-y-4">
            <Link
              to="/"
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10"
              onClick={() => setIsSidebarOpen(false)}
            >
              <HomeIcon className="w-5 h-5" /> <span>Home</span>
            </Link>
            <Link
              to="/about"
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Info className="w-5 h-5" /> <span>About</span>
            </Link>
            <Link
              to="/news"
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10"
              onClick={() => setIsSidebarOpen(false)}
            >
              <TrendingUp className="w-5 h-5" /> <span>News</span>
            </Link>
            <Link
              to="/FreePicks"
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Book className="w-5 h-5" /> <span>Free Picks</span>
            </Link>
            <Link
              to="/privacy"
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Shield className="w-5 h-5" /> <span>Privacy Policy</span>
            </Link>
            <Link
              to="/termsofservice"
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10"
              onClick={() => setIsSidebarOpen(false)}
            >
              <FileText className="w-5 h-5" /> <span>Terms of Service</span>
            </Link>
          </nav>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

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
          <Route path="/nfl" element={<NFL />} />
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
            Pickit
            <br />
            <span className="text-gray-200">Betting Solutions</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Advanced analytics and expert insights to elevate your sports
            betting strategy
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/upgrade"
              className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white hover:text-gray-900"
            >
              Get Started
            </Link>
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
          <h2 className="text-5xl font-bold mb-6">Why Choose Pickit?</h2>
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
            <Link
              to="/upgrade"
              className="px-10 py-4 bg-yellow-500/90 text-gray-900 font-semibold rounded-2xl hover:bg-yellow-400"
            >
              Upgrade Now
            </Link>
            <p className="text-sm text-gray-400 ">No credit card required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}

export default App;

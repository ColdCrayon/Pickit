import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useUserPlan } from "../hooks";
import { AdminGuard, Navbar, SidebarNav } from "../components";
import { ProGuard } from "../components/guards/ProGuard";

// Pages
import Home from "./Home";
import ProDashboard from "./ProDashboard";
import PrivacyPolicy from "./PrivacyPolicy";
import Account from "./Account";
import TermsOfService from "./TermsOfService";
import Support from "./Support";
import About from "./About";
import Upgrade from "./Upgrade";
import Billing from "./billing";
import SportsPage from "./sports/SportsPage";
import { FreePicks, FreePicksAll, FreePicksLeague } from "../components";
import ArticlePage from "./Article";
import News from "./News";
import AdminDashboard from "./AdminDashboard";
import EventBrowser from "./EventBrowser";
import Watchlist from "./Watchlist";
import OddsComparison from "./OddsComparison"; // NEW

// Styles
import "../styles/admin.css";
import MyTickets from "./MyTickets";

/**
 * App - Main application component
 *
 * Responsibilities:
 * - Route configuration
 * - Layout structure (Navbar + Sidebar)
 * - User role detection (standard vs pro)
 * - Route guards for protected pages
 */
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

      {/* Main Content Area */}
      <main
        className={`relative z-10 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : ""
        }`}
      >
        <Routes>
          {/* Home Route - Conditional based on user type */}
          <Route
            path="/"
            element={
              isPremium ? (
                <ProDashboard isSidebarOpen={isSidebarOpen} />
              ) : (
                <Home isSidebarOpen={isSidebarOpen} />
              )
            }
          />

          {/* Pro Dashboard - Protected route */}
          <Route
            path="/dashboard"
            element={
              <ProGuard>
                <ProDashboard isSidebarOpen={isSidebarOpen} />
              </ProGuard>
            }
          />

          <Route path="/browse-events" element={<EventBrowser />} />
          <Route
            path="/watchlist"
            element={
              <ProGuard>
                <Watchlist />
              </ProGuard>
            }
          />

          {/* NEW: Odds Comparison - Protected route */}
          <Route
            path="/odds-comparison"
            element={
              <ProGuard>
                <OddsComparison />
              </ProGuard>
            }
          />

          <Route path="/my-tickets" element={<MyTickets />} />

          {/* Public Pages */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/Account" element={<Account />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/termsofservice" element={<TermsOfService />} />
          <Route path="/support" element={<Support />} />
          <Route path="/about" element={<About />} />
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<ArticlePage />} />

          {/* Sports Pages */}
          <Route path="/nfl" element={<SportsPage />} />
          <Route path="/nba" element={<SportsPage />} />
          <Route path="/mlb" element={<SportsPage />} />
          <Route path="/nhl" element={<SportsPage />} />

          {/* Free Picks */}
          <Route path="/FreePicks" element={<FreePicks />} />
          <Route path="/free-picks/all" element={<FreePicksAll />} />
          <Route path="/free-picks/:league" element={<FreePicksLeague />} />

          {/* Admin Dashboard - Protected route */}
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

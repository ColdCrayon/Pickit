import React from "react";
import { Link } from "react-router-dom";
import { User, X as CloseIcon, LayoutDashboard } from "lucide-react";
import NavAdminLink from "../admin/NavAdminLink";

const logo = "/logo.png";

interface NavbarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  userRole: { isPremium: boolean; isAdmin: boolean };
}

const sports = ["MLB", "NFL", "NBA", "NHL"];

const Navbar: React.FC<NavbarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  userRole,
}) => (
  <nav className="fixed top-0 left-0 w-full z-50 bg-gray-900/80 backdrop-blur-lg border-b border-white/10">
    <div className="w-full px-6 flex items-center h-16 justify-between">
      {/* Left Group: Brand + Links */}
      <div className="flex items-center space-x-6">
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2"
          aria-label="Toggle sidebar"
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
              src={logo}
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
          {sports.map((sport, index) => (
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
        {/* Pro Dashboard Link - Only for premium users */}
        {userRole.isPremium && (
          <Link
            to="/dashboard"
            className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 bg-yellow-500/20 text-yellow-400 font-bold rounded-xl hover:bg-yellow-500/30 transition"
            title="Go to Pro Dashboard"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        )}
        {/* Upgrade Button - Only for standard users */}
        {!userRole.isPremium && (
          <Link
            to="/upgrade"
            className="hidden sm:inline-flex px-6 py-2.5 bg-yellow-500/90 text-gray-900 font-bold rounded-xl hover:bg-yellow-400 transition"
          >
            UPGRADE
          </Link>
        )}
        {/* Admin Link */}
        {userRole.isAdmin && <NavAdminLink />}
        {/* Account Button */}
        <Link
          to="/Account"
          className="hidden sm:inline-flex px-6 py-2.5 bg-gray-700/80 text-white font-bold rounded-xl hover:bg-gray-600/80 transition"
        >
          ACCOUNT
        </Link>
        {/* Mobile Account Icon */}
        <Link
          to="/Account"
          className="p-2.5 bg-gray-700/80 rounded-xl hover:bg-gray-600/80 transition"
          aria-label="Account"
        >
          <User className="w-5 h-5" />
        </Link>
      </div>
    </div>
  </nav>
);

export default Navbar;

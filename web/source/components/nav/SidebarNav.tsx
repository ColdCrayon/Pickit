import React from "react";
import { Link } from "react-router-dom";
import {
  Home as HomeIcon,
  LayoutDashboard,
  Info,
  TrendingUp,
  Book,
  Shield,
  FileText,
} from "lucide-react";
import { useUserPlan } from "../../hooks/useUserPlan";

interface SidebarNavProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const { isPremium } = useUserPlan();

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-full bg-blue-800/95 backdrop-blur-xl transform transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pt-20 px-6">
          <nav className="space-y-4">
            <Link
              to="/"
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10 transition"
              onClick={() => setIsSidebarOpen(false)}
            >
              {isPremium ? (
                <>
                  <LayoutDashboard className="w-5 h-5" /> <span>Dashboard</span>
                </>
              ) : (
                <>
                  <HomeIcon className="w-5 h-5" /> <span>Home</span>
                </>
              )}
            </Link>

            <Link
              to="/about"
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10 transition"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Info className="w-5 h-5" /> <span>About</span>
            </Link>
            <Link
              to="/news"
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10 transition"
              onClick={() => setIsSidebarOpen(false)}
            >
              <TrendingUp className="w-5 h-5" /> <span>News</span>
            </Link>
            <Link
              to="/FreePicks"
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10 transition"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Book className="w-5 h-5" /> <span>Free Picks</span>
            </Link>
            <Link
              to="/privacy"
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10 transition"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Shield className="w-5 h-5" /> <span>Privacy Policy</span>
            </Link>
            <Link
              to="/termsofservice"
              className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10 transition"
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
    </>
  );
};

export default SidebarNav;

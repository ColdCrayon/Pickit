import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Menu, Search, Bell } from "lucide-react";
import { Button } from "../ui/Button";

interface NavbarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  userRole: { isPremium: boolean; isAdmin: boolean };
  user: any;
}

const Navbar: React.FC<NavbarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  userRole,
  user,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled
          ? "bg-[#0a0a0a]/80 backdrop-blur-xl border-white/10 shadow-lg"
          : "bg-transparent border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Sidebar Toggle + Logo */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              <Menu className="h-6 w-6" />
            </Button>

            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white to-gray-400 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all">
                <span className="text-black font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white text-glow">
                PickIt
              </span>
            </Link>
          </div>

          {/* Right side: User Actions */}
          <div className="flex items-center gap-3">
            {/* Search (Hidden on mobile) */}
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                className="w-64 bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
              />
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-400 hover:text-white hover:bg-white/10"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </Button>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-3 border-l border-white/10">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-white">
                  {user?.displayName || "User"}
                </p>
                <p className="text-xs text-gray-400">
                  {userRole.isPremium ? "Premium Member" : "Free Plan"}
                </p>
              </div>
              <Link to="/account">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center hover:border-white/30 transition-all">
                  <User className="w-5 h-5 text-gray-300" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

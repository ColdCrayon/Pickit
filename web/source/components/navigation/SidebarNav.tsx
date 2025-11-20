/**
 * SidebarNav Component - UPDATED
 *
 * Added Odds Comparison link for pro users
 */

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home as HomeIcon,
  Info,
  TrendingUp,
  Book,
  Shield,
  FileText,
  Eye,
  Ticket,
  LayoutDashboard,
  BarChart3,
  User,
  Settings,
  Trophy,
  ChevronDown,
  ChevronRight,
  Scale
} from "lucide-react";
import { useUserPlan } from "../../hooks";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";

interface SidebarNavProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const { isPremium } = useUserPlan();
  const location = useLocation();
  const [isSportsOpen, setIsSportsOpen] = useState(true);

  const NavItem = ({
    to,
    icon: Icon,
    label,
    className,
    indent = false,
  }: {
    to: string;
    icon: React.ElementType;
    label: string;
    className?: string;
    indent?: boolean;
  }) => {
    const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
    return (
      <Button
        variant="ghost"
        asChild
        className={cn(
          "w-full justify-start text-muted-foreground hover:text-white hover:bg-white/5 transition-all",
          isActive && "bg-white/10 text-white font-semibold shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]",
          indent && "pl-11",
          className
        )}
        onClick={() => setIsSidebarOpen(false)}
      >
        <Link to={to}>
          <Icon className={cn("mr-3 h-4 w-4", isActive && "text-primary")} />
          {label}
        </Link>
      </Button>
    );
  };

  const SectionHeader = ({ label }: { label: string }) => (
    <div className="px-4 py-2 mt-4 mb-1">
      <h4 className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">
        {label}
      </h4>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] border-r border-white/10 transition-transform duration-300 ease-in-out",
          "bg-[#050505]/80 backdrop-blur-xl shadow-2xl", // Darker, more distinct background
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Liquid Metal Overlay for Sidebar - Subtle */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/40 pointer-events-none" />

        <div className="relative flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

          <div className="flex-1 py-6 px-3 space-y-1">
            {/* Dashboard Section */}
            <SectionHeader label="Dashboard" />
            {isPremium ? (
              <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
            ) : (
              <NavItem to="/" icon={HomeIcon} label="Home" />
            )}
            <NavItem to="/my-tickets" icon={Ticket} label="My Tickets" />
            {isPremium && <NavItem to="/watchlist" icon={Eye} label="Watchlist" />}
            {isPremium && <NavItem to="/odds-comparison" icon={BarChart3} label="Odds Comparison" />}

            {/* Sports Dropdown Section */}
            <SectionHeader label="Sports" />
            <NavItem to="/news" icon={TrendingUp} label="News" />
            <Button
              variant="ghost"
              className="w-full justify-between text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
              onClick={() => setIsSportsOpen(!isSportsOpen)}
            >
              <div className="flex items-center">
                <Trophy className="mr-3 h-4 w-4" />
                Leagues
              </div>
              {isSportsOpen ? (
                <ChevronDown className="h-4 w-4 opacity-50" />
              ) : (
                <ChevronRight className="h-4 w-4 opacity-50" />
              )}
            </Button>

            {isSportsOpen && (
              <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                <NavItem to="/mlb" icon={Trophy} label="MLB" indent />
                <NavItem to="/nfl" icon={Trophy} label="NFL" indent />
                <NavItem to="/nba" icon={Trophy} label="NBA" indent />
                <NavItem to="/nhl" icon={Trophy} label="NHL" indent />
              </div>
            )}

            {/* Account Section */}
            <SectionHeader label="Account" />
            <NavItem to="/account" icon={User} label="Profile" />
            <NavItem to="/billing" icon={Settings} label="Billing" />

            {/* Admin Section (Conditional rendering could be added here) */}
            <SectionHeader label="Admin" />
            <NavItem to="/admin" icon={Shield} label="Admin Panel" />

            {/* Support / Info Section */}
            <SectionHeader label="Support" />
            <NavItem to="/about" icon={Info} label="About" />
            <NavItem to="/freepicks" icon={Book} label="Free Picks" />
            <NavItem to="/privacy" icon={Shield} label="Privacy Policy" />
            <NavItem to="/termsofservice" icon={FileText} label="Terms of Service" />
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/5 bg-black/40">
            <div className="text-xs text-muted-foreground text-center">
              © 2025 PickIt. All rights reserved.
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default SidebarNav;

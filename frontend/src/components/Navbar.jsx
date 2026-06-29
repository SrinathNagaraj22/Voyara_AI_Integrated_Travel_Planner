import React from "react";
import { Compass, Sparkles, User, LogOut, Users, MessageSquare, Bell, Heart, Menu, X, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import BrandMark from "./BrandMark";

export default function Navbar({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  pendingRequestsCount
}) {
  // If no logged in user or user is on the Landing/Auth page, render a traditional, gorgeous glass header
  const isGuestHeader = !currentUser || activeTab === "landing" || activeTab === "auth";

  if (isGuestHeader) {
    return (
      <nav id="guest-navigation" className="sticky top-4 z-50 max-w-7xl mx-auto w-full px-4 mb-4">
        <div className="bg-[#0b0c14]/80 backdrop-blur-xl border border-white/10 rounded-[1.5rem] px-4 sm:px-6 shadow-2xl">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              id="brand-logo-guest"
              className="cursor-pointer"
              onClick={() => setActiveTab("landing")}
            >
              <BrandMark size="sm" tagline="AI Travel" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                id="btn-guest-join"
                onClick={() => setActiveTab(currentUser ? "feed" : "auth")}
                className="px-4.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-505 text-white shadow-lg transition-all cursor-pointer"
              >
                {currentUser ? "Launch App Feed" : "Sign In / Register"}
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // --- LOGGED IN USER INTERFACES (INSTAGRAM STYLE CORES) ---

  const tabs = [
    { id: "feed", label: "Home Feed", icon: Compass },
    { id: "trips", label: "Group Trips", icon: Users },
    { id: "planner", label: "AI Planner", icon: Sparkles },
    { id: "profile", label: "My Profile", icon: User },
  ];

  return (
    <>
      {/* 1. DESKTOP VERTICAL INSTAGRAM-STYLE SIDEBAR */}
      <aside 
        id="desktop-sidebar-nav"
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-[#07080e] border-r border-white/10 z-40 p-6 justify-between text-left"
      >
        <div className="space-y-8">
          {/* Brand/Logo */}
          <div
            id="sidebar-brand"
            className="cursor-pointer pt-2 px-2"
            onClick={() => setActiveTab("feed")}
          >
            <BrandMark size="sm" tagline="Nomad Portal" />
          </div>

          {/* Tab Navigation links */}
          <nav id="sidebar-tabs" className="space-y-1 pt-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  id={`sidebar-link-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all group relative cursor-pointer ${
                    isActive
                      ? "bg-indigo-950/40 text-indigo-300 border-l-2 border-indigo-500"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <div className="relative">
                    {tab.id === "profile" ? (
                      <img
                        src={currentUser?.avatarUrl}
                        alt="Me"
                        referrerPolicy="no-referrer"
                        className={`h-5.5 w-5.5 rounded-full object-cover ring-1 shrink-0 ${
                          isActive ? "ring-indigo-400" : "ring-slate-700 group-hover:ring-slate-500"
                        }`}
                      />
                    ) : (
                      <Icon className={`h-5 w-5 transition-transform group-hover:scale-105 ${
                        isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-350"
                      }`} />
                    )}

                    {/* Pending Requests Badge on Profile tab or Group tab */}
                    {tab.id === "profile" && pendingRequestsCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white ring-2 ring-[#07080e]">
                        {pendingRequestsCount}
                      </span>
                    )}
                  </div>

                  <span className="font-medium tracking-wide">{tab.label}</span>

                  {/* Aesthetic background flow indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute right-2 w-1.5 h-1.5 rounded-full bg-indigo-400"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout at the Bottom */}
        <div className="space-y-4 pt-4 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 px-2">
            <img 
              src={currentUser?.avatarUrl} 
              alt={currentUser?.username || "user"} 
              referrerPolicy="no-referrer"
              className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">@{currentUser?.username || "user"}</p>
              <p className="text-[10px] text-slate-500 truncate">{currentUser?.location || "Wanderer"}</p>
            </div>
          </div>

          <button
            id="sidebar-btn-logout"
            onClick={onLogout}
            className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-950/15 border border-transparent hover:border-rose-900/20 transition-all cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out Nomad</span>
          </button>
        </div>
      </aside>

      {/* 2. MOBILE TOP HEADER */}
      <header 
        id="mobile-top-header"
        className="md:hidden flex items-center justify-between px-4 h-14 bg-[#050508]/90 backdrop-blur-md border-b border-white/10 fixed top-0 left-0 right-0 z-40"
      >
        {/* Brand name */}
        <div
          className="cursor-pointer"
          onClick={() => setActiveTab("feed")}
        >
          <BrandMark size="sm" />
        </div>

        {/* Status markers on Mobile Header */}
        <div className="flex items-center gap-3">
          {pendingRequestsCount > 0 && (
            <button 
              onClick={() => setActiveTab("profile")}
              className="relative p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-600 ring-1 ring-slate-950" />
            </button>
          )}

          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400"
            title="Sign out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* 3. MOBILE BOTTOM TAB BAR */}
      <nav 
        id="mobile-bottom-bar"
        className="md:hidden fixed bottom-1 left-0 right-0 h-16 bg-[#07080e]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 z-40 pb-safe"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3.5 rounded-xl transition-all cursor-pointer relative ${
                isActive ? "text-indigo-400" : "text-slate-400 hover:text-slate-250"
              }`}
            >
              {tab.id === "profile" ? (
                <img
                  src={currentUser?.avatarUrl}
                  alt="Me"
                  referrerPolicy="no-referrer"
                  className={`h-5.5 w-5.5 rounded-full object-cover ring-2 shrink-0 ${
                    isActive ? "ring-indigo-500" : "ring-transparent"
                  }`}
                />
              ) : (
                <Icon className="h-5 w-5" />
              )}
              <span className="text-[9px] font-medium tracking-tight mt-0.5">{tab.label}</span>

              {/* Pending Requests mobile indicator */}
              {tab.id === "profile" && pendingRequestsCount > 0 && (
                <span className="absolute top-1.5 right-4 h-2 w-2 rounded-full bg-indigo-600" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}

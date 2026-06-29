import React from "react";
import { Compass, Sparkles, Users, Map, Quote, CheckCircle2, ChevronRight, Globe, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export default function LandingView({ onJoin, onExploreTrips, isAuthenticated }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto">
        <motion.div 
          className="lg:col-span-7 space-y-8 text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Tagline */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-purple-500/30 text-purple-300 text-xs font-semibold tracking-wide"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
            <span>Next Gen Social Co-Traveling Network</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight"
          >
            Adventure stands better when <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">shared</span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            variants={itemVariants}
            className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed"
          >
            Voyara bridges the void between social media, budget travel, and group coordination. Create custom group expeditions, open seats to verified like-minded backpackers, and generate instant, granular travel itineraries powered by modern Gemini intelligence. No more lonely voyages!
          </motion.p>

          {/* Actions */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            <button
              id="landing-cta-primary"
              onClick={isAuthenticated ? onExploreTrips : onJoin}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-900/30 hover:shadow-purple-500/20 transform hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span>{isAuthenticated ? "Launch Group Explorer" : "Begin Sharing Journeys"}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              id="landing-cta-secondary"
              onClick={onExploreTrips}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-slate-900/60 hover:bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800 hover:border-purple-500/30 transition-all cursor-pointer"
            >
              <span>Browse Active Trips</span>
              <Compass className="h-5 w-5 text-purple-400" />
            </button>
          </motion.div>

          {/* Key Checklist */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-3 gap-y-3 pt-6 text-sm text-slate-300"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-purple-400" />
              <span>Verified Profiles</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-indigo-400" />
              <span>Full Spot Budget Control</span>
            </div>
            <div className="flex items-center gap-2col-span-2 md:col-span-1">
              <CheckCircle2 className="h-4 w-4 text-purple-400" />
              <span>Gemini AI Route Generator</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Interactive Card Mock */}
        <motion.div 
          className="lg:col-span-5 relative"
          initial={{ opacity: 0, scale: 0.9, rotate: 1 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          {/* Graphic Glowing Background Circle */}
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />

          {/* Main Card */}
          <div className="bg-[#0b0c14] rounded-[2.5rem] p-6 relative overflow-hidden border border-white/10 shadow-2xl">
            {/* Header image mockup */}
            <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-5">
              <img 
                src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=650&q=80" 
                alt="Backbackpacking" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute top-3 left-3 bg-[#050508]/85 backdrop-blur-md text-indigo-300 text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border border-white/10">
                ACTIVE CO-TRAVELING
              </div>
              <div className="absolute bottom-3 right-3 bg-indigo-600 text-white font-mono font-bold text-xs px-3 py-1 rounded-full shadow-lg shadow-indigo-600/30 animate-pulse">
                Seats Left: 2/5
              </div>
            </div>

            {/* Social Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" 
                  alt="avatar" 
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/20"
                />
                <div className="text-left">
                  <h4 className="text-xs font-bold text-slate-200">raju_explorer</h4>
                  <p className="text-[10px] text-slate-400">Old Manali, India</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">$250/person</span>
            </div>

            {/* Trip Detail */}
            <h3 className="text-base font-bold text-left text-white mb-2 line-clamp-1">
              Highland Manali Backpacking Expedition
            </h3>
            <p className="text-xs text-left text-slate-400 mb-5 line-clamp-2">
              We are 5 friends going to Manali next week. 2 more travelers can join our private wooden cabins booking. Includes daily valley trekking!
            </p>

            {/* Simulated Request list inside Card */}
            <div className="pt-4 border-t border-white/10 text-left space-y-3">
              <span className="text-[10px] font-mono tracking-wider text-slate-500 font-semibold block">OUTSTANDING CO-TRAVEL JOIN REQUESTS</span>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-start gap-2">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" 
                  alt="sophie" 
                  referrerPolicy="no-referrer"
                  className="h-6 w-6 rounded-full object-cover"
                />
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-300 font-semibold">sophie_globe <span className="text-[9px] font-normal text-indigo-400 uppercase bg-indigo-500/10 px-1 py-0.2 rounded ml-1.5 font-mono">Pending Approval</span></p>
                  <p className="text-[10px] text-slate-400 italic">“I would love to join your adventure team! I can cook amazing French meals at the cabins.”</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Feature Bento Grid - Highly Asymmetric Redesign */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-6 pt-16">
        {/* Cell 1: Wide Layout for Social Feed */}
        <div className="md:col-span-8 bg-[#0b0c14] border border-white/10 rounded-[2rem] p-8 text-left flex flex-col justify-between hover:border-indigo-500/30 transition-all duration-300 group shadow-xl">
          <div className="space-y-4">
            <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-white/10 text-indigo-400">
              <Compass className="h-5.5 w-5.5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Interactive Social Feed</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              Publish breathtaking snapshots of your journeys, document precise geo-markers, and present professional high-impact photoblogs. Discover what travelers across the world are experiencing right now in our live feed.
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-indigo-400 font-semibold group-hover:text-indigo-300 transition-colors">
            <span>Explore live wanderlust posts</span>
            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Cell 2: Tall Layout for Planning */}
        <div className="md:col-span-4 bg-[#0a0715] border border-white/10 rounded-[2rem] p-8 text-left flex flex-col justify-between hover:border-purple-500/30 transition-all duration-300 group shadow-xl">
          <div className="space-y-4">
            <div className="h-11 w-11 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
              <Users className="h-5.5 w-5.5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Group Organizer</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Plan custom routes, declare exact available passenger vacancies, define real budgetary limits, and review incoming requests with one-click decision tools.
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-purple-400 font-semibold group-hover:text-purple-300 transition-colors">
            <span>Start organizing today</span>
            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Cell 3: Tall Core AI Planner features */}
        <div className="md:col-span-4 bg-[#080b18] border border-white/10 rounded-[2rem] p-8 text-left flex flex-col justify-between hover:border-blue-500/30 transition-all duration-300 group shadow-xl">
          <div className="space-y-4">
            <div className="h-11 w-11 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
              <Sparkles className="h-5.5 w-5.5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Gemini Travel Core</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Leverage custom Google Gemini AI model parameters to structure intelligent multi-day itineraries, generate bulleted custom item packing lists, and prepare safety briefs.
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-blue-400 font-semibold group-hover:text-blue-300 transition-colors">
            <span>Generate smart routes</span>
            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Cell 4: Medium Wide Verified Safety */}
        <div className="md:col-span-8 bg-[#090b0e] border border-white/10 rounded-[2rem] p-8 text-left flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 group shadow-xl">
          <div className="space-y-4">
            <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-5.5 w-5.5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Integrated Co-Traveler Security</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every profile requires customized user bio configuration, avatar setups, and structured requests. Creators maintain full authority to moderate, accept, or deny members in real-time, preventing spam and keeping co-travel groups secure and authenticated.
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-emerald-400 font-semibold group-hover:text-emerald-300 transition-colors">
            <span>Learn about safety core</span>
            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}

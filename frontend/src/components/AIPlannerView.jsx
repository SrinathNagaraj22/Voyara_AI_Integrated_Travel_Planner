import React, { useState, useEffect } from "react";
import {
  Sparkles,
  MapPin,
  Loader2,
  Compass,
  BookOpen,
  AlertCircle,
  TrendingUp,
  Plane,
  Clock,
  Plus,
  Trash2,
  Users,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const LOADING_STATUSES = [
  "Awakening Gemini travel planner engine...",
  "Retrieving geographical coordinates and maps grounding data...",
  "Compiling cozy backpacking housing layouts and villa options...",
  "Formatting regional culinary and visual café itineraries...",
  "Balancing estimated budget categories with live spending projections...",
  "Double checking safety parameters and seasonal packing requirements...",
  "Finalizing your customized Voyara escape brochure...",
];

const TRAVEL_MODES = ["Walk", "Metro", "Bus", "Taxi", "Car", "Train", "Flight", "Ferry", "Bike"];

const emptyActivity = () => ({
  timeOfDay: "Morning",
  activityName: "",
  description: "",
  departureTime: "09:00",
  arrivalTime: "10:00",
  travelMode: "Walk",
  recommendedOption: "",
  estimatedCost: "$0",
});

export default function AIPlannerView({ onGenerateItinerary, onCreateTrip, showToast }) {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState(3);
  const [loading, setLoading] = useState(false);
  const [loadingStatusIndex, setLoadingStatusIndex] = useState(0);
  const [itinerary, setItinerary] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedDayTab, setSelectedDayTab] = useState(1);

  // Save-as-trip modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saveStartDate, setSaveStartDate] = useState("");
  const [saveEndDate, setSaveEndDate] = useState("");
  const [saveSeats, setSaveSeats] = useState(4);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStatusIndex((p) => (p + 1) % LOADING_STATUSES.length);
      }, 2500);
    } else {
      setLoadingStatusIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!destination.trim()) {
      setErrorMsg("Please specify a destination.");
      return;
    }
    if (!budget.trim()) {
      setErrorMsg("Please provide a target budget.");
      return;
    }

    setLoading(true);
    setItinerary(null);
    try {
      const result = await onGenerateItinerary({ destination, budget, days });
      setItinerary(result);
      setSelectedDayTab(1);
    } catch (err) {
      setErrorMsg(err?.message || "Failed to organize itinerary.");
    } finally {
      setLoading(false);
    }
  };

  // ----- itinerary edit helpers -----
  const updateItinerary = (patch) => setItinerary((prev) => ({ ...prev, ...patch }));

  const updateDay = (dayIdx, patch) => {
    setItinerary((prev) => {
      const next = { ...prev, days: prev.days.map((d, i) => (i === dayIdx ? { ...d, ...patch } : d)) };
      return next;
    });
  };

  const updateActivity = (dayIdx, actIdx, patch) => {
    setItinerary((prev) => ({
      ...prev,
      days: prev.days.map((d, i) =>
        i === dayIdx
          ? { ...d, activities: d.activities.map((a, j) => (j === actIdx ? { ...a, ...patch } : a)) }
          : d
      ),
    }));
  };

  const addActivity = (dayIdx) => {
    setItinerary((prev) => ({
      ...prev,
      days: prev.days.map((d, i) =>
        i === dayIdx ? { ...d, activities: [...d.activities, emptyActivity()] } : d
      ),
    }));
  };

  const removeActivity = (dayIdx, actIdx) => {
    setItinerary((prev) => ({
      ...prev,
      days: prev.days.map((d, i) =>
        i === dayIdx
          ? { ...d, activities: d.activities.filter((_, j) => j !== actIdx) }
          : d
      ),
    }));
  };

  const updateBudgetRow = (idx, patch) => {
    setItinerary((prev) => ({
      ...prev,
      budgetBreakdown: prev.budgetBreakdown.map((b, i) => (i === idx ? { ...b, ...patch } : b)),
    }));
  };

  const updateTip = (idx, value) => {
    setItinerary((prev) => ({
      ...prev,
      tips: prev.tips.map((t, i) => (i === idx ? value : t)),
    }));
  };

  // ----- save as trip -----
  const openSaveModal = () => {
    setSaveTitle(`${itinerary.destination} group trip`);
    setSaveStartDate("");
    setSaveEndDate("");
    setSaveSeats(4);
    setSaveError(null);
    setShowSaveModal(true);
  };

  const handleSaveAsTrip = async (e) => {
    e.preventDefault();
    setSaveError(null);

    if (!saveTitle.trim()) {
      setSaveError("Title is required.");
      return;
    }
    if (!saveStartDate || !saveEndDate) {
      setSaveError("Start and end dates are required.");
      return;
    }
    if (saveEndDate < saveStartDate) {
      setSaveError("End date must be on or after start date.");
      return;
    }
    if (saveSeats < 2 || saveSeats > 50) {
      setSaveError("Seats must be between 2 and 50.");
      return;
    }

    setSaving(true);
    try {
      await onCreateTrip({
        title: saveTitle.trim(),
        destination: itinerary.destination,
        startDate: saveStartDate,
        endDate: saveEndDate,
        budget: itinerary.estimatedBudget,
        totalSeats: saveSeats,
        description: itinerary.summary,
        itinerary,
      });
      setShowSaveModal(false);
      if (showToast) showToast("Trip posted. Friends can request to join from the Trips tab.", "success");
    } catch (err) {
      setSaveError(err?.message || "Could not save the trip.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-[#0b0c14] rounded-[2rem] p-6 md:p-8 text-left relative overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
          </div>
          <span className="font-mono text-xs text-indigo-400 font-bold uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded">
            Gemini Core AI
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-none mb-3">
          AI Travel Itinerary Core
        </h1>
        <p className="text-sm text-slate-400 max-w-xl">
          Generate a draft plan, edit every detail, then post it as a trip your friends or other travelers can request to join.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form panel */}
        <div className="lg:col-span-4 bg-[#0b0c14] border border-white/10 rounded-[2rem] p-6 text-left space-y-6 shadow-xl">
          <h2 className="text-base font-bold text-slate-200 border-b border-white/5 pb-2 flex items-center gap-2">
            <Compass className="h-4.5 w-4.5 text-indigo-400" />
            <span>Escape Parameters</span>
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono tracking-wider text-slate-500 font-bold block mb-1 uppercase">
                Target Destination
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-indigo-400" />
                <input
                  type="text"
                  placeholder="e.g. Manali India, Tokyo Japan"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-[#050508]/60 border border-white/10 rounded-xl pl-10 pr-3 py-3 text-sm text-white focus:border-indigo-500/50 focus:outline-none placeholder-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono tracking-wider text-slate-500 font-bold block mb-1 uppercase">
                Target Budget
              </label>
              <input
                type="text"
                placeholder="e.g. $500, Backpacker, Luxury"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-[#050508]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500/50 focus:outline-none placeholder-slate-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono tracking-wider text-slate-500 font-bold mb-1 uppercase">
                <span>Trip Duration</span>
                <span className="text-indigo-400">{days} Days Plan</span>
              </div>
              <input
                type="range"
                min={1}
                max={14}
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 3)}
                className="w-full h-1.5 bg-[#050508] rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-white/10"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>1 Day</span>
                <span>14 Days Max</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg text-xs font-semibold bg-rose-950/30 text-rose-300 border border-rose-900/40 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Organizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4.5 w-4.5" />
                  <span>{itinerary ? "Regenerate plan" : "Generate plan"}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results panel */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[#0b0c14] border border-white/10 rounded-[2rem] p-12 text-center min-h-[400px] flex flex-col justify-center items-center space-y-6 shadow-2xl"
              >
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-indigo-500/20 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-purple-500/40 animate-spin [animation-duration:1.5s]" />
                  <Compass className="absolute inset-4 h-8 w-8 text-indigo-400 animate-pulse" />
                </div>

                <div className="space-y-2 max-w-sm">
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                    Formulating Custom Routes
                  </h3>
                  <p className="text-xs text-indigo-300 animate-pulse h-4 font-mono font-medium truncate">
                    {LOADING_STATUSES[loadingStatusIndex]}
                  </p>
                </div>
              </motion.div>
            ) : itinerary ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-left"
              >
                {/* Header card — editable destination + budget + duration */}
                <div className="bg-[#0b0c14] border border-white/10 rounded-[2rem] p-6 space-y-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-wider text-indigo-300 bg-indigo-500/15 border border-indigo-500/25 px-2.5 py-0.5 rounded font-bold uppercase">
                      Editable Itinerary
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Tweak any field, then post it as a trip.
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                        Destination
                      </label>
                      <input
                        value={itinerary.destination || ""}
                        onChange={(e) => updateItinerary({ destination: e.target.value })}
                        className="w-full bg-[#050508]/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                        Estimated budget
                      </label>
                      <input
                        value={itinerary.estimatedBudget || ""}
                        onChange={(e) => updateItinerary({ estimatedBudget: e.target.value })}
                        className="w-full bg-[#050508]/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-emerald-300 font-mono focus:border-indigo-500/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                        Total days
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={14}
                        value={itinerary.totalDays || 1}
                        onChange={(e) =>
                          updateItinerary({ totalDays: parseInt(e.target.value) || 1 })
                        }
                        className="w-full bg-[#050508]/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                      Summary
                    </label>
                    <textarea
                      rows={2}
                      value={itinerary.summary || ""}
                      onChange={(e) => updateItinerary({ summary: e.target.value })}
                      className="w-full bg-[#050508]/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-indigo-500/50 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Budget + Day-by-day */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-5 bg-[#0b0c14] border border-white/10 rounded-[2rem] p-6 space-y-4 shadow-xl">
                    <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider border-b border-white/5 pb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      <span>Budget breakdown</span>
                    </h3>

                    <div className="space-y-3">
                      {(itinerary.budgetBreakdown || []).map((cat, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-[#050508]/40 border border-white/5 space-y-2"
                        >
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              value={cat.category || ""}
                              onChange={(e) => updateBudgetRow(idx, { category: e.target.value })}
                              className="bg-[#050508]/80 border border-white/10 rounded px-2 py-1 text-xs font-semibold text-slate-100 focus:border-indigo-500/50 focus:outline-none"
                            />
                            <input
                              value={cat.amount || ""}
                              onChange={(e) => updateBudgetRow(idx, { amount: e.target.value })}
                              className="bg-[#050508]/80 border border-white/10 rounded px-2 py-1 text-xs font-bold text-emerald-400 font-mono focus:border-indigo-500/50 focus:outline-none"
                            />
                          </div>
                          <input
                            value={cat.description || ""}
                            onChange={(e) => updateBudgetRow(idx, { description: e.target.value })}
                            placeholder="Description"
                            className="w-full bg-[#050508]/80 border border-white/10 rounded px-2 py-1 text-[11px] text-slate-400 focus:border-indigo-500/50 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-7 bg-[#0b0c14] border border-white/10 rounded-[2rem] p-6 space-y-4 shadow-xl">
                    <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider border-b border-white/5 pb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-indigo-400" />
                      <span>Day by day</span>
                    </h3>

                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {(itinerary.days || []).map((day) => (
                        <button
                          type="button"
                          key={day.dayNumber}
                          onClick={() => setSelectedDayTab(day.dayNumber)}
                          className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
                            selectedDayTab === day.dayNumber
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30"
                              : "bg-[#050508]/50 text-slate-400 hover:text-slate-200 border border-white/5"
                          }`}
                        >
                          D{String(day.dayNumber).padStart(2, "0")}
                        </button>
                      ))}
                    </div>

                    {(itinerary.days || []).map((day, dayIdx) => {
                      if (day.dayNumber !== selectedDayTab) return null;
                      return (
                        <motion.div
                          key={day.dayNumber}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-3"
                        >
                          <div className="p-3 bg-indigo-950/10 border-l-2 border-indigo-500 rounded-r-lg space-y-1">
                            <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase">
                              Day {day.dayNumber} theme
                            </span>
                            <input
                              value={day.theme || ""}
                              onChange={(e) => updateDay(dayIdx, { theme: e.target.value })}
                              className="w-full bg-transparent border-0 border-b border-white/10 px-0 py-1 text-sm font-bold text-white focus:border-indigo-500 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-3">
                            {(day.activities || []).map((act, actIdx) => (
                              <div
                                key={actIdx}
                                className="p-3 rounded-xl bg-[#050508]/40 border border-white/5 space-y-2"
                              >
                                <div className="flex items-center gap-2">
                                  <select
                                    value={act.timeOfDay || "Morning"}
                                    onChange={(e) =>
                                      updateActivity(dayIdx, actIdx, { timeOfDay: e.target.value })
                                    }
                                    className="bg-[#050508]/80 border border-white/10 rounded px-2 py-1 text-[10px] font-mono font-bold text-indigo-300 focus:border-indigo-500/50 focus:outline-none"
                                  >
                                    <option>Morning</option>
                                    <option>Afternoon</option>
                                    <option>Evening</option>
                                    <option>Night</option>
                                  </select>
                                  <input
                                    value={act.activityName || ""}
                                    onChange={(e) =>
                                      updateActivity(dayIdx, actIdx, { activityName: e.target.value })
                                    }
                                    placeholder="Activity name"
                                    className="flex-1 bg-[#050508]/80 border border-white/10 rounded px-2 py-1 text-xs font-bold text-white focus:border-indigo-500/50 focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeActivity(dayIdx, actIdx)}
                                    title="Remove activity"
                                    className="p-1.5 rounded hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  <div>
                                    <label className="text-[9px] font-mono uppercase text-slate-500 block mb-0.5 flex items-center gap-1">
                                      <Clock className="h-2.5 w-2.5" /> Depart
                                    </label>
                                    <input
                                      type="time"
                                      value={act.departureTime || ""}
                                      onChange={(e) =>
                                        updateActivity(dayIdx, actIdx, { departureTime: e.target.value })
                                      }
                                      className="w-full bg-[#050508]/80 border border-white/10 rounded px-2 py-1 text-[11px] text-slate-200 font-mono focus:border-indigo-500/50 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[9px] font-mono uppercase text-slate-500 block mb-0.5 flex items-center gap-1">
                                      <Clock className="h-2.5 w-2.5" /> Arrive
                                    </label>
                                    <input
                                      type="time"
                                      value={act.arrivalTime || ""}
                                      onChange={(e) =>
                                        updateActivity(dayIdx, actIdx, { arrivalTime: e.target.value })
                                      }
                                      className="w-full bg-[#050508]/80 border border-white/10 rounded px-2 py-1 text-[11px] text-slate-200 font-mono focus:border-indigo-500/50 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[9px] font-mono uppercase text-slate-500 block mb-0.5 flex items-center gap-1">
                                      <Plane className="h-2.5 w-2.5" /> Mode
                                    </label>
                                    <select
                                      value={act.travelMode || "Walk"}
                                      onChange={(e) =>
                                        updateActivity(dayIdx, actIdx, { travelMode: e.target.value })
                                      }
                                      className="w-full bg-[#050508]/80 border border-white/10 rounded px-2 py-1 text-[11px] text-slate-200 focus:border-indigo-500/50 focus:outline-none"
                                    >
                                      {TRAVEL_MODES.map((m) => (
                                        <option key={m}>{m}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[9px] font-mono uppercase text-slate-500 block mb-0.5">
                                      Est. cost
                                    </label>
                                    <input
                                      value={act.estimatedCost || ""}
                                      onChange={(e) =>
                                        updateActivity(dayIdx, actIdx, { estimatedCost: e.target.value })
                                      }
                                      placeholder="$0"
                                      className="w-full bg-[#050508]/80 border border-white/10 rounded px-2 py-1 text-[11px] text-emerald-400 font-mono focus:border-indigo-500/50 focus:outline-none"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[9px] font-mono uppercase text-slate-500 block mb-0.5">
                                    Recommended option
                                  </label>
                                  <input
                                    value={act.recommendedOption || ""}
                                    onChange={(e) =>
                                      updateActivity(dayIdx, actIdx, { recommendedOption: e.target.value })
                                    }
                                    placeholder="e.g. Take the Karasuma line; book Hotel A via Booking"
                                    className="w-full bg-[#050508]/80 border border-white/10 rounded px-2 py-1 text-[11px] text-indigo-200 focus:border-indigo-500/50 focus:outline-none"
                                  />
                                </div>

                                <div>
                                  <label className="text-[9px] font-mono uppercase text-slate-500 block mb-0.5">
                                    Description
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={act.description || ""}
                                    onChange={(e) =>
                                      updateActivity(dayIdx, actIdx, { description: e.target.value })
                                    }
                                    className="w-full bg-[#050508]/80 border border-white/10 rounded px-2 py-1 text-[11px] text-slate-400 focus:border-indigo-500/50 focus:outline-none resize-none"
                                  />
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => addActivity(dayIdx)}
                              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-white/10 text-[11px] text-slate-500 hover:text-indigo-300 hover:border-indigo-500/40 transition cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Add activity to day {day.dayNumber}</span>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-[#0b0c14] border border-white/10 rounded-[2rem] p-6 space-y-3 shadow-xl">
                  <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
                    Tips
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(itinerary.tips || []).map((tip, idx) => (
                      <textarea
                        key={idx}
                        rows={3}
                        value={tip}
                        onChange={(e) => updateTip(idx, e.target.value)}
                        className="p-3 bg-[#050508]/40 rounded-xl border border-white/5 text-[11px] text-slate-300 leading-relaxed focus:border-indigo-500/50 focus:outline-none resize-none"
                      />
                    ))}
                  </div>
                </div>

                {/* Save as trip CTA */}
                <div className="bg-gradient-to-br from-indigo-950/40 via-[#0b0c14] to-purple-950/30 border border-indigo-500/20 rounded-[2rem] p-6 space-y-3 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">Happy with the plan?</h4>
                      <p className="text-xs text-slate-400">
                        Post this as a trip so friends — and anyone in the Voyara feed — can request to join.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openSaveModal}
                      className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-900/30 transition flex items-center gap-2 cursor-pointer shrink-0"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Post as trip</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-[#0b0c14] border border-white/10 rounded-[2rem] p-12 text-center text-slate-500 min-h-[300px] flex flex-col justify-center items-center shadow-2xl">
                <Sparkles className="h-10 w-10 text-indigo-500/50 mb-3 animate-pulse" />
                <h3 className="text-slate-300 font-bold mb-1">Your itinerary will appear here</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Fill in destination, budget, and days on the left, then generate a draft. Every field is editable before you post it as a trip.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Save-as-trip modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !saving && setShowSaveModal(false)}
          >
            <motion.form
              onSubmit={handleSaveAsTrip}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#0b0c14] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Post this as a trip</h3>
              </div>
              <p className="text-xs text-slate-400">
                Anyone on Voyara can see the trip and request to join. The full itinerary travels with it.
              </p>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                  Trip title
                </label>
                <input
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  className="w-full bg-[#050508]/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={saveStartDate}
                    onChange={(e) => setSaveStartDate(e.target.value)}
                    className="w-full bg-[#050508]/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                    End date
                  </label>
                  <input
                    type="date"
                    value={saveEndDate}
                    onChange={(e) => setSaveEndDate(e.target.value)}
                    className="w-full bg-[#050508]/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                  Total seats (including you)
                </label>
                <input
                  type="number"
                  min={2}
                  max={50}
                  value={saveSeats}
                  onChange={(e) => setSaveSeats(parseInt(e.target.value) || 2)}
                  className="w-full bg-[#050508]/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
                />
              </div>

              {saveError && (
                <div className="p-2.5 rounded-lg text-xs font-semibold bg-rose-950/30 text-rose-300 border border-rose-900/40 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{saveError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-300 hover:bg-white/5 transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>Post trip</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

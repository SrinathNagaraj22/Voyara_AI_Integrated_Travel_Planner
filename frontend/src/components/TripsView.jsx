import React, { useState } from "react";
import { Users, Search, MapPin, Calendar, DollarSign, Plus, Check, MessageSquare, Info, AlertCircle, Sparkles, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
export default function TripsView({
  trips,
  currentUser,
  onSearchTrips,
  onCreateTrip,
  onSendJoinRequest,
  selectedTripId
}) {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestFilter, setSelectedDestFilter] = useState("All");

  // Create Trip Forms
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [totalSeats, setTotalSeats] = useState(5);
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Proposal Modal for Joining
  const [joiningTrip, setJoiningTrip] = useState(null);
  const [proposalMessage, setProposalMessage] = useState("");
  const [joinStatusMessage, setJoinStatusMessage] = useState(null);
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);

  // Accordion details
  const [expandedTripId, setExpandedTripId] = useState(selectedTripId || null);

  const destinationOptions = ["All", "Manali", "Kyoto", "Amalfi"];

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    onSearchTrips(val, selectedDestFilter === "All" ? "" : selectedDestFilter);
  };

  const handleDestFilterSelect = (dest) => {
    setSelectedDestFilter(dest);
    onSearchTrips(searchQuery, dest === "All" ? "" : dest);
  };

  const submitCreateTrip = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!title || !destination || !startDate || !endDate || !budget || !totalSeats || !description) {
      setFormError("All input metrics are required to deploy a new trip card!");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setFormError("Departure start date cannot exceed the return date.");
      return;
    }

    try {
      await onCreateTrip({
        title,
        destination,
        startDate,
        endDate,
        budget,
        totalSeats,
        description
      });
      setFormSuccess("Expedition published successfully! Added to explorer listings.");
      setTitle("");
      setDestination("");
      setStartDate("");
      setEndDate("");
      setBudget("");
      setTotalSeats(5);
      setDescription("");
      setTimeout(() => {
        setFormSuccess(null);
        setShowCreateForm(false);
      }, 2500);
    } catch (err) {
      setFormError(err?.message || "Failed to publish travel plan.");
    }
  };

  const submitJoinProposal = async () => {
    if (!joiningTrip) return;
    setIsSubmittingJoin(true);
    setJoinStatusMessage(null);

    try {
      await onSendJoinRequest(joiningTrip.id, proposalMessage);
      setJoinStatusMessage({ text: "Join request securely queued! Host will review your bio and message shortly.", type: "success" });
      setProposalMessage("");
      setTimeout(() => {
        setJoiningTrip(null);
        setJoinStatusMessage(null);
      }, 3000);
    } catch (err) {
      setJoinStatusMessage({ text: err?.message || "Failed to catalog join request.", type: "error" });
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Search Header Banner */}
      <div className="bg-[#0b0c14] border border-white/10 rounded-[2rem] p-6 md:p-8 text-left relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/10 rounded-full blur-2xl" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <Users className="h-7 w-7 text-indigo-400" />
              <span>Group Travel Registries</span>
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Discover verified travel listings organized by active explorers. Find companions, split lodgings, and experience destinations together.
            </p>
          </div>

          <button
            id="btn-register-trip-toggle"
            onClick={() => setShowCreateForm(true)}
            className="self-start md:self-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer text-sm"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Launch Group Trip</span>
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <input
              id="search-trips-bar"
              type="text"
              placeholder="Search by keywords, destinations or itineraries..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full glass-input pl-10 text-sm"
            />
          </div>

          {/* Preset Buttons Column */}
          <div className="md:col-span-6 flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs text-slate-500 font-mono tracking-wider font-semibold mr-1.5 shrink-0">REGIONS:</span>
            {destinationOptions.map((dest) => {
              const isSelected = selectedDestFilter === dest;
              return (
                <button
                  key={dest}
                  onClick={() => handleDestFilterSelect(dest)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? "bg-indigo-950/40 text-indigo-300 border-indigo-500/60"
                      : "bg-[#050508]/40 text-slate-400 border-white/10 hover:text-slate-200"
                  }`}
                >
                  {dest === "All" ? "🌍 Worldwide" : dest}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Listings, Right Form is absolute overlay modal for great UX */}
      <div className="grid grid-cols-1 gap-6">
        {/* Listings column */}
        <div className="space-y-4">
          {trips.length === 0 ? (
            <div className="bg-[#0b0c14] border border-white/10 rounded-[2rem] p-12 text-center text-slate-500">
              <AlertCircle className="h-8 w-8 text-indigo-500/50 mx-auto mb-3" />
              <p className="text-base text-slate-400">No companion groups found matching filters.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDestFilter("All");
                  onSearchTrips("", "");
                }}
                className="mt-3 text-sm text-indigo-400 hover:underline inline-block"
              >
                Clear searching and view all
              </button>
            </div>
          ) : (
            trips.map((trip) => {
              const isCreator = trip.creatorId === currentUser.id;
              const isMember = trip.members.includes(currentUser.id);
              const seatsFilled = trip.totalSeats - trip.availableSeats;
              const fillPercentage = (seatsFilled / trip.totalSeats) * 100;
              const isExpanded = expandedTripId === trip.id;

              return (
                <div
                  key={trip.id}
                  id={`trip-card-${trip.id}`}
                  className={`bg-[#0b0c14] border rounded-[2rem] p-5 transition-all duration-300 text-left ${
                    selectedTripId === trip.id || isExpanded
                      ? "border-indigo-500/40 shadow-xl shadow-indigo-950/5"
                      : "border-white/10 hover:border-white/20 hover:bg-[#10111a]/40"
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    {/* Header Left */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                          {trip.destination}
                        </span>
                        <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                          Active Planning
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white leading-snug">{trip.title}</h3>
                    </div>

                    {/* Header Right Stats */}
                    <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t border-white/5 md:border-transparent">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-mono uppercase">Split Budget</p>
                        <p className="text-base font-extrabold text-emerald-400 font-mono">{trip.budget}</p>
                      </div>
                      <div className="h-8 w-[1px] bg-white/10" />
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-mono uppercase">Remaining Seats</p>
                        <p className="text-base font-extrabold text-indigo-400 font-mono">
                          {trip.availableSeats} <span className="text-xs text-slate-400 font-normal">/ {trip.totalSeats}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Seat allocation Progress bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-[11px] font-mono font-medium text-slate-400">
                      <span>Room Coordination Density</span>
                      <span>{seatsFilled} spots claimed ({Math.round(fillPercentage)}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#050508] rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-emerald-500 rounded-full transition-all duration-500" 
                        style={{ width: `${fillPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Secondary info strip */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 px-4 rounded-xl bg-[#050508]/40 border border-white/5 text-xs mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-indigo-400 shrink-0" />
                      <div>
                        <p className="text-[9px] font-mono text-slate-500 uppercase">Start Date</p>
                        <p className="text-slate-300 font-medium">{trip.startDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-400 shrink-0" />
                      <div>
                        <p className="text-[9px] font-mono text-slate-500 uppercase">End Date</p>
                        <p className="text-slate-300 font-medium">{trip.endDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-white/5 pt-2 md:pt-0 md:pl-3">
                      <Users className="h-4 w-4 text-indigo-400 shrink-0" />
                      <div>
                        <p className="text-[9px] font-mono text-slate-500 uppercase">Organizer</p>
                        <p className="text-slate-300 font-medium">@{trip.creator.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-white/5 pt-2 md:pt-0 md:pl-3">
                      <Info className="h-4 w-4 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-[9px] font-mono text-slate-500 uppercase">Host Status</p>
                        <p className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Verified Host</p>
                      </div>
                    </div>
                  </div>

                  {/* Collapse / Expand Segment */}
                  <div className="flex justify-between items-center gap-4">
                    {/* Expand Trigger Button */}
                    <button
                      onClick={() => setExpandedTripId(isExpanded ? null : trip.id)}
                      className="text-xs font-mono text-slate-400 hover:text-indigo-400 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <span>Hide overview details</span>
                          <ChevronUp className="h-3.5 w-3.5 text-indigo-400" />
                        </>
                      ) : (
                        <>
                          <span>Read detailed checklist & members ({trip.members.length})</span>
                          <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                        </>
                      )}
                    </button>

                    {/* Booking/Join CTAs */}
                    <div className="flex items-center gap-2">
                      {isCreator ? (
                        <div className="px-3.5 py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-950/20 text-indigo-300 text-xs font-bold flex items-center gap-1.5">
                          <Check className="h-4 w-4 text-indigo-400" />
                          <span>Host Organizer</span>
                        </div>
                      ) : isMember ? (
                        <div className="px-3.5 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-950/20 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                          <Check className="h-4 w-4 text-emerald-400" />
                          <span>Joined Companion</span>
                        </div>
                      ) : (
                        <button
                          id={`btn-request-join-${trip.id}`}
                          onClick={() => {
                            setJoiningTrip(trip);
                            setProposalMessage(`Hey ${trip.creator.username}! I am incredibly excited about your trip to ${trip.destination}. I would love to be the next travel companion and team member!`);
                          }}
                          disabled={trip.availableSeats === 0}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/25 transition-all text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:hover:bg-indigo-600"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{trip.availableSeats === 0 ? "Seats sold out" : "Request to Join Group"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Body Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 pt-4 border-t border-white/5 space-y-4"
                    >
                      <div className="space-y-1.5 text-slate-300 text-xs leading-relaxed">
                        <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">Plan Description & Rules:</h4>
                        <p>{trip.description}</p>
                      </div>

                      {/* Bio of Creator */}
                      {trip.creator.bio && (
                        <div className="p-3.5 rounded-xl bg-[#050508]/40 border border-white/5 flex gap-3 text-xs leading-relaxed">
                          <img 
                            src={trip.creator.avatarUrl} 
                            alt={trip.creator.username} 
                            referrerPolicy="no-referrer"
                            className="h-8 w-8 rounded-full object-cover shrink-0"
                          />
                          <div className="space-y-1">
                            <h5 className="font-bold text-slate-200">About the Host (@{trip.creator.username}):</h5>
                            <p className="text-slate-400 italic">“{trip.creator.bio}”</p>
                          </div>
                        </div>
                      )}

                      {/* Current Joined Members */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">Current Companions ({trip.members.length}):</h4>
                        <div className="flex flex-wrap gap-3">
                          {trip.memberDetails && trip.memberDetails.map((mem) => (
                            <div key={mem.id} className="inline-flex items-center gap-2 p-1.5 pr-3 rounded-full bg-[#050508]/60 border border-white/5 text-[11px] font-medium text-slate-300">
                              <img
                                src={mem.avatarUrl}
                                alt={mem.username}
                                referrerPolicy="no-referrer"
                                className="h-5 w-5 rounded-full object-cover"
                              />
                              <span>@{mem.username}</span>
                              {mem.id === trip.creatorId && (
                                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.1 rounded font-mono">Host</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RETHINK: CREATE GROUP TRIP DIALOG/OVERLAY (PREVENTS LARGE FORM JITTER ON MOBILES) */}
      <AnimatePresence>
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-[#0c0d15] rounded-[2rem] border border-white/10 p-6 md:p-8 relative text-left shadow-2xl"
            >
              <button
                onClick={() => setShowCreateForm(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-[#050508]/50 border border-white/10 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-8 rounded-lg bg-indigo-600/15 flex items-center justify-center border border-indigo-500/30 text-indigo-400">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-xl font-bold text-white text-sans tracking-tight">Create Public Group Travel</h3>
              </div>

              <form onSubmit={submitCreateTrip} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-mono tracking-wider text-slate-500 font-bold block mb-1 uppercase">Trip Program Title</label>
                    <input
                      id="input-trip-title"
                      type="text"
                      placeholder="e.g. Traditional Machiya Stay & Food Photo Walk"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full glass-input text-sm"
                    />
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="text-[10px] font-mono tracking-wider text-slate-500 font-bold block mb-1 uppercase">Destination Region</label>
                    <input
                      id="input-trip-destination"
                      type="text"
                      placeholder="e.g. Kyoto, Japan or Manali, India"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full glass-input text-sm"
                    />
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="text-[10px] font-mono tracking-wider text-slate-500 font-bold block mb-1 uppercase">Split Budget Description</label>
                    <input
                      id="input-trip-budget"
                      type="text"
                      placeholder="e.g. $450 or 250"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full glass-input text-sm"
                    />
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="text-[10px] font-mono tracking-wider text-slate-500 font-bold block mb-1 uppercase">Departure Date</label>
                    <input
                      id="input-trip-start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full glass-input text-sm"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="text-[10px] font-mono tracking-wider text-slate-500 font-bold block mb-1 uppercase">Return Date</label>
                    <input
                      id="input-trip-end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full glass-input text-sm"
                    />
                  </div>

                  {/* Total Seats */}
                  <div>
                    <label className="text-[10px] font-mono tracking-wider text-slate-500 font-bold block mb-1 uppercase">Total Group Seats</label>
                    <input
                      id="input-trip-seats"
                      type="number"
                      min={2}
                      max={20}
                      value={totalSeats}
                      onChange={(e) => setTotalSeats(parseInt(e.target.value) || 5)}
                      className="w-full glass-input text-sm"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Includes organizer. At least 2 expected spots.</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-mono tracking-wider text-slate-500 font-bold block mb-1 uppercase">Itinerary description & co-travelling details</label>
                  <textarea
                    id="input-trip-description"
                    rows={4}
                    placeholder="Provide a thorough overview of plans, booking details, vehicle coordination, accommodation layout, food styles, and general criteria..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full glass-input text-sm resize-none text-slate-100"
                  />
                </div>

                {formError && (
                  <div className="p-3 rounded-lg text-xs font-semibold bg-rose-950/30 text-rose-300 border border-rose-900/40">
                    {formError}
                  </div>
                )}

                {formSuccess && (
                  <div className="p-3 rounded-lg text-xs font-semibold bg-emerald-950/30 text-emerald-300 border border-emerald-900/40">
                    {formSuccess}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-publish-trip-form"
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 cursor-pointer"
                  >
                    Publish Adventure plan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* proposal message dialog */}
      <AnimatePresence>
        {joiningTrip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050508]/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#0c0d15] rounded-[2rem] border border-white/10 p-6 relative text-left shadow-2xl"
            >
              <button
                onClick={() => setJoiningTrip(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-[#050508]/50 border border-white/10 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <h4 className="text-base font-bold text-white mb-2">Joining Proposal for @{joiningTrip.creator.username}</h4>
              <p className="text-xs text-slate-400 mb-4">
                Introduce yourself! Let the host know why you'd be a perfect companion for <strong className="text-indigo-400">{joiningTrip.destination}</strong>.
              </p>

              <div className="space-y-4">
                <textarea
                  id="input-proposal-message"
                  rows={4}
                  value={proposalMessage}
                  onChange={(e) => setProposalMessage(e.target.value)}
                  placeholder="Hey, I would love to tag along. I am very organized, love photography, and can assist on hiking routes!"
                  className="w-full glass-input text-sm resize-none text-slate-100"
                />

                {joinStatusMessage && (
                  <div className={`p-3 rounded-lg text-xs font-semibold ${
                    joinStatusMessage.type === "success" 
                      ? "bg-emerald-950/40 text-emerald-300 border border-emerald-900/40" 
                      : "bg-rose-950/40 text-rose-300 border border-rose-900/40"
                  }`}>
                    {joinStatusMessage.text}
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setJoiningTrip(null)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-submit-joining-proposal"
                    onClick={submitJoinProposal}
                    disabled={isSubmittingJoin}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    {isSubmittingJoin ? "Sending proposal..." : "Submit Join Request"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

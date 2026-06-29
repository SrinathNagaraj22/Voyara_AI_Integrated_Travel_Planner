import React, { useState } from "react";
import { User as UserIcon, MapPin, AlignLeft, Camera, Settings2, Compass, Users, Check, X, ClipboardList, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ProfileView({
  currentUser,
  onUpdateProfile,
  posts,
  trips,
  requests,
  onRespondToRequest,
  onViewTrip
}) {
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio || "");
  const [location, setLocation] = useState(currentUser.location || "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || "");
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Active navigation tab inside profile
  const [activeTab, setActiveTab] = useState("requests");

  // Filter requests
  const incomingRequests = requests.filter(r => r.role === "host");
  const outgoingRequests = requests.filter(r => r.role === "requester");

  const myPosts = posts.filter(p => p.userId === currentUser.id);
  const myTrips = trips.filter(t => t.creatorId === currentUser.id);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username) {
      setErrorMsg("Username cannot be empty");
      return;
    }

    try {
      await onUpdateProfile(bio, location, avatarUrl, username);
      setSuccessMsg("Profile metrics updated successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      setErrorMsg(err?.message || "Failed to edit profile details.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 text-left">
      {/* Profile Card Header */}
      <div className="bg-[#0b0c14] border border-white/10 rounded-[2rem] p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/10 rounded-full blur-2xl" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="relative">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.username}
                referrerPolicy="no-referrer"
                className="h-24 w-24 rounded-[1.5rem] object-cover ring-4 ring-indigo-500/20 shadow-xl"
              />
              <span className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-indigo-600 border border-slate-900 flex items-center justify-center text-white text-[10px]">
                🛡️
              </span>
            </div>

            <div className="space-y-1.5 py-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold text-white font-sans tracking-tight">@{currentUser.username}</h1>
                <span className="text-[9px] font-mono tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-bold uppercase">
                  ACTIVE TRAVEL MEMBER
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span>{currentUser.location || "Earth wanderer"}</span>
              </p>
              <p className="text-xs text-slate-400 max-w-xl italic leading-relaxed">
                “{currentUser.bio || "Searching for the next wooden cabin fires..."}”
              </p>
            </div>
          </div>

          <button
            id="btn-edit-profile-toggle"
            onClick={() => setIsEditing(!isEditing)}
            className="self-center md:self-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#050508]/60 hover:bg-[#050508]/90 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer text-xs font-semibold"
          >
            <Settings2 className="h-4 w-4 text-indigo-400" />
            <span>{isEditing ? "View Profile" : "Edit Bio / Avatar"}</span>
          </button>
        </div>

        {/* Editing Overlay forms */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-slate-800/80"
            >
              <form onSubmit={handleUpdate} className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono tracking-wider text-slate-500 font-bold block mb-1 uppercase">Username</label>
                    <input
                      id="edit-profile-username"
                      type="text"
                      className="w-full glass-input text-sm py-2"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-wider text-slate-500 font-bold block mb-1 uppercase">Location</label>
                    <input
                      id="edit-profile-location"
                      type="text"
                      className="w-full glass-input text-sm py-2"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-mono tracking-wider text-slate-500 font-bold block mb-1 uppercase">Avatar Image URL</label>
                    <input
                      id="edit-profile-avatar"
                      type="url"
                      className="w-full glass-input text-xs py-2"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-mono tracking-wider text-slate-500 font-bold block mb-1 uppercase">Wanderlust Biography</label>
                    <textarea
                      id="edit-profile-bio"
                      className="w-full glass-input text-xs resize-none"
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
                )}

                <div className="flex gap-2">
                  <button
                    id="btn-save-profile"
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    Save Biography
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-950/40 text-slate-400 font-bold rounded-lg text-xs hover:text-white border border-slate-900 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-950/40 text-emerald-300 border border-emerald-900/40 rounded-xl text-xs font-semibold">
            {successMsg}
          </div>
        )}
      </div>

      {/* Main Tabs Selection (My Items) */}
      <div className="space-y-6">
        <div className="flex border-b border-white/10">
          <button
            id="tab-requests"
            className={`px-5 py-3.5 font-bold text-sm tracking-tight border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "requests"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
            onClick={() => setActiveTab("requests")}
          >
            <ClipboardList className="h-4.5 w-4.5 text-indigo-400" />
            <span>Wanderlust Requests Console</span>
            {incomingRequests.filter(r => r.status === "pending").length > 0 && (
              <span className="h-4.5 min-w-4.5 bg-indigo-600 text-[10px] text-white rounded-full flex items-center justify-center font-extrabold px-1 animate-pulse">
                {incomingRequests.filter(r => r.status === "pending").length}
              </span>
            )}
          </button>
          <button
            id="tab-profile-trips"
            className={`px-5 py-3.5 font-bold text-sm tracking-tight border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "trips"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
            onClick={() => setActiveTab("trips")}
          >
            <Users className="h-4.5 w-4.5 text-indigo-400" />
            <span>My Organized Expeditions ({myTrips.length})</span>
          </button>
          <button
            id="tab-profile-posts"
            className={`px-5 py-3.5 font-bold text-sm tracking-tight border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "posts"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
            onClick={() => setActiveTab("posts")}
          >
            <Compass className="h-4.5 w-4.5 text-indigo-400" />
            <span>My Feed Publications ({myPosts.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div>
          {activeTab === "requests" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Column: Incoming Enquiries (Host role) */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-200">Incoming Join Enquiries</h3>
                  <p className="text-xs text-slate-500">Other explorers asking to join trip groups you launched.</p>
                </div>

                {incomingRequests.length === 0 ? (
                  <div className="p-10 bg-[#0b0c14] border border-white/10 rounded-[2rem] text-center text-slate-500 italic text-sm shadow-xl">
                    No join proposals received yet. Launch epic trips to attract backpackers!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {incomingRequests.map((req) => (
                      <div
                        key={req.id}
                        id={`incoming-req-card-${req.id}`}
                        className={`p-5 rounded-[2rem] bg-[#0b0c14] border ${
                          req.status === "pending" ? "border-indigo-500/20" : "border-white/10"
                        } space-y-3.5 shadow-xl`}
                      >
                        {/* Header details */}
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex gap-2.5 leading-tight">
                            <img
                              src={req.requesterAvatarUrl}
                              alt={req.requesterName}
                              referrerPolicy="no-referrer"
                              className="h-10 w-10 rounded-[1rem] object-cover ring-2 ring-indigo-500/20 shrink-0"
                            />
                            <div>
                              <h4 className="text-xs font-bold text-white">@{req.requesterName}</h4>
                              <p className="text-[10px] text-slate-500 italic max-w-xs">{req.requesterBio || "“Adventurous global nomad.”"}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] bg-slate-950 px-2 py-0.5 rounded font-semibold text-slate-400 uppercase font-mono border border-white/5">
                              Target Seat
                            </span>
                            <p className="text-[10px] text-indigo-400 font-semibold font-mono mt-1">Avail: {req.availableSeats} spots left</p>
                          </div>
                        </div>

                        {/* Associated Trip and message */}
                        <div className="p-3 bg-[#050508]/60 rounded-xl border border-white/5">
                          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">PROPOSAL SENT ON EXPEDITION:</p>
                          <button 
                            onClick={() => onViewTrip(req.tripId)}
                            className="text-xs font-bold text-white hover:text-indigo-400 hover:underline mb-1.5 transition block"
                          >
                            {req.tripTitle} ({req.tripDestination})
                          </button>
                          <blockquote className="text-xs text-slate-400 italic pl-2.5 border-l border-indigo-500 leading-relaxed font-sans">
                            “{req.message}”
                          </blockquote>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center bg-slate-950/20 pt-2 border-t border-white/5">
                          <span className="text-[10px] font-mono font-medium text-slate-500 uppercase">
                            Status: <strong className={`uppercase ${
                              req.status === "pending" ? "text-indigo-400 animate-pulse" : req.status === "accepted" ? "text-emerald-400" : "text-rose-400"
                            }`}>{req.status}</strong>
                          </span>

                          {req.status === "pending" ? (
                            <div className="flex gap-2">
                              <button
                                id={`btn-decline-req-${req.id}`}
                                onClick={() => onRespondToRequest(req.id, "rejected")}
                                className="px-3 py-1.5 rounded-lg border border-rose-950/60 bg-rose-950/10 text-rose-400 text-xs hover:bg-rose-950/20 font-semibold transition cursor-pointer"
                              >
                                Decline
                              </button>
                              <button
                                id={`btn-approve-req-${req.id}`}
                                onClick={() => onRespondToRequest(req.id, "accepted")}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1"
                              >
                                <Check className="h-3 w-3" />
                                <span>Approve Join</span>
                              </button>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1.5">
                              {req.status === "accepted" ? (
                                <>
                                  <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                                  <span className="text-emerald-400">Accepted & Added</span>
                                </>
                              ) : (
                                <>
                                  <X className="h-4.5 w-4.5 text-rose-500" />
                                  <span className="text-rose-400">Declined</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Outgoing Statuses (Requester role) */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-200">My Outgoing Proposals</h3>
                  <p className="text-xs text-slate-500">Group expeditions you requested to join and check progress indicators.</p>
                </div>

                {outgoingRequests.length === 0 ? (
                  <div className="p-10 bg-[#0b0c14] border border-white/10 rounded-[2rem] text-center text-slate-500 italic text-sm shadow-xl">
                    You have not submitted join enquiries to other travelers yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {outgoingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-5 rounded-[2rem] bg-[#0b0c14] border border-white/10 hover:border-white/20 transition-all text-xs space-y-2.5 text-left shadow-xl"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="text-[10px] text-slate-500 font-mono block">OUTGOING PROPOSAL SENT:</span>
                            <button
                              onClick={() => onViewTrip(req.tripId)}
                              className="text-white hover:text-indigo-400 hover:underline font-bold text-sm block leading-tight mt-0.5"
                            >
                              {req.tripTitle}
                            </button>
                            <span className="text-[10px] text-slate-400 mt-1 block font-mono">ORGANIZED BY @{req.hostName}</span>
                          </div>

                          <div className="shrink-0 font-mono">
                            {req.status === "pending" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20">
                                <Clock className="h-3 w-3 animate-spin text-amber-400" />
                                <span>PENDING REVIEW</span>
                              </span>
                            ) : req.status === "accepted" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25">
                                <CheckCircle className="h-3 w-3 text-emerald-400" />
                                <span>PROPOSAL APPROVED!</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/25">
                                <AlertTriangle className="h-3 w-3 text-rose-400" />
                                <span>DECLINED</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-2.5 bg-[#050508]/60 rounded-lg border border-white/5 text-slate-400 italic font-sans animate-fade">
                          “{req.message}”
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Created Trips */}
          {activeTab === "trips" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myTrips.length === 0 ? (
                <div className="md:col-span-2 p-12 bg-[#0b0c14] border border-white/10 rounded-[2rem] text-center text-slate-500 italic text-sm">
                  You have not published any group travel plan cards yet. Create one under the Group Trips tab!
                </div>
              ) : (
                myTrips.map((trip) => {
                  const seatsFilled = trip.totalSeats - trip.availableSeats;
                  const fillPercentage = (seatsFilled / trip.totalSeats) * 105;
                  return (
                    <div
                      key={trip.id}
                      className="bg-[#0b0c14] p-5 border border-white/10 rounded-[2rem] space-y-4 shadow-xl"
                    >
                      <div>
                        <span className="text-[9px] font-mono tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/15 px-2 py-0.5 rounded font-semibold uppercase">
                          {trip.destination}
                        </span>
                        <h4 className="text-base font-bold text-white mt-1.5">{trip.title}</h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">DATES: {trip.startDate} to {trip.endDate}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>Seat booking fills:</span>
                          <span>{seatsFilled} / {trip.totalSeats} spots claimed</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#050508] rounded-full overflow-hidden border border-white/5">
                          <div
                            className="h-full bg-indigo-500 transition-all duration-300"
                            style={{ width: `${Math.min(100, fillPercentage)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs pt-2.5 border-t border-white/5">
                        <span className="font-mono text-emerald-400 font-extrabold">{trip.budget} budget</span>
                        <button
                          onClick={() => onViewTrip(trip.id)}
                          className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline cursor-pointer"
                        >
                          Check active forum →
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab Created Posts */}
          {activeTab === "posts" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {myPosts.length === 0 ? (
                <div className="md:col-span-3 p-12 bg-[#0b0c14] border border-white/10 rounded-[2rem] text-center text-slate-500 italic text-sm shadow-xl">
                  You have not published any travel updates to the feed yet. Show of your scenery!
                </div>
              ) : (
                myPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-[#0b0c14] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col justify-between shadow-xl"
                  >
                    <div className="aspect-video w-full bg-[#050508] overflow-hidden relative">
                      <img
                        src={post.image}
                        alt={post.location}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-[#050508]/85 px-2.5 py-0.5 rounded text-[10px] text-indigo-300 font-mono flex items-center gap-1 border border-white/10">
                        <MapPin className="h-3 w-3 text-indigo-400" />
                        <span>{post.location}</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between text-left">
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{post.caption}</p>
                      <div className="text-[10px] text-slate-500 flex justify-between items-center font-mono pt-3 border-t border-white/10">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span className="text-rose-400 font-semibold flex items-center gap-1">❤️ {post.likes.length} Likes</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

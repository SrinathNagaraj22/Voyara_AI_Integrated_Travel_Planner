import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import LandingView from "./components/LandingView";
import HomeFeedView from "./components/HomeFeedView";
import TripsView from "./components/TripsView";
import AIPlannerView from "./components/AIPlannerView";
import ProfileView from "./components/ProfileView";
import AuthView from "./components/AuthView";
import { Loader2, AlertCircle, CheckCircle2, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const JSON_HEADERS = { "Content-Type": "application/json" };
const CRED = { credentials: "include" };

async function apiFetch(url, options = {}) {
  const response = await fetch(url, { ...CRED, ...options });
  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }
  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed with status ${response.status}.`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("landing");
  const [posts, setPosts] = useState([]);
  const [trips, setTrips] = useState([]);
  const [requests, setRequests] = useState([]);
  const [toasts, setToasts] = useState([]);

  const [isAppLoading, setIsAppLoading] = useState(true);
  const [appError, setAppError] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState(undefined);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      const data = await apiFetch("/api/requests");
      setRequests(data || []);
    } catch (err) {
      if (err.status !== 401) {
        console.warn("Failed to load requests:", err.message);
      }
    }
  }, []);

  const loadFeed = useCallback(async () => {
    try {
      const [postsData, tripsData] = await Promise.all([
        apiFetch("/api/posts"),
        apiFetch("/api/trips"),
      ]);
      setPosts(postsData || []);
      setTrips(tripsData || []);
    } catch (err) {
      setAppError(err.message);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsAppLoading(true);
      setAppError(null);

      try {
        await loadFeed();
        try {
          const me = await apiFetch("/api/auth/me");
          if (!cancelled && me) {
            setCurrentUser(me);
            setActiveTab("feed");
            await loadRequests();
          }
        } catch (err) {
          if (err.status !== 401) {
            console.warn("Session check failed:", err.message);
          }
        }
      } finally {
        if (!cancelled) setIsAppLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadFeed, loadRequests]);

  const handleLogin = async (email, password) => {
    setAppError(null);
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ email, password }),
    });
    setCurrentUser(data.user);
    setActiveTab("feed");
    showToast(`Welcome back, ${data.user.username}.`, "success");
    await Promise.all([loadFeed(), loadRequests()]);
  };

  const handleRegister = async (userData) => {
    setAppError(null);
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(userData),
    });
    setCurrentUser(data.user);
    setActiveTab("feed");
    setRequests([]);
    showToast(`Welcome to Voyara, ${data.user.username}.`, "success");
    await loadFeed();
  };

  const handleGoogleSignIn = async (credential) => {
    setAppError(null);
    const data = await apiFetch("/api/auth/google", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ credential }),
    });
    setCurrentUser(data.user);
    setActiveTab("feed");
    showToast(`Signed in as ${data.user.username}.`, "success");
    await Promise.all([loadFeed(), loadRequests()]);
  };

  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Logout request failed:", err.message);
    }
    setCurrentUser(null);
    setRequests([]);
    setActiveTab("landing");
    showToast("Signed out.", "info");
  };

  const handleUpdateProfile = async (bio, location, avatarUrl, username) => {
    try {
      const data = await apiFetch("/api/auth/profile/update", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ bio, location, avatarUrl, username }),
      });
      setCurrentUser(data);
      showToast("Profile updated.", "success");
    } catch (err) {
      showToast(err.message, "error");
      throw err;
    }
  };

  const handleLikePost = async (postId) => {
    if (!currentUser) {
      setActiveTab("auth");
      return;
    }
    try {
      const data = await apiFetch(`/api/posts/${postId}/like`, { method: "POST" });
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: data.likes } : p))
      );
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      const data = await apiFetch("/api/posts", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(postData),
      });
      setPosts((prev) => [data, ...prev]);
      showToast("Post published.", "success");
    } catch (err) {
      showToast(err.message, "error");
      throw err;
    }
  };

  const handleCreateTrip = async (tripData) => {
    try {
      const data = await apiFetch("/api/trips", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(tripData),
      });
      setTrips((prev) => [data, ...prev]);
      showToast(`Trip "${data.title}" created.`, "success");
    } catch (err) {
      showToast(err.message, "error");
      throw err;
    }
  };

  const handleSendJoinRequest = async (tripId, message) => {
    try {
      await apiFetch(`/api/trips/${tripId}/join`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ message }),
      });
      await loadRequests();
      showToast("Request sent to host.", "success");
    } catch (err) {
      showToast(err.message, "error");
      throw err;
    }
  };

  const handleRespondToRequest = async (requestId, status) => {
    try {
      await apiFetch(`/api/requests/${requestId}/respond`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ status }),
      });
      await Promise.all([loadRequests(), loadFeed()]);
      showToast(`Request ${status}.`, status === "accepted" ? "success" : "info");
    } catch (err) {
      showToast(err.message, "error");
      throw err;
    }
  };

  const handleSearchTrips = async (query, destination) => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (destination) params.set("destination", destination);
    const qs = params.toString();
    try {
      const data = await apiFetch(`/api/trips${qs ? `?${qs}` : ""}`);
      setTrips(data || []);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleGenerateItinerary = async (params) => {
    return apiFetch("/api/gemini/itinerary", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(params),
    });
  };

  const handleViewTripHeader = (tripId) => {
    setSelectedTripId(tripId);
    setActiveTab("trips");
    setTimeout(() => setSelectedTripId(undefined), 200);
  };

  if (isAppLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="h-10 w-10 text-purple-400 animate-spin" />
        <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">
          Loading...
        </p>
      </div>
    );
  }

  const isSidebarVisible =
    currentUser && activeTab !== "landing" && activeTab !== "auth";

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 font-sans text-slate-100">
      <div
        className={`flex flex-col ${
          isSidebarVisible ? "md:flex-row min-h-screen" : "min-h-screen"
        }`}
      >
        <Navbar
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          pendingRequestsCount={
            requests.filter((r) => r.role === "host" && r.status === "pending").length
          }
        />

        <div
          className={`flex-1 flex flex-col min-h-screen ${
            isSidebarVisible
              ? "md:pl-64 pt-14 md:pt-0 pb-16 md:pb-0"
              : "max-w-6xl w-full mx-auto px-4 mt-4"
          }`}
        >
          <main className="flex-grow">
            {appError && (
              <div className="max-w-7xl mx-auto px-4 pt-6">
                <div className="p-4 rounded-xl bg-rose-950/20 text-rose-300 border border-rose-900/30 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{appError}</span>
                </div>
              </div>
            )}

            {activeTab === "landing" && (
              <LandingView
                onJoin={() => setActiveTab("auth")}
                onExploreTrips={() => {
                  if (currentUser) {
                    setActiveTab("trips");
                  } else {
                    setActiveTab("auth");
                  }
                }}
                isAuthenticated={!!currentUser}
              />
            )}

            {activeTab === "feed" && currentUser && (
              <HomeFeedView
                posts={posts}
                trendingTrips={trips}
                currentUser={currentUser}
                onLikePost={handleLikePost}
                onCreatePost={handleCreatePost}
                onViewTrip={handleViewTripHeader}
                onNavigateToPlanner={() => setActiveTab("planner")}
              />
            )}

            {activeTab === "trips" && currentUser && (
              <TripsView
                trips={trips}
                currentUser={currentUser}
                onSearchTrips={handleSearchTrips}
                onCreateTrip={handleCreateTrip}
                onSendJoinRequest={handleSendJoinRequest}
                selectedTripId={selectedTripId}
              />
            )}

            {activeTab === "planner" && (
              <AIPlannerView
                onGenerateItinerary={handleGenerateItinerary}
                onCreateTrip={handleCreateTrip}
                showToast={showToast}
              />
            )}

            {activeTab === "profile" && currentUser && (
              <ProfileView
                currentUser={currentUser}
                onUpdateProfile={handleUpdateProfile}
                posts={posts}
                trips={trips}
                requests={requests}
                onRespondToRequest={handleRespondToRequest}
                onViewTrip={handleViewTripHeader}
              />
            )}

            {activeTab === "auth" && !currentUser && (
              <AuthView
                onLogin={handleLogin}
                onRegister={handleRegister}
                onGoogleSignIn={handleGoogleSignIn}
                showToast={showToast}
              />
            )}
          </main>

          <footer className="py-6 border-t border-slate-900/80 bg-slate-950 text-center text-xs text-slate-600 font-mono">
            <p>© 2026 Voyara. All rights reserved.</p>
          </footer>
        </div>
      </div>

      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              layout
              className={`p-4 rounded-2xl border flex items-start gap-3 pointer-events-auto shadow-2xl backdrop-blur-xl transition-all ${
                toast.type === "success"
                  ? "bg-[#091e14]/95 border-emerald-500/30 text-emerald-100 shadow-[#030a07]"
                  : toast.type === "error"
                  ? "bg-[#250d0d]/95 border-rose-500/30 text-rose-100 shadow-[#160404]"
                  : "bg-[#0c1220]/95 border-indigo-500/30 text-indigo-100 shadow-[#05070c]"
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {toast.type === "success" && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                )}
                {toast.type === "error" && (
                  <AlertCircle className="h-5 w-5 text-rose-400" />
                )}
                {toast.type === "info" && (
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                )}
              </span>

              <div className="flex-1 text-xs font-semibold leading-relaxed">
                {toast.message}
              </div>

              <button
                onClick={() =>
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                }
                className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

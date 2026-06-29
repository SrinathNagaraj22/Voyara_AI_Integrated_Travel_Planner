import React, { useEffect, useRef, useState } from "react";
import {
  LogIn,
  UserPlus,
  AlertCircle,
  Image as ImageIcon,
  MapPin,
  AlignLeft,
  KeyRound,
  Mail,
  User,
} from "lucide-react";
import BrandMark from "./BrandMark";

const GSI_SRC = "https://accounts.google.com/gsi/client";

function loadGsiScript() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (window.__voyaraGsiPromise) return window.__voyaraGsiPromise;
  window.__voyaraGsiPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google));
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(window.google);
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return window.__voyaraGsiPromise;
}

export default function AuthView({ onLogin, onRegister, onGoogleSignIn }) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(null);
  const googleButtonRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Fetch auth config once to learn whether Google sign-in is enabled and which client id to use.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/config", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.googleEnabled && data.googleClientId) {
          setGoogleClientId(data.googleClientId);
        }
      } catch {
        // Google sign-in is optional; ignore failures.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Once we have a client id, load GSI and render the official button.
  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        const google = await loadGsiScript();
        if (cancelled || !google?.accounts?.id || !googleButtonRef.current) return;

        google.accounts.id.initialize({
          client_id: googleClientId,
          ux_mode: "popup",
          auto_select: false,
          callback: async (response) => {
            if (!response?.credential) return;
            setErrorMsg(null);
            setIsLoading(true);
            try {
              await onGoogleSignIn(response.credential);
            } catch (err) {
              setErrorMsg(err?.message || "Google sign-in failed.");
            } finally {
              setIsLoading(false);
            }
          },
        });

        googleButtonRef.current.innerHTML = "";
        google.accounts.id.renderButton(googleButtonRef.current, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text: isLoginTab ? "signin_with" : "signup_with",
          logo_alignment: "left",
          width: 320,
        });
      } catch (err) {
        console.warn("Failed to load Google Identity Services:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [googleClientId, isLoginTab, onGoogleSignIn]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (isLoginTab) {
        if (!email || !password) {
          setErrorMsg("Please enter your email and password.");
          setIsLoading(false);
          return;
        }
        await onLogin(email, password);
      } else {
        if (!username || !email || !password) {
          setErrorMsg("Username, email, and password are required.");
          setIsLoading(false);
          return;
        }
        await onRegister({
          username,
          email,
          password,
          bio,
          location,
          avatarUrl:
            avatarUrl ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        });
      }
    } catch (err) {
      setErrorMsg(err?.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-xl bg-slate-900/40 border border-slate-800/80 rounded-[2rem] p-6 sm:p-10 relative backdrop-blur-xl shadow-2xl shadow-black/80">
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <BrandMark size="lg" withWordmark={false} />
          <h2 className="text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            {isLoginTab ? "Welcome to Voyara" : "Create your Voyara account"}
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {isLoginTab
              ? "Sign in to plan trips, share posts, and connect with travel buddies."
              : "Register an account to start organizing shared trips and a travel feed."}
          </p>
        </div>

        <div className="grid grid-cols-2 bg-slate-950/60 p-1 rounded-2xl border border-slate-800/60 mb-6">
          <button
            type="button"
            className={`py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex justify-center items-center gap-2 ${
              isLoginTab
                ? "bg-slate-800 text-white shadow-md border border-slate-700/50"
                : "text-slate-450 hover:text-slate-200"
            }`}
            onClick={() => {
              setIsLoginTab(true);
              setErrorMsg(null);
            }}
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign in</span>
          </button>
          <button
            type="button"
            className={`py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex justify-center items-center gap-2 ${
              !isLoginTab
                ? "bg-slate-800 text-white shadow-md border border-slate-700/50"
                : "text-slate-450 hover:text-slate-200"
            }`}
            onClick={() => {
              setIsLoginTab(false);
              setErrorMsg(null);
            }}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Register</span>
          </button>
        </div>

        {googleClientId && (
          <div className="mb-6 space-y-3">
            <div className="flex justify-center" ref={googleButtonRef} />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-800/70" />
              </div>
              <span className="relative flex justify-center text-[10px] font-mono text-slate-500 tracking-wider uppercase">
                <span className="px-3 bg-slate-900/40">or use email</span>
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-6">
          {isLoginTab ? (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono tracking-wider text-slate-400 font-bold block mb-1.5 uppercase">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    id="auth-input-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/65 border border-slate-800/80 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder-slate-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono tracking-wider text-slate-400 font-bold block mb-1.5 uppercase">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    id="auth-input-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/65 border border-slate-800/80 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder-slate-600 transition"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 font-bold block mb-1.5 uppercase">
                    Username *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      id="register-input-username"
                      type="text"
                      required
                      autoComplete="username"
                      placeholder="e.g. srinath_travels"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-950/65 border border-slate-800/80 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white focus:border-indigo-500/50 focus:outline-none transition placeholder-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 font-bold block mb-1.5 uppercase">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      id="register-input-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="traveler@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950/65 border border-slate-800/80 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white focus:border-indigo-500/50 focus:outline-none transition placeholder-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 font-bold block mb-1.5 uppercase">
                    Base location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      id="register-input-location"
                      type="text"
                      placeholder="e.g. Bangalore, India"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-slate-950/65 border border-slate-800/80 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white focus:border-indigo-500/50 focus:outline-none transition placeholder-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 font-bold block mb-1.5 uppercase">
                    Password * (min 8 chars)
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      id="register-input-password"
                      type="password"
                      required
                      autoComplete="new-password"
                      minLength={8}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950/65 border border-slate-800/80 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white focus:border-indigo-500/50 focus:outline-none transition placeholder-slate-600"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 font-bold block mb-1.5 uppercase">
                    Avatar image URL
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      id="register-input-avatar"
                      type="url"
                      placeholder="https://... (optional)"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full bg-slate-950/65 border border-slate-800/80 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white focus:border-indigo-500/50 focus:outline-none transition placeholder-slate-600"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 font-bold block mb-1.5 uppercase">
                    Short bio
                  </label>
                  <div className="relative">
                    <AlignLeft className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      id="register-input-bio"
                      type="text"
                      placeholder="What landscapes feed your soul?"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-slate-950/65 border border-slate-800/80 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white focus:border-indigo-500/50 focus:outline-none transition placeholder-slate-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-950/30 text-rose-300 border border-rose-900/40 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            id="btn-auth-submit"
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-indigo-950/40 hover:shadow-indigo-900/50 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading
              ? isLoginTab
                ? "Signing in..."
                : "Creating account..."
              : isLoginTab
              ? "Sign in"
              : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}

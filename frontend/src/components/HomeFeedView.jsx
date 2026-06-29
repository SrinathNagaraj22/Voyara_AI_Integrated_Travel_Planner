import React, { useState } from "react";
import {
  Heart,
  MapPin,
  Sparkles,
  Eye,
  MessageCircle,
  Bookmark,
  SendHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function HomeFeedView({
  posts,
  trendingTrips,
  currentUser,
  onLikePost,
  onCreatePost,
  onViewTrip,
  onNavigateToPlanner,
}) {
  // Post Creator
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState(null);

  // Per-post UI state (local-only, no backend persistence yet)
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [postComments, setPostComments] = useState({});

  const handlePublishPost = async (e) => {
    e.preventDefault();
    if (!caption) {
      setPublishMessage("Please provide a caption describing your adventure.");
      return;
    }
    if (!imageUrl) {
      setPublishMessage("Please provide an image URL for the post.");
      return;
    }

    setIsPublishing(true);
    setPublishMessage(null);
    try {
      await onCreatePost({
        caption,
        location: location || "Earth",
        image: imageUrl,
      });
      setCaption("");
      setLocation("");
      setImageUrl("");
      setPublishMessage("Post published.");
      setTimeout(() => setPublishMessage(null), 3000);
    } catch (err) {
      setPublishMessage(err?.message || "Failed to publish post.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAddComment = (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    setPostComments((prev) => ({
      ...prev,
      [postId]: [
        ...(prev[postId] || []),
        { username: currentUser.username, text: text.trim() },
      ],
    }));
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  const toggleBookmark = (postId) => {
    setBookmarkedPostIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 text-left relative">
      {/* LEFT / CENTER COLUMN */}
      <div className="lg:col-span-8 space-y-6">
        {/* PUBLISH POST */}
        <div className="bg-[#0b0c14] border border-white/10 rounded-[1.5rem] p-5.5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-2xl" />

          <div className="flex gap-3.5 items-start mb-4.5">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.username}
              referrerPolicy="no-referrer"
              className="h-9.5 w-9.5 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
            />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-100 font-sans tracking-tight">
                Post a Voyage Snapshot
              </h3>
              <p className="text-xs text-slate-500">
                Share fresh coordinates with the community.
              </p>
            </div>
          </div>

          <form onSubmit={handlePublishPost} className="space-y-4">
            <textarea
              id="input-post-caption"
              rows={2}
              placeholder="What made this voyage magical?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full glass-input text-sm resize-none focus:ring-indigo-505 bg-[#050508]/80 text-white rounded-xl py-3"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono tracking-wider text-slate-500 font-bold block mb-1 uppercase">
                  Trip coordinates
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-indigo-400" />
                  <input
                    id="input-post-location"
                    type="text"
                    placeholder="e.g. Kyoto, Japan"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full glass-input pl-10 text-xs py-3.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono tracking-wider text-slate-500 font-bold block mb-1 uppercase">
                  Image URL
                </label>
                <input
                  id="input-post-image-url"
                  type="url"
                  placeholder="https://… (paste an image link)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full glass-input text-xs py-3.5"
                />
              </div>
            </div>

            {publishMessage && (
              <div
                id="publish-alert"
                className={`p-3 rounded-xl text-xs font-medium text-left ${
                  publishMessage.toLowerCase().includes("published")
                    ? "bg-emerald-950/40 text-emerald-300 border border-emerald-900/40"
                    : "bg-rose-950/40 text-rose-300 border border-rose-900/40"
                }`}
              >
                {publishMessage}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                id="btn-publish-post"
                type="submit"
                disabled={isPublishing}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPublishing ? (
                  <span>Publishing...</span>
                ) : (
                  <>
                    <SendHorizontal className="h-3.5 w-3.5" />
                    <span>Post</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* FEED */}
        <div id="posts-feed-container" className="space-y-6">
          <AnimatePresence>
            {posts.length === 0 ? (
              <div className="bg-[#0b0c14] border border-white/10 rounded-[2rem] p-12 text-center text-slate-500 italic shadow-xl">
                No posts yet. Be the first to share your journey above.
              </div>
            ) : (
              posts.map((post) => {
                const isLiked = post.likes.includes(currentUser.username);
                const isBookmarked = bookmarkedPostIds.includes(post.id);
                const comments = postComments[post.id] || [];

                return (
                  <motion.article
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#0b0c14] border border-white/10 rounded-[1.5rem] overflow-hidden shadow-2xl transition-all duration-300"
                  >
                    <div className="p-4 flex items-center justify-between border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.author.avatarUrl}
                          alt={post.author.username}
                          referrerPolicy="no-referrer"
                          className="h-8.5 w-8.5 rounded-full object-cover ring-2 ring-indigo-500/15"
                        />
                        <div>
                          <span className="text-xs font-bold text-white hover:underline cursor-pointer">
                            @{post.author.username}
                          </span>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium mt-0.5">
                            <MapPin className="h-2.5 w-2.5 text-indigo-400 shrink-0" />
                            <span>{post.location}</span>
                            <span>•</span>
                            <span>
                              {new Date(post.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="relative aspect-[4/3] bg-black overflow-hidden group">
                      <img
                        src={post.image}
                        alt={post.caption || "Voyage snapshot"}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500 select-none pointer-events-none"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-[10px] text-indigo-300 font-bold border border-white/15 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-indigo-405" />
                        <span>{post.location}</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => onLikePost(post.id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer group"
                            title="Like"
                          >
                            <Heart
                              className={`h-6 w-6 transition-transform group-active:scale-125 duration-150 ${
                                isLiked ? "text-rose-500 fill-rose-500" : "text-slate-200"
                              }`}
                            />
                          </button>

                          <button
                            onClick={() => {
                              const input = document.getElementById(`comment-field-${post.id}`);
                              if (input) input.focus();
                            }}
                            className="text-slate-200 hover:text-indigo-400 transition-colors cursor-pointer"
                            title="Comment"
                          >
                            <MessageCircle className="h-6 w-6" />
                          </button>
                        </div>

                        <button
                          onClick={() => toggleBookmark(post.id)}
                          className="text-slate-200 hover:text-yellow-400 transition-colors cursor-pointer"
                          title="Bookmark"
                        >
                          <Bookmark
                            className={`h-6 w-6 ${
                              isBookmarked ? "text-yellow-400 fill-yellow-400" : ""
                            }`}
                          />
                        </button>
                      </div>

                      <p className="text-xs font-bold text-white">
                        {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
                      </p>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        <span className="font-bold text-white mr-1.5">@{post.author.username}</span>
                        {post.caption}
                      </p>

                      {comments.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-white/5">
                          {comments.map((c, i) => (
                            <p key={i} className="text-[11px] leading-relaxed">
                              <span className="font-bold text-slate-200 mr-1.5">@{c.username}</span>
                              <span className="text-slate-400">{c.text}</span>
                            </p>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 flex gap-2">
                        <input
                          id={`comment-field-${post.id}`}
                          type="text"
                          placeholder="Add a comment..."
                          value={commentInputs[post.id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddComment(post.id);
                          }}
                          className="flex-1 bg-[#050508]/60 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500/40 transition"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-[10px] font-bold text-white cursor-pointer"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="lg:col-span-4 space-y-6">
        {/* Current user recap */}
        <div className="bg-[#0b0c14] border border-white/10 rounded-[1.5rem] p-5 shadow-xl relative overflow-hidden flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.username}
              referrerPolicy="no-referrer"
              className="h-11 w-11 rounded-full object-cover ring-2 ring-indigo-500/20"
            />
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                <span>@{currentUser.username}</span>
                <span className="text-[8px] font-mono bg-indigo-500/20 text-indigo-400 px-1.5 rounded uppercase font-bold">
                  You
                </span>
              </h3>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider">
                {currentUser.location || "Earth wanderer"}
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono text-indigo-405 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase font-black">
            Explorer
          </span>
        </div>

        {/* AI Planner callout */}
        <div className="bg-gradient-to-b from-[#100d23] to-[#0b0c14] border border-indigo-500/20 rounded-[1.5rem] p-5.5 text-left shadow-xl">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30 text-indigo-400 mb-3.5">
            <Sparkles className="h-4 w-4 text-indigo-402" />
          </div>
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5 text-left">
            <span>Tailored Routing Core</span>
            <span className="text-[9px] font-mono bg-indigo-505 text-indigo-300 px-1.5 py-0.2 rounded font-black border border-indigo-500/20">
              Gemini
            </span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Generate multi-day plans with itemized budgets and travel-mode suggestions, then save them as group trips.
          </p>
          <button
            id="feed-badge-ai-trigger"
            onClick={onNavigateToPlanner}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/15 transition-all cursor-pointer"
          >
            Launch AI Planner
          </button>
        </div>

        {/* Trending trips */}
        <div className="bg-[#0b0c14] border border-white/10 rounded-[1.5rem] p-5.5 text-left space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <h3 className="text-xs font-mono font-extrabold text-slate-400 uppercase tracking-wider">
              Hot Group Escapes
            </h3>
            {trendingTrips.length > 0 && (
              <span
                className="text-[9px] text-indigo-400 font-bold hover:underline cursor-pointer"
                onClick={() => onViewTrip("all")}
              >
                View all
              </span>
            )}
          </div>

          {trendingTrips.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic">No active trips yet.</p>
          ) : (
            <div className="space-y-3">
              {trendingTrips.slice(0, 4).map((trip) => {
                const seatsLeft = (trip.totalSeats || 0) - (trip.occupiedSeats || 0);
                return (
                  <div
                    key={trip.id}
                    className="p-3 bg-[#050508]/60 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                          {trip.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {trip.destination}
                        </p>
                      </div>
                      <span className="text-[9px] font-mono bg-[#0c1912] text-emerald-400 px-1 py-0.5 rounded font-black">
                        {trip.budget}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>
                        Seats left:{" "}
                        <strong className="text-indigo-400">
                          {seatsLeft}/{trip.totalSeats}
                        </strong>
                      </span>
                      <button
                        onClick={() => onViewTrip(trip.id)}
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <span>Inspect</span>
                        <Eye className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

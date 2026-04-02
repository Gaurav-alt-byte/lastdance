import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  ListPlus,
  Loader2,
  MessageSquare,
  Pencil,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import apiClient from "../api/axios.js";
import AddToPlaylistModal from "../components/AddToPlaylistModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../utils/helpers.js";

const formatDuration = (duration = 0) => {
  const totalSeconds = Number(duration) || 0;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
};

const getMatchingIds = (entries = [], key) =>
  entries
    .map((entry) => {
      const value = entry?.[key] ?? entry?._id ?? entry;
      if (!value) return "";
      if (typeof value === "object") {
        return String(value._id || "");
      }
      return String(value);
    })
    .filter(Boolean);

const fetchReactionSummary = async (contentId, type, currentUserId) => {
  try {
    const [likesResponse, dislikesResponse] = await Promise.all([
      apiClient.post(`/likes/likes-count/${contentId}`, { type }),
      apiClient.post(`/dislikes/Dislikes-count/${contentId}`, { type }),
    ]);

    const likedIds = getMatchingIds(likesResponse.data?.user_ids, "liked_by");
    const dislikedIds = getMatchingIds(dislikesResponse.data?.user_ids, "disliked_by");
    const userId = currentUserId ? String(currentUserId) : "";

    return {
      likes: likesResponse.data?.likes_count ?? likedIds.length,
      dislikes: dislikesResponse.data?.dislikes_count ?? dislikedIds.length,
      isLiked: userId ? likedIds.includes(userId) : false,
      isDisliked: userId ? dislikedIds.includes(userId) : false,
    };
  } catch {
    return {
      likes: 0,
      dislikes: 0,
      isLiked: false,
      isDisliked: false,
    };
  }
};

const formatRelativeDate = (value) => {
  if (!value) return "Recently";

  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return "Recently";
  }
};

const VideoPlayer = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?._id ? String(user._id) : "";

  const [video, setVideo] = useState(null);
  const [stats, setStats] = useState({ likes: 0, dislikes: 0, isLiked: false, isDisliked: false });
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [channelId, setChannelId] = useState(null);
  const [pageError, setPageError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [editingCommentId, setEditingCommentId] = useState("");
  const [editingCommentText, setEditingCommentText] = useState("");
  const [processingCommentId, setProcessingCommentId] = useState("");
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const fetchInteractionStats = useCallback(async () => {
    const reactionSummary = await fetchReactionSummary(videoId, "Video", currentUserId);
    setStats(reactionSummary);
  }, [videoId, currentUserId]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await apiClient.get(`/videos/video/${videoId}/comments`);
      const list = Array.isArray(response.data) ? response.data : [];

      const enrichedComments = await Promise.all(
        list.map(async (comment) => ({
          ...comment,
          author: comment.author || comment.owner || {},
          ...(await fetchReactionSummary(comment._id, "Comment_Model", currentUserId)),
        })),
      );

      setComments(enrichedComments);
      setCommentError("");
    } catch (error) {
      setComments([]);
      setCommentError(getErrorMessage(error));
    }
  }, [videoId, currentUserId]);

  const fetchSuggestions = useCallback(async () => {
    try {
      const response = await apiClient.get("/videos/watch-Videos?limit=8");
      const list = Array.isArray(response.data) ? response.data : [];
      setSuggestions(list.filter((item) => item._id !== videoId));
    } catch {
      setSuggestions([]);
    }
  }, [videoId]);

  useEffect(() => {
    const loadVideo = async () => {
      setLoading(true);
      setPageError("");

      try {
        const response = await apiClient.get(`/videos/watch/${videoId}`);
        setVideo(response.data);

        const creatorId = response.data?.ownerDetails?._id || response.data?.owner?._id || null;
        setChannelId(creatorId);

        if (response.data?.ownerDetails?.username && user) {
          try {
            const channelResponse = await apiClient.get(`/users/channel/${response.data.ownerDetails.username}`);
            setSubscribed(Boolean(channelResponse.data?.isSubscribed));
          } catch {
            setSubscribed(false);
          }
        } else {
          setSubscribed(false);
        }

        await Promise.all([fetchInteractionStats(), fetchComments(), fetchSuggestions()]);
      } catch (error) {
        setVideo(null);
        setPageError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      loadVideo();
      window.scrollTo(0, 0);
    }
  }, [videoId, user, fetchComments, fetchInteractionStats, fetchSuggestions]);

  const creator = video?.ownerDetails || video?.owner || {};
  const isOwner = Boolean(user && creator._id && String(user._id) === String(creator._id));

  const requireAuth = () => {
    if (user) return true;
    navigate("/login");
    return false;
  };

  const handleVideoReaction = async (endpoint) => {
    if (!requireAuth()) return;

    try {
      await apiClient.post(endpoint, { type: "Video" });
      await fetchInteractionStats();
    } catch (error) {
      setPageError(getErrorMessage(error));
    }
  };

  const handleCommentReaction = async (commentId, endpoint) => {
    if (!requireAuth()) return;

    setProcessingCommentId(commentId);
    try {
      await apiClient.post(endpoint, { type: "Comment_Model" });
      await fetchComments();
    } catch (error) {
      setCommentError(getErrorMessage(error));
    } finally {
      setProcessingCommentId("");
    }
  };

  const handleSubscribe = async () => {
    if (!requireAuth()) return;

    const targetChannelId = channelId || creator?._id;
    if (!targetChannelId) return;

    try {
      if (subscribed) {
        await apiClient.patch(`/Subscriptions/unsubscribe/${targetChannelId}`);
        setSubscribed(false);
        return;
      }

      await apiClient.post(`/Subscriptions/subscribe/${targetChannelId}`);
      setSubscribed(true);
    } catch (error) {
      setPageError(getErrorMessage(error));
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const content = commentText.trim();
    if (!content) return;
    if (!requireAuth()) return;

    setSubmittingComment(true);
    try {
      await apiClient.post(`/Comments/create-comment/${videoId}`, {
        type: "Video",
        main_content: content,
      });
      setCommentText("");
      await fetchComments();
    } catch (error) {
      setCommentError(getErrorMessage(error));
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStartCommentEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditingCommentText(comment.content || "");
    setCommentError("");
  };

  const handleCancelCommentEdit = () => {
    setEditingCommentId("");
    setEditingCommentText("");
  };

  const handleSaveCommentEdit = async (commentId) => {
    if (!editingCommentText.trim()) return;

    setProcessingCommentId(commentId);
    try {
      await apiClient.patch(`/Comments/edit-comment/${commentId}`, {
        type: "Video",
        new_content: editingCommentText.trim(),
      });
      handleCancelCommentEdit();
      await fetchComments();
    } catch (error) {
      setCommentError(getErrorMessage(error));
    } finally {
      setProcessingCommentId("");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    setProcessingCommentId(commentId);
    try {
      await apiClient.post(`/Comments/delete/${commentId}`);
      if (editingCommentId === commentId) {
        handleCancelCommentEdit();
      }
      await fetchComments();
    } catch (error) {
      setCommentError(getErrorMessage(error));
    } finally {
      setProcessingCommentId("");
    }
  };

  const handleShare = async () => {
    const currentUrl = window.location.href;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentUrl);
        setShareCopied(true);
        window.setTimeout(() => setShareCopied(false), 2000);
        return;
      }
    } catch {
      // fall through to prompt fallback
    }

    window.prompt("Copy this link", currentUrl);
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#0f0f0f]">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#0f0f0f] px-4 text-center text-white">
        {pageError || "Video not found."}
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 lg:px-10">
        <div className="mx-auto grid max-w-[1700px] grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {pageError ? (
              <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {pageError}
              </div>
            ) : null}

            <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-black shadow-soft">
              <video src={video.video_file} controls autoPlay className="aspect-video w-full object-contain" />
            </div>

            <h1 className="mt-5 text-2xl font-extrabold leading-tight text-white">{video.tittle}</h1>

            <div className="mt-4 flex flex-col gap-4 border-b border-zinc-800 pb-5 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <Link to={`/channel/${creator.username || user?.username || ""}`} className="flex items-center gap-4">
                  <img
                    src={creator.avatar || "https://via.placeholder.com/200"}
                    alt={creator.username || "channel"}
                    className="h-12 w-12 rounded-full border border-zinc-700 object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-bold text-white">{creator.username || "Unknown channel"}</h2>
                    <p className="text-xs text-zinc-500">Channel creator</p>
                  </div>
                </Link>

                {!isOwner && (channelId || creator._id) ? (
                  <button
                    type="button"
                    onClick={handleSubscribe}
                    className={`rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                      subscribed ? "bg-white text-black hover:bg-zinc-200" : "bg-red-600 text-white hover:bg-red-500"
                    }`}
                  >
                    {subscribed ? "Subscribed" : "Subscribe"}
                  </button>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-full border border-zinc-700/60 bg-zinc-800/60">
                  <button
                    type="button"
                    onClick={() => handleVideoReaction(`/likes/toggle/${videoId}`)}
                    className={`flex items-center gap-2 border-r border-zinc-700/60 px-5 py-2.5 text-sm font-semibold transition hover:bg-zinc-700 ${
                      stats.isLiked ? "text-blue-400" : "text-white"
                    }`}
                  >
                    <ThumbsUp size={18} />
                    {stats.likes}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVideoReaction(`/dislikes/toggle/${videoId}`)}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition hover:bg-zinc-700 ${
                      stats.isDisliked ? "text-red-400" : "text-white"
                    }`}
                  >
                    <ThumbsDown size={18} />
                    {stats.dislikes}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-800/60 px-5 py-2.5 text-sm font-semibold transition hover:bg-zinc-700"
                >
                  <Share2 size={18} />
                  {shareCopied ? "Copied" : "Share"}
                </button>

                {user ? (
                  <button
                    type="button"
                    onClick={() => setPlaylistModalOpen(true)}
                    className="flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-800/60 px-5 py-2.5 text-sm font-semibold transition hover:bg-zinc-700"
                  >
                    <ListPlus size={18} />
                    Save
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-zinc-800/60 bg-zinc-900/60 p-5 transition hover:bg-zinc-900/90">
              <p className="text-sm font-semibold text-white">
                {video.views || 0} views
                {video.createdAt ? ` • ${formatRelativeDate(video.createdAt)}` : ""}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                {video.description || "No description provided."}
              </p>
            </div>

            <div className="mt-10">
              <div className="mb-6 flex items-center gap-3">
                <MessageSquare className="text-zinc-500" />
                <h2 className="text-xl font-bold text-white">{comments.length} Comments</h2>
              </div>

              {commentError ? (
                <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {commentError}
                </div>
              ) : null}

              <form onSubmit={handleCommentSubmit} className="mb-10 flex gap-4">
                <img
                  src={user?.avatar || "https://via.placeholder.com/200"}
                  alt="your avatar"
                  className="h-10 w-10 rounded-full border border-zinc-700 object-cover"
                />
                <div className="flex-1 border-b border-zinc-800 transition focus-within:border-white">
                  <input
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder={user ? "Add a comment..." : "Sign in to comment"}
                    disabled={!user}
                    className="w-full bg-transparent py-2 text-sm text-white outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!user || !commentText.trim() || submittingComment}
                  className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
                >
                  {submittingComment ? "Posting..." : "Comment"}
                </button>
              </form>

              <div className="space-y-7">
                {comments.map((comment) => {
                  const author = comment.author || {};
                  const isCommentOwner = currentUserId && String(author._id || comment.owner) === currentUserId;
                  const isEditing = editingCommentId === comment._id;
                  const isProcessing = processingCommentId === comment._id;

                  return (
                    <div key={comment._id} className="flex gap-4 rounded-3xl border border-white/5 bg-white/[0.03] p-4">
                      <Link to={`/channel/${author.username || ""}`} className="shrink-0">
                        <img
                          src={author.avatar || "https://via.placeholder.com/200"}
                          alt={author.username || "comment author"}
                          className="h-10 w-10 rounded-full border border-zinc-800 object-cover"
                        />
                      </Link>
                      <div className="flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <Link to={`/channel/${author.username || ""}`} className="text-xs font-bold text-zinc-100 hover:text-blue-400">
                            @{author.username || "user"}
                          </Link>
                          <span className="text-[10px] text-zinc-500">
                            {formatRelativeDate(comment.createdAt || comment.created_At || comment.updatedAt || comment.updated_At)}
                          </span>
                        </div>

                        {isEditing ? (
                          <div className="space-y-3">
                            <textarea
                              value={editingCommentText}
                              onChange={(event) => setEditingCommentText(event.target.value)}
                              rows={3}
                              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
                            />
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveCommentEdit(comment._id)}
                                disabled={!editingCommentText.trim() || isProcessing}
                                className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-700"
                              >
                                Save changes
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelCommentEdit}
                                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/5"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-zinc-300">{comment.content}</p>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                          <button
                            type="button"
                            onClick={() => handleCommentReaction(comment._id, `/likes/toggle/${comment._id}`)}
                            disabled={isProcessing}
                            className={`flex items-center gap-1 transition hover:text-blue-400 ${
                              comment.isLiked ? "text-blue-400" : "text-zinc-400"
                            } disabled:cursor-not-allowed`}
                          >
                            <ThumbsUp size={14} />
                            {comment.likes || 0}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCommentReaction(comment._id, `/dislikes/toggle/${comment._id}`)}
                            disabled={isProcessing}
                            className={`flex items-center gap-1 transition hover:text-red-400 ${
                              comment.isDisliked ? "text-red-400" : "text-zinc-400"
                            } disabled:cursor-not-allowed`}
                          >
                            <ThumbsDown size={14} />
                            {comment.dislikes || 0}
                          </button>

                          {isCommentOwner ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartCommentEdit(comment)}
                                className="flex items-center gap-1 transition hover:text-white"
                              >
                                <Pencil size={14} />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(comment._id)}
                                disabled={isProcessing}
                                className="flex items-center gap-1 transition hover:text-red-400 disabled:cursor-not-allowed"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {!comments.length && !commentError ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-zinc-400">
                    No comments yet. Start the conversation.
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Recommended videos</h3>
            <div className="space-y-4">
              {suggestions.map((item) => (
                <Link to={`/video/${item._id}`} key={item._id} className="group flex gap-3">
                  <div className="relative aspect-video w-44 flex-shrink-0 overflow-hidden rounded-2xl bg-black">
                    <img
                      src={item.thumbnail}
                      alt={item.tittle}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {formatDuration(item.duration)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-100 transition group-hover:text-blue-400">
                      {item.tittle}
                    </h4>
                    <p className="mt-1 text-xs text-zinc-400">{item.ownerDetails?.username || item.owner?.username || "Channel"}</p>
                    <div className="mt-1 flex items-center text-xs text-zinc-500">
                      <span>{item.views || 0} views</span>
                      {item.createdAt ? (
                        <>
                          <span className="mx-1">•</span>
                          <span>{formatRelativeDate(item.createdAt)}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {user ? (
        <AddToPlaylistModal videoId={videoId} isOpen={playlistModalOpen} onClose={() => setPlaylistModalOpen(false)} />
      ) : null}
    </>
  );
};

export default VideoPlayer;

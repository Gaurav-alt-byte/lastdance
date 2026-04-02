import React, { useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Edit2,
  Loader2,
  MessageSquare,
  Send,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import apiClient from "../api/axios.js";
import { AuthContext } from "../context/AuthContext.jsx";
import { formatTimeAgo } from "../utils/formatters.js";
import { getErrorMessage } from "../utils/helpers.js";

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
      likesCount: likesResponse.data?.likes_count ?? likedIds.length,
      dislikesCount: dislikesResponse.data?.dislikes_count ?? dislikedIds.length,
      isLiked: userId ? likedIds.includes(userId) : false,
      isDisliked: userId ? dislikedIds.includes(userId) : false,
    };
  } catch {
    return {
      likesCount: 0,
      dislikesCount: 0,
      isLiked: false,
      isDisliked: false,
    };
  }
};

const normalizeReplies = (response) => (Array.isArray(response.data) ? response.data : []);

const formatReplyTime = (value) => {
  if (!value) return "Recently";
  return formatTimeAgo(value);
};

const TweetsFeed = () => {
  const { user } = useContext(AuthContext);
  const currentUserId = user?._id ? String(user._id) : "";

  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isComposing, setIsComposing] = useState(false);
  const [composingTweet, setComposingTweet] = useState({ tittle: "", main_content: "" });
  const [editingTweet, setEditingTweet] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [repliesByTweet, setRepliesByTweet] = useState({});
  const [expandedTweets, setExpandedTweets] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [submittingReplyFor, setSubmittingReplyFor] = useState("");
  const [editingReply, setEditingReply] = useState(null);
  const [replyActionId, setReplyActionId] = useState("");

  const fetchTweetReplies = useCallback(
    async (tweetId) => {
      setLoadingReplies((previous) => ({ ...previous, [tweetId]: true }));

      try {
        const response = await apiClient.get(`/Twitter/tweet/${tweetId}/replies`);
        const replies = normalizeReplies(response);

        const enrichedReplies = await Promise.all(
          replies.map(async (reply) => ({
            ...reply,
            author: reply.author || reply.owner || {},
            ...(await fetchReactionSummary(reply._id, "Comment_Model", currentUserId)),
          })),
        );

        setRepliesByTweet((previous) => ({
          ...previous,
          [tweetId]: enrichedReplies,
        }));
        setTweets((previous) =>
          previous.map((tweet) =>
            tweet._id === tweetId ? { ...tweet, repliesCount: enrichedReplies.length } : tweet,
          ),
        );
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoadingReplies((previous) => ({ ...previous, [tweetId]: false }));
      }
    },
    [currentUserId],
  );

  const fetchTweets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/Twitter/tweet/all");
      const list = Array.isArray(response.data) ? response.data : [];

      const enrichedTweets = await Promise.all(
        list.map(async (tweet) => {
          const author = tweet.owner_details || tweet.author || {};
          const [reactions, repliesResponse] = await Promise.all([
            fetchReactionSummary(tweet._id, "Tweets", currentUserId),
            apiClient.get(`/Twitter/tweet/${tweet._id}/replies`).catch(() => ({ data: [] })),
          ]);

          return {
            ...tweet,
            author,
            likesCount: reactions.likesCount,
            dislikesCount: reactions.dislikesCount,
            isLiked: reactions.isLiked,
            isDisliked: reactions.isDisliked,
            repliesCount: normalizeReplies(repliesResponse).length,
          };
        }),
      );

      setTweets(enrichedTweets);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
      setTweets([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchTweets();
  }, [fetchTweets]);

  const showSuccess = (message) => {
    setSuccess(message);
    window.setTimeout(() => setSuccess(""), 3000);
  };

  const handleCreateTweet = async (event) => {
    event.preventDefault();
    setError("");

    if (!composingTweet.tittle.trim() || !composingTweet.main_content.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      await apiClient.post("/Twitter/tweet/create", composingTweet);
      setComposingTweet({ tittle: "", main_content: "" });
      setIsComposing(false);
      await fetchTweets();
      showSuccess("Tweet posted successfully");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteTweet = async (tweetId) => {
    if (!window.confirm("Are you sure you want to delete this tweet?")) return;

    try {
      setError("");
      await apiClient.delete(`/Twitter/tweet/manage/delete/${tweetId}`);
      await fetchTweets();
      showSuccess("Tweet deleted successfully");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleUpdateTweet = async (event) => {
    event.preventDefault();
    setError("");

    if (!editingTweet?.tittle?.trim() || !editingTweet?.main_content?.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      await apiClient.patch(`/Twitter/tweet/manage/update/${editingTweet._id}`, {
        new_tittle: editingTweet.tittle,
        new_main_content: editingTweet.main_content,
      });
      setEditingTweet(null);
      await fetchTweets();
      showSuccess("Tweet updated successfully");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleTweetReaction = async (tweetId, endpoint) => {
    try {
      await apiClient.post(endpoint, { type: "Tweets" });
      await fetchTweets();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const toggleReplies = async (tweetId) => {
    const isExpanded = Boolean(expandedTweets[tweetId]);

    if (!isExpanded && !repliesByTweet[tweetId]) {
      await fetchTweetReplies(tweetId);
    }

    setExpandedTweets((previous) => ({
      ...previous,
      [tweetId]: !isExpanded,
    }));
  };

  const handleReplySubmit = async (tweetId) => {
    const content = replyDrafts[tweetId]?.trim();
    if (!content) return;

    setSubmittingReplyFor(tweetId);
    try {
      await apiClient.post(`/Twitter/tweet/${tweetId}/comment`, {
        type: "Tweets",
        main_content: content,
      });
      setReplyDrafts((previous) => ({ ...previous, [tweetId]: "" }));
      setExpandedTweets((previous) => ({ ...previous, [tweetId]: true }));
      await Promise.all([fetchTweetReplies(tweetId), fetchTweets()]);
      showSuccess("Reply posted successfully");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmittingReplyFor("");
    }
  };

  const handleDeleteReply = async (tweetId, replyId) => {
    if (!window.confirm("Delete this reply?")) return;

    setReplyActionId(replyId);
    try {
      await apiClient.post(`/Twitter/tweet/manage/${replyId}/delete-reply`);
      if (editingReply?._id === replyId) {
        setEditingReply(null);
      }
      await Promise.all([fetchTweetReplies(tweetId), fetchTweets()]);
      showSuccess("Reply deleted successfully");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setReplyActionId("");
    }
  };

  const handleSaveReplyEdit = async () => {
    if (!editingReply?.content?.trim()) return;

    setReplyActionId(editingReply._id);
    try {
      await apiClient.patch(`/Comments/edit-comment/${editingReply._id}`, {
        type: "Tweets",
        new_content: editingReply.content.trim(),
      });
      const tweetId = editingReply.tweetId;
      setEditingReply(null);
      await fetchTweetReplies(tweetId);
      showSuccess("Reply updated successfully");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setReplyActionId("");
    }
  };

  const handleReplyReaction = async (tweetId, replyId, endpoint) => {
    setReplyActionId(replyId);
    try {
      await apiClient.post(endpoint, { type: "Comment_Model" });
      await fetchTweetReplies(tweetId);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setReplyActionId("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 lg:px-10">
        <div className="mx-auto max-w-2xl space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-3xl bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 lg:px-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <MessageSquare className="text-red-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-white">Community</h1>
            <p className="mt-1 text-sm text-zinc-400">Share your thoughts with the community</p>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mb-4 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
            {success}
          </div>
        ) : null}

        {user ? (
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6">
            {isComposing ? (
              <form onSubmit={handleCreateTweet}>
                <input
                  type="text"
                  placeholder="Title"
                  value={composingTweet.tittle}
                  onChange={(event) =>
                    setComposingTweet({ ...composingTweet, tittle: event.target.value })
                  }
                  className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-white/20 focus:outline-none"
                />
                <textarea
                  placeholder="What's on your mind?"
                  value={composingTweet.main_content}
                  onChange={(event) =>
                    setComposingTweet({
                      ...composingTweet,
                      main_content: event.target.value,
                    })
                  }
                  className="mb-4 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-white/20 focus:outline-none"
                  rows={3}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsComposing(false);
                      setComposingTweet({ tittle: "", main_content: "" });
                    }}
                    className="flex-1 rounded-lg border border-white/10 px-4 py-2 font-semibold text-white hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500"
                  >
                    <Send size={18} />
                    Post
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsComposing(true)}
                className="flex w-full items-center gap-4 rounded-lg p-3 transition hover:bg-white/5"
              >
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <input
                  type="text"
                  placeholder="What's on your mind?"
                  readOnly
                  className="flex-1 cursor-pointer bg-transparent text-zinc-400 placeholder-zinc-500"
                />
              </button>
            )}
          </div>
        ) : null}

        {editingTweet ? (
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 text-lg font-bold text-white">Edit Tweet</h3>
            <form onSubmit={handleUpdateTweet}>
              <input
                type="text"
                value={editingTweet.tittle}
                onChange={(event) =>
                  setEditingTweet({ ...editingTweet, tittle: event.target.value })
                }
                className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-white/20 focus:outline-none"
              />
              <textarea
                value={editingTweet.main_content}
                onChange={(event) =>
                  setEditingTweet({
                    ...editingTweet,
                    main_content: event.target.value,
                  })
                }
                className="mb-4 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-white/20 focus:outline-none"
                rows={3}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTweet(null)}
                  className="flex-1 rounded-lg border border-white/10 px-4 py-2 font-semibold text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        ) : null}

        <div className="space-y-4">
          {tweets.length ? (
            tweets.map((tweet) => {
              const isOwner = currentUserId && String(tweet.author?._id) === currentUserId;
              const replies = repliesByTweet[tweet._id] || [];
              const repliesExpanded = Boolean(expandedTweets[tweet._id]);
              const repliesLoading = Boolean(loadingReplies[tweet._id]);

              return (
                <article
                  key={tweet._id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <Link to={`/channel/${tweet.author?.username || ""}`} className="shrink-0">
                        <img
                          src={tweet.author?.avatar || "https://via.placeholder.com/200"}
                          alt={tweet.author?.username || "user"}
                          className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <Link to={`/channel/${tweet.author?.username || ""}`} className="font-bold text-white hover:text-blue-400">
                              {tweet.author?.username || "Unknown User"}
                            </Link>
                            <p className="text-xs text-zinc-500">
                              {formatReplyTime(tweet.created_At || tweet.createdAt)}
                            </p>
                          </div>
                        </div>
                        <h3 className="mt-2 text-lg font-bold text-white">{tweet.tittle}</h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                          {tweet.main_content}
                        </p>
                      </div>
                    </div>

                    {isOwner ? (
                      <div className="flex flex-shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingTweet({
                              _id: tweet._id,
                              tittle: tweet.tittle,
                              main_content: tweet.main_content,
                            })
                          }
                          className="rounded-lg bg-zinc-800 p-2 text-white transition hover:bg-zinc-700"
                          title="Edit tweet"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTweet(tweet._id)}
                          className="rounded-lg bg-red-600/20 p-2 text-red-400 transition hover:bg-red-600/30"
                          title="Delete tweet"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-5 text-sm">
                    <button
                      type="button"
                      onClick={() => handleTweetReaction(tweet._id, `/likes/toggle/${tweet._id}`)}
                      className={`flex items-center gap-2 transition ${
                        tweet.isLiked ? "text-red-400" : "text-zinc-400 hover:text-red-500"
                      }`}
                    >
                      <ThumbsUp size={16} />
                      {tweet.likesCount || 0}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTweetReaction(tweet._id, `/dislikes/toggle/${tweet._id}`)}
                      className={`flex items-center gap-2 transition ${
                        tweet.isDisliked ? "text-blue-400" : "text-zinc-400 hover:text-blue-500"
                      }`}
                    >
                      <ThumbsDown size={16} />
                      {tweet.dislikesCount || 0}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleReplies(tweet._id)}
                      className="flex items-center gap-2 text-zinc-400 transition hover:text-white"
                    >
                      <MessageSquare size={16} />
                      {tweet.repliesCount || 0} replies
                    </button>
                  </div>

                  {repliesExpanded ? (
                    <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">Replies</h4>
                        {repliesLoading ? <Loader2 size={16} className="animate-spin text-zinc-500" /> : null}
                      </div>

                      <div className="mb-4 flex gap-3">
                        <img
                          src={user?.avatar || "https://via.placeholder.com/200"}
                          alt={user?.username || "user"}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <textarea
                            value={replyDrafts[tweet._id] || ""}
                            onChange={(event) =>
                              setReplyDrafts((previous) => ({
                                ...previous,
                                [tweet._id]: event.target.value,
                              }))
                            }
                            rows={3}
                            placeholder="Write a reply..."
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-white/20"
                          />
                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleReplySubmit(tweet._id)}
                              disabled={!replyDrafts[tweet._id]?.trim() || submittingReplyFor === tweet._id}
                              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
                            >
                              {submittingReplyFor === tweet._id ? "Posting..." : "Reply"}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {replies.map((reply) => {
                          const isReplyOwner = currentUserId && String(reply.author?._id || reply.owner) === currentUserId;
                          const isEditingReply = editingReply?._id === reply._id;
                          const isReplyBusy = replyActionId === reply._id;

                          return (
                            <div key={reply._id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                              <div className="flex gap-3">
                                <Link to={`/channel/${reply.author?.username || ""}`} className="shrink-0">
                                  <img
                                    src={reply.author?.avatar || "https://via.placeholder.com/200"}
                                    alt={reply.author?.username || "reply author"}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                </Link>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Link to={`/channel/${reply.author?.username || ""}`} className="text-sm font-semibold text-white hover:text-blue-400">
                                      @{reply.author?.username || "user"}
                                    </Link>
                                    <span className="text-xs text-zinc-500">
                                      {formatReplyTime(reply.created_At || reply.createdAt || reply.updated_At || reply.updatedAt)}
                                    </span>
                                  </div>

                                  {isEditingReply ? (
                                    <div className="mt-3 space-y-3">
                                      <textarea
                                        value={editingReply.content}
                                        onChange={(event) =>
                                          setEditingReply((previous) => ({
                                            ...previous,
                                            content: event.target.value,
                                          }))
                                        }
                                        rows={3}
                                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
                                      />
                                      <div className="flex flex-wrap gap-2">
                                        <button
                                          type="button"
                                          onClick={handleSaveReplyEdit}
                                          disabled={!editingReply.content.trim() || isReplyBusy}
                                          className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-zinc-700"
                                        >
                                          Save changes
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingReply(null)}
                                          className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/5"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">{reply.content}</p>
                                  )}

                                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                                    <button
                                      type="button"
                                      onClick={() => handleReplyReaction(tweet._id, reply._id, `/likes/toggle/${reply._id}`)}
                                      disabled={isReplyBusy}
                                      className={`flex items-center gap-1 transition ${
                                        reply.isLiked ? "text-red-400" : "hover:text-red-400"
                                      } disabled:cursor-not-allowed`}
                                    >
                                      <ThumbsUp size={14} />
                                      {reply.likesCount || 0}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleReplyReaction(tweet._id, reply._id, `/dislikes/toggle/${reply._id}`)}
                                      disabled={isReplyBusy}
                                      className={`flex items-center gap-1 transition ${
                                        reply.isDisliked ? "text-blue-400" : "hover:text-blue-400"
                                      } disabled:cursor-not-allowed`}
                                    >
                                      <ThumbsDown size={14} />
                                      {reply.dislikesCount || 0}
                                    </button>

                                    {isReplyOwner ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setEditingReply({
                                              _id: reply._id,
                                              tweetId: tweet._id,
                                              content: reply.content || "",
                                            })
                                          }
                                          className="flex items-center gap-1 transition hover:text-white"
                                        >
                                          <Edit2 size={14} />
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteReply(tweet._id, reply._id)}
                                          disabled={isReplyBusy}
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
                            </div>
                          );
                        })}

                        {!repliesLoading && !replies.length ? (
                          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-6 text-center text-sm text-zinc-400">
                            No replies yet. Start the discussion.
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center">
              <MessageSquare className="mx-auto mb-4 text-zinc-600" size={48} />
              <h3 className="mb-2 text-lg font-bold text-white">No tweets yet</h3>
              <p className="text-sm text-zinc-400">Be the first to share something.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TweetsFeed;

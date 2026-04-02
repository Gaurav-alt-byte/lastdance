import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Tv } from "lucide-react";
import apiClient from "../api/axios.js";
import { AuthContext } from "../context/AuthContext.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { getErrorMessage } from "../utils/helpers.js";

const isRecentVideo = (value) => {
  if (!value) return false;
  return new Date(value).getTime() > Date.now() - 1000 * 60 * 60 * 24 * 7;
};

const SubscribedFeed = () => {
  const { user } = useContext(AuthContext);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const observerTarget = useRef(null);
  const limit = 24;

  const fetchSubscribedVideos = useCallback(
    async (page = 1, isLoadMore = false) => {
      if (!isLoadMore) setLoading(true);
      else setLoadingMore(true);

      try {
        const videosResponse = await apiClient.get(`/videos/watch-Videos?limit=${limit}&page=${page}`);
        const allVideos = Array.isArray(videosResponse.data) ? videosResponse.data : [];

        if (isLoadMore) {
          setVideos((previous) => [...previous, ...allVideos]);
        } else {
          setVideos(allVideos);
        }

        setHasMore(allVideos.length === limit);
        setCurrentPage(page);
        setError("");
      } catch (err) {
        setError(getErrorMessage(err));
        if (!isLoadMore) setVideos([]);
      } finally {
        if (!isLoadMore) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchSubscribedVideos(1, false);
  }, [fetchSubscribedVideos]);

  useEffect(() => {
    if (!observerTarget.current || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchSubscribedVideos(currentPage + 1, true);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observerTarget.current);

    return () => observer.disconnect();
  }, [hasMore, loadingMore, currentPage, fetchSubscribedVideos]);

  const subscribedChannels = useMemo(() => {
    const grouped = new Map();

    videos.forEach((video) => {
      const creator = video.ownerDetails || video.owner || {};
      const creatorId = creator._id ? String(creator._id) : String(video.owner || "");
      if (!creatorId) return;

      const nextVideo = {
        _id: video._id,
        tittle: video.tittle,
        createdAt: video.createdAt,
        thumbnail: video.thumbnail,
      };

      if (!grouped.has(creatorId)) {
        grouped.set(creatorId, {
          _id: creatorId,
          username: creator.username || "Channel",
          avatar: creator.avatar || "https://via.placeholder.com/200",
          latestVideo: nextVideo,
          latestAt: video.createdAt,
          uploads: [nextVideo],
        });
        return;
      }

      const current = grouped.get(creatorId);
      current.uploads.push(nextVideo);
      if (!current.latestAt || new Date(video.createdAt) > new Date(current.latestAt)) {
        current.latestAt = video.createdAt;
        current.latestVideo = nextVideo;
      }
    });

    return Array.from(grouped.values()).sort(
      (a, b) => new Date(b.latestAt || 0).getTime() - new Date(a.latestAt || 0).getTime(),
    );
  }, [videos]);

  const recentChannels = useMemo(
    () => subscribedChannels.filter((channel) => isRecentVideo(channel.latestAt)),
    [subscribedChannels],
  );

  if (loading && videos.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 space-y-3">
            <div className="h-8 w-48 animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-96 animate-pulse rounded bg-zinc-800" />
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse space-y-3">
                <div className="aspect-video rounded-2xl bg-zinc-800" />
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-zinc-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-zinc-800" />
                    <div className="h-3 w-1/2 rounded bg-zinc-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <Tv className="text-red-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-white">Subscribed</h1>
              <p className="mt-2 text-sm text-zinc-400">Channels and videos from your subscription feed</p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        ) : null}

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">Subscribed channels</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {recentChannels.length
                  ? `${recentChannels.length} channel${recentChannels.length > 1 ? "s" : ""} posted recently`
                  : "No recent uploads detected"}
              </p>
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Recent activity</span>
          </div>

          {subscribedChannels.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {subscribedChannels.map((channel) => {
                const hasRecentPost = isRecentVideo(channel.latestAt);

                return (
                  <Link
                    key={channel._id}
                    to={`/channel/${channel.username}`}
                    className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20 hover:bg-black/30"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={channel.avatar}
                        alt={channel.username}
                        className="h-14 w-14 rounded-full border border-zinc-800 object-cover"
                      />
                      {hasRecentPost ? (
                        <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-[#0f0f0f] bg-blue-500" />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="truncate text-base font-semibold text-white group-hover:text-blue-400">
                          @{channel.username}
                        </h3>
                        <span className="text-xs text-zinc-500">
                          {channel.uploads.length} video{channel.uploads.length > 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-zinc-400">Latest: {channel.latestVideo?.tittle || "New upload"}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {channel.latestAt ? formatDistanceToNow(new Date(channel.latestAt), { addSuffix: true }) : "Recently"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-zinc-400">
              You are not subscribed to any channels yet.
            </div>
          )}
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white">Latest videos</h2>
            <p className="mt-1 text-sm text-zinc-400">Published videos from the feed, grouped below as cards</p>
          </div>

          {videos.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {videos.map((video) => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>

              <div ref={observerTarget} className="mt-8 flex justify-center">
                {loadingMore ? (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-white" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-white" style={{ animationDelay: "0.2s" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-white" style={{ animationDelay: "0.4s" }} />
                  </div>
                ) : null}
              </div>

              {!hasMore && videos.length > 0 ? (
                <div className="mt-8 text-center">
                  <p className="text-sm text-zinc-400">No more videos to load</p>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-20 text-center">
              <Tv className="mx-auto mb-4 text-zinc-600" size={48} />
              <h2 className="text-xl font-bold text-white">No videos from subscriptions</h2>
              <p className="mt-2 text-sm text-zinc-400">Subscribe to channels to see their latest videos here</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SubscribedFeed;

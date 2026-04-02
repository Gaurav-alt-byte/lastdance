import React, { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import apiClient from "../api/axios.js";
import { formatNumber, formatTimeAgo } from "../utils/formatters.js";
import { getErrorMessage } from "../utils/helpers.js";
import { Link } from "react-router-dom";

const Trending = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("views");

  // Fetch all videos and sort by engagement
  useEffect(() => {
    const fetchTrendingVideos = async () => {
      try {
        setLoading(true);
        setError("");
        // Fetch videos with high limit to get more results
        const response = await apiClient.get("/videos/watch-Videos?limit=100&page=1");
        let allVideos = Array.isArray(response.data) ? response.data : [];

        // Sort by selected metric
        allVideos = allVideos.sort((a, b) => {
          if (sortBy === "views") {
            return (b.views || 0) - (a.views || 0);
          } else if (sortBy === "likes") {
            return (b.likes_count || b.like_counts || 0) - (a.likes_count || a.like_counts || 0);
          } else if (sortBy === "recent") {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return 0;
        });

        setVideos(allVideos.slice(0, 50)); // Top 50 videos
      } catch (err) {
        setError(getErrorMessage(err));
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingVideos();
  }, [sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="h-8 w-48 rounded bg-zinc-800 animate-pulse mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-zinc-800 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 lg:px-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center gap-3">
            <TrendingUp className="text-red-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-white">Trending Now</h1>
              <p className="mt-2 text-sm text-zinc-400">
                The most popular and engaging videos right now
              </p>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSortBy("views")}
              className={`rounded-full px-6 py-2 font-semibold transition ${
                sortBy === "views"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
            >
              Most Views
            </button>
            <button
              onClick={() => setSortBy("likes")}
              className={`rounded-full px-6 py-2 font-semibold transition ${
                sortBy === "likes"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
            >
              Most Liked
            </button>
            <button
              onClick={() => setSortBy("recent")}
              className={`rounded-full px-6 py-2 font-semibold transition ${
                sortBy === "recent"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
            >
              Recent
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Trending List */}
        {videos.length > 0 ? (
          <div className="space-y-4">
            {videos.map((video, index) => (
              <Link
                key={video._id}
                to={`/video/${video._id}`}
                className="group flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
              >
                {/* Rank Badge */}
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-800">
                  <span className="text-2xl font-bold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Thumbnail */}
                <div className="relative flex-shrink-0 w-28 h-16 rounded-lg overflow-hidden bg-zinc-800">
                  <img
                    src={video.thumbnail}
                    alt={video.tittle}
                    className="h-full w-full object-cover group-hover:scale-105 transition"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="truncate text-lg font-bold text-white group-hover:text-red-400 transition">
                    {video.tittle}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    {video.owner?.username || "Unknown"}
                  </p>
                  <div className="mt-2 flex gap-4 text-xs text-zinc-500">
                    <span>{formatNumber(video.views || 0)} views</span>
                    <span>•</span>
                    <span>{formatTimeAgo(video.createdAt)}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-col gap-2 items-end justify-center flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm text-zinc-400">Views</p>
                    <p className="font-bold text-white">{formatNumber(video.views || 0)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-400">Likes</p>
                    <p className="font-bold text-white">
                      {formatNumber(video.likes_count || video.like_counts || 0)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-20 text-center">
            <div className="mb-4 text-4xl">🔥</div>
            <h2 className="text-xl font-bold text-white">No trending videos</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Check back soon for popular content
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trending;

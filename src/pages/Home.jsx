import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import apiClient from "../api/axios.js";
import VideoCard from "../components/VideoCard.jsx";

const categories = ["All", "Gaming", "Music", "Mixes", "Live", "Programming", "Tweets", "News", "Recent"];

const categoryKeywords = {
  Gaming: ["game", "gaming", "match", "play", "stream"],
  Music: ["music", "song", "album", "beat", "audio"],
  Mixes: ["mix", "remix", "playlist", "compilation"],
  Live: ["live", "stream", "premiere"],
  Programming: ["code", "programming", "developer", "react", "javascript", "typescript", "python"],
  Tweets: ["tweet", "community", "post"],
  News: ["news", "update", "breaking"],
};

const matchesCategory = (video, category) => {
  if (category === "All") return true;
  if (category === "Recent") {
    const createdAt = video.createdAt ? new Date(video.createdAt).getTime() : 0;
    return createdAt > Date.now() - 1000 * 60 * 60 * 24 * 14;
  }

  const searchableText = `${video.tittle || ""} ${video.description || ""} ${video.ownerDetails?.username || video.owner?.username || ""}`.toLowerCase();
  return (categoryKeywords[category] || []).some((keyword) => searchableText.includes(keyword));
};

const Home = ({ refreshKey = 0 }) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);
  const limit = 24;

  // Fetch videos for current page
  const fetchVideos = useCallback(
    async (page = 1, isLoadMore = false) => {
      if (!isLoadMore) setLoading(true);
      else setLoadingMore(true);

      try {
        const response = query
          ? await apiClient.get(`/videos/search?q=${encodeURIComponent(query)}&limit=${limit}&page=${page}`)
          : await apiClient.get(`/videos/watch-Videos?limit=${limit}&page=${page}`);

        const newVideos = Array.isArray(response.data) ? response.data : [];

        if (isLoadMore) {
          setVideos((prev) => [...prev, ...newVideos]);
        } else {
          setVideos(newVideos);
        }

        setHasMore(newVideos.length === limit);
        setCurrentPage(page);
      } catch (error) {
        console.error("Error fetching videos:", error);
        if (!isLoadMore) setVideos([]);
      } finally {
        if (!isLoadMore) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [query, limit]
  );

  // Initial fetch
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchVideos(1, false);
  }, [query, refreshKey, fetchVideos]);

  // Infinite scroll observer
  useEffect(() => {
    if (!observerTarget.current || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchVideos(currentPage + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);

    return () => observer.disconnect();
  }, [hasMore, loadingMore, currentPage, fetchVideos]);

  const title = useMemo(() => {
    if (query) {
      return `Search results for "${query}"`;
    }
    return "Home";
  }, [query]);

  const categorySubtitle = useMemo(() => {
    if (query) return "Results from your search";
    if (activeCategory === "All") return "Latest uploads and recommended videos";
    return `Showing ${activeCategory} content`;
  }, [query, activeCategory]);

  const visibleVideos = useMemo(() => {
    if (query) return videos;
    return videos.filter((video) => matchesCategory(video, activeCategory));
  }, [videos, query, activeCategory]);

  // Show loading skeleton only on initial load
  if (loading && videos.length === 0) {
    return (
      <div className="app-shell min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-2">
        <div className="sticky top-16 z-30 -mx-4 border-b border-white/5 bg-[#0f0f0f]/95 px-4 py-3 backdrop-blur">
          <div className="flex gap-3 overflow-x-auto">
            {categories.map((category) => (
              <div
                key={category}
                className="h-10 w-24 rounded-xl bg-zinc-800 animate-pulse"
              />
            ))}
          </div>
        </div>
        <div className="mt-4 space-y-3 pb-2">
          <div className="h-8 w-48 rounded bg-zinc-800 animate-pulse" />
          <div className="h-4 w-96 rounded bg-zinc-800 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
    );
  }

  return (
    <div className="app-shell min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-2">
      {/* Category Filter Bar */}
      <div className="sticky top-16 z-30 -mx-4 border-b border-white/5 bg-[#0f0f0f]/95 px-4 py-3 backdrop-blur">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
                activeCategory === category
                  ? "bg-white text-black"
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Page Header */}
      <div className="mt-4 flex items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          <p className="mt-1 text-sm text-zinc-400">{categorySubtitle}</p>
        </div>
      </div>

      {/* Videos Grid */}
      {visibleVideos.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {visibleVideos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>

          {/* Infinite Scroll Observer Target */}
          <div
            ref={observerTarget}
            className="mt-8 flex justify-center"
          >
            {loadingMore && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-white animate-bounce" />
                <div className="loading-dot-delay-200 h-2 w-2 rounded-full bg-white animate-bounce" />
                <div className="loading-dot-delay-400 h-2 w-2 rounded-full bg-white animate-bounce" />
              </div>
            )}
          </div>

          {/* End of Results */}
          {!hasMore && visibleVideos.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-zinc-400">No more videos to load</p>
            </div>
          )}
        </>
      ) : (
        <div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-6 text-center">
          <div>
            <h2 className="text-2xl font-bold text-white">No videos found</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Try another search or come back later for fresh uploads.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

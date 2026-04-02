import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import apiClient from "../api/axios.js";
import VideoCard from "../components/VideoCard.jsx";

const LikedVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLikedVideos = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/likes/liked-videos");
        const likedItems = Array.isArray(response.data) ? response.data : [];

        const detailedVideos = await Promise.all(
          likedItems.map(async (item) => {
            const videoId = item.content_id?._id || item.content_id;
            if (!videoId) return null;

            const videoResponse = await apiClient.get(`/videos/watch/${videoId}`);
            return videoResponse.data;
          }),
        );

        setVideos(detailedVideos.filter(Boolean));
      } catch {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    loadLikedVideos();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 lg:px-10">
      <div className="mx-auto max-w-[1700px]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Liked videos</h1>
          <p className="mt-1 text-sm text-zinc-400">Videos you have liked on CrackedTube</p>
        </div>

        {videos.length ? (
          <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center text-zinc-400">
            No liked videos found.
            <div className="mt-4">
              <Link to="/" className="text-sm font-medium text-blue-400 hover:underline">
                Explore videos
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedVideos;

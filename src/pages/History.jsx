import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import apiClient from "../api/axios.js";

const History = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/users/history");
      setVideos(response.data?.history_details || []);
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const clearHistory = async () => {
    await apiClient.patch("/users/clear-history");
    setVideos([]);
  };

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
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Watch history</h1>
            <p className="mt-1 text-sm text-zinc-400">Your recently watched videos</p>
          </div>

          <button
            type="button"
            onClick={clearHistory}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            <Trash2 size={16} />
            Clear history
          </button>
        </div>

        {videos.length ? (
          <div className="space-y-4">
            {videos.map((video) => (
              <Link
                key={video._id}
                to={`/video/${video._id}`}
                className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 md:flex-row"
              >
                <img
                  src={video.thumbnail}
                  alt={video.tittle}
                  className="aspect-video w-full rounded-2xl object-cover md:w-72"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">{video.tittle}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">{video.description}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-500">
                    <span>{video.views || 0} views</span>
                    <span>
                      {video.createdAt && formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center text-zinc-400">
            No watch history yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default History;

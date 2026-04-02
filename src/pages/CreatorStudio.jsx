import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Edit2, Trash2, Eye, BarChart3, Play } from "lucide-react";
import apiClient from "../api/axios.js";
import { AuthContext } from "../context/AuthContext.jsx";
import UploadModal from "../components/UploadModal.jsx";
import { formatNumber, formatTimeAgo, formatDuration } from "../utils/formatters.js";
import { getErrorMessage } from "../utils/helpers.js";

const CreatorStudio = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalVideos: 0,
  });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    new_tittle: "",
    new_description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all"); // all, published, unpublished

  // Fetch user's videos
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/videos/all-uploads");
      const uploadedVideos = response.data?.upload_data || [];

      const videosWithLikes = await Promise.all(
        uploadedVideos.map(async (video) => {
          try {
            const likesResponse = await apiClient.post(`/likes/likes-count/${video._id}`, {
              type: "Video",
            });
            return {
              ...video,
              likes_count: likesResponse.data?.likes_count || 0,
            };
          } catch {
            return {
              ...video,
              likes_count: video.likes_count || video.like_counts || 0,
            };
          }
        })
      );

      setVideos(videosWithLikes);

      // Calculate stats
      const totalViews = videosWithLikes.reduce((sum, v) => sum + (v.views || 0), 0);
      const totalLikes = videosWithLikes.reduce((sum, v) => sum + (v.likes_count || 0), 0);

      setStats({
        totalViews,
        totalLikes,
        totalVideos: videosWithLikes.length,
      });
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchVideos();
  }, [user, navigate]);

  // Delete video
  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      return;
    }

    try {
      setError("");
      await apiClient.post(`/videos/delete-video/${videoId}`);
      setSuccess("Video deleted successfully");
      fetchVideos();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Toggle publish status
  const handleTogglePublish = async (videoId, currentStatus) => {
    try {
      setError("");
      await apiClient.post(`/videos/change-publish-status/${videoId}`);
      setSuccess(currentStatus ? "Video unpublished" : "Video published");
      fetchVideos();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Open edit modal
  const handleEditClick = (video) => {
    setEditingVideo(video);
    setEditFormData({
      new_tittle: video.tittle,
      new_description: video.description,
    });
    setIsEditModalOpen(true);
  };

  // Update video details
  const handleUpdateVideo = async (e) => {
    e.preventDefault();
    if (!editFormData.new_tittle.trim() || !editFormData.new_description.trim()) {
      setError("Title and description are required");
      return;
    }

    try {
      setError("");
      await apiClient.patch(
        `/videos/update-details/${editingVideo._id}`,
        editFormData
      );
      setSuccess("Video updated successfully");
      setIsEditModalOpen(false);
      setEditingVideo(null);
      fetchVideos();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const filteredVideos = videos.filter((video) => {
    if (filter === "published") return video.is_published;
    if (filter === "unpublished") return !video.is_published;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="h-8 w-48 rounded bg-zinc-800 animate-pulse mb-8" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-zinc-800 animate-pulse" />
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-zinc-800 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Creator Studio</h1>
              <p className="mt-2 text-sm text-zinc-400">Manage your videos and view analytics</p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-500 transition"
            >
              <Upload size={20} />
              Upload Video
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Total Views</p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {formatNumber(stats.totalViews)}
                  </p>
                </div>
                <Eye className="text-red-600" size={32} />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Total Likes</p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {formatNumber(stats.totalLikes)}
                  </p>
                </div>
                <BarChart3 className="text-red-600" size={32} />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Total Videos</p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {stats.totalVideos}
                  </p>
                </div>
                <Play className="text-red-600" size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mb-6 flex gap-3 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full px-6 py-2 font-semibold transition ${
              filter === "all"
                ? "bg-red-600 text-white"
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            All Videos
          </button>
          <button
            onClick={() => setFilter("published")}
            className={`rounded-full px-6 py-2 font-semibold transition ${
              filter === "published"
                ? "bg-red-600 text-white"
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setFilter("unpublished")}
            className={`rounded-full px-6 py-2 font-semibold transition ${
              filter === "unpublished"
                ? "bg-red-600 text-white"
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            Unpublished
          </button>
        </div>

        {/* Videos Table */}
        {filteredVideos.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Video</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Views</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Likes</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Uploaded</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredVideos.map((video) => (
                  <tr key={video._id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex gap-3 items-start">
                        <img
                          src={video.thumbnail}
                          alt={video.tittle}
                          className="h-12 w-20 rounded object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">{video.tittle}</p>
                          <p className="text-xs text-zinc-400 truncate">{video.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          video.is_published
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {video.is_published ? "Published" : "Unpublished"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white">
                      {formatNumber(video.views || 0)}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {formatNumber(video.likes_count || video.like_counts || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {formatTimeAgo(video.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            handleTogglePublish(video._id, video.is_published)
                          }
                          className="rounded-lg bg-zinc-800 px-3 py-1 text-xs font-semibold text-white hover:bg-zinc-700 transition"
                        >
                          {video.is_published ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => handleEditClick(video)}
                          className="rounded-lg bg-zinc-800 p-2 text-white hover:bg-zinc-700 transition"
                          title="Edit video"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(video._id)}
                          className="rounded-lg bg-red-600/20 p-2 text-red-400 hover:bg-red-600/30 transition"
                          title="Delete video"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center">
            <Upload className="mx-auto text-zinc-600 mb-4" size={48} />
            <h3 className="text-lg font-bold text-white mb-2">No videos yet</h3>
            <p className="text-sm text-zinc-400 mb-6">
              {filter === "all"
                ? "Upload your first video to get started"
                : `No ${filter} videos yet`}
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-500"
            >
              <Upload size={18} />
              Upload Your First Video
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploaded={() => {
          setIsUploadModalOpen(false);
          fetchVideos();
          setSuccess("Video uploaded successfully!");
          setTimeout(() => setSuccess(""), 3000);
        }}
      />

      {/* Edit Video Modal */}
      {isEditModalOpen && editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1a1a] p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Edit Video</h2>

            <form onSubmit={handleUpdateVideo}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editFormData.new_tittle}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      new_tittle: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-white/20 focus:outline-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-white mb-2">
                  Description
                </label>
                <textarea
                  value={editFormData.new_description}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      new_description: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-white/20 focus:outline-none"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingVideo(null);
                  }}
                  className="flex-1 rounded-lg border border-white/10 px-4 py-3 font-semibold text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-500"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorStudio;

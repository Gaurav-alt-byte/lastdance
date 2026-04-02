import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Lock, Unlock } from "lucide-react";
import apiClient from "../api/axios.js";
import { AuthContext } from "../context/AuthContext.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { getErrorMessage } from "../utils/helpers.js";

const PlaylistDetail = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    is_private: false,
  });

  // Fetch playlist details
  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(
          `/Playlists/user/${playlistId}/view`
        );
        setPlaylist(response.data);
        setEditData({
          name: response.data.name,
          description: response.data.description,
          is_private: response.data.is_Private || false,
        });
        setError("");
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [playlistId]);

  // Remove video from playlist
  const handleRemoveVideo = async (videoId) => {
    if (!window.confirm("Remove this video from the playlist?")) return;

    try {
      setError("");
      await apiClient.patch(
        `/Playlists/user/${playlistId}/${videoId}/remove`
      );
      setSuccess("Video removed from playlist");
      // Refresh playlist
      const response = await apiClient.get(
        `/Playlists/user/${playlistId}/view`
      );
      setPlaylist(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Update playlist
  const handleUpdatePlaylist = async (e) => {
    e.preventDefault();
    if (!editData.name.trim()) {
      setError("Playlist name is required");
      return;
    }

    try {
      setError("");
      await apiClient.patch(
        `/Playlists/user/${playlistId}/edit`,
        editData
      );
      setSuccess("Playlist updated successfully");
      const response = await apiClient.get(
        `/Playlists/user/${playlistId}/view`
      );
      setPlaylist(response.data);
      setIsEditing(false);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4">
        <div className="mx-auto max-w-6xl">
          <div className="h-8 w-32 rounded bg-zinc-800 animate-pulse mb-6" />
          <div className="h-48 w-full rounded-2xl bg-zinc-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Playlist not found</h2>
          <button
            onClick={() => navigate("/collections")}
            className="mt-4 rounded-full bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-500"
          >
            Back to Collections
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user?._id === playlist.owner;
  const videoCount = playlist.Videos?.length || 0;

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Back Button */}
        <button
          onClick={() => navigate("/collections")}
          className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          Back to Collections
        </button>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-green-400">
            {success}
          </div>
        )}

        {/* Playlist Header */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-8">
          {isEditing && isOwner ? (
            <form onSubmit={handleUpdatePlaylist} className="space-y-4">
              <input
                type="text"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-2xl font-bold text-white focus:border-white/20 focus:outline-none"
              />
              <textarea
                value={editData.description}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-white/20 focus:outline-none"
                rows={3}
              />
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={editData.is_private}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      is_private: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <label htmlFor="isPrivate" className="text-sm text-white cursor-pointer">
                  Make this playlist private
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg border border-white/10 px-4 py-2 font-semibold text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-white">
                    {playlist.name}
                  </h1>
                  <p className="mt-2 text-zinc-400">{playlist.description}</p>
                </div>
                {playlist.is_Private && (
                  <Lock className="text-zinc-400 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-zinc-400">
                {videoCount} {videoCount === 1 ? "video" : "videos"}
              </p>
              {isOwner && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 rounded-lg bg-zinc-800 px-4 py-2 font-semibold text-white hover:bg-zinc-700"
                >
                  Edit Playlist
                </button>
              )}
            </div>
          )}
        </div>

        {/* Videos Grid */}
        {videoCount > 0 ? (
          <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {playlist.Videos?.map((video, index) => (
              <div key={video._id} className="relative group">
                <VideoCard video={video} />
                {isOwner && (
                  <button
                    onClick={() => handleRemoveVideo(video._id)}
                    className="absolute top-2 right-2 rounded-lg bg-red-600/80 p-2 text-white opacity-0 group-hover:opacity-100 transition"
                    title="Remove from playlist"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-20 text-center">
            <div className="mb-4 text-4xl">🎬</div>
            <h2 className="text-xl font-bold text-white">No videos in this playlist</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {isOwner
                ? "Add videos to this playlist from the video player"
                : "This playlist is empty"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetail;

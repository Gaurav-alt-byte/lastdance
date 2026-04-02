import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Edit2, Lock, Unlock, ChevronRight } from "lucide-react";
import apiClient from "../api/axios.js";
import { AuthContext } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../utils/helpers.js";

const Collections = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_private: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch playlists
  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/Playlists/user/playlist/all");
      setPlaylists(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Create or update playlist
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Playlist name is required");
      return;
    }

    try {
      if (editingPlaylist) {
        // Update playlist
        await apiClient.patch(
          `/Playlists/user/${editingPlaylist._id}/edit`,
          formData
        );
        setSuccess("Playlist updated successfully");
      } else {
        // Create new playlist
        await apiClient.post("/Playlists/user/playlist/create", formData);
        setSuccess("Playlist created successfully");
      }

      setFormData({ name: "", description: "", is_private: false });
      setEditingPlaylist(null);
      setIsModalOpen(false);
      fetchPlaylists();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Delete playlist
  const handleDelete = async (playlistId) => {
    if (!window.confirm("Are you sure you want to delete this playlist?")) {
      return;
    }

    try {
      setError("");
      await apiClient.post(`/Playlists/user/${playlistId}/delete`);
      setSuccess("Playlist deleted successfully");
      fetchPlaylists();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Edit playlist
  const handleEdit = (playlist) => {
    setEditingPlaylist(playlist);
    setFormData({
      name: playlist.name,
      description: playlist.description,
      is_private: playlist.is_Private || false,
    });
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlaylist(null);
    setFormData({ name: "", description: "", is_private: false });
    setError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="h-8 w-48 rounded bg-zinc-800 animate-pulse mb-6" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-zinc-800 animate-pulse" />
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">My Playlists</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Create and organize your favorite videos into playlists
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-500"
          >
            <Plus size={20} />
            New Playlist
          </button>
        </div>

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

        {/* Playlists Grid */}
        {playlists.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {playlists.map((playlist) => (
              <div
                key={playlist._id}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-white/20 hover:bg-white/10"
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-gradient-to-br from-zinc-800 to-black relative overflow-hidden flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white/30 mb-2">
                      {playlist.Videos?.length || 0}
                    </div>
                    <p className="text-sm text-white/20">
                      {playlist.Videos?.length === 1 ? "video" : "videos"}
                    </p>
                  </div>
                  {playlist.is_Private && (
                    <div className="absolute top-3 right-3 bg-black/50 rounded-lg p-2">
                      <Lock size={16} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="truncate text-lg font-bold text-white">
                    {playlist.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                    {playlist.description}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {new Date(playlist.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-white/5 p-3">
                  <button
                    onClick={() =>
                      navigate(`/playlist/${playlist._id}`)
                    }
                    className="flex-1 rounded-lg bg-zinc-800 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(playlist)}
                    className="rounded-lg bg-zinc-800 p-2 text-white transition hover:bg-zinc-700"
                    title="Edit playlist"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(playlist._id)}
                    className="rounded-lg bg-red-600/20 p-2 text-red-400 transition hover:bg-red-600/30"
                    title="Delete playlist"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-20 text-center">
            <div className="mb-4 text-4xl">📭</div>
            <h2 className="text-xl font-bold text-white">No playlists yet</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Create your first playlist to organize your favorite videos
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-500"
            >
              <Plus size={18} />
              Create Playlist
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Playlist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1a1a] p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingPlaylist ? "Edit Playlist" : "Create Playlist"}
            </h2>

            {error && (
              <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white mb-2">
                  Playlist Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="My awesome playlist"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-white/20 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your playlist..."
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-white/20 focus:outline-none"
                />
              </div>

              {/* Privacy */}
              <div className="mb-6 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPrivate"
                  name="is_private"
                  checked={formData.is_private}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <label htmlFor="isPrivate" className="text-sm text-white cursor-pointer">
                  Make this playlist private
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-lg border border-white/10 px-4 py-3 font-semibold text-white transition hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-500"
                >
                  {editingPlaylist ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;

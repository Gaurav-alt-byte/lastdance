import React, { useEffect, useState } from "react";
import { X, Plus, Check } from "lucide-react";
import apiClient from "../api/axios.js";
import { getErrorMessage } from "../utils/helpers.js";

const AddToPlaylistModal = ({ videoId, isOpen, onClose }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  const [addedPlaylists, setAddedPlaylists] = useState(new Set());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const response = await apiClient.get("/Playlists/user/playlist/all");
        const playlistList = Array.isArray(response.data) ? response.data : [];

        setPlaylists(playlistList);
        setAddedPlaylists(
          new Set(
            playlistList
              .filter((playlist) =>
                Array.isArray(playlist.Videos) &&
                playlist.Videos.some((item) => String(item?._id || item) === String(videoId)),
              )
              .map((playlist) => playlist._id),
          ),
        );
      } catch (err) {
        setError(getErrorMessage(err));
        setPlaylists([]);
        setAddedPlaylists(new Set());
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [isOpen, videoId]);

  const handleCreatePlaylist = async (event) => {
    event.preventDefault();
    if (!newPlaylistName.trim()) {
      setError("Playlist name is required");
      return;
    }

    try {
      setError("");
      const newPlaylist = await apiClient.post("/Playlists/user/playlist/create", {
        name: newPlaylistName,
        description: newPlaylistDesc || "No description",
        is_private: false,
      });

      setPlaylists((previous) => [...previous, newPlaylist.data]);
      setNewPlaylistName("");
      setNewPlaylistDesc("");
      setIsCreatingNew(false);
      setSuccess("Playlist created successfully");

      window.setTimeout(() => {
        handleAddToPlaylist(newPlaylist.data._id);
      }, 300);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      setError("");
      await apiClient.patch(`/Playlists/user/${playlistId}/${videoId}/add`);
      setAddedPlaylists((previous) => new Set(previous).add(playlistId));
      setSuccess("Video added to playlist");
      window.setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleRemoveFromPlaylist = async (playlistId) => {
    try {
      setError("");
      await apiClient.patch(`/Playlists/user/${playlistId}/${videoId}/remove`);
      setAddedPlaylists((previous) => {
        const next = new Set(previous);
        next.delete(playlistId);
        return next;
      });
      setSuccess("Video removed from playlist");
      window.setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#1a1a1a] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Add to Playlist</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mb-4 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
            {success}
          </div>
        ) : null}

        {isCreatingNew ? (
          <form onSubmit={handleCreatePlaylist} className="mb-6 space-y-3">
            <input
              type="text"
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(event) => setNewPlaylistName(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-white/20 focus:outline-none"
            />
            <textarea
              placeholder="Description (optional)"
              value={newPlaylistDesc}
              onChange={(event) => setNewPlaylistDesc(event.target.value)}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-white/20 focus:outline-none"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(false);
                  setNewPlaylistName("");
                  setNewPlaylistDesc("");
                }}
                className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
              >
                Create
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsCreatingNew(true)}
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            <Plus size={18} />
            New Playlist
          </button>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-lg bg-zinc-800" />
            ))}
          </div>
        ) : playlists.length > 0 ? (
          <div className="space-y-2">
            {playlists.map((playlist) => {
              const isAdded = addedPlaylists.has(playlist._id);

              return (
                <button
                  key={playlist._id}
                  type="button"
                  onClick={() =>
                    isAdded ? handleRemoveFromPlaylist(playlist._id) : handleAddToPlaylist(playlist._id)
                  }
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                    isAdded
                      ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                      : "border border-white/10 text-white hover:bg-white/10"
                  }`}
                >
                  <div>
                    <p>{playlist.name}</p>
                    <p className="text-xs opacity-75">{playlist.Videos?.length || 0} videos</p>
                  </div>
                  {isAdded ? <Check size={18} /> : null}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-8 text-center">
            <p className="mb-4 text-sm text-zinc-400">No playlists yet. Create one to get started.</p>
            <button
              type="button"
              onClick={() => setIsCreatingNew(true)}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
            >
              <Plus size={16} />
              Create Playlist
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg border border-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/5"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;

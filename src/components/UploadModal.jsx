import React, { useState } from "react";
import { X } from "lucide-react";
import apiClient from "../api/axios.js";
import { getApiMessage, getErrorMessage, isApiSuccess } from "../utils/helpers.js";

const UploadModal = ({ isOpen, onClose, onUploaded }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setVideoFile(null);
    setThumbnail(null);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("tittle", title);
    formData.append("description", description);
    formData.append("videotobeUploaded", videoFile);
    formData.append("thumbnail", thumbnail);

    try {
      const response = await apiClient.post("/videos/upload-video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (isApiSuccess(response)) {
        resetForm();
        onUploaded?.();
        onClose();
      } else {
        setError(getApiMessage(response, "Upload failed"));
      }
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#181818] shadow-soft">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-white">Upload video</h2>
            <p className="mt-1 text-sm text-zinc-400">Share a new video with your audience.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-zinc-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Close upload modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleUpload} className="space-y-4 px-6 py-6">
          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Video title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500"
              required
            />
            <input
              type="file"
              accept="video/*"
              onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white"
              required
            />
          </div>

          <textarea
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-32 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500"
            required
          />

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setThumbnail(event.target.files?.[0] || null)}
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white"
              required
            />
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
              Title, thumbnail, and video file are required by the backend.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Uploading..." : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;

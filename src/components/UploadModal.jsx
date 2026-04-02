import React, { useState } from "react";
import { X, CheckCircle, Play, Image as ImageIcon, Loader2 } from "lucide-react";
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
    setError("");

    // Validation
    if (!title.trim()) {
      setError("Video title is required.");
      return;
    }

    if (!description.trim()) {
      setError("Video description is required.");
      return;
    }

    if (!videoFile) {
      setError("Video file is required.");
      return;
    }

    if (!thumbnail) {
      setError("Thumbnail image is required.");
      return;
    }

    setLoading(true);

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
        setError(getApiMessage(response, "Upload failed. Please try again."));
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
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Video title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500"
              required
            />

            <label
              className={`flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed px-4 py-4 text-sm transition ${
                videoFile
                  ? "border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                  : "border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              <span className="flex items-center gap-2 font-medium text-white">
                {videoFile ? <CheckCircle size={18} className="text-green-500" /> : <Play size={18} />}
                Video file
              </span>
              <span className="truncate text-xs opacity-80">
                {videoFile ? videoFile.name : "Required"}
              </span>
              <input
                type="file"
                accept="video/*"
                onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
                className="hidden"
                required
              />
            </label>
          </div>

          <textarea
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-32 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500"
            required
          />

          <div className="space-y-4">
            <label
              className={`flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed px-4 py-4 text-sm transition ${
                thumbnail
                  ? "border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                  : "border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              <span className="flex items-center gap-2 font-medium text-white">
                {thumbnail ? <CheckCircle size={18} className="text-green-500" /> : <ImageIcon size={18} />}
                Thumbnail
              </span>
              <span className="truncate text-xs opacity-80">
                {thumbnail ? thumbnail.name : "Required"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setThumbnail(event.target.files?.[0] || null)}
                className="hidden"
                required
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-2xl border border-white/10 px-6 py-2.5 text-sm font-medium text-white transition duration-200 hover:border-white/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !videoFile || !thumbnail || !title.trim() || !description.trim()}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition duration-200 hover:from-red-500 hover:to-red-400 hover:shadow-red-500/30 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-500 disabled:shadow-none"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Publishing..." : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;

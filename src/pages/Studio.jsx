import React, { useEffect, useState } from "react";
import apiClient from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";
import {
    Loader2, Eye, EyeOff, Trash2, Edit, Upload,
    BarChart2, Film, ToggleLeft, ToggleRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import UploadModal from "../components/UploadModal.jsx";

const formatViews = (v) => {
    if (!v) return "0";
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
    if (v >= 1_000) return (v / 1_000).toFixed(1) + "K";
    return v.toString();
};

const formatDuration = (s) => {
    if (!s) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
};

const Studio = () => {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const fetchVideos = async () => {
        try {
            // FIX: route is /videos/all-uploads
            const res = await apiClient.get("/videos/all-uploads");
            setVideos(res.data?.upload_data || res.data || []);
        } catch (err) {
            console.error("Studio fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    const handleTogglePublish = async (videoId) => {
        setTogglingId(videoId);
        try {
            // FIX: route is /videos/change-publish-status/:VideoId
            await apiClient.post(`/videos/change-publish-status/${videoId}`);
            setVideos((prev) => prev.map((v) =>
                v._id === videoId ? { ...v, is_published: !v.is_published } : v
            ));
        } catch (err) {
            console.error("Toggle failed", err);
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async (videoId) => {
        if (!window.confirm("Delete this video permanently?")) return;
        setDeletingId(videoId);
        try {
            // FIX: route is /videos/delete-video/:VideoId
            await apiClient.post(`/videos/delete-video/${videoId}`);
            setVideos((prev) => prev.filter((v) => v._id !== videoId));
        } catch (err) {
            console.error("Delete failed", err);
        } finally {
            setDeletingId(null);
        }
    };

    const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);

    return (
        <div className="min-h-screen bg-[#0f0f0f] px-4 pt-6 pb-20">
            <UploadModal isOpen={uploadOpen} onClose={() => { setUploadOpen(false); fetchVideos(); }} />

            <div className="max-w-[1200px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-white">Channel Studio</h1>
                        <p className="text-[#aaa] text-sm mt-1">@{user?.username}</p>
                    </div>
                    <button
                        onClick={() => setUploadOpen(true)}
                        className="flex items-center gap-2 bg-[#3ea6ff] text-black px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#3ea6ff]/90 transition-colors"
                    >
                        <Upload size={16} /> Upload video
                    </button>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-[#212121] border border-white/10 rounded-2xl p-5">
                        <p className="text-[#aaa] text-xs font-medium mb-2 flex items-center gap-1.5"><Film size={13} /> Total videos</p>
                        <p className="text-3xl font-black text-white">{videos.length}</p>
                    </div>
                    <div className="bg-[#212121] border border-white/10 rounded-2xl p-5">
                        <p className="text-[#aaa] text-xs font-medium mb-2 flex items-center gap-1.5"><BarChart2 size={13} /> Total views</p>
                        <p className="text-3xl font-black text-white">{formatViews(totalViews)}</p>
                    </div>
                    <div className="bg-[#212121] border border-white/10 rounded-2xl p-5">
                        <p className="text-[#aaa] text-xs font-medium mb-2 flex items-center gap-1.5"><Eye size={13} /> Published</p>
                        <p className="text-3xl font-black text-white">{videos.filter((v) => v.is_published).length}</p>
                    </div>
                </div>

                {/* Videos table */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 size={36} className="animate-spin text-white/30" />
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-20 text-[#717171]">
                        <Film size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium mb-1">No uploads yet</p>
                        <p className="text-sm">Upload your first video to get started.</p>
                    </div>
                ) : (
                    <div className="bg-[#212121] border border-white/10 rounded-2xl overflow-hidden">
                        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 text-xs font-semibold text-[#717171] uppercase tracking-wider border-b border-white/10">
                            <span></span>
                            <span>Video</span>
                            <span>Views</span>
                            <span>Duration</span>
                            <span>Status</span>
                            <span>Actions</span>
                        </div>
                        {videos.map((video) => (
                            <div
                                key={video._id}
                                className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-4 items-center border-b border-white/5 hover:bg-white/5 transition-colors"
                            >
                                {/* Thumbnail */}
                                <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-[#272727]">
                                    <img
                                        src={video.thumbnail}
                                        alt={video.tittle}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/128x72/272727/555?text=No+Thumb"; }}
                                    />
                                    <div className="absolute bottom-1 right-1 bg-black/90 px-1 py-0.5 text-[10px] font-medium text-white rounded">
                                        {formatDuration(video.duration)}
                                    </div>
                                </div>

                                {/* Title + date */}
                                <div className="min-w-0">
                                    <Link to={`/video/${video._id}`}>
                                        <p className="text-sm font-medium text-white hover:text-[#3ea6ff] transition-colors truncate">
                                            {video.tittle}
                                        </p>
                                    </Link>
                                    <p className="text-xs text-[#717171] mt-0.5">
                                        {video.createdAt && formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                                    </p>
                                </div>

                                {/* Views */}
                                <span className="text-sm text-[#aaa] text-right">{formatViews(video.views)}</span>

                                {/* Duration */}
                                <span className="text-sm text-[#aaa] text-right">{formatDuration(video.duration)}</span>

                                {/* Status toggle */}
                                <button
                                    onClick={() => handleTogglePublish(video._id)}
                                    disabled={togglingId === video._id}
                                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                                        video.is_published
                                            ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                            : "bg-[#272727] text-[#aaa] hover:bg-[#3d3d3d]"
                                    }`}
                                >
                                    {togglingId === video._id ? (
                                        <Loader2 size={12} className="animate-spin" />
                                    ) : video.is_published ? (
                                        <><Eye size={12} /> Public</>
                                    ) : (
                                        <><EyeOff size={12} /> Private</>
                                    )}
                                </button>

                                {/* Delete */}
                                <button
                                    onClick={() => handleDelete(video._id)}
                                    disabled={deletingId === video._id}
                                    className="p-2 text-[#717171] hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                                >
                                    {deletingId === video._id ? (
                                        <Loader2 size={15} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={15} />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Studio;
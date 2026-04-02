import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const formatDuration = (duration = 0) => {
  const totalSeconds = Number(duration) || 0;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
};

const VideoCard = ({ video }) => {
  const creator = video.ownerDetails || video.owner || {};
  const timeAgo = video.createdAt
    ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })
    : "Recently";

  return (
    <Link to={`/video/${video._id}`} className="group flex flex-col gap-3">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-zinc-900">
        <img
          src={video.thumbnail}
          alt={video.tittle}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-semibold text-white">
          {formatDuration(video.duration)}
        </span>
      </div>

      <div className="flex gap-3 px-1">
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
          <img
            src={creator.avatar || "https://via.placeholder.com/200"}
            alt={creator.username || "creator"}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-100 transition group-hover:text-blue-400">
            {video.tittle}
          </h3>
          <p className="mt-1 truncate text-xs text-zinc-400">{creator.username || "Unknown creator"}</p>
          <div className="mt-1 flex items-center text-xs text-zinc-500">
            <span>{video.views || 0} views</span>
            <span className="mx-1">•</span>
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;

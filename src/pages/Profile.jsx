import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Ban, UserMinus, ShieldAlert, ShieldCheck, Pencil } from "lucide-react";
import apiClient from "../api/axios.js";
import VideoCard from "../components/VideoCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../utils/helpers.js";

const Profile = () => {
  const { username: routeUsername } = useParams();
  const { user } = useAuth();
  const username = routeUsername || user?.username;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriberList, setSubscriberList] = useState([]);
  const [subscriberLoading, setSubscriberLoading] = useState(false);
  const [subscriberError, setSubscriberError] = useState("");
  const [subscriberActionId, setSubscriberActionId] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return;
      setLoading(true);
      try {
        // Backend: GET /api/v1/users/channel/:username
        // APIresponse wraps payload: { statusCode, message, data: { ...channelFields } }
        const response = await apiClient.get(`/users/channel/${username}`);
        const profileData = response.data?.data ?? response.data;
        setProfile(profileData);
        setSubscribed(Boolean(profileData?.isSubscribed));
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [username]);

  const isOwnChannel = user?.username === profile?.username;

  useEffect(() => {
    const loadSubscribers = async () => {
      if (!isOwnChannel || !profile?._id) {
        setSubscriberList([]);
        return;
      }
      setSubscriberLoading(true);
      setSubscriberError("");
      try {
        const response = await apiClient.get(`/Subscriptions/all-subscriber/${profile._id}`);
        const list = response.data?.data ?? response.data;
        setSubscriberList(Array.isArray(list) ? list : []);
      } catch (error) {
        setSubscriberError(getErrorMessage(error));
        setSubscriberList([]);
      } finally {
        setSubscriberLoading(false);
      }
    };
    loadSubscribers();
  }, [isOwnChannel, profile?._id]);

  const handleSubscribe = async () => {
    if (!profile?._id) return;
    if (subscribed) {
      await apiClient.patch(`/Subscriptions/unsubscribe/${profile._id}`);
      setSubscribed(false);
      return;
    }
    await apiClient.post(`/Subscriptions/subscribe/${profile._id}`);
    setSubscribed(true);
  };

  const refreshSubscribers = async () => {
    if (!profile?._id || !isOwnChannel) return;
    const response = await apiClient.get(`/Subscriptions/all-subscriber/${profile._id}`);
    const list = response.data?.data ?? response.data;
    setSubscriberList(Array.isArray(list) ? list : []);
  };

  const handleSubscriberAction = async (userId, action) => {
    setSubscriberActionId(userId);
    try {
      if (action === "remove") {
        await apiClient.delete(`/Subscriptions/subscribers/remove/${userId}`);
      } else if (action === "block") {
        await apiClient.patch(`/Subscriptions/subscribers/Block/${userId}`);
      } else if (action === "unblock") {
        await apiClient.patch(`/Subscriptions/subscribers/unblock/${userId}`);
      }
      await refreshSubscribers();
    } catch (error) {
      setSubscriberError(getErrorMessage(error));
    } finally {
      setSubscriberActionId("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white">
        Channel not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 lg:px-10">
      <div className="mx-auto max-w-[1700px] space-y-8">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#121212] shadow-soft">
          <div className="h-40 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-900 sm:h-56">
            <img
              src={profile.cover_image || "https://via.placeholder.com/1200x300"}
              alt="cover"
              className="h-full w-full object-cover opacity-80"
            />
          </div>

          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-5 md:flex-row md:items-end">
              <img
                src={profile.avatar || "https://via.placeholder.com/200"}
                alt={profile.username}
                className="-mt-20 h-32 w-32 rounded-full border-4 border-[#0f0f0f] object-cover"
              />
              <div>
                <h1 className="text-3xl font-extrabold text-white">{profile.fullname}</h1>
                <p className="mt-1 text-zinc-400">@{profile.username}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                  <span>{profile.SubscribersCount ?? 0} subscribers</span>
                  <span>{profile.SubscribedToCount ?? 0} subscriptions</span>
                  <span>
                    Joined{" "}
                    {profile.createdAt
                      ? formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })
                      : "recently"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="flex flex-wrap items-center gap-3">
              {isOwnChannel ? (
                <Link
                  to="/channel/edit"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <Pencil size={15} />
                  Edit channel
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleSubscribe}
                  className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
                    subscribed
                      ? "bg-white text-black hover:bg-zinc-200"
                      : "bg-red-600 text-white hover:bg-red-500"
                  }`}
                >
                  {subscribed ? "Subscribed" : "Subscribe"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Uploads */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-white">Uploads</h2>
            <p className="mt-1 text-sm text-zinc-400">Videos uploaded by this channel</p>
          </div>
          {profile.uploads?.length ? (
            <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {profile.uploads.map((video) => (
                <VideoCard key={video._id} video={{ ...video, ownerDetails: profile }} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center text-zinc-400">
              No uploads yet.
            </div>
          )}
        </section>

        {/* Subscriber management — own channel only */}
        {isOwnChannel && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Subscriber management</h2>
                <p className="mt-1 text-sm text-zinc-400">Manage users who follow your channel</p>
              </div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                <ShieldCheck size={16} />
                Owner only
              </div>
            </div>

            {subscriberError && (
              <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                {subscriberError}
              </div>
            )}

            {subscriberLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-2xl bg-zinc-800" />
                ))}
              </div>
            ) : subscriberList.length > 0 ? (
              <div className="space-y-3">
                {subscriberList.map((item) => {
                  const subscriber = item.Subscriber_detail || item.subscriber_info || {};
                  const userId = String(item.subscriber || subscriber._id || "");
                  const isBlocked = item.status === "Blocked";
                  const busy = subscriberActionId === userId;
                  return (
                    <div
                      key={userId}
                      className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <Link
                        to={`/channel/${subscriber.username}`}
                        className="flex min-w-0 items-center gap-4"
                      >
                        <img
                          src={subscriber.avatar || "https://via.placeholder.com/200"}
                          alt={subscriber.username || "subscriber"}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">
                            @{subscriber.username || "user"}
                          </p>
                          <p className="truncate text-sm text-zinc-400">
                            {subscriber.fullname || "Subscriber"}
                          </p>
                        </div>
                      </Link>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                            isBlocked
                              ? "bg-red-500/20 text-red-300"
                              : "bg-green-500/20 text-green-300"
                          }`}
                        >
                          {isBlocked ? <Ban size={12} /> : <ShieldAlert size={12} />}
                          {item.status || "Active"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSubscriberAction(userId, "remove")}
                          disabled={busy}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <UserMinus size={14} />
                          Remove
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleSubscriberAction(userId, isBlocked ? "unblock" : "block")
                          }
                          disabled={busy}
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            isBlocked
                              ? "border border-white/10 text-white hover:bg-white/5"
                              : "bg-red-600 text-white hover:bg-red-500"
                          }`}
                        >
                          {isBlocked ? <ShieldCheck size={14} /> : <Ban size={14} />}
                          {isBlocked ? "Unblock" : "Block"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-zinc-400">
                No subscribers yet.
              </div>
            )}
          </section>
        )}

        {/* Channel details */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-bold text-white">Channel details</h3>
          <div className="mt-4 grid gap-4 text-sm text-zinc-400 md:grid-cols-2">
            <div>
              <p className="text-zinc-500">Email</p>
              <p className="mt-1 text-white">{profile.email || "Hidden"}</p>
            </div>
            <div>
              <p className="text-zinc-500">Channel ID</p>
              <p className="mt-1 break-all text-white">{profile._id}</p>
            </div>
          </div>
          <div className="mt-6">
            <Link to="/" className="text-sm font-medium text-blue-400 hover:underline">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

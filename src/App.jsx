import React, { useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Loader2, Volume2, VolumeX } from "lucide-react";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import UploadModal from "./components/UploadModal.jsx";
import Home from "./pages/Home.jsx";
import VideoPlayer from "./pages/VideoPlayer.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Profile from "./pages/Profile.jsx";
import History from "./pages/History.jsx";
import LikedVideos from "./pages/LikedVideos.jsx";
import TweetsFeed from "./pages/TweetsFeed.jsx";
import Collections from "./pages/Collections.jsx";
import PlaylistDetail from "./pages/PlaylistDetail.jsx";
import Trending from "./pages/Trending.jsx";
import CreatorStudio from "./pages/CreatorStudio.jsx";
import SubscribedFeed from "./pages/SubscribedFeed.jsx";
import UpdateChannel from "./pages/UpdateChannel.jsx";

const AUTH_VIDEO_SOURCE =
  "https://cdn.builder.io/o/assets%2F153ab118d3004293965336a4bd2a5954%2F8b5a80af4c974af099f3a8217fd5584c?alt=media&token=b8e6cdf5-81c8-4d63-b976-9024e6173622&apiKey=153ab118d3004293965336a4bd2a5954";
const AUTH_PATHS = new Set(["/login", "/register"]);
const DEFAULT_AUTH_VIDEO_VOLUME = 18;

const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";
  const savedTheme = window.localStorage.getItem("cracked-tube-theme");
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

const AppLayout = ({
  user,
  sidebarOpen,
  uploadOpen,
  setUploadOpen,
  toggleSidebar,
  theme,
  toggleTheme,
  routes,
  refreshFeed,
}) => {
  const location = useLocation();
  const authVideoRef = useRef(null);
  const [authVideoMuted, setAuthVideoMuted] = useState(true);
  const [authVideoVolume, setAuthVideoVolume] = useState(DEFAULT_AUTH_VIDEO_VOLUME);
  const isAuthRoute = AUTH_PATHS.has(location.pathname);

  useEffect(() => {
    const video = authVideoRef.current;
    if (!video) return;

    video.volume = authVideoVolume / 100;
    video.muted = authVideoMuted;
  }, [authVideoMuted, authVideoVolume, isAuthRoute]);

  useEffect(() => {
    if (!isAuthRoute) return;

    const video = authVideoRef.current;
    if (!video) return;

    const playPromise = video.play();
    if (typeof playPromise?.catch === "function") {
      playPromise.catch(() => {});
    }
  }, [isAuthRoute, location.pathname]);

  const handleAuthVideoToggle = () => {
    setAuthVideoMuted((currentMuted) => {
      if (currentMuted && authVideoVolume === 0) {
        setAuthVideoVolume(DEFAULT_AUTH_VIDEO_VOLUME);
      }
      return !currentMuted;
    });
  };

  const handleAuthVideoVolumeChange = (event) => {
    const nextVolume = Number(event.target.value);
    setAuthVideoVolume(nextVolume);
    setAuthVideoMuted(nextVolume === 0);
  };

  const routeElements = (
    <Routes>
      <Route path="/" element={routes.home} />
      <Route path="/search" element={routes.home} />
      <Route path="/trending" element={<Trending />} />
      <Route path="/subscribed" element={user ? <SubscribedFeed /> : <Navigate to="/login" replace />} />
      <Route path="/video/:videoId" element={<VideoPlayer />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
      <Route path="/verify/:token" element={<VerifyEmail />} />
      <Route path="/tweets" element={user ? <TweetsFeed /> : <Navigate to="/login" replace />} />
      <Route path="/history" element={user ? <History /> : <Navigate to="/login" replace />} />
      <Route path="/liked-videos" element={user ? <LikedVideos /> : <Navigate to="/login" replace />} />
      <Route path="/collections" element={user ? <Collections /> : <Navigate to="/login" replace />} />
      <Route path="/playlist/:playlistId" element={user ? <PlaylistDetail /> : <Navigate to="/login" replace />} />
      <Route path="/studio" element={user ? <CreatorStudio /> : <Navigate to="/login" replace />} />
      <Route
        path="/profile"
        element={user ? <Navigate to={`/channel/${user.username}`} replace /> : <Navigate to="/login" replace />}
      />
      <Route path="/channel/edit" element={user ? <UpdateChannel /> : <Navigate to="/login" replace />} />
      <Route path="/channel/:username" element={user ? <Profile /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  if (isAuthRoute) {
    const isSilent = authVideoMuted || authVideoVolume === 0;

    return (
      <div className="auth-scene text-white">
        <video
          ref={authVideoRef}
          className="auth-scene__video"
          autoPlay
          loop
          muted={authVideoMuted}
          playsInline
          preload="auto"
        >
          <source src={AUTH_VIDEO_SOURCE} type="video/mp4" />
        </video>
        <div className="auth-scene__veil" aria-hidden="true" />

        <main className="auth-scene__content">{routeElements}</main>

        <div className="auth-scene__controls">
          <div className="auth-video-controls app-border flex items-center gap-3 rounded-full border border-white/10 px-4 py-2 text-sm text-white">
            <button
              type="button"
              onClick={handleAuthVideoToggle}
              className="app-soft-hover rounded-full p-2 transition hover:bg-white/10"
              aria-label={isSilent ? "Turn on background video sound" : "Mute background video sound"}
            >
              {isSilent ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-white/70 sm:block">Ambience</span>

            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={authVideoVolume}
              onChange={handleAuthVideoVolumeChange}
              className="auth-video-controls__slider"
              aria-label="Background video volume"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen bg-[#0f0f0f] text-white">
      <Navbar
        onMenuClick={toggleSidebar}
        onUploadClick={() => setUploadOpen(true)}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      <div className="flex pt-16">
        <aside
          className={`app-shell app-border fixed bottom-0 left-0 top-16 z-40 hidden border-r border-white/10 bg-[#0f0f0f] transition-all duration-300 sm:block ${
            sidebarOpen ? "w-64" : "w-20"
          }`}
        >
          <Sidebar isCollapsed={!sidebarOpen} />
        </aside>

        <main
          className={`min-h-[calc(100vh-4rem)] flex-1 transition-all duration-300 ${
            sidebarOpen ? "sm:ml-64" : "sm:ml-20"
          }`}
        >
          {routeElements}
        </main>
      </div>

      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={refreshFeed} />
    </div>
  );
};

const App = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [theme, setTheme] = useState(getInitialTheme);

  const toggleSidebar = () => setSidebarOpen((open) => !open);
  const refreshFeed = () => setFeedRefreshKey((value) => value + 1);
  const toggleTheme = () => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("cracked-tube-theme", theme);
  }, [theme]);

  const routes = useMemo(() => ({ home: <Home refreshKey={feedRefreshKey} /> }), [feedRefreshKey]);

  if (loading) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center bg-[#0f0f0f]">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppLayout
        user={user}
        sidebarOpen={sidebarOpen}
        uploadOpen={uploadOpen}
        setUploadOpen={setUploadOpen}
        toggleSidebar={toggleSidebar}
        theme={theme}
        toggleTheme={toggleTheme}
        routes={routes}
        refreshFeed={refreshFeed}
      />
    </BrowserRouter>
  );
};

export default App;

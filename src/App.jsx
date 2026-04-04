import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
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

const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";
  const savedTheme = window.localStorage.getItem("cracked-tube-theme");
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

const App = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [theme, setTheme] = useState(getInitialTheme);

  const toggleSidebar = () => setSidebarOpen((open) => !open);
  const refreshFeed = () => setFeedRefreshKey((v) => v + 1);
  const toggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("cracked-tube-theme", theme);
  }, [theme]);

  const routes = useMemo(
    () => ({ home: <Home refreshKey={feedRefreshKey} /> }),
    [feedRefreshKey],
  );

  if (loading) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center bg-[#0f0f0f]">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  return (
    <BrowserRouter>
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
            <Routes>
              <Route path="/" element={routes.home} />
              <Route path="/search" element={routes.home} />
              <Route path="/trending" element={<Trending />} />
              <Route
                path="/subscribed"
                element={user ? <SubscribedFeed /> : <Navigate to="/login" replace />}
              />
              <Route path="/video/:videoId" element={<VideoPlayer />} />
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
              <Route
                path="/register"
                element={!user ? <Register /> : <Navigate to="/" replace />}
              />
              <Route path="/verify/:token" element={<VerifyEmail />} />
              <Route
                path="/tweets"
                element={user ? <TweetsFeed /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/history"
                element={user ? <History /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/liked-videos"
                element={user ? <LikedVideos /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/collections"
                element={user ? <Collections /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/playlist/:playlistId"
                element={user ? <PlaylistDetail /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/studio"
                element={user ? <CreatorStudio /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/profile"
                element={
                  user ? (
                    <Navigate to={`/channel/${user.username}`} replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              {/* /channel/edit must be declared BEFORE /channel/:username
                  so React Router matches the literal "edit" before treating
                  it as a username param */}
              <Route
                path="/channel/edit"
                element={user ? <UpdateChannel /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/channel/:username"
                element={user ? <Profile /> : <Navigate to="/login" replace />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        <UploadModal
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploaded={refreshFeed}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;

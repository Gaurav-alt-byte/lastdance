import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Check,
  ChevronLeft,
  ImagePlus,
  Loader2,
  Save,
  User,
  X,
} from "lucide-react";
import apiClient from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../utils/helpers.js";

/* ─────────────────────────────────────────────
   Helper: preview a File as a data-URL
───────────────────────────────────────────── */
const readFile = (file) =>
  new Promise((res) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target.result);
    r.readAsDataURL(file);
  });

/* ─────────────────────────────────────────────
   Inline field wrapper
───────────────────────────────────────────── */
const Field = ({ label, id, children, hint }) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-zinc-600">{hint}</p>}
  </div>
);

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
const UpdateChannel = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // Account details
  const [fullname, setFullname] = useState(user?.fullname || "");
  const [email, setEmail] = useState(user?.email || "");

  // Avatar
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const avatarRef = useRef();

  // Cover image
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(user?.cover_image || "");
  const coverRef = useRef();

  // Password
  // Backend controller: changecurrentpassword expects { oldpassword, newPassword }
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [saving, setSaving] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingCover, setSavingCover] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const flash = (msg, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  /* ── Pick avatar ── */
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(await readFile(file));
  };

  /* ── Pick cover ── */
  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(await readFile(file));
  };

  /* ── Save account details ──
     PATCH /api/v1/users/Update-details  { fullname, email }
     Response: { statusCode, message, data: updatedUser }
  ── */
  const handleSaveDetails = async () => {
    if (!fullname.trim() || !email.trim()) {
      flash("Full name and email cannot be empty.", true);
      return;
    }
    setSaving(true);
    try {
      const res = await apiClient.patch("/users/Update-details", { fullname, email });
      const updated = res.data?.data;
      if (setUser) {
        setUser((prev) => ({
          ...prev,
          fullname: updated?.fullname || fullname,
          email: updated?.email || email,
        }));
      }
      flash("Account details updated successfully.");
    } catch (err) {
      flash(getErrorMessage(err), true);
    } finally {
      setSaving(false);
    }
  };

  /* ── Upload avatar ──
     PATCH /api/v1/users/change-avatar  multipart field: newAvatar
     Response: { statusCode, message, data: updatedUser }
  ── */
  const handleSaveAvatar = async () => {
    if (!avatarFile) return;
    setSavingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("newAvatar", avatarFile); // must match multer field name
      const res = await apiClient.patch("/users/change-avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newUrl = res.data?.data?.avatar || avatarPreview;
      if (setUser) setUser((prev) => ({ ...prev, avatar: newUrl }));
      setAvatarFile(null);
      flash("Avatar updated successfully.");
    } catch (err) {
      flash(getErrorMessage(err), true);
    } finally {
      setSavingAvatar(false);
    }
  };

  /* ── Upload cover ──
     PATCH /api/v1/users/change-cover-image  multipart field: newCover
     Response: { statusCode, message, data: updatedUser }
  ── */
  const handleSaveCover = async () => {
    if (!coverFile) return;
    setSavingCover(true);
    try {
      const fd = new FormData();
      fd.append("newCover", coverFile); // must match multer field name
      const res = await apiClient.patch("/users/change-cover-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newUrl = res.data?.data?.cover_image || coverPreview;
      if (setUser) setUser((prev) => ({ ...prev, cover_image: newUrl }));
      setCoverFile(null);
      flash("Cover image updated successfully.");
    } catch (err) {
      flash(getErrorMessage(err), true);
    } finally {
      setSavingCover(false);
    }
  };

  /* ── Change password ──
     POST /api/v1/users/change-password  { oldpassword, newPassword }
     NOTE: backend controller reads req.body.oldpassword (lowercase 'p')
  ── */
  const handleSavePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      flash("All password fields are required.", true);
      return;
    }
    if (newPassword !== confirmPassword) {
      flash("New passwords do not match.", true);
      return;
    }
    if (newPassword.length < 6) {
      flash("New password must be at least 6 characters.", true);
      return;
    }
    setSavingPassword(true);
    try {
      // Key name must be `oldpassword` (lowercase) to match controller: const {oldpassword, newPassword} = req.body
      await apiClient.post("/users/change-password", {
        oldpassword: oldPassword,
        newPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      flash("Password changed successfully.");
    } catch (err) {
      flash(getErrorMessage(err), true);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleBack = () => {
    if (user?.username) navigate(`/channel/${user.username}`);
    else navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 pb-24 pt-6 lg:px-10">
      <div className="mx-auto max-w-3xl space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Edit channel</h1>
            <p className="mt-0.5 text-sm text-zinc-500">
              Manage how your channel appears to others
            </p>
          </div>
        </div>

        {/* Flash messages */}
        {successMsg && (
          <div className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4 text-sm text-green-300">
            <Check size={16} />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
            <X size={16} />
            {errorMsg}
          </div>
        )}

        {/* ── CARD 1 — Images ── */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#121212]">
          {/* Cover */}
          <div className="relative h-36 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-900 sm:h-48">
            {coverPreview && (
              <img
                src={coverPreview}
                alt="cover preview"
                className="h-full w-full object-cover opacity-80"
              />
            )}
            <button
              type="button"
              onClick={() => coverRef.current?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 opacity-0 transition hover:opacity-100"
            >
              <ImagePlus size={28} className="text-white" />
              <span className="text-xs font-semibold text-white">Change cover</span>
            </button>
            <input
              ref={coverRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />
          </div>

          {/* Avatar + save buttons */}
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="relative -mt-16 shrink-0">
                <img
                  src={avatarPreview || "https://via.placeholder.com/200"}
                  alt="avatar preview"
                  className="h-28 w-28 rounded-full border-4 border-[#121212] object-cover"
                />
                <button
                  type="button"
                  onClick={() => avatarRef.current?.click()}
                  className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-white shadow-lg transition hover:bg-zinc-700"
                >
                  <Camera size={15} />
                </button>
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{user?.fullname || "Your Name"}</p>
                <p className="text-sm text-zinc-500">@{user?.username}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {avatarFile && (
                <button
                  type="button"
                  onClick={handleSaveAvatar}
                  disabled={savingAvatar}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
                >
                  {savingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Save avatar
                </button>
              )}
              {coverFile && (
                <button
                  type="button"
                  onClick={handleSaveCover}
                  disabled={savingCover}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
                >
                  {savingCover ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Save cover
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── CARD 2 — Account Details ── */}
        <div className="rounded-3xl border border-white/10 bg-[#121212] p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
              <User size={16} className="text-zinc-400" />
            </div>
            <div>
              <h2 className="font-bold text-white">Account details</h2>
              <p className="text-xs text-zinc-500">Update your display name and email</p>
            </div>
          </div>

          <div className="space-y-5">
            <Field label="Full name" id="fullname">
              <input
                id="fullname"
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-white/30"
              />
            </Field>

            <Field
              label="Email"
              id="email"
              hint="Changing your email will require re-verification."
            >
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-white/30"
              />
            </Field>

            <Field label="Username" id="username">
              <input
                id="username"
                type="text"
                value={user?.username || ""}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-sm text-zinc-600 outline-none"
              />
            </Field>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSaveDetails}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save changes
            </button>
          </div>
        </div>

        {/* ── CARD 3 — Change Password ── */}
        <div className="rounded-3xl border border-white/10 bg-[#121212] p-6">
          <div className="mb-6">
            <h2 className="font-bold text-white">Change password</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Leave blank if you don&apos;t want to change your password
            </p>
          </div>

          <div className="space-y-5">
            <Field label="Current password" id="oldPassword">
              <input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-white/30"
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="New password" id="newPassword">
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-white/30"
                />
              </Field>

              <Field label="Confirm new password" id="confirmPassword">
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-white/30"
                />
              </Field>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSavePassword}
              disabled={savingPassword}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
            >
              {savingPassword ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Update password
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UpdateChannel;

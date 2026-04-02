import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiMessage, getErrorMessage, isApiSuccess } from "../utils/helpers.js";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullname: "",
    password: "",
  });
  const [files, setFiles] = useState({
    avatar: null,
    cover_image: null,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Validation
    if (!files.avatar) {
      setError("Avatar is required. Please upload an image.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("fullname", formData.fullname);
    data.append("password", formData.password);
    data.append("avatar", files.avatar);
    if (files.cover_image) {
      data.append("cover_image", files.cover_image);
    }

    try {
      const response = await register(data);
      if (isApiSuccess(response)) {
        navigate("/login", {
          state: {
            message: "✓ Account created successfully! Check your inbox to verify your email before signing in.",
          },
        });
        return;
      }
      setError(getApiMessage(response, "Registration failed. Please try again."));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#121212] p-8 shadow-soft">
        <h1 className="text-center text-3xl font-bold text-white">Create account</h1>
        <p className="mt-2 text-center text-sm text-zinc-400">Join the CrackedTube community.</p>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              name="fullname"
              placeholder="Full name"
              value={formData.fullname}
              onChange={(event) => setFormData({ ...formData, fullname: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500"
              required
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={(event) => setFormData({ ...formData, username: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500"
              required
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-white"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label 
              className={`flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed px-4 py-4 text-sm transition ${
                files.avatar 
                  ? "border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20" 
                  : "border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              <span className="flex items-center gap-2 font-medium text-white">
                {files.avatar ? <CheckCircle size={18} className="text-green-500" /> : <Camera size={18} />}
                Avatar
              </span>
              <span className="truncate text-xs opacity-80">
                {files.avatar ? files.avatar.name : "Required"}
              </span>
              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={(event) => setFiles({ ...files, avatar: event.target.files?.[0] || null })}
                className="hidden"
                required
              />
            </label>

            <label 
              className={`flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed px-4 py-4 text-sm transition ${
                files.cover_image 
                  ? "border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20" 
                  : "border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              <span className="flex items-center gap-2 font-medium text-white">
                {files.cover_image ? <CheckCircle size={18} className="text-green-500" /> : <Camera size={18} />}
                Cover image
              </span>
              <span className="truncate text-xs opacity-80">
                {files.cover_image ? files.cover_image.name : "Optional"}
              </span>
              <input
                type="file"
                name="cover_image"
                accept="image/*"
                onChange={(event) => setFiles({ ...files, cover_image: event.target.files?.[0] || null })}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !files.avatar}
            className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3.5 font-semibold text-white shadow-lg transition duration-200 hover:from-blue-500 hover:to-blue-400 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-500 disabled:shadow-none"
          >
            {loading ? <Loader2 className="mr-2 animate-spin" size={18} /> : null}
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};
export default Register;

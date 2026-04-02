import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Validation
    if (!formData.emailOrUsername.trim()) {
      setError("Username or email is required.");
      return;
    }

    if (!formData.password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);

    const payload = {
      password: formData.password,
    };

    if (formData.emailOrUsername.includes("@")) {
      payload.email = formData.emailOrUsername;
    } else {
      payload.username = formData.emailOrUsername;
    }

    const result = await login(payload);

    if (result.success) {
      navigate("/");
      return;
    }

    setError(result.message || "Invalid credentials. Please try again.");
    setLoading(false);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#121212] p-8 shadow-soft">
        <h1 className="text-center text-3xl font-bold text-white">Welcome back</h1>
        <p className="mt-2 text-center text-sm text-zinc-400">Sign in to continue to CrackedTube.</p>

        {location.state?.message && !error && (
          <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            ✓ {location.state.message}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Username or email"
            value={formData.emailOrUsername}
            onChange={(event) => setFormData({ ...formData, emailOrUsername: event.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
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

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3.5 font-semibold text-white shadow-lg transition duration-200 hover:from-blue-500 hover:to-blue-400 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-500 disabled:shadow-none"
          >
            {loading ? <Loader2 className="mr-2 animate-spin" size={18} /> : null}
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          New to CrackedTube?{" "}
          <Link to="/register" className="font-medium text-blue-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

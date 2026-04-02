import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import apiClient from "../api/axios.js";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("We are verifying your email address.");

  useEffect(() => {
    const verifyEmailAddress = async () => {
      if (!token) {
        setStatus("error");
        setMessage("The verification link is incomplete.");
        return;
      }

      try {
        const response = await apiClient.get(`/verify/${token}`);
        setStatus("success");
        setMessage(response.message || "Your email has been verified. You can now sign in.");
      } catch (error) {
        setStatus("error");
        setMessage(error || "This verification link is invalid or has expired.");
      }
    };

    verifyEmailAddress();
  }, [token]);

  const statusIcon =
    status === "loading" ? (
      <Loader2 className="animate-spin text-blue-500" size={30} />
    ) : status === "success" ? (
      <CheckCircle2 className="text-green-500" size={30} />
    ) : (
      <XCircle className="text-red-500" size={30} />
    );

  const statusTitle =
    status === "loading"
      ? "Verifying email"
      : status === "success"
        ? "Email verified"
        : "Verification failed";

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="app-surface app-border w-full max-w-md rounded-3xl border border-white/10 bg-[#121212] p-8 text-center shadow-soft">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
          {statusIcon}
        </div>

        <h1 className="app-text-primary mt-6 text-3xl font-bold text-white">{statusTitle}</h1>
        <p className="app-text-secondary mt-3 text-sm leading-6 text-zinc-400">{message}</p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            to="/login"
            className="rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Go to login
          </Link>
          <Link
            to="/"
            className="app-border app-soft-surface app-soft-hover app-text-primary rounded-2xl border border-white/10 px-4 py-3 font-semibold text-white transition hover:bg-white/5"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

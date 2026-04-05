// import React, { useEffect, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import { CheckCircle2, Loader2, XCircle } from "lucide-react";
// import apiClient from "../api/axios.js";

// const VerifyEmail = () => {
//   const { token } = useParams();
//   const [status, setStatus] = useState("loading");
//   const [message, setMessage] = useState("We are verifying your email address.");

//   useEffect(() => {
//     const verifyEmailAddress = async () => {
//       if (!token) {
//         setStatus("error");
//         setMessage("The verification link is incomplete.");
//         return;
//       }

//       try {
//         const response = await apiClient.get(`/users/verify/${token}`);
//         // Backend has typo: "sucess" instead of "success"
//         const isSuccess = response?.success || response?.sucess;

//         if (isSuccess) {
//           setStatus("success");
//           setMessage(response.message || "Your email has been verified successfully! You can now sign in.");
//         } else {
//           setStatus("error");
//           setMessage(response?.message || "Email verification failed. Please try again.");
//         }
//       } catch (error) {
//         setStatus("error");
//         const errorMsg = typeof error === "string" ? error : error?.message || "This verification link is invalid or has expired.";
//         setMessage(errorMsg);
//       }
//     };

//     verifyEmailAddress();
//   }, [token]);

//   const statusIcon =
//     status === "loading" ? (
//       <Loader2 className="animate-spin text-blue-500" size={30} />
//     ) : status === "success" ? (
//       <CheckCircle2 className="text-green-500" size={30} />
//     ) : (
//       <XCircle className="text-red-500" size={30} />
//     );

//   const statusTitle =
//     status === "loading"
//       ? "Verifying email"
//       : status === "success"
//         ? "Email verified"
//         : "Verification failed";

//   return (
//     <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
//       <div className="app-surface app-border w-full max-w-md rounded-3xl border border-white/10 bg-[#121212] p-8 text-center shadow-soft">
//         <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
//           {statusIcon}
//         </div>

//         <h1 className="app-text-primary mt-6 text-3xl font-bold text-white">{statusTitle}</h1>
//         <p className="app-text-secondary mt-3 text-sm leading-6 text-zinc-400">{message}</p>

//         <div className="mt-8 flex flex-col gap-3">
//           <Link
//             to="/login"
//             className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 font-semibold text-white shadow-lg transition duration-200 hover:from-blue-500 hover:to-blue-400 hover:shadow-blue-500/30"
//           >
//             Go to login
//           </Link>
//           <Link
//             to="/"
//             className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition duration-200 hover:border-white/30 hover:bg-white/10"
//           >
//             Back to home
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VerifyEmail;
import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import apiClient from "../api/axios.js";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("We are verifying your email address.");
  // Use a ref to track if the request has already been sent
  const hasCalled = useRef(false);

  useEffect(() => {
    const verifyEmailAddress = async () => {
      // Prevent double execution in React StrictMode
      if (!token || hasCalled.current) return;
      
      hasCalled.current = true;

      try {
        // Ensure path includes the 'users' prefix to match backend mounting
        const response = await apiClient.get(`/users/verify/${token}`);
        
        // Backend typo fallback
        const isSuccess = response?.success || response?.sucess;

        if (isSuccess) {
          setStatus("success");
          setMessage(response.message || "Your email has been verified successfully! You can now sign in.");
        } else {
          setStatus("error");
          setMessage(response?.message || "Email verification failed. Please try again.");
        }
      } catch (error) {
        setStatus("error");
        // Extract exact backend error message formatted by your Global Error Handler
        const errorMsg = 
          error?.response?.data?.message || 
          error?.message || 
          "This verification link is invalid or has expired.";
        setMessage(errorMsg);
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
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#121212] p-8 text-center shadow-soft">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
          {statusIcon}
        </div>

        <h1 className="mt-6 text-3xl font-bold text-white">{statusTitle}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">{message}</p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            to="/login"
            className="rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Go to login
          </Link>
          <Link
            to="/"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
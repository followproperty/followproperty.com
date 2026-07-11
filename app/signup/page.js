"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/layout/AuthLayout";
import { signupWithPhone } from "@/services/auth-service";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/context/ToastContext";

const toTitleCase = (str) => {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

function SignupForm() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuilder = searchParams.get("role") === "builder";

  // Polling loop to check SMS verification status
  useEffect(() => {
    if (!isVerifying || !requestId) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/status?requestId=${requestId}`);
        const data = await res.json();
        
        if (data.success && data.data.verified) {
          clearInterval(intervalId);
          console.log("[Signup] Phone verified successfully! Creating session...");
          
          // Sign in using the mock email and password
          const mockEmail = `${phone.trim().replace(/\+/g, '')}@phone.com`;
          const userCredential = await signInWithEmailAndPassword(auth, mockEmail, password);
          const idToken = await userCredential.user.getIdToken();
          
          // Verify with local server to establish session cookies
          const verifyRes = await fetch("/api/auth/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: idToken }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            showToast("Phone verified! Logged in successfully.", "success", "Welcome");
            router.push("/dashboard");
          } else {
            setError(verifyData.message || "Failed to create session.");
            showToast(verifyData.message || "Session error.", "error", "Error");
          }
        }
      } catch (pollError) {
        console.error("[Signup] Error polling verification status:", pollError);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(intervalId);
  }, [isVerifying, requestId, phone, password, router, showToast]);

  const handleOpenSmsApp = () => {
    const gatewayNumber = "+916393682521";
    const message = `VERIFY ${requestId}`;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    const url = `sms:${gatewayNumber}${separator}body=${encodeURIComponent(message)}`;
    window.location.href = url;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      showToast("Passwords do not match.", "error", "Action Required");
      return;
    }

    // Phone validation
    if (!/^\+?[1-9]\d{1,14}$/.test(phone.trim())) {
      setError("Please enter a valid phone number (with country code, e.g. +919999999999).");
      showToast("Invalid phone number format.", "error", "Action Required");
      return;
    }

    setLoading(true);

    try {
      const res = await signupWithPhone(phone.trim(), password);

      if (res.success) {
        setRequestId(res.requestId);
        setIsVerifying(true);
        showToast("Account created! Please verify your phone number to login.", "success", "Verify Phone");
      } else {
        setError(res.message || "Failed to create account.");
        showToast(res.message || "Failed to create account.", "error", "Action Required");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      showToast("An unexpected error occurred. Please try again.", "error", "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[480px] py-4">
        {isVerifying ? (
          <div className="text-center py-10 px-6 bg-brand-blue/5 rounded-2xl border border-brand-blue/10 animate-in fade-in zoom-in-95 duration-300 shadow-sm">
            <div className="w-16 h-16 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-brand-navy mb-3 tracking-[-0.01em]">Verify Your Phone</h3>
            <p className="text-brand-slate text-[15px] leading-relaxed mb-6">
              Click the button below to send the verification SMS from your phone number <strong>{phone}</strong>.
            </p>
            
            <button 
              type="button"
              onClick={handleOpenSmsApp}
              className="btn-primary w-full py-3.5 text-[15px] font-semibold rounded-lg shadow-sm hover:shadow-md transition-all mb-4 cursor-pointer"
            >
              Verify Phone via SMS
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-brand-slate mt-2 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Waiting for verification SMS...
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-brand-navy mb-2 tracking-[-0.02em]">
                {isBuilder ? "Create Builder Account" : "Create Account"}
              </h2>
              <p className="text-brand-slate text-[15px]">
                {isBuilder
                  ? "Join FollowProperty to manage your profile and list projects."
                  : "Join FollowProperty to start tracking your portfolio."}
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-[10px] bg-red-50 border border-red-200 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                  Phone Number <span className="text-brand-blue">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919999999999"
                  disabled={loading}
                  required
                  className="form-input text-[14px] disabled:opacity-50"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                  Password <span className="text-brand-blue">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    required
                    className="form-input pl-4 pr-11 text-[14px] disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-slate-light hover:text-brand-navy transition-colors focus:outline-none p-1.5 rounded-md disabled:opacity-50 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                  Confirm Password <span className="text-brand-blue">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    required
                    className="form-input pl-4 pr-11 text-[14px] disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-slate-light hover:text-brand-navy transition-colors focus:outline-none p-1.5 rounded-md disabled:opacity-50 cursor-pointer"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-[15px] mt-4 disabled:opacity-75 disabled:transform-none disabled:shadow-none"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white mx-auto" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="text-center mt-6 text-[14px] text-brand-slate">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-brand-navy hover:text-brand-blue transition-colors">
                Login
              </Link>
            </p>
          </>
        )}
      </div>

    </AuthLayout>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

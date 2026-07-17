"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/layout/AuthLayout";
import { signupWithEmail } from "@/services/auth-service";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/context/ToastContext";

function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuilder = searchParams.get("role") === "builder";

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      showToast("Passwords do not match.", "error", "Action Required");
      return;
    }

    setLoading(true);

    try {
      const profileData = {
        firstName: "",
        lastName: "",
        phoneNumber: "",
        city: "",
        state: "",
        isBuilder: isBuilder,
      };
      
      const result = await signupWithEmail(email, password, profileData);
      if (result.success && result.requiresVerification) {
        const msg = result.message || "Verification email sent. Please verify your email before login.";
        setSuccessMessage(msg);
        showToast(msg, "success", "Verification Sent");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else if (result.success) {
        router.push("/dashboard");
      } else {
        // Human-friendly Firebase error messages
        let message = result.message || "Failed to create account";
        if (message.includes("auth/email-already-in-use")) {
          message = "This email is already in use. Please use a different one or login.";
        } else if (message.includes("auth/weak-password")) {
          message = "Password should be at least 6 characters long.";
        } else if (message.includes("auth/invalid-email")) {
          message = "Please enter a valid email address.";
        }
        setError(message);
        showToast(message, "error", "Action Required");
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
        {successMessage ? (
          <div className="text-center py-10 px-6 bg-emerald-50/40 rounded-2xl border border-emerald-100/80 animate-in fade-in zoom-in-95 duration-300 shadow-sm">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-brand-navy mb-3 tracking-[-0.01em]">Thank You!</h3>
            <p className="text-brand-slate text-[15px] leading-relaxed mb-8">
              {successMessage}
            </p>
            <Link href="/" className="btn-primary inline-block px-8 py-3 text-[14px] font-semibold rounded-lg shadow-sm hover:shadow-md transition-all">
              Go to Homepage
            </Link>
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
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                  Email Address <span className="text-brand-blue">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@example.com"
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/layout/AuthLayout";
import { loginWithEmail } from "@/services/auth-service";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginWithEmail(email, password);
      if (result.success) {
        const user = result.verification?.user;
        if (user && !user.isOnboarded) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      } else {
        // Human-friendly Firebase error messages
        let message = result.message || "Failed to login";
        if (message.includes("auth/invalid-credential") || message.includes("auth/user-not-found") || message.includes("auth/wrong-password")) {
          message = "Invalid email or password. Please try again.";
        } else if (message.includes("auth/invalid-email")) {
          message = "Please enter a valid email address.";
        }
        setError(message);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[400px]">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-brand-navy mb-2 tracking-[-0.02em]">Welcome back</h2>
          <p className="text-brand-slate text-[15px]">
            Login to continue tracking your portfolio.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-[10px] bg-red-50 border border-red-200 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@email.com"
              disabled={loading}
              required
              className="w-full bg-white border border-brand-borderMid rounded-[10px] px-4 py-3 text-[15px] text-brand-navy placeholder:text-brand-slateLight focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-sm disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                required
                className="w-full bg-white border border-brand-borderMid rounded-[10px] pl-4 pr-11 py-3 text-[15px] text-brand-navy placeholder:text-brand-slateLight focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-sm disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-slateLight hover:text-brand-navy transition-colors focus:outline-none p-1.5 rounded-md disabled:opacity-50 cursor-pointer"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center text-[15px] font-semibold text-white bg-gradient-to-br from-brand-amberLight to-[#EA580C] border-none py-3.5 rounded-[10px] shadow-[0_2px_12px_rgba(217,119,6,0.28)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-brand-amber mt-2 disabled:opacity-75 disabled:transform-none disabled:shadow-none cursor-pointer"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-[14px] text-brand-slate">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-brand-navy hover:text-brand-amber transition-colors">
            Create Account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

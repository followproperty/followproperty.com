"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/layout/AuthLayout";
import { signupWithEmail } from "@/services/auth-service";
import { Eye, EyeOff } from "lucide-react";
import { statesList, indiaStatesCities } from "@/constants/indiaStatesCities";
import { motion, AnimatePresence } from "framer-motion";

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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [isManualCity, setIsManualCity] = useState(false);
  const [customCity, setCustomCity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuilder = searchParams.get("role") === "builder";

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const finalCity = isManualCity ? customCity : city;

      const profileData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        city: toTitleCase(finalCity),
        state: toTitleCase(state),
        isBuilder: isBuilder,
      };
      
      const result = await signupWithEmail(email, password, profileData);
      if (result.success && result.requiresVerification) {
        const msg = result.message || "Verification email sent. Please verify your email before login.";
        setSuccessMessage(msg);
        setToast({ message: msg, type: "success" });
        setFirstName("");
        setLastName("");
        setPhoneNumber("");
        setCity("");
        setCustomCity("");
        setIsManualCity(false);
        setState("");
        setEmail("");
        setPassword("");
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
        setToast({ message, type: "error" });
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[480px] py-4">
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

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-200">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                First Name <span className="text-brand-blue">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                disabled={loading}
                required
                className="form-input text-[14px] disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                Last Name <span className="text-brand-blue">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                disabled={loading}
                required
                className="form-input text-[14px] disabled:opacity-50"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
              Phone Number <span className="text-brand-blue">*</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 99999 99999"
              disabled={loading}
              required
              className="form-input text-[14px] disabled:opacity-50"
            />
          </div>

          {/* State & City Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                State <span className="text-brand-blue">*</span>
              </label>
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setCity(""); // Reset city when state changes
                }}
                disabled={loading}
                required
                className="form-input text-[14px] disabled:opacity-50 appearance-none bg-no-repeat bg-[right_16px_center] cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C97A8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                }}
              >
                <option value="">Select State</option>
                {statesList.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider">
                  City <span className="text-brand-blue">*</span>
                </label>
                {isManualCity && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualCity(false);
                      setCustomCity("");
                    }}
                    className="text-[10px] text-brand-blue font-bold cursor-pointer hover:underline bg-transparent border-none p-0 focus:outline-none"
                  >
                    ← Select from List
                  </button>
                )}
              </div>
              {isManualCity ? (
                <input
                  type="text"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder="e.g. Almora"
                  disabled={loading}
                  required
                  className="form-input text-[14px] disabled:opacity-50 animate-in fade-in duration-200"
                />
              ) : (
                <select
                  value={city}
                  onChange={(e) => {
                    if (e.target.value === "manual") {
                      setIsManualCity(true);
                      setCity("");
                    } else {
                      setCity(e.target.value);
                    }
                  }}
                  disabled={loading || !state}
                  required
                  className="form-input text-[14px] disabled:opacity-50 appearance-none bg-no-repeat bg-[right_16px_center] cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C97A8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  }}
                >
                  <option value="">
                    {state ? "Select City" : "Select State First"}
                  </option>
                  {state &&
                    indiaStatesCities[state]?.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct}
                      </option>
                    ))}
                  {state && (
                    <option value="manual">City not listed? Enter manually</option>
                  )}
                </select>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
              Email Address <span className="text-brand-blue">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@email.com"
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

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-[15px] mt-4 disabled:opacity-75 disabled:transform-none disabled:shadow-none"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
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
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-32px)] max-w-md p-4.5 rounded-2xl border shadow-xl flex items-start gap-3 bg-white ${
              toast.type === "success" 
                ? "border-emerald-100 bg-emerald-50/95 text-emerald-800" 
                : "border-red-100 bg-red-50/95 text-red-800"
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${
              toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
            }`}>
              {toast.type === "success" ? "✓" : "!"}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5 m-0 text-inherit">
                {toast.type === "success" ? "Verification Sent" : "Action Required"}
              </h4>
              <p className="text-xs leading-relaxed font-medium m-0 opacity-90 break-words">
                {toast.message}
              </p>
            </div>
            <button 
              type="button" 
              onClick={() => setToast(null)}
              className="bg-transparent border-none text-[11px] font-bold text-inherit hover:opacity-75 cursor-pointer self-start py-0.5 px-1.5 focus:outline-none"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
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

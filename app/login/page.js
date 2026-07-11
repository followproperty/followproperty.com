"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/layout/AuthLayout";
import { loginWithEmail } from "@/services/auth-service";
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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Multi-step profile form state
  const [step, setStep] = useState("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");
  const [annualFamilyIncome, setAnnualFamilyIncome] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [isManualCity, setIsManualCity] = useState(false);
  const [customCity, setCustomCity] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginWithEmail(email, password);
      if (result.success) {
        const user = result.verification?.user;
        const status = user?.builderApplicationStatus;
        if (status === "draft" || status === "rejected") {
          router.push("/builder-register");
        } else if (status === "pending") {
          router.push("/builder-application-status");
        } else if (status === "approved") {
          router.push("/builder-dashboard");
        } else if (user && !user.isOnboarded) {
          // Instead of redirecting and page reloading, transition state to profile form in-place
          setStep("profile");
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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileLoading(true);

    const finalCity = isManualCity ? customCity : city;

    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim() || !age || !gender || !occupation || !annualFamilyIncome || !state || !finalCity.trim()) {
      setProfileError("Please fill in all required fields.");
      setProfileLoading(false);
      return;
    }

    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        age: Number(age),
        gender,
        occupation,
        annualFamilyIncome,
        state: toTitleCase(state),
        city: toTitleCase(finalCity)
      };

      const res = await fetch("/api/auth/onboard", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save profile details");
      }

      const resData = await res.json();
      if (resData.success) {
        // Redirect to onboarding page (which will now display the goal selection cards)
        router.push("/onboarding");
      } else {
        throw new Error(resData.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile submit error:", err);
      setProfileError(err.message || "Something went wrong while saving your details.");
    } finally {
      setProfileLoading(false);
    }
  };

  // Motion variants for clean slide transitions
  const loginVariants = {
    initial: { opacity: 0, x: 0 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -160 }
  };

  const profileVariants = {
    initial: { opacity: 0, x: 160 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 160 }
  };

  return (
    <AuthLayout>
      <div className={`w-full transition-all duration-350 ${step === "login" ? "max-w-[400px]" : "max-w-[520px]"}`}>
        <AnimatePresence mode="wait">
          {step === "login" ? (
            <motion.div
              key="login-view"
              variants={loginVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
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

              {/*
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-brand-navy mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    disabled={loading}
                    required
                    className="w-full bg-white border border-brand-border-mid rounded-[10px] px-4 py-3 text-[15px] text-brand-navy placeholder:text-brand-slate-light focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all shadow-sm disabled:opacity-50"
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
                      className="w-full bg-white border border-brand-border-mid rounded-[10px] pl-4 pr-11 py-3 text-[15px] text-brand-navy placeholder:text-brand-slate-light focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all shadow-sm disabled:opacity-50"
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
                  className="w-full flex items-center justify-center text-[15px] font-bold text-white bg-linear-to-r from-brand-navy-deep to-brand-navy-mid hover:from-[#121b2d] hover:to-brand-navy-deep border border-white/5 py-3.5 rounded-[10px] shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_8px_30px_rgba(50,95,236,0.12)] hover:border-brand-blue-border mt-2 disabled:opacity-75 disabled:transform-none disabled:shadow-none cursor-pointer"
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
              */}

              <div className="p-4 rounded-[10px] bg-amber-50/60 border border-amber-200 text-amber-800 text-[14px] font-medium text-center leading-relaxed">
                Login is temporarily disabled.
              </div>

              {/*
              <p className="text-center mt-8 text-[14px] text-brand-slate">
                New here?{" "}
                <Link href="/signup" className="font-semibold text-brand-navy hover:text-brand-blue transition-colors">
                  Create Account
                </Link>
              </p>
              */}
            </motion.div>
          ) : (
            <motion.div
              key="profile-view"
              variants={profileVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="py-4"
            >
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-brand-navy mb-2 tracking-[-0.02em]">
                  Complete Your Profile
                </h2>
                <p className="text-brand-slate text-[15px]">
                  Provide your details to personalize your real estate tracking experience.
                </p>
              </div>

              {profileError && (
                <div className="mb-5 p-3.5 rounded-[10px] bg-red-50 border border-red-200 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                  {profileError}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
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
                      disabled={profileLoading}
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
                      disabled={profileLoading}
                      required
                      className="form-input text-[14px] disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Email Address & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="form-input text-[14px] bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                      Phone Number <span className="text-brand-blue">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 99999 99999"
                      disabled={profileLoading}
                      required
                      className="form-input text-[14px] disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                      Age <span className="text-brand-blue">*</span>
                    </label>
                    <input
                      type="number"
                      min="18"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="28"
                      disabled={profileLoading}
                      required
                      className="form-input text-[14px] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                      Gender <span className="text-brand-blue">*</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      disabled={profileLoading}
                      required
                      className="form-input text-[14px] disabled:opacity-50 appearance-none bg-no-repeat bg-[right_16px_center] cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C97A8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                      }}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Occupation & Annual Family Income */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                      Occupation <span className="text-brand-blue">*</span>
                    </label>
                    <select
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      disabled={profileLoading}
                      required
                      className="form-input text-[14px] disabled:opacity-50 appearance-none bg-no-repeat bg-[right_16px_center] cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C97A8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                      }}
                    >
                      <option value="">Select Occupation</option>
                      <option value="Salaried Professional">Salaried Professional</option>
                      <option value="Self-Employed">Self-Employed</option>
                      <option value="Business Owner">Business Owner</option>
                      <option value="Retired">Retired</option>
                      <option value="Student">Student</option>
                      <option value="Homemaker">Homemaker</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                      Annual Family Income <span className="text-brand-blue">*</span>
                    </label>
                    <select
                      value={annualFamilyIncome}
                      onChange={(e) => setAnnualFamilyIncome(e.target.value)}
                      disabled={profileLoading}
                      required
                      className="form-input text-[14px] disabled:opacity-50 appearance-none bg-no-repeat bg-[right_16px_center] cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C97A8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                      }}
                    >
                      <option value="">Select Income Range</option>
                      <option value="Under ₹5 Lakhs">Under ₹5 Lakhs</option>
                      <option value="₹5 Lakhs - ₹10 Lakhs">₹5 Lakhs - ₹10 Lakhs</option>
                      <option value="₹10 Lakhs - ₹20 Lakhs">₹10 Lakhs - ₹20 Lakhs</option>
                      <option value="₹20 Lakhs - ₹50 Lakhs">₹20 Lakhs - ₹50 Lakhs</option>
                      <option value="₹50 Lakhs - ₹1 Crore">₹50 Lakhs - ₹1 Crore</option>
                      <option value="Above ₹1 Crore">Above ₹1 Crore</option>
                    </select>
                  </div>
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
                      disabled={profileLoading}
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
                        disabled={profileLoading}
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
                        disabled={profileLoading || !state}
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

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="btn-primary w-full py-3.5 text-[15px] mt-6 disabled:opacity-75"
                >
                  {profileLoading ? (
                    <svg className="animate-spin h-5 w-5 mx-auto text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    "Save & Continue"
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
}

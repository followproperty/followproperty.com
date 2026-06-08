"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Building2, Search, Sparkles } from "lucide-react";
import AuthLayout from "@/components/layout/AuthLayout";
import { statesList, indiaStatesCities } from "@/constants/indiaStatesCities";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "@/components/ui/Loading";

const toTitleCase = (str) => {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function Onboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [user, setUser] = useState(null);

  // Profile Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");
  const [annualFamilyIncome, setAnnualFamilyIncome] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [isManualCity, setIsManualCity] = useState(false);
  const [customCity, setCustomCity] = useState("");
  const [error, setError] = useState("");
  
  const [showGoalSelection, setShowGoalSelection] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const res = await fetch("/api/auth/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          });
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            setEmail(data.user.email || "");
            
            const status = data.user.builderApplicationStatus;
            if (status === "draft" || status === "rejected") {
              router.push("/builder-register");
              return;
            } else if (status === "pending") {
              router.push("/builder-application-status");
              return;
            } else if (status === "approved") {
              router.push("/builder-dashboard");
              return;
            }

            // Check if onboarding details form is already completed
            if (data.user.onboardingCompleted || data.user.isOnboarded) {
              setShowGoalSelection(true);
            }
          }
        } catch (e) {
          console.error("Error verifying in Onboarding page:", e);
        } finally {
          setVerifying(false);
        }
      } else {
        // Not authenticated
        setVerifying(false);
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const finalCity = isManualCity ? customCity : city;

    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim() || !age || !gender || !occupation || !annualFamilyIncome || !state || !finalCity.trim()) {
      setError("Please fill in all required fields.");
      setLoading(false);
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
        setShowGoalSelection(true);
      } else {
        throw new Error(resData.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile submit error:", err);
      setError(err.message || "Something went wrong while saving your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelection = async (option) => {
    try {
      setLoading(true);
      // Redirect based on selected path
      if (option === "track") {
        router.push("/portfolio");
      } else {
        router.push("/watchlist");
      }
    } catch (err) {
      console.error("Onboarding selection error:", err);
      if (option === "track") {
        router.push("/portfolio");
      } else {
        router.push("/watchlist");
      }
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return <Loading fullPage text="Verifying session..." />;
  }

  return (
    <AnimatePresence mode="wait">
      {!showGoalSelection ? (
        <motion.div
          key="profile-form"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="w-full"
        >
          <AuthLayout>
            <div className="w-full max-w-[520px] py-4">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-brand-navy mb-2 tracking-[-0.02em]">
                  Complete Your Profile
                </h2>
                <p className="text-brand-slate text-[15px]">
                  Provide your details to personalize your real estate tracking experience.
                </p>
              </div>

              {error && (
                <div className="mb-5 p-3.5 rounded-[10px] bg-red-50 border border-red-200 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                  {error}
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
                      disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading}
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

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 text-[15px] mt-6 disabled:opacity-75"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 mx-auto text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    "Save & Continue"
                  )}
                </button>
              </form>
            </div>
          </AuthLayout>
        </motion.div>
      ) : (
        <motion.div
          key="goal-cards"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="min-h-screen bg-brand-bg flex flex-col justify-center items-center p-4 sm:p-8 font-sans antialiased"
        >
          {/* Background glow effects */}
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-brand-blue-light/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Main Container */}
          <div className="w-full max-w-[680px] text-center relative z-10">
            {/* Logo / Header */}
            <div className="flex items-center justify-center gap-2 no-underline mb-6">
              <img src="/favicon.svg" alt="FollowProperty Logo" className="w-9 h-9 object-contain" />
              <span className="font-extrabold text-[22px] text-brand-navy tracking-[-0.03em]">
                FollowProperty
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy mb-3 tracking-tight">
              How would you like to start?
            </h1>
            <p className="text-sm sm:text-base text-brand-slate max-w-[480px] mx-auto mb-10 leading-relaxed">
              Tell us your primary real estate goal to customize your dashboard with personalized analytics, rates, and alerts.
            </p>

            {/* Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              
              {/* Card 1: Track My Properties */}
              <div 
                onClick={() => !loading && handleSelection("track")}
                className="group relative bg-brand-bg-card rounded-2xl border border-brand-border p-6 shadow-brand hover:-translate-y-1 hover:shadow-brand-md transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-brand-amber-bg border border-brand-amber-border flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105">
                    <Building2 className="text-brand-amber" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-brand-navy mb-2 flex items-center gap-1.5">
                    Track My Properties
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-slate leading-relaxed">
                    Add your owned real assets to track capital gains, market valuations, ongoing loans, and monthly rental yields.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-brand-amber group-hover:opacity-80 transition-opacity">
                  <span>Get Started →</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-brand-amber-bg text-brand-amber rounded-md border border-brand-amber-border">Portfolio</span>
                </div>
              </div>

              {/* Card 2: Looking To Buy */}
              <div 
                onClick={() => !loading && handleSelection("buy")}
                className="group relative bg-brand-bg-card rounded-2xl border border-brand-border p-6 shadow-brand hover:-translate-y-1 hover:shadow-brand-md transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-brand-blue-bg border border-brand-blue-border flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105">
                    <Search className="text-brand-blue" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-brand-navy mb-2">
                    Looking To Buy
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-slate leading-relaxed">
                    Set up watchlists for target builder projects, track prices, assess locality risks, and compare eligible bank LAP limits.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-brand-blue group-hover:opacity-80 transition-opacity">
                  <span>Explore Matches →</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-brand-blue-bg text-brand-blue rounded-md border border-brand-blue-border">Watchlist</span>
                </div>
              </div>

            </div>

            {/* Informational Footer */}
            <p className="text-[11px] text-brand-slate-light mt-12 flex items-center justify-center gap-1.5 font-medium">
              <Sparkles size={13} className="text-brand-blue" />
              Don't worry — you can track properties and create buying watchlists later from your dashboard.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

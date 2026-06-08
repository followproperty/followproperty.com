"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { logoutUser } from "@/services/auth-service";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { statesList, indiaStatesCities } from "@/constants/indiaStatesCities";
import { 
  User, 
  LogOut, 
  Settings, 
  Edit3, 
  Save, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  IndianRupee
} from "lucide-react";

const toTitleCase = (str) => {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function SettingsPage() {
  const router = useRouter();
  
  // Authentication & User State
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState("profile"); // "profile" or "logout"

  // Profile Form Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");
  const [annualFamilyIncome, setAnnualFamilyIncome] = useState("");
  const [isManualCity, setIsManualCity] = useState(false);
  const [customCity, setCustomCity] = useState("");
  
  // UI Status State
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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
            sessionStorage.setItem("currentUser", JSON.stringify(data.user));
            
            // Initialize form states
            setFirstName(data.user.firstName || "");
            setLastName(data.user.lastName || "");
            setPhone(data.user.phoneNumber || "");
            setCity(data.user.city || "");
            setState(data.user.state || "");
            setAge(data.user.age || "");
            setGender(data.user.gender || "");
            setOccupation(data.user.occupation || "");
            setAnnualFamilyIncome(data.user.annualFamilyIncome || "");

            // Pre-detect manual city config
            if (data.user.state && data.user.city) {
              const list = indiaStatesCities[data.user.state] || [];
              if (!list.includes(data.user.city)) {
                setIsManualCity(true);
                setCustomCity(data.user.city);
              }
            }
          } else {
            setUser(currentUser);
          }
        } catch (e) {
          console.error("Error verifying user session:", e);
        } finally {
          setLoadingUser(false);
        }
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setSaving(true);

    const finalCity = isManualCity ? customCity : city;

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phoneNumber: phone,
          city: toTitleCase(finalCity),
          state: toTitleCase(state),
          age: age ? Number(age) : null,
          gender,
          occupation,
          annualFamilyIncome
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setUser(json.data);
        sessionStorage.setItem("currentUser", JSON.stringify(json.data));
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setIsEditing(false);
      } else {
        setMessage({ type: "error", text: json.error || "Failed to update profile." });
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage({ type: "error", text: "An unexpected error occurred. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhone(user.phoneNumber || "");
      setCity(user.city || "");
      setState(user.state || "");
      setAge(user.age || "");
      setGender(user.gender || "");
      setOccupation(user.occupation || "");
      setAnnualFamilyIncome(user.annualFamilyIncome || "");
      
      // Reset manual city
      setIsManualCity(false);
      setCustomCity("");
      if (user.state && user.city) {
        const list = indiaStatesCities[user.state] || [];
        if (!list.includes(user.city)) {
          setIsManualCity(true);
          setCustomCity(user.city);
        }
      }
    }
    setIsEditing(false);
    setMessage({ type: "", text: "" });
  };

  const handleLogout = async () => {
    try {
      const res = await logoutUser();
      if (res.success) {
        sessionStorage.removeItem("currentUser");
        sessionStorage.removeItem("isAuthenticated");
        router.push("/login");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const initials = user
    ? (user.firstName && user.lastName
        ? (user.firstName[0] + user.lastName[0]).toUpperCase()
        : (user.email?.[0]?.toUpperCase() || "U"))
    : "FP";

  if (loadingUser) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto py-8">
          <div className="h-8 w-44 bg-brand-bg-alt rounded-lg animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-44 bg-brand-bg-card rounded-2xl border border-brand-border animate-pulse" />
            <div className="md:col-span-3 h-96 bg-brand-bg-card rounded-2xl border border-brand-border animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-200">
        {/* Header */}
        <div className="mb-8 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand-blue-bg flex items-center justify-center">
            <Settings className="text-brand-blue" size={20} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy m-0 tracking-tight">
              Settings
            </h1>
            <p className="text-xs sm:text-sm text-brand-slate m-0 mt-0.5">
              Manage your FollowProperty account details and profile configuration.
            </p>
          </div>
        </div>

        {/* Layout Shell */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Navigation Side Tabs */}
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => {
                setActiveTab("profile");
                setIsEditing(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold border-none cursor-pointer transition-all duration-200 text-left ${
                activeTab === "profile"
                  ? "bg-brand-blue text-white shadow-brand-blue"
                  : "bg-brand-bg-card text-brand-navy-mid hover:bg-brand-bg-alt border border-brand-border"
              }`}
            >
              <User size={16} />
              <span>User Account</span>
            </button>

            <button
              onClick={() => setActiveTab("logout")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold border-none cursor-pointer transition-all duration-200 text-left ${
                activeTab === "logout"
                  ? "bg-brand-red text-white shadow-[0_4px_16px_rgba(220,38,38,0.2)]"
                  : "bg-brand-bg-card text-brand-navy-mid hover:bg-brand-bg-alt border border-brand-border"
              }`}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>

          {/* Configuration Panel */}
          <div className="md:col-span-3">
            {activeTab === "profile" && (
              <div className="bg-brand-bg-card border border-brand-border rounded-3xl p-6 sm:p-8 shadow-brand space-y-6">
                {/* Form Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-brand-border">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-brand-navy text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-brand-navy m-0">
                        {user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : "User Profile"}
                      </h3>
                      <p className="text-[11px] text-brand-slate m-0 mt-0.5 uppercase tracking-wider font-bold">
                        {user.role} Account
                      </p>
                    </div>
                  </div>

                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-bg-alt text-brand-navy hover:text-brand-blue border border-brand-border hover:border-brand-blue-border rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      <Edit3 size={13} /> Edit Profile
                    </button>
                  )}
                </div>

                {/* Status Message */}
                {message.text && (
                  <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    message.type === "success" 
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-700" 
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}>
                    {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{message.text}</span>
                  </div>
                )}

                {/* Form Content */}
                <form onSubmit={handleProfileSave} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* First Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                        First Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="e.g. John"
                          className="w-full bg-white border border-brand-border-mid rounded-xl px-4 py-2.5 text-[13px] text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                        />
                      ) : (
                        <p className="text-sm font-extrabold text-brand-navy m-0 bg-brand-bg-alt border border-transparent rounded-xl px-4 py-2.5">
                          {user.firstName || <span className="text-brand-slate font-medium italic">Not specified</span>}
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                        Last Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="e.g. Doe"
                          className="w-full bg-white border border-brand-border-mid rounded-xl px-4 py-2.5 text-[13px] text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                        />
                      ) : (
                        <p className="text-sm font-extrabold text-brand-navy m-0 bg-brand-bg-alt border border-transparent rounded-xl px-4 py-2.5">
                          {user.lastName || <span className="text-brand-slate font-medium italic">Not specified</span>}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Email (Always Read-only) */}
                    <div>
                      <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2 flex items-center gap-1">
                        Email Address <Shield size={10} className="text-brand-slate-light" />
                      </label>
                      <div className="relative">
                        <p className="text-sm font-extrabold text-brand-slate m-0 bg-brand-bg-alt border border-brand-border rounded-xl px-4 py-2.5 flex items-center gap-2 select-all cursor-default opacity-85">
                          <Mail size={13} className="text-brand-slate-light flex-shrink-0" />
                          <span>{user.email}</span>
                        </p>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +91 99999 99999"
                          className="w-full bg-white border border-brand-border-mid rounded-xl px-4 py-2.5 text-[13px] text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                        />
                      ) : (
                        <p className="text-sm font-extrabold text-brand-navy m-0 bg-brand-bg-alt border border-transparent rounded-xl px-4 py-2.5 flex items-center gap-2">
                          <Phone size={13} className="text-brand-slate-light flex-shrink-0" />
                          <span>{user.phoneNumber || <span className="text-brand-slate font-medium italic">Not specified</span>}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Age */}
                    <div>
                      <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                        Age
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          min="18"
                          max="120"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="e.g. 28"
                          className="w-full bg-white border border-brand-border-mid rounded-xl px-4 py-2.5 text-[13px] text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                        />
                      ) : (
                        <p className="text-sm font-extrabold text-brand-navy m-0 bg-brand-bg-alt border border-transparent rounded-xl px-4 py-2.5 flex items-center gap-2">
                          <User size={13} className="text-brand-slate-light flex-shrink-0" />
                          <span>{user.age || <span className="text-brand-slate font-medium italic">Not specified</span>}</span>
                        </p>
                      )}
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                        Gender
                      </label>
                      {isEditing ? (
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full bg-white border border-brand-border-mid rounded-xl px-4 py-2.5 text-[13px] text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all cursor-pointer appearance-none bg-no-repeat bg-[right_16px_center]"
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
                      ) : (
                        <p className="text-sm font-extrabold text-brand-navy m-0 bg-brand-bg-alt border border-transparent rounded-xl px-4 py-2.5 flex items-center gap-2">
                          <User size={13} className="text-brand-slate-light flex-shrink-0" />
                          <span>{user.gender || <span className="text-brand-slate font-medium italic">Not specified</span>}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Occupation */}
                    <div>
                      <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                        Occupation
                      </label>
                      {isEditing ? (
                        <select
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          className="w-full bg-white border border-brand-border-mid rounded-xl px-4 py-2.5 text-[13px] text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all cursor-pointer appearance-none bg-no-repeat bg-[right_16px_center]"
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
                      ) : (
                        <p className="text-sm font-extrabold text-brand-navy m-0 bg-brand-bg-alt border border-transparent rounded-xl px-4 py-2.5 flex items-center gap-2">
                          <Briefcase size={13} className="text-brand-slate-light flex-shrink-0" />
                          <span>{user.occupation || <span className="text-brand-slate font-medium italic">Not specified</span>}</span>
                        </p>
                      )}
                    </div>

                    {/* Annual Family Income */}
                    <div>
                      <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                        Annual Family Income
                      </label>
                      {isEditing ? (
                        <select
                          value={annualFamilyIncome}
                          onChange={(e) => setAnnualFamilyIncome(e.target.value)}
                          className="w-full bg-white border border-brand-border-mid rounded-xl px-4 py-2.5 text-[13px] text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all cursor-pointer appearance-none bg-no-repeat bg-[right_16px_center]"
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
                      ) : (
                        <p className="text-sm font-extrabold text-brand-navy m-0 bg-brand-bg-alt border border-transparent rounded-xl px-4 py-2.5 flex items-center gap-2">
                          <IndianRupee size={13} className="text-brand-slate-light flex-shrink-0" />
                          <span>{user.annualFamilyIncome || <span className="text-brand-slate font-medium italic">Not specified</span>}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* State */}
                    <div>
                      <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-2">
                        State
                      </label>
                      {isEditing ? (
                        <select
                          value={state}
                          onChange={(e) => {
                            setState(e.target.value);
                            setCity(""); // Reset city when state changes
                          }}
                          className="w-full bg-white border border-brand-border-mid rounded-xl px-4 py-2.5 text-[13px] text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all cursor-pointer appearance-none bg-no-repeat bg-[right_16px_center]"
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
                      ) : (
                        <p className="text-sm font-extrabold text-brand-navy m-0 bg-brand-bg-alt border border-transparent rounded-xl px-4 py-2.5 flex items-center gap-2">
                          <MapPin size={13} className="text-brand-slate-light flex-shrink-0" />
                          <span>{user.state || <span className="text-brand-slate font-medium italic">Not specified</span>}</span>
                        </p>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider">
                          City
                        </label>
                        {isEditing && isManualCity && (
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
                      {isEditing ? (
                        isManualCity ? (
                          <input
                            type="text"
                            value={customCity}
                            onChange={(e) => setCustomCity(e.target.value)}
                            placeholder="e.g. Almora"
                            className="w-full bg-white border border-brand-border-mid rounded-xl px-4 py-2.5 text-[13px] text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
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
                            disabled={!state}
                            className="w-full bg-white border border-brand-border-mid rounded-xl px-4 py-2.5 text-[13px] text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all cursor-pointer appearance-none bg-no-repeat bg-[right_16px_center] disabled:opacity-50"
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
                        )
                      ) : (
                        <p className="text-sm font-extrabold text-brand-navy m-0 bg-brand-bg-alt border border-transparent rounded-xl px-4 py-2.5 flex items-center gap-2">
                          <MapPin size={13} className="text-brand-slate-light flex-shrink-0" />
                          <span>{user.city || <span className="text-brand-slate font-medium italic">Not specified</span>}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex items-center gap-3 pt-4 border-t border-brand-border">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold border-none shadow-brand hover:-translate-y-0.5 disabled:opacity-75 cursor-pointer transition-all"
                      >
                        <Save size={13} /> {saving ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-transparent text-brand-slate hover:text-brand-navy border border-brand-border rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        <X size={13} /> Cancel
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {activeTab === "logout" && (
              <div className="bg-brand-bg-card border border-brand-border rounded-3xl p-6 sm:p-8 shadow-brand text-center space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-brand-red-bg border border-brand-red-border flex items-center justify-center mx-auto">
                  <LogOut size={22} className="text-brand-red" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-brand-navy m-0">
                    Log Out of Your Account
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-slate m-0 mt-1 max-w-sm mx-auto">
                    Are you sure you want to log out of your session? You will need to re-authenticate to access your property portfolio.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2.5 bg-brand-red text-white border-none rounded-xl text-xs font-bold shadow-[0_4px_16px_rgba(220,38,38,0.2)] hover:-translate-y-0.5 cursor-pointer transition-all"
                  >
                    Confirm Log Out
                  </button>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="px-6 py-2.5 bg-transparent text-brand-slate hover:text-brand-navy border border-brand-border rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

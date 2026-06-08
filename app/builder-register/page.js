"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LogOut, ArrowRight } from "lucide-react";
import { logoutUser } from "@/services/auth-service";
import Loading from "@/components/ui/Loading";

export default function BuilderRegisterPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form Fields State
  const [builderName, setBuilderName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [reraNumber, setReraNumber] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        try {
          await logoutUser();
        } catch (err) {
          console.error("Failed to clean up stale server cookies:", err);
        }
        router.push("/login");
      } else {
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
            // Only allow draft and rejected status users
            if (
              data.user.builderApplicationStatus !== "draft" &&
              data.user.builderApplicationStatus !== "rejected"
            ) {
              router.push("/dashboard");
            } else {
              // Fetch existing BuilderApplication details if any exist
              try {
                const appRes = await fetch("/api/builder-application");
                if (appRes.ok) {
                  const appData = await appRes.json();
                  if (appData.success && appData.data) {
                    const app = appData.data;
                    setBuilderName(app.builderName || "");
                    setCompanyName(app.companyName || "");
                    setContactPersonName(app.contactPersonName || "");
                    setPhone(app.phone || "");
                    setEmail(app.email || currentUser.email || "");
                    setCity(app.city || "");
                    setWebsite(app.website || "");
                    setReraNumber(app.reraNumber || "");
                    setCheckingAuth(false);
                    return;
                  }
                }
              } catch (err) {
                console.error("Error fetching builder application details:", err);
              }

              // Pre-fill email and name fields from auth if available (fallback)
              if (currentUser.email) {
                setEmail(currentUser.email);
              }
              if (data.user.firstName || data.user.lastName) {
                setContactPersonName(
                  `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim()
                );
              }
              if (data.user.phoneNumber) {
                setPhone(data.user.phoneNumber);
              }
              if (data.user.city) {
                setCity(data.user.city);
              }
            }
          }
        } catch (e) {
          console.error("Error verifying in builder-register:", e);
        } finally {
          setCheckingAuth(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        builderName: builderName.trim(),
        companyName: companyName.trim(),
        contactPersonName: contactPersonName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        city: city.trim(),
        website: website.trim(),
        reraNumber: reraNumber.trim(),
      };

      const res = await fetch("/api/builder-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        if (typeof window !== "undefined") {
          const stored = sessionStorage.getItem("currentUser");
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.builderApplicationStatus = "pending";
            sessionStorage.setItem("currentUser", JSON.stringify(parsed));
          }
          sessionStorage.setItem("isAuthenticated", "true");
        }
        router.push("/builder-application-status");
      } else {
        setError(data.error || "Failed to submit application");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (checkingAuth) {
    return <Loading fullPage text="Verifying credentials..." />;
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between p-4 sm:p-8 font-sans antialiased relative">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-brand-amber/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-[1200px] mx-auto flex justify-between items-center py-4 relative z-10">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="FollowProperty Logo" className="w-7 h-7 object-contain" />
          <span className="font-bold text-[17px] text-brand-navy tracking-[-0.025em]">
            FollowProperty
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs font-semibold text-brand-slate hover:text-brand-red bg-transparent border-none cursor-pointer flex items-center gap-1.5 transition-colors focus:outline-none"
        >
          <LogOut size={14} /> Log Out
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-grow flex items-center justify-center py-12 relative z-10">
        <div className="w-full max-w-[560px] bg-brand-bg-card rounded-3xl border border-brand-border p-6 sm:p-8 shadow-brand space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-brand-navy tracking-tight leading-none">
              Builder Registration
            </h1>
            <p className="text-xs text-brand-slate m-0">
              Provide your details below to submit your builder profile application.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-[10px] bg-red-50 border border-red-200 text-red-600 text-xs font-semibold animate-in fade-in duration-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Builder Name */}
              <div>
                <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                  Builder Name <span className="text-brand-blue">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={submitting}
                  value={builderName}
                  onChange={(e) => setBuilderName(e.target.value)}
                  placeholder="e.g. DLF Limited"
                  className="w-full bg-white border border-brand-border-mid rounded-[10px] px-3.5 py-2.5 text-[13px] text-brand-navy placeholder:text-brand-slate-light focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all shadow-sm disabled:opacity-50"
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                  Company Name <span className="text-brand-blue">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={submitting}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. DLF Home Developers"
                  className="w-full bg-white border border-brand-border-mid rounded-[10px] px-3.5 py-2.5 text-[13px] text-brand-navy placeholder:text-brand-slate-light focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all shadow-sm disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contact Person Name */}
              <div>
                <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                  Contact Person <span className="text-brand-blue">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={submitting}
                  value={contactPersonName}
                  onChange={(e) => setContactPersonName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-white border border-brand-border-mid rounded-[10px] px-3.5 py-2.5 text-[13px] text-brand-navy placeholder:text-brand-slate-light focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all shadow-sm disabled:opacity-50"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-brand-blue">*</span>
                </label>
                <input
                  type="tel"
                  required
                  disabled={submitting}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 99999 99999"
                  className="w-full bg-white border border-brand-border-mid rounded-[10px] px-3.5 py-2.5 text-[13px] text-brand-navy placeholder:text-brand-slate-light focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all shadow-sm disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                  Corporate Email <span className="text-brand-blue">*</span>
                </label>
                <input
                  type="email"
                  required
                  disabled={submitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. corporate@company.com"
                  className="w-full bg-white border border-brand-border-mid rounded-[10px] px-3.5 py-2.5 text-[13px] text-brand-navy placeholder:text-brand-slate-light focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all shadow-sm disabled:opacity-50"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                  City <span className="text-brand-blue">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={submitting}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Gurgaon"
                  className="w-full bg-white border border-brand-border-mid rounded-[10px] px-3.5 py-2.5 text-[13px] text-brand-navy placeholder:text-brand-slate-light focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all shadow-sm disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Website */}
              <div>
                <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                  Website <span className="text-brand-slate-light font-medium">(Optional)</span>
                </label>
                <input
                  type="url"
                  disabled={submitting}
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g. https://www.company.com"
                  className="w-full bg-white border border-brand-border-mid rounded-[10px] px-3.5 py-2.5 text-[13px] text-brand-navy placeholder:text-brand-slate-light focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all shadow-sm disabled:opacity-50"
                />
              </div>

              {/* RERA Number */}
              <div>
                <label className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                  RERA Registration <span className="text-brand-slate-light font-medium">(Optional)</span>
                </label>
                <input
                  type="text"
                  disabled={submitting}
                  value={reraNumber}
                  onChange={(e) => setReraNumber(e.target.value)}
                  placeholder="e.g. RERA-GRG-123-2026"
                  className="w-full bg-white border border-brand-border-mid rounded-[10px] px-3.5 py-2.5 text-[13px] text-brand-navy placeholder:text-brand-slate-light focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all shadow-sm disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 text-[14px] font-bold text-white bg-brand-blue hover:bg-brand-blue-dark border-none py-3.5 rounded-[10px] shadow-[0_2px_12px_rgba(50,95,236,0.25)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-brand-blue mt-6 disabled:opacity-75 disabled:transform-none disabled:shadow-none cursor-pointer"
            >
              {submitting ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  Submit Application <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-[1200px] mx-auto text-center py-4 text-[11px] text-brand-slate-light font-medium border-t border-brand-border/60 relative z-10">
        © 2026 FollowProperty. All rights reserved.
      </footer>
    </div>
  );
}

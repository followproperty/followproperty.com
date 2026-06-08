"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Clock, LogOut } from "lucide-react";
import { logoutUser } from "@/services/auth-service";
import Loading from "@/components/ui/Loading";

export default function BuilderApplicationStatusPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

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
            // Only allow users with "pending" status on this page
            if (data.user.builderApplicationStatus !== "pending") {
              router.push("/dashboard");
            }
          }
        } catch (e) {
          console.error("Error verifying in builder-application-status:", e);
        } finally {
          setCheckingAuth(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return <Loading fullPage text="Verifying status..." />;
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
          disabled={loading}
          className="text-xs font-semibold text-brand-slate hover:text-brand-red bg-transparent border-none cursor-pointer flex items-center gap-1.5 transition-colors focus:outline-none"
        >
          <LogOut size={14} /> Log Out
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-grow flex items-center justify-center py-12 relative z-10">
        <div className="w-full max-w-[540px] bg-brand-bg-card rounded-3xl border border-brand-border p-8 sm:p-10 shadow-brand text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-amber-bg border border-brand-amber-border flex items-center justify-center mx-auto shadow-sm">
            <Clock size={28} className="text-brand-amber" />
          </div>

          <div className="space-y-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight leading-tight">
              Application Under Review
            </h1>
            <p className="text-sm text-brand-slate leading-relaxed">
              Your builder application is under review.
            </p>
          </div>

          <div className="bg-brand-bg-alt border border-brand-border rounded-xl p-4 text-[12px] text-brand-slate font-medium">
            Our admin team is currently reviewing your profile registration. We will notify you once approval is complete.
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-[1200px] mx-auto text-center py-4 text-[11px] text-brand-slate-light font-medium border-t border-brand-border/60 relative z-10">
        © 2026 FollowProperty. All rights reserved.
      </footer>
    </div>
  );
}

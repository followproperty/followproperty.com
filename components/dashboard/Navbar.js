"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, Building2, Menu, LogOut, ChevronDown } from "lucide-react";
import { logoutUser } from "@/services/auth-service";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Navbar({ onMenuClick }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

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
          } else {
            setUser(currentUser);
          }
        } catch (e) {
          console.error("Error loading user profile details:", e);
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      setDropdownOpen(false);
      const res = await logoutUser();
      if (res.success) {
        router.push("/login");
      } else {
        console.error("Logout failed:", res.message);
      }
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  const initials = user
    ? (user.firstName && user.lastName
        ? (user.firstName[0] + user.lastName[0]).toUpperCase()
        : (user.displayName
            ? user.displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
            : (user.email?.[0]?.toUpperCase() || "U")))
    : "RS";

  const fullName = user
    ? (user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : (user.displayName || user.email || "User"))
    : "RS";

  return (
    <div className="flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 h-[72px] border-b bg-brand-bgCard border-brand-border">
      {/* Brand & Mobile Menu */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden flex items-center justify-center p-1.5 -ml-1.5 rounded-md bg-transparent border-none cursor-pointer"
          onClick={onMenuClick}
        >
          <Menu size={22} className="text-brand-navy" />
        </button>
        <Link
          href="/"
          className="flex items-center gap-2.5 no-underline"
        >
          <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-brand-amberLight to-[#EA580C] flex items-center justify-center shadow-[0_2px_10px_rgba(217,119,6,0.30)]">
            <Building2 size={15} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[17px] text-brand-navy tracking-[-0.025em] hidden sm:block">
            FollowProperty
          </span>
          <span className="hidden sm:inline-block text-[10px] text-brand-slateLight tracking-[0.14em] uppercase ml-1">
            Real Assets
          </span>
        </Link>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Search */}
        <div className="hidden md:flex items-center px-4 py-2 rounded-full gap-2 w-[240px] border bg-brand-bgAlt border-brand-border">
          <Search size={16} className="text-brand-slateLight" />
          <input
            type="text"
            placeholder="Search properties..."
            className="border-none bg-transparent outline-none text-[13px] w-full text-brand-navy"
          />
        </div>

        {/* Mobile Search Icon */}
        <button className="md:hidden flex items-center justify-center bg-transparent border-none cursor-pointer">
          <Search size={20} className="text-brand-slate" />
        </button>

        {/* Notifications */}
        <button
          className="bg-transparent border-none relative cursor-pointer flex items-center justify-center"
        >
          <Bell size={20} className="text-brand-slate" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white bg-brand-red" />
        </button>

        {/* Divider */}
        <div className="hidden md:block w-[1px] h-6 bg-brand-border" />

        {/* Profile with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 md:gap-3 cursor-pointer bg-transparent border-none p-0 outline-none text-left"
          >
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full text-white flex items-center justify-center font-bold text-[13px] md:text-[14px] bg-brand-navy">
              {initials}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-[13px] font-semibold text-brand-navy flex items-center gap-1">
                {fullName} <ChevronDown size={12} className="text-brand-slateLight" />
              </span>
            </div>
          </button>

          {dropdownOpen && (
            <>
              {/* Invisible overlay backplane */}
              <div 
                className="fixed inset-0 z-20 bg-transparent cursor-default" 
                onClick={() => setDropdownOpen(false)}
              />
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2.5 w-44 rounded-xl border bg-brand-bgCard border-brand-border shadow-brand-md p-1.5 z-30 flex flex-col gap-0.5">
                <div className="px-3 py-2 text-[10px] font-bold text-brand-slateLight uppercase tracking-wider border-b border-brand-border/60 mb-1">
                  Manage Account
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-[13px] font-semibold text-brand-red bg-transparent hover:bg-brand-redBg border-none cursor-pointer transition-colors duration-150"
                >
                  <LogOut size={15} />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

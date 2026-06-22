"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, Menu, LogOut, ChevronDown } from "lucide-react";
import { logoutUser } from "@/services/auth-service";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Navbar({ onMenuClick }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("currentUser");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const loadUnreadCount = async () => {
      try {
        const res = await fetch("/api/notifications/unread-count");
        if (res.ok) {
          const json = await res.json();
          if (json.success) setUnreadCount(json.data.count);
        }
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?limit=5");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setNotifications(json.data);
      }
    } catch (err) {
      console.error("Error loading notifications list:", err);
    }
  };

  const handleNotifClick = async (notif) => {
    setNotifDropdownOpen(false);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notif._id })
      });
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }

    if (notif.projectId) {
      router.push(`/projects/${notif.projectId._id || notif.projectId}`);
    } else {
      router.push("/notifications");
    }
  };

  const handleMarkAllRead = async () => {
    setNotifDropdownOpen(false);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true })
      });
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Pre-populate with cached session user to prevent any layout/button changes
          const stored = sessionStorage.getItem("currentUser");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.firebaseUid === currentUser.uid || parsed.uid === currentUser.uid) {
              setUser(parsed);
            }
          }

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
          } else {
            setUser(currentUser);
            sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
          }
        } catch (e) {
          console.error("Error loading user profile details:", e);
          setUser(currentUser);
          sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
        }
      } else {
        setUser(null);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("currentUser");
          sessionStorage.removeItem("isAuthenticated");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      setDropdownOpen(false);
      const res = await logoutUser();
      if (res.success) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("currentUser");
          sessionStorage.removeItem("isAuthenticated");
        }
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
    <div className="flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 h-[72px] border-b bg-brand-bg-card border-brand-border">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 no-underline"
        >
          <img src="/favicon.svg" alt="FollowProperty Logo" className="w-7 h-7 object-contain" />
          <span className="font-bold text-[17px] text-brand-navy tracking-[-0.025em] block">
            FollowProperty
          </span>
          <span className="hidden sm:inline-block text-[10px] text-brand-slate-light tracking-[0.14em] uppercase ml-1">
            Real Assets
          </span>
        </Link>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Search
        <div className="hidden md:flex items-center px-4 py-2 rounded-full gap-2 w-[240px] border bg-brand-bg-alt border-brand-border">
          <Search size={16} className="text-brand-slate-light" />
          <input
            type="text"
            placeholder="Search properties..."
            className="border-none bg-transparent outline-none text-[13px] w-full text-brand-navy"
          />
        </div>
        */}

        {/* Mobile Search Icon
        <button className="md:hidden flex items-center justify-center bg-transparent border-none cursor-pointer">
          <Search size={20} className="text-brand-slate" />
        </button>
        */}

        {/* Notifications Bell */}
        {user && (
          <div className="relative">
            <button
              onClick={() => {
                if (!notifDropdownOpen) {
                  loadNotifications();
                }
                setNotifDropdownOpen(!notifDropdownOpen);
                setDropdownOpen(false); // Close profile dropdown
              }}
              className="bg-transparent border-none relative cursor-pointer flex items-center justify-center p-1 hover:bg-brand-bg-alt rounded-lg transition-colors"
            >
              <Bell size={20} className="text-brand-slate" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-brand-red text-white text-[9px] font-bold px-1 border border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <>
                {/* Backdrop Click Dismiss */}
                <div
                  className="fixed inset-0 z-20 bg-transparent cursor-default"
                  onClick={() => setNotifDropdownOpen(false)}
                />

                {/* Dropdown Box */}
                <div className="absolute right-0 mt-2.5 w-[320px] max-w-[calc(100vw-32px)] rounded-2xl border bg-brand-bg-card border-brand-border shadow-brand-md z-30 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-1.5 duration-150">
                  <div className="px-4 py-3 border-b border-brand-border flex items-center justify-between bg-brand-bg-alt">
                    <span className="text-xs font-extrabold text-brand-navy">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-brand-blue font-bold border-none bg-transparent cursor-pointer hover:underline p-0"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-[280px] overflow-y-auto divide-y divide-brand-border/60">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-brand-slate font-semibold">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleNotifClick(notif)}
                          className={`p-3.5 hover:bg-brand-bg-alt transition-colors cursor-pointer text-left flex flex-col gap-1 ${
                            !notif.isRead ? "bg-brand-blue-bg/20" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-brand-navy line-clamp-1">{notif.title}</span>
                            {!notif.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-brand-slate m-0 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[9px] text-brand-slate-light font-medium mt-1">
                            {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <Link
                    href="/notifications"
                    onClick={() => setNotifDropdownOpen(false)}
                    className="block text-center py-2.5 bg-brand-bg-alt border-t border-brand-border text-[11px] font-bold text-brand-blue no-underline hover:bg-brand-bg-card transition-colors"
                  >
                    View all alerts
                  </Link>
                </div>
              </>
            )}
          </div>
        )}

        {/* Divider
        <div className="hidden md:block w-[1px] h-6 bg-brand-border" />
        */}

        {/* Profile with Dropdown or Auth CTA */}
        {user ? (
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
                  {fullName} <ChevronDown size={12} className="text-brand-slate-light" />
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
                <div className="absolute right-0 mt-2.5 w-44 rounded-xl border bg-brand-bg-card border-brand-border shadow-brand-md p-1.5 z-30 flex flex-col gap-0.5">
                  <div className="px-3 py-2 text-[10px] font-bold text-brand-slate-light uppercase tracking-wider border-b border-brand-border/60 mb-1">
                    Manage Account
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-[13px] font-semibold text-brand-red bg-transparent hover:bg-brand-red-bg border-none cursor-pointer transition-colors duration-150"
                  >
                    <LogOut size={15} />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-[13px] font-semibold text-brand-slate bg-transparent border-none cursor-pointer py-2 px-3.5 no-underline hover:text-brand-navy transition-colors">
              Login
            </Link>
            <Link href="/signup" className="text-[13px] font-bold text-white bg-linear-to-r from-brand-blue-deep to-brand-blue border border-white/5 cursor-pointer py-2 px-4 rounded-lg shadow-sm transition-all duration-[0.22s] hover:-translate-y-[1px] hover:shadow-brand-blue/30 no-underline flex items-center">
              Create Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

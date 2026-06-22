"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check, Trash2, Calendar, MapPin, Building2, SlidersHorizontal, Zap } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/dashboard/EmptyState";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (!res.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setNotifications(json.data);
      } else {
        throw new Error(json.error || "Failed to load notifications.");
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
      setError(err.message || "Could not retrieve notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true })
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
        );
      }
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: notif._id })
        });
        // Optimistically set to read
        setNotifications(prev =>
          prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n)
        );
      } catch (err) {
        console.error("Error updating notification status:", err);
      }
    }

    if (notif.projectId) {
      const targetId = notif.projectId._id || notif.projectId;
      router.push(`/projects/${targetId}`);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-200 text-emerald-700";
    if (score >= 60) return "bg-brand-blue-bg border-brand-blue-border text-brand-blue";
    return "bg-brand-amber-bg border-brand-amber-border text-brand-amber";
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-12">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-navy mb-1.5 tracking-tight flex items-center gap-2.5">
              <Bell className="text-brand-blue" size={28} /> Requirement Match Alerts
            </h1>
            <p className="text-xs sm:text-sm text-brand-slate m-0">
              Live updates when developers upload properties matching your budget, location, and BHK watchlists.
            </p>
          </div>

          {notifications.length > 0 && notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 bg-brand-bg-card text-brand-navy border border-brand-border rounded-xl text-xs sm:text-sm font-bold shadow-brand hover:bg-brand-bg-alt cursor-pointer transition-all duration-200"
            >
              <Check size={14} /> Mark All as Read
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <Loading text="Loading notifications feed..." />
        ) : notifications.length === 0 ? (
          <div className="bg-brand-bg-card p-12 rounded-3xl border border-brand-border shadow-brand text-center">
            <EmptyState 
              title="No notifications yet" 
              description="Upload a buying requirement to your watchlist. Once new developer listings match your preferences, matches will appear here."
            />
            <div className="mt-6 flex justify-center">
              <Link
                href="/watchlist"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold border-none shadow-[0_4px_16px_rgba(50,95,236,0.2)] hover:-translate-y-0.5 cursor-pointer transition-all duration-200 no-underline"
              >
                <SlidersHorizontal size={12} /> Configure Watchlist
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => {
              const project = notif.projectId;
              const watchlist = notif.watchlistId;
              const hasMatchScore = notif.message.includes("%");
              
              // Extract match score digits if possible
              const matchScoreResult = notif.message.match(/(\d+)%/);
              const score = matchScoreResult ? parseInt(matchScoreResult[1], 10) : 70;

              return (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`bg-brand-bg-card p-5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-brand flex flex-col sm:flex-row gap-4 justify-between items-start ${
                    !notif.isRead 
                      ? "border-brand-blue/30 bg-brand-blue-bg/5 hover:border-brand-blue/60" 
                      : "border-brand-border hover:border-brand-border-mid hover:bg-brand-bg-alt/50"
                  }`}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getScoreColor(score)} flex items-center gap-1`}>
                        <Zap size={10} className="fill-current" /> {score}% Match
                      </span>
                      {!notif.isRead && (
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-brand-blue text-white rounded-full">
                          New
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-brand-navy m-0 flex items-center gap-1.5">
                      {notif.title}
                    </h3>
                    
                    <p className="text-xs text-brand-slate leading-relaxed m-0">
                      {notif.message}
                    </p>

                    {/* Metadata Sub-Row */}
                    <div className="pt-2 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-brand-slate-light font-semibold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                      {project && (
                        <span className="flex items-center gap-1">
                          <Building2 size={12} />
                          {project.projectName}
                        </span>
                      )}
                      {watchlist && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {watchlist.locality}, {watchlist.city}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="self-stretch flex sm:flex-col justify-end items-end shrink-0 gap-2">
                    {project && (
                      <span className="text-[10px] font-bold text-brand-blue hover:underline bg-brand-blue-bg/40 px-3 py-1.5 rounded-xl border border-brand-blue-border/40">
                        View Match Details →
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

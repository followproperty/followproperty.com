"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  ListPlus, 
  Search, 
  BellRing, 
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { filterProperties } from "@/utils/filterProperties";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  
  const [portfolios, setPortfolios] = useState([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState(true);

  const [watchlists, setWatchlists] = useState([]);
  const [loadingWatchlists, setLoadingWatchlists] = useState(true);
  const [matchingCount, setMatchingCount] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Fetch portfolio properties
    async function fetchPortfolios() {
      try {
        setLoadingPortfolios(true);
        const res = await fetch("/api/portfolio");
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setPortfolios(json.data);
        }
      } catch (err) {
        console.error("Error fetching portfolios on overview:", err);
      } finally {
        setLoadingPortfolios(false);
      }
    }

    // Fetch watchlists
    async function fetchWatchlists() {
      try {
        setLoadingWatchlists(true);
        const res = await fetch("/api/watchlist");
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setWatchlists(json.data);
          if (json.data.length > 0) {
            const latestWatchlist = json.data[0];
            const matched = filterProperties(latestWatchlist);
            setMatchingCount(matched.length);
          }
        }
      } catch (err) {
        console.error("Error fetching watchlists on overview:", err);
      } finally {
        setLoadingWatchlists(false);
      }
    }

    fetchPortfolios();
    fetchWatchlists();
  }, []);

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-brand-navy mb-2 tracking-tight">Overview</h1>
          <p className="text-sm text-brand-slate">Loading overview...</p>
        </div>
      </DashboardLayout>
    );
  }

  const isLoading = loadingPortfolios || loadingWatchlists;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-brand-navy mb-2 tracking-tight">
            Overview Dashboard
          </h1>
          <p className="text-sm text-brand-slate m-0">
            Welcome to FollowProperty. Access your dynamic, goal-oriented real estate workspaces below.
          </p>
        </div>

        {/* High-Level Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Total Portfolio Properties */}
          <Link href="/portfolio" className="no-underline text-inherit flex w-full">
            <div className="w-full bg-brand-bg-card p-5 rounded-2xl border border-brand-border shadow-brand hover:-translate-y-0.5 hover:border-brand-amber-border hover:shadow-[0_8px_30px_rgba(217,119,6,0.08)] transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[130px]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-brand-slate uppercase tracking-wider">Tracked Portfolio</span>
                <div className="w-8 h-8 rounded-lg bg-brand-amber-bg flex items-center justify-center">
                  <Building2 size={16} className="text-brand-amber" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-brand-navy m-0">
                  {isLoading ? (
                    <div className="h-7 w-12 bg-brand-bg-alt rounded animate-pulse" />
                  ) : (
                    portfolios.length
                  )}
                </h3>
                <div className="mt-2 text-[11px] font-semibold text-brand-amber flex items-center gap-1">
                  <span>Manage Portfolio</span> <ArrowRight size={12} />
                </div>
              </div>
            </div>
          </Link>

          {/* Card 2: Active Watchlists */}
          <Link href="/watchlist" className="no-underline text-inherit flex w-full">
            <div className="w-full bg-brand-bg-card p-5 rounded-2xl border border-brand-border shadow-brand hover:-translate-y-0.5 hover:border-brand-blue-border hover:shadow-[0_8px_30px_rgba(50,95,236,0.08)] transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[130px]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-brand-slate uppercase tracking-wider">Active Watchlists</span>
                <div className="w-8 h-8 rounded-lg bg-brand-blue-bg flex items-center justify-center">
                  <ListPlus size={16} className="text-brand-blue" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-brand-navy m-0">
                  {isLoading ? (
                    <div className="h-7 w-12 bg-brand-bg-alt rounded animate-pulse" />
                  ) : (
                    watchlists.length
                  )}
                </h3>
                <div className="mt-2 text-[11px] font-semibold text-brand-blue flex items-center gap-1">
                  <span>Manage Watchlists</span> <ArrowRight size={12} />
                </div>
              </div>
            </div>
          </Link>

          {/* Card 3: Matching Projects */}
          <Link href="/watchlist" className="no-underline text-inherit flex w-full">
            <div className="w-full bg-brand-bg-card p-5 rounded-2xl border border-brand-border shadow-brand hover:-translate-y-0.5 hover:border-brand-blue-border hover:shadow-[0_8px_30px_rgba(50,95,236,0.08)] transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[130px]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-brand-slate uppercase tracking-wider">Recommended Matches</span>
                <div className="w-8 h-8 rounded-lg bg-brand-blue-bg flex items-center justify-center">
                  <Search size={16} className="text-brand-blue" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-brand-navy m-0">
                  {isLoading ? (
                    <div className="h-7 w-12 bg-brand-bg-alt rounded animate-pulse" />
                  ) : (
                    matchingCount
                  )}
                </h3>
                <div className="mt-2 text-[11px] font-semibold text-brand-blue flex items-center gap-1">
                  <span>Explore Matches</span> <ArrowRight size={12} />
                </div>
              </div>
            </div>
          </Link>

          {/* Card 4: Recent Alerts */}
          <div className="w-full bg-brand-bg-card p-5 rounded-2xl border border-brand-border shadow-brand hover:-translate-y-0.5 hover:border-brand-red-border hover:shadow-[0_8px_30px_rgba(220,38,38,0.08)] transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[130px]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-brand-slate uppercase tracking-wider">Security Alerts</span>
                <span className="text-[9px] font-bold bg-brand-blue-bg text-brand-blue border border-brand-blue-border px-1.5 py-0.5 rounded-full uppercase tracking-wider">Demo</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-brand-red-bg flex items-center justify-center">
                <BellRing size={16} className="text-brand-red" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-brand-navy m-0">1</h3>
              <div className="mt-2 text-[11px] font-semibold text-brand-red flex items-center gap-1">
                <span>View Platform Alerts (Coming Soon)</span> <ArrowRight size={12} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alerts Section (Uncluttered layout) */}
        <div className="bg-brand-bg-card p-6 rounded-3xl border border-brand-border shadow-brand animate-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-brand-border">
            <h2 className="text-lg font-bold text-brand-navy m-0 flex items-center gap-2 flex-wrap">
              <ShieldAlert className="text-brand-red" size={20} /> Critical Platform Alerts
              <span className="text-[10px] font-bold bg-brand-blue-bg text-brand-blue border border-brand-blue-border px-2 py-0.5 rounded-full uppercase tracking-wider">Demo / Coming Soon</span>
            </h2>
            <span className="text-xs font-semibold text-brand-red bg-brand-red-bg px-2.5 py-1 rounded-full border border-brand-red-border">
              1 Unresolved
            </span>
          </div>

          <div className="bg-brand-red-bg border border-brand-red-border rounded-xl p-4 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-brand-red text-white flex items-center justify-center font-bold flex-shrink-0">
              !
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                <h4 className="text-sm font-bold text-brand-navy m-0">
                  Builder delay reported in nearby project
                </h4>
                <span className="self-start text-[9px] font-bold bg-brand-red text-white px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                  Negative Alert
                </span>
              </div>
              <p className="text-[11px] text-brand-slate m-0 mb-2 font-medium">
                Skyline Residency · 2 days ago
              </p>
              <p className="text-xs text-brand-navy-mid leading-relaxed m-0">
                Prestige Lakeside Habitat shows 6-month possession delay; may impact resale sentiment in Whitefield.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

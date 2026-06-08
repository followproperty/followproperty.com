"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ListPlus, 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  Zap, 
  GitCompare, 
  ShoppingBag, 
  X,
  Building2,
  Calendar,
  Wallet
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PropertyGrid from "@/components/dashboard/PropertyGrid";
import EmptyState from "@/components/dashboard/EmptyState";
import WatchlistFlow from "@/components/forms/WatchlistFlow";
import Loading from "@/components/ui/Loading";

export default function WatchlistPage() {
  const [mounted, setMounted] = useState(false);
  const [watchlists, setWatchlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [properties, setProperties] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);

  async function fetchWatchlists() {
    try {
      setLoading(true);
      const res = await fetch("/api/watchlist");
      if (!res.ok) {
        throw new Error("Failed to fetch watchlist");
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        if (json.data.length > 0) {
          const latestWatchlist = json.data[0];
          // Sync to sessionStorage optionally
          sessionStorage.setItem("watchlistFilters", JSON.stringify(latestWatchlist));
          
          // Fetch live database matching projects from V1 Matching Engine
          const resMatches = await fetch(`/api/watchlist/matches?watchlistId=${latestWatchlist._id}`);
          let fetchedMatches = [];
          if (resMatches.ok) {
            const jsonMatches = await resMatches.json();
            if (jsonMatches.success && Array.isArray(jsonMatches.data)) {
              fetchedMatches = jsonMatches.data;
            }
          }
          setProperties(fetchedMatches);
          setWatchlists(json.data);
        } else {
          setProperties([]);
          setWatchlists([]);
          sessionStorage.removeItem("watchlistFilters");
        }
      } else {
        throw new Error(json.error || "Failed to load watchlists.");
      }
    } catch (err) {
      console.error("Error loading watchlists:", err);
      setError(err.message || "Could not fetch watchlist.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
    fetchWatchlists();
  }, []);

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="mb-8 animate-pulse">
          <h1 className="text-3xl font-extrabold text-brand-navy mb-2">Watchlist</h1>
          <div className="h-4 w-48 bg-brand-bg-alt rounded mb-4" />
        </div>
      </DashboardLayout>
    );
  }

  const formatCurrency = (num) => {
    if (!num) return "Any";
    const parsedNum = Number(num);
    if (isNaN(parsedNum)) return num;
    if (parsedNum >= 10000000) return `₹${(parsedNum / 10000000).toFixed(2)} Cr`;
    if (parsedNum >= 100000) return `₹${(parsedNum / 100000).toFixed(2)} L`;
    return `₹${parsedNum.toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto py-12">
          <Loading text="Loading watchlist and matches..." />
        </div>
      </DashboardLayout>
    );
  }

  // If user has not created any watchlists yet, render the setup flow full-page
  if (watchlists.length === 0) {
    return (
      <WatchlistFlow onSubmitSuccess={() => fetchWatchlists()} />
    );
  }

  const latestWatchlist = watchlists[0];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto pb-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="hidden sm:block">
            <h1 className="text-3xl font-extrabold text-brand-navy mb-1.5 tracking-tight flex items-center gap-2">
              <ListPlus className="text-brand-blue" size={28} /> My Buying Watchlist
            </h1>
            <p className="text-xs sm:text-sm text-brand-slate m-0">
              Personalized property tracking and local alert settings based on your real estate goals.
            </p>
          </div>
          
          <button
            onClick={() => setEditModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 bg-brand-blue text-white rounded-xl text-xs sm:text-sm font-bold border-none shadow-[0_4px_16px_rgba(50,95,236,0.2)] hover:-translate-y-0.5 cursor-pointer transition-all duration-200"
          >
            <SlidersHorizontal size={12} /> Update Buying Requirement
          </button>
        </div>



        {/* Requirement Summary Card */}
        <div className="bg-brand-bg-card p-6 rounded-3xl border border-brand-border shadow-brand mb-8 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-brand-border">
            <Zap size={18} className="text-brand-blue" />
            <h2 className="text-lg font-bold text-brand-navy m-0">Saved Buying Requirement</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-y-5 gap-x-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-brand-slate uppercase font-bold tracking-wider mb-1">Category & Type</span>
              <span className="text-sm font-extrabold text-brand-navy">{latestWatchlist.mainCategory} · {latestWatchlist.specificType}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-brand-slate uppercase font-bold tracking-wider mb-1">Target Location</span>
              <span className="text-sm font-extrabold text-brand-navy">{latestWatchlist.locality}, {latestWatchlist.city}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-brand-slate uppercase font-bold tracking-wider mb-1">Budget Limit</span>
              <span className="text-sm font-extrabold text-brand-navy">{formatCurrency(latestWatchlist.budget)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-brand-slate uppercase font-bold tracking-wider mb-1">Possession Target</span>
              <span className="text-sm font-extrabold text-brand-navy">{latestWatchlist.possessionYear || "Any Year"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-brand-slate uppercase font-bold tracking-wider mb-1">Preferred Builder</span>
              <span className="text-sm font-extrabold text-brand-navy truncate">{latestWatchlist.preferredBuilder || "Any Builder"}</span>
            </div>
          </div>

          {/* Capital Limits Sub-Grid (Optional fields detail) */}
          {(latestWatchlist.preApprovedBank || latestWatchlist.loanAmount || latestWatchlist.downPayment) && (
            <div className="mt-6 pt-5 border-t border-brand-border/60 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-brand-bg-alt rounded-xl border border-brand-border flex items-center gap-3">
                <Wallet size={16} className="text-brand-slate" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-brand-slate font-bold uppercase tracking-wider">Bank LAP Limit</span>
                  <span className="text-xs font-bold text-brand-navy">{latestWatchlist.preApprovedBank || "Not configured"}</span>
                </div>
              </div>
              <div className="p-3 bg-brand-bg-alt rounded-xl border border-brand-border flex items-center gap-3">
                <Wallet size={16} className="text-brand-slate" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-brand-slate font-bold uppercase tracking-wider">Loan Requirement</span>
                  <span className="text-xs font-bold text-brand-navy">{latestWatchlist.loanAmount ? formatCurrency(latestWatchlist.loanAmount) : "Not configured"}</span>
                </div>
              </div>
              <div className="p-3 bg-brand-bg-alt rounded-xl border border-brand-border flex items-center gap-3">
                <Wallet size={16} className="text-brand-slate" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-brand-slate font-bold uppercase tracking-wider">Down Payment Cap</span>
                  <span className="text-xs font-bold text-brand-navy">{latestWatchlist.downPayment ? formatCurrency(latestWatchlist.downPayment) : "Not configured"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recommended Matches Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-extrabold text-brand-navy m-0">Recommended Matches ({properties.length})</h2>
            {properties.length > 0 && (
              <span className="text-xs font-semibold text-brand-blue bg-brand-blue-bg px-2.5 py-1 rounded-full border border-brand-blue-border">
                Active Matches Found
              </span>
            )}
          </div>

          {properties.length > 0 ? (
            <PropertyGrid properties={properties} watchlistId={latestWatchlist._id.toString()} />
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Future Compare Capability & Future Buy Requests */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Compare Capability */}
          <div className="bg-brand-bg-card p-6 rounded-3xl border border-brand-border shadow-brand flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-brand-border">
                <GitCompare size={18} className="text-brand-blue" />
                <h3 className="text-base font-bold text-brand-navy m-0">Compare Projects</h3>
              </div>
              <p className="text-xs text-brand-slate leading-relaxed mb-4">
                Analyze local rates, ongoing developer construction records, municipal approval logs, and RERA updates side-by-side for up to three projects inside <span className="font-extrabold">{latestWatchlist.locality || "your location"}</span>.
              </p>
            </div>
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-blue-bg text-brand-blue px-2.5 py-1 rounded border border-brand-blue-border">
                Compare engine coming soon
              </span>
            </div>
          </div>

          {/* Buy Requests */}
          <div className="bg-brand-bg-card p-6 rounded-3xl border border-brand-border shadow-brand flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-brand-border">
                <ShoppingBag size={18} className="text-brand-blue" />
                <h3 className="text-base font-bold text-brand-navy m-0">Verified Buy Requests</h3>
              </div>
              <p className="text-xs text-brand-slate leading-relaxed mb-4">
                Submit certified buying interest ledgers anonymously to active developers and builders. Skip brokers and unlock exclusive inventory rates direct from site management offices.
              </p>
            </div>
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-blue-bg text-brand-blue px-2.5 py-1 rounded border border-brand-blue-border">
                Buy requests coming soon
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Update Watchlist Modal Popup */}
      {editModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm" onClick={() => setEditModalOpen(false)} />
          <div className="relative w-full max-w-4xl bg-brand-bg-card rounded-3xl overflow-hidden shadow-2xl border border-brand-border max-h-[90vh] flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex-1 overflow-y-auto">
              <WatchlistFlow 
                onClose={() => setEditModalOpen(false)} 
                onSubmitSuccess={() => {
                  setEditModalOpen(false);
                  fetchWatchlists();
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  Plus, 
  X, 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  Activity, 
  FileText,
  PlusCircle,
  HelpCircle
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PortfolioCard from "@/components/dashboard/PortfolioCard";
import PerformanceChart from "@/components/ui/PerformanceChart";
import PortfolioFlow from "@/components/forms/PortfolioFlow";
import { calculateValuation } from "@/utils/calculations/valuation";

export default function PortfolioPage() {
  const [mounted, setMounted] = useState(false);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);

  async function fetchPortfolios() {
    try {
      setLoading(true);
      const res = await fetch("/api/portfolio");
      if (!res.ok) {
        throw new Error("Failed to fetch portfolio");
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const formatted = json.data.map((item) => ({
          ...item,
          id: item._id || item.id,
        }));
        setPortfolios(formatted);
      } else {
        throw new Error(json.error || "Failed to load portfolios");
      }
    } catch (err) {
      console.error("Error loading portfolio properties:", err);
      setError(err.message || "Could not fetch portfolios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
    fetchPortfolios();
  }, []);

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="mb-8 animate-pulse">
          <h1 className="text-3xl font-extrabold text-brand-navy mb-2">Portfolio</h1>
          <div className="h-4 w-48 bg-brand-bgAlt rounded mb-4" />
        </div>
      </DashboardLayout>
    );
  }

  // Calculate Aggregated Metrics
  const calculatedPortfolios = portfolios.map(p => {
    const val = calculateValuation({
      totalPricePaid: p.totalPricePaid,
      superArea: p.superArea,
      projectType: p.projectType
    });
    return {
      ...p,
      valuation: val
    };
  });

  const totalInvested = calculatedPortfolios.reduce((sum, p) => sum + p.valuation.price, 0);
  const totalValue = calculatedPortfolios.reduce((sum, p) => sum + p.valuation.currentMarketValue, 0);
  const netGain = totalValue - totalInvested;
  const gainPct = totalInvested > 0 ? ((netGain / totalInvested) * 100).toFixed(1) : "0.0";
  
  const totalMonthlyRent = calculatedPortfolios.reduce((sum, p) => {
    if (p.rentalIncome === "Yes" && p.monthlyRent) {
      return sum + Number(p.monthlyRent);
    }
    return sum;
  }, 0);

  const averageYield = totalInvested > 0 ? ((totalMonthlyRent * 12 / totalInvested) * 100).toFixed(2) : "0.00";

  const formatCurrency = (num) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  // Aggregated Performance Timeline
  const getAggregatedTimelineData = () => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
    
    return years.map(year => {
      let totalVal = 0;
      calculatedPortfolios.forEach(p => {
        const val = p.valuation;
        let purchaseYear = null;
        if (p.possessionStatus === "Already Taken" && p.possessionDateYear) {
          purchaseYear = parseInt(p.possessionDateYear);
        } else if (p.expectedPossessionYear) {
          purchaseYear = parseInt(p.expectedPossessionYear);
        }
        if (!purchaseYear || isNaN(purchaseYear)) purchaseYear = currentYear - 4;
        
        if (year < purchaseYear) {
          totalVal += val.price;
        } else {
          const yearsDiff = currentYear - purchaseYear;
          if (yearsDiff <= 0) {
            totalVal += val.currentMarketValue;
          } else {
            const ratio = Math.min(1, (year - purchaseYear) / yearsDiff);
            totalVal += val.price + (val.currentMarketValue - val.price) * ratio;
          }
        }
      });
      return {
        year: year.toString(),
        value: Math.round(totalVal),
        label: year === currentYear ? "Current Valuation" : "Estimated Value"
      };
    });
  };

  // If loading and has no local state yet
  if (loading && portfolios.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
              <div className="h-8 w-44 bg-brand-bgAlt rounded-lg animate-pulse" />
              <div className="h-4 w-72 bg-brand-bgAlt rounded-lg animate-pulse" />
            </div>
            <div className="h-10 w-36 bg-brand-bgAlt rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-brand-bgCard rounded-2xl border border-brand-border animate-pulse" />
            ))}
          </div>
          <div className="h-[260px] bg-brand-bgCard rounded-2xl border border-brand-border animate-pulse mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-56 bg-brand-bgCard rounded-2xl border border-brand-border animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If user has not onboarded any properties yet, render the setup flow full-page
  if (portfolios.length === 0) {
    return (
      <PortfolioFlow onSubmitSuccess={() => fetchPortfolios()} />
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto pb-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-navy mb-1.5 tracking-tight flex items-center gap-2">
              <Building2 className="text-brand-amber" size={28} /> My Properties Portfolio
            </h1>
            <p className="text-xs sm:text-sm text-brand-slate m-0">
              ⚠️ Prototype valuation based on user-provided purchase data. Real market intelligence integration coming soon.
            </p>
          </div>
          
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-amberLight to-[#EA580C] text-white rounded-xl text-sm font-bold border-none shadow-brand-amber hover:-translate-y-0.5 cursor-pointer transition-all duration-200 animate-in fade-in slide-in-from-right-3"
          >
            <Plus size={16} strokeWidth={2.5} /> Track New Property
          </button>
        </div>

        {/* Valuation Summary stats widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1: Total Portfolio Value */}
          <div className="bg-brand-bgCard p-5 rounded-2xl border border-brand-border shadow-brand flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-tealBg flex items-center justify-center flex-shrink-0">
              <IndianRupee size={22} className="text-brand-teal" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-brand-slate uppercase tracking-wider mb-0.5 m-0">Portfolio Value</p>
              <h3 className="text-xl font-black text-brand-navy m-0">{formatCurrency(totalValue)}</h3>
            </div>
          </div>

          {/* Card 2: Total Invested */}
          <div className="bg-brand-bgCard p-5 rounded-2xl border border-brand-border shadow-brand flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-navy/5 flex items-center justify-center flex-shrink-0">
              <Building2 size={22} className="text-brand-navy" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-brand-slate uppercase tracking-wider mb-0.5 m-0">Capital Invested</p>
              <h3 className="text-xl font-black text-brand-navy m-0">{formatCurrency(totalInvested)}</h3>
            </div>
          </div>

          {/* Card 3: Net Capital Gain */}
          <div className="bg-brand-bgCard p-5 rounded-2xl border border-brand-border shadow-brand flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${netGain >= 0 ? 'bg-brand-emeraldBg' : 'bg-brand-redBg'}`}>
              {netGain >= 0 ? (
                <TrendingUp size={22} className="text-brand-emerald" />
              ) : (
                <TrendingDown size={22} className="text-brand-red" />
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-brand-slate uppercase tracking-wider mb-0.5 m-0">Appreciation</p>
              <h3 className={`text-xl font-black m-0 ${netGain >= 0 ? 'text-brand-emerald' : 'text-brand-red'}`}>
                {netGain >= 0 ? "+" : ""}{formatCurrency(netGain)}
              </h3>
              <p className={`text-[10px] font-bold m-0 mt-0.5 ${netGain >= 0 ? 'text-brand-emerald' : 'text-brand-red'}`}>
                {netGain >= 0 ? "+" : ""}{gainPct}% total returns
              </p>
            </div>
          </div>

          {/* Card 4: Rental Income */}
          <div className="bg-brand-bgCard p-5 rounded-2xl border border-brand-border shadow-brand flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-amberBg flex items-center justify-center flex-shrink-0">
              <IndianRupee size={22} className="text-brand-amber" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-brand-slate uppercase tracking-wider mb-0.5 m-0">Monthly Rent</p>
              <h3 className="text-xl font-black text-brand-navy m-0">{formatCurrency(totalMonthlyRent)}</h3>
              <p className="text-[10px] text-brand-slateLight font-bold m-0 mt-0.5">{averageYield}% average yield</p>
            </div>
          </div>
        </div>

        {/* Aggregated Performance Section */}
        <div className="bg-brand-bgCard p-6 rounded-3xl border border-brand-border shadow-brand mb-8">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-brand-border">
            <Activity size={18} className="text-brand-teal" />
            <h2 className="text-lg font-bold text-brand-navy m-0">Portfolio Market Performance</h2>
          </div>
          
          <div className="mb-4">
            <PerformanceChart data={getAggregatedTimelineData()} />
          </div>

          <div className="p-3 rounded-xl bg-brand-tealBg border border-brand-tealBorder/40 flex items-start gap-2">
            <TrendingUp size={16} className="text-brand-teal mt-0.5 flex-shrink-0" />
            <p className="text-xs text-brand-tealDark font-semibold m-0 leading-relaxed">
              Your real estate portfolio has experienced an overall appreciation of <span className="font-black">{gainPct}%</span> since purchase. Check back for real market data integrations.
            </p>
          </div>
        </div>

        {/* My Properties & Grid */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-5">
            <Building2 size={20} className="text-brand-navy" />
            <h2 className="text-lg font-extrabold text-brand-navy m-0">My Properties ({portfolios.length})</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio) => (
              <PortfolioCard key={portfolio.id} property={portfolio} />
            ))}
          </div>
        </div>

        {/* Reports & PDF Downloads */}
        <div className="bg-brand-bgCard p-6 rounded-3xl border border-brand-border shadow-brand">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-brand-border">
            <FileText size={18} className="text-brand-amber" />
            <h2 className="text-lg font-bold text-brand-navy m-0">Reports & Analytics</h2>
          </div>
          <p className="text-xs sm:text-sm text-brand-slate leading-relaxed mb-4">
            Get comprehensive, PDF-compiled valuation summaries and legal risk profiles for all your tracked properties. Click individual property cards above to generate and download their official reports.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-brand-border bg-brand-bgAlt">
              <h4 className="text-sm font-bold text-brand-navy mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-teal" /> Portfolio Performance PDF
              </h4>
              <p className="text-xs text-brand-slate mb-3 leading-relaxed">
                Consolidate your entire capital appreciation metrics, yield rates, and active bank EMIs into one executive digest.
              </p>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-brand-borderMid text-brand-slate rounded">
                Coming Soon
              </span>
            </div>
            <div className="p-4 rounded-xl border border-brand-border bg-brand-bgAlt">
              <h4 className="text-sm font-bold text-brand-navy mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-teal" /> Builder Risk Ledger
              </h4>
              <p className="text-xs text-brand-slate mb-3 leading-relaxed">
                Aggregated daily legal notifications, news analysis, and construction progress scores for your portfolio builders.
              </p>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-brand-borderMid text-brand-slate rounded">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Track New Property Modal Popup */}
      {addModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm" onClick={() => setAddModalOpen(false)} />
          <div className="relative w-full max-w-4xl bg-brand-bgCard rounded-3xl overflow-hidden shadow-2xl border border-brand-border max-h-[90vh] flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex-1 overflow-y-auto">
              <PortfolioFlow 
                onClose={() => setAddModalOpen(false)} 
                onSubmitSuccess={() => {
                  setAddModalOpen(false);
                  fetchPortfolios();
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

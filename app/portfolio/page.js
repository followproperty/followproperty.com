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
    fetchPortfolios();
  }, []);

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
              <div className="h-8 w-44 bg-brand-bg-alt rounded-lg animate-pulse" />
              <div className="h-4 w-72 bg-brand-bg-alt rounded-lg animate-pulse" />
            </div>
            <div className="h-10 w-36 bg-brand-bg-alt rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-brand-bg-card rounded-2xl border border-brand-border animate-pulse" />
            ))}
          </div>
          <div className="h-[260px] bg-brand-bg-card rounded-2xl border border-brand-border animate-pulse mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-56 bg-brand-bg-card rounded-2xl border border-brand-border animate-pulse" />
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
          <div className="hidden sm:block">
            <h1 className="text-3xl font-extrabold text-brand-navy mb-1.5 tracking-tight">
              My Properties Portfolio
            </h1>
            <p className="text-xs sm:text-sm text-brand-slate m-0 flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-blue-bg text-brand-blue border border-brand-blue-border text-[10px] font-bold uppercase tracking-wide">Prototype Simulation</span>
              <span>Valuations and appreciation calculations are simulated based on static mock metrics. Live market intelligence coming soon.</span>
            </p>
          </div>
          
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:px-5 sm:py-3 bg-linear-to-r from-brand-navy-deep to-brand-navy-mid text-white rounded-xl text-xs sm:text-sm font-bold border border-white/5 cursor-pointer shadow-brand-md transition-all duration-250 hover:-translate-y-0.5 hover:border-brand-blue-border hover:shadow-[0_12px_36px_rgba(50,95,236,0.14)]"
          >
            <Plus size={14} strokeWidth={2.5} /> Track New Property
          </button>
        </div>

        {/* Valuation Summary stats widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8">
          {/* Card 1: Total Portfolio Value */}
          <div className="bg-brand-bg-card p-3.5 sm:p-5 rounded-2xl border border-brand-border shadow-brand flex items-center gap-2.5 sm:gap-4">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-brand-blue-bg flex items-center justify-center flex-shrink-0">
              <IndianRupee size={22} className="text-brand-blue w-4 h-4 sm:w-[22px] sm:h-[22px]" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[11px] font-semibold text-brand-slate uppercase tracking-wider mb-0.5 m-0 truncate">Demo Portfolio Value</p>
              <h3 className="text-sm sm:text-xl font-black text-brand-navy m-0 truncate">{formatCurrency(totalValue)}</h3>
              <p className="text-[8px] sm:text-[10px] text-brand-slate font-bold m-0 mt-0.5 truncate">Simulated estimate value</p>
            </div>
          </div>

          {/* Card 2: Total Invested */}
          <div className="bg-brand-bg-card p-3.5 sm:p-5 rounded-2xl border border-brand-border shadow-brand flex items-center gap-2.5 sm:gap-4">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-brand-blue-bg flex items-center justify-center flex-shrink-0">
              <Building2 size={22} className="text-brand-blue w-4 h-4 sm:w-[22px] sm:h-[22px]" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[11px] font-semibold text-brand-slate uppercase tracking-wider mb-0.5 m-0 truncate">Capital Invested</p>
              <h3 className="text-sm sm:text-xl font-black text-brand-navy m-0 truncate">{formatCurrency(totalInvested)}</h3>
              <p className="text-[8px] sm:text-[10px] text-brand-slate font-bold m-0 mt-0.5 truncate">Total paid capital basis</p>
            </div>
          </div>

          {/* Card 3: Net Capital Gain */}
          <div className="bg-brand-bg-card p-3.5 sm:p-5 rounded-2xl border border-brand-border shadow-brand flex items-center gap-2.5 sm:gap-4">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-brand-blue-bg flex items-center justify-center flex-shrink-0">
              {netGain >= 0 ? (
                <TrendingUp size={22} className="text-brand-blue w-4 h-4 sm:w-[22px] sm:h-[22px]" />
              ) : (
                <TrendingDown size={22} className="text-brand-blue w-4 h-4 sm:w-[22px] sm:h-[22px]" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[11px] font-semibold text-brand-slate uppercase tracking-wider mb-0.5 m-0 truncate">Simulated Appreciation</p>
              <h3 className="text-sm sm:text-xl font-black text-brand-navy m-0 truncate">
                {netGain >= 0 ? "+" : ""}{formatCurrency(netGain)}
              </h3>
              <p className="text-[8px] sm:text-[10px] font-bold m-0 mt-0.5 truncate text-brand-slate">
                {netGain >= 0 ? "+" : ""}{gainPct}% simulated returns
              </p>
            </div>
          </div>

          {/* Card 4: Rental Income */}
          <div className="bg-brand-bg-card p-3.5 sm:p-5 rounded-2xl border border-brand-border shadow-brand flex items-center gap-2.5 sm:gap-4">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-brand-blue-bg flex items-center justify-center flex-shrink-0">
              <IndianRupee size={22} className="text-brand-blue w-4 h-4 sm:w-[22px] sm:h-[22px]" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[11px] font-semibold text-brand-slate uppercase tracking-wider mb-0.5 m-0 truncate">Simulated Monthly Rent</p>
              <h3 className="text-sm sm:text-xl font-black text-brand-navy m-0 truncate">{formatCurrency(totalMonthlyRent)}</h3>
              <p className="text-[8px] sm:text-[10px] text-brand-slate font-bold m-0 mt-0.5 truncate">{averageYield}% simulated yield</p>
            </div>
          </div>
        </div>

        {/* Aggregated Performance Section */}
        <div className="card-frame p-6 hover:transform-none mb-8">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-brand-border">
            <Activity size={18} className="text-brand-blue" />
            <h2 className="text-lg font-bold text-brand-navy m-0">Portfolio Market Performance (Simulation)</h2>
          </div>
          
          <div className="mb-4">
            <PerformanceChart data={getAggregatedTimelineData()} />
          </div>
 
          <div className="alert-blue items-start p-3 gap-2">
            <TrendingUp size={16} className="text-brand-blue mt-0.5 flex-shrink-0" />
            <p className="text-xs text-brand-blue-dark font-semibold m-0 leading-relaxed">
              Your real estate portfolio has experienced an overall simulated appreciation of <span className="font-black text-brand-amber">{gainPct}%</span> since purchase. Check back for real market data integrations.
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
        <div className="card-frame p-6 hover:transform-none">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-brand-border">
            <FileText size={18} className="text-brand-blue" />
            <h2 className="text-lg font-bold text-brand-navy m-0">Reports & Analytics</h2>
          </div>
          <p className="text-xs sm:text-sm text-brand-slate leading-relaxed mb-4">
            Get comprehensive, PDF-compiled valuation summaries and legal risk profiles for all your tracked properties. Click individual property cards above to generate and download their official reports.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card-frame p-4 hover:transform-none">
              <h4 className="text-sm font-bold text-brand-navy mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-blue" /> Portfolio Performance PDF
              </h4>
              <p className="text-xs text-brand-slate mb-3 leading-relaxed">
                Consolidate your entire capital appreciation metrics, yield rates, and active bank EMIs into one executive digest.
              </p>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-brand-border-mid text-brand-slate rounded">
                Coming Soon
              </span>
            </div>
            <div className="card-frame p-4 hover:transform-none">
              <h4 className="text-sm font-bold text-brand-navy mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-blue" /> Builder Risk Ledger
              </h4>
              <p className="text-xs text-brand-slate mb-3 leading-relaxed">
                Aggregated daily legal notifications, news analysis, and construction progress scores for your portfolio builders.
              </p>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-brand-border-mid text-brand-slate rounded">
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
          <div className="relative w-full max-w-4xl bg-brand-bg-card rounded-3xl overflow-hidden shadow-2xl border border-brand-border max-h-[90vh] flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
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

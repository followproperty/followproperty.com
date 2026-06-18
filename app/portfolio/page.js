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
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell
} from "recharts";
import PortfolioFlow from "@/components/forms/PortfolioFlow";

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("value-comparison");
  const [locationGroup, setLocationGroup] = useState("city");

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

  // Aggregated Metrics directly from backend valuation snapshots
  const calculatedPortfolios = portfolios.map(p => ({
    ...p,
    valuation: p.valuation || {
      price: Number(p.totalPricePaid) || 0,
      purchaseRate: Math.round((Number(p.totalPricePaid) || 0) / (Number(p.superArea) || 1)),
      medianRate: 0,
      currentMarketValue: 0,
      gain: 0,
      gainPct: "0.0",
      projectRate: null,
      comparableRate: null,
      governmentRate: null,
      lastCalculatedAt: new Date()
    }
  }));

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

  const highestAppreciatingAsset = React.useMemo(() => {
    if (calculatedPortfolios.length === 0) return "N/A";
    let bestAsset = "None";
    let maxGain = -Infinity;
    calculatedPortfolios.forEach(p => {
      const gain = p.valuation.gain || 0;
      if (gain > maxGain) {
        maxGain = gain;
        bestAsset = p.projectName;
      }
    });
    return maxGain > 0 ? bestAsset : "None";
  }, [calculatedPortfolios]);

  const bestPerformingCity = React.useMemo(() => {
    if (calculatedPortfolios.length === 0) return "N/A";
    const cityGains = {};
    calculatedPortfolios.forEach(p => {
      const city = p.city || "Unknown";
      const gain = p.valuation.gain || 0;
      cityGains[city] = (cityGains[city] || 0) + gain;
    });
    let bestCity = "None";
    let maxGain = -Infinity;
    Object.entries(cityGains).forEach(([city, gain]) => {
      if (gain > maxGain) {
        maxGain = gain;
        bestCity = city;
      }
    });
    return maxGain > 0 ? bestCity : "None";
  }, [calculatedPortfolios]);

  const formatCurrency = (num) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  // Location grouping aggregator
  const locationAllocationData = React.useMemo(() => {
    const groupings = {};
    calculatedPortfolios.forEach(p => {
      const key = locationGroup === "city" 
        ? (p.city || "Other").trim() 
        : (p.state || p.city || "Other").trim();
      
      if (!groupings[key]) {
        groupings[key] = {
          name: key,
          invested: 0,
          currentValue: 0,
          gain: 0
        };
      }
      groupings[key].invested += p.valuation.price;
      groupings[key].currentValue += p.valuation.currentMarketValue;
      groupings[key].gain += p.valuation.gain;
    });

    return Object.values(groupings).map(group => ({
      ...group,
      gainPct: group.invested > 0 ? ((group.gain / group.invested) * 100).toFixed(1) : "0.0"
    }));
  }, [calculatedPortfolios, locationGroup]);

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
              <span>Real-time valuations and appreciation calculated based on circle rates and comparable transactions.</span>
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
              <p className="text-[9px] sm:text-[11px] font-semibold text-brand-slate uppercase tracking-wider mb-0.5 m-0 truncate">Portfolio Value</p>
              <h3 className="text-sm sm:text-xl font-black text-brand-navy m-0 truncate">{formatCurrency(totalValue)}</h3>
              <p className="text-[8px] sm:text-[10px] text-brand-slate font-bold m-0 mt-0.5 truncate">Estimated market value</p>
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
              <p className="text-[9px] sm:text-[11px] font-semibold text-brand-slate uppercase tracking-wider mb-0.5 m-0 truncate">Capital Appreciation</p>
              <h3 className="text-sm sm:text-xl font-black text-brand-navy m-0 truncate">
                {netGain >= 0 ? "+" : ""}{formatCurrency(netGain)}
              </h3>
              <p className="text-[8px] sm:text-[10px] font-bold m-0 mt-0.5 truncate text-brand-slate">
                {netGain >= 0 ? "+" : ""}{gainPct}% returns
              </p>
            </div>
          </div>

          {/* Card 4: Rental Income */}
          <div className="bg-brand-bg-card p-3.5 sm:p-5 rounded-2xl border border-brand-border shadow-brand flex items-center gap-2.5 sm:gap-4">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-brand-blue-bg flex items-center justify-center flex-shrink-0">
              <IndianRupee size={22} className="text-brand-blue w-4 h-4 sm:w-[22px] sm:h-[22px]" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[11px] font-semibold text-brand-slate uppercase tracking-wider mb-0.5 m-0 truncate">Monthly Rent</p>
              <h3 className="text-sm sm:text-xl font-black text-brand-navy m-0 truncate">{formatCurrency(totalMonthlyRent)}</h3>
              <p className="text-[8px] sm:text-[10px] text-brand-slate font-bold m-0 mt-0.5 truncate">{averageYield}% yield</p>
            </div>
          </div>
        </div>

        {/* Compact Investor Insights Strip */}
        <div className="bg-brand-bg-card border border-brand-border rounded-2xl p-4 mb-8 shadow-brand flex flex-col md:flex-row md:items-center justify-between gap-y-3 gap-x-6">
          <div className="flex flex-1 items-center justify-between md:justify-start gap-4">
            <span className="text-[10px] text-brand-slate uppercase font-bold tracking-wider">Highest Appreciating Asset</span>
            <span className="text-xs font-black text-brand-navy truncate max-w-[180px]">{highestAppreciatingAsset}</span>
          </div>
          <div className="hidden md:block w-[1px] h-5 bg-brand-border" />
          <div className="flex flex-1 items-center justify-between md:justify-start gap-4">
            <span className="text-[10px] text-brand-slate uppercase font-bold tracking-wider">Best Performing City</span>
            <span className="text-xs font-black text-brand-navy">{bestPerformingCity}</span>
          </div>
          <div className="hidden md:block w-[1px] h-5 bg-brand-border" />
          <div className="flex flex-1 items-center justify-between md:justify-start gap-4">
            <span className="text-[10px] text-brand-slate uppercase font-bold tracking-wider">Properties Tracked</span>
            <span className="text-xs font-black text-brand-navy">{calculatedPortfolios.length}</span>
          </div>
          <div className="hidden md:block w-[1px] h-5 bg-brand-border" />
          <div className="flex flex-1 items-center justify-between md:justify-start gap-4">
            <span className="text-[10px] text-brand-slate uppercase font-bold tracking-wider">Total Monthly Rent</span>
            <span className="text-xs font-black text-brand-navy">{formatCurrency(totalMonthlyRent)}</span>
          </div>
        </div>

        {/* Aggregated Performance Section */}
        <div className="card-frame p-6 hover:transform-none mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-brand-blue" />
              <h2 className="text-lg font-bold text-brand-navy m-0">Portfolio Investor Insights</h2>
            </div>
            
            {/* Tabs Selector */}
            <div className="flex gap-1 bg-brand-bg-alt p-1 rounded-xl border border-brand-border-mid">
              {[
                { id: "value-comparison", label: "Portfolio Value" },
                { id: "gain-contribution", label: "Gain Contribution" },
                { id: "location-allocation", label: "Geographic Allocation" }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-brand-blue text-white shadow-sm"
                      : "text-brand-slate hover:text-brand-navy bg-transparent border-none"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            {activeTab === "value-comparison" && (
              <div>
                <p className="text-xs text-brand-slate mb-4 leading-relaxed">
                  Comparing your total capital invested vs. the current estimated market value for each tracked asset.
                </p>
                <div className="w-full h-[260px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={calculatedPortfolios.map(p => ({
                        name: p.projectName,
                        Invested: p.valuation.price,
                        CurrentValue: p.valuation.currentMarketValue
                      }))}
                      margin={{ top: 10, right: 10, left: 12, bottom: 5 }}
                    >
                      <XAxis
                        dataKey="name"
                        stroke="#94A3B8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        dy={6}
                        className="font-semibold text-brand-slate"
                      />
                      <YAxis
                        stroke="#94A3B8"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => {
                          if (val >= 10000000) return `${(val / 10000000).toFixed(1)} Cr`;
                          if (val >= 100000) return `${(val / 100000).toFixed(0)} L`;
                          return val.toLocaleString();
                        }}
                        dx={-4}
                        className="font-semibold text-brand-slate"
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-brand-navy p-3 rounded-xl border border-brand-border shadow-brand text-xs text-white">
                                <p className="font-bold mb-1.5 m-0">{payload[0].payload.name}</p>
                                <div className="space-y-1">
                                  <p className="m-0 text-[#94a3b8]">
                                    Capital Invested: <span className="font-extrabold text-white">{formatCurrency(payload[0].value)}</span>
                                  </p>
                                  <p className="m-0 text-[#94a3b8]">
                                    Current Value: <span className="font-extrabold text-brand-blue-light">{formatCurrency(payload[1].value)}</span>
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36} 
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="Invested" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Capital Invested" />
                      <Bar dataKey="CurrentValue" fill="#325FEC" radius={[4, 4, 0, 0]} name="Current Value" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === "gain-contribution" && (
              <div>
                <p className="text-xs text-brand-slate mb-4 leading-relaxed">
                  Absolute capital gain contribution from each asset. Positive values represent net profit.
                </p>
                <div className="w-full h-[260px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={calculatedPortfolios.map(p => ({
                        name: p.projectName,
                        Gain: p.valuation.gain
                      }))}
                      margin={{ top: 10, right: 10, left: 12, bottom: 5 }}
                    >
                      <XAxis
                        dataKey="name"
                        stroke="#94A3B8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        dy={6}
                        className="font-semibold text-brand-slate"
                      />
                      <YAxis
                        stroke="#94A3B8"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => {
                          if (val >= 10000000) return `${(val / 10000000).toFixed(1)} Cr`;
                          if (val >= 100000) return `${(val / 100000).toFixed(0)} L`;
                          return val.toLocaleString();
                        }}
                        dx={-4}
                        className="font-semibold text-brand-slate"
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const val = payload[0].value;
                            return (
                              <div className="bg-brand-navy p-3 rounded-xl border border-brand-border shadow-brand text-xs text-white">
                                <p className="font-bold mb-1 m-0">{payload[0].payload.name}</p>
                                <p className={`font-extrabold m-0 ${val >= 0 ? "text-brand-emerald" : "text-brand-red"}`}>
                                  Net Appreciation: {val >= 0 ? "+" : ""}{formatCurrency(val)}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="Gain" radius={[4, 4, 0, 0]}>
                        {calculatedPortfolios.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.valuation.gain >= 0 ? "#10B981" : "#EF4444"} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === "location-allocation" && (
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <p className="text-xs text-brand-slate leading-relaxed m-0">
                    Breakdown of capital invested and current value grouped by location.
                  </p>
                  
                  {/* City/State Toggle */}
                  <div className="flex gap-1 bg-brand-bg-alt p-0.5 rounded-lg border border-brand-border">
                    {[
                      { id: "city", label: "By City" },
                      { id: "state", label: "By State" }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLocationGroup(opt.id)}
                        className={`px-2.5 py-1 rounded-md font-bold text-[10px] cursor-pointer transition-all duration-200 ${
                          locationGroup === opt.id
                            ? "bg-brand-navy text-white shadow-xs"
                            : "text-brand-slate hover:text-brand-navy bg-transparent border-none"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="w-full h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={locationAllocationData}
                        margin={{ top: 10, right: 10, left: 12, bottom: 5 }}
                      >
                        <XAxis
                          dataKey="name"
                          stroke="#94A3B8"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          dy={6}
                          className="font-semibold text-brand-slate"
                        />
                        <YAxis
                          stroke="#94A3B8"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => {
                            if (val >= 10000000) return `${(val / 10000000).toFixed(1)} Cr`;
                            if (val >= 100000) return `${(val / 100000).toFixed(0)} L`;
                            return val.toLocaleString();
                          }}
                          dx={-4}
                          className="font-semibold text-brand-slate"
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-brand-navy p-3 rounded-xl border border-brand-border shadow-brand text-xs text-white">
                                  <p className="font-bold mb-1.5 m-0">{data.name}</p>
                                  <div className="space-y-1">
                                    <p className="m-0 text-[#94a3b8]">
                                      Invested: <span className="font-extrabold text-white">{formatCurrency(data.invested)}</span>
                                    </p>
                                    <p className="m-0 text-[#94a3b8]">
                                      Current Value: <span className="font-extrabold text-brand-blue-light">{formatCurrency(data.currentValue)}</span>
                                    </p>
                                    <p className="m-0 text-brand-emerald">
                                      Returns: +{data.gainPct}%
                                    </p>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="currentValue" fill="#3B82F6" name="Current Value" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Location lists detail */}
                  <div className="space-y-3">
                    <span className="text-[10px] text-brand-slate font-bold uppercase tracking-wider">Allocation Ledger</span>
                    <div className="divide-y divide-brand-border max-h-[200px] overflow-y-auto pr-2">
                      {locationAllocationData.map(group => (
                        <div key={group.name} className="py-2.5 flex justify-between items-center">
                          <div>
                            <span className="text-xs font-extrabold text-brand-navy-deep">{group.name}</span>
                            <div className="text-[10px] text-brand-slate mt-0.5 font-medium">
                              Invested: {formatCurrency(group.invested)}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-brand-navy">{formatCurrency(group.currentValue)}</span>
                            <div className="text-[10px] text-brand-emerald mt-0.5 font-bold">
                              +{group.gainPct}% returns
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
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

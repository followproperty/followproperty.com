"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  ListPlus,
  ShieldAlert,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  MapPin,
  FolderOpen,
  Plus,
  Info,
  Search,
  ChevronDown
} from "lucide-react";

export default function DashboardMockup({ activeTab: controlledTab, onTabChange }) {
  const [localTab, setLocalTab] = useState("overview");
  const isControlled = controlledTab !== undefined;
  const currentTab = isControlled ? controlledTab : localTab;

  const handleTabClick = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setLocalTab(tabId);
    }
  };

  const getTabUrl = () => {
    switch (currentTab) {
      case "overview":
        return "followproperty.com/dashboard/overview";
      case "portfolio":
        return "followproperty.com/dashboard/portfolio";
      case "watchlist":
        return "followproperty.com/dashboard/watchlist";
      case "projects":
        return "followproperty.com/dashboard/projects";
      case "rera":
        return "followproperty.com/dashboard/rera-timeline";
      case "rates":
        return "followproperty.com/dashboard/circle-rates";
      default:
        return "followproperty.com/dashboard";
    }
  };

  const tabsList = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "portfolio", label: "Portfolio", icon: Building2 },
    { id: "watchlist", label: "Watchlist", icon: ListPlus },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "rera", label: "RERA Registry", icon: ShieldAlert },
    { id: "rates", label: "Circle Rates", icon: TrendingUp },
  ];

  return (
    <div className="w-full bg-white/80 backdrop-blur-md rounded-2xl border border-brand-border-mid shadow-brand-lg overflow-hidden flex flex-col select-none text-left relative z-20">
      {/* Browser Top Bar Header */}
      <div className="bg-brand-bg-alt/70 px-4 py-3.5 border-b border-brand-border-mid flex items-center gap-3">
        <div className="flex gap-1.5 shrink-0">
          <span className="w-3 h-3 rounded-full bg-red-400/80 inline-block" />
          <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
          <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
        </div>
        <div className="flex-1 max-w-[420px] bg-white border border-brand-border text-[11px] font-semibold text-brand-slate py-1 px-3.5 rounded-lg flex items-center justify-between shadow-inner">
          <span className="truncate text-[10.5px] font-mono tracking-tight text-brand-navy-mid select-all">{getTabUrl()}</span>
          <span className="text-brand-emerald text-[9px] font-bold tracking-wider uppercase flex items-center gap-1 shrink-0 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald inline-block animate-pulse" /> Live
          </span>
        </div>
      </div>

      {/* Browser Workspace Content */}
      <div className="flex flex-1 min-h-[380px] md:h-[420px] relative overflow-hidden bg-white/40">
        {/* Left Sidebar (Desktop Only) */}
        <div className="w-[185px] bg-brand-bg-alt/40 border-r border-brand-border p-4 hidden md:flex flex-col gap-5 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <img src="/favicon.svg" alt="FollowProperty" className="w-5 h-5 object-contain" />
            <span className="font-extrabold text-[12px] text-brand-navy tracking-tight">FollowProperty</span>
          </div>
          <div className="flex flex-col gap-1">
            {tabsList.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-2.5 text-[11px] font-bold py-2 px-2.5 rounded-lg border transition-all text-left cursor-pointer ${
                    isActive
                      ? "text-brand-blue bg-white border-brand-blue-border/25 shadow-xs font-black"
                      : "text-brand-slate hover:text-brand-navy border-transparent bg-transparent hover:bg-white/50"
                  }`}
                >
                  <Icon size={13} className={isActive ? "text-brand-blue" : "text-brand-slate-light"} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Workspace Content Display Area */}
        <div className="flex-1 p-4.5 sm:p-5 flex flex-col justify-between overflow-hidden">
          
          {/* Mobile Swapper Tab Tags (Mobile Only) */}
          <div className="flex md:hidden flex-wrap gap-1.5 mb-4 pb-2 border-b border-brand-border-mid overflow-x-auto scrollbar-none">
            {tabsList.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold border shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? "bg-white border-brand-blue-border/30 text-brand-blue shadow-xs font-black"
                      : "bg-transparent border-transparent text-brand-slate"
                  }`}
                >
                  <Icon size={11} />
                  {item.label.split(" ")[0]}
                </button>
              );
            })}
          </div>

          {/* Dynamic Tab Body Render */}
          <div className="flex-1 overflow-y-auto scrollbar-none">
            <AnimatePresence mode="wait">
              {currentTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-4"
                >
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="bg-white p-3 rounded-xl border border-brand-border shadow-3xs flex flex-col justify-between min-h-[80px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[8.5px] font-bold text-brand-slate-light uppercase tracking-wider">Portfolio</span>
                        <Building2 size={12} className="text-brand-amber" />
                      </div>
                      <div className="mt-1">
                        <div className="text-[14px] font-black text-brand-navy tracking-tight">₹12.45 Cr</div>
                        <div className="text-[8.5px] font-extrabold text-brand-emerald mt-0.5">+24.8% YoY</div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-brand-border shadow-3xs flex flex-col justify-between min-h-[80px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[8.5px] font-bold text-brand-slate-light uppercase tracking-wider">Watchlist</span>
                        <ListPlus size={12} className="text-brand-blue" />
                      </div>
                      <div className="mt-1">
                        <div className="text-[14px] font-black text-brand-navy tracking-tight">3 local areas</div>
                        <div className="text-[8.5px] font-extrabold text-brand-blue mt-0.5">14 active alerts</div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-brand-border shadow-3xs flex flex-col justify-between min-h-[80px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[8.5px] font-bold text-brand-slate-light uppercase tracking-wider">Alerts</span>
                        <ShieldAlert size={12} className="text-brand-red" />
                      </div>
                      <div className="mt-1">
                        <div className="text-[14px] font-black text-brand-navy tracking-tight">1 Flagged</div>
                        <div className="text-[8.5px] font-extrabold text-brand-red mt-0.5">Possession delay</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-brand-red-bg border border-brand-red-border/60 rounded-xl p-3 flex items-start gap-3 shadow-3xs">
                    <div className="w-5 h-5 rounded-full bg-brand-red text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      !
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-[10px] font-bold text-brand-navy m-0">Skyline Residency delayed</h4>
                        <span className="text-[7px] font-extrabold bg-brand-red text-white px-1 py-0.2 rounded tracking-widest uppercase">Warning</span>
                      </div>
                      <p className="text-[9.5px] text-brand-navy-mid leading-normal mt-0.5 m-0 font-semibold">
                        Possession extended by 6 months in official RERA filings. Portfolio warning active.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentTab === "portfolio" && (
                <motion.div
                  key="portfolio"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-3.5"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-[12px] font-black text-brand-navy tracking-tight m-0">My Real Estate Portfolio</h3>
                      <p className="text-[8.5px] text-brand-slate mt-0.5 m-0 font-semibold leading-relaxed">
                        Calculated appreciation based on government circle rates and verified registry logs.
                      </p>
                    </div>
                    <button className="bg-brand-navy text-white text-[8.5px] font-bold py-1 px-2 rounded-lg flex items-center gap-1 cursor-pointer hover:bg-brand-navy-deep border-none">
                      <Plus size={10} /> Add Property
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: "Est. Value", val: "₹23.04 Cr", growth: "+₹14.69 Cr gain", color: "text-brand-emerald" },
                      { label: "Invested", val: "₹8.35 Cr", growth: "3 assets", color: "text-brand-slate" },
                      { label: "Appreciation", val: "+175.9%", growth: "24.8% YoY", color: "text-brand-emerald" },
                      { label: "Rental Yield", val: "₹1.80 L", growth: "per month", color: "text-brand-blue" },
                    ].map((card, i) => (
                      <div key={i} className="bg-white p-2 rounded-lg border border-brand-border flex flex-col justify-between shadow-3xs">
                        <span className="text-[7.5px] font-bold text-brand-slate-light uppercase">{card.label}</span>
                        <div className="mt-1">
                          <span className="text-[11px] font-black text-brand-navy tracking-tight">{card.val}</span>
                          <span className={`block text-[7px] font-extrabold ${card.color} mt-0.5`}>{card.growth}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-xl border border-brand-border p-3 flex flex-col gap-2">
                    <span className="text-[8.5px] font-bold text-brand-navy uppercase tracking-wider">Asset Distribution & Performance</span>
                    <div className="h-[65px] relative border-b border-brand-border flex items-end justify-around pb-1 pt-3">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 bg-brand-blue/30 h-10 rounded-t-sm relative" />
                        <span className="text-[7px] font-bold text-brand-slate truncate max-w-[60px] block">Greenwood</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 bg-brand-blue h-[55px] rounded-t-sm relative" />
                        <span className="text-[7px] font-bold text-brand-slate truncate max-w-[60px] block">DLF Arbour</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 bg-brand-blue/60 h-7 rounded-t-sm relative" />
                        <span className="text-[7px] font-bold text-brand-slate truncate max-w-[60px] block">Unitech City</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentTab === "watchlist" && (
                <motion.div
                  key="watchlist"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-brand-slate-light uppercase tracking-wider">Active Watchlist alerts</span>
                    <span className="text-[8px] font-bold bg-brand-blue-bg text-brand-blue border border-brand-blue-border px-1.5 py-0.2 rounded uppercase">Monitoring</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white border border-brand-border rounded-xl p-3.5 shadow-3xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-[8px] font-bold text-brand-blue uppercase mb-1">
                          <MapPin size={9} /> Gurgaon Sector 102
                        </div>
                        <h5 className="text-[11px] font-extrabold text-brand-navy mb-0.5 m-0">BPTP Downtown</h5>
                        <p className="text-[9px] text-brand-slate leading-normal m-0 font-medium">Tracking 3 BHK units under ₹1.70 Cr.</p>
                      </div>
                      <div className="mt-3.5 pt-2.5 border-t border-brand-border flex justify-between text-[8.5px] font-bold">
                        <span className="text-brand-emerald">1 New Match</span>
                        <span className="text-brand-navy-deep font-black">₹1.65 Cr</span>
                      </div>
                    </div>

                    <div className="bg-white border border-brand-border rounded-xl p-3.5 shadow-3xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-[8px] font-bold text-brand-blue uppercase mb-1">
                          <MapPin size={9} /> Bangalore Whitefield
                        </div>
                        <h5 className="text-[11px] font-extrabold text-brand-navy mb-0.5 m-0">Prestige Tech Vista</h5>
                        <p className="text-[9px] text-brand-slate leading-normal m-0 font-medium">Tracking dimensions above 2,200 sq.ft.</p>
                      </div>
                      <div className="mt-3.5 pt-2.5 border-t border-brand-border flex justify-between text-[8.5px] font-bold">
                        <span className="text-brand-slate-light font-medium">No matches today</span>
                        <span className="text-brand-slate-light font-semibold">Tracking...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentTab === "projects" && (
                <motion.div
                  key="projects"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-3"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-[12px] font-black text-brand-navy tracking-tight m-0">Projects Directory</h3>
                      <p className="text-[8.5px] text-brand-slate mt-0.5 m-0 font-semibold">Explore verified builder developments and check compliance status.</p>
                    </div>
                  </div>

                  <div className="bg-white border border-brand-border rounded-lg p-2 grid grid-cols-4 gap-2 text-[8px] font-bold text-brand-navy">
                    <div className="bg-brand-bg-alt py-1 px-2.5 rounded flex items-center justify-between border border-brand-border truncate">
                      <span>Gurgaon</span> <ChevronDown size={8} />
                    </div>
                    <div className="bg-brand-bg-alt py-1 px-2.5 rounded flex items-center justify-between border border-brand-border truncate">
                      <span>Developers</span> <ChevronDown size={8} />
                    </div>
                    <div className="bg-brand-bg-alt py-1 px-2.5 rounded flex items-center justify-between border border-brand-border truncate">
                      <span>Apartment</span> <ChevronDown size={8} />
                    </div>
                    <div className="bg-brand-bg-alt py-1 px-2.5 rounded flex items-center justify-between border border-brand-border truncate">
                      <span>Status</span> <ChevronDown size={8} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { name: "Gaur Plume", loc: "Sector 22D, Noida", price: "₹1.36 Cr", status: "Under Constr.", color: "bg-[#F59E0B]" },
                      { name: "DLF Arbour", loc: "Sector 63, Gurgaon", price: "₹7.80 Cr", status: "Ready to Move", color: "bg-brand-emerald" },
                      { name: "Godrej Mihan", loc: "MIHAN, Nagpur", price: "₹76.5 L", status: "Under Constr.", color: "bg-[#F59E0B]" }
                    ].map((proj, idx) => (
                      <div key={idx} className="bg-white border border-brand-border rounded-lg overflow-hidden flex flex-col justify-between shadow-3xs">
                        <div className="h-[36px] bg-brand-navy-mid p-1.5 flex flex-col justify-between text-white">
                          <span className={`text-[5px] font-bold text-white px-1 py-0.2 rounded-sm w-fit uppercase ${proj.color}`}>{proj.status}</span>
                          <h4 className="text-[8px] font-bold text-white truncate m-0 leading-tight">{proj.name}</h4>
                        </div>
                        <div className="p-1.5 flex flex-col gap-1 text-[7.5px] font-semibold text-brand-slate">
                          <span className="truncate text-brand-navy">{proj.loc}</span>
                          <div className="border-t border-brand-border pt-1 flex justify-between items-center mt-1">
                            <span className="text-[8px] font-black text-brand-navy">{proj.price}</span>
                            <span className="text-[6.5px] bg-brand-bg-alt border border-brand-border px-1 py-0.2 rounded text-brand-navy font-bold">View</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {currentTab === "rera" && (
                <motion.div
                  key="rera"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-3"
                >
                  <div>
                    <h4 className="text-[12px] font-black text-brand-navy m-0">BPTP District Blocks A-D</h4>
                    <p className="text-[8.5px] text-brand-slate mt-0.5 m-0 uppercase tracking-wide font-bold">RERA Number: RERA-GRG-102-2023</p>
                  </div>

                  <div className="bg-white border border-brand-border rounded-xl p-3.5 shadow-3xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
                      {[
                        { title: "RERA Filing", status: "Approved", sub: "Jan 2023", active: true },
                        { title: "Groundwork", status: "Completed", sub: "Aug 2023", active: true },
                        { title: "Structure", status: "Completed", sub: "Dec 2024", active: true },
                        { title: "Possession", status: "Dec 2026", sub: "Extended 6m", active: false, alert: true }
                      ].map((step, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          {step.alert ? (
                            <div className="w-3.5 h-3.5 rounded-full bg-brand-amber-bg border border-brand-amber-light flex items-center justify-center font-bold text-[8px] text-brand-amber shrink-0 mt-0.5 animate-pulse">
                              !
                            </div>
                          ) : (
                            <CheckCircle2 size={13} className="text-brand-emerald mt-0.5 shrink-0" />
                          )}
                          <div>
                            <h6 className="text-[8.5px] font-bold text-brand-navy m-0">{step.title}</h6>
                            <p className={`text-[7.5px] mt-0.5 m-0 font-bold ${step.alert ? "text-brand-amber" : "text-brand-slate"}`}>{step.status}</p>
                            <p className="text-[6.5px] text-brand-slate-light m-0 font-medium">{step.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentTab === "rates" && (
                <motion.div
                  key="rates"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-3"
                >
                  <div>
                    <h3 className="text-[12px] font-black text-brand-navy tracking-tight m-0">Government Circle Rates</h3>
                    <p className="text-[8.5px] text-brand-slate mt-0.5 m-0 font-semibold">Official deed registration rates sourced from revenue department land records.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="col-span-1 md:col-span-4 bg-white border border-brand-border rounded-xl p-3 flex flex-col gap-2.5 shadow-3xs">
                      <div className="relative">
                        <Search size={10} className="absolute left-2 top-2 text-brand-slate-light" />
                        <input
                          type="text"
                          placeholder="Search Sector 49..."
                          className="w-full bg-brand-bg-alt border border-brand-border rounded-lg py-1 pl-6 pr-2 text-[8px] text-brand-navy font-bold focus:outline-none"
                          readOnly
                        />
                      </div>
                      <div className="bg-[#fcf8f2] border border-[#fef3c7e0] rounded-lg p-2 flex items-start gap-1">
                        <Info size={11} className="text-brand-amber shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-[7.5px] text-brand-slate leading-normal m-0 font-bold">
                            Select map polygon sectors to filter circular rate indexes.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-8 bg-[#EAE8E2] border border-brand-border rounded-xl overflow-hidden relative shadow-3xs h-[120px] flex items-center justify-center">
                      <svg className="w-full h-full absolute inset-0 p-2" viewBox="0 0 500 300" fill="none">
                        <path d="M40 80 L180 50 L200 120 L270 190 L190 270 L90 280 L40 180 Z" fill="#FCA5A5" fillOpacity="0.45" stroke="#EF4444" strokeWidth="1.5" />
                        <path d="M280 40 L450 30 L460 170 L380 250 L290 210 Z" fill="#86EFAC" fillOpacity="0.4" stroke="#22C55E" strokeWidth="1.5" />
                        <path d="M200 120 L280 80 L320 140 L280 210 L220 190 Z" fill="#93C5FD" fillOpacity="0.6" stroke="#2563EB" strokeWidth="2" />
                        <text x="110" y="160" fill="#7f1d1d" fontSize="13" fontWeight="900">Gurgaon</text>
                        <text x="238" y="152" fill="#1e3a8a" fontSize="13" fontWeight="900">New Delhi</text>
                        <text x="350" y="130" fill="#14532d" fontSize="13" fontWeight="900">Noida</text>
                      </svg>
                      <div className="absolute top-2 right-2 bg-white border border-brand-border rounded shadow-3xs flex flex-col text-[8px] font-black">
                        <button className="w-4 h-4 flex items-center justify-center border-b border-brand-border border-x-0 border-t-0 bg-transparent cursor-pointer">+</button>
                        <button className="w-4 h-4 flex items-center justify-center bg-transparent cursor-pointer border-none">-</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sync Status Footer bar */}
          <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-[9px] font-extrabold text-brand-slate-light">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-brand-emerald rounded-full inline-block" /> Live database connection: Stable
            </span>
            <span className="text-brand-blue flex items-center gap-0.5 cursor-pointer hover:underline">
              Explore live analytics <ChevronRight size={10} />
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

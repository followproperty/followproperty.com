"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ListPlus, 
  Search, 
  Building2, 
  ShieldCheck, 
  BellRing, 
  Settings, 
  X, 
  MoreHorizontal,
  Map
} from "lucide-react";


export default function BottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const getActiveTab = () => {
    if (pathname === "/dashboard") return "dashboard";
    if (pathname.startsWith("/portfolio")) return "portfolio";
    if (pathname.startsWith("/watchlist")) return "watchlist";
    if (pathname.startsWith("/projects")) return "projects";
    if (pathname.startsWith("/notifications")) return "alerts";
    if (pathname.startsWith("/rera")) return "rera";
    return "";
  };

  const activeTab = getActiveTab();

  const handleMoreClick = (e) => {
    e.preventDefault();
    setShowMore(!showMore);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "watchlist", label: "Watchlist", icon: ListPlus, path: "/watchlist" },
    { id: "projects", label: "Projects", icon: Search, path: "/projects" },
    { id: "portfolio", label: "Portfolio", icon: Building2, path: "/portfolio" },
  ];

  const moreItems = [
    { id: "rera", label: "RERA Registry", icon: ShieldCheck, path: "/rera" },
    { id: "circle-rates", label: "Circle Rates", icon: Map, path: "/circle-rates" },
    { id: "alerts", label: "Alerts", icon: BellRing, path: "/notifications" },
    // { id: "reports", label: "Reports", icon: BarChart3, path: "#" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <>
      {/* Backdrop overlay for More menu */}
      {showMore && (
        <div 
          className="fixed inset-0 z-40 bg-brand-navy/20 backdrop-blur-xs md:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More Items Popup Sheet */}
      {showMore && (
        <div className="fixed bottom-[74px] left-4 right-4 bg-brand-bg-card border border-brand-border rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] p-4.5 z-50 flex flex-col gap-1.5 md:hidden animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between border-b border-brand-border/60 pb-2.5 mb-1.5">
            <span className="text-[11px] font-bold text-brand-slate-light uppercase tracking-wider">More Sections</span>
            <button 
              onClick={() => setShowMore(false)} 
              className="p-1 bg-transparent border-none cursor-pointer text-brand-slate-light hover:text-brand-navy flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>
          {moreItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = pathname === item.path;
            return (
              <Link
                key={item.id}
                href={item.path}
                onClick={() => setShowMore(false)}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl no-underline transition-all ${
                  isItemActive 
                    ? "bg-brand-blue text-white font-semibold shadow-brand-blue" 
                    : "text-brand-navy-mid font-medium hover:bg-brand-bg-alt"
                }`}
              >
                <Icon size={18} className={isItemActive ? "text-white" : "text-brand-slate"} />
                <span className="text-[13px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-[64px] bg-brand-bg-card border-t border-brand-border z-40 flex items-center justify-around md:hidden px-2 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Link
              key={item.id}
              href={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full no-underline transition-all ${
                isActive ? "text-brand-blue" : "text-brand-slate"
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${isActive ? "text-brand-blue" : "text-brand-slate"}`}>
                <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-extrabold tracking-wide mt-0.5">{item.label}</span>
            </Link>
          );
        })}
        
        {/* More Button */}
        <button
          onClick={handleMoreClick}
          className={`flex flex-col items-center justify-center flex-1 h-full bg-transparent border-none cursor-pointer outline-none transition-all ${
            showMore ? "text-brand-blue" : "text-brand-slate"
          }`}
        >
          <div className="p-1 rounded-lg">
            <MoreHorizontal size={19} strokeWidth={showMore ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-extrabold tracking-wide mt-0.5">More</span>
        </button>
      </div>
    </>
  );
}

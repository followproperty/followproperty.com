"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ListPlus, 
  Building2, 
  BellRing, 
  BarChart3, 
  Settings,
  X,
  Sparkles
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "watchlist", label: "Watchlist", icon: ListPlus, path: "#" },
  { id: "properties", label: "Properties", icon: Building2, path: "#" },
  { id: "alerts", label: "Alerts", icon: BellRing, path: "#" },
  { id: "reports", label: "Reports", icon: BarChart3, path: "#" },
  { id: "settings", label: "Settings", icon: Settings, path: "#" },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden backdrop-blur-sm transition-opacity bg-brand-navy/40"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed md:sticky top-0 left-0 h-screen w-[260px] flex flex-col p-4 md:p-6 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 bg-brand-bgCard border-r border-brand-border ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Close Button */}
        <div className="flex justify-end md:hidden mb-4">
          <button 
            onClick={onClose}
            className="p-1.5 bg-transparent border-none cursor-pointer text-brand-slate"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <div className={`flex-1 ${isOpen ? "mt-0" : "mt-3"}`}>
          <p className="text-[11px] font-bold text-brand-slateLight tracking-[0.08em] uppercase mb-4 pl-3">
            Menu
          </p>
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.path || (item.id === "dashboard" && pathname === "/dashboard");
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      onClose();
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] no-underline transition-all duration-200 ${
                    isActive 
                      ? "bg-brand-tealBg text-brand-tealDark font-semibold" 
                      : "bg-transparent text-brand-navyMid font-medium hover:bg-brand-bgAlt"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-brand-teal" : "text-brand-slate"} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Upgrade Card - Commented out for now */}
        {/* <div className="p-4 rounded-xl bg-brand-bgAlt border border-brand-border mt-6">
          <div className="w-8 h-8 rounded-lg bg-brand-amberBg border border-brand-amberBorder flex items-center justify-center mb-3">
            <Sparkles size={16} className="text-brand-amber" />
          </div>
          <h4 className="text-sm font-bold text-brand-navy mb-1">
            Upgrade to Pro
          </h4>
          <p className="text-xs text-brand-slate mb-3 leading-relaxed">
            Get advanced filters, deeper analytics and instant alerts.
          </p>
          <button className="w-full py-2 rounded-lg bg-brand-navy text-white border-none text-[13px] font-semibold cursor-pointer transition-opacity duration-200 hover:opacity-90">
            Upgrade Now
          </button>
        </div> */}
      </div>
    </>
  );
}

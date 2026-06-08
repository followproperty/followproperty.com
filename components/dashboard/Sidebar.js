"use client";

import React, { useState, useEffect } from "react";
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
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Search
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "portfolio", label: "Portfolio", icon: Building2, path: "/portfolio" },
  { id: "watchlist", label: "Watchlist", icon: ListPlus, path: "/watchlist" },
  { id: "projects", label: "Projects", icon: Search, path: "/projects" },
  // { id: "alerts", label: "Alerts", icon: BellRing, path: "#" },
  // { id: "reports", label: "Reports", icon: BarChart3, path: "#" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(false);

  // Load persistent state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sidebar_collapsed");
      if (stored === "true") {
        setIsCollapsed(true);
      }
    } catch (err) {
      console.error("Failed to read sidebar_collapsed:", err);
    }

    // Enable transitions after a tiny delay so the initial width settles instantly without flash
    const timer = setTimeout(() => {
      setIsTransitionEnabled(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    try {
      localStorage.setItem("sidebar_collapsed", String(nextState));
    } catch (err) {
      console.error("Failed to save sidebar_collapsed:", err);
    }
  };

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
        className={`fixed md:sticky top-0 left-0 h-screen flex flex-col z-50 md:translate-x-0 bg-brand-bg-card border-r border-brand-border ${
          isTransitionEnabled ? "transition-all duration-300 ease-in-out" : ""
        } ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isCollapsed 
            ? "w-[76px] md:w-[76px] p-2 md:p-3" 
            : "w-[260px] md:w-[260px] p-4 md:p-6"
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
          {isCollapsed ? (
            <div className="flex flex-col items-center mb-4">
              <button 
                onClick={toggleCollapse}
                className="hidden md:flex items-center justify-center p-1.5 bg-transparent border-none cursor-pointer text-brand-slate hover:bg-brand-bg-alt rounded-lg transition-colors"
                title="Expand Menu"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4 pl-3">
              <p className="text-[11px] font-bold text-brand-slate-light tracking-[0.08em] uppercase m-0">
                Menu
              </p>
              <button 
                onClick={toggleCollapse}
                className="hidden md:flex items-center justify-center p-1.5 bg-transparent border-none cursor-pointer text-brand-slate hover:bg-brand-bg-alt rounded-lg transition-colors"
                title="Collapse Menu"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.path || (item.id === "dashboard" && pathname === "/dashboard");
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  title={isCollapsed ? item.label : ""}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      onClose();
                    }
                  }}
                  className={`flex items-center rounded-[10px] no-underline transition-all duration-[0.22s] ${
                    isCollapsed 
                      ? "justify-center px-0 py-2.5" 
                      : "gap-3 px-3 py-2.5"
                  } ${
                    isActive 
                      ? "bg-brand-blue text-white font-semibold shadow-brand-blue" 
                      : "bg-transparent text-brand-navy-mid font-medium hover:bg-brand-bg-alt"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-white" : "text-brand-slate"} />
                  {!isCollapsed && <span className="text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}


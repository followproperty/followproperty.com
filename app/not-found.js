"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Nav from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import {
  Search,
  ArrowRight,
  Home,
  HelpCircle,
  Building,
  Compass,
  Sparkles,
  MapPin,
  X,
  Phone,
  Briefcase,
  Users,
  ShieldCheck,
  Scale,
  ClipboardCheck,
  Heart
} from "lucide-react";

const PAGES = [
  { url: "/", title: "Home", description: "Monitor property value, builder risk, and market appreciation.", category: "Main", icon: Home },
  { url: "/projects", title: "Projects Directory", description: "Browse verified residential apartments, plots, and commercial projects.", category: "Properties", icon: Building },
  { url: "/builders", title: "Builders Directory", description: "Check active developers, track records, and RERA compliance ratings.", category: "Builders", icon: Briefcase },
  { url: "/circle-rates", title: "Circle Rates Check", description: "Look up deed registration rates, circle rates, and regional zones.", category: "Research", icon: Scale },
  { url: "/rera", title: "RERA Registry Search", description: "Verify state municipal RERA filing compliance and land titles.", category: "Compliance", icon: ShieldCheck },
  { url: "/compare", title: "Compare Properties", description: "Run side-by-side comparisons of developer layout plans.", category: "Tools", icon: ClipboardCheck },
  { url: "/tell-us-your-requirements", title: "Advisory Desk", description: "Submit your search criteria for personalized property matching.", category: "Support", icon: Phone },
  { url: "/login", title: "Sign In", description: "Sign in to access your tracking dashboard and asset alerts.", category: "Account", icon: Users },
  { url: "/signup", title: "Register Account", description: "Create an investor profile to start tracking properties.", category: "Account", icon: Sparkles },
  { url: "/dashboard", title: "Investor Dashboard", description: "View your real-estate portfolio values and transaction alerts.", category: "Account", icon: Compass },
  { url: "/watchlist", title: "Watchlist Matches", description: "Track direct listings matching your search filters.", category: "Account", icon: Heart }
];

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    loading: true
  });

  // Fetch Firebase authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setAuthState({
        isAuthenticated: !!currentUser,
        loading: false
      });
    });
    return () => unsubscribe();
  }, []);

  // Filter pages based on search query
  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return PAGES.filter(
      (page) =>
        page.title.toLowerCase().includes(query) ||
        page.description.toLowerCase().includes(query) ||
        page.category.toLowerCase().includes(query) ||
        page.url.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Reset selection index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Keyboard controls
  const handleKeyDown = (e) => {
    if (filteredPages.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredPages.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredPages.length) % filteredPages.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const targetPage = filteredPages[selectedIndex];
      if (targetPage) {
        router.push(targetPage.url);
      }
    } else if (e.key === "Escape") {
      setSearchQuery("");
      inputRef.current?.blur();
    }
  };

  const selectSuggested = (query) => {
    setSearchQuery(query);
    inputRef.current?.focus();
  };

  return (
    <div className="bg-brand-bg min-h-screen flex flex-col font-sans antialiased">
      {/* Top Site Navigation */}
      <Nav authState={authState} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 pt-32 pb-20 z-10 w-full relative">
        <div className="max-w-2xl w-full text-center flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-blue-bg border border-brand-blue-border text-[10px] font-extrabold tracking-widest text-brand-blue uppercase mb-6">
            ⚠️ 404 Error
          </div>

          {/* Large Title */}
          <h1 className="text-7xl sm:text-8xl font-black text-brand-navy tracking-tighter mb-3 leading-none bg-clip-text text-transparent bg-gradient-to-b from-brand-navy to-brand-slate">
            404
          </h1>

          <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4 tracking-tight">
            Page Not Found
          </h2>

          <p className="text-sm sm:text-base text-brand-slate font-light leading-relaxed mb-8 max-w-md mx-auto">
            The page you are looking for has been moved or doesn't exist. Search the directory below to find the correct property index.
          </p>

          {/* Search container */}
          <div className="w-full max-w-lg mx-auto mb-10 relative">
            <div
              className={`relative flex items-center rounded-2xl bg-white transition-all duration-300 border ${
                isFocused
                  ? "shadow-brand-blue/10 border-brand-blue scale-[1.01] outline-none"
                  : "border-brand-border shadow-brand"
              }`}
            >
              <span className="pl-4 text-brand-slate-light pointer-events-none">
                <Search className={`w-5 h-5 transition-colors duration-300 ${isFocused ? "text-brand-blue" : "text-brand-slate-light"}`} />
              </span>

              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                onKeyDown={handleKeyDown}
                placeholder="Search across properties, builders, rates, RERA..."
                className="w-full py-4 px-3 text-sm text-brand-navy bg-transparent outline-none border-none placeholder-brand-slate-light font-sans font-medium"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="pr-4 text-brand-slate-light hover:text-brand-navy transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Instant matches dropdown */}
            {searchQuery.trim() !== "" && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-brand-border shadow-brand-lg rounded-2xl overflow-hidden z-50 text-left">
                {filteredPages.length > 0 ? (
                  <div className="max-h-[280px] overflow-y-auto p-2">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-brand-slate-light tracking-wider uppercase border-b border-brand-border mb-1">
                      Matching Pages ({filteredPages.length})
                    </div>
                    {filteredPages.map((page, index) => {
                      const IconComponent = page.icon;
                      const isSelected = index === selectedIndex;
                      return (
                        <Link
                          key={page.url}
                          href={page.url}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                            isSelected
                              ? "bg-brand-blue text-white"
                              : "hover:bg-brand-blue-bg text-brand-navy"
                          }`}
                          onMouseEnter={() => setSelectedIndex(index)}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                            isSelected ? "bg-white/20 text-white" : "bg-brand-bg-alt text-brand-blue"
                          }`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-bold ${isSelected ? "text-white" : "text-brand-navy"}`}>
                              {page.title}
                            </div>
                            <div className={`text-[10px] truncate ${isSelected ? "text-white/80" : "text-brand-slate"}`}>
                              {page.description}
                            </div>
                          </div>
                          <ArrowRight className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isSelected ? "text-white translate-x-0.5" : "text-brand-slate-light opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
                          }`} />
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center text-brand-slate text-xs font-medium">
                    🔍 No pages found for "{searchQuery}". <br/>
                    Try searching <span className="font-extrabold text-brand-blue cursor-pointer hover:underline" onClick={() => selectSuggested("projects")}>projects</span>,{" "}
                    <span className="font-extrabold text-brand-blue cursor-pointer hover:underline" onClick={() => selectSuggested("builders")}>builders</span>, or{" "}
                    <span className="font-extrabold text-brand-blue cursor-pointer hover:underline" onClick={() => selectSuggested("rates")}>rates</span>.
                  </div>
                )}
              </div>
            )}

            {/* Suggested quick chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="text-[11px] text-brand-slate-light font-bold">Quick Links:</span>
              <button
                onClick={() => selectSuggested("projects")}
                className="px-3 py-1 rounded-full text-[11px] bg-brand-bg-alt text-brand-slate hover:bg-brand-blue-bg hover:text-brand-blue border border-brand-border transition-all duration-200 font-bold cursor-pointer"
              >
                Browse Projects
              </button>
              <button
                onClick={() => selectSuggested("builders")}
                className="px-3 py-1 rounded-full text-[11px] bg-brand-bg-alt text-brand-slate hover:bg-brand-blue-bg hover:text-brand-blue border border-brand-border transition-all duration-200 font-bold cursor-pointer"
              >
                Builders
              </button>
              <button
                onClick={() => selectSuggested("rates")}
                className="px-3 py-1 rounded-full text-[11px] bg-brand-bg-alt text-brand-slate hover:bg-brand-blue-bg hover:text-brand-blue border border-brand-border transition-all duration-200 font-bold cursor-pointer"
              >
                Circle Rates
              </button>
              <button
                onClick={() => selectSuggested("rera")}
                className="px-3 py-1 rounded-full text-[11px] bg-brand-bg-alt text-brand-slate hover:bg-brand-blue-bg hover:text-brand-blue border border-brand-border transition-all duration-200 font-bold cursor-pointer"
              >
                RERA
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs tracking-wider uppercase bg-brand-navy text-white hover:bg-brand-navy-deep shadow-brand transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
            <Link
              href="/tell-us-your-requirements"
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs tracking-wider uppercase bg-white text-brand-navy border border-brand-border-mid hover:bg-brand-bg-alt transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-brand"
            >
              Contact Advisory Desk
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <Footer />
    </div>
  );
}

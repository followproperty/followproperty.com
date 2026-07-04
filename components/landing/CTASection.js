"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, Building } from "lucide-react";

/**
 * Global Search Bar component for modularity and reusability.
 * Smoothly resolves queries across the site.
 */
function SearchBar({ isMobileView = false }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();

  // Search API logic with debouncing (200ms) to reduce load
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/projects/global-search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setResults(json.data);
          setOpen(true);
        }
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Click outside listener to dismiss search recommendation dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className={`relative ${isMobileView ? "w-full my-3" : "w-[240px] lg:w-[280px] hidden md:block"}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-brand-slate-light" />
        <input
          type="text"
          placeholder="Search projects, builders..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          className="w-full bg-[#F4F3EF]/60 border border-brand-border text-[13px] text-brand-navy-deep pl-9 pr-8 py-2 rounded-xl focus:outline-hidden focus:border-brand-blue-border focus:bg-white transition-all placeholder-brand-slate-light"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
            }}
            className="absolute right-2.5 bg-transparent border-none text-brand-slate-light hover:text-brand-navy cursor-pointer flex items-center justify-center p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 bg-white border border-brand-border-mid rounded-2xl shadow-brand-lg overflow-hidden z-50 max-h-[300px] overflow-y-auto text-left"
          >
            <div className="py-2.5">
              <div className="px-3.5 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-brand-slate-light select-none">
                Matching Projects
              </div>
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                    router.push(`/builder/${item.builderSlug}/projects/${item.projectSlug}`);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-brand-bg-alt text-left cursor-pointer border-none bg-transparent transition-colors"
                >
                  <Building className="w-4 h-4 text-brand-blue shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-brand-navy-deep truncate">
                      {item.projectName}
                    </div>
                    <div className="text-[11px] text-brand-slate truncate">
                      By {item.builderName} • {item.locality}, {item.city}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Nav({ authState }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-[0.4s] ease-in-out ${
        scrolled 
          ? "bg-[#FAFAF8]/94 backdrop-blur-[18px] border-b border-brand-border shadow-brand" 
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-3.5 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="FollowProperty Logo" className="w-7 h-7 object-contain" />
          <span className={`font-bold text-[17px] tracking-[-0.025em] transition-colors duration-300 ${scrolled ? "text-brand-navy" : "text-brand-blue"}`}>
            FollowProperty
          </span>
          <span className={`hidden sm:inline-block text-[10px] tracking-[0.14em] uppercase ml-1 transition-colors duration-300 ${scrolled ? "text-brand-slate-light" : "text-brand-slate"}`}>
            Real Assets
          </span>
        </div>

        {/* Centered Desktop Search Bar */}
        <SearchBar isMobileView={false} />

        {/* Right Nav Buttons / Auth state */}
        <div className="hidden md:flex gap-2 items-center">
          {authState?.isAuthenticated ? (
            <Link href="/dashboard" className="text-[13px] font-bold text-white bg-linear-to-r from-brand-blue-deep to-brand-blue border border-white/5 cursor-pointer py-[9px] px-5 rounded-[10px] shadow-sm transition-all duration-[0.22s] hover:-translate-y-[1px] hover:shadow-brand-blue/30 no-underline flex items-center gap-1">
              Go to Dashboard &rarr;
            </Link>
          ) : (
            <>
              <Link href="/login" className={`text-[13px] font-medium bg-transparent border-none cursor-pointer py-2 px-3.5 no-underline transition-colors duration-300 ${scrolled ? "text-brand-slate hover:text-brand-navy" : "text-brand-navy-mid hover:text-brand-navy-deep font-semibold"}`}>
                Login
              </Link>
              <Link href="/signup" className="text-[13px] font-bold text-white bg-linear-to-r from-brand-blue-deep to-brand-blue border border-white/5 cursor-pointer py-[9px] px-5 rounded-[10px] shadow-sm transition-all duration-[0.22s] hover:-translate-y-[1px] hover:shadow-brand-blue/30 no-underline flex items-center">
                Create Account
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          className={`bg-transparent border-none cursor-pointer md:hidden transition-colors duration-300 ${scrolled ? "text-brand-slate" : "text-brand-navy hover:text-brand-navy-deep"}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Collapsible Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-brand-bg border-b border-brand-border px-6 pb-5 md:hidden overflow-hidden"
          >
            {/* Mobile Search Bar at the top of dropdown */}
            <SearchBar isMobileView={true} />
            
            {authState?.isAuthenticated ? (
              <Link href="/dashboard" className="w-full mt-4 bg-linear-to-r from-brand-blue-deep to-brand-blue text-white font-bold p-3 rounded-[10px] border border-white/5 cursor-pointer block text-center no-underline shadow-sm hover:shadow-brand-blue/30">
                Go to Dashboard &rarr;
              </Link>
            ) : (
              <>
                <Link href="/signup" className="w-full mt-4 bg-linear-to-r from-brand-blue-deep to-brand-blue text-white font-bold p-3 rounded-[10px] border border-white/5 cursor-pointer block text-center no-underline shadow-sm hover:shadow-brand-blue/30">
                  Get Started Free
                </Link>
                <Link href="/login" className="w-full mt-2 bg-transparent border border-brand-border-mid text-brand-navy font-semibold p-3 rounded-[10px] cursor-pointer block text-center no-underline">
                  Login
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

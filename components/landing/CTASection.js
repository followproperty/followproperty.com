"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Nav({ authState }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
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
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="FollowProperty Logo" className="w-7 h-7 object-contain" />
          <span className={`font-bold text-[17px] tracking-[-0.025em] transition-colors duration-300 ${scrolled ? "text-brand-navy" : "text-brand-blue"}`}>
            FollowProperty
          </span>
          <span className={`hidden sm:inline-block text-[10px] tracking-[0.14em] uppercase ml-1 transition-colors duration-300 ${scrolled ? "text-brand-slate-light" : "text-brand-slate"}`}>
            Real Assets
          </span>
        </div>

        <div className="hidden md:flex gap-7 items-center">
          {/* {["Features", "How It Works", "Pricing"].map((item) => (
            <a
              key={item}
              href="#"
              className={`text-[13px] no-underline transition-colors duration-300 ${scrolled ? "text-brand-slate hover:text-brand-navy" : "text-brand-navy/80 hover:text-brand-navy"}`}
            >
              {item}
            </a>
          ))} */}
          {/* <Link
            href="/signup?role=builder"
            className={`text-[13px] no-underline transition-colors duration-300 font-medium ${scrolled ? "text-brand-slate hover:text-brand-navy" : "text-brand-navy/80 hover:text-brand-navy"}`}
          >
            For Builders
          </Link> */}
        </div>

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

        <button
          className={`bg-transparent border-none cursor-pointer md:hidden transition-colors duration-300 ${scrolled ? "text-brand-slate" : "text-brand-navy hover:text-brand-navy-deep"}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-brand-bg border-b border-brand-border px-6 pb-5 md:hidden overflow-hidden"
          >
            {/* {["Features", "How It Works", "Pricing"].map((item) => (
              <a
                key={item}
                href="#"
                className="block py-3 text-brand-slate text-sm border-b border-brand-border no-underline"
              >
                {item}
              </a>
            ))} */}
            {/* <Link
              href="/signup?role=builder"
              className="block py-3 text-brand-slate text-sm border-b border-brand-border no-underline font-medium hover:text-brand-navy"
            >
              For Builders
            </Link> */}
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

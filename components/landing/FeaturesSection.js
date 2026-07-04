"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Building2,
  Search,
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar,
  ShieldAlert
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function CoreFlows({ authState }) {
  const router = useRouter();
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true, margin: "-80px" });

  const handleCardClick = (path) => {
    if (!authState?.isAuthenticated) {
      router.push(`/login?redirect=/${path}`);
    } else {
      router.push(`/${path}`);
    }
  };

  return (
    <motion.section
      ref={containerRef}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="py-24 sm:py-32 bg-brand-bg-alt border-t border-brand-border relative overflow-hidden"
    >
      {/* Background glow accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse,rgba(50,95,236,0.04)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-[1000px] mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div variants={fadeUp} custom={0} className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full border border-brand-border bg-brand-bg-card mb-4 shadow-brand">
            <span className="text-[10px] text-brand-slate-light tracking-[0.10em] uppercase font-bold">
              What brings you here today?
            </span>
          </div>
          <h2 className="text-[clamp(26px,4vw,38px)] font-extrabold text-brand-navy tracking-tight mb-4">
            Select your property focus
          </h2>
          <p className="text-base sm:text-lg text-brand-slate leading-relaxed max-w-[540px] mx-auto">
            Tell us where you are in your property path, and we will set up the correct dashboard workspace for you.
          </p>
        </motion.div>

        {/* Conversational Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[800px] mx-auto">
          {/* Card A: I own property */}
          <motion.div
            variants={fadeUp}
            custom={1}
            onClick={() => handleCardClick("portfolio")}
            className="bg-brand-bg-card rounded-2xl border border-brand-border shadow-brand p-8 cursor-pointer flex flex-col justify-between transition-all duration-300 hover:shadow-brand-lg hover:border-brand-amber-border hover:-translate-y-1 group"
          >
            <div className="flex flex-col gap-6">
              <div className="w-12 h-12 rounded-xl bg-brand-amber-bg border border-brand-amber-border flex items-center justify-center">
                <Building2 size={22} className="text-brand-amber" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-navy tracking-tight mb-2">
                  I own property
                </h3>
                <p className="text-sm text-brand-slate leading-relaxed m-0 font-medium">
                  Monitor the estimated market value, local circle rates, and RERA compliance records for your current assets.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-brand-border flex items-center justify-between text-xs font-bold text-brand-amber">
              <span>Track My Asset Value</span>
              <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Card B: I want to buy */}
          <motion.div
            variants={fadeUp}
            custom={2}
            onClick={() => handleCardClick("watchlist")}
            className="bg-brand-bg-card rounded-2xl border border-brand-border shadow-brand p-8 cursor-pointer flex flex-col justify-between transition-all duration-300 hover:shadow-brand-lg hover:border-brand-blue-border hover:-translate-y-1 group"
          >
            <div className="flex flex-col gap-6">
              <div className="w-12 h-12 rounded-xl bg-brand-blue-bg border border-brand-blue-border flex items-center justify-center">
                <Search size={22} className="text-brand-blue" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-navy tracking-tight mb-2">
                  I am looking to buy
                </h3>
                <p className="text-sm text-brand-slate leading-relaxed m-0 font-medium">
                  Browse verified developments, track locality price trends, and follow project timeline updates.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-brand-border flex items-center justify-between text-xs font-bold text-brand-blue">
              <span>Find Verified Projects</span>
              <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

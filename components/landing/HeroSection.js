"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, LayoutDashboard, Search } from "lucide-react";
import DashboardMockup from "./DashboardMockup";

const blurIn = {
  hidden: { opacity: 0, filter: "blur(6px)", y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Hero({ authState }) {
  const router = useRouter();

  const handleBrowseProjects = (e) => {
    e.preventDefault();
    const target = document.getElementById("featured-developments");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/projects");
    }
  };

  return (
    <div className="bg-brand-bg relative pt-[120px] pb-[60px] lg:pt-[160px] lg:pb-[90px] overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
      
      {/* Visual Background Textures */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Soft Radial Glow Highlights & Grid Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/0 via-brand-bg/25 to-brand-bg" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] rounded-full bg-[radial-gradient(ellipse,rgba(50,95,236,0.04)_0%,transparent_65%)]" />
        <div 
          className="absolute inset-0 opacity-[0.12]" 
          style={{ 
            backgroundImage: "radial-gradient(var(--color-brand-border-mid) 1px, transparent 1px)", 
            backgroundSize: "32px 32px" 
          }} 
        />
      </div>

      {/* Main Container */}
      <div className="max-w-[1240px] mx-auto px-6 w-full relative z-10 flex flex-col items-center text-center">
        
        {/* Category Tag */}
        <motion.div variants={blurIn} custom={0} initial="hidden" animate="visible" className="mb-6">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-brand-border bg-white shadow-3xs">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue inline-block animate-pulse" />
            <span className="text-[10px] text-brand-navy tracking-[0.18em] uppercase font-black">
              Real Estate Intelligence Workspace
            </span>
          </div>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          variants={blurIn}
          custom={1}
          initial="hidden"
          animate="visible"
          className="text-[clamp(34px,6vw,58px)] font-black tracking-tight leading-[1.08] text-brand-navy-deep max-w-[900px] mb-5"
        >
          Track your investments.<br />
          <span className="bg-linear-to-r from-brand-blue-deep via-brand-blue to-brand-blue-light bg-clip-text text-transparent">
            Know your property's value.
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          variants={blurIn}
          custom={2}
          initial="hidden"
          animate="visible"
          className="text-base sm:text-lg md:text-[19px] text-brand-slate leading-relaxed max-w-[640px] m-0 mb-9 font-medium"
        >
          Monitor valuations, builder compliance timelines, and official circle rates in a single unified workspace. Built for serious real estate decisions.
        </motion.p>

        {/* Call to Action Buttons */}
        <motion.div
          variants={blurIn}
          custom={3}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row gap-3.5 items-center justify-center w-full sm:w-auto mb-16"
        >
          <button
            onClick={() => {
              if (!authState?.isAuthenticated) {
                router.push("/signup");
              } else {
                router.push("/dashboard");
              }
            }}
            className="w-full sm:w-auto btn-primary py-3.5 px-7.5 text-[14px]"
          >
            <LayoutDashboard size={16} /> 
            {authState?.isAuthenticated ? "Go to Dashboard" : "Create Free Account"} 
            <ArrowRight size={14} />
          </button>
 
          <button
            onClick={handleBrowseProjects}
            className="w-full sm:w-auto btn-secondary py-3.5 px-7.5 text-[14px]"
          >
            <Search size={16} /> Browse Directory
          </button>
        </motion.div>

        {/* Premium Static Dashboard Preview (Mockup Centerpiece Overview) */}
        <motion.div
          variants={blurIn}
          custom={4}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[960px] mx-auto mt-2 select-none pointer-events-none"
        >
          <DashboardMockup activeTab="overview" onTabChange={null} />
        </motion.div>

      </div>
    </div>
  );
}

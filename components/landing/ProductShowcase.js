"use client";

import React, { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { 
  Building2, 
  ListPlus, 
  TrendingUp, 
  ShieldAlert, 
  FolderOpen
} from "lucide-react";
import DashboardMockup from "./DashboardMockup";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function ProductShowcase() {
  const [activeTab, setActiveTab] = useState("portfolio");
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true, margin: "-60px" });

  const showcases = [
    {
      id: "portfolio",
      label: "Portfolio Tracker",
      icon: Building2,
      tag: "Assets",
      description: "Aggregate all your land, villa, and apartment investments in one dashboard to track live valuations.",
    },
    {
      id: "watchlist",
      label: "Local Watchlists",
      icon: ListPlus,
      tag: "Alerts",
      description: "Monitor specific sectors and get notified instantly when comparable listings fit your target price.",
    },
    {
      id: "rera",
      label: "RERA Registry",
      icon: ShieldAlert,
      tag: "Compliance",
      description: "Verify builder approvals and construction milestones to identify delay risks before you buy.",
    },
    {
      id: "rates",
      label: "Circle Rates Index",
      icon: TrendingUp,
      tag: "Pricing",
      description: "Look up official government land registry rates directly via interactive sector map polygons.",
    },
    {
      id: "projects",
      label: "Projects Directory",
      icon: FolderOpen,
      tag: "Explorer",
      description: "Browse verified residential layouts, download licensed structural drafts, and explore compliance states.",
    },
  ];

  const activeShowcase = showcases.find((item) => item.id === activeTab) || showcases[0];

  return (
    <motion.section
      ref={containerRef}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="py-16 md:py-24 bg-brand-bg-alt border-t border-b border-brand-border relative overflow-hidden"
    >
      <div className="max-w-[1240px] mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16 max-w-2xl mx-auto">
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full border border-brand-border bg-white mb-4 shadow-3xs">
            <span className="text-[10px] text-brand-slate-light tracking-[0.10em] uppercase font-bold">
              Product Showcase
            </span>
          </motion.div>
          
          <motion.h2 variants={fadeUp} custom={1} className="text-[clamp(28px,4.5vw,40px)] font-black text-brand-navy-deep tracking-tight mb-4">
            Explore the Workspace
          </motion.h2>
          
          <motion.p variants={fadeUp} custom={2} className="text-base text-brand-slate leading-relaxed font-medium m-0">
            See how FollowProperty simplifies asset monitoring, compliance checking, and land record queries.
          </motion.p>
        </div>

        {/* Responsive Mobile vs Desktop Layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-10 items-stretch">
          
          {/* Mobile-Only Horizontal Pill Switcher & Active Text Card */}
          <div className="block lg:hidden w-full">
            <div className="flex gap-2.5 overflow-x-auto pb-4.5 scrollbar-none snap-x w-full">
              {showcases.map((show) => {
                const Icon = show.icon;
                const isActive = activeTab === show.id;
                return (
                  <button
                    key={show.id}
                    onClick={() => setActiveTab(show.id)}
                    className={`flex items-center gap-2 px-4.5 py-2.5 rounded-full border text-[11.5px] font-extrabold shrink-0 snap-center transition-all cursor-pointer ${
                      isActive
                        ? "bg-brand-navy border-brand-navy text-white shadow-brand-md"
                        : "bg-white border-brand-border text-brand-slate hover:bg-brand-bg-alt/50"
                    }`}
                  >
                    <Icon size={13.5} />
                    {show.label}
                  </button>
                );
              })}
            </div>
            
            {/* Active Mobile Text Description */}
            <div className="bg-white border border-brand-border p-4.5 rounded-xl text-left mb-6 shadow-3xs">
              <span className="text-[8px] font-black tracking-wider text-brand-blue border border-brand-blue-border/40 bg-brand-blue-bg rounded px-2 py-0.5 inline-block mb-1.5 uppercase">
                {activeShowcase.tag} Workspace
              </span>
              <h4 className="text-[13px] font-black text-brand-navy mb-1">{activeShowcase.label}</h4>
              <p className="text-[12px] leading-relaxed text-brand-slate m-0 font-semibold">
                {activeShowcase.description}
              </p>
            </div>
          </div>

          {/* Desktop-Only Left Stack Card Selector */}
          <div className="hidden lg:flex lg:col-span-5 flex-col gap-3">
            {showcases.map((show, idx) => {
              const Icon = show.icon;
              const isActive = activeTab === show.id;
              return (
                <div
                  key={show.id}
                  onClick={() => setActiveTab(show.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                    isActive
                      ? "bg-white border-brand-blue-border/45 shadow-brand"
                      : "bg-transparent border-transparent hover:bg-white/40 hover:border-brand-border"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 transition-all ${
                    isActive 
                      ? "bg-brand-blue-bg border-brand-blue-border text-brand-blue" 
                      : "bg-white border-brand-border text-brand-slate-light"
                  }`}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-[13.5px] font-black text-brand-navy tracking-tight m-0">
                        {show.label}
                      </h4>
                      <span className="text-[7.5px] font-bold tracking-wider text-brand-slate-light border border-brand-border-mid rounded-sm px-1.5 py-0.2 bg-brand-bg-alt uppercase">
                        {show.tag}
                      </span>
                    </div>
                    <p className={`text-[12px] leading-relaxed m-0 font-medium transition-colors ${isActive ? "text-brand-navy-mid" : "text-brand-slate"}`}>
                      {show.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column mockup (Common for both) */}
          <div className="col-span-1 lg:col-span-7 flex items-center justify-center w-full">
            <div className="w-full">
              <DashboardMockup activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />
            </div>
          </div>

        </div>

      </div>
    </motion.section>
  );
}

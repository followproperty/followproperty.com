"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { 
  LineChart, 
  ShieldAlert, 
  Map
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function PlatformOverview() {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true, margin: "-60px" });

  const pillars = [
    {
      icon: LineChart,
      title: "Wealth & Valuation",
      tag: "Asset Growth",
      description: "Track estimated property appreciation, total invested equity, and monthly rental yields in one unified screen.",
    },
    {
      icon: ShieldAlert,
      title: "Diligence & Compliance",
      tag: "Risk Mitigation",
      description: "Monitor developer RERA milestone filings and get warning alerts if construction deadlines are officially pushed back.",
    },
    {
      icon: Map,
      title: "Market Intelligence",
      tag: "Fair Value pricing",
      description: "Look up official circle rates directly from land record registries on an interactive sector-by-sector map.",
    },
  ];

  return (
    <motion.section
      ref={containerRef}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="py-20 md:py-28 bg-brand-bg border-t border-brand-border relative overflow-hidden"
    >
      <div className="max-w-[1240px] mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-left mb-16 max-w-2xl">
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full border border-brand-border bg-white mb-4 shadow-3xs">
            <span className="text-[10px] text-brand-slate-light tracking-[0.10em] uppercase font-bold">
              The Workspace
            </span>
          </motion.div>
          
          <motion.h2 variants={fadeUp} custom={1} className="text-[clamp(28px,4.5vw,40px)] font-black text-brand-navy-deep tracking-tight mb-4">
            A Bloomberg Terminal for your real estate net worth
          </motion.h2>
          
          <motion.p variants={fadeUp} custom={2} className="text-base text-brand-slate leading-relaxed font-medium">
            We bypass broker noise. Get institutional-grade tools to verify pricing, track developer timelines, and manage real estate portfolios in real time.
          </motion.p>
        </div>

        {/* 3-Column Pillar Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6.5 lg:gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                variants={fadeUp}
                custom={idx + 3}
                className="p-6 md:p-8 rounded-2xl bg-white border border-brand-border shadow-3xs hover:border-brand-blue-border/25 hover:shadow-brand transition-all duration-300 flex flex-col items-start text-left"
              >
                <div className="p-3.5 rounded-xl bg-brand-blue-bg border border-brand-blue-border/40 text-brand-blue mb-6">
                  <Icon size={20} />
                </div>
                <span className="text-[9px] font-bold tracking-wider text-brand-slate-light border border-brand-border-mid rounded-sm px-2 py-0.5 bg-brand-bg-alt uppercase mb-2">
                  {pillar.tag}
                </span>
                <h3 className="text-lg font-black text-brand-navy tracking-tight mb-3">
                  {pillar.title}
                </h3>
                <p className="text-[13px] sm:text-[13.5px] leading-relaxed text-brand-slate font-medium m-0">
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </motion.section>
  );
}

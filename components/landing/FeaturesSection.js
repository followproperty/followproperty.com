"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { 
  ShieldAlert, 
  TrendingUp, 
  Newspaper, 
  Building2, 
  Scale, 
  ChevronRight 
} from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function MarketIntelligence() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const intelligenceItems = [
    {
      category: "RERA Delay Alert",
      badgeColor: "bg-brand-red-bg text-brand-red border-brand-red-border/30",
      icon: ShieldAlert,
      title: "BPTP District Sector 102 possession extended",
      desc: "Milestone warning: finishing phase delayed 6 months in official HRERA filings.",
      time: "2 hours ago",
      link: "/rera"
    },
    {
      category: "Circle Rate Revision",
      badgeColor: "bg-brand-blue-bg text-brand-blue border-brand-blue-border/30",
      icon: TrendingUp,
      title: "Gurgaon Sector 49 circle rates revised by +8%",
      desc: "Residential plot baseline adjusted to ₹84,000 per sq. yard for FY 2026-27.",
      time: "5 hours ago",
      link: "/circle-rates"
    },
    {
      category: "News Analysis",
      badgeColor: "bg-brand-emerald-bg text-brand-emerald border-brand-emerald-bg/30",
      icon: Newspaper,
      title: "Yamuna Expressway developmental circle rates release",
      desc: "Noida Authority announces new land valuation index for commercial plots.",
      time: "1 day ago",
      link: "/projects"
    },
    {
      category: "Builder Intelligence",
      badgeColor: "bg-brand-bg-alt text-brand-navy border-brand-border-mid",
      icon: Building2,
      title: "DLF Arbour Sector 63 gets layout approval certificate",
      desc: "DTCP compliance verification completed; unit structures declared fully licensed.",
      time: "2 days ago",
      link: "/projects"
    }
  ];

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="py-16 md:py-24 bg-brand-bg relative overflow-hidden border-t border-brand-border"
    >
      <div className="max-w-[1240px] mx-auto px-6 relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="text-left max-w-xl">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full border border-brand-border bg-white mb-4 shadow-3xs">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue inline-block animate-pulse" />
              <span className="text-[10px] text-brand-navy tracking-[0.10em] uppercase font-black">
                Live Intelligence Feed
              </span>
            </motion.div>
            <h2 className="text-[clamp(28px,4.5vw,40px)] font-black text-brand-navy-deep tracking-tight mb-3">
              Real-Time Market Intelligence
            </h2>
            <p className="text-base text-brand-slate leading-relaxed m-0 font-medium">
              A centralized feed mapping developer registrations, government valuations, and legal updates in India.
            </p>
          </div>

          <motion.div variants={fadeUp} custom={3} className="shrink-0 flex gap-3">
            <Link href="/circle-rates" className="btn-secondary py-2.5 px-4.5 text-[12.5px] border-brand-border hover:bg-brand-bg-alt/30 transition-all flex items-center gap-1.5 no-underline">
              Explore Feed <ChevronRight size={14} />
            </Link>
          </motion.div>
        </div>

        {/* Bloomberg-style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5 max-w-4xl mx-auto">
          {intelligenceItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                variants={fadeUp}
                custom={idx + 4}
                className={`bg-white rounded-2xl border border-brand-border p-6.5 shadow-3xs hover:border-brand-blue-border/20 transition-all duration-300 flex flex-col justify-between ${
                  idx >= 2 ? "hidden md:flex" : "flex"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4.5">
                    <span className={`text-[8.5px] font-extrabold uppercase tracking-wider rounded-sm px-2 py-0.5 border ${item.badgeColor}`}>
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold text-brand-slate-light">
                      {item.time}
                    </span>
                  </div>

                  <h4 className="text-[14px] sm:text-[15px] font-black text-brand-navy leading-snug tracking-tight mb-2">
                    {item.title}
                  </h4>
                  
                  <p className="text-[12.5px] text-brand-slate leading-relaxed m-0 mb-4.5 font-medium">
                    {item.desc}
                  </p>
                </div>

                <div className="border-t border-brand-bg pt-3.5 flex justify-between items-center text-[11px] font-extrabold text-brand-blue">
                  <Link href={item.link} className="flex items-center gap-1 hover:underline cursor-pointer no-underline font-black">
                    Analyze Update &rarr;
                  </Link>
                  <span className="text-[9.5px] font-bold text-brand-slate-light flex items-center gap-0.5">
                    <Scale size={11} className="text-brand-slate-light" /> verified record
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </motion.section>
  );
}

"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { 
  Building2, 
  ShieldCheck, 
  Database,
  Globe
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function TrustSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const points = [
    {
      icon: Database,
      title: "Government Circle Rates",
      description: "Official valuation rules sourced directly from state revenue department land records.",
    },
    {
      icon: ShieldCheck,
      title: "Verified RERA Timelines",
      description: "Live completion milestones tracking regulatory filings and builder compliance records.",
    },
    {
      icon: Building2,
      title: "Market Comparables",
      description: "Actual comparable transaction logs gathered from active residential property registers.",
    },
    {
      icon: Globe,
      title: "Developer Specifications",
      description: "Original approved layout plans, unit dimensions, and developer files cross-checked directly.",
    },
  ];

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="py-20 sm:py-24 bg-brand-bg-alt border-t border-brand-border relative overflow-hidden"
    >
      <div className="max-w-[900px] mx-auto px-6 relative z-10">
        
        {/* Header Block */}
        <div className="text-center mb-12">
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full border border-brand-border bg-brand-bg-card mb-4 shadow-brand">
            <span className="text-[10px] text-brand-slate-light tracking-[0.10em] uppercase font-bold">
              Where does all this information come from?
            </span>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-[clamp(25px,4vw,34px)] font-extrabold text-brand-navy tracking-tight mb-3">
            Data you can rely on
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-sm sm:text-base text-brand-slate leading-relaxed max-w-[480px] mx-auto font-medium">
            We do not estimate values. We cross-reference direct government registries and verified transaction records.
          </motion.p>
        </div>

        {/* 2x2 Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-x-10 gap-y-8 max-w-[760px] mx-auto">
          {points.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={idx}
                variants={fadeUp}
                custom={idx + 3}
                className="flex items-start gap-4 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-brand-border flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                  <Icon size={18} className="text-brand-navy" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-brand-navy mb-1 tracking-tight">
                    {p.title}
                  </h4>
                  <p className="text-[12px] sm:text-[12.5px] text-brand-slate leading-relaxed m-0 font-medium">
                    {p.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </motion.section>
  );
}

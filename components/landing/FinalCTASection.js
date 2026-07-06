"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function FinalCTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const router = useRouter();

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="py-16 md:py-24 bg-brand-bg-alt border-t border-brand-border relative overflow-hidden"
    >
      <div className="max-w-[800px] mx-auto px-6 relative z-10 text-center">
        <motion.div 
          variants={fadeUp}
          className="bg-brand-navy text-white rounded-3xl p-8 sm:p-14 max-w-2xl mx-auto flex flex-col items-center gap-6 relative overflow-hidden shadow-brand-lg"
        >
          {/* Subtle glow accent */}
          <div className="absolute -bottom-8 -left-8 w-44 h-44 rounded-full bg-[radial-gradient(circle,rgba(50,95,236,0.12)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute -top-8 -right-8 w-44 h-44 rounded-full bg-[radial-gradient(circle,rgba(5,150,105,0.08)_0%,transparent_70%)] pointer-events-none" />

          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-brand-blue-light bg-white/5 border border-white/10 rounded-full px-4 py-1.5 shadow-xs">
            Start Tracking Today
          </span>

          <h2 className="text-[28px] sm:text-[34px] font-black tracking-tight leading-tight m-0 text-white max-w-lg">
            Absolute intelligence for your real estate assets.
          </h2>
          
          <p className="text-sm text-brand-slate-light leading-relaxed m-0 font-medium max-w-md">
            Track your properties, monitor circle rates, follow developer timelines, and manage your real estate net worth in one unified dashboard workspace.
          </p>

          <button
            onClick={() => router.push("/signup")}
            className="w-full sm:w-auto btn-primary bg-linear-to-r from-brand-blue-deep to-brand-blue text-white font-extrabold text-[13.5px] py-3.5 px-7 rounded-xl border border-white/10 transition-all shadow-brand-blue hover:shadow-brand-blue/40"
          >
            Create Your Free Account <ArrowRight size={14} className="ml-1" />
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}

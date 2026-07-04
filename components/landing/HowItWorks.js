"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { 
  UserPlus, 
  MousePointerClick, 
  PlusCircle, 
  LayoutDashboard,
  ArrowRight
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const steps = [
    {
      icon: UserPlus,
      stepNum: "01",
      label: "Create Account",
      sub: "Register with your phone number.",
    },
    {
      icon: MousePointerClick,
      stepNum: "02",
      label: "Select Path",
      sub: "Tell us if you are tracking or buying.",
    },
    {
      icon: PlusCircle,
      stepNum: "03",
      label: "Add Properties",
      sub: "Enter your holdings or search areas.",
    },
    {
      icon: LayoutDashboard,
      stepNum: "04",
      label: "View Dashboard",
      sub: "Access your workspace immediately.",
    },
  ];

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="py-24 sm:py-32 bg-brand-bg border-t border-brand-border relative overflow-hidden"
    >
      <div className="max-w-[1000px] mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full border border-brand-border bg-brand-bg-card mb-4 shadow-brand">
            <span className="text-[10px] text-brand-slate-light tracking-[0.10em] uppercase font-bold">
              Getting started is simple
            </span>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-[clamp(26px,4vw,38px)] font-extrabold text-brand-navy tracking-tight mb-4">
            Get started in three minutes
          </motion.h2>
        </div>

        {/* Steps Flex/Grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 relative">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={idx}
                variants={fadeUp}
                custom={idx + 2}
                className="flex flex-col items-center text-center relative group"
              >
                {/* Visual Step bubble */}
                <div className="w-14 h-14 rounded-2xl bg-brand-bg-card border border-brand-border flex items-center justify-center shadow-brand relative z-10 mb-4 transition-all duration-300 group-hover:border-brand-blue-border group-hover:shadow-brand-md">
                  <Icon size={20} className="text-brand-navy group-hover:text-brand-blue transition-colors" />
                  <span className="absolute -top-1.5 -right-1.5 text-[8.5px] font-black bg-[#F4F3EF] border border-brand-border px-1.5 py-0.2 rounded-md text-brand-slate uppercase">
                    {s.stepNum}
                  </span>
                </div>

                <div>
                  <h4 className="text-[13.5px] font-extrabold text-brand-navy mb-1 tracking-tight">
                    {s.label}
                  </h4>
                  <p className="text-[11px] text-brand-slate leading-normal m-0 font-semibold px-2">
                    {s.sub}
                  </p>
                </div>

                {/* Horizontal link indicator (hidden on mobile, visible on wide screens) */}
                {idx < 3 && (
                  <div className="hidden sm:block absolute top-7 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-brand-border-mid z-0 pointer-events-none" />
                )}
              </motion.div>
            );
          })}
        </div>

      </div>
    </motion.section>
  );
}

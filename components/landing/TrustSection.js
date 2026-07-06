"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function TrustSection({ stats }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const metrics = stats || [
    { value: "480+", label: "Verified Projects" },
    { value: "100%", label: "Official RERA Records" },
    { value: "140+", label: "Circle Rate Localities" },
    { value: "₹12,400 Cr+", label: "Tracked Assets" },
    { value: "12+", label: "Metro Cities" },
  ];

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="py-7 md:py-8 bg-brand-bg-alt border-t border-b border-brand-border relative overflow-hidden"
    >
      <div className="max-w-[1240px] mx-auto px-6 relative z-10">
        {/* Trust Metrics Numeric Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-y-6 gap-x-4 text-center">
          {metrics.map((m, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              custom={idx}
              className="flex flex-col gap-1 md:gap-1.5"
            >
              <span className="text-[26px] md:text-[32px] font-black text-brand-navy-deep tracking-tight leading-none">
                {m.value}
              </span>
              <span className="text-[10px] md:text-[11px] font-extrabold text-brand-slate uppercase tracking-wider">
                {m.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function FinalCTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const router = useRouter();

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="py-24 sm:py-32 bg-brand-bg-alt border-t border-brand-border relative overflow-hidden"
    >
      <div className="max-w-[800px] mx-auto px-6 relative z-10 text-center">
        <motion.div 
          variants={fadeUp}
          className="bg-brand-bg-card rounded-3xl border border-brand-border shadow-brand p-8 sm:p-12 max-w-2xl mx-auto flex flex-col items-center gap-6"
        >
          <h2 className="text-[clamp(24px,4vw,32px)] font-extrabold text-brand-navy tracking-tight m-0 leading-tight">
            Absolute clarity for your real estate portfolio.
          </h2>
          <p className="text-sm sm:text-base text-brand-slate leading-relaxed m-0 font-medium max-w-md">
            Create a free account to monitor property valuations, check builder timelines, and track official rates in India.
          </p>
          <button
            onClick={() => router.push("/signup")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-linear-to-r from-brand-navy-deep to-brand-navy-mid text-white font-bold text-[14px] sm:text-[15px] py-3.5 px-7 rounded-[14px] border border-white/5 cursor-pointer shadow-brand-md transition-all duration-250 hover:-translate-y-0.5 hover:border-brand-blue-border hover:shadow-[0_12px_36px_rgba(50,95,236,0.14)]"
          >
            <LayoutDashboard size={17} /> Create Free Account <ArrowRight size={15} />
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}

"use client";

import React, { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import { Landmark, ArrowRight, CirclePercent, ShieldCheck, Zap } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HowItWorks() {
  const router = useRouter();
  const [loanAmount, setLoanAmount] = useState(10000000); // Default 1 Crore
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const calculateCashback = (amount) => {
    // 0.3% cashback capped at 1.5 Lakhs
    const potential = Math.round(amount * 0.003);
    return Math.min(potential, 150000);
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(0)} Lakhs`;
  };

  const handleRedirect = () => {
    router.push("/homeloanswithcashback");
  };

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="py-16 md:py-24 bg-brand-bg border-t border-brand-border relative overflow-hidden"
    >
      <div className="max-w-[1140px] mx-auto px-6 relative z-10">
        
        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-center">
          
          {/* Left Column: Home Loan Proposition */}
          <div className="col-span-1 lg:col-span-6 text-left">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full border border-brand-border bg-white mb-4 shadow-3xs">
              <Landmark size={11} className="text-brand-blue" />
              <span className="text-[10px] text-brand-navy tracking-[0.10em] uppercase font-black">
                Mortgage Workspace
              </span>
            </motion.div>

            <motion.h2 variants={fadeUp} custom={1} className="text-[clamp(28px,4.5vw,40px)] font-black text-brand-navy-deep tracking-tight mb-4">
              Home Loans with Guaranteed Cashback
            </motion.h2>

            <motion.p variants={fadeUp} custom={2} className="text-base text-brand-slate leading-relaxed mb-6 font-medium">
              Get pre-approved interest rates starting at 8.4% from SBI, HDFC, and ICICI, and earn up to ₹1.5 Lakhs direct cashback upon loan disbursal.
            </motion.p>

            {/* Feature Points list */}
            <div className="flex flex-col gap-3.5 mb-8">
              {[
                { icon: CirclePercent, text: "Interest rates starting at 8.4% from premier partner banks" },
                { icon: ShieldCheck, text: "Direct cashback reward of 0.3% of your loan amount" },
                { icon: Zap, text: "Zero advisory fees and digital documentation assistance" }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    variants={fadeUp}
                    custom={idx + 3}
                    className="flex items-center gap-3 text-[13.5px] font-bold text-brand-navy-mid"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-blue-bg border border-brand-blue-border/30 flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-brand-blue" />
                    </div>
                    <span>{item.text}</span>
                  </motion.div>
                );
              })}
            </div>

            <motion.div variants={fadeUp} custom={6}>
              <button
                onClick={handleRedirect}
                className="btn-primary py-3.5 px-6 text-[14px]"
              >
                Apply with Cashback <ArrowRight size={14} className="ml-1" />
              </button>
            </motion.div>
          </div>

          {/* Right Column: Interactive Cashback Calculator Card */}
          <div className="col-span-1 lg:col-span-6">
            <motion.div
              variants={fadeUp}
              custom={7}
              className="bg-white border border-brand-border-mid rounded-3xl p-6 sm:p-8 shadow-brand-lg text-center max-w-[480px] mx-auto relative overflow-hidden"
            >
              {/* Inner subtle glow accent */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-[radial-gradient(circle,rgba(50,95,236,0.06)_0%,transparent_70%)] pointer-events-none" />

              <h4 className="text-[12px] font-black text-brand-slate-light uppercase tracking-wider mb-6">
                Instant Cashback Estimator
              </h4>

              {/* Calculator display */}
              <div className="bg-brand-bg-alt/75 border border-brand-border rounded-2xl p-6 mb-6 flex flex-col justify-center items-center">
                <span className="text-[10px] font-bold text-brand-slate uppercase mb-1">
                  Required Loan Amount
                </span>
                <span className="text-[26px] sm:text-[30px] font-black text-brand-navy-deep tracking-tight mb-4">
                  {formatCurrency(loanAmount)}
                </span>
                
                <input
                  type="range"
                  min="2000000"
                  max="50000000"
                  step="50000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-1.5 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-blue"
                />
                
                <div className="flex justify-between w-full text-[9px] font-bold text-brand-slate-light mt-2.5">
                  <span>₹20 Lakhs</span>
                  <span>₹5 Crores</span>
                </div>
              </div>

              {/* Cashback Output */}
              <div className="flex flex-col items-center gap-1 mb-6">
                <span className="text-[9px] font-bold text-brand-emerald bg-brand-emerald-bg border border-brand-emerald-bg/30 px-2 py-0.5 rounded uppercase tracking-wider">
                  Guaranteed Cashback Reward
                </span>
                <span className="text-[32px] sm:text-[38px] font-black text-brand-emerald tracking-tight leading-tight">
                  ₹{calculateCashback(loanAmount).toLocaleString()}
                </span>
                <span className="text-[10.5px] font-bold text-brand-slate-light">
                  Credited upon loan verification and disbursal
                </span>
              </div>

              <button
                onClick={handleRedirect}
                className="w-full btn-secondary bg-brand-bg-alt/45 hover:bg-brand-navy hover:text-white border border-brand-border-mid text-[13px] py-3 font-bold rounded-xl"
              >
                Claim This Cashback Offer
              </button>
            </motion.div>
          </div>

        </div>

      </div>
    </motion.section>
  );
}

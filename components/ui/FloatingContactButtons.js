'use client';

import React, { useState, useEffect } from "react";
import { Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { landingPageData } from "@/data/mock/landing";

export default function FloatingContactButtons() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const rawPhone = landingPageData?.footer?.contact?.phone || "+918796508866";
  // Clean phone number for WhatsApp: remove non-digit characters
  const cleanPhone = rawPhone.replace(/[^\d]/g, "");

  const containerVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.8
      }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.08,
      y: -2,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.95 }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 flex flex-col gap-3 md:gap-3.5 select-none pointer-events-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Call Button */}
        <motion.a
          href={`tel:${rawPhone}`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className="group relative flex items-center justify-center w-11 h-11 md:w-[52px] md:h-[52px] rounded-full bg-brand-navy text-white shadow-[0_4px_16px_rgba(15,22,41,0.25)] hover:bg-brand-blue transition-colors duration-300"
          aria-label="Call Support"
        >
          {/* Outer Pulse Rings */}
          <div className="absolute inset-0 rounded-full bg-brand-navy opacity-20 animate-ping group-hover:bg-brand-blue group-hover:opacity-10 pointer-events-none" />
          
          {/* Tooltip Label */}
          <span className="absolute right-14 pr-2 opacity-0 -translate-x-3 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap bg-white text-brand-navy text-[12.5px] font-semibold px-3.5 py-2 rounded-xl shadow-[0_2px_8px_rgba(15,22,41,0.06),_0_8px_32px_rgba(15,22,41,0.08)] border border-brand-border">
            Call Support
          </span>
          <Phone className="w-[18px] h-[18px] md:w-5 md:h-5 stroke-[2.5]" />
        </motion.a>
 
        {/* WhatsApp Button */}
        <motion.a
          href={`https://wa.me/${cleanPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className="group relative flex items-center justify-center w-11 h-11 md:w-[52px] md:h-[52px] rounded-full bg-[#25D366] text-white shadow-[0_4px_16px_rgba(37,211,102,0.35)] hover:bg-[#20ba5a] transition-colors duration-300"
          aria-label="Chat on WhatsApp"
        >
          {/* Outer Pulse Rings */}
          <div className="absolute inset-0 rounded-full bg-[#25D366] opacity-20 animate-ping group-hover:opacity-10 pointer-events-none" />
 
          {/* Tooltip Label */}
          <span className="absolute right-14 pr-2 opacity-0 -translate-x-3 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap bg-white text-brand-navy text-[12.5px] font-semibold px-3.5 py-2 rounded-xl shadow-[0_2px_8px_rgba(15,22,41,0.06),_0_8px_32px_rgba(15,22,41,0.08)] border border-brand-border">
            Chat on WhatsApp
          </span>
          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] fill-current">
            <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.46 3.475 1.334 5.002L2 22l5.166-1.353a9.924 9.924 0 0 0 4.846 1.34h.005c5.507 0 9.991-4.484 9.991-9.988C22 6.482 17.518 2 12.012 2zm5.733 14.184c-.246.691-1.222 1.253-1.688 1.309-.441.053-.984.148-3.08-.686-2.617-1.04-4.288-3.69-4.418-3.863-.13-.173-1.057-1.406-1.057-2.684 0-1.278.67-1.905.908-2.164.238-.26.52-.325.693-.325.173 0 .346.002.497.01.156.007.363-.057.57.439.213.513.727 1.77.792 1.901.065.13.108.281.022.454-.087.173-.13.281-.26.433-.13.151-.27.338-.387.464-.13.13-.266.27-.113.53.151.26.67 1.096 1.433 1.774.984.874 1.81 1.144 2.07 1.274.26.13.41.108.562-.065.152-.173.65-.758.823-1.017.173-.26.346-.217.58-.13.234.086 1.494.703 1.754.832.26.13.433.195.498.303.065.109.065.628-.182 1.319z" />
          </svg>
        </motion.a>
      </motion.div>
    </AnimatePresence>
  );
}

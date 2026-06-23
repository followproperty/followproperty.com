'use client';

import React, { useState, useEffect } from "react";
import { Mic, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { landingPageData } from "@/data/mock/landing";

export default function FloatingContactButtons() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const rawPhone = landingPageData?.footer?.contact?.phone || "+918796508866";

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
        {/* Share Requirements Button */}
        <Link href="/tell-us-your-requirements" passHref legacyBehavior>
          <motion.a
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="group relative flex items-center justify-center w-11 h-11 md:w-[52px] md:h-[52px] rounded-full bg-brand-navy text-white shadow-[0_4px_16px_rgba(15,22,41,0.25)] hover:bg-brand-blue transition-colors duration-300"
            aria-label="Tell Us Your Requirements"
          >
            {/* Tooltip Label */}
            <span className="absolute right-14 pr-2 opacity-0 -translate-x-3 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap bg-white text-brand-navy text-[12.5px] font-semibold px-3.5 py-2 rounded-xl shadow-[0_2px_8px_rgba(15,22,41,0.06),_0_8px_32px_rgba(15,22,41,0.08)] border border-brand-border">
              Tell Us Requirements
            </span>
            <Mic className="w-[18px] h-[18px] md:w-5 md:h-5 stroke-[2.5]" />
          </motion.a>
        </Link>
 
        {/* Chat Assistant Button */}
        <Link href="/chat" passHref legacyBehavior>
          <motion.a
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="group relative flex items-center justify-center w-11 h-11 md:w-[52px] md:h-[52px] rounded-full bg-brand-blue text-white shadow-[0_4px_16px_rgba(50,95,236,0.3)] hover:bg-[#1e3bb3] transition-colors duration-300"
            aria-label="Chat with Assistant"
          >
            {/* Tooltip Label */}
            <span className="absolute right-14 pr-2 opacity-0 -translate-x-3 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap bg-white text-brand-navy text-[12.5px] font-semibold px-3.5 py-2 rounded-xl shadow-[0_2px_8px_rgba(15,22,41,0.06),_0_8px_32px_rgba(15,22,41,0.08)] border border-brand-border">
              Chat with Assistant
            </span>
            <MessageSquare className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] stroke-[2.2]" />
          </motion.a>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
